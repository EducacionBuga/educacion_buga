"use client"

import { ListaChequeoProduccion } from "@/components/modules/lista-chequeo-produccion"

export default function TestChecklistPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Prueba de Lista de Chequeo</h1>
      <ListaChequeoProduccion />
    </div>
  )
}
