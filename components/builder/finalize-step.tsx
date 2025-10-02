"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { DrinkConfig } from "@/app/builder/page"

export function FinalizeStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="drink-name" className="text-brand-text font-semibold mb-3 block">
          Name Your Creation
        </Label>
        <Input
          id="drink-name"
          placeholder="e.g., Caramel Cloud Dream"
          value={config.name}
          onChange={(e) => updateConfig({ name: e.target.value })}
          className="border-input focus:border-ring"
        />
      </div>

      <Card className="p-6 bg-page-background border-border">
        <h3 className="font-semibold text-brand-text mb-4">Your Drink Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Base:</span>
            <span className="text-brand-text font-medium">{config.base || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Size:</span>
            <span className="text-brand-text font-medium">{config.size || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Milk:</span>
            <span className="text-brand-text font-medium">{config.milk || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Syrups:</span>
            <span className="text-brand-text font-medium">
              {config.syrups.length > 0 ? config.syrups.map((s) => `${s.name} (${s.pumps})`).join(", ") : "None"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Toppings:</span>
            <span className="text-brand-text font-medium">
              {config.toppings.length > 0 ? config.toppings.join(", ") : "None"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Temperature:</span>
            <span className="text-brand-text font-medium">{config.temperature || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Sweetness:</span>
            <span className="text-brand-text font-medium capitalize">{config.sweetness}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Ice:</span>
            <span className="text-brand-text font-medium capitalize">{config.ice}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
