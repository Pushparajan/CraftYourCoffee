"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DrinkConfig } from "@/app/builder/page"

type Milk = {
  id: string
  name: string
  is_dairy_free: boolean
}

export function MilkStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [milks, setMilks] = useState<Milk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/options/milks")
      .then((res) => res.json())
      .then((data) => {
        setMilks(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching milks:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-brand-text-muted">Loading milk options...</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-foreground mb-6">Choose your milk preference</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milks.map((milk) => (
          <Card
            key={milk.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-md bg-button-primary ${
              config.milk === milk.name
                ? "border-[3px] border-button-border"
                : "border border-button-primary hover:border-button-border"
            }`}
            onClick={() => updateConfig({ milk: milk.name })}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary-foreground">{milk.name}</h3>
              {milk.is_dairy_free && (
                <Badge variant="secondary" className="bg-success/20 text-success-foreground border-success">
                  Dairy Free
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
