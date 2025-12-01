'use client';

import React, { useRef, ChangeEvent } from 'react';
import { Camera, User } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onAvatarChange: (avatarDataUrl: string) => void;
  disabled?: boolean;
}

export default function AvatarUpload({
  currentAvatar,
  userName,
  onAvatarChange,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | undefined>(currentAvatar);

  React.useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    // Read file and convert to data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onAvatarChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div
          onClick={handleClick}
          className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ${
            !disabled ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {getInitials()}
            </div>
          )}
        </div>
        
        {!disabled && (
          <div
            onClick={handleClick}
            className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      {!disabled && (
        <p className="mt-2 text-sm text-gray-500">
          Click to upload new photo
        </p>
      )}
    </div>
  );
}
