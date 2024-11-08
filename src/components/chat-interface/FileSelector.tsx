// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button } from "@/components/ui/button";

// interface FileSelectorProps {
//   onSelect: (fileIds: string[]) => void;
// }

// const FileSelector: React.FC<FileSelectorProps> = ({ onSelect }) => {
//   const [fileIds, setFileIds] = useState<string[]>([]);
//   const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

//   useEffect(() => {
//     // Lấy danh sách file_ids từ API Next.js
//     axios.get('/api/file_ids')
//       .then(response => {
//         setFileIds(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching file IDs:', error);
//       });
//   }, []);

//   const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value, checked } = event.target;
//     if (checked) {
//       setSelectedFileIds(prev => [...prev, value]);
//     } else {
//       setSelectedFileIds(prev => prev.filter(id => id !== value));
//     }
//   };

//   const handleSubmit = () => {
//     onSelect(selectedFileIds);
//   };

//   return (
//     <div>
//       <h2>Chọn File IDs</h2>
//       <div className="file-list">
//         {fileIds.map(fileId => (
//           <div key={fileId}>
//             <label>
//               <input
//                 type="checkbox"
//                 value={fileId}
//                 checked={selectedFileIds.includes(fileId)}
//                 onChange={handleCheckboxChange}
//               />
//               {fileId}
//             </label>
//           </div>
//         ))}
//       </div>
//       <Button onClick={handleSubmit}>Submit</Button>
//     </div>
//   );
// };

// export default FileSelector; 
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface FileSelectorProps {
  onSelect: (selectedFileIds: string[]) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onSelect }) => {
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  useEffect(() => {
    setFileIds(["file1", "file2", "file3"]);
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileId = event.target.value;
    setSelectedFileIds((prev) =>
      event.target.checked ? [...prev, fileId] : prev.filter((id) => id !== fileId)
    );
  };

  const handleSubmit = () => {
    onSelect(selectedFileIds);
  };

  return (
    <div>
      <h2>Select File IDs</h2>
      <div className="file-list">
        {fileIds.map((fileId) => (
          <div key={fileId}>
            <label>
              <input
                type="checkbox"
                value={fileId}
                onChange={handleCheckboxChange}
              />
              {fileId}
            </label>
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default FileSelector;
