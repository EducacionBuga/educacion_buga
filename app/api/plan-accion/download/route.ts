import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    // Datos del Plan de Acción 2025
    const planAccionData = [
      {
        numero: 1,
        meta: "Implementar Estrategia De Mejoramiento En Los Procesos Administrativos De La Secretaría De Educación Municipal",
        actividad:
          "Realizar el proceso de diagnostico y reestructuracion que se requiere para la modernizacion de la Secretaria de Educación en su planta de cargos y estructura de procesos.",
        proceso: "Sistema de Gestión de Calidad",
        presupuestoDisponible: "",
        presupuestoEjecutado: "",
        porcentajeAvance: "",
        recursosNecesarios:
          "Financieros, De Personal, Logísticos, Equipos Tecnológicos, Papelería, Capacidad de almacenamiento en la Nube",
        indicadorGestion: "Porcentaje de procesos administrativos estandarizados y mejorados en la SEM",
        unidadMedida: "Porcentaje",
        formula: "Número de Procesos de la SEM / Número de Procesos Estandarizados en la SEM",
        periodo: "Trimestre 2 y 3",
        fechaInicio: "1/4/2025",
        fechaFinalizacion: "30/9/2025",
        responsable: "Sistema de Gestión de Calidad",
        estado: "Sin iniciar",
      },
      {
        numero: 5,
        meta: "Ampliar La Cobertura Educativa En El Nivel De Preescolar En Los Grados Cero, Uno Y Dos Del Municipio",
        actividad:
          "Realizar mesas periódicas de tránsito armónico con las diferentes Instituciones Educativas, con ICBF, Sec de Educación y actores de primera infancia",
        proceso: "Calidad Educativa",
        presupuestoDisponible: "",
        presupuestoEjecutado: "",
        porcentajeAvance: "",
        recursosNecesarios: "Financiero Logistico Marketing medios de comunicación",
        indicadorGestion:
          "Porcentaje de incremento de estudiantes nuevos matriculados en los grados cero, uno y dos en las IEO",
        unidadMedida: "Porcentaje",
        formula: "(Estudiantes actuales - Estudiantes año anterior/ Estudiantes año anterior) *100",
        periodo: "Todo el Año",
        fechaInicio: "09/04/2025",
        fechaFinalizacion: "30/11/2025",
        responsable: "Calidad Educativa",
        estado: "En Proceso",
      },
      // Añadir más filas según sea necesario
    ]

    // Crear un nuevo libro de trabajo con xlsx
    const worksheet = XLSX.utils.json_to_sheet(planAccionData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plan Accion 2025")

    // Convertir a buffer
    const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Devolver el archivo como respuesta
    return new NextResponse(Buffer.from(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Plan_Accion_2025.xlsx",
      },
    })
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error)
    return NextResponse.json({ error: "Error al generar el archivo Excel" }, { status: 500 })
  }
}
