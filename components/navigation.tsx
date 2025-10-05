"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Wand2 } from "lucide-react"
import { useState, useEffect } from "react"

export function Navigation() {
  const pathname = usePathname()
  const [isWizardEnabled, setIsWizardEnabled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if wizard is enabled (training completed)
    fetch("/api/wizard/status")
      .then((res) => res.json())
      .then((data) => setIsWizardEnabled(data.enabled))
      .catch(() => setIsWizardEnabled(false))

    const authStatus = sessionStorage.getItem("isAuthenticated")
    setIsAuthenticated(authStatus === "true")

    const handleStorageChange = () => {
      const authStatus = sessionStorage.getItem("isAuthenticated")
      setIsAuthenticated(authStatus === "true")
    }
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-change", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-change", handleStorageChange)
    }
  }, [])

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/starbucks-logo.png" alt="Starbucks Logo" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold">CraftYourCoffee</span>
            </Link>
            {isAuthenticated && (
              <div className="flex gap-4">
                <Link
                  href="/builder"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/builder" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Builder
                </Link>
                <Link
                  href="/favorites"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/favorites" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Favorites
                </Link>
                <Link
                  href="/admin"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Admin
                </Link>
                <Link
                  href="/wizard"
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                    pathname === "/wizard" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Wand2 className="h-4 w-4" />
                  Coffee Wizard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
