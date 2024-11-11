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

interface FileIdRow {
  file_id: string;
}
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
  const [files, setFiles] = useState<{ file_id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchFiles = useCallback(async () => {
    console.log("1. Starting fetch files");
    setIsLoading(true);
    setError(null);
    
    try {
      const dbPath = "../kotaemon/ktem_app_data/user_data/sql.db";
      const url = "http://localhost:5006/get-file-ids";
      
      console.log("2. Making API call to:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ db_path: dbPath }),
      });

      console.log("3. API Response status:", response.status);
      const data = await response.json();
      console.log("4. API Response data:", data.file_ids['index__1__source']);
      
      if (Array.isArray(data.file_ids['index__1__source'])) {
        console.log("5. Setting files:",data.file_ids['index__1__source']);
        setFiles(data.file_ids['index__1__source'].map((item: [string, string]) => ({
          file_id: item[0],
          name: item[1],
        })));
      } else {
        setError("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch files");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

      <ComposerPrimitive.Input
        autoFocus
        placeholder="Write a message..."
        rows={1}
        className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) {
                console.log("Menu opened");
                handleFetchFiles();
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
                  console.log("file", file),
                  <DropdownMenuItem key={index} className="flex items-center gap-2 py-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      F
                    </div>
                    {/* <span className="text-sm truncate">{file.file_id}</span> */}
                    <span className="text-xs text-gray-500">{file.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="py-2 text-center text-sm text-gray-500">No files found</div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
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