import uvicorn

from src.core.config import config


if __name__ == "__main__":
  uvicorn.run("src.app:app", 
    host="0.0.0.0",
    port=config.PORT,
    log_level="info",
    reload=False,
    #reload_dirs=["src"],
    ws="websockets"
  )
