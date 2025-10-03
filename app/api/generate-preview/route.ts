import { NextResponse } from "next/server"
import { generateDrinkImage, buildDrinkPrompt, compositeLogoOnImage } from "@/lib/adobe-firefly"

export async function POST(request: Request) {
  try {
    const config = await request.json()

    const { prompt, negativePrompt } = buildDrinkPrompt(config)
    console.log("[v0] Generated prompt:", prompt)
    console.log("[v0] Generated negative prompt:", negativePrompt)

    const baseImageUrl = await generateDrinkImage(prompt, negativePrompt)
    console.log("[v0] Base image generated:", baseImageUrl)

    const finalImageUrl = await compositeLogoOnImage(baseImageUrl)
    console.log("[v0] Final composited image:", finalImageUrl)

    return NextResponse.json({
      imageUrl: finalImageUrl,
      prompt,
      negativePrompt,
    })
  } catch (error) {
    console.error("[v0] Error generating preview:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate preview image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
