"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, X, Check } from "lucide-react"
import type { DrinkConfig } from "@/app/builder/page"

type Syrup = {
  id: string
  name: string
  is_seasonal: boolean
}

export function SyrupStep({
  config,
  updateConfig,
}: {
  config: DrinkConfig
  updateConfig: (updates: Partial<DrinkConfig>) => void
}) {
  const [syrups, setSyrups] = useState<Syrup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/options/syrups")
      .then((res) => res.json())
      .then((data) => {
        setSyrups(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching syrups:", err)
        setLoading(false)
      })
  }, [])

  const addSyrup = (syrupName: string) => {
    const existing = config.syrups.find((s) => s.name === syrupName)
    if (!existing) {
      updateConfig({
        syrups: [...config.syrups, { name: syrupName, pumps: 1 }],
      })
    }
  }

  const updatePumps = (syrupName: string, delta: number) => {
    const updated = config.syrups.map((s) =>
      s.name === syrupName ? { ...s, pumps: Math.max(1, Math.min(5, s.pumps + delta)) } : s,
    )
    updateConfig({ syrups: updated })
  }

  const removeSyrup = (syrupName: string) => {
    updateConfig({
      syrups: config.syrups.filter((s) => s.name !== syrupName),
    })
  }

  if (loading) {
    return <div className="text-brand-text-muted">Loading syrups...</div>
  }

  return (
    <div className="space-y-6">
      <p className="text-white">Add flavor syrups to your drink (optional)</p>

      {config.syrups.length > 0 && (
        <div className="space-y-3 p-4 bg-button-primary rounded-lg border-[3px] border-button-border">
          <h4 className="font-semibold text-white">Selected Syrups</h4>
          {config.syrups.map((syrup) => (
            <div key={syrup.name} className="flex items-center justify-between bg-starbucks-dark-green p-3 rounded-md">
              <span className="text-white font-medium">{syrup.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updatePumps(syrup.name, -1)}
                    className="h-8 w-8 p-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-white w-12 text-center">{syrup.pumps} pumps</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updatePumps(syrup.name, 1)}
                    className="h-8 w-8 p-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSyrup(syrup.name)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {syrups.map((syrup) => {
          const isSelected = config.syrups.some((s) => s.name === syrup.name)
          return (
            <Card
              key={syrup.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md bg-button-primary relative ${
                isSelected
                  ? "border-[3px] border-button-border"
                  : "border border-button-primary hover:border-button-border"
              }`}
              onClick={() => !isSelected && addSyrup(syrup.name)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <Check className="h-3 w-3 text-button-primary" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-sm text-white">{syrup.name}</h3>
                {syrup.is_seasonal && (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-200 border-amber-400 text-xs w-fit">
                    Seasonal
                  </Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
