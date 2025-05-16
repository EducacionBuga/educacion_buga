import type React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface ModuleCardProps {
  title: string
  icon: React.ReactNode
  href: string
}

export function ModuleCard({ title, icon, href }: ModuleCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4">{icon}</div>
          <h3 className="text-lg font-bold">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}
