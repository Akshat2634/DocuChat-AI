# RAG-LanceDB
<!-- 
import os
import json
import logging
import hashlib
import zipfile
import tempfile
import shutil
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import pyarrow as pa
from openai import AsyncAzureOpenAI
from lancedb import connect
import asyncio
from pathlib import Path
from azure.storage.blob import BlobServiceClient, ContentSettings

from config import load_config
from core.ticketing_systems.service_now_apijee import ServiceNow, Config, ServiceNowTable, HTTPMethod

# Load configurations
base_config = load_config("base")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TicketIndexer:
    """
    Ticket Indexer that follows the process:
    1. Download LanceDB from Azure Blob Storage
    2. Index new ticket items to the LanceDB
    3. Upload LanceDB back to Azure Blob Storage
    
    This indexer processes ServiceNow tickets and creates embeddings for similarity search.
    """

    # Model deployment names
    EMBEDDING_MODEL = "text-embedding-3-small"
    CHAT_MODEL = "gpt-4o-mini"

    def __init__(
        self,
        service_now: ServiceNow,
        azure_storage_connection_string: str,
        azure_container_name: str,
        lancedb_blob_prefix: str = "ticket_index",
        batch_size: int = 100,
        chunk_size: int = 1000,
        overlap_size: int = 200,
        limit_tickets: Optional[int] = None,
        ticket_states: List[str] = None,
        days_back: int = 7
    ):
        """
        Initialize the Ticket Indexer.
        
        Args:
            service_now: ServiceNow client instance
            azure_storage_connection_string: Azure Storage connection string
            azure_container_name: Azure container name for storing LanceDB
            lancedb_blob_prefix: Prefix for LanceDB blobs in Azure
            batch_size: Number of tickets to process per batch
            chunk_size: Size of text chunks for embedding
            overlap_size: Overlap between chunks
            limit_tickets: Optional limit for testing
            ticket_states: List of ticket states to filter
            days_back: Number of days to look back for new/updated tickets
        """
        self.service_now = service_now
        self.batch_size = batch_size
        self.chunk_size = chunk_size
        self.overlap_size = overlap_size
        self.limit_tickets = limit_tickets
        self.ticket_states = ticket_states or ["New", "In Progress", "Resolved", "Closed"]
        self.days_back = days_back

        # Azure Storage setup
        self.azure_connection_string = azure_storage_connection_string
        self.azure_container_name = azure_container_name
        self.lancedb_blob_prefix = lancedb_blob_prefix
        self.blob_service_client = BlobServiceClient.from_connection_string(azure_storage_connection_string)
        self.container_client = self.blob_service_client.get_container_client(azure_container_name)

        # Initialize Azure OpenAI client
        self.openai_client = AsyncAzureOpenAI(
            azure_endpoint=base_config.AZURE_OPENAI_ENDPOINT,
            api_key=base_config.AZURE_OPENAI_API_KEY,
            api_version=base_config.AZURE_OPENAI_API_VERSION
        )

        # LanceDB setup
        self.lancedb_table_name = "servicenow_tickets"
        self.temp_dir = None
        self.local_lancedb_path = None
        self.db = None

    async def download_lancedb_from_azure(self) -> str:
        """
        Download the latest LanceDB from Azure Blob Storage.
        
        Returns:
            str: Path to the extracted LanceDB directory
        """
        logger.info("Downloading LanceDB from Azure Blob Storage...")
        
        # Create temporary directory
        self.temp_dir = tempfile.mkdtemp(prefix="ticket_indexer_")
        logger.info(f"Created temporary directory: {self.temp_dir}")

        # Check for latest version file
        latest_blob_name = f"{self.lancedb_blob_prefix}/lancedb_index_latest.txt"
        zip_blob_name = None

        try:
            # Get the latest version blob name
            latest_blob_client = self.container_client.get_blob_client(latest_blob_name)
            latest_content = latest_blob_client.download_blob().readall().decode('utf-8').strip()
            zip_blob_name = latest_content
            logger.info(f"Found latest LanceDB version: {zip_blob_name}")
        except Exception as e:
            logger.warning(f"Could not find latest version file, using default: {e}")
            # Fallback to a default name
            zip_blob_name = f"{self.lancedb_blob_prefix}/lancedb_index_latest.zip"

        # Download the zip file
        zip_path = os.path.join(self.temp_dir, "lancedb_index.zip")
        try:
            zip_blob_client = self.container_client.get_blob_client(zip_blob_name)
            with open(zip_path, "wb") as download_file:
                blob_data = zip_blob_client.download_blob().readall()
                download_file.write(blob_data)
            logger.info(f"Downloaded LanceDB zip file: {zip_path}")
        except Exception as e:
            logger.warning(f"Could not download existing LanceDB, will create new one: {e}")
            # If no existing LanceDB, we'll create a new one
            self.local_lancedb_path = os.path.join(self.temp_dir, "lancedb")
            os.makedirs(self.local_lancedb_path, exist_ok=True)
            return self.local_lancedb_path

        # Extract the zip file
        extract_path = os.path.join(self.temp_dir, "lancedb")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        
        logger.info(f"Extracted LanceDB to: {extract_path}")
        self.local_lancedb_path = extract_path
        return extract_path

    def _ensure_lancedb_table(self):
        """
        Ensure the LanceDB table exists with proper schema.
        """
        self.db = connect(self.local_lancedb_path)
        
        if self.lancedb_table_name not in self.db.table_names():
            # Define schema for tickets
            schema = pa.schema([
                pa.field("sys_id", pa.string()),
                pa.field("number", pa.string()),
                pa.field("short_description", pa.string()),
                pa.field("description", pa.string()),
                pa.field("state", pa.string()),
                pa.field("priority", pa.string()),
                pa.field("category", pa.string()),
                pa.field("subcategory", pa.string()),
                pa.field("assigned_to", pa.string()),
                pa.field("caller_id", pa.string()),
                pa.field("created_on", pa.string()),
                pa.field("updated_on", pa.string()),
                pa.field("chunk_index", pa.int32()),
                pa.field("text_chunk", pa.string()),
                pa.field("embedding", pa.list_(pa.float32(), 1536)),
                pa.field("md5_signature", pa.string())
            ])
            
            # Create sample record to initialize table
            sample_data = [{
                "sys_id": "sample-id",
                "number": "INC0000000",
                "short_description": "Sample ticket",
                "description": "Sample description",
                "state": "New",
                "priority": "3 - Moderate",
                "category": "Software",
                "subcategory": "Application",
                "assigned_to": "System Administrator",
                "caller_id": "sample.user",
                "created_on": "2024-01-01 00:00:00",
                "updated_on": "2024-01-01 00:00:00",
                "chunk_index": 0,
                "text_chunk": "Sample chunk",
                "embedding": [0.1] * 1536,
                "md5_signature": "sample-hash"
            }]
            
            df = pd.DataFrame(sample_data)
            self.db.create_table(
                self.lancedb_table_name,
                data=df,
                schema=schema,
                mode="create"
            )
            
            # Delete the sample record
            table = self.db.open_table(self.lancedb_table_name)
            table.delete("sys_id = 'sample-id'")
            
            logger.info(f"Created LanceDB table '{self.lancedb_table_name}'")
        else:
            logger.info(f"LanceDB table '{self.lancedb_table_name}' already exists")

    async def fetch_new_tickets(self) -> List[Dict[str, Any]]:
        """
        Fetch new or updated tickets from ServiceNow.
        
        Returns:
            List of ticket dictionaries
        """
        logger.info("Fetching new/updated tickets from ServiceNow...")
        
        # Calculate date range for new/updated tickets
        end_date = datetime.now()
        start_date = end_date - timedelta(days=self.days_back)
        
        # Format dates for ServiceNow query
        start_date_str = start_date.strftime("%Y-%m-%d %H:%M:%S")
        
        # Build query for new/updated tickets
        state_filter = "^OR".join([f"state={state}" for state in self.ticket_states])
        query = f"sys_updated_on>={start_date_str}^({state_filter})"
        
        logger.info(f"Query: {query}")
        
        offset = 0
        all_tickets = []
        
        while True:
            try:
                resp = await self.service_now.table_handler.table_request(
                    table=ServiceNowTable.INCIDENT,
                    method=HTTPMethod.GET,
                    query=query,
                    limit=self.batch_size,
                    offset=offset,
                    display_value="true"
                )
                
                tickets = resp.get("records", [])
                if not tickets:
                    break
                
                all_tickets.extend(tickets)
                offset += self.batch_size
                
                logger.info(f"Fetched {len(all_tickets)} tickets so far...")
                
                if self.limit_tickets and len(all_tickets) >= self.limit_tickets:
                    all_tickets = all_tickets[:self.limit_tickets]
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching tickets: {e}")
                break
        
        logger.info(f"Total tickets fetched: {len(all_tickets)}")
        return all_tickets

    def _compute_hash(self, ticket: Dict[str, Any]) -> str:
        """
        Compute MD5 hash for ticket content to detect changes.
        """
        content = f"{ticket.get('short_description', '')}{ticket.get('description', '')}{ticket.get('sys_updated_on', '')}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()

    def _normalize_field_value(self, value: Any) -> str:
        """
        Normalize field values that can be strings, dicts, or None to consistent string format.
        
        Args:
            value: The field value to normalize
            
        Returns:
            str: Normalized string value
        """
        if value is None:
            return ''
        elif isinstance(value, dict):
            # Try common ServiceNow field patterns
            return (value.get('display_value') or 
                   value.get('name') or 
                   value.get('value') or 
                   str(value))
        else:
            return str(value)

    def _split_text_into_chunks(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks for embedding.
        """
        if not text or len(text) <= self.chunk_size:
            return [text] if text else []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            chunk = text[start:end]
            chunks.append(chunk)
            
            if end == len(text):
                break
            
            start = end - self.overlap_size
        
        return chunks

    async def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using Azure OpenAI.
        """
        try:
            response = await self.openai_client.embeddings.create(
                model=self.EMBEDDING_MODEL,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return [0.0] * 1536  # Return zero vector as fallback

    async def process_and_index_tickets(self, tickets: List[Dict[str, Any]]):
        """
        Process tickets and add them to LanceDB.
        """
        logger.info(f"Processing and indexing {len(tickets)} tickets...")
        
        table = self.db.open_table(self.lancedb_table_name)
        
        # Get existing hashes to check for changes
        try:
            existing_df = table.to_pandas()
            existing_hashes = dict(zip(existing_df['sys_id'], existing_df['md5_signature']))
        except Exception:
            existing_hashes = {}
        
        records_to_insert = []
        tickets_processed = 0
        
        for ticket in tickets:
            sys_id = ticket.get('sys_id', '')
            if not sys_id:
                continue
            
            # Check if ticket has changed
            current_hash = self._compute_hash(ticket)
            if sys_id in existing_hashes and existing_hashes[sys_id] == current_hash:
                logger.debug(f"Skipping unchanged ticket: {ticket.get('number', sys_id)}")
                continue
            
            # Delete existing records for this ticket
            try:
                table.delete(f"sys_id = '{sys_id}'")
            except Exception as e:
                logger.debug(f"No existing records to delete for {sys_id}: {e}")
            
            # Prepare text content for chunking
            short_desc = ticket.get('short_description', '') or ''
            description = ticket.get('description', '') or ''
            full_text = f"Short Description: {short_desc}\n\nDescription: {description}"
            
            # Split into chunks
            chunks = self._split_text_into_chunks(full_text)
            
            # Process each chunk
            for chunk_idx, chunk_text in enumerate(chunks):
                if not chunk_text.strip():
                    continue
                
                # Generate embedding
                embedding = await self._generate_embedding(chunk_text)
                
                # Create record with normalized field values
                record = {
                    "sys_id": sys_id,
                    "number": self._normalize_field_value(ticket.get('number', '')),
                    "short_description": short_desc,
                    "description": description,
                    "state": self._normalize_field_value(ticket.get('state', '')),
                    "priority": self._normalize_field_value(ticket.get('priority', '')),
                    "category": self._normalize_field_value(ticket.get('category', '')),
                    "subcategory": self._normalize_field_value(ticket.get('subcategory', '')),
                    "assigned_to": self._normalize_field_value(ticket.get('assigned_to', '')),
                    "caller_id": self._normalize_field_value(ticket.get('caller_id', '')),
                    "created_on": self._normalize_field_value(ticket.get('sys_created_on', '')),
                    "updated_on": self._normalize_field_value(ticket.get('sys_updated_on', '')),
                    "chunk_index": chunk_idx,
                    "text_chunk": chunk_text,
                    "embedding": embedding,
                    "md5_signature": current_hash
                }
                
                records_to_insert.append(record)
                
            
            tickets_processed += 1
            if tickets_processed % 10 == 0:
                logger.info(f"Processed {tickets_processed}/{len(tickets)} tickets")
        logger.info(f"Records to insert========================: {records_to_insert[0]}")
        # Insert all records
        if records_to_insert:
            df = pd.DataFrame(records_to_insert)
            table.add(data=df, mode="append")
            logger.info(f"Inserted {len(records_to_insert)} chunks for {tickets_processed} tickets")
        else:
            logger.info("No new tickets to index")

    def _zip_lancedb(self) -> str:
        """
        Create a zip file of the LanceDB directory.
        
        Returns:
            str: Path to the zip file
        """
        zip_path = os.path.join(self.temp_dir, "lancedb_index.zip")
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.local_lancedb_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, self.local_lancedb_path)
                    zipf.write(file_path, arcname)
        
        logger.info(f"Created LanceDB zip file: {zip_path}")
        return zip_path

    def _validate_zip_content(self, zip_path: str) -> tuple[bool, str]:
        """
        Validate the zip file contains expected LanceDB structure.
        
        Returns:
            tuple: (is_valid, validation_message)
        """
        try:
            with zipfile.ZipFile(zip_path, 'r') as zipf:
                file_list = zipf.namelist()
                
                # Check for essential LanceDB files
                has_data_files = any(f.endswith('.lance') for f in file_list)
                has_manifest = any('_versions' in f for f in file_list)
                
                if not has_data_files:
                    return False, "No .lance data files found in zip"
                
                if not has_manifest:
                    return False, "No version manifest files found in zip"
                
                return True, "Zip file validation successful"
                
        except Exception as e:
            return False, f"Error validating zip file: {str(e)}"

    async def upload_lancedb_to_azure(self, zip_path: str) -> str:
        """
        Upload the LanceDB zip file to Azure Blob Storage.
        
        Args:
            zip_path: Path to the zip file to upload
            
        Returns:
            str: Blob name of the uploaded file
        """
        logger.info("Uploading LanceDB to Azure Blob Storage...")
        
        # Validate zip content first
        is_valid, validation_message = self._validate_zip_content(zip_path)
        if not is_valid:
            raise ValueError(f"Zip validation failed: {validation_message}")
        
        # Generate timestamp and blob name
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        blob_name = f"{self.lancedb_blob_prefix}/lancedb_index_{timestamp}.zip"
        
        # Create container if it doesn't exist
        try:
            self.container_client.create_container()
        except Exception as e:
            if "ContainerAlreadyExists" not in str(e):
                logger.warning(f"Container creation warning: {e}")
        
        # Upload the zip file
        blob_client = self.container_client.get_blob_client(blob_name)
        
        with open(zip_path, "rb") as data:
            blob_client.upload_blob(
                data,
                overwrite=True,
                content_settings=ContentSettings(content_type='application/zip')
            )
        
        # Update the latest version pointer
        latest_blob_client = self.container_client.get_blob_client(f"{self.lancedb_blob_prefix}/lancedb_index_latest.txt")
        latest_blob_client.upload_blob(blob_name.encode('utf-8'), overwrite=True)
        
        logger.info(f"Successfully uploaded LanceDB as '{blob_name}' and updated latest pointer")
        return blob_name

    def cleanup(self):
        """
        Clean up temporary files and directories.
        """
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            logger.info(f"Cleaned up temporary directory: {self.temp_dir}")

    async def run_indexing(self):
        """
        Main method to run the complete indexing process:
        1. Download LanceDB from Azure
        2. Index new tickets
        3. Upload LanceDB back to Azure
        """
        try:
            logger.info("Starting ticket indexing process...")
            
            # Step 1: Download LanceDB from Azure
            await self.download_lancedb_from_azure()
            
            # Step 2: Ensure table exists
            self._ensure_lancedb_table()
            
            # Step 3: Fetch new tickets
            tickets = await self.fetch_new_tickets()
            
            if not tickets:
                logger.info("No new tickets found, skipping indexing")
                return
            
            # Step 4: Process and index tickets
            await self.process_and_index_tickets(tickets)
            
            # Step 5: Zip the LanceDB
            zip_path = self._zip_lancedb()
            
            # Step 6: Upload back to Azure
            blob_name = await self.upload_lancedb_to_azure(zip_path)
            
            logger.info(f"Ticket indexing completed successfully. Uploaded as: {blob_name}")
            
        except Exception as e:
            logger.error(f"Error during ticket indexing: {e}", exc_info=True)
            raise
        finally:
            # Always cleanup
            self.cleanup()

# Example usage and testing
async def main():
    """
    Example usage of the TicketIndexer
    """
    # Initialize ServiceNow client (you'll need to configure this)
    service_now_config = Config(
        instance_url="https://your-instance.service-now.com",
        client_id="your-client-id",
        client_secret="your-client-secret"
    )
    service_now = ServiceNow(service_now_config)
    
    # Initialize the indexer
    indexer = TicketIndexer(
        service_now=service_now,
        azure_storage_connection_string=base_config.AZURE_STORAGE_CONNECTION_STRING,
        azure_container_name=base_config.INDEXING_STORAGE_BUCKET_NAME,
        lancedb_blob_prefix="ticket_index",
        batch_size=50,
        limit_tickets=100,  # For testing
        days_back=7
    )
    
    # Run the indexing process
    await indexer.run_indexing()

if __name__ == "__main__":
    asyncio.run(main())  -->
