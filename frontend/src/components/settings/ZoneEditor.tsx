import React, { useRef, useState, useEffect } from 'react';
import { Camera } from '@/types/index';
import { Button, Modal } from '@components/common';
import { API_BASE_URL } from '@/utils/constants';

interface ZoneEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zonesJson: string) => void;
  camera: Camera | null;
}

interface Point {
  x: number;
  y: number;
}

interface Zone {
  name: string;
  points: Point[];
}

const ZoneEditor: React.FC<ZoneEditorProps> = ({ isOpen, onClose, onSave, camera }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // Load existing zones when opened
  useEffect(() => {
    if (isOpen && camera) {
      if (camera.intrusion_zones) {
        try {
          const parsed = JSON.parse(camera.intrusion_zones);
          const mappedZones = parsed.map((z: any, idx: number) => {
            if (Array.isArray(z)) {
              return { name: `Zone ${idx + 1}`, points: z };
            }
            return { name: z.name || `Zone ${idx + 1}`, points: z.points || [] };
          });
          setZones(mappedZones);
        } catch (e) {
          console.error('Failed to parse zones', e);
          setZones([]);
        }
      } else {
        setZones([]);
      }
      setPoints([]);
      setIsDrawing(false);
    }
  }, [isOpen, camera]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing zones
    zones.forEach((zone) => {
      ctx.beginPath();
      zone.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    // Draw current polygon
    if (points.length > 0) {
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      if (!isDrawing && points.length > 2) {
        ctx.closePath();
      }
      ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
      if (!isDrawing) ctx.fill();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw points
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
      });
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [points, zones, imgSize]);

  const handleImageLoad = () => {
    if (imgRef.current && canvasRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      canvasRef.current.width = naturalWidth;
      canvasRef.current.height = naturalHeight;
      setImgSize({ width: naturalWidth, height: naturalHeight });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate scaling factor between visible canvas and actual canvas pixels
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isDrawing) {
      // Check if clicked near start point to close polygon
      if (points.length > 2) {
        const startPt = points[0];
        const dist = Math.sqrt(Math.pow(x - startPt.x, 2) + Math.pow(y - startPt.y, 2));
        if (dist < 20) {
          const zoneName = prompt("Enter a name for this zone:", `Zone ${zones.length + 1}`) || `Zone ${zones.length + 1}`;
          setZones([...zones, { name: zoneName, points }]);
          setPoints([]);
          setIsDrawing(false);
          return;
        }
      }
      setPoints([...points, { x, y }]);
    } else {
      setIsDrawing(true);
      setPoints([{ x, y }]);
    }
  };

  const handleClear = () => {
    setZones([]);
    setPoints([]);
    setIsDrawing(false);
  };

  const handleSave = () => {
    // If we map this to 1920x1080 standard resolution for YOLO backend:
    // Actually, backend scales it dynamically based on stream resolution if we pass exactly the coordinates relative to the snapshot size.
    // The snapshot size is likely the actual stream resolution.
    onSave(JSON.stringify(zones));
    onClose();
  };

  if (!camera) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Draw Intrusion Zone - ${camera.name}`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-500">
          Click on the image to draw a polygon. Click near the starting point to close the shape. 
          Any person entering these red zones will trigger an alert.
        </p>

        <div className="relative border border-gray-300 dark:border-slate-300 rounded-lg overflow-hidden bg-black flex justify-center items-center">
          <div className="relative">
            <img
              ref={imgRef}
              src={`${API_BASE_URL}/cameras/${camera.id}/snapshot?t=${new Date().getTime()}`}
              alt="Camera Snapshot"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              className="max-w-full h-auto"
              style={{ maxHeight: '50vh', display: 'block' }}
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute top-0 left-0 cursor-crosshair w-full h-full"
            />
          </div>
        </div>

        {zones.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-slate-300">Configured Zones:</h4>
            <div className="space-y-2">
              {zones.map((z, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-700">
                  <input 
                    type="text" 
                    value={z.name} 
                    onChange={(e) => {
                      const newZones = [...zones];
                      newZones[idx].name = e.target.value;
                      setZones(newZones);
                    }}
                    className="bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 text-sm font-medium focus:ring-0 outline-none w-2/3 dark:text-white"
                  />
                  <button 
                    onClick={() => setZones(zones.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-900/30 rounded"
                    title="Delete Zone"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-slate-300">
          <Button variant="secondary" onClick={handleClear} size="sm">
            Clear All Zones
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Zones
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ZoneEditor;
