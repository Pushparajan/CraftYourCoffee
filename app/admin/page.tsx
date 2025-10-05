"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [savedPreferences, setSavedPreferences] = useState<any>(null)
  const [hasBeenTrained, setHasBeenTrained] = useState(false)
  const [preferences, setPreferences] = useState({
    aroma: "",
    flavor: "",
    acidity: "",
    body: "",
    aftertaste: "",
  })

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/preferences")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setSavedPreferences(data)
            setPreferences({
              aroma: data.aroma_preference || "",
              flavor: data.flavor_preference || "",
              acidity: data.acidity_preference || "",
              body: data.body_preference || "",
              aftertaste: data.aftertaste_preference || "",
            })
            setIsEditing(false)
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTrainingStatus = async () => {
      try {
        const response = await fetch("/api/wizard/status")
        if (response.ok) {
          const data = await response.json()
          setHasBeenTrained(data.enabled)
        }
      } catch (error) {
        console.error("Error fetching training status:", error)
      }
    }

    fetchPreferences()
    fetchTrainingStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        alert("Preferences saved successfully!")
        setSavedPreferences({
          aroma_preference: preferences.aroma,
          flavor_preference: preferences.flavor,
          acidity_preference: preferences.acidity,
          body_preference: preferences.body,
          aftertaste_preference: preferences.aftertaste,
        })
        setIsEditing(false)
      } else {
        alert("Failed to save preferences")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Error saving preferences")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (savedPreferences) {
      setPreferences({
        aroma: savedPreferences.aroma_preference || "",
        flavor: savedPreferences.flavor_preference || "",
        acidity: savedPreferences.acidity_preference || "",
        body: savedPreferences.body_preference || "",
        aftertaste: savedPreferences.aftertaste_preference || "",
      })
    }
    setIsEditing(false)
  }

  const handleTrainIndex = async () => {
    setIsTraining(true)

    try {
      const response = await fetch("/api/train-index", {
        method: "POST",
      })

      if (response.ok) {
        alert("Index training completed successfully! The Coffee Wizard is now available.")
        setHasBeenTrained(true)
        router.refresh()
      } else {
        alert("Failed to train index")
      }
    } catch (error) {
      console.error("Error training index:", error)
      alert("Error training index")
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage coffee preferences and AI training</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coffee Preferences</CardTitle>
            <CardDescription>
              Define your ideal coffee characteristics to help the AI recommend perfect combinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aroma">Aroma</Label>
                  <Textarea
                    id="aroma"
                    placeholder="Describe your preferred aroma (e.g., floral, fruity, nutty, earthy...)"
                    value={preferences.aroma}
                    onChange={(e) => setPreferences({ ...preferences, aroma: e.target.value })}
                    required
                    rows={3}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-muted cursor-default" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    The rich smell of coffee, with notes like floral, fruity, or nutty
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flavor">Flavor</Label>
                  <Textarea
                    id="flavor"
                    placeholder="Describe your preferred flavor profile (e.g., chocolate, caramel, spices, fruit...)"
                    value={preferences.flavor}
                    onChange={(e) => setPreferences({ ...preferences, flavor: e.target.value })}
                    required
                    rows={3}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-muted cursor-default" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Main taste characteristics ranging from chocolate and caramel to spices and fruit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acidity">Acidity</Label>
                  <Textarea
                    id="acidity"
                    placeholder="Describe your preferred acidity level (e.g., bright citrus, mild berry, low acidity...)"
                    value={preferences.acidity}
                    onChange={(e) => setPreferences({ ...preferences, acidity: e.target.value })}
                    required
                    rows={3}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-muted cursor-default" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pleasant brightness or tanginess with notes reminiscent of citrus or berries
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Body (Mouthfeel)</Label>
                  <Textarea
                    id="body"
                    placeholder="Describe your preferred body (e.g., light and delicate, full and creamy...)"
                    value={preferences.body}
                    onChange={(e) => setPreferences({ ...preferences, body: e.target.value })}
                    required
                    rows={3}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-muted cursor-default" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Weight, texture, or richness on your tongue, from light to full and creamy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aftertaste">Aftertaste (Finish)</Label>
                  <Textarea
                    id="aftertaste"
                    placeholder="Describe your preferred aftertaste (e.g., long-lasting chocolate, clean finish...)"
                    value={preferences.aftertaste}
                    onChange={(e) => setPreferences({ ...preferences, aftertaste: e.target.value })}
                    required
                    rows={3}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-muted cursor-default" : ""}
                  />
                  <p className="text-xs text-muted-foreground">Flavor that lingers on the palate after swallowing</p>
                </div>

                {isEditing ? (
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                    {savedPreferences && (
                      <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button type="button" onClick={handleEdit} className="w-full bg-transparent" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Preferences
                  </Button>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Training</CardTitle>
            <CardDescription>
              Train the AI model with all coffee data to enable the Coffee Wizard feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTrainIndex} disabled={isTraining} className="w-full" variant="secondary">
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training Index...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {hasBeenTrained ? "Retrain Coffee Index" : "Train Coffee Index"}
                </>
              )}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              This will index all coffee bases, milks, syrups, and toppings using Cohere's rerank API. Once complete,
              the Coffee Wizard will be available in the top menu.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
