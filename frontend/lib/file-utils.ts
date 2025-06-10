export const SUPPORTED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "text/plain": ".txt",
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface FileWithPreview extends File {
  id: string
  preview?: string
}

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
    return { isValid: false, error: "Unsupported file type. Please upload PDF, DOCX, or TXT files." }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size exceeds 10MB limit." }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
