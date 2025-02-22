"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type Content = {
  id: string
  title: string
  status: "draft" | "published"
  category: string
  author: string
  created_at: string
}

export const columns: ColumnDef<Content>[] = [
  {
    accessorKey: "title",
    header: "Başlık",
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/contents/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("title")}
        </Link>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "published" ? "default" : "secondary"}
        >
          {status === "published" ? "Yayında" : "Taslak"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Kategori",
  },
  {
    accessorKey: "author",
    header: "Yazar",
  },
  {
    accessorKey: "created_at",
    header: "Oluşturulma Tarihi",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const content = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(content.id)}
            >
              ID Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/contents/${content.id}`}>
                Düzenle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 