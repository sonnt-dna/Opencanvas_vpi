"use client";

import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { type FC, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";  // hoặc icon tương tự từ thư viện của bạn
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { SendHorizontalIcon, PaperclipIcon } from "lucide-react";
import { FileIcon } from "lucide-react"; 

import { promisify } from 'util';
import { NextResponse } from 'next/server';
import { useFiles } from '@/hooks/useFiles';

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};

export const Composer: FC = () => {
  const {
    files,
    selectedFiles,
    isLoading,
    error,
    fetchFiles,
    selectFile,
    removeFile,
    clearSelectedFiles
  } = useFiles();

  useEffect(() => {
    if (selectedFiles.length > 0) {
      const selectedFileIds = selectedFiles.map(file => file.file_id);
      console.log('Selected file IDs:', selectedFileIds);
    }
  }, [selectedFiles]);

  const handleSend = useCallback(async (message: string) => {
    try {
      const fileIds = selectedFiles.map(file => file.file_id);
      console.log('Selected file IDs:', fileIds);

      const requestData = {
        data: [
          [
            message || "Cho tôi biết nội dung của file này",
            null
          ]
        ],
        fn_index: 0,
        file_ids: fileIds
      };
      
      console.log('Request data:', requestData);

      const response = await fetch('http://localhost:7860/chat_fn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('API Response:', result);

      clearSelectedFiles();
    } catch (error) {
      console.error('Error details:', error);
    }
  }, [selectedFiles, clearSelectedFiles]);

  const handleFileSelect = async (file: any) => {
    selectFile(file);
    
    try {
      const fileIds = [file.file_id];
      console.log('Selected file ID:', fileIds);

      const requestData = {
        data: [
          [
            "Cho tôi biết nội dung của file này",
            null,
          ],
          "select",
          fileIds
        ],
        fn_index: 0,
        session_hash: Math.random().toString(36).substring(7),
      };
      
      console.log('Request data:', requestData);

      const response = await fetch('http://localhost:7860/chat_fn/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Job started:', result);

      const pollResult = async (jobId: string) => {
        const statusResponse = await fetch(`http://localhost:7860/chat_fn/status/${jobId}`);
        const status = await statusResponse.json();
        
        if (status.done) {
          console.log('Final result:', status.outputs?.[status.outputs.length - 1]);
        } else {
          setTimeout(() => pollResult(jobId), 100); // Poll every 100ms
        }
      };

      if (result.job) {
        pollResult(result.job);
      }

    } catch (error) {
      console.error('Error:', error);
    }
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
          handleSend(message);
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