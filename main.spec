# -*- mode: python ; coding: utf-8 -*-
hiddenimports=[
    'aiofiles', 'bidict', 'biosppy', 'certifi', 'charset_normalizer', 
    'click', 'contourpy', 'cycler', 'exceptiongroup', 'fastapi', 'fastapi_socketio','fastapi.staticfiles', 
    'ffmpeg', 'fonttools', 'future', 'greenlet', 'h11', 'h5py', 'idna', 
    'iso8601', 'itsdangerous', 'Jinja2', 'joblib', 'kiwisolver', 'MarkupSafe', 
    'matplotlib', 'netifaces', 'numpy', 'opencv-python', 'packaging', 'pandas', 
    'Pillow', 'platformdirs', 'pydantic', 'pydantic_core', 'pyparsing', 
    'python-dateutil', 'python-engineio', 'python-multipart', 'python-socketio', 
    'pytz', 'PyYAML', 'requests', 'requests-unixsocket', 'scenedetect', 'scikit-learn', 
    'scipy', 'serial', 'shortuuid', 'simple-websocket', 'six', 'sniffio', 'socketIO-client', 
    'SQLAlchemy', 'starlette', 'structlog', 'threadpoolctl', 'tqdm', 'typing_extensions', 
    'tzdata', 'urllib3', 'uvicorn', 'websocket-client', 'websockets', 'wsproto', 'starlette.middleware.sessions','fastapi.templating','sqlalchemy.ext.declarative','sklearn','pythonosc'
]


a = Analysis(
    ['main.py'],
    pathex=['/venv/lib/python3.10/site-packages'],
    binaries=[],
    datas=[('src', 'src'), ('templates', 'templates'), ('static', 'static')],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
