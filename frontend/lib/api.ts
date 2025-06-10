export interface UploadResponse {
  success: boolean
  message: string
  fileCount?: number
}

export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export interface ChatResponse {
  success: boolean
  message: string
  response?: string
}

export interface HealthCheckResponse {
  status: string
}

export interface ApiInfoResponse {
  message: string
  version: string
  description: string
  endpoints: Array<{
    path: string
    method: string
    description: string
  }>
}

export async function uploadDocuments(files: File[], userId: string): Promise<UploadResponse> {
  try {
    const results = []
    
    // Upload files one by one since backend expects single file
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file) // Backend expects "file" parameter
      
      const response = await fetch(`/api/upload-document/${userId}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`)
      }

      const result = await response.json()
      results.push(result)
    }

    return {
      success: true,
      message: `Successfully uploaded ${files.length} document(s)`,
      fileCount: files.length,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to upload documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export async function sendChatMessage(message: string, userId: string): Promise<ChatResponse> {
  try {
    // Backend expects query as a URL parameter, not in the body
    const response = await fetch(`/api/chat/${userId}?query=${encodeURIComponent(message)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Chat request failed")
    }

    const result = await response.json()
    
    // Extract and clean the response text
    let responseText = result.response || result.message || result
    
    // If it's still an object, stringify it, otherwise clean it
    if (typeof responseText === 'object') {
      responseText = JSON.stringify(responseText)
    }
    
    return {
      success: true,
      message: "Message sent successfully",
      response: cleanResponseText(responseText),
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export async function checkBackendHealth(): Promise<HealthCheckResponse | null> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Health check failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Backend health check failed:', error)
    return null
  }
}

export async function getApiInfo(): Promise<ApiInfoResponse | null> {
  try {
    const response = await fetch('/api/', {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('API info request failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get API info:', error)
    return null
  }
}

// Utility function to generate a UUID for user sessions
export function generateUserId(): string {
  return crypto.randomUUID()
}

// Utility function to validate UUID format  
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Utility function to clean response text by removing surrounding quotes
function cleanResponseText(text: string): string {
  if (typeof text !== 'string') return text
  
  // Remove surrounding quotes if they exist
  if ((text.startsWith('"') && text.endsWith('"')) || 
      (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1)
  }
  
  return text
}
