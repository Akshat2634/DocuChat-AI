import { type NextRequest, NextResponse } from "next/server"

const mockResponses = [
  "Based on your documents, I can see that this topic is covered in detail. Let me provide you with a comprehensive answer...",
  "According to the information in your uploaded files, here's what I found...",
  "I've analyzed your documents and found several relevant points about this question...",
  "From the content you've shared, I can extract the following key insights...",
  "Your documents contain valuable information about this topic. Here's a summary...",
]

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { message } = await request.json()

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock AI response
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    const response = `${randomResponse}\n\nYou asked: "${message}"\n\nThis is a mock response demonstrating the chat functionality. In a real implementation, this would be processed by your AI backend service.`

    return NextResponse.json({
      success: true,
      message: "Response generated successfully",
      response: response,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process chat message",
      },
      { status: 500 },
    )
  }
}
