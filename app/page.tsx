"use client"
import { LoginForm } from "@/components/auth/login-form"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-64 h-auto mb-4"
          >
            <Image
              src="/images/logo-educacion.png"
              alt="Logo Alcaldía de Guadalajara de Buga - Secretaría de Educación"
              width={256}
              height={200}
              priority
              className="w-full h-auto"
            />
          </motion.div>
          <motion.h1
            className="text-2xl font-bold text-center text-gray-800 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sistema de Gestión Educativa
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Secretaría de Educación
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <LoginForm />
        </motion.div>
      </motion.div>
    </main>
  )
}
