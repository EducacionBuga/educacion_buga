"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Verificar si estamos en la página principal del dashboard
  const isMainDashboard = pathname === "/dashboard"

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Si estamos en la página principal del dashboard, no mostramos el header
  if (isMainDashboard) {
    return (
      <div className="flex flex-col min-h-screen">
        {children}
        <footer className="text-gray-700 py-3 px-4 text-center text-sm">
          <div>Secretaría de Educación de Guadalajara de Buga</div>
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} Todos los derechos reservados.</div>
        </footer>

        {/* Botón flotante para cerrar sesión */}
        <Button
          onClick={handleLogout}
          className="fixed bottom-6 left-6 z-50 shadow-md flex items-center gap-2 bg-orange-500 hover:bg-white text-white hover:text-orange-500 transition-all duration-300 group overflow-hidden"
          variant="ghost"
        >
          <LogOut className="h-4 w-4 group-hover:scale-110 transition-all group-hover:text-orange-500" />
          <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden group-hover:font-semibold group-hover:text-orange-500">
            Cerrar Sesión
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      <footer className="text-gray-700 py-3 px-4 text-center text-sm">
        <div>Secretaría de Educación de Guadalajara de Buga</div>
        <div className="text-xs text-gray-500">© {new Date().getFullYear()} Todos los derechos reservados.</div>
      </footer>

      {/* Botón flotante para cerrar sesión */}
      <Button
        onClick={handleLogout}
        className="fixed bottom-6 left-6 z-50 shadow-md flex items-center gap-2 bg-orange-500 hover:bg-white text-white hover:text-orange-500 transition-all duration-300 group overflow-hidden"
        variant="ghost"
      >
        <LogOut className="h-4 w-4 group-hover:scale-110 transition-all group-hover:text-orange-500" />
        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden group-hover:font-semibold group-hover:text-orange-500">
          Cerrar Sesión
        </span>
      </Button>
    </div>
  )
}
