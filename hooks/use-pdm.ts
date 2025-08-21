import { useState, useCallback, useMemo } from "react";
import { ProgramaPDM, SubprogramaPDM } from "@/types/plan-accion-form";
import { type PlanAccionItem } from "@/types/plan-accion";
import { planesDesarrolloMunicipal, getSubprogramasByPrograma, getProyectosBySubprograma } from "@/constants/plan-desarrollo-municipal";

interface UsePDMProps {
  updateField: (field: keyof PlanAccionItem, value: any) => void;
}

export const usePDM = ({ updateField }: UsePDMProps) => {
  const [incluir, setIncluir] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedSubprograma, setSelectedSubprograma] = useState("");
  const [selectedProyecto, setSelectedProyecto] = useState("");

  // Normalizar datos de programas PDM
  const normalizedProgramas = useMemo(() => {
    return planesDesarrolloMunicipal.map((programa, index) => ({
      id: programa.id || `programa-${index}`,
      nombre: programa.nombre,
      subprogramas: programa.subprogramas || []
    }));
  }, []);

  // Obtener subprogramas del programa seleccionado
  const subprogramas = useMemo(() => {
    if (!selectedPrograma) return [];
    return getSubprogramasByPrograma(selectedPrograma);
  }, [selectedPrograma]);

  // Obtener proyectos del subprograma seleccionado
  const proyectos = useMemo(() => {
    if (!selectedSubprograma) return [];
    return getProyectosBySubprograma(selectedSubprograma);
  }, [selectedSubprograma]);

  // Manejar cambio de inclusión
  const handleIncluirChange = useCallback((value: boolean) => {
    setIncluir(value);
    if (!value) {
      // Limpiar todos los campos cuando se desactiva
      setSelectedPrograma("");
      setSelectedSubprograma("");
      setSelectedProyecto("");
      updateField("programaPDM", "");
      updateField("subprogramaPDM", "");
      updateField("proyectoPDM", "");
    }
  }, [updateField]);

  // Manejar cambio de programa
  const handleProgramaChange = useCallback((programa: string) => {
    setSelectedPrograma(programa);
    setSelectedSubprograma(""); // Resetear subprograma
    setSelectedProyecto(""); // Resetear proyecto
    updateField("programaPDM", programa);
    updateField("subprogramaPDM", "");
    updateField("proyectoPDM", "");
  }, [updateField]);

  // Manejar cambio de subprograma
  const handleSubprogramaChange = useCallback((subprograma: string) => {
    setSelectedSubprograma(subprograma);
    setSelectedProyecto(""); // Resetear proyecto
    updateField("subprogramaPDM", subprograma);
    updateField("proyectoPDM", "");
  }, [updateField]);

  // Manejar cambio de proyecto
  const handleProyectoChange = useCallback((proyecto: string) => {
    setSelectedProyecto(proyecto);
    updateField("proyectoPDM", proyecto);
  }, [updateField]);

  // Manejar descarga del PDM
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/document/plan-de-desarrollo.xlsx';
    link.download = 'plan-de-desarrollo.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Validar si la sección está completa
  const isValid = useMemo(() => {
    if (!incluir) return true; // Si no está incluido, es válido
    return selectedPrograma && selectedSubprograma && selectedProyecto;
  }, [incluir, selectedPrograma, selectedSubprograma, selectedProyecto]);

  return {
    incluir,
    selectedPrograma,
    selectedSubprograma,
    selectedProyecto,
    normalizedProgramas,
    subprogramas,
    proyectos,
    isValid,
    handleIncluirChange,
    handleProgramaChange,
    handleSubprogramaChange,
    handleProyectoChange,
    handleDownload
  };
};