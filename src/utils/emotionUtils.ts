
// Emotion types
export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' | 'fear' | 'disgust';

// Map emotions to emojis
export const emotionToEmoji = (emotion: Emotion): string => {
  switch (emotion) {
    case 'happy':
      return '😊';
    case 'sad':
      return '😢';
    case 'angry':
      return '😠';
    case 'surprised':
      return '😲';
    case 'fear':
      return '😨';
    case 'disgust':
      return '🤢';
    case 'neutral':
    default:
      return '😐';
  }
};

// Map emotions to colors
export const emotionToColor = (emotion: Emotion): string => {
  switch (emotion) {
    case 'happy':
      return 'text-emotion-happy';
    case 'sad':
      return 'text-emotion-sad';
    case 'angry':
      return 'text-emotion-angry';
    case 'surprised':
      return 'text-emotion-surprised';
    case 'fear':
      return 'text-emotion-fear';
    case 'disgust':
      return 'text-emotion-disgust';
    case 'neutral':
    default:
      return 'text-emotion-neutral';
  }
};

// Map emotions to descriptions
export const emotionToDescription = (emotion: Emotion): string => {
  switch (emotion) {
    case 'happy':
      return 'You look happy! Keep smiling!';
    case 'sad':
      return 'You seem sad. Things will get better!';
    case 'angry':
      return 'Take a deep breath. Calm thoughts!';
    case 'surprised':
      return 'Wow! What surprised you?';
    case 'fear':
      return 'Don\'t worry, you\'re safe!';
    case 'disgust':
      return 'Something doesn\'t seem right?';
    case 'neutral':
    default:
      return 'Neutral expression detected.';
  }
};

// Mock function to simulate emotion detection - will be replaced with TensorFlow.js implementation
export const mockDetectEmotion = (): Emotion => {
  const emotions: Emotion[] = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust'];
  const randomIndex = Math.floor(Math.random() * emotions.length);
  return emotions[randomIndex];
};
