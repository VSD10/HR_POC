import logging
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("hr_backend.database")

Base = declarative_base()

def is_postgres_listening(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def init_engine():
    """
    Attempt to initialize PostgreSQL engine if host:port is listening.
    If PostgreSQL is unreachable, fallback to SQLite for local development continuity.
    """
    host = settings.POSTGRES_SERVER
    port = int(settings.POSTGRES_PORT)

    if is_postgres_listening(host, port, timeout=1.0):
        try:
            pg_url = settings.DATABASE_URL
            engine = create_engine(
                pg_url,
                pool_pre_ping=True,
                echo=False,
                connect_args={"connect_timeout": 3}
            )
            with engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL at %s:%d", host, port)
            return engine, "postgresql"
        except Exception as e:
            logger.warning("PostgreSQL port open but connection error: %s. Using SQLite fallback.", e)
    else:
        logger.info(
            "PostgreSQL service not detected on %s:%d. Initializing local high-performance SQLite database: %s",
            host,
            port,
            settings.SQLITE_FALLBACK_URL
        )

    sqlite_engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    return sqlite_engine, "sqlite"

engine, db_type = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
