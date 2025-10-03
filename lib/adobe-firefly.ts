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

export async function generateDrinkImage(prompt: string, negativePrompt?: string): Promise<string> {
  try {
    console.log("[v0] Getting Adobe access token...")
    const accessToken = await getAccessToken()
    console.log("[v0] Access token obtained successfully")

    const requestBody: any = {
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

    // Add negative prompt if provided
    if (negativePrompt) {
      requestBody.negativePrompt = negativePrompt
      console.log("[v0] Using negative prompt:", negativePrompt)
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

export async function compositeLogoOnImage(sourceImageUrl: string): Promise<string> {
  try {
    const logoUrl =
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png"

    console.log("[v0] Starting Object Composite API call with logo URL:", logoUrl)
    const accessToken = await getAccessToken()

    const requestBody = {
      prompt: "Place the Starbucks logo on the center of the transparent cup, visible and prominent on the cup surface",
      image: {
        source: {
          url: sourceImageUrl,
        },
      },
      object: {
        source: {
          url: logoUrl, // Using URL instead of uploadId
        },
      },
      placement: {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        inset: {
          top: 200,
          bottom: 200,
          left: 200,
          right: 200,
        },
      },
    }

    console.log("[v0] Sending Object Composite request:", JSON.stringify(requestBody, null, 2))

    const response = await fetch("https://firefly-api.adobe.io/v3/images/generate-object-composite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": credentials.CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Object Composite API response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Object Composite API error response:", errorText)
      throw new Error(`Object Composite API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Object Composite API response data:", JSON.stringify(data, null, 2))

    if (data.outputs && data.outputs.length > 0) {
      const compositedImageUrl = data.outputs[0].image.url
      console.log("[v0] Logo composited successfully:", compositedImageUrl)
      return compositedImageUrl
    }

    throw new Error("No composited image in response")
  } catch (error) {
    console.error("[v0] Error compositing logo:", error)
    // Return original image if compositing fails
    return sourceImageUrl
  }
}

export function buildDrinkPrompt(config: any): { prompt: string; negativePrompt: string } {
  const parts = []
  const excludeParts = []

  // Determine if drink is cold
  const isCold = config.temperature?.toLowerCase() === "iced" || config.temperature?.toLowerCase() === "blended"
  const isHot = config.temperature?.toLowerCase() === "hot"

  const hasMilk = config.milk && config.milk.length > 0
  const hasSyrups = config.syrups && config.syrups.length > 0
  const hasToppings = config.toppings && config.toppings.length > 0
  const hasAdditions = hasMilk || hasSyrups || hasToppings

  const hasIce = isCold && config.ice && config.ice.toLowerCase() !== "none" && config.ice.toLowerCase() !== ""

  if (config.base) {
    if (hasAdditions) {
      parts.push(
        `A professional photograph of a Starbucks ${config.temperature?.toLowerCase() || "hot"} drink with plain black ${config.base.toLowerCase()} as the base`,
      )
    } else {
      parts.push(
        `A professional photograph of a Starbucks ${config.temperature?.toLowerCase() || "hot"} black ${config.base.toLowerCase()} drink`,
      )
    }
  }

  if (config.size) {
    const sizeLower = config.size.toLowerCase()
    let cupDescription = ""

    switch (sizeLower) {
      case "short":
        cupDescription = "short cup (8 oz, 8.9 cm height, 6.4 cm diameter)"
        break
      case "tall":
        cupDescription = "tall cup (12 oz, 11.4 cm height, 8.4 cm diameter)"
        break
      case "grande":
        cupDescription = "grande cup (16 oz, 16 cm height, 9.2 cm diameter)"
        break
      case "venti":
        if (isCold) {
          cupDescription = "venti cold cup (24 oz, 18 cm height, 10 cm diameter)"
        } else {
          cupDescription = "venti hot cup (20 oz, 20 cm height, 9.2 cm diameter)"
        }
        break
      case "trenta":
        cupDescription = "trenta cold cup (31 oz, 20.3 cm height, 10.4 cm diameter)"
        break
      default:
        cupDescription = `${sizeLower} cup`
    }

    parts.push(
      `in a completely transparent clear plastic ${cupDescription} with smooth surface and the Starbucks logo, crystal clear see-through cup showing the drink's beautiful layers and rich colors`,
    )
  } else {
    parts.push(
      `in a completely transparent clear plastic cup with smooth surface and the Starbucks logo, crystal clear see-through cup showing the drink's beautiful layers and rich colors`,
    )
  }

  if (config.milk) {
    parts.push(`layered with ${config.milk.toLowerCase()}`)
  } else {
    excludeParts.push("milk", "cream", "dairy", "white layer", "foam", "froth", "steamed milk", "milk foam")
  }

  if (config.syrups && config.syrups.length > 0) {
    const syrupNames = config.syrups.map((s: any) => s.name.toLowerCase()).join(" and ")
    parts.push(`flavored with ${syrupNames} syrup`)
  } else {
    excludeParts.push("syrup", "flavoring", "sweetener")
  }

  if (config.toppings && config.toppings.length > 0) {
    const toppingNames = config.toppings.map((t: string) => t.toLowerCase()).join(" and ")
    parts.push(`topped with ${toppingNames}`)
  } else {
    excludeParts.push("whipped cream", "toppings", "drizzle", "caramel drizzle", "chocolate drizzle")
  }

  if (hasIce) {
    parts.push(`with ice cubes`)
  } else {
    excludeParts.push("ice cubes", "ice", "frozen", "icy")
  }

  if (config.espresso && config.espresso > 0) {
    parts.push(`with ${config.espresso} espresso shot${config.espresso > 1 ? "s" : ""}`)
  }

  parts.push(
    "side view, close-up product shot filling the entire frame, clean white background, bright studio lighting, high quality, appetizing, professional beverage photography, edge-to-edge composition, no extra space around cup",
  )

  // These were preventing proper logo compositing and background generation
  excludeParts.push(
    "paper cup",
    "cardboard sleeve",
    "opaque cup",
    "shadows",
    "frame",
    "border",
    "white frame",
    "extra space",
    "padding",
    "margin",
    "white space around cup",
    "centered with space",
    "top view",
    "bottom view",
    "overhead view",
    "bird's eye view",
  )

  return {
    prompt: parts.join(", "),
    negativePrompt: excludeParts.join(", "),
  }
}
