"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { VibrantButton } from "@/components/ui/vibrant-button"
import { VibrantCard } from "@/components/ui/vibrant-card"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { type FileWithPreview, validateFile, formatFileSize } from "@/lib/file-utils"
import { cn } from "@/lib/utils"

interface VibrantFileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  selectedFiles: FileWithPreview[]
  isUploading?: boolean
}

export function VibrantFileUpload({ onFilesSelected, selectedFiles, isUploading }: VibrantFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      const validFiles: FileWithPreview[] = []
      const newErrors: Record<string, string> = {}

      // Handle rejected files
      rejectedFiles.forEach((rejection) => {
        const fileId = crypto.randomUUID()
        newErrors[fileId] = rejection.errors[0]?.message || "Invalid file"
      })

      // Handle accepted files
      acceptedFiles.forEach((file) => {
        const validation = validateFile(file)
        if (validation.isValid) {
          const fileWithPreview: FileWithPreview = Object.assign(file, {
            id: crypto.randomUUID(),
          })
          validFiles.push(fileWithPreview)
        } else {
          const fileId = crypto.randomUUID()
          newErrors[fileId] = validation.error || "Invalid file"
        }
      })

      setErrors(newErrors)
      if (validFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...validFiles])
      }

      // Clear errors after 5 seconds
      setTimeout(() => setErrors({}), 5000)
    },
    [selectedFiles, onFilesSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    disabled: isUploading,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    onFilesSelected(selectedFiles.filter((file) => file.id !== fileId))
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes("pdf")) return "text-vibrant-orange"
    if (fileType.includes("docx")) return "text-vibrant-blue"
    if (fileType.includes("txt")) return "text-vibrant-teal"
    return "text-muted-foreground"
  }

  const getFileTypeIcon = (fileType: string) => {
    // You could use specific icons for each file type here
    return <File className={cn("h-5 w-5 flex-shrink-0", getFileTypeColor(fileType))} />
  }

  return (
    <div className="space-y-6">
      <motion.div
        whileHover={{ scale: isUploading ? 1 : 1.02 }}
        whileTap={{ scale: isUploading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden",
            isDragActive
              ? "border-vibrant-purple bg-vibrant-purple/5 shadow-lg scale-105"
              : "border-muted-foreground/25 hover:border-vibrant-purple/50 hover:shadow-md",
            isUploading && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center relative z-10">
            <input {...getInputProps()} />

            <motion.div
              className={cn(
                "rounded-full p-6 mb-6 transition-all duration-300",
                isDragActive ? "bg-vibrant-purple/20" : "bg-muted",
              )}
              animate={{
                rotate: isDragActive ? [0, 360] : 0,
                scale: isDragActive ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 1.5, repeat: isDragActive ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
            >
              <Upload
                className={cn(
                  "h-10 w-10 transition-colors duration-300",
                  isDragActive ? "text-vibrant-purple" : "text-muted-foreground",
                )}
              />
            </motion.div>

            <motion.h3
              className={cn("text-xl font-semibold mb-3", isDragActive && "text-vibrant-purple")}
              animate={{ scale: isDragActive ? 1.05 : 1 }}
            >
              {isDragActive ? "Drop files here" : "Upload your documents"}
            </motion.h3>

            <p className="text-muted-foreground mb-4 max-w-md">
              Drag and drop your files here, or click to browse your device
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-vibrant-orange/10 text-vibrant-orange rounded-full">PDF</span>
              <span className="px-3 py-1 bg-vibrant-blue/10 text-vibrant-blue rounded-full">DOCX</span>
              <span className="px-3 py-1 bg-vibrant-teal/10 text-vibrant-teal rounded-full">TXT</span>
              <span className="px-3 py-1 bg-muted rounded-full">Up to 10MB</span>
            </div>
          </div>

          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-vibrant-purple/10 to-transparent opacity-0"
            animate={{ opacity: isDragActive ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Animated border glow */}
          {isDragActive && (
            <motion.div
              className="absolute inset-0 -z-10"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(139,92,246,0)",
                  "0 0 20px rgba(139,92,246,0.3)",
                  "0 0 0px rgba(139,92,246,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
        </div>
      </motion.div>

      {/* Error messages */}
      <AnimatePresence>
        {Object.entries(errors).map(([id, error]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-2 rounded-md"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Selected files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-sm flex items-center">
              <span className="text-vibrant-purple mr-2">Selected Files</span>
              <span className="bg-vibrant-purple/10 text-vibrant-purple text-xs px-2 py-0.5 rounded-full">
                {selectedFiles.length}
              </span>
            </h4>

            {selectedFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <VibrantCard
                  variant={file.type.includes("pdf") ? "orange" : file.type.includes("docx") ? "blue" : "teal"}
                  className="p-3 hover:shadow-md transition-shadow"
                  hoverEffect={false}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
                        {getFileTypeIcon(file.type)}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-vibrant-green"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                    {!isUploading && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <VibrantButton
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </VibrantButton>
                      </motion.div>
                    )}
                  </div>
                </VibrantCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
