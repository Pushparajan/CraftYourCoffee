"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Heart, Lock } from "lucide-react"
import { APP_CONFIG } from "@/lib/config"

export default function HomePage() {
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState(false)
  const router = useRouter()

  const handleStartCreating = () => {
    if (passcode === APP_CONFIG.PASSCODE) {
      router.push("/builder")
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  const featuredDrinks = [
    {
      name: "Caramel Cloud Latte",
      description: "Smooth espresso with caramel and sweet cream foam",
      image: "/caramel-latte-with-foam-in-glass-cup.jpg",
    },
    {
      name: "Berry Bliss Refresher",
      description: "Refreshing fruit blend with ice and berries",
      image: "/pink-berry-refresher-drink-with-ice.jpg",
    },
    {
      name: "Mocha Dream",
      description: "Rich chocolate and espresso with whipped cream",
      image: "/chocolate-mocha-coffee-with-whipped-cream.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-page-background">
      {/* Header */}
      <header className="border-b border-border bg-page-background-secondary sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CraftYourCoffee Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-brand-text">CraftYourCoffee</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-brand-text hover:text-brand-primary">
              Home
            </Link>
            <Link href="/favorites" className="text-sm font-semibold text-brand-text hover:text-brand-primary">
              Favorites
            </Link>
            <Link href="/custom-prompt" className="text-sm font-semibold text-brand-text hover:text-brand-primary">
              Test Prompts
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-brand-text mb-6 text-balance leading-tight">
            Craft Your Perfect Drink
          </h2>
          <p className="text-lg md:text-xl text-brand-text-muted mb-8 text-pretty leading-relaxed">
            Create custom beverages with our step-by-step builder. Choose your base, customize every detail, and see
            your creation come to life with AI-powered previews.
          </p>
          <div className="max-w-sm mx-auto mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-brand-text-muted" />
              <label htmlFor="passcode" className="text-sm font-semibold text-brand-text">
                Enter Passcode
              </label>
            </div>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartCreating()}
              className={`text-center text-lg rounded-lg ${error ? "border-destructive animate-shake" : "border-input"}`}
            />
            {error && (
              <p className="text-destructive text-sm mt-2 font-medium">Incorrect passcode. Please try again.</p>
            )}
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleStartCreating}
            className="px-8 py-6 text-base font-semibold"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating
          </Button>
        </div>
      </section>

      {/* Featured Drinks */}
      <section className="container mx-auto px-4 py-16 bg-page-background-secondary rounded-3xl shadow-sm">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-brand-text mb-3">Featured Creations</h3>
          <p className="text-lg text-brand-text-muted">Get inspired by these popular drink combinations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuredDrinks.map((drink, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all border-border rounded-2xl">
              <div className="aspect-square relative bg-muted">
                <img src={drink.image || "/placeholder.svg"} alt={drink.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-brand-text mb-2">{drink.name}</h4>
                <p className="text-brand-text-muted text-sm mb-4 leading-relaxed">{drink.description}</p>
                <Button variant="outline" className="w-full bg-transparent">
                  <Heart className="mr-2 h-4 w-4" />
                  Save to Favorites
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-brand-text-muted text-sm">
          <p className="font-medium">CraftYourCoffee - Craft your perfect beverage</p>
        </div>
      </footer>
    </div>
  )
}
