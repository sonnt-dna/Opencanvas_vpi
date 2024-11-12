import { useState, useCallback } from 'react';

interface File {
  file_id: string;
  name: string;
}

export const useFiles = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dbPath = "../kotaemon/ktem_app_data/user_data/sql.db";
      const response = await fetch("http://localhost:5006/get-file-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ db_path: dbPath }),
      });

      const data = await response.json();
      
      if (Array.isArray(data.file_ids['index__1__source'])) {
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

  const selectFile = useCallback((file: File) => {
    setSelectedFiles(prev => {
      if (!prev.some(f => f.file_id === file.file_id)) {
        return [...prev, file];
      }
      return prev;
    });
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.file_id !== fileId));
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    files,
    selectedFiles,
    isLoading,
    error,
    fetchFiles,
    selectFile,
    removeFile,
    clearSelectedFiles
  };
};
