"use client"

export function generateSessionId(): string {
  return crypto.randomUUID()
}

export function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = localStorage.getItem("docuchat-session-id")
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem("docuchat-session-id", sessionId)
  }
  return sessionId
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("docuchat-session-id")
  }
}
