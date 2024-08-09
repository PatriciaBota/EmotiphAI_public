from fastapi import Request
from typing import List, Dict, Any
from dataclasses import dataclass
from src.models.acquisition import AppMode


@dataclass
class RenderDataVisualizationTemplateParams:
    request: Request
    port: str
    moviesLst: List[str]
    mode: AppMode
    movie: str
    HOST_IP: str

    def as_dict(self) -> Dict[str, Any]:
        return {
            'request': self.request,
            'port': self.port,
            'moviesLst': self.moviesLst,
            'mode': self.mode.value,
            'movie': self.movie,
            'HOST_IP': self.HOST_IP,
        }

@dataclass
class FetchDataEventResponse:
    send_data: Dict[str, int]

    def as_dict(self) -> Dict[str, Any]:
        return {
            'send_data': self.send_data,
        }
    
@dataclass
class PostSetTimeFlagFormResponse:
    time: str
    dt: str

    def as_dict(self) -> Dict[str, Any]:
        return {
            '_time': self.time,
            'dt': self.dt,
        }
