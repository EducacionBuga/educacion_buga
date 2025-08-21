import React from "react";
import { AlertCircle } from "lucide-react";
import { FieldErrorProps } from "@/types/plan-accion-form";
import { cn } from "@/lib/utils";

/**
 * Componente reutilizable para mostrar errores de campo
 */
export const FieldError = React.memo<FieldErrorProps>(({ error, className }) => {
  if (!error) return null;

  return (
    <p className={cn("text-red-500 text-xs mt-1 flex items-center", className)}>
      <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
      {error}
    </p>
  );
});

FieldError.displayName = "FieldError";