
import React from 'react';
import { Smile } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Smile className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Emoji Face Fusion
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;
