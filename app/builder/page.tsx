"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { BaseStep } from "@/components/builder/base-step"
import { SizeStep } from "@/components/builder/size-step"
import { MilkStep } from "@/components/builder/milk-step"
import { SyrupStep } from "@/components/builder/syrup-step"
import { ToppingStep } from "@/components/builder/topping-step"
import { TemperatureStep } from "@/components/builder/temperature-step"
import { FinalizeStep } from "@/components/builder/finalize-step"
import { DrinkPreview } from "@/components/builder/drink-preview"
import { PriceCalculator } from "@/components/builder/price-calculator"

export type DrinkConfig = {
  base?: string
  size?: string
  milk?: string
  syrups: Array<{ name: string; pumps: number }>
  toppings: string[]
  temperature?: string
  sweetness: string
  ice: string
  name: string
}

const steps = [
  { id: 1, title: "Base", component: BaseStep },
  { id: 2, title: "Size", component: SizeStep },
  { id: 3, title: "Milk", component: MilkStep },
  { id: 4, title: "Syrups", component: SyrupStep },
  { id: 5, title: "Toppings", component: ToppingStep },
  { id: 6, title: "Temperature", component: TemperatureStep },
  { id: 7, title: "Finalize", component: FinalizeStep },
]

export default function BuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [drinkConfig, setDrinkConfig] = useState<DrinkConfig>({
    syrups: [],
    toppings: [],
    sweetness: "medium",
    ice: "none",
    name: "",
  })
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps[currentStep - 1].component

  const generateDrinkImage = async () => {
    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drinkConfig),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview")
      }

      return data.imageUrl
    } catch (err) {
      console.error("[v0] Error generating preview:", err)
      return null
    }
  }

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsFinishing(true)
      const newImageUrl = await generateDrinkImage()
      localStorage.setItem("currentDrink", JSON.stringify(drinkConfig))
      if (newImageUrl) {
        localStorage.setItem("currentDrinkImage", newImageUrl)
      }
      setIsFinishing(false)
      router.push("/summary")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateConfig = (updates: Partial<DrinkConfig>) => {
    setDrinkConfig((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-background to-page-background-secondary">
      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Builder Steps */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-text">{steps[currentStep - 1].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrentStepComponent config={drinkConfig} updateConfig={updateConfig} />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1 || isFinishing}
                    className="border-border text-brand-text-muted bg-transparent"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isFinishing}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-foreground"
                  >
                    {isFinishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        {currentStep === steps.length ? "Finish" : "Next"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start space-y-4">
            <DrinkPreview config={drinkConfig} onImageGenerated={setGeneratedImageUrl} />
            <PriceCalculator config={drinkConfig} />
          </div>
        </div>
      </div>
    </div>
  )
}
