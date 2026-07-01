"""
Face Recognition Factory

Selects the face recognition backend based on the
FACE_RECOGNITION_BACKEND environment variable:

    FACE_RECOGNITION_BACKEND=local   →  InsightFace (free, self-hosted) [DEFAULT]
    FACE_RECOGNITION_BACKEND=aws     →  AWS Rekognition (paid, cloud)

This module re-exports:
  - rekognition_service  : the active backend service instance
  - NoFacesException     : exception raised when no faces are found

Both backends share the same interface, so face_processor.py
imports only from this module and never needs to change.
"""
import os
import logging

logger = logging.getLogger(__name__)

_backend = os.getenv("FACE_RECOGNITION_BACKEND", "local").strip().lower()

if _backend == "aws":
    logger.info("Face recognition backend: AWS Rekognition")
    from app.services.aws_rekognition import (
        RekognitionService as _ServiceClass,
        NoFacesException,
    )
    rekognition_service = _ServiceClass()
else:
    # Default: local InsightFace
    if _backend != "local":
        logger.warning(
            f"Unknown FACE_RECOGNITION_BACKEND='{_backend}'. Falling back to 'local'."
        )
    logger.info("Face recognition backend: Local InsightFace (ArcFace) — $0/month")
    from app.services.local_face_recognition import (
        LocalFaceRecognitionService as _ServiceClass,
        NoFacesException,
    )
    rekognition_service = _ServiceClass()
