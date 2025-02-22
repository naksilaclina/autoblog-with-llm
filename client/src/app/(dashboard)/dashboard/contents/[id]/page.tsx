import { Metadata } from "next"
import { ContentForm } from "@/components/forms/content/ContentForm"

export const metadata: Metadata = {
  title: "İçerik Düzenle - AI Content",
  description: "İçerik düzenle",
}

export default function EditContentPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">İçerik Düzenle</h2>
      </div>
      <ContentForm />
    </div>
  )
} 