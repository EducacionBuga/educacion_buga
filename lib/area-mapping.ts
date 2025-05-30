// Area ID mapping - maps string keys to UUIDs
export const AREA_ID_MAP: Record<string, string> = {
  'calidad-educativa': 'e286546b-216c-49cd-9a96-42366c0977f2',
  'inspeccion-vigilancia': '502d6c5d-0a1e-43fa-85b7-ae91f774310d', 
  'cobertura-infraestructura': '2d8bf8a1-0557-4974-8212-a2f4a93a4fb2',
  'talento-humano': '15bb34b0-25eb-407f-9ce7-f781fcd04ecc',
  'planeacion': '05f3dac0-933e-46f8-aa80-17c7c0a906c1',
  'despacho': '9850c4bd-119a-444d-831f-2f410bbbaf8b'
};

// Reverse mapping - maps UUIDs to string keys  
export const UUID_TO_AREA_KEY_MAP: Record<string, string> = {
  'e286546b-216c-49cd-9a96-42366c0977f2': 'calidad-educativa',
  '502d6c5d-0a1e-43fa-85b7-ae91f774310d': 'inspeccion-vigilancia', 
  '2d8bf8a1-0557-4974-8212-a2f4a93a4fb2': 'cobertura-infraestructura',
  '15bb34b0-25eb-407f-9ce7-f781fcd04ecc': 'talento-humano',
  '05f3dac0-933e-46f8-aa80-17c7c0a906c1': 'planeacion',
  '9850c4bd-119a-444d-831f-2f410bbbaf8b': 'despacho'
};

/**
 * Convert area key to UUID
 * @param areaKey - The area key (e.g., "calidad-educativa")
 * @returns The corresponding UUID or the input if it's already a UUID
 */
export function getAreaUUID(areaKey: string): string {
  // If it's already a UUID format, return as-is
  if (areaKey.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return areaKey;
  }
  
  // Otherwise, map the key to UUID
  return AREA_ID_MAP[areaKey] || areaKey;
}

/**
 * Convert UUID to area key
 * @param uuid - The area UUID
 * @returns The corresponding area key or the input if not found
 */
export function getAreaKey(uuid: string): string {
  return UUID_TO_AREA_KEY_MAP[uuid] || uuid;
}
