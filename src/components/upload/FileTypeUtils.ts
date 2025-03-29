
// File type utility functions for the file uploader

// Check if file types are allowed
export const getAllowedFileTypes = () => [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
  'application/pdf', 'text/plain', 'text/csv', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel' // xls
];

export const isFileTypeAllowed = (fileType: string): boolean => {
  return getAllowedFileTypes().includes(fileType);
};

export const getFileTypeCategory = (fileType: string): 'image' | 'document' => {
  return fileType.startsWith('image/') ? 'image' : 'document';
};

// Get appropriate icon based on file type
export const getFileIcon = (fileType?: string) => {
  if (!fileType) return 'upload';
  
  if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType.includes('pdf')) {
    return 'file-text';
  } else {
    return 'file';
  }
};

// Format file size in KB
export const formatFileSize = (sizeInBytes: number): string => {
  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
};

// File size validation
export const isFileSizeValid = (size: number): boolean => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  return size <= MAX_FILE_SIZE;
};
