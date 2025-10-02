import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params

    // Validate the type parameter
    const validTypes = ["bases", "sizes", "milks", "syrups", "toppings", "temperatures"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid option type" }, { status: 400 })
    }

    const result = await sql`SELECT * FROM ${sql.unsafe(type)} ORDER BY name ASC`

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching options:", error)
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
  }
}
