
import React, { useEffect, useState } from 'react';
import { Emotion, emotionToEmoji, emotionToColor } from '../utils/emotionUtils';

interface EmojiOverlayProps {
  emotion: Emotion | null;
}

const EmojiOverlay: React.FC<EmojiOverlayProps> = ({ emotion }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevEmotion, setPrevEmotion] = useState<Emotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Add animation effects when emotion changes
  useEffect(() => {
    if (!emotion) {
      setIsVisible(false);
      return;
    }
    
    if (emotion !== prevEmotion) {
      // Reset animation state
      setScale(0.5);
      setIsVisible(true);
      
      // Random position for the emoji (centered with some variation)
      setPosition({
        x: Math.random() * 40 - 20, // -20 to 20
        y: Math.random() * 40 - 20, // -20 to 20
      });
      
      // Animate to normal size
      setTimeout(() => {
        setScale(1);
      }, 100);
      
      setPrevEmotion(emotion);
    }
  }, [emotion, prevEmotion]);
  
  if (!emotion || !isVisible) {
    return null;
  }
  
  const emojiStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transition: 'transform 0.3s ease-out',
  };
  
  const emojiText = emotionToEmoji(emotion);
  const colorClass = emotionToColor(emotion);
  
  return (
    <div className="camera-overlay">
      <div 
        className={`emoji ${colorClass} transition-all duration-300`}
        style={emojiStyle}
      >
        {emojiText}
      </div>
    </div>
  );
};

export default EmojiOverlay;
