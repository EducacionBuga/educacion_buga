import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BaseSectionProps } from "@/types/plan-accion-form";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  colorScheme: 'blue' | 'green' | 'orange' | 'purple' | 'indigo';
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800'
  },
  green: {
    bg: 'bg-green-50 hover:bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800'
  },
  orange: {
    bg: 'bg-orange-50 hover:bg-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-800'
  },
  purple: {
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-800'
  },
  indigo: {
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    border: 'border-indigo-200',
    text: 'text-indigo-800'
  }
};

/**
 * Componente base para secciones colapsables con esquemas de color consistentes
 */
export const CollapsibleSection = React.memo<CollapsibleSectionProps>(({ 
  isOpen, 
  onToggle, 
  isValid, 
  title, 
  subtitle, 
  colorScheme, 
  children, 
  headerActions 
}) => {
  const colors = colorSchemes[colorScheme];

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className={cn(
        "flex items-center justify-between w-full p-4 rounded-lg transition-colors",
        colors.bg
      )}>
        <CollapsibleTrigger className="flex items-center space-x-2 flex-1">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
          <h3 className={cn("text-lg font-semibold", colors.text)}>
            {title}
          </h3>
          {subtitle && (
            <span className={cn("text-sm", colors.text.replace('800', '600'))}>
              {subtitle}
            </span>
          )}
          {isValid && (
            <span className="text-green-600 text-sm" aria-label="Sección completa">
              ✓ Completa
            </span>
          )}
        </CollapsibleTrigger>
        {headerActions && (
          <div className="ml-2">
            {headerActions}
          </div>
        )}
      </div>
      <CollapsibleContent className={cn(
        "p-4 border rounded-b-lg",
        colors.border
      )}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
});

CollapsibleSection.displayName = "CollapsibleSection";