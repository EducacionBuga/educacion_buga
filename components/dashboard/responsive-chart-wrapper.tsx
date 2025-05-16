"use client"

import { useEffect, useState, useRef, type ReactNode } from "react"

interface ResponsiveChartWrapperProps {
  children: ReactNode
  className?: string
  minHeight?: string
}

export function ResponsiveChartWrapper({ children, className = "", minHeight = "300px" }: ResponsiveChartWrapperProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    // Actualizar dimensiones iniciales
    updateDimensions()

    // Actualizar dimensiones cuando cambie el tamaño de la ventana
    const debouncedHandleResize = debounce(updateDimensions, 250)
    window.addEventListener("resize", debouncedHandleResize)

    // Observador de redimensionamiento para el contenedor
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateDimensions)
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }
      return () => {
        window.removeEventListener("resize", debouncedHandleResize)
        resizeObserver.disconnect()
      }
    }

    return () => window.removeEventListener("resize", debouncedHandleResize)
  }, [])

  // Función para limitar la frecuencia de ejecución
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ minHeight }}
      data-width={dimensions.width}
      data-height={dimensions.height}
    >
      {children}
    </div>
  )
}
