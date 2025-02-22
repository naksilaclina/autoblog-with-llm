"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Settings,
  BarChart
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "İçerikler",
    href: "/dashboard/contents",
    icon: FileText,
  },
  {
    title: "Kategoriler",
    href: "/dashboard/categories",
    icon: FolderTree,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Ayarlar",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          AI Content
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
              >
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === item.href && "bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 