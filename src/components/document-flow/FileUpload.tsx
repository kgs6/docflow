"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesChange: (files: { name: string; url: string }[]) => void;
  maxFiles?: number;
}

interface UploadedFile {
  name: string;
  url: string;
}

export function FileUpload({ onFilesChange, maxFiles = 5 }: FileUploadProps) {
  const [files, setFiles] = useState<(UploadedFile & { size?: number })[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      const newFiles = data.files.map((file: UploadedFile, index: number) => ({
        name: file.name,
        url: file.url,
        size: acceptedFiles[index].size
      }));

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles.map(f => ({ name: f.name, url: f.url })));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Ошибка при загрузке файлов");
    } finally {
      setIsUploading(false);
    }
  }, [files, maxFiles, onFilesChange]);

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => ({ name: f.name, url: f.url })));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
          {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {isDragActive ? "Сбросьте файлы здесь" : "Нажмите или перетащите файлы"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, DOCX, PNG до 10MB (макс. {maxFiles})
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-1"
            >
              <div className="flex items-center gap-3 min-w-0">
                <File className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                  {file.size && (
                    <span className="text-[10px] text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
