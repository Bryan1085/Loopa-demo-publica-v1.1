import { EditSelectionMode } from '../mesh/operations';
import { TransformTool, WorkMode } from '../project/types';
import { AppCapabilities, getAppCapabilities } from '../../config/appCapabilities';

export type FeedbackCategory = 'bug' | 'improvement' | 'tool' | 'general';

export const FEEDBACK_CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  description: string;
}[] = [
  {
    id: 'bug',
    label: 'Reportar un error',
    description: 'Algo falló, se bloqueó o se comportó de forma inesperada.',
  },
  {
    id: 'improvement',
    label: 'Sugerir una mejora',
    description: 'Ideas para hacer más cómodo o preciso el flujo actual.',
  },
  {
    id: 'tool',
    label: 'Solicitar una herramienta',
    description: 'Nueva función, modificador u operador que te gustaría ver.',
  },
  {
    id: 'general',
    label: 'Opinión general',
    description: 'Cuéntanos qué te pareció la experiencia usando LOOPA Demo.',
  },
];

export interface FeedbackTechnicalMetadata {
  appEdition: string;
  appVersion: string;
  timestampIso: string;
  browser: string;
  operatingSystem: string;
  language: string;
  viewportSize: string;
  touchCapable: boolean;
  workMode: WorkMode;
  editSelectionMode: EditSelectionMode;
  activeTool: TransformTool;
  sceneObjectCount: number;
}

export interface FeedbackReportPayload {
  id: string;
  category: FeedbackCategory;
  message: string;
  includeTechnicalInfo: boolean;
  technicalInfo: FeedbackTechnicalMetadata | null;
  screenshotDataUrl: string | null;
}

export interface FeedbackSubmitResult {
  delivered: boolean;
  backendConfigured: boolean;
  message: string;
}

export interface FeedbackTransportAdapter {
  readonly isConfigured: boolean;
  submit(payload: FeedbackReportPayload): Promise<FeedbackSubmitResult>;
}

const unconfiguredTransportAdapter: FeedbackTransportAdapter = {
  isConfigured: false,
  async submit(): Promise<FeedbackSubmitResult> {
    return {
      delivered: false,
      backendConfigured: false,
      message:
        'Aún no hay un servidor de recepción conectado en esta Demo. Puedes copiar o descargar el reporte completo para enviarlo manualmente.',
    };
  },
};

let activeFeedbackTransport: FeedbackTransportAdapter =
  unconfiguredTransportAdapter;

export function registerFeedbackTransport(
  adapter: FeedbackTransportAdapter | null,
): void {
  activeFeedbackTransport = adapter ?? unconfiguredTransportAdapter;
}

export function getFeedbackTransport(): FeedbackTransportAdapter {
  return activeFeedbackTransport;
}

function detectBrowserSummary(ua: string): string {
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Mozilla Firefox';
  if (/CriOS\//.test(ua)) return 'Chrome (iOS/iPadOS)';
  if (/FxiOS\//.test(ua)) return 'Firefox (iOS/iPadOS)';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Google Chrome';
  if (/Safari\//.test(ua) && !/Chrome|Chromium/.test(ua)) return 'Safari';
  return 'Navegador web';
}

function detectOsSummary(ua: string, maxTouchPoints: number): string {
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) {
    return 'iPadOS';
  }
  if (/iPhone|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Sistema desconocido';
}

const TOOL_LABELS: Record<TransformTool, string> = {
  select: 'Seleccionar',
  move: 'Mover',
  rotate: 'Rotar',
  scale: 'Escalar',
  all: 'Gizmo combinado',
};

export function collectFeedbackTechnicalMetadata(params: {
  workMode: WorkMode;
  editSelectionMode: EditSelectionMode;
  activeTool: TransformTool;
  sceneObjectCount: number;
  capabilities?: AppCapabilities;
}): FeedbackTechnicalMetadata {
  const caps = params.capabilities ?? getAppCapabilities();
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const ua = nav?.userAgent ?? '';
  const maxTouchPoints = nav?.maxTouchPoints ?? 0;
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  const height = typeof window !== 'undefined' ? window.innerHeight : 0;

  return {
    appEdition: caps.editionLabel,
    appVersion: caps.version,
    timestampIso: new Date().toISOString(),
    browser: detectBrowserSummary(ua),
    operatingSystem: detectOsSummary(ua, maxTouchPoints),
    language: nav?.language ?? 'es',
    viewportSize: `${width}×${height}`,
    touchCapable: maxTouchPoints > 0,
    workMode: params.workMode,
    editSelectionMode: params.editSelectionMode,
    activeTool: params.activeTool,
    sceneObjectCount: params.sceneObjectCount,
  };
}

export function createFeedbackReportPayload(params: {
  category: FeedbackCategory;
  message: string;
  includeTechnicalInfo: boolean;
  technicalInfo: FeedbackTechnicalMetadata;
  screenshotDataUrl: string | null;
}): FeedbackReportPayload {
  return {
    id: `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    category: params.category,
    message: params.message.trim(),
    includeTechnicalInfo: params.includeTechnicalInfo,
    technicalInfo: params.includeTechnicalInfo ? params.technicalInfo : null,
    screenshotDataUrl: params.screenshotDataUrl,
  };
}

export function formatFeedbackReportText(
  payload: FeedbackReportPayload,
): string {
  const catMeta =
    FEEDBACK_CATEGORIES.find((c) => c.id === payload.category)?.label ??
    payload.category;
  const lines: string[] = [
    `=== Comentario / Reporte LOOPA ===`,
    `ID: ${payload.id}`,
    `Tipo: ${catMeta}`,
    '',
    `Descripción:`,
    payload.message,
  ];

  if (payload.includeTechnicalInfo && payload.technicalInfo) {
    const t = payload.technicalInfo;
    lines.push(
      '',
      '--- Información técnica básica ---',
      `Edición: ${t.appEdition} v${t.appVersion}`,
      `Fecha: ${t.timestampIso}`,
      `Navegador: ${t.browser}`,
      `Sistema operativo: ${t.operatingSystem}`,
      `Idioma: ${t.language}`,
      `Viewport: ${t.viewportSize} (Táctil: ${t.touchCapable ? 'Sí' : 'No'})`,
      `Modo activo: ${t.workMode === 'edit' ? `Edición (${t.editSelectionMode})` : 'Objeto'}`,
      `Herramienta activa: ${TOOL_LABELS[t.activeTool] ?? t.activeTool}`,
      `Objetos de modelado en escena: ${t.sceneObjectCount}`,
    );
  }

  if (payload.screenshotDataUrl) {
    lines.push('', '[Incluye captura de pantalla del viewport adjunta aparte]');
  }

  return lines.join('\n');
}

export async function copyFeedbackReportToClipboard(
  payload: FeedbackReportPayload,
): Promise<boolean> {
  const text = formatFeedbackReportText(payload);
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function downloadFeedbackReportJson(
  payload: FeedbackReportPayload,
): void {
  const content = JSON.stringify(payload, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `loopa-feedback-${payload.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadFeedbackScreenshot(
  dataUrl: string,
  reportId: string,
): void {
  const ext = dataUrl.startsWith('data:image/webp') ? 'webp' : 'png';
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `loopa-captura-${reportId}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
