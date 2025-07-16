"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, X, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SessionExpiryNotification() {
  const { timeUntilExpiry, refreshSession, logout } = useAuth()
  const [showNotification, setShowNotification] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const WARNING_TIME = 5 * 60 * 1000 // 5 minutos en milisegundos
  const isExpiringSoon = timeUntilExpiry <= WARNING_TIME && timeUntilExpiry > 0

  useEffect(() => {
    if (isExpiringSoon && !dismissed) {
      setShowNotification(true)
    } else {
      setShowNotification(false)
      setDismissed(false)
    }
  }, [isExpiringSoon, dismissed])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleExtendSession = () => {
    refreshSession()
    setDismissed(true)
    setShowNotification(false)
  }

  const handleLogout = () => {
    logout()
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowNotification(false)
  }

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 z-50 w-full max-w-md"
        >
          <Alert className="border-orange-500 bg-orange-50 text-orange-800">
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3">
              <div>
                <strong>Su sesión expirará pronto</strong>
                <p className="text-sm">
                  Tiempo restante: <span className="font-mono font-bold">{formatTime(timeUntilExpiry)}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleExtendSession}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Extender sesión
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="ml-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
