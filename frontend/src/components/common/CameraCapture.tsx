import React, { useRef, useState, useEffect } from 'react';
import { Camera, VideoOff, RotateCcw } from 'lucide-react';
import Button from './Button';

interface CameraCaptureProps {
  onCapture: (file: File | null) => void;
  onClose?: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<boolean>(false);

  // Start the webcam stream
  const startCamera = async () => {
    setError(null);
    setCaptured(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Cannot access webcam. Please check permissions or verify camera connection.");
    }
  };

  // Stop the camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Draw the current video frame onto the canvas
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas image to blob, then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `captured_face_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            setCaptured(true);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleRetake = () => {
    onCapture(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-white/50 p-4 rounded-xl border border-slate-200 dark:border-slate-200 w-full">
      {error ? (
        <div className="text-sm text-red-500 text-center py-6">
          <VideoOff className="w-10 h-10 mx-auto mb-2 text-red-500" />
          {error}
          <Button variant="secondary" onClick={startCamera} className="mt-4 mx-auto block text-xs">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden border border-slate-300 dark:border-slate-300">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${captured ? 'hidden' : 'block'}`}
          />
          <canvas ref={canvasRef} className={`w-full h-full object-cover ${captured ? 'block' : 'hidden'}`} />
          
          {/* Scanline and biometric reticle overlay for aesthetic */}
          {!captured && stream && (
            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20">
              <div className="scanline" style={{
                width: '100%',
                height: '2px',
                background: 'rgba(16, 185, 129, 0.2)',
                position: 'absolute',
                top: 0,
                animation: 'scan 4s linear infinite'
              }} />
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-center w-full">
        {!captured && stream && (
          <Button type="button" variant="primary" onClick={capturePhoto} className="flex items-center gap-1 text-xs">
            <Camera className="w-4 h-4" />
            Ambil Foto
          </Button>
        )}
        {captured && (
          <Button type="button" variant="secondary" onClick={handleRetake} className="flex items-center gap-1 text-xs">
            <RotateCcw className="w-4 h-4" />
            Foto Ulang
          </Button>
        )}
        {onClose && (
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
