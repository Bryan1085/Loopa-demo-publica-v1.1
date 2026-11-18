import { SceneObjectData } from '../core/project/types';
import { APP_NAME, APP_VERSION } from './brand';

export type AppEdition = 'demo' | 'pro';

export type ProFeatureKey =
  | 'gallery'
  | 'folders'
  | 'multi_project'
  | 'import_obj'
  | 'import_stl'
  | 'export_model'
  | 'native_project_file'
  | 'unlimited_objects'
  | 'autosave';

export interface AppCapabilities {
  edition: AppEdition;
  editionLabel: string;
  version: string;
  maxSceneObjects: number | null;
  galleryEnabled: boolean;
  foldersEnabled: boolean;
  multiProjectEnabled: boolean;
  importObjEnabled: boolean;
  importStlEnabled: boolean;
  exportModelsEnabled: boolean;
  nativeProjectFileEnabled: boolean;
  localSingleWorkspaceOnly: boolean;
  manualSaveRequired: boolean;
  autosaveAllowed: boolean;
  feedbackEnabled: boolean;
}

/**
 * Modalidad activa de la compilación/aplicación.
 * Cambiar a 'pro' (o enlazar con un futuro gestor de licencias) habilita
 * todas las capacidades reservadas sin duplicar motor ni UI.
 */
export const ACTIVE_APP_EDITION: AppEdition = 'demo';

export const DEMO_OBJECT_LIMIT = 10;

export const DEMO_OBJECT_LIMIT_MESSAGE =
  'Has alcanzado el límite de objetos de LOOPA Demo. Descubre LOOPA Pro para llevar tus proyectos más lejos.';

export const DEMO_LOCAL_STORAGE_WARNING =
  'El proyecto se guarda localmente en este navegador. Si borras los datos del navegador o cambias de dispositivo, el proyecto puede perderse.';

export const DEMO_CAPABILITIES: AppCapabilities = {
  edition: 'demo',
  editionLabel: `${APP_NAME} Demo`,
  version: APP_VERSION,
  maxSceneObjects: DEMO_OBJECT_LIMIT,
  galleryEnabled: false,
  foldersEnabled: false,
  multiProjectEnabled: false,
  importObjEnabled: false,
  importStlEnabled: false,
  exportModelsEnabled: false,
  nativeProjectFileEnabled: false,
  localSingleWorkspaceOnly: true,
  manualSaveRequired: true,
  autosaveAllowed: false,
  feedbackEnabled: true,
};

export const PRO_CAPABILITIES: AppCapabilities = {
  edition: 'pro',
  editionLabel: `${APP_NAME} Pro`,
  version: APP_VERSION,
  maxSceneObjects: null,
  galleryEnabled: true,
  foldersEnabled: true,
  multiProjectEnabled: true,
  importObjEnabled: true,
  importStlEnabled: true,
  exportModelsEnabled: true,
  nativeProjectFileEnabled: true,
  localSingleWorkspaceOnly: false,
  manualSaveRequired: false,
  autosaveAllowed: true,
  feedbackEnabled: true,
};

export function getAppCapabilities(
  edition: AppEdition = ACTIVE_APP_EDITION,
): AppCapabilities {
  return edition === 'pro' ? PRO_CAPABILITIES : DEMO_CAPABILITIES;
}

/**
 * Determina si un elemento de SceneData.objects cuenta como objeto de modelado
 * del usuario. Excluye explícitamente cámaras, luces, imágenes de referencia
 * y nunca incluye rejillas, gizmos ni ayudantes visuales del viewport.
 */
export function isUserModelingObject(
  obj: Pick<SceneObjectData, 'objectType'>,
): boolean {
  return obj.objectType === 'mesh' || obj.objectType === 'empty';
}

export function countUserModelingObjects(
  objects: readonly Pick<SceneObjectData, 'objectType'>[],
): number {
  let count = 0;
  for (const obj of objects) {
    if (isUserModelingObject(obj)) {
      count++;
    }
  }
  return count;
}

export interface ObjectLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  maxCount: number | null;
  reason?: string;
}

export function canAddUserModelingObjects(
  currentObjects: readonly Pick<SceneObjectData, 'objectType'>[],
  additionalCount = 1,
  capabilities: AppCapabilities = getAppCapabilities(),
): ObjectLimitCheckResult {
  const currentCount = countUserModelingObjects(currentObjects);
  const maxCount = capabilities.maxSceneObjects;
  if (maxCount === null) {
    return { allowed: true, currentCount, maxCount: null };
  }
  if (additionalCount <= 0) {
    return { allowed: true, currentCount, maxCount };
  }
  if (currentCount + additionalCount > maxCount) {
    return {
      allowed: false,
      currentCount,
      maxCount,
      reason: DEMO_OBJECT_LIMIT_MESSAGE,
    };
  }
  return { allowed: true, currentCount, maxCount };
}

export const PRO_FEATURE_DESCRIPTIONS: Record<ProFeatureKey, string> = {
  gallery: 'Galería completa de proyectos',
  folders: 'Carpetas y organización de proyectos',
  multi_project: 'Administración de múltiples proyectos',
  import_obj: 'Importación de archivos OBJ',
  import_stl: 'Importación de archivos STL',
  export_model: 'Exportación de modelos (OBJ y STL)',
  native_project_file: 'Exportación e importación de archivos de proyecto',
  unlimited_objects: 'Escenas sin límite de 10 objetos',
  autosave: 'Guardado automático y copias de recuperación',
};

export function isProFeatureAllowed(
  feature: ProFeatureKey,
  capabilities: AppCapabilities = getAppCapabilities(),
): { allowed: boolean; reason?: string } {
  let allowed = false;
  switch (feature) {
    case 'gallery':
      allowed = capabilities.galleryEnabled;
      break;
    case 'folders':
      allowed = capabilities.foldersEnabled;
      break;
    case 'multi_project':
      allowed = capabilities.multiProjectEnabled;
      break;
    case 'import_obj':
      allowed = capabilities.importObjEnabled;
      break;
    case 'import_stl':
      allowed = capabilities.importStlEnabled;
      break;
    case 'export_model':
      allowed = capabilities.exportModelsEnabled;
      break;
    case 'native_project_file':
      allowed = capabilities.nativeProjectFileEnabled;
      break;
    case 'unlimited_objects':
      allowed = capabilities.maxSceneObjects === null;
      break;
    case 'autosave':
      allowed = capabilities.autosaveAllowed;
      break;
  }
  if (allowed) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `${PRO_FEATURE_DESCRIPTIONS[feature]} está reservado para ${APP_NAME} Pro.`,
  };
}
