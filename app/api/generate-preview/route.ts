import { NextResponse } from "next/server"
import { generateDrinkImage, buildDrinkPrompt, compositeLogoOnImage } from "@/lib/adobe-firefly"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const config = await request.json()

    const [bases, milks, syrups, toppings] = await Promise.all([
      sql`SELECT name FROM bases WHERE is_active = true`,
      sql`SELECT name FROM milks`,
      sql`SELECT name FROM syrups`,
      sql`SELECT name FROM toppings`,
    ])

    const allProducts = {
      bases: bases.map((b: any) => b.name),
      milks: milks.map((m: any) => m.name),
      syrups: syrups.map((s: any) => s.name),
      toppings: toppings.map((t: any) => t.name),
    }

    console.log("[v0] Available products for negative prompts:", allProducts)

    const { prompt, negativePrompt } = buildDrinkPrompt(config, allProducts)
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
