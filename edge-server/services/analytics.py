from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///./sahayak_edge.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class LogEntry(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    service_type = Column(String)
    input_size = Column(Integer)
    duration_ms = Column(Integer)
    status = Column(String)

Base.metadata.create_all(bind=engine)

def log_event(service_type: str, input_size: int, duration_ms: int, status: str = "Success"):
    db = SessionLocal()
    try:
        log = LogEntry(
            service_type=service_type,
            input_size=input_size,
            duration_ms=duration_ms,
            status=status
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Logging failed: {e}")
    finally:
        db.close()