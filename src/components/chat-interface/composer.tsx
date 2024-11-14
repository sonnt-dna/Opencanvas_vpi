"use client";

import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { type FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { SendHorizontalIcon, UploadIcon, FileIcon, CircleStopIcon } from "lucide-react";
import { useFiles } from '@/hooks/useFiles';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Thêm constant cho cookie name
const FILE_IDS_COOKIE = "file_ids";

// Thêm hàm này trước component Composer
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

// Và thêm hàm setCookie để sử dụng cùng
function setCookie(name: string, value: string, options: { expires?: number } = {}) {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.expires) {
    const d = new Date();
    d.setTime(d.getTime() + (options.expires * 24 * 60 * 60 * 1000));
    cookie += `;expires=${d.toUTCString()}`;
  }
  document.cookie = cookie + ";path=/";
}

export const Composer: FC = () => {
  const [cleanedHtml, setCleanedHtml] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const {
    files,
    selectedFiles,
    isLoading,
    fetchFiles,
    selectFile,
    removeFile,
    clearSelectedFiles
  } = useFiles();

  // Load file IDs from cookies when component mounts
  useEffect(() => {
    const savedFileIds = getCookie(FILE_IDS_COOKIE);
    if (savedFileIds) {
      const fileIds = JSON.parse(savedFileIds);
      fileIds.forEach((fileId: string) => {
        const file = files.find(f => f.file_id === fileId);
        if (file) {
          selectFile(file);
        }
      });
    }
  }, [files]);

  // Save file IDs to cookies whenever selectedFiles changes
  useEffect(() => {
    const fileIds = selectedFiles.map(file => file.file_id);
    setCookie(FILE_IDS_COOKIE, JSON.stringify(fileIds), {
      expires: 7 // Lưu trong 7 ngày
    });
  }, [selectedFiles]);

  const handleFileSelect = async (file: any) => {
    console.log('File selected:', file);
    selectFile(file);
    
    try {
      const fileIds = [file.file_id];
      console.log('Selected file ID:', fileIds);
 
      const response = await fetch('http://localhost:5006/getfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file_ids: fileIds })
      });
 
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Cleaned HTML:', data.cleaned_html);
        setCleanedHtml(data.cleaned_html);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData.error || 'Không xác định');
      }
    } catch (error) {
      console.error('Error details:', error);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    removeFile(fileId);
    // Cập nhật lại cookies khi xóa file
    const currentFileIds = JSON.parse(getCookie(FILE_IDS_COOKIE) || '[]');
    const newFileIds = currentFileIds.filter((id: string) => id !== fileId);
    setCookie(FILE_IDS_COOKIE, JSON.stringify(newFileIds), {
      expires: 7
    });
  };

  return (
    <ComposerPrimitive.Root className="focus-within:border-aui-ring/20 flex w-full min-h-[64px] flex-wrap items-center rounded-lg border px-2.5 shadow-sm transition-colors ease-in bg-white">
      <TooltipIconButton
        tooltip="Upload"
        variant="ghost"
        className="my-2.5 size-8 p-2 transition-opacity ease-in"
        onClick={() => window.open('http://127.0.0.1:7860/', '_blank')}
      >
        <UploadIcon className="text-green-500" />
      </TooltipIconButton>
 
      <div className="flex flex-wrap gap-2 mx-2">
        {selectedFiles.map((file) => (
          <div
            key={file.file_id}
            className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 text-xs"
          >
            <span className="text-gray-600">{file.name}</span>
            <button
              onClick={() => removeFile(file.file_id)}
              className="text-gray-400 hover:text-gray-600 ml-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
 
      <ComposerPrimitive.Input
        autoFocus
        placeholder="Write a message..."
        rows={1}
        className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            fetchFiles();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <TooltipIconButton
            tooltip="Select file(s) for conversation"
            variant="ghost"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
          >
            <FileIcon className="h-4 w-4" />
          </TooltipIconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          <div className="p-2 space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" className="w-full text-sm">Search All</Button>
              <Button variant="default" className="w-full text-sm">Search In File(s)</Button>
            </div>
            {isLoading ? (
              <div className="py-2 text-center text-sm text-gray-500">Loading...</div>
            ) : files.length > 0 ? (
              <div className="max-h-[200px] overflow-y-auto">
                {files.map((file, index) => (
                  <DropdownMenuItem
                    key={index}
                    className={`flex items-center gap-2 py-2 ${
                      selectedFiles.some(f => f.file_id === file.file_id)
                        ? 'bg-gray-100'
                        : ''
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      F
                    </div>
                    <span className="text-xs text-gray-500">{file.name}</span>
                    {selectedFiles.some(f => f.file_id === file.file_id) && (
                      <span className="ml-auto text-green-500">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="py-2 text-center text-sm text-gray-500">No files found</div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
 
      <Button
        variant="default"
        className="my-2.5 size-8 p-2"
        onClick={() => {
          console.log('Button clicked!');
          const messageInput = document.querySelector('.composer-root textarea');
          const message = (messageInput as HTMLTextAreaElement)?.value?.trim() || '';
          console.log('Message:', message);
          if (messageInput) {
            (messageInput as HTMLTextAreaElement).value = '';
          }
        }}
      >
        <SendHorizontalIcon />
      </Button>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
};