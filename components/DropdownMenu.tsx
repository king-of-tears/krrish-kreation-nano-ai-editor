import React, { useEffect, useRef } from 'react';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, children }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClass = 'left-0';

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full mt-2 w-56 bg-gray-800/80 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-xl z-50 animate-fade-in-fast ${sideClass}`}
      role="menu"
    >
      <ul className="p-2 space-y-1">
        {children}
      </ul>
    </div>
  );
};


const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-fast {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);