import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { aroma, flavor, acidity, body: bodyPref, aftertaste } = body

    // Insert or update user preferences
    await sql`
      INSERT INTO user_preferences (
        user_id,
        aroma_preference,
        flavor_preference,
        acidity_preference,
        body_preference,
        aftertaste_preference,
        updated_at
      ) VALUES (
        NULL,
        ${aroma},
        ${flavor},
        ${acidity},
        ${bodyPref},
        ${aftertaste},
        NOW()
      )
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error saving preferences:", error)
    return Response.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const preferences = await sql`
      SELECT * FROM user_preferences
      ORDER BY created_at DESC
      LIMIT 1
    `

    return Response.json(preferences[0] || null)
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return Response.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}
