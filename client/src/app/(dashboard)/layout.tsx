"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
} 