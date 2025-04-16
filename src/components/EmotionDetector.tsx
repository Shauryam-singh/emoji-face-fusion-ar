
import React, { useState, useEffect, useRef } from 'react';
import { Emotion, emotionToDescription, emotionToEmoji, mockDetectEmotion } from '../utils/emotionUtils';
import { Card, CardContent } from '@/components/ui/card';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
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
  const modelRef = useRef<faceDetection.FaceDetector | null>(null);
  const useMockDetection = useRef(true);
  
  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        
        // Check if WebGL is supported before attempting to load TensorFlow
        const isWebGLSupported = () => {
          try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
              (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
          } catch (e) {
            return false;
          }
        };
        
        // If WebGL is not supported, don't even try to load TensorFlow
        if (!isWebGLSupported()) {
          console.log('WebGL is not supported on this device. Using mock detection instead.');
          throw new Error('WebGL not supported');
        }
        
        // Set the backend to WebGL for better performance
        await tf.setBackend('webgl');
        
        // Initialize the face detection model
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
          runtime: 'tfjs', // Use tfjs runtime as a literal type
          modelType: 'short', // Use the lightweight model for better performance
          maxFaces: 1 // We only need to detect one face
        };
        
        // Load the model
        modelRef.current = await faceDetection.createDetector(
          model, 
          detectorConfig
        );
        
        setIsTfModelLoaded(true);
        useMockDetection.current = false;
        toast.success("Face detection model loaded successfully!");
      } catch (error) {
        console.error('Error loading TensorFlow model:', error);
        toast.error("Couldn't load face detection model. Using simulated detection instead.");
        useMockDetection.current = true;
        setIsTfModelLoaded(false);
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
            
            // Get face detections
            try {
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
                
                // Simple algorithm to determine emotion from face box dimensions
                // Since we can't use face landmarks anymore, we have to simplify our approach
                const aspectRatio = box.width / box.height;
                const boxSize = box.width * box.height;
                const boxSizeRatio = boxSize / (canvas.width * canvas.height);
                
                // Very simple heuristic - for demonstration purposes only
                if (aspectRatio > 0.9) {
                  detectedEmotion = 'happy';
                } else if (aspectRatio < 0.7) {
                  detectedEmotion = 'surprised';
                } else if (boxSizeRatio < 0.05) {
                  detectedEmotion = 'fear';
                } else if (boxSizeRatio > 0.15) {
                  detectedEmotion = 'angry';
                } else {
                  // Add some randomness between remaining emotions for demo purposes
                  const random = Math.random();
                  if (random < 0.3) {
                    detectedEmotion = 'neutral';
                  } else if (random < 0.6) {
                    detectedEmotion = 'sad'; 
                  } else {
                    detectedEmotion = 'disgust';
                  }
                }
              } else {
                // No face detected
                setFaceDetected(false);
                detectedEmotion = mockDetectEmotion();
              }
            } catch (error) {
              console.error('Error during face detection:', error);
              detectedEmotion = mockDetectEmotion();
              // If detection fails, fallback to mock detection
              useMockDetection.current = true;
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
                Using simulated emotion detection. WebGL support is required for real face detection.
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
