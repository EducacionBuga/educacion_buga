"use client"

import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"

export function WelcomeHeader() {
  const { user } = useAuth()
  const currentHour = new Date().getHours()

  const getGreeting = () => {
    if (currentHour < 12) return "Buenos días"
    if (currentHour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  const getTimeBasedMessage = () => {
    if (currentHour < 12) return "¡Que tengas un excelente inicio de día!"
    if (currentHour < 18) return "¡Que tengas una productiva tarde!"
    return "¡Que tengas una excelente noche!"
  }

  return (
    <div className="flex flex-col space-y-1.5">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {getGreeting()}, {user?.name || "Usuario"}
      </motion.h2>
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {getTimeBasedMessage()} Aquí tienes un resumen de tu actividad reciente.
      </motion.p>
    </div>
  )
}
