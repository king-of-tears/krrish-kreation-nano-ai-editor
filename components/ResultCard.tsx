import React from 'react';
import type { VideoInfo } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultCardProps {
  info: VideoInfo;
  onDownloadClick: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ info, onDownloadClick }) => {
  return (
    <div className="w-full bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex-shrink-0">
          <img 
            src={info.thumbnailUrl} 
            alt={info.title} 
            className="w-full h-auto object-cover rounded-lg shadow-lg aspect-video" 
          />
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{info.title}</h3>
          <div className="space-y-3">
            {info.downloadLinks.map((link) => (
              <button
                key={link.quality}
                onClick={onDownloadClick}
                className="group w-full flex items-center justify-between bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/50 p-3 rounded-lg transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/30 rounded-md">
                    <DownloadIcon className="w-5 h-5 text-purple-200" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Download</span>
                    <span className="text-sm text-purple-300 ml-2">{link.quality}</span>
                  </div>
                </div>
                <div className="text-sm font-mono text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                  {link.size}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add fade-in animation to tailwind config or a style tag if not using a JIT compiler
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;
document.head.appendChild(style);
