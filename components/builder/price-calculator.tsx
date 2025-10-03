"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Award } from "lucide-react"
import type { DrinkConfig } from "@/app/builder/page"

interface LoyaltyPointsBreakdown {
  base: number
  size: number
  milk: number
  syrups: number
  toppings: number
  total: number
}

interface PriceBreakdown {
  base: number
  size: number
  milk: number
  syrups: number
  toppings: number
  total: number
  loyaltyPoints: LoyaltyPointsBreakdown
}

interface PriceCalculatorProps {
  config: DrinkConfig
}

export function PriceCalculator({ config }: PriceCalculatorProps) {
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    base: 0,
    size: 0,
    milk: 0,
    syrups: 0,
    toppings: 0,
    total: 0,
    loyaltyPoints: {
      base: 0,
      size: 0,
      milk: 0,
      syrups: 0,
      toppings: 0,
      total: 0,
    },
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const calculatePrice = async () => {
      setLoading(true)
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
      } finally {
        setLoading(false)
      }
    }

    // Only calculate if we have at least a base selected
    if (config.base) {
      calculatePrice()
    }
  }, [config])

  if (!config.base) {
    return null
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-brand-text flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-brand-text-muted">Calculating...</div>
        ) : (
          <>
            <div className="space-y-2 text-sm">
              {priceBreakdown.base > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Base ({config.base})</span>
                  <span className="text-brand-text font-medium">${priceBreakdown.base.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.size > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Size ({config.size})</span>
                  <span className="text-brand-text font-medium">+${priceBreakdown.size.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.milk > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Milk ({config.milk})</span>
                  <span className="text-brand-text font-medium">+${priceBreakdown.milk.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.syrups > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">
                    Syrups ({config.syrups.reduce((sum, s) => sum + s.pumps, 0)} pumps)
                  </span>
                  <span className="text-brand-text font-medium">+${priceBreakdown.syrups.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.toppings > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Toppings ({config.toppings.length})</span>
                  <span className="text-brand-text font-medium">+${priceBreakdown.toppings.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="bg-border" />

            <div className="flex justify-between items-center pt-1">
              <span className="text-brand-text font-semibold text-base">Total</span>
              <span className="text-brand-primary font-bold text-xl">${priceBreakdown.total.toFixed(2)}</span>
            </div>

            {priceBreakdown.loyaltyPoints.total > 0 && (
              <>
                <Separator className="bg-border" />
                <div className="bg-brand-primary/10 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-brand-primary" />
                    <span className="text-brand-text font-semibold">Loyalty Points Earned</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {priceBreakdown.loyaltyPoints.base > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-text-muted">Base</span>
                        <span className="text-brand-text font-medium">{priceBreakdown.loyaltyPoints.base} pts</span>
                      </div>
                    )}
                    {priceBreakdown.loyaltyPoints.size > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-text-muted">Size</span>
                        <span className="text-brand-text font-medium">+{priceBreakdown.loyaltyPoints.size} pts</span>
                      </div>
                    )}
                    {priceBreakdown.loyaltyPoints.milk > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-text-muted">Milk</span>
                        <span className="text-brand-text font-medium">+{priceBreakdown.loyaltyPoints.milk} pts</span>
                      </div>
                    )}
                    {priceBreakdown.loyaltyPoints.syrups > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-text-muted">Syrups</span>
                        <span className="text-brand-text font-medium">+{priceBreakdown.loyaltyPoints.syrups} pts</span>
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
                  <Separator className="bg-border/50 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-brand-text font-semibold">Total Points</span>
                    <span className="text-brand-primary font-bold text-lg">
                      {priceBreakdown.loyaltyPoints.total} pts
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
