
import React, { useEffect, useState, useRef } from 'react';
import { Emotion, emotionToEmoji, emotionToColor } from '../utils/emotionUtils';

interface EmojiOverlayProps {
  emotion: Emotion | null;
  facePosition?: { x: number, y: number, width: number, height: number } | null;
}

const EmojiOverlay: React.FC<EmojiOverlayProps> = ({ emotion, facePosition }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevEmotion, setPrevEmotion] = useState<Emotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0.9);
  const animationRef = useRef<number | null>(null);
  
  // Enhanced animation effects when emotion changes
  useEffect(() => {
    if (!emotion) {
      setIsVisible(false);
      return;
    }
    
    if (emotion !== prevEmotion) {
      // Reset animation state
      setScale(0.5);
      setOpacity(0.7);
      setIsVisible(true);
      setRotation(Math.random() * 20 - 10); // Random slight rotation
      
      // Position based on detected face or random if no face detected
      if (facePosition) {
        setPosition({
          x: facePosition.x + (facePosition.width / 2),
          y: facePosition.y + (facePosition.height / 3) // Position near eyes
        });
      } else {
        // Random position for the emoji (centered with some variation)
        setPosition({
          x: Math.random() * 60 - 30, // -30 to 30
          y: Math.random() * 60 - 30, // -30 to 30
        });
      }
      
      // Animate to normal size with bounce effect
      setTimeout(() => {
        setScale(1.2);
        setTimeout(() => {
          setScale(1);
          setOpacity(1);
        }, 150);
      }, 100);
      
      setPrevEmotion(emotion);
      
      // Start floating animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      let time = 0;
      const animateFloat = () => {
        time += 0.05;
        const floatY = Math.sin(time) * 5;
        const floatX = Math.cos(time * 0.8) * 3;
        
        setPosition(prev => ({
          x: facePosition ? facePosition.x + (facePosition.width / 2) + floatX : prev.x + floatX/2,
          y: facePosition ? facePosition.y + (facePosition.height / 3) + floatY : prev.y + floatY/2
        }));
        
        animationRef.current = requestAnimationFrame(animateFloat);
      };
      
      animateFloat();
    }
    
    // Cleanup animation on emotion change or unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emotion, prevEmotion, facePosition]);
  
  if (!emotion || !isVisible) {
    return null;
  }
  
  const emojiStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease',
    opacity: opacity,
    filter: `drop-shadow(0 0 8px rgba(255,255,255,0.5))`
  };
  
  const emojiText = emotionToEmoji(emotion);
  const colorClass = emotionToColor(emotion);
  
  return (
    <div className="camera-overlay">
      <div 
        className={`emoji ${colorClass} transition-all duration-300 animate-pulse`}
        style={emojiStyle}
      >
        {emojiText}
      </div>
    </div>
  );
};

export default EmojiOverlay;
