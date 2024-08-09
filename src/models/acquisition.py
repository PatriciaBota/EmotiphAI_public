from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class EdaData(BaseModel):
  device_id: str
  ch_1: Optional[List[float]] = None
  ch_2: Optional[List[float]] = None
  ch_3: Optional[List[float]] = None
  ch_4: Optional[List[float]] = None
  ch_5: Optional[List[float]] = None
  ch_6: Optional[List[float]] = None
  timestamp: Optional[float] = None 
  seq: Optional[float] = None 

class AppMode(str, Enum):
  start: str = "start"
  stop: str = "stop"
