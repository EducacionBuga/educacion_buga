"use client"

import { useState, useEffect, forwardRef } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

export interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  id?: string
  name?: string
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Seleccionar fecha",
      error,
      disabled = false,
      minDate,
      maxDate,
      id,
      name,
      className,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    // Cerrar el calendario cuando se selecciona una fecha
    useEffect(() => {
      if (value) {
        setIsOpen(false)
      }
    }, [value])

    return (
      <div ref={ref} className="relative w-full">
        <Button
          type="button"
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
            className,
          )}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          onClick={() => setIsOpen(!isOpen)}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy", { locale: es }) : placeholder}
        </Button>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-popover rounded-md border shadow-md">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={(date) => {
                onChange(date)
                setIsOpen(false)
              }}
              disabled={(date) => {
                const isBeforeMinDate = minDate ? date < minDate : false
                const isAfterMaxDate = maxDate ? date > maxDate : false
                return disabled || isBeforeMinDate || isAfterMaxDate
              }}
              initialFocus
            />
          </div>
        )}
      </div>
    )
  },
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
