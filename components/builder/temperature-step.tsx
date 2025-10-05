"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Flame, Snowflake, Wind, Check } from "lucide-react"
import type { DrinkConfig } from "@/app/builder/page"

type Temperature = {
  id: string
  name: string
}

const iconMap: Record<string, any> = {
  Hot: Flame,
  Iced: Snowflake,
  Blended: Wind,
}

export function TemperatureStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [temperatures, setTemperatures] = useState<Temperature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/options/temperatures")
      .then((res) => res.json())
      .then((data) => {
        setTemperatures(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching temperatures:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-brand-text-muted">Loading temperature options...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white mb-6">Choose your drink temperature</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {temperatures.map((temp) => {
            const Icon = iconMap[temp.name] || Flame
            const isSelected = config.temperature === temp.name
            return (
              <Card
                key={temp.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-md bg-button-primary relative ${
                  isSelected
                    ? "border-[3px] border-button-border"
                    : "border border-button-primary hover:border-button-border"
                }`}
                onClick={() => updateConfig({ temperature: temp.name })}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <Check className="h-4 w-4 text-button-primary" strokeWidth={3} />
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <Icon className="h-10 w-10 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground">{temp.name}</h3>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4 pt-6 border-t border-foreground/20">
        <div>
          <Label className="text-gray-900 font-semibold mb-3 block text-lg">Sweetness Level</Label>
          <RadioGroup
            value={config.sweetness}
            onValueChange={(value) => updateConfig({ sweetness: value })}
            className="flex gap-4"
          >
            {["light", "medium", "extra"].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`sweetness-${level}`} className="border-gray-900 text-gray-900" />
                <Label htmlFor={`sweetness-${level}`} className="capitalize text-gray-900 cursor-pointer font-medium">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-gray-900 font-semibold mb-3 block text-lg">Ice Level</Label>
          <RadioGroup value={config.ice} onValueChange={(value) => updateConfig({ ice: value })} className="flex gap-4">
            {["light", "regular", "extra"].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`ice-${level}`} className="border-gray-900 text-gray-900" />
                <Label htmlFor={`ice-${level}`} className="capitalize text-gray-900 cursor-pointer font-medium">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
