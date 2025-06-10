import logging
from fastapi import APIRouter, HTTPException
from src.tasks.cleanup import manual_vector_db_cleanup

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/cleanup", tags=["cleanup"])


@router.post("/vector-db")
async def manual_cleanup_vector_db():
    """
    Manual endpoint to trigger vector database cleanup.
    
    This endpoint allows you to manually trigger the cleanup process
    without waiting for the scheduled task.
    
    Returns:
        dict: Status of the cleanup operation
    """
    try:
        result = manual_vector_db_cleanup()
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        return result
    except Exception as e:
        logger.error(f"Manual cleanup endpoint failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Cleanup operation failed: {str(e)}"
        )


@router.get("/status")
async def cleanup_status():
    """
    Get information about the cleanup configuration.
    
    Returns:
        dict: Current cleanup configuration and status
    """
    import os
    from pathlib import Path
    
    vector_db_path = Path(__file__).parent.parent.parent.parent / "vector_db"
    cleanup_interval = int(os.environ.get("VECTOR_DB_CLEANUP_INTERVAL", 86400))
    
    # Count items in vector_db folder
    items_count = 0
    if vector_db_path.exists():
        items_count = len([item for item in vector_db_path.iterdir() if item.name.lower() != "readme.md"])
    
    return {
        "cleanup_interval_seconds": cleanup_interval,
        "cleanup_interval_hours": cleanup_interval / 3600,
        "vector_db_path": str(vector_db_path),
        "vector_db_exists": vector_db_path.exists(),
        "items_in_vector_db": items_count
    } 