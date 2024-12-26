import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  onUpload,
  value,
}: {
  onChange?: (files: File[]) => void;
  onUpload?: (url: string) => void;
  value?: string;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(value || null);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set initial preview if value exists
    if (value) {
      setPreview(value);
      setUploadedUrl(value);
    }
  }, [value]);

  // Cleanup preview URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (preview && preview !== value && !preview.startsWith('http')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, value]);

  const handleFileChange = async (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert("Ukuran file tidak boleh lebih dari 2MB");
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert("Hanya file gambar yang diperbolehkan");
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      try {
        // Create preview URL for the new file
        const fileUrl = URL.createObjectURL(validFiles[0]);
        
        // Prepare form data
        const formData = new FormData();
        formData.append('file', validFiles[0]);
        formData.append('pathname', `uploads/${Date.now()}-${validFiles[0].name}`);
        
        // If there's an existing uploaded URL, include it for deletion
        if (uploadedUrl) {
          formData.append('oldUrl', uploadedUrl);
        }

        // Upload the file
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();

        // Cleanup old preview URL if it's not the initial value
        if (preview && preview !== value && !preview.startsWith('http')) {
          URL.revokeObjectURL(preview);
        }

        setFiles(validFiles);
        setPreview(fileUrl);
        setUploadedUrl(data.url);
        onChange && onChange(validFiles);
        onUpload && onUpload(data.url);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Gagal mengupload file. Silakan coba lagi.');
      }
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedUrl) return;

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: uploadedUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Cleanup preview URL if it's not the initial value
      if (preview && preview !== value && !preview.startsWith('http')) {
        URL.revokeObjectURL(preview);
      }

      setFiles([]);
      setPreview(null);
      setUploadedUrl(null);
      onChange && onChange([]);
      onUpload && onUpload('');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Gagal menghapus file. Silakan coba lagi.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-secondary text-base">
            Upload Gambar
          </p>
          <p className="relative z-20 font-sans font-normal text-secondary-foreground/70 text-base mt-2">
            Upload bukti pembayaran di sini
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-card flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm border border-secondary/20 hover:border-secondary/40 transition-colors"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm bg-secondary/10 text-secondary shadow-input"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-secondary/10 text-secondary"
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {preview && (
              <div className="mb-4 relative w-full max-w-xs mx-auto group">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconX className="h-4 w-4" />
                </button>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <p className="text-white text-sm">Klik untuk mengganti gambar</p>
                </div>
              </div>
            )}
            {!files.length && !preview && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-card flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)] border-2 border-dashed border-secondary/30 hover:border-secondary/60 transition-colors"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-accent flex flex-col items-center font-medium"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-accent animate-bounce" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-secondary group-hover/file:text-accent transition-colors" />
                )}
              </motion.div>
            )}

            {!files.length && !preview && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border-2 border-dashed border-accent inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-secondary/5 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-secondary/5"
                  : "bg-secondary/5 shadow-[0px_0px_1px_3px_hsl(var(--secondary))_inset] opacity-30"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
