import React from 'react';
import { MapPin, Save, X } from 'lucide-react';

interface HeaderProps {
  onSaveClick: () => void;
  onMapLocationClick: () => void;
  savedCount: number;
  showSavedView: boolean;
}

export function Header({ onSaveClick, onMapLocationClick, savedCount, showSavedView }: HeaderProps) {
  return (
    <header className="bg-cream border-b-2 border-ink shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <MapPin className="text-water" size={24} />
            <h1 className="text-2xl font-pixelify font-bold text-ink">
              Eda's Travel Guide
            </h1>
          Menopause icon, y age: 24, with "transition-end"" position, will handle)
          ```
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
