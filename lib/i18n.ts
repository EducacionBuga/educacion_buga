import { createCalendar } from "@internationalized/date"

// Configuración para el calendario en español
export const calendar = createCalendar({
  // Nombres de los meses en español
  months: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  // Nombres cortos de los días de la semana en español (empezando por domingo)
  weekdays: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
  // Primer día de la semana (0 = domingo, 1 = lunes, etc.)
  firstDayOfWeek: 1,
  // Formato de fecha (dd/mm/yyyy)
  dateFormat: "dd/MM/yyyy",
})
