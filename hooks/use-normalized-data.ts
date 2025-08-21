import { useMemo, useCallback } from "react";
import { type Programa, type Meta, type ProgramasMetasNormalized } from "@/types/plan-accion-form";

interface UseNormalizedDataProps {
  programas: Array<{ id?: string; nombre: string }>;
  metas: Array<{ id?: string; nombre: string }>;
  selectedPrograma?: string;
  onProgramaChange?: (programa: string) => void;
  onMetaChange?: (meta: string) => void;
}

interface UseNormalizedDataReturn {
  normalizedProgramas: ProgramasMetasNormalized<Programa>;
  normalizedMetas: ProgramasMetasNormalized<Meta>;
  availableMetas: Meta[];
  selectedProgramaData: Programa | null;
  handleProgramaChange: (programaNombre: string) => void;
  handleMetaChange: (metaNombre: string) => void;
}

/**
 * Hook para normalizar datos de programas y metas usando el patrón byId/allIds
 */
export const useNormalizedData = ({
  programas,
  metas,
  selectedPrograma,
  onProgramaChange,
  onMetaChange
}: UseNormalizedDataProps): UseNormalizedDataReturn => {

  // Normalizar programas usando el patrón byId/allIds
  const normalizedProgramas = useMemo((): ProgramasMetasNormalized<Programa> => {
    const byId: Record<string, Programa> = {};
    const allIds: string[] = [];

    programas.forEach((programa, index) => {
      const id = programa.id || `programa-${index}-${programa.nombre.replace(/\s+/g, '-').toLowerCase()}`;
      const normalizedPrograma: Programa = {
        id,
        nombre: programa.nombre
      };
      
      byId[id] = normalizedPrograma;
      allIds.push(id);
    });

    return { byId, allIds };
  }, [programas]);

  // Normalizar metas usando el patrón byId/allIds
  const normalizedMetas = useMemo((): ProgramasMetasNormalized<Meta> => {
    const byId: Record<string, Meta> = {};
    const allIds: string[] = [];

    metas.forEach((meta, index) => {
      const id = meta.id || `meta-${index}-${meta.nombre.replace(/\s+/g, '-').toLowerCase()}`;
      const normalizedMeta: Meta = {
        id,
        programaId: selectedPrograma || "",
        nombre: meta.nombre
      };
      
      byId[id] = normalizedMeta;
      allIds.push(id);
    });

    return { byId, allIds };
  }, [metas, selectedPrograma]);

  // Obtener programa seleccionado por nombre
  const selectedProgramaData = useMemo((): Programa | null => {
    if (!selectedPrograma) return null;
    
    return normalizedProgramas.allIds
      .map(id => normalizedProgramas.byId[id])
      .find(programa => programa.nombre === selectedPrograma) || null;
  }, [selectedPrograma, normalizedProgramas]);

  // Filtrar metas disponibles basadas en el programa seleccionado
  const availableMetas = useMemo((): Meta[] => {
    if (!selectedPrograma) return [];
    
    return normalizedMetas.allIds
      .map(id => normalizedMetas.byId[id])
      .filter(meta => meta.programaId === selectedPrograma || meta.programaId === "");
  }, [selectedPrograma, normalizedMetas]);

  // Manejar cambio de programa con limpieza de meta
  const handleProgramaChange = useCallback((programaNombre: string) => {
    onProgramaChange?.(programaNombre);
    
    // Limpiar meta seleccionada cuando cambia el programa
    onMetaChange?.("");
  }, [onProgramaChange, onMetaChange]);

  // Manejar cambio de meta
  const handleMetaChange = useCallback((metaNombre: string) => {
    onMetaChange?.(metaNombre);
  }, [onMetaChange]);

  return {
    normalizedProgramas,
    normalizedMetas,
    availableMetas,
    selectedProgramaData,
    handleProgramaChange,
    handleMetaChange
  };
};

/**
 * Hook para buscar en datos normalizados
 */
export const useNormalizedSearch = <T extends { id: string; nombre: string }>(
  normalizedData: ProgramasMetasNormalized<T>,
  searchQuery: string
) => {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return normalizedData.allIds.map(id => normalizedData.byId[id]);
    }

    const query = searchQuery.toLowerCase();
    return normalizedData.allIds
      .map(id => normalizedData.byId[id])
      .filter(item => item.nombre.toLowerCase().includes(query));
  }, [normalizedData, searchQuery]);
};