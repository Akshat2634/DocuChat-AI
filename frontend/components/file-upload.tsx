"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, CheckCircle } from "lucide-react"
import { type FileWithPreview, validateFile, formatFileSize } from "@/lib/file-utils"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  selectedFiles: FileWithPreview[]
  isUploading?: boolean
}

export function FileUpload({ onFilesSelected, selectedFiles, isUploading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles: FileWithPreview[] = []

      acceptedFiles.forEach((file) => {
        const validation = validateFile(file)
        if (validation.isValid) {
          const fileWithPreview: FileWithPreview = Object.assign(file, {
            id: crypto.randomUUID(),
          })
          validFiles.push(fileWithPreview)
        }
      })

      if (validFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...validFiles])
      }
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
  })

  const removeFile = (fileId: string) => {
    onFilesSelected(selectedFiles.filter((file) => file.id !== fileId))
  }

  return (
    <div className="space-y-6">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <input {...getInputProps()} />
          <div className={cn("rounded-full p-4 mb-4 transition-colors", isDragActive ? "bg-primary/10" : "bg-muted")}>
            <Upload
              className={cn("h-8 w-8 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")}
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">{isDragActive ? "Drop files here" : "Upload your documents"}</h3>
          <p className="text-muted-foreground mb-4">Drag and drop your files here, or click to browse</p>
          <p className="text-sm text-muted-foreground">Supports PDF, DOCX, and TXT files up to 10MB each</p>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Selected Files ({selectedFiles.length})</h4>
          {selectedFiles.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="ml-2 h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
