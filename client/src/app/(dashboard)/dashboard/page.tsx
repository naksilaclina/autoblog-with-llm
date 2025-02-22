import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FileText,
  FolderTree,
  Users,
  BarChart
} from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard - AI Content",
  description: "AI Content yönetim paneli",
}

const stats = [
  {
    title: "Toplam İçerik",
    value: "124",
    description: "Son 30 günde +22",
    icon: FileText,
  },
  {
    title: "Kategoriler",
    value: "12",
    description: "Son 30 günde +3",
    icon: FolderTree,
  },
  {
    title: "Kullanıcılar",
    value: "3",
    description: "Son 30 günde +1",
    icon: Users,
  },
  {
    title: "Toplam Görüntülenme",
    value: "45,231",
    description: "Son 30 günde +12,234",
    icon: BarChart,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 