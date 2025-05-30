"use client"

import { ModuleHeader } from "@/components/dashboard/module-header"
import { TimelineView, type TimelineProject } from "@/components/dashboard/timeline-view"
import { RoleGuard } from "@/components/auth/role-guard"

export default function PlanAccionTimelinePage() {
  // Datos de ejemplo para la línea de tiempo
  const projectsData: TimelineProject[] = [
    {
      id: "1",
      programa: "Mejoramiento Educativo",
      objetivo: "Mejorar la calidad educativa en instituciones públicas",
      meta: "90% de aprobación en evaluaciones de calidad",
      presupuesto: "$120,000,000",
      acciones: "Capacitación docente, Actualización curricular, Implementación de nuevas metodologías pedagógicas",
      indicadores: "85% de aprobación alcanzada en evaluaciones preliminares",
      fechaInicio: "01/02/2025",
      fechaFin: "30/11/2025",
      estado: "En progreso",
      area: "Calidad Educativa",
      color: "bg-orange-500",
    },
    {
      id: "2",
      programa: "Infraestructura Educativa",
      objetivo: "Mejorar instalaciones de instituciones educativas",
      meta: "Renovación de 5 instituciones",
      presupuesto: "$350,000,000",
      acciones: "Contratación de obras, Supervisión de proyectos, Adecuación de espacios",
      indicadores: "3 instituciones renovadas (60%)",
      fechaInicio: "15/01/2025",
      fechaFin: "15/12/2025",
      estado: "En progreso",
      area: "Cobertura e Infraestructura",
      color: "bg-green-500",
    },
    {
      id: "3",
      programa: "Control Educativo",
      objetivo: "Garantizar calidad en instituciones educativas",
      meta: "95% instituciones evaluadas",
      presupuesto: "$110,000,000",
      acciones: "Visitas de inspección, Auditorías, Evaluación de estándares",
      indicadores: "85% instituciones evaluadas",
      fechaInicio: "01/03/2025",
      fechaFin: "30/10/2025",
      estado: "En progreso",
      area: "Inspección y Vigilancia",
      color: "bg-blue-500",
    },
    {
      id: "4",
      programa: "Desarrollo Profesional",
      objetivo: "Fortalecer competencias del personal docente",
      meta: "100% personal capacitado",
      presupuesto: "$95,000,000",
      acciones: "Talleres, Cursos especializados, Programas de formación continua",
      indicadores: "75% personal capacitado",
      fechaInicio: "01/02/2025",
      fechaFin: "30/09/2025",
      estado: "En progreso",
      area: "Talento Humano",
      color: "bg-purple-500",
    },
    {
      id: "5",
      programa: "Ampliación de Cobertura",
      objetivo: "Aumentar cobertura educativa en zonas rurales",
      meta: "95% de cobertura en zonas rurales",
      presupuesto: "$180,000,000",
      acciones: "Implementación de programas de acceso, Transporte escolar, Convenios interinstitucionales",
      indicadores: "85% de cobertura alcanzada",
      fechaInicio: "15/02/2025",
      fechaFin: "15/11/2025",
      estado: "En progreso",
      area: "Cobertura e Infraestructura",
      color: "bg-green-500",
    },
    {
      id: "6",
      programa: "Cumplimiento Normativo",
      objetivo: "Asegurar cumplimiento de normativas educativas",
      meta: "100% de instituciones cumpliendo normativas",
      presupuesto: "$85,000,000",
      acciones: "Revisión documental, Capacitación en normativas, Seguimiento a planes de mejora",
      indicadores: "90% de cumplimiento verificado",
      fechaInicio: "01/04/2025",
      fechaFin: "30/08/2025",
      estado: "Pendiente",
      area: "Inspección y Vigilancia",
      color: "bg-blue-500",
    },
    {
      id: "7",
      programa: "Bienestar Laboral",
      objetivo: "Mejorar clima organizacional",
      meta: "90% satisfacción laboral",
      presupuesto: "$65,000,000",
      acciones: "Actividades de integración, Programas de bienestar, Evaluación de clima laboral",
      indicadores: "80% satisfacción en encuestas",
      fechaInicio: "15/03/2025",
      fechaFin: "15/10/2025",
      estado: "Completado",
      area: "Talento Humano",
      color: "bg-purple-500",
    },
    {
      id: "8",
      programa: "Actualización Curricular",
      objetivo: "Modernizar contenidos educativos",
      meta: "100% de currículos actualizados",
      presupuesto: "$75,000,000",
      acciones: "Revisión de contenidos, Talleres con docentes, Implementación de nuevos currículos",
      indicadores: "70% de currículos actualizados",
      fechaInicio: "01/05/2025",
      fechaFin: "30/11/2025",
      estado: "Retrasado",
      area: "Calidad Educativa",
      color: "bg-orange-500",
    },
  ]

  return (
    <RoleGuard
      allowedRoles={[
        "ADMIN",
        "PLANEACION",
        "CALIDAD_EDUCATIVA",
        "INSPECCION_VIGILANCIA",
        "COBERTURA_INFRAESTRUCTURA",
        "TALENTO_HUMANO",
      ]}
    >
      <main className="min-h-screen">
        <ModuleHeader title="PLANES DE ACCIÓN - LÍNEA DE TIEMPO" />
        <div className="container mx-auto">
          <TimelineView projects={projectsData} />
        </div>
      </main>
    </RoleGuard>
  )
}
