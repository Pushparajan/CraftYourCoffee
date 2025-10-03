"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Coffee, Heart, Download, Copy, RotateCcw, Check, DollarSign, Award } from "lucide-react"

export default function SummaryPage() {
  const router = useRouter()
  const [drinkConfig, setDrinkConfig] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null)

  useEffect(() => {
    // In a real app, this would come from state management or URL params
    // For now, we'll use localStorage
    const savedConfig = localStorage.getItem("currentDrink")
    const savedImage = localStorage.getItem("currentDrinkImage")

    if (savedConfig) {
      setDrinkConfig(JSON.parse(savedConfig))
      calculatePrice(JSON.parse(savedConfig))
    }
    if (savedImage) {
      setImageUrl(savedImage)
    }
  }, [])

  const calculatePrice = async (config: any) => {
    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        const data = await response.json()
        setPriceBreakdown(data)
      }
    } catch (error) {
      console.error("[v0] Error calculating price:", error)
    }
  }

  const handleSave = async () => {
    if (!drinkConfig) return

    try {
      const response = await fetch("/api/drinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: drinkConfig.name || "My Custom Drink",
          config: drinkConfig,
          imageUrl: imageUrl,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("[v0] Error saving drink:", error)
    }
  }

  const handleCopy = () => {
    if (!drinkConfig) return

    const text = `${drinkConfig.name || "My Custom Drink"}
Base: ${drinkConfig.base}
Size: ${drinkConfig.size}
Milk: ${drinkConfig.milk}
Syrups: ${drinkConfig.syrups?.map((s: any) => `${s.name} (${s.pumps} pumps)`).join(", ") || "None"}
Toppings: ${drinkConfig.toppings?.join(", ") || "None"}
Temperature: ${drinkConfig.temperature}
Sweetness: ${drinkConfig.sweetness}
Ice: ${drinkConfig.ice}`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${drinkConfig?.name || "drink"}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("[v0] Error downloading image:", error)
      // Fallback: open in new tab if download fails
      window.open(imageUrl, "_blank")
    }
  }

  const handleRestart = () => {
    localStorage.removeItem("currentDrink")
    localStorage.removeItem("currentDrinkImage")
    router.push("/builder")
  }

  if (!drinkConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-text-muted mb-4">No drink configuration found</p>
          <Link href="/builder">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-foreground">Start Building</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary">
      {/* Header */}
      <header className="border-b bg-foreground/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CraftYourCoffee Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-brand-text">CraftYourCoffee</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-brand-text mb-3">Your Custom Creation</h2>
            <p className="text-brand-text-muted">Here's your personalized drink recipe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Drink Image */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-page-background to-page-background-secondary rounded-lg overflow-hidden mb-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={drinkConfig.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-text-muted">
                      <Coffee className="h-24 w-24" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-brand-text text-center mb-4">
                  {drinkConfig.name || "My Custom Drink"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="border-border text-brand-text-muted bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="border-border text-brand-text-muted bg-transparent"
                  >
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drink Details */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-brand-text">Recipe Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Base</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.base}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Size</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Milk</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.milk}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Temperature</p>
                      <p className="font-semibold text-brand-text">{drinkConfig.temperature}</p>
                    </div>
                  </div>

                  {drinkConfig.syrups && drinkConfig.syrups.length > 0 && (
                    <div>
                      <p className="text-sm text-brand-text-muted mb-2">Syrups</p>
                      <div className="space-y-1">
                        {drinkConfig.syrups.map((syrup: any, index: number) => (
                          <p key={index} className="text-brand-text">
                            {syrup.name} - {syrup.pumps} pump{syrup.pumps > 1 ? "s" : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {drinkConfig.toppings && drinkConfig.toppings.length > 0 && (
                    <div>
                      <p className="text-sm text-brand-text-muted mb-2">Toppings</p>
                      <p className="text-brand-text">{drinkConfig.toppings.join(", ")}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Sweetness</p>
                      <p className="font-semibold text-brand-text capitalize">{drinkConfig.sweetness}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-muted mb-1">Ice</p>
                      <p className="font-semibold text-brand-text capitalize">{drinkConfig.ice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {priceBreakdown && (
                <Card className="border-border bg-brand-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl text-brand-text flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {priceBreakdown.base > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Base</span>
                          <span className="text-brand-text">${priceBreakdown.base.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.size > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Size</span>
                          <span className="text-brand-text">+${priceBreakdown.size.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.milk > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Milk</span>
                          <span className="text-brand-text">+${priceBreakdown.milk.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.syrups > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Syrups</span>
                          <span className="text-brand-text">+${priceBreakdown.syrups.toFixed(2)}</span>
                        </div>
                      )}
                      {priceBreakdown.toppings > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Toppings</span>
                          <span className="text-brand-text">+${priceBreakdown.toppings.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border" />

                    <div className="flex justify-between items-center">
                      <span className="text-brand-text font-bold text-lg">Total Price</span>
                      <span className="text-brand-primary font-bold text-2xl">${priceBreakdown.total.toFixed(2)}</span>
                    </div>

                    {priceBreakdown.loyaltyPoints?.total > 0 && (
                      <>
                        <Separator className="bg-border my-4" />
                        <div className="bg-brand-primary/10 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-brand-primary" />
                            <div>
                              <p className="text-brand-text font-semibold">Loyalty Points Earned</p>
                              <p className="text-xs text-brand-text-muted">2 points per dollar</p>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-sm">
                            {priceBreakdown.loyaltyPoints.base > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Base</span>
                                <span className="text-brand-text font-medium">
                                  {priceBreakdown.loyaltyPoints.base} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.size > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Size</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.size} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.milk > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Milk</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.milk} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.syrups > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Syrups</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.syrups} pts
                                </span>
                              </div>
                            )}
                            {priceBreakdown.loyaltyPoints.toppings > 0 && (
                              <div className="flex justify-between">
                                <span className="text-brand-text-muted">Toppings</span>
                                <span className="text-brand-text font-medium">
                                  +{priceBreakdown.loyaltyPoints.toppings} pts
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator className="bg-border/50" />

                          <div className="flex items-center justify-between">
                            <span className="text-brand-text font-bold">Total Points</span>
                            <span className="text-brand-primary font-bold text-2xl">
                              {priceBreakdown.loyaltyPoints.total}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-foreground"
                >
                  {saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved to Favorites!
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Save to Favorites
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full border-border text-brand-text-muted bg-transparent"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Create Another Drink
                </Button>
                <Link href="/favorites" className="block">
                  <Button variant="ghost" className="w-full text-brand-text-muted hover:bg-muted">
                    View All Favorites
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
