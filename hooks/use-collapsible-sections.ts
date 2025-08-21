import { useReducer, useCallback } from "react";
import { FormSection, SectionsState } from "@/types/plan-accion-form";

// Reducer para manejar el estado de secciones colapsables
type SectionAction = {
  type: 'TOGGLE_SECTION';
  section: FormSection;
} | {
  type: 'SET_SECTION';
  section: FormSection;
  isOpen: boolean;
} | {
  type: 'RESET_SECTIONS';
};

const sectionsReducer = (state: SectionsState, action: SectionAction): SectionsState => {
  switch (action.type) {
    case 'TOGGLE_SECTION':
      return {
        ...state,
        [action.section]: !state[action.section]
      };
    case 'SET_SECTION':
      return {
        ...state,
        [action.section]: action.isOpen
      };
    case 'RESET_SECTIONS':
      return {
        [FormSection.BASICA]: true,
        [FormSection.DEMOGRAFICA]: false,
        [FormSection.ESPECIFICA]: false,
        [FormSection.DECENAL]: false,
        [FormSection.PDM]: false
      };
    default:
      return state;
  }
};

const initialState: SectionsState = {
  [FormSection.BASICA]: true,
  [FormSection.DEMOGRAFICA]: false,
  [FormSection.ESPECIFICA]: false,
  [FormSection.DECENAL]: false,
  [FormSection.PDM]: false
};

export const useCollapsibleSections = () => {
  const [sectionsState, dispatch] = useReducer(sectionsReducer, initialState);

  const toggleSection = useCallback((section: FormSection) => {
    dispatch({ type: 'TOGGLE_SECTION', section });
  }, []);

  const setSection = useCallback((section: FormSection, isOpen: boolean) => {
    dispatch({ type: 'SET_SECTION', section, isOpen });
  }, []);

  const resetSections = useCallback(() => {
    dispatch({ type: 'RESET_SECTIONS' });
  }, []);

  return {
    sectionsState,
    toggleSection,
    setSection,
    resetSections
  };
};