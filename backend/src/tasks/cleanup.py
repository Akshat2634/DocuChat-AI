import logging
import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi_utils.tasks import repeat_every

logger = logging.getLogger(__name__)

# Configure the cleanup interval (in seconds)
# Default: 24 hours (86400 seconds)
CLEANUP_INTERVAL_SECONDS = int(os.environ.get("VECTOR_DB_CLEANUP_INTERVAL", 86400))

# Path to the vector_db folder
VECTOR_DB_PATH = Path(__file__).parent.parent.parent / "vector_db"


def clear_vector_db_folder() -> None:
    """
    Clear all contents of the vector_db folder except for README.md files.
    
    This function will:
    1. Remove all subdirectories and their contents
    2. Remove all files except README.md
    3. Log the cleanup operation
    """
    try:
        if not VECTOR_DB_PATH.exists():
            logger.warning(f"Vector DB path does not exist: {VECTOR_DB_PATH}")
            return
        
        items_removed = 0
        
        # Iterate through all items in the vector_db folder
        for item in VECTOR_DB_PATH.iterdir():
            # Skip README.md files
            if item.name.lower() == "readme.md":
                continue
                
            try:
                if item.is_dir():
                    # Remove directory and all its contents
                    shutil.rmtree(item)
                    logger.info(f"Removed directory: {item}")
                    items_removed += 1
                else:
                    # Remove file
                    item.unlink()
                    logger.info(f"Removed file: {item}")
                    items_removed += 1
            except Exception as e:
                logger.error(f"Failed to remove {item}: {str(e)}")
        
        if items_removed > 0:
            logger.info(f"Vector DB cleanup completed. Removed {items_removed} items.")
        else:
            logger.info("Vector DB cleanup completed. No items to remove.")
            
    except Exception as e:
        logger.error(f"Error during vector DB cleanup: {str(e)}")


@repeat_every(seconds=CLEANUP_INTERVAL_SECONDS, logger=logger)
def scheduled_vector_db_cleanup() -> None:
    """
    Scheduled task to clean up the vector_db folder.
    
    This function is decorated with @repeat_every to run periodically.
    The interval is configurable via the VECTOR_DB_CLEANUP_INTERVAL environment variable.
    """
    logger.info("Starting scheduled vector DB cleanup...")
    clear_vector_db_folder()
    logger.info("Scheduled vector DB cleanup completed.")


def manual_vector_db_cleanup() -> dict:
    """
    Manual cleanup function that can be called via API endpoint.
    
    Returns:
        dict: Status of the cleanup operation
    """
    try:
        logger.info("Starting manual vector DB cleanup...")
        clear_vector_db_folder()
        return {
            "status": "success",
            "message": "Vector DB cleanup completed successfully"
        }
    except Exception as e:
        logger.error(f"Manual cleanup failed: {str(e)}")
        return {
            "status": "error",
            "message": f"Vector DB cleanup failed: {str(e)}"
        } 