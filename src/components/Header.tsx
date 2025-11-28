import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-[#4F46E5]">Adaptive Study Guide Master</h1>
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-600 hover:text-[#4F46E5] transition duration-150"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
