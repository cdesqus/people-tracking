"""
AWS Rekognition service for face detection and recognition
"""
import boto3
from typing import List, Dict, Any, Optional
from app.config import settings


class NoFacesException(Exception):
    """Exception raised when no faces are detected in the image"""
    pass


class RekognitionService:
    """Service for AWS Rekognition operations"""

    def __init__(self):
        self.client = boto3.client(
            'rekognition',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

    def ensure_collection_exists(self, collection_id: str):
        """Ensure the AWS Rekognition collection exists, create it if not"""
        try:
            self.client.describe_collection(CollectionId=collection_id)
        except Exception as e:
            error_str = str(e)
            if "ResourceNotFoundException" in error_str:
                try:
                    print(f"Creating AWS Rekognition collection: {collection_id}")
                    self.client.create_collection(CollectionId=collection_id)
                except Exception as create_err:
                    print(f"Error creating collection {collection_id}: {create_err}")
            else:
                print(f"Error describing collection {collection_id}: {e}")

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
    ) -> Dict[str, Any]:
        """
        Search for similar faces in a collection

        Args:
            collection_id: Rekognition collection ID
            image_bytes: Image file as bytes
            threshold: Confidence threshold for matching

        Returns:
            Dict with 'matches' (list of matched faces) and
            'searched_face_bounding_box' (bounding box of the face
            detected in the query image — use this for cropping)
        """
        self.ensure_collection_exists(collection_id)
        try:
            response = self.client.search_faces_by_image(
                CollectionId=collection_id,
                Image={'Bytes': image_bytes},
                FaceMatchThreshold=threshold * 100
            )
            return {
                'matches': response.get('FaceMatches', []),
                'searched_face_bounding_box': response.get('SearchedFaceBoundingBox', {}),
            }
        except Exception as e:
            error_code = ""
            error_message = ""
            if hasattr(e, "response") and isinstance(e.response, dict) and "Error" in e.response:
                error_code = e.response["Error"].get("Code", "")
                error_message = e.response["Error"].get("Message", "")
            
            error_str = f"{error_code} {error_message} {str(e)}".lower()
            
            if "invalidparameterexception" in error_str and "no faces" in error_str:
                raise NoFacesException("No faces in the image")
            print(f"Error searching faces: {e}")
            raise e

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
        self.ensure_collection_exists(collection_id)
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

    async def analyze_faces(
        self,
        collection_id: str,
        image_bytes: bytes,
        threshold: float = 0.6
    ) -> List[Dict[str, Any]]:
        """
        Unified method: Detects all faces in the frame, and searches each face in the collection.
        Returns a list of dicts:
        [
            {
                "bbox": {"Left": ..., "Top": ..., "Width": ..., "Height": ...},
                "confidence": 99.9,
                "match": { ... } or None
            }, ...
        ]
        """
        faces_found = await self.detect_faces(image_bytes)
        if not faces_found:
            return []
            
        import cv2
        import numpy as np
        
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            return []
            
        h, w = frame.shape[:2]
        
        results = []
        for face in faces_found:
            box = face.get("BoundingBox", {})
            confidence = face.get("Confidence", 90.0)
            if confidence < 50.0:
                continue
                
            x1 = int(box.get("Left", 0) * w)
            y1 = int(box.get("Top", 0) * h)
            x2 = int(x1 + box.get("Width", 0) * w)
            y2 = int(y1 + box.get("Height", 0) * h)
            
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            
            if x2 - x1 < 10 or y2 - y1 < 10:
                continue
                
            crop = frame[y1:y2, x1:x2]
            _, crop_buf = cv2.imencode('.jpg', crop)
            crop_bytes = crop_buf.tobytes()
            
            match_data = None
            try:
                search_result = await self.search_faces_by_image(collection_id, crop_bytes, threshold)
                matches = search_result.get("matches", [])
                if matches:
                    match_data = matches[0]
            except Exception:
                pass
                
            results.append({
                "bbox": box,
                "confidence": confidence,
                "match": match_data
            })
            
        return results

# Create service instance
rekognition_service = RekognitionService()
