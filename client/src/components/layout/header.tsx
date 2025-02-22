"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.success("Çıkış yapıldı")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 