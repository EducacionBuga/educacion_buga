"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useListaChequeoStore, type AreaId } from "@/hooks/use-lista-chequeo-store"

type ListaChequeoProps = {
  areaId: AreaId
  areaName: string
}

export function ListaChequeoGeneric({ areaId, areaName }: ListaChequeoProps) {
  const { items, toggleItem } = useListaChequeoStore(areaId)
  const [filter, setFilter] = useState("all")

  // Asegurarse de que items sea un array
  const safeItems = Array.isArray(items) ? items : []

  // Agrupar items por categoría
  const groupedItems = safeItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof safeItems>,
  )

  // Filtrar items según el estado seleccionado
  const filteredGroups = Object.entries(groupedItems).reduce(
    (acc, [category, items]) => {
      const filteredItems =
        filter === "all"
          ? items
          : filter === "completed"
            ? items.filter((item) => item.completed)
            : items.filter((item) => !item.completed)

      if (filteredItems.length > 0) {
        acc[category] = filteredItems
      }

      return acc
    },
    {} as Record<string, typeof safeItems>,
  )

  // Calcular progreso
  const totalItems = safeItems.length
  const completedItems = safeItems.filter((item) => item.completed).length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Chequeo - {areaName}</CardTitle>
          <CardDescription>
            Utilice esta lista para verificar el cumplimiento de los requisitos documentales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <div className="text-sm font-medium">Progreso General</div>
              <div className="flex items-center gap-2">
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === "pending" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === "completed"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                Completados
              </button>
            </div>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {Object.keys(filteredGroups).length > 0 ? (
                Object.entries(filteredGroups).map(([category, items]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">{category}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3 py-2">
                          <Checkbox id={item.id} checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
                          <label
                            htmlFor={item.id}
                            className={`text-sm ${item.completed ? "line-through text-gray-500" : ""}`}
                          >
                            {item.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No se encontraron elementos que coincidan con el filtro.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
