import React, { useState, useCallback } from 'react';
import { Upload, Image, X } from 'lucide-react';

interface UploadAreaProps {
  onImageUpload: (imageDataUrl: string) => void;
  currentImage?: string | null;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageUpload, currentImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onImageUpload('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {currentImage ? (
        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentImage}
              alt="已上传图片"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDragging ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
            }`}>
              {isDragging ? (
                <Image className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragging ? '松开鼠标上传图片' : '拖拽图片到此处'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                或点击选择文件
              </p>
            </div>
            <p className="text-xs text-gray-400">
              支持 JPG、PNG、GIF 格式，最大 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
