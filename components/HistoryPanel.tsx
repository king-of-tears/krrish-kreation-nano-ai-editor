import React from 'react';
// FIX: Correctly import EditTurn type from types.ts
import type { EditTurn } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: EditTurn[];
  onItemClick: (index: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onItemClick }) => {

  return (
    <div 
      className={`fixed inset-0 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div
        className="relative w-80 max-w-[90vw] h-full bg-gray-950 border-r border-purple-500/20 shadow-xl flex flex-col transform transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-purple-500/20">
          <h2 className="text-xl font-bold text-white">Edit History</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-purple-500/10 hover:text-white transition-colors"
            aria-label="Close history panel"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <ul className="flex-grow overflow-y-auto p-2 space-y-2">
          {history.length > 0 ? (
            history.map((turn, index) => (
              <li key={turn.id}>
                <button
                  onClick={() => onItemClick(index)}
                  className="w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-gray-800/50 transition-colors"
                >
                  <img src={turn.editedUrl} alt={`Edit: ${turn.prompt}`} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                  <p className="text-sm text-slate-300 line-clamp-3 leading-snug">{turn.prompt}</p>
                </button>
              </li>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 px-4">
                <p>Your edit history will appear here.</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
`;
document.head.appendChild(style);