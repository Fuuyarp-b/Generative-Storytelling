import React from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-32 
          border-2 border-gray-300 border-dashed rounded-lg 
          cursor-pointer bg-gray-50 hover:bg-gray-100 
          transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
          </p>
          <p className="text-xs text-gray-500">CSV (Max 10MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv" 
          onChange={handleChange} 
          disabled={disabled}
        />
      </label>
    </div>
  );
};