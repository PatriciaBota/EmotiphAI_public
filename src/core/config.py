import sys
import os
import netifaces as ni
import socket
from os import getenv
from typing import List
from pydantic import BaseModel
import platform

from src.models.acquisition import AppMode

def get_ip_mac():
    # Common network interfaces
    interfaces = ['eth0', 'en0']
    
    for interface in interfaces:
        try:
            # Attempt to get the interface addresses
            addresses = ni.ifaddresses(interface)
            # Check if the interface has an IPv4 configuration
            if ni.AF_INET in addresses:
                # Return the first IPv4 address found
                return str(addresses[ni.AF_INET][0]['addr'])
        except ValueError:
            # Handle the case where the interface does not exist
            continue
    
    # Return None if no suitable IP address was found
    return "192.168.1.100" #None

def get_ip(device="R", interface=None):
    try:
        if platform.system() == "Linux" and interface:
            host_ip = ni.ifaddresses(interface)[ni.AF_INET][0]['addr']
        else:
            host_ip = socket.gethostbyname(socket.getfqdn())

    except Exception as e:
        print(e)
        host_ip = None

    return host_ip

def get_host_name_ip():
    if platform.system() == 'Linux':
        return get_ip("R", "eth0") or get_ip("R", "wlan0")
    elif platform.system() == 'Windows':
        return get_ip("W")
    elif platform.system() == 'Darwin':
        return get_ip_mac()


class Config(BaseModel):
    ENV: str = getenv("ENV", "dev")
    VERSION: str = getenv("VERSION", "0.0.1")
    HOST_IP: str = get_host_name_ip()
    DATABASE_URL: str = f"sqlite://{getenv('DATABASE_PATH', '/data/db.sqlite')}"    
    PORT: int = int(getenv("SERVER_PORT", "8020"))
    MOVIE: str = getenv("MOVIE_PATH", "None")
    MOVIES_FOLDER: str = getenv("MOVIES_FOLDER", "./static/movies")
    AUTO: bool = getenv("AUTO", "0") == "1"
    LOG: bool = getenv("LOG", "0") == "1"
    PORTS: List[int] = list(map(str, getenv('DEVICE_PORTS', "8830,8834,8828,8818").split(',')))
    SAMPLING_RATE: int = int(getenv('SAMPLING_RATE', 50))
    CHANNELS: List[int] = list(map(int, getenv('CHANNELS', "1,3,7,8").split(',')))
    MODE: AppMode = AppMode.stop
    START_TIME: int = 0
    SECRET_KEY: str = "LGgBcCHhvfZOGbBGILSV"
    CURRENT_SESSION_ID: int = -1 
    SEGMENTATION: str = "EDA"
    EDA_CHANNEL: str = 'ai_1'
    TIME_CHANNEL: str = 'timestamp'
    ELEARNING: bool = getenv("ELEARNING", "0") == "1"
    COMMUNICATION: str = "tcp" # tcp, bt_classic

    

config = Config()
