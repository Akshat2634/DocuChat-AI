import { ApiTest } from "@/components/api-test"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">API Integration Test</h1>
        </div>
      </header>
      <main className="container mx-auto">
        <ApiTest />
      </main>
    </div>
  )
} 