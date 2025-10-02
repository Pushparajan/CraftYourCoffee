import { NextResponse } from "next/server"
import { generateDrinkImage, buildDrinkPrompt } from "@/lib/adobe-firefly"

export async function POST(request: Request) {
  try {
    const config = await request.json()

    // Build the prompt from the drink configuration
    const prompt = buildDrinkPrompt(config)
    console.log("[v0] Generated prompt:", prompt)

    // Generate the image using Adobe Firefly
    const imageUrl = await generateDrinkImage(prompt)

    return NextResponse.json({ imageUrl, prompt })
  } catch (error) {
    console.error("[v0] Error generating preview:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate preview image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
