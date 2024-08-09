import logging
import time
from contextlib import contextmanager
from fastapi import FastAPI, status, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi_socketio import SocketManager
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware

from src.models.acquisition import AppMode
from src.schemas.v1.acquisition import FetchDataEventResponse
from src.core.config import config
from src.endpoints.v1.api import api_router
from src.endpoints import deps
import numpy as np

middleware = [
    Middleware(SessionMiddleware, secret_key=config.SECRET_KEY)
]

app = FastAPI(middleware=middleware)
socket_manager = SocketManager(app=app)
app.include_router(api_router)

app.mount("/static", StaticFiles(directory="./static"), name="static")
app.mount("/js", StaticFiles(directory="./js"), name="js")
app.mount("/styles", StaticFiles(directory="./styles"), name="styles")

ctx_manager = contextmanager(deps.get_ctx)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
    logging.error(f"{request}: {exc_str}")
    content = {"status_code": status.HTTP_422_UNPROCESSABLE_ENTITY, "message": exc_str, "data": None}
    return JSONResponse(
        content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )


@app.on_event("shutdown")
def shutdown():
    with ctx_manager() as ctx:
        kss = ctx.kubesense_service
        mv_svc = ctx.movie_service

        print("STOP BUTTON")
        config.MODE = AppMode.stop

        kss.stop_readers()
        mv_svc.stop()


## ---------------------------------- Socket management ---------------------------------- ##
connected_clients = set()

@socket_manager.on('connect')
def connect(sid, environ):
    connected_clients.add(sid)

@socket_manager.on('disconnect')
def disconnect(sid):
    connected_clients.remove(sid)
    with ctx_manager() as ctx:
        kss = ctx.kubesense_service
        kss.stop_vis_event.clear()

@socket_manager.on('fetch data')
async def fetch_data(
    client_id: str,
    ids_to_show: list,
    sent_ids: list,
):  
    
    t0 = time.time()
    send_data = {}
    send_data["id"],send_data["data"] = [], []
    with ctx_manager() as ctx:
        kss = ctx.kubesense_service
        kss.stop_vis_event.set()
        devices_data = kss.fetch_session_data(sent_ids=sent_ids, ids_to_show=ids_to_show)

        for device_data in devices_data:
            for channel, data in device_data.dict(exclude={"device_id", "ts", "db_device_id"}, exclude_none=True).items():
                if str(device_data.device_id) + "_" + str(channel) in ids_to_show or str(device_data.device_id) + "_" + str(channel) not in sent_ids:
                    send_data["id"] += [str(device_data.device_id) + "_" + str(channel)]
                    send_data["data"] += [data]
    if len(send_data["id"]) > 0:
        await socket_manager.emit(
            "draw", 
            FetchDataEventResponse(send_data=send_data).as_dict(), 
            broadcast=True
        )
        if config.LOG:
            print("fetch data ts", time.time() - t0, len(send_data["data"]))


@socket_manager.on('change mode')
def changer(
    client_id: str,
    data: dict,
): 
    with ctx_manager() as ctx:

        kss = ctx.kubesense_service
        mv_svc = ctx.movie_service


        if data['mode'] == AppMode.start:  # if user pressed start button
            if config.LOG:
                print("/dataVis Configuring sense device")

            # Captures start time and sets mode to start
            config.START_TIME = time.time()
            config.MODE = AppMode.start
            print("changed config.MODE - start data collection", config.MODE)

            # Starts acquisition
            kss.init_session(config.SAMPLING_RATE, 'sense', config.MOVIE)
            kss.init_readers()
            kss.start_readers()

            if config.LOG:
                print("Acquisition START")
            mv_svc.start()

        else:
            print("STOP BUTTON - stop data collection")
            config.MODE = AppMode.stop
            print("changed config.MODE", config.MODE)
            kss.stop_readers()
            print("stopped readers", config.CURRENT_SESSION_ID)
            kss.end_session(config.CURRENT_SESSION_ID)
            mv_svc.stop()
            print("stopped movie")

            #kss.calc_data_loss(config.CURRENT_SESSION_ID) # remove if error
            
            if config.LOG:
                print("Acquisition END")
