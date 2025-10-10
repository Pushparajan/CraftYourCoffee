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
      prompt: "Emboss the Starbucks logo on the center of the cup surface with a raised 3D effect, making it appear naturally integrated and prominent on the cup",
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

export function buildDrinkPrompt(
  config: any,
  allProducts?: {
    bases?: string[]
    milks?: string[]
    syrups?: string[]
    toppings?: string[]
  },
): { prompt: string; negativePrompt: string } {
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

  if (config.size) {
    const sizeLower = config.size.toLowerCase()
    let cupDescription = ""

    switch (sizeLower) {
      case "short":
        cupDescription = isHot
          ? "short white paper cup with brown cardboard sleeve (8 oz, 8.9 cm height, 6.4 cm diameter)"
          : "short clear plastic cup (8 oz, 8.9 cm height, 6.4 cm diameter)"
        break
      case "tall":
        cupDescription = isHot
          ? "tall white paper cup with brown cardboard sleeve (12 oz, 11.4 cm height, 8.4 cm diameter)"
          : "tall clear plastic cup (12 oz, 11.4 cm height, 8.4 cm diameter)"
        break
      case "grande":
        cupDescription = isHot
          ? "grande white paper cup with brown cardboard sleeve (16 oz, 16 cm height, 9.2 cm diameter)"
          : "grande clear plastic cup (16 oz, 16 cm height, 9.2 cm diameter)"
        break
      case "venti":
        if (isCold) {
          cupDescription = "venti clear plastic cold cup (24 oz, 18 cm height, 10 cm diameter)"
        } else {
          cupDescription =
            "venti white paper hot cup with brown cardboard sleeve (20 oz, 20 cm height, 9.2 cm diameter)"
        }
        break
      case "trenta":
        cupDescription = "trenta clear plastic cold cup (31 oz, 20.3 cm height, 10.4 cm diameter)"
        break
      default:
        cupDescription = isHot
          ? `${sizeLower} white paper cup with brown cardboard sleeve`
          : `${sizeLower} clear plastic cup`
    }

    if (isHot) {
      parts.push(
        `A professional photograph of a steaming hot Starbucks beverage in a ${cupDescription}, with visible steam rising from the top, the Starbucks logo on the cup`,
      )
    } else {
      parts.push(
        `A professional photograph of a cold Starbucks beverage in a completely transparent ${cupDescription} with smooth surface and the Starbucks logo, crystal clear see-through cup showing the drink's beautiful layers and rich colors`,
      )
    }
  } else {
    if (isHot) {
      parts.push(
        `A professional photograph of a steaming hot Starbucks beverage in a white paper cup with brown cardboard sleeve, with visible steam rising from the top, the Starbucks logo on the cup`,
      )
    } else {
      parts.push(
        `A professional photograph of a cold Starbucks beverage in a completely transparent clear plastic cup with smooth surface and the Starbucks logo, crystal clear see-through cup showing the drink's beautiful layers and rich colors`,
      )
    }
  }

  if (config.base) {
    if (hasAdditions) {
      parts.push(`with plain black ${config.base.toLowerCase()} as the base`)
    } else {
      parts.push(`black ${config.base.toLowerCase()} drink`)
    }

    if (allProducts?.bases) {
      const unselectedBases = allProducts.bases
        .filter((base) => base.toLowerCase() !== config.base.toLowerCase())
        .slice(0, 3)
      excludeParts.push(...unselectedBases.map((b) => b.toLowerCase()))
    }
  }

  if (config.milk) {
    parts.push(`layered with ${config.milk.toLowerCase()}`)

    if (allProducts?.milks) {
      const unselectedMilks = allProducts.milks
        .filter((milk) => milk.toLowerCase() !== config.milk.toLowerCase())
        .slice(0, 3)
      excludeParts.push(...unselectedMilks.map((m) => m.toLowerCase()))
    }
  } else {
    excludeParts.push("milk", "cream", "dairy")
  }

  if (config.syrups && config.syrups.length > 0) {
    const syrupNames = config.syrups.map((s: any) => s.name.toLowerCase()).join(" and ")
    parts.push(`flavored with ${syrupNames} syrup`)

    if (allProducts?.syrups) {
      const selectedSyrupNames = config.syrups.map((s: any) => s.name.toLowerCase())
      const unselectedSyrups = allProducts.syrups
        .filter((syrup) => !selectedSyrupNames.includes(syrup.toLowerCase()))
        .slice(0, 5)
      excludeParts.push(...unselectedSyrups.map((s) => s.toLowerCase()))
    }
  } else {
    excludeParts.push("syrup", "flavoring")
  }

  if (config.toppings && config.toppings.length > 0) {
    const toppingNames = config.toppings.map((t: string) => t.toLowerCase()).join(" and ")
    parts.push(`topped with ${toppingNames}`)

    if (allProducts?.toppings) {
      const selectedToppingNames = config.toppings.map((t: string) => t.toLowerCase())
      const unselectedToppings = allProducts.toppings
        .filter((topping) => !selectedToppingNames.includes(topping.toLowerCase()))
        .slice(0, 5)
      excludeParts.push(...unselectedToppings.map((t) => t.toLowerCase()))
    }
  } else {
    excludeParts.push("whipped cream", "toppings")
  }

  if (hasIce) {
    parts.push(`with ice cubes`)
  } else {
    excludeParts.push("ice cubes", "ice", "frozen", "iced drink", "cold drink")
  }

  if (isHot) {
    excludeParts.push(
      "transparent cup",
      "clear plastic cup",
      "plastic cup",
      "iced",
      "cold",
      "ice cubes",
      "ice",
      "see-through cup",
      "clear cup",
      "plastic",
      "transparent",
      "iced drink",
      "cold beverage",
      "frozen",
    )
  }

  // Explicit exclusions for cold drinks
  if (isCold) {
    excludeParts.push("paper cup", "cardboard sleeve", "steam", "steaming", "hot beverage", "hot drink")
  }

  if (config.espresso && config.espresso > 0) {
    parts.push(`with ${config.espresso} espresso shot${config.espresso > 1 ? "s" : ""}`)
  }

  parts.push(
    "side view, close-up product shot filling the entire frame, clean white background, bright studio lighting, high quality, appetizing, professional beverage photography",
  )

  excludeParts.push("opaque cup", "shadows", "top view", "overhead view")

  let negativePrompt = excludeParts.join(", ")
  if (negativePrompt.length > 1000) {
    // Truncate to fit within limit
    negativePrompt = negativePrompt.substring(0, 997) + "..."
  }

  return {
    prompt: parts.join(", "),
    negativePrompt,
  }
}
