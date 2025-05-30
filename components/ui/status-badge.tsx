import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "Completado":
      return (
        <Badge variant="outline" className={`bg-green-500/10 text-green-500 border-green-500/20 ${className}`}>
          Completado
        </Badge>
      )
    case "En progreso":
      return (
        <Badge variant="outline" className={`bg-blue-500/10 text-blue-500 border-blue-500/20 ${className}`}>
          En progreso
        </Badge>
      )
    case "Retrasado":
      return (
        <Badge variant="outline" className={`bg-red-500/10 text-red-500 border-red-500/20 ${className}`}>
          Retrasado
        </Badge>
      )
    case "Pendiente":
      return (
        <Badge variant="outline" className={`bg-orange-500/10 text-orange-500 border-orange-500/20 ${className}`}>
          Pendiente
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={`bg-gray-500/10 text-gray-500 border-gray-500/20 ${className}`}>
          {status}
        </Badge>
      )
  }
}
