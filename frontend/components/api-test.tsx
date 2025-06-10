"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  checkBackendHealth, 
  getApiInfo, 
  generateUserId, 
  sendChatMessage, 
  uploadDocuments,
  type HealthCheckResponse,
  type ApiInfoResponse 
} from "@/lib/api"

export function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null)
  const [apiInfo, setApiInfo] = useState<ApiInfoResponse | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [chatMessage, setChatMessage] = useState<string>("")
  const [chatResponse, setChatResponse] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Generate a user ID on component mount
    setUserId(generateUserId())
    
    // Check backend health on mount
    checkHealth()
    loadApiInfo()
  }, [])

  const checkHealth = async () => {
    const health = await checkBackendHealth()
    setHealthStatus(health)
  }

  const loadApiInfo = async () => {
    const info = await getApiInfo()
    setApiInfo(info)
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return
    
    setLoading(true)
    try {
      const result = await sendChatMessage(chatMessage, userId)
      setChatResponse(result.success ? result.response || "No response" : result.message)
    } catch (error) {
      setChatResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setLoading(true)
    try {
      const result = await uploadDocuments(files, userId)
      setChatResponse(`Upload result: ${result.message}`)
    } catch (error) {
      setChatResponse(`Upload error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Integration Test</CardTitle>
          <CardDescription>Test the connection between frontend and backend APIs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Status */}
          <div className="flex items-center gap-2">
            <span>Backend Health:</span>
            <Badge variant={healthStatus?.status === "ok" ? "default" : "destructive"}>
              {healthStatus?.status || "Unknown"}
            </Badge>
            <Button variant="outline" size="sm" onClick={checkHealth}>
              Refresh
            </Button>
          </div>

          {/* User ID */}
          <div className="flex items-center gap-2">
            <span>User ID:</span>
            <code className="px-2 py-1 bg-muted rounded text-sm">{userId}</code>
            <Button variant="outline" size="sm" onClick={() => setUserId(generateUserId())}>
              Generate New
            </Button>
          </div>

          {/* API Info */}
          {apiInfo && (
            <div className="space-y-2">
              <h4 className="font-semibold">API Information:</h4>
              <p className="text-sm text-muted-foreground">{apiInfo.description}</p>
              <p className="text-sm">Version: {apiInfo.version}</p>
            </div>
          )}

          {/* Chat Test */}
          <div className="space-y-2">
            <h4 className="font-semibold">Chat Test:</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a message to test chat..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>

          {/* File Upload Test */}
          <div className="space-y-2">
            <h4 className="font-semibold">Document Upload Test:</h4>
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={loading}
              accept=".txt,.pdf,.doc,.docx"
            />
          </div>

          {/* Response Display */}
          {chatResponse && (
            <div className="space-y-2">
              <h4 className="font-semibold">Response:</h4>
              <div className="p-3 bg-muted rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{chatResponse}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 