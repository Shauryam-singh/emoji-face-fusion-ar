import React, { useState, useEffect } from 'react';
import { Emotion, mockDetectEmotion, emotionToDescription, emotionToEmoji } from '../utils/emotionUtils';

interface EmotionDetectorProps {
  imageData?: ImageData;
  onEmotionDetected: (emotion: Emotion) => void;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ 
  imageData,
  onEmotionDetected
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<Emotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Process new frame data
  useEffect(() => {
    if (!imageData) return;
    
    // Simulating processing delay
    setIsLoading(true);
    
    // In a real implementation, we would use TensorFlow.js here
    // For now, we'll use a mock function that returns random emotions
    setTimeout(() => {
      const detectedEmotion = mockDetectEmotion();
      setCurrentEmotion(detectedEmotion);
      onEmotionDetected(detectedEmotion);
      
      // Add to history (keep last 5)
      setEmotionHistory(prev => {
        const newHistory = [detectedEmotion, ...prev].slice(0, 5);
        return newHistory;
      });
      
      setIsLoading(false);
    }, 100);
  }, [imageData, onEmotionDetected]);
  
  return (
    <div className="glass-panel mt-4">
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
    </div>
  );
};

export default EmotionDetector;
