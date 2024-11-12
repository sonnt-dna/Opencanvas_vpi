'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FileContentContextType {
  fileContent: string;
  updateFileContent: (content: string) => void;
}

const FileContentContext = createContext<FileContentContextType>({
  fileContent: '',
  updateFileContent: () => {},
});

export function FileContentProvider({ children }: { children: ReactNode }) {
  const [fileContent, setFileContent] = useState('');

  const updateFileContent = (content: string) => {
    setFileContent(content);
  };

  return (
    <FileContentContext.Provider value={{ fileContent, updateFileContent }}>
      {children}
    </FileContentContext.Provider>
  );
}

export const useFileContent = () => useContext(FileContentContext); 