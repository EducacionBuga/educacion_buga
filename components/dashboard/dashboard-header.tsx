"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Menu, X } from "lucide-react"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-lg font-bold">SEM Buga</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
            Inicio
          </Link>
          <Link href="/dashboard/despacho" className="text-sm font-medium hover:text-primary">
            Despacho
          </Link>
          <Link href="/dashboard/planeacion" className="text-sm font-medium hover:text-primary">
            Planeación
          </Link>
          <Link href="/dashboard/calidad-educativa" className="text-sm font-medium hover:text-primary">
            Calidad Educativa
          </Link>
          <Link href="/dashboard/inspeccion-vigilancia" className="text-sm font-medium hover:text-primary">
            Inspección y Vigilancia
          </Link>
          <Link href="/dashboard/cobertura-infraestructura" className="text-sm font-medium hover:text-primary">
            Cobertura e Infraestructura
          </Link>
          <Link href="/dashboard/talento-humano" className="text-sm font-medium hover:text-primary">
            Talento Humano
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button variant="ghost" className="md:hidden" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-3">
            <Link
              href="/dashboard"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/dashboard/despacho"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Despacho
            </Link>
            <Link
              href="/dashboard/planeacion"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Planeación
            </Link>
            <Link
              href="/dashboard/calidad-educativa"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calidad Educativa
            </Link>
            <Link
              href="/dashboard/inspeccion-vigilancia"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inspección y Vigilancia
            </Link>
            <Link
              href="/dashboard/cobertura-infraestructura"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cobertura e Infraestructura
            </Link>
            <Link
              href="/dashboard/talento-humano"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Talento Humano
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
