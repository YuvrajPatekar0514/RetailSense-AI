"""
RetailSense AI — Tool Base Infrastructure

Provides Pydantic response schemas, execution logging, error handling wrappers,
and a recursive JSON-safe serializer for agent function tools and responses.
"""

import logging
from datetime import datetime, date
from typing import Any, Optional, Dict
import numpy as np
from pydantic import BaseModel, Field

import asyncio
import concurrent.futures

# Setup tool execution logger
logger = logging.getLogger("RetailSenseTools")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [Tool:%(name)s] %(message)s")
    ch.setFormatter(formatter)
    logger.addHandler(ch)


def run_async(coro):
    """
    Safely executes an async coroutine from sync code.
    If an asyncio event loop is already running in the current thread (e.g. FastAPI / Uvicorn),
    it runs the coroutine in a dedicated thread executor with a new loop to prevent
    'asyncio.run() cannot be called from a running event loop' errors.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(lambda: asyncio.run(coro))
            return future.result()
    else:
        return asyncio.run(coro)



def make_json_safe(obj: Any) -> Any:
    """
    Recursively converts NumPy types, datetimes, sets, tuples, and Pydantic models
    into JSON-serializable Python native types (int, float, bool, str, list, dict).
    Prevents FastAPI serialization errors such as:
        TypeError: 'numpy.bool' object is not iterable
    """
    if obj is None:
        return None
    elif isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    elif isinstance(obj, (int, np.integer)):
        return int(obj)
    elif isinstance(obj, (float, np.floating)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return [make_json_safe(x) for x in obj.tolist()]
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {str(k): make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [make_json_safe(x) for x in obj]
    elif hasattr(obj, "model_dump"):
        return make_json_safe(obj.model_dump())
    elif hasattr(obj, "dict"):
        return make_json_safe(obj.dict())
    elif hasattr(obj, "to_dict"):
        return make_json_safe(obj.to_dict())
    else:
        try:
            import json
            json.dumps(obj)
            return obj
        except (TypeError, OverflowError):
            return str(obj)


class ToolResponse(BaseModel):
    """Standardized Pydantic response schema for all agent function tools."""
    success: bool = Field(..., description="True if tool executed successfully")
    tool_name: str = Field(..., description="Name of executed tool")
    data: Dict[str, Any] = Field(default_factory=dict, description="Returned payload data")
    error: Optional[str] = Field(None, description="Error message if execution failed")
    execution_timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="UTC ISO timestamp of tool execution"
    )

    def to_dict(self) -> Dict[str, Any]:
        d = self.model_dump()
        if d.get("data") is None:
            d["data"] = {}
        return make_json_safe(d)
