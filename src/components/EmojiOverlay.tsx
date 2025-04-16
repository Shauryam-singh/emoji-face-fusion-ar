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
  const [emotionIntensity, setEmotionIntensity] = useState(1);
  const [particlesActive, setParticlesActive] = useState(false);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<{x: number, y: number, size: number, speed: number, opacity: number}[]>([]);
  
  useEffect(() => {
    if (emotion && emotion !== prevEmotion) {
      particlesRef.current = Array.from({ length: 15 }, () => ({
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 2 + 1,
        opacity: 1
      }));
      setParticlesActive(true);
      
      setTimeout(() => {
        setParticlesActive(false);
      }, 2000);
      
      setEmotionIntensity(0.7 + Math.random() * 0.6);
    }
  }, [emotion, prevEmotion]);
  
  useEffect(() => {
    if (!emotion) {
      setIsVisible(false);
      return;
    }
    
    if (emotion !== prevEmotion) {
      setScale(0.5);
      setOpacity(0.7);
      setIsVisible(true);
      setRotation(Math.random() * 20 - 10);
      
      if (facePosition) {
        setPosition({
          x: facePosition.x + (facePosition.width / 2),
          y: facePosition.y + (facePosition.height / 3)
        });
      } else {
        setPosition({
          x: Math.random() * 60 - 30,
          y: Math.random() * 60 - 30
        });
      }
      
      setTimeout(() => {
        setScale(1.3);
        setTimeout(() => {
          setScale(1);
          setOpacity(1);
        }, 150);
      }, 100);
      
      setPrevEmotion(emotion);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      let time = 0;
      const animateFloat = () => {
        time += 0.05;
        
        let floatY, floatX, newScale;
        
        switch(emotion) {
          case 'happy':
            floatY = Math.sin(time * 1.5) * 7 * emotionIntensity;
            floatX = Math.cos(time) * 3 * emotionIntensity;
            newScale = 1 + Math.sin(time * 2) * 0.05 * emotionIntensity;
            break;
          case 'sad':
            floatY = Math.sin(time * 0.8) * 4 * emotionIntensity;
            floatX = Math.cos(time * 0.5) * 2 * emotionIntensity;
            newScale = 1 - Math.abs(Math.sin(time * 0.7)) * 0.03 * emotionIntensity;
            break;
          case 'angry':
            floatY = Math.sin(time * 2.5) * 4 * emotionIntensity;
            floatX = Math.cos(time * 3) * 5 * emotionIntensity;
            newScale = 1 + Math.abs(Math.sin(time * 3)) * 0.08 * emotionIntensity;
            break;
          case 'surprised':
            floatY = Math.sin(time * 2) * 8 * emotionIntensity;
            floatX = Math.cos(time * 1.5) * 5 * emotionIntensity;
            newScale = 1 + Math.sin(time * 4) * 0.15 * emotionIntensity;
            break;
          case 'fear':
            floatY = Math.sin(time * 3) * 5 * emotionIntensity + Math.sin(time * 7) * 2;
            floatX = Math.cos(time * 2.5) * 4 * emotionIntensity + Math.cos(time * 6) * 2;
            newScale = 1 + Math.sin(time * 5) * 0.05 * emotionIntensity;
            break;
          case 'disgust':
            floatY = Math.sin(time) * 3 * emotionIntensity;
            floatX = Math.cos(time * 1.2) * 4 * emotionIntensity;
            newScale = 1 - Math.abs(Math.sin(time * 1.3)) * 0.04 * emotionIntensity;
            break;
          default:
            floatY = Math.sin(time) * 3 * emotionIntensity;
            floatX = Math.cos(time * 0.8) * 2 * emotionIntensity;
            newScale = 1 + Math.sin(time) * 0.02 * emotionIntensity;
        }
        
        setPosition(prev => ({
          x: facePosition ? facePosition.x + (facePosition.width / 2) + floatX : prev.x + floatX/2,
          y: facePosition ? facePosition.y + (facePosition.height / 3) + floatY : prev.y + floatY/2
        }));
        
        setScale(prevScale => (newScale + prevScale) / 2);
        setRotation(prev => prev + Math.sin(time * 0.5) * 0.3 * emotionIntensity);
        
        animationRef.current = requestAnimationFrame(animateFloat);
      };
      
      animateFloat();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emotion, prevEmotion, facePosition, emotionIntensity]);
  
  if (!emotion || !isVisible) {
    return null;
  }
  
  const emojiStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease',
    opacity: opacity,
    filter: `drop-shadow(0 0 8px rgba(255,255,255,0.5))`
  };
  
  const emojiText = emotionToEmoji(emotion);
  const colorClass = emotionToColor(emotion);
  
  return (
    <div className="camera-overlay pointer-events-none">
      <div 
        className={`emoji ${colorClass} transition-all duration-300`}
        style={emojiStyle}
      >
        {emojiText}
      </div>
      
      {particlesActive && particlesRef.current.map((particle, i) => (
        <div 
          key={i}
          className={`absolute ${colorClass} text-xs sm:text-sm opacity-0`}
          style={{
            left: `calc(50% + ${position.x + particle.x}px)`,
            top: `calc(50% + ${position.y + particle.y}px)`,
            transform: `scale(${particle.size / 30})`,
            opacity: particle.opacity,
            animation: `particleFade 2s ease-out forwards, particleFloat ${particle.speed}s ease-out forwards`
          }}
        >
          {emojiText}
        </div>
      ))}
      
      <style>
        {`
        @keyframes particleFade {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        
        @keyframes particleFloat {
          0% { transform: translate(0, 0) scale(0.3); }
          100% { transform: translate(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100 + 50}px, -${Math.random() * 100 + 50}px) scale(0.1); }
        }
        `}
      </style>
    </div>
  );
};

export default EmojiOverlay;
