import React, { useState, useEffect, useRef } from 'react';
import { Emotion, emotionToDescription, emotionToEmoji, mockDetectEmotion } from '../utils/emotionUtils';
import { Card, CardContent } from '@/components/ui/card';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { toast } from 'sonner';

interface EmotionDetectorProps {
  imageData?: ImageData;
  onEmotionDetected: (emotion: Emotion, facePosition?: { x: number, y: number, width: number, height: number }) => void;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ 
  imageData,
  onEmotionDetected
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<Emotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTfModelLoaded, setIsTfModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const modelRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const useMockDetection = useRef(true);
  
  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
          refineLandmarks: true,
        };
        
        // Load the model
        modelRef.current = await faceLandmarksDetection.createDetector(
          model, 
          detectorConfig as any
        );
        
        setIsTfModelLoaded(true);
        useMockDetection.current = false;
        toast.success("Face detection model loaded successfully!");
      } catch (error) {
        console.error('Error loading TensorFlow model:', error);
        toast.error("Couldn't load face detection model. Using simulated detection instead.");
        useMockDetection.current = true;
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModel();
    
    return () => {
      // Cleanup function if needed
    };
  }, []);
  
  // Process new frame data
  useEffect(() => {
    if (!imageData) return;
    
    // Avoid processing if already loading
    if (isLoading) return;
    
    const processFrame = async () => {
      setIsLoading(true);
      
      try {
        let detectedEmotion: Emotion;
        let faceBox: { x: number, y: number, width: number, height: number } | undefined;
        
        // Use real detection if model is loaded, otherwise use mock
        if (!useMockDetection.current && modelRef.current) {
          // Create an ImageData from canvas for model input
          const canvas = document.createElement('canvas');
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.putImageData(imageData, 0, 0);
            
            // Get face landmarks
            const faces = await modelRef.current.estimateFaces(canvas);
            
            if (faces && faces.length > 0) {
              setFaceDetected(true);
              
              // Get face box
              const box = faces[0].box;
              faceBox = {
                x: box.xMin,
                y: box.yMin,
                width: box.width,
                height: box.height
              };
              
              // Simple algorithm to determine emotion from face landmarks
              // This is a simplified approach - in a real app, you would use a more sophisticated model
              const face = faces[0];
              
              // Analyze facial features to determine emotion
              // This is a very simplified algorithm, you would want to use a proper emotion classifier
              if (face.keypoints) {
                const mouthPoints = face.keypoints.filter(kp => 
                  kp.name && kp.name.toLowerCase().includes('mouth')
                );
                const eyePoints = face.keypoints.filter(kp => 
                  kp.name && kp.name.toLowerCase().includes('eye')
                );
                
                if (mouthPoints.length > 0 && eyePoints.length > 0) {
                  // Simple emotion detection based on mouth and eye positions
                  // This is very simplified and not accurate - just for demonstration
                  const mouthWidth = Math.max(...mouthPoints.map(p => p.x)) - 
                                    Math.min(...mouthPoints.map(p => p.x));
                  const eyeHeight = Math.max(...eyePoints.map(p => p.y)) - 
                                  Math.min(...eyePoints.map(p => p.y));
                  
                  const mouthHeightDiff = Math.max(...mouthPoints.map(p => p.y)) - 
                                        Math.min(...mouthPoints.map(p => p.y));
                  
                  // Very basic heuristic - not accurate
                  if (mouthHeightDiff > 15 && mouthWidth > 30) {
                    detectedEmotion = 'happy';
                  } else if (eyeHeight > 10 && mouthWidth < 25) {
                    detectedEmotion = 'surprised';
                  } else if (mouthHeightDiff < 5) {
                    detectedEmotion = 'angry';
                  } else {
                    detectedEmotion = 'neutral';
                  }
                } else {
                  detectedEmotion = 'neutral';
                }
              } else {
                // Fallback to mock if face detected but no keypoints
                detectedEmotion = mockDetectEmotion();
              }
            } else {
              // No face detected
              setFaceDetected(false);
              detectedEmotion = mockDetectEmotion();
            }
          } else {
            // Canvas context creation failed
            detectedEmotion = mockDetectEmotion();
          }
        } else {
          // Using mock detection
          detectedEmotion = mockDetectEmotion();
        }
        
        setCurrentEmotion(detectedEmotion);
        onEmotionDetected(detectedEmotion, faceBox);
        
        // Add to history (keep last 5)
        setEmotionHistory(prev => {
          const newHistory = [detectedEmotion, ...prev].slice(0, 5);
          return newHistory;
        });
      } catch (error) {
        console.error('Error processing frame:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small delay to avoid excessive processing
    const timerId = setTimeout(() => {
      processFrame();
    }, 200);
    
    return () => clearTimeout(timerId);
  }, [imageData, onEmotionDetected, isLoading]);
  
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Emotion Detection</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm">Processing...</span>
          </div>
        ) : currentEmotion ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{emotionToEmoji(currentEmotion)}</span>
              <div>
                <h3 className="font-medium capitalize">{currentEmotion}</h3>
                <p className="text-sm text-muted-foreground">{emotionToDescription(currentEmotion)}</p>
              </div>
            </div>
            
            {!isTfModelLoaded && (
              <div className="mt-2 mb-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                Using simulated emotion detection. The real face detection model could not be loaded.
              </div>
            )}
            
            {isTfModelLoaded && !faceDetected && currentEmotion && (
              <div className="mt-2 mb-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                No face detected. Using simulated emotions.
              </div>
            )}
            
            {emotionHistory.length > 1 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Recent Emotions</h4>
                <div className="flex gap-2">
                  {emotionHistory.slice(1).map((emotion, index) => (
                    <span key={index} className="text-xl" title={emotion}>
                      {emotionToEmoji(emotion)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Start the camera to begin emotion detection
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionDetector;
