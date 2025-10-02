"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import type { DrinkConfig } from "@/app/builder/page"

export function DrinkPreview({
  config,
  onImageGenerated,
}: {
  config: DrinkConfig
  onImageGenerated?: (url: string) => void
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePreview = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview")
      }

      setImageUrl(data.imageUrl)
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl)
      }
    } catch (err) {
      console.error("[v0] Error generating preview:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate preview. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-24 border-border">
      <CardHeader>
        <CardTitle className="text-xl text-brand-text">Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gradient-to-br from-page-background to-page-background-secondary rounded-lg flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="text-center text-brand-text-muted">
              <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Generating preview...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl || "/placeholder.svg"} alt="Drink preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-brand-text-muted">
              <Sparkles className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Preview will appear here</p>
            </div>
          )}
        </div>
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <Button
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-foreground"
          onClick={handleGeneratePreview}
          disabled={loading || !config.base}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Preview
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
