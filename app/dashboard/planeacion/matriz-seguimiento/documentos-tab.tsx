"use client"

import { DocumentosReport } from "@/components/dashboard/documentos-report"
import { useDocumentosReport } from "@/hooks/use-documentos-report"

export function DocumentosTab() {
  const { documentosData, foldersData, isLoadingDocumentos, error, refetchDocumentos, stats } = useDocumentosReport()

  return (
    <DocumentosReport
      documentosData={documentosData}
      foldersData={foldersData}
      isLoading={isLoadingDocumentos}
      onRefresh={refetchDocumentos}
      stats={stats}
    />
  )
}
