import { type Metadata } from "next"
import { RegistrosManager } from "@/components/modules/registros-manager"
import { AREAS } from "@/constants/areas"

export const metadata: Metadata = {
  title: "Registros Fotográficos",
  description: "Gestión de registros fotográficos del área",
}

export default async function RegistrosPage({
  params,
}: {
  params: Promise<{ areaId: string }>
}) {
  const { areaId } = await params
  const area = AREAS.find(a => a.key === areaId)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registros Fotográficos</h1>
        <p className="text-muted-foreground">
          Gestiona y visualiza los registros fotográficos del área.
        </p>
      </div>
      <RegistrosManager 
        areaId={areaId}
        title="Registros Fotográficos"
        description={area ? `Gestión de registros fotográficos para ${area.label}` : "Gestión de registros fotográficos"}
      />
    </div>
  )
}
