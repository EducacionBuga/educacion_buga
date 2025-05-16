"use client"

import type { Report } from "@/types/reports"
import { ReportItem } from "./report-item"

interface ReportListProps {
  reports: Report[]
  onDelete: (id: string) => void
  onView?: (report: Report) => void
  onDownload?: (report: Report) => void
}

export function ReportList({ reports, onDelete, onView, onDownload }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">No se encontraron informes con los filtros seleccionados</div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportItem key={report.id} report={report} onDelete={onDelete} onView={onView} onDownload={onDownload} />
      ))}
    </div>
  )
}
