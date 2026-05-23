"""
AWS Rekognition service for face detection and recognition
"""
import boto3
from typing import List, Dict, Any, Optional
from app.config import settings


class RekognitionService:
    """Service for AWS Rekognition operations"""

    def __init__(self):
        self.client = boto3.client(
            'rekognition',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

    async def detect_faces(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Detect faces in an image using AWS Rekognition

        Args:
            image_bytes: Image file as bytes

        Returns:
            List of detected faces with bounding boxes and confidence scores
        """
        try:
            response = self.client.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']
            )
            return response.get('FaceDetails', [])
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []

    async def search_faces_by_image(
        self,
        collection_id: str,
        image_bytes: bytes,
        threshold: float = 0.6
    ) -> List[Dict[str, Any]]:
        """
        Search for similar faces in a collection

        Args:
            collection_id: Rekognition collection ID
            image_bytes: Image file as bytes
            threshold: Confidence threshold for matching

        Returns:
            List of matched faces from the collection
        """
        try:
            response = self.client.search_faces_by_image(
                CollectionId=collection_id,
                Image={'Bytes': image_bytes},
                FaceMatchThreshold=threshold * 100
            )
            return response.get('FaceMatches', [])
        except Exception as e:
            print(f"Error searching faces: {e}")
            return []

    async def index_face(
        self,
        collection_id: str,
        image_bytes: bytes,
        external_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Index a face in a collection

        Args:
            collection_id: Rekognition collection ID
            image_bytes: Image file as bytes
            external_id: External identifier for the face

        Returns:
            Face ID if successful, None otherwise
        """
        try:
            response = self.client.index_faces(
                CollectionId=collection_id,
                Image={'Bytes': image_bytes},
                ExternalImageId=external_id or 'unknown',
                MaxFaces=1
            )
            faces = response.get('FaceRecords', [])
            if faces:
                return faces[0]['Face']['FaceId']
            return None
        except Exception as e:
            print(f"Error indexing face: {e}")
            return None


# Create service instance
rekognition_service = RekognitionService()
