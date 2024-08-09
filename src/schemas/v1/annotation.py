from fastapi import Request
from typing import List, Dict, Any
from dataclasses import dataclass
import enum

class AnnotationType(str, enum.Enum):
  AROUSAL = "AROUSAL"
  VALENCE = "VALENCE"
  AROUSAL_UNCERTAINTY = "AROUSAL_UNCERTAINTY"
  VALENCE_UNCERTAINTY = "VALENCE_UNCERTAINTY"
  TEXT = "TEXT"


@dataclass
class RenderSelectFileTemplateParams:
  request: Request
  device_files: List[str]
  select_devices: List[List[str]]
  movie_list: List[str]

  def as_dict(self) -> Dict[str, Any]:
    return {
      'request': self.request,
      'devicesFiles': self.device_files,
      'selectDev': self.select_devices,
      'movieLs': self.movie_list,
    }
  
@dataclass
class RenderAnnotatorTemplateParams:
  request: Request
  self_report: dict
  file_id: int
  device_files: List[str]
  user_ann_menu: List[str]
  number_channel: List[str]
  channel: str
  ann_s: int
  select_devices: List[List[str]]
  device_id: str
  movie: str
  movie_list: List[str]

  def as_dict(self) -> Dict[str, Any]:
    return {
      'request': self.request,
      '_selfReport': self.self_report,
      'fileID': self.file_id,
      'devicesFiles': self.device_files,
      'userAnnMenu': self.user_ann_menu,
      'numberCH': self.number_channel,
      'CH': self.channel,
      'annS': self.ann_s,
      'selectDev': self.select_devices,
      'devID': self.device_id,
      'movie': self.movie,
      'movieLs': self.movie_list,
    }

@dataclass
class GetTimeFlagButtonsResponse:
  self_report: dict
  user_ann_menu: str
  segmentation: str
  device_id: int

  def as_dict(self) -> Dict[str, Any]:
    return {
      '_selfReport': self.self_report,
      'userAnnMenu': self.user_ann_menu,
      'SEGMENTATION': self.segmentation,
      'devID': self.device_id,
    }
  