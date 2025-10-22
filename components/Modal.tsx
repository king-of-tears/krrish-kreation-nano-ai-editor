import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-gray-800/80 border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 text-white transform animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-2xl font-bold mb-4">{title}</h2>
        <div className="text-gray-300 mb-6">
          {children}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-100"
          aria-label="Close modal"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

// Add animations for the modal
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-fast {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes slide-in-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .animate-fade-in-fast {
    animation: fade-in-fast 0.3s ease-out forwards;
  }
  .animate-slide-in-up {
    animation: slide-in-up 0.4s ease-out forwards;
  }
`;
document.head.appendChild(style);
