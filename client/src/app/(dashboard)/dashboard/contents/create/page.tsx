import { Metadata } from "next"
import { ContentForm } from "@/components/forms/content/ContentForm"

export const metadata: Metadata = {
  title: "Yeni İçerik - AI Content",
  description: "Yeni içerik oluştur",
}

export default function CreateContentPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Yeni İçerik</h2>
      </div>
      <ContentForm />
    </div>
  )
} 