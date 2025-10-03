import { NextResponse } from "next/server"
import { generateDrinkImage, compositeLogoOnImage } from "@/lib/adobe-firefly"

export async function POST(request: Request) {
  try {
    const { prompt, negativePrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("[v0] Custom prompt:", prompt)
    console.log("[v0] Custom negative prompt:", negativePrompt)

    const baseImageUrl = await generateDrinkImage(prompt, negativePrompt)
    console.log("[v0] Base image generated:", baseImageUrl)

    const finalImageUrl = await compositeLogoOnImage(baseImageUrl)
    console.log("[v0] Final composited image:", finalImageUrl)

    return NextResponse.json({ imageUrl: finalImageUrl })
  } catch (error) {
    console.error("[v0] Error generating custom image:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
