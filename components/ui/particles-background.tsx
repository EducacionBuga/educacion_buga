"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  color: string
  rotation: number
  rotationSpeed: number
  shapeType: number // 0: square, 1: rectangle, 2: diamond
}

interface ParticlesBackgroundProps {
  className?: string
}

export function ParticlesBackground({ className = "" }: ParticlesBackgroundProps) {
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = particlesRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    // Initialize canvas size
    resizeCanvas()

    // Handle window resize
    window.addEventListener("resize", resizeCanvas)

    // Create particles
    const particleCount = Math.min(Math.floor(window.innerWidth / 10), 120)
    particles.current = []

    for (let i = 0; i < particleCount; i++) {
      // Create particles with smaller sizes and angular shapes
      // 1. Different sizes (3 size categories, but smaller)
      // 2. Different opacities (3 opacity levels)
      // 3. Different shapes with corners (square, rectangle, diamond)

      const sizeCategory = Math.floor(Math.random() * 3)
      const opacityCategory = Math.floor(Math.random() * 3)
      const colorCategory = Math.floor(Math.random() * 3)
      const shapeType = Math.floor(Math.random() * 3) // 0: square, 1: rectangle, 2: diamond

      // Size categories: smaller than before
      const sizes = [1.5, 2.5, 3.5]
      const size = sizes[sizeCategory]

      // Opacity categories: subtle, medium, more visible
      const opacities = [0.1, 0.18, 0.25]
      const opacity = opacities[opacityCategory]

      // Color variations: light orange, orange, gold
      const colors = ["rgba(255, 200, 100, ", "rgba(249, 115, 22, ", "rgba(234, 179, 8, "]
      const colorBase = colors[colorCategory]

      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        opacity,
        speed: 0.15 + Math.random() * 0.25,
        color: colorBase,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        shapeType,
      })
    }

    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle) => {
        // Update particle position
        particle.y -= particle.speed
        particle.rotation += particle.rotationSpeed

        // Reset particle when it goes off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10
          particle.x = Math.random() * canvas.width
        }

        // Draw angular particle based on shape type
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillStyle = `${particle.color}${particle.opacity})`

        switch (particle.shapeType) {
          case 0: // Square
            ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2)
            break
          case 1: // Rectangle
            ctx.fillRect(-particle.size * 1.5, -particle.size * 0.75, particle.size * 3, particle.size * 1.5)
            break
          case 2: // Diamond
            ctx.beginPath()
            ctx.moveTo(0, -particle.size * 1.5)
            ctx.lineTo(particle.size, 0)
            ctx.lineTo(0, particle.size * 1.5)
            ctx.lineTo(-particle.size, 0)
            ctx.closePath()
            ctx.fill()
            break
        }

        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={particlesRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.7 }}
    />
  )
}
