import { neon } from "@neondatabase/serverless"
import { rerankDocuments, buildPreferenceQuery, type CohereDocument } from "@/lib/cohere"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Get user preferences
    const preferences = await sql`
      SELECT * FROM user_preferences
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (!preferences[0]) {
      return Response.json({ error: "No preferences found. Please set preferences in Admin panel." }, { status: 400 })
    }

    // Get all indexed documents
    const documents = await sql`
      SELECT * FROM cohere_documents
    `

    if (documents.length === 0) {
      return Response.json({ error: "No documents indexed. Please train the index in Admin panel." }, { status: 400 })
    }

    // Build query from preferences
    const query = buildPreferenceQuery(preferences[0])

    // Convert to Cohere document format
    const cohereDocuments: CohereDocument[] = documents.map((doc: any) => ({
      id: doc.id,
      text: doc.text,
      type: doc.type,
      data: doc.data,
    }))

    // Rerank documents based on preferences
    const rankedResults = await rerankDocuments(query, cohereDocuments)

    // Select best options from each category
    const bestBase = rankedResults.find((r) => r.document.type === "base")
    const bestMilk = rankedResults.find((r) => r.document.type === "milk")
    const bestSyrups = rankedResults.filter((r) => r.document.type === "syrup").slice(0, 2) // Top 2 syrups
    const bestToppings = rankedResults.filter((r) => r.document.type === "topping").slice(0, 2) // Top 2 toppings

    // Get sizes and temperatures (not AI-selected, use defaults)
    const sizes = await sql`SELECT * FROM sizes ORDER BY volume_ml ASC`
    const temperatures = await sql`SELECT * FROM temperatures`
    const iceLevels = await sql`SELECT * FROM ice_levels`

    // Build drink configuration
    const drinkConfig = {
      base: bestBase?.document.data.name || "Coffee",
      size: sizes[1]?.name || "Grande", // Default to medium size
      milk: bestMilk?.document.data.name || "Whole Milk",
      syrups: bestSyrups.map((s) => ({
        name: s.document.data.name,
        pumps: 2,
      })),
      toppings: bestToppings.map((t) => t.document.data.name),
      temperature: temperatures[0]?.name || "Hot",
      sweetness: "medium",
      ice: "none",
      name: "AI Crafted Coffee",
    }

    const priceResponse = await fetch(
      new URL("/api/calculate-price", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drinkConfig),
      },
    )

    if (!priceResponse.ok) {
      console.error("Price calculation failed:", priceResponse.status, priceResponse.statusText)
      // Return recommendation without pricing if price calculation fails
      return Response.json({
        success: true,
        drinkConfig,
        pricing: {
          base: 0,
          size: 0,
          milk: 0,
          syrups: 0,
          toppings: 0,
          total: 0,
          loyaltyPoints: { base: 0, size: 0, milk: 0, syrups: 0, toppings: 0, total: 0 },
        },
        aiInsights: {
          baseScore: bestBase?.relevance_score || 0,
          milkScore: bestMilk?.relevance_score || 0,
          reasoning: `Selected based on your preferences for ${preferences[0].aroma_preference} aroma and ${preferences[0].flavor_preference} flavor.`,
        },
      })
    }

    const priceData = await priceResponse.json()

    return Response.json({
      success: true,
      drinkConfig,
      pricing: priceData,
      aiInsights: {
        baseScore: bestBase?.relevance_score || 0,
        milkScore: bestMilk?.relevance_score || 0,
        reasoning: `Selected based on your preferences for ${preferences[0].aroma_preference} aroma and ${preferences[0].flavor_preference} flavor.`,
      },
    })
  } catch (error) {
    console.error("Error generating AI recommendation:", error)
    return Response.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}
