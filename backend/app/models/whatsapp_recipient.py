from sqlalchemy import Column, String, Boolean, Enum, DateTime
from sqlalchemy.sql import func
import enum
from app.database import Base


class RecipientType(str, enum.Enum):
    PERSON = "person"
    GROUP = "group"


class WhatsappRecipient(Base):
    """WhatsApp notification recipients (groups or individual contacts)"""
    __tablename__ = "whatsapp_recipients"

    id = Column(String(36), primary_key=True, index=True)
    # WhatsApp chat ID: 628123456789@c.us (person) or 120363xxx@g.us (group)
    chat_id = Column(String(100), nullable=False, unique=True)
    label = Column(String(255), nullable=False)
    type = Column(Enum(RecipientType), nullable=False, default=RecipientType.PERSON)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<WhatsappRecipient(label={self.label}, chat_id={self.chat_id}, type={self.type})>"
