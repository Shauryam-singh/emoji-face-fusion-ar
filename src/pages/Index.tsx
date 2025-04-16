
import React, { useState } from 'react';
import Header from '../components/Header';
import CameraComponent from '../components/Camera';
import EmojiOverlay from '../components/EmojiOverlay';
import EmotionDetector from '../components/EmotionDetector';
import { Emotion } from '../utils/emotionUtils';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle,
  Info,
  Camera,
  SmilePlus
} from 'lucide-react';

const Index = () => {
  const [currentFrame, setCurrentFrame] = useState<ImageData | undefined>(undefined);
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  const [facePosition, setFacePosition] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  const handleFrame = (imageData: ImageData) => {
    setCurrentFrame(imageData);
  };
  
  const handleEmotionDetected = (
    emotion: Emotion, 
    facePos?: { x: number, y: number, width: number, height: number }
  ) => {
    setDetectedEmotion(emotion);
    setFacePosition(facePos || null);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="flex-1 container py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Emoji Face Fusion AR</h1>
          <p className="text-center text-muted-foreground mb-8">
            Real-time face emotion detection with emoji overlay
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="relative">
                <CameraComponent onFrame={handleFrame} />
                <EmojiOverlay emotion={detectedEmotion} facePosition={facePosition} />
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Info size={18} className="text-primary" />
                      How It Works
                    </h2>
                    <ol className="list-decimal ml-5 space-y-2 text-sm">
                      <li>Start the camera using the button below the video feed.</li>
                      <li>The app will analyze your facial expressions in real-time using TensorFlow.js.</li>
                      <li>An emoji matching your emotion will appear over your face with AR effects.</li>
                      <li>Take snapshots to save your favorite emoji overlays!</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="space-y-4">
              <EmotionDetector 
                imageData={currentFrame}
                onEmotionDetected={handleEmotionDetected}
              />
              
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Camera size={18} className="text-primary" />
                    Camera Tips
                  </h2>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Make sure your face is well-lit and clearly visible
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Try different expressions to see how the app responds
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      For best results, face the camera directly
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <SmilePlus size={18} className="text-primary" />
                    Supported Emotions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😊</span>
                      <span>Happy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😢</span>
                      <span>Sad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😠</span>
                      <span>Angry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😲</span>
                      <span>Surprised</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😐</span>
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">😨</span>
                      <span>Fear</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤢</span>
                      <span>Disgust</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2 mb-2 text-amber-600">
                    <AlertTriangle size={16} className="text-amber-600" />
                    Technical Details
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    This app uses TensorFlow.js and MediaPipe Face Mesh for face detection and 
                    emotion analysis. For the best experience, ensure your face is well-lit 
                    and centered in the camera view.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Emoji Face Fusion AR © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
