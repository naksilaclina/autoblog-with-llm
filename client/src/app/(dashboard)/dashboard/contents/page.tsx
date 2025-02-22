import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/contents/data-table"
import { columns, Content } from "@/components/contents/columns"

export const metadata: Metadata = {
  title: "İçerikler - AI Content",
  description: "İçerik yönetimi",
}

const data: Content[] = [
  {
    id: "1",
    title: "Yapay Zeka Nedir?",
    status: "published",
    category: "Teknoloji",
    author: "Anıl Çalışkan",
    created_at: "2024-02-22",
  },
  {
    id: "2",
    title: "Machine Learning Temelleri",
    status: "draft",
    category: "Eğitim",
    author: "Anıl Çalışkan",
    created_at: "2024-02-21",
  },
]

export default function ContentsPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">İçerikler</h2>
        <Link href="/dashboard/contents/create">
          <Button>Yeni İçerik</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 