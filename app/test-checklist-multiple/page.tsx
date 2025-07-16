import { ChecklistProductionMultiple } from '@/components/checklist/checklist-production-multiple'

export default function TestChecklistMultiplePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistema de Lista de Chequeo Múltiple</h1>
        <p className="text-gray-600 mt-2">
          Nuevo sistema donde un contrato puede tener los 4 apartados: SAMC, MINIMA CUANTÍA, INTERADMINISTRATIVO, PRESTACIÓN DE SERVICIOS
        </p>
      </div>
      
      <ChecklistProductionMultiple areaId="calidad-educativa" />
    </div>
  )
}
