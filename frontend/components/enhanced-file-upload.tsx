"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { type FileWithPreview, validateFile, formatFileSize } from "@/lib/file-utils"
import { cn } from "@/lib/utils"

interface EnhancedFileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  selectedFiles: FileWithPreview[]
  isUploading?: boolean
}

export function EnhancedFileUpload({ onFilesSelected, selectedFiles, isUploading }: EnhancedFileUploadProps) {
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

  return (
    <div className="space-y-6">
      <motion.div
        whileHover={{ scale: isUploading ? 1 : 1.02 }}
        whileTap={{ scale: isUploading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed transition-all duration-300 cursor-pointer relative overflow-hidden",
            isDragActive
              ? "border-primary bg-primary/5 shadow-lg scale-105"
              : "border-muted-foreground/25 hover:border-primary/50 hover:shadow-md",
            isUploading && "opacity-50 cursor-not-allowed",
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center relative z-10">
            <input {...getInputProps()} />

            <motion.div
              className={cn(
                "rounded-full p-4 mb-4 transition-all duration-300",
                isDragActive ? "bg-primary/20 scale-110" : "bg-muted",
              )}
              animate={{
                rotate: isDragActive ? 360 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <Upload
                className={cn(
                  "h-8 w-8 transition-colors duration-300",
                  isDragActive ? "text-primary" : "text-muted-foreground",
                )}
              />
            </motion.div>

            <motion.h3 className="text-lg font-semibold mb-2" animate={{ scale: isDragActive ? 1.05 : 1 }}>
              {isDragActive ? "Drop files here" : "Upload your documents"}
            </motion.h3>

            <p className="text-muted-foreground mb-4">Drag and drop your files here, or click to browse</p>
            <p className="text-sm text-muted-foreground">Supports PDF, DOCX, and TXT files up to 10MB each</p>
          </CardContent>

          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0"
            animate={{ opacity: isDragActive ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </Card>
      </motion.div>

      {/* Error messages */}
      <AnimatePresence>
        {Object.entries(errors).map(([id, error]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-destructive text-sm"
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
            <h4 className="font-medium text-sm text-muted-foreground">Selected Files ({selectedFiles.length})</h4>

            {selectedFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
                        <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </motion.div>
                    </div>
                    {!isUploading && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="ml-2 h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
