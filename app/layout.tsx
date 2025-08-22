import type React from "react"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context"
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary, { ProductionErrorFallback } from "@/components/error-boundary"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata = {
  title: "Sistema de Gestión Educativa",
  description: "Sistema de gestión educativa con control de roles",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${poppins.variable} font-poppins`}>
        <ErrorBoundary fallback={ProductionErrorFallback}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem 
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
