// Adobe Firefly API integration utilities

type AdobeCredentials = {
  ORG_ID: string
  CLIENT_ID: string
  CLIENT_SECRETS: string[]
  TECHNICAL_ACCOUNT_ID: string
  TECHNICAL_ACCOUNT_EMAIL: string
  SCOPES: string[]
}

const credentials: AdobeCredentials = {
  ORG_ID: "9D6FC4045823262D0A495CC8@AdobeOrg",
  CLIENT_ID: "26e4ebed633e40a0b08a3479954b6403",
  CLIENT_SECRETS: ["p8e-RKatSGX7Ed03IU3qewdiQdxLW_PaVYuk"],
  TECHNICAL_ACCOUNT_ID: "F027223168DAD9A90A495C8A@techacct.adobe.com",
  TECHNICAL_ACCOUNT_EMAIL: "2a1f8f1d-5631-4364-884c-3d19d7cf5f7a@techacct.adobe.com",
  SCOPES: ["openid", "AdobeID", "firefly_api", "ff_apis"],
}

export async function getAccessToken(): Promise<string> {
  try {
    const response = await fetch("https://ims-na1.adobelogin.com/ims/token/v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: credentials.CLIENT_ID,
        client_secret: credentials.CLIENT_SECRETS[0],
        scope: credentials.SCOPES.join(","),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Adobe IMS error response:", errorText)
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("[v0] Error getting Adobe access token:", error)
    throw error
  }
}

export async function generateDrinkImage(prompt: string): Promise<string> {
  try {
    console.log("[v0] Getting Adobe access token...")
    const accessToken = await getAccessToken()
    console.log("[v0] Access token obtained successfully")

    const requestBody = {
      prompt,
      numVariations: 1,
      size: {
        width: 1024,
        height: 1024,
      },
      style: {
        presets: ["photo"],
      },
    }

    console.log("[v0] Sending request to Firefly API with body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch("https://firefly-api.adobe.io/v3/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": credentials.CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Firefly API response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Firefly API error response:", errorText)
      throw new Error(`Firefly API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Firefly API response data:", JSON.stringify(data, null, 2))

    if (data.outputs && data.outputs.length > 0) {
      const imageUrl = data.outputs[0].image.url
      console.log("[v0] Image generated successfully:", imageUrl)
      return imageUrl
    }

    throw new Error("No image generated in response")
  } catch (error) {
    console.error("[v0] Error generating drink image:", error)
    throw error
  }
}

export function buildDrinkPrompt(config: any): string {
  const parts = []

  // Base description
  if (config.base) {
    parts.push(
      `A professional photograph of a ${config.temperature?.toLowerCase() || "iced"} ${config.base.toLowerCase()} drink`,
    )
  }

  // Size and container
  if (config.size) {
    parts.push(`in a ${config.size.toLowerCase()} clear glass cup`)
  }

  // Milk
  if (config.milk) {
    parts.push(`made with ${config.milk.toLowerCase()}`)
  }

  // Syrups
  if (config.syrups && config.syrups.length > 0) {
    const syrupNames = config.syrups.map((s: any) => s.name.toLowerCase()).join(" and ")
    parts.push(`flavored with ${syrupNames} syrup`)
  }

  // Toppings
  if (config.toppings && config.toppings.length > 0) {
    const toppingNames = config.toppings.map((t: string) => t.toLowerCase()).join(" and ")
    parts.push(`topped with ${toppingNames}`)
  }

  // Ice level
  if (config.ice && config.ice !== "regular") {
    parts.push(`with ${config.ice} ice`)
  }

  // Style
  parts.push("studio lighting, high quality, appetizing, professional beverage photography")

  return parts.join(", ")
}
