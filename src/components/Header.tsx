
import React from 'react';
import { Smile, Github, Award } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 flex justify-between items-center bg-slate-950/5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Smile className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Emoji Face Fusion AR
          </h1>
          <p className="text-xs text-muted-foreground">Advanced Diploma Project</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1 text-amber-500 text-xs font-medium px-2 py-1 bg-amber-500/10 rounded-full">
          <Award size={14} />
          <span>Diploma Project</span>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Github size={16} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
