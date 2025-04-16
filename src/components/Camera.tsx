
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Download } from 'lucide-react';
import { toast } from "sonner";

interface CameraComponentProps {
  onFrame: (imageData: ImageData) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // Start camera stream
  const startCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: facing,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        // Check if multiple cameras are available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
        
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        toast.success("Camera started successfully");
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Couldn't access camera. Please check permissions.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      toast.info("Camera stopped");
    }
  };

  // Switch camera (front/back)
  const switchCamera = () => {
    const newFacing = facing === 'user' ? 'environment' : 'user';
    setFacing(newFacing);
    
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };

  // Capture frame for emotion analysis
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      onFrame(imageData);
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  };

  // Take a snapshot and download it
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Convert canvas to data URL and create download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `emoji-fusion-${new Date().toISOString()}.png`;
      link.click();
      
      toast.success("Snapshot saved!");
    } catch (error) {
      console.error('Error taking snapshot:', error);
      toast.error("Couldn't save snapshot");
    }
  };

  // Process frames at regular intervals when camera is active
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (isCameraActive) {
      intervalId = window.setInterval(() => {
        captureFrame();
      }, 200); // Process frames every 200ms
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isCameraActive]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="camera-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex justify-between">
        <div className="flex gap-2">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
            >
              <Camera size={18} />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-lg"
            >
              <Camera size={18} />
              <span>Stop Camera</span>
            </button>
          )}
          
          {hasMultipleCameras && isCameraActive && (
            <button
              onClick={switchCamera}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg"
            >
              <RefreshCw size={18} />
              <span>Switch Camera</span>
            </button>
          )}
        </div>
        
        {isCameraActive && (
          <button
            onClick={takeSnapshot}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg"
          >
            <Download size={18} />
            <span>Save Photo</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraComponent;
