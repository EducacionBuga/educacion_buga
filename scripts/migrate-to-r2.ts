// Este script se debe ejecutar desde el cliente, ya que debe acceder a localStorage
// y puede ejecutarse desde la consola del navegador en un entorno de desarrollo

async function migrateDocumentsToR2() {
  const areas = ["calidad-educativa", "inspeccion-vigilancia", "cobertura-infraestructura", "talento-humano"]
  const moduleTypes = ["proveedores", "prestacion-servicio"]

  // Migrar documentos para cada área y tipo de módulo
  for (const area of areas) {
    for (const moduleType of moduleTypes) {
      const key = `${area}-${moduleType}-documents`
      const documentsJson = localStorage.getItem(key)

      if (!documentsJson) continue

      try {
        const documents = JSON.parse(documentsJson)
        console.log(`Migrando ${documents.length} documentos de ${area}/${moduleType}...`)

        // Migrar cada documento
        for (const doc of documents) {
          if (!doc.fileUrl || !doc.id || !doc.folderId) continue

          try {
            // Obtener el archivo desde la URL existente
            const response = await fetch(doc.fileUrl)
            const blob = await response.blob()
            const file = new File([blob], doc.name || "documento", {
              type: doc.fileType || "application/octet-stream",
            })

            // Crear FormData
            const formData = new FormData()
            formData.append("file", file)
            formData.append("areaId", area)
            formData.append("moduleType", moduleType)
            formData.append("folderId", doc.folderId)

            // Subir a R2
            console.log(`Subiendo documento ${doc.name}...`)
            const uploadResponse = await fetch("/api/documents/upload", {
              method: "POST",
              body: formData,
            })

            if (!uploadResponse.ok) {
              throw new Error(`Error al subir: ${uploadResponse.statusText}`)
            }

            const uploadData = await uploadResponse.json()

            // Actualizar el documento con la nueva URL y ruta
            doc.fileUrl = uploadData.fileUrl
            doc.filePath = uploadData.filePath

            console.log(`Documento ${doc.name} migrado exitosamente.`)
          } catch (docError) {
            console.error(`Error al migrar documento ${doc.name}:`, docError)
          }
        }

        // Guardar los documentos actualizados en localStorage
        localStorage.setItem(key, JSON.stringify(documents))
        console.log(`Migración completada para ${area}/${moduleType}.`)
      } catch (error) {
        console.error(`Error al procesar documentos de ${area}/${moduleType}:`, error)
      }
    }
  }

  console.log("Migración completa.")
}

// Ejecutar la migración
migrateDocumentsToR2()
