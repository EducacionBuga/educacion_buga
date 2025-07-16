require('dotenv').config({ path: '.env.local' })
const ExcelJS = require('exceljs')
const path = require('path')

async function analizarPlantilla() {
  try {
    console.log('📊 Analizando plantilla Excel...')
    
    const templatePath = path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templatePath)
    
    console.log(`📋 Hojas encontradas: ${workbook.worksheets.length}`)
    
    workbook.worksheets.forEach((worksheet, index) => {
      console.log(`\n📄 Hoja ${index + 1}: "${worksheet.name}"`)
      console.log(`   Filas: ${worksheet.rowCount}`)
      console.log(`   Columnas: ${worksheet.columnCount}`)
      
      // Buscar celdas con datos relevantes
      const celdasImportantes = []
      for (let row = 1; row <= Math.min(20, worksheet.rowCount); row++) {
        for (let col = 1; col <= Math.min(10, worksheet.columnCount); col++) {
          const cell = worksheet.getCell(row, col)
          if (cell.value && typeof cell.value === 'string' && 
              (cell.value.includes('contrato') || cell.value.includes('Contrato') ||
               cell.value.includes('contratista') || cell.value.includes('Contratista') ||
               cell.value.includes('valor') || cell.value.includes('Valor'))) {
            celdasImportantes.push({
              celda: `${String.fromCharCode(64 + col)}${row}`,
              valor: cell.value
            })
          }
        }
      }
      
      if (celdasImportantes.length > 0) {
        console.log('   Celdas importantes encontradas:')
        celdasImportantes.forEach(celda => {
          console.log(`     ${celda.celda}: "${celda.valor}"`)
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Error al analizar plantilla:', error)
  }
}

analizarPlantilla()
