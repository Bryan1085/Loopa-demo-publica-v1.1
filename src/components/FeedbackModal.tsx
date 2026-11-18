import React, { useMemo, useState } from 'react';
import {
  Bug,
  Camera,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Mail,
  MessageSquare,
  Send,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import {
  copyFeedbackReportToClipboard,
  createFeedbackReportPayload,
  downloadFeedbackReportJson,
  downloadFeedbackScreenshot,
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
  FeedbackTechnicalMetadata,
  formatFeedbackReportText,
  getFeedbackTransport,
} from '../core/feedback/feedbackService';

interface FeedbackModalProps {
  technicalMetadata: FeedbackTechnicalMetadata;
  onCaptureScreenshot: () => string | null;
  onClose: () => void;
  onNotify?: (message: string) => void;
}

const CATEGORY_ICONS: Record<FeedbackCategory, React.ReactNode> = {
  bug: <Bug className="w-4 h-4 text-[#f87171] shrink-0" />,
  improvement: <Lightbulb className="w-4 h-4 text-[#facc15] shrink-0" />,
  tool: <Wrench className="w-4 h-4 text-[#38bdf8] shrink-0" />,
  general: <MessageSquare className="w-4 h-4 text-[#5ecd6e] shrink-0" />,
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  technicalMetadata,
  onCaptureScreenshot,
  onClose,
  onNotify,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [message, setMessage] = useState('');
  const [includeTechnicalInfo, setIncludeTechnicalInfo] = useState(true);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(
    () => onCaptureScreenshot(),
  );
  const [statusNotice, setStatusNotice] = useState<{
    kind: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transport = getFeedbackTransport();
  const hasMessage = message.trim().length > 0;

  const payload = useMemo(
    () =>
      createFeedbackReportPayload({
        category,
        message,
        includeTechnicalInfo,
        technicalInfo: technicalMetadata,
        screenshotDataUrl,
      }),
    [category, includeTechnicalInfo, message, screenshotDataUrl, technicalMetadata],
  );

  const handleRecapture = () => {
    const next = onCaptureScreenshot();
    if (next) {
      setScreenshotDataUrl(next);
      setStatusNotice({
        kind: 'info',
        text: 'Captura del viewport actualizada.',
      });
    } else {
      setStatusNotice({
        kind: 'error',
        text: 'No se pudo generar una captura del viewport en este momento.',
      });
    }
  };

  const handleCopyReport = async () => {
    if (!hasMessage) return;
    const ok = await copyFeedbackReportToClipboard(payload);
    if (ok) {
      setStatusNotice({
        kind: 'success',
        text: 'Reporte copiado al portapapeles.',
      });
      onNotify?.('Reporte copiado al portapapeles');
    } else {
      setStatusNotice({
        kind: 'error',
        text: 'El navegador no permitió copiar automáticamente. Usa "Descargar reporte (.json)".',
      });
    }
  };

  const handleDownloadJson = () => {
    if (!hasMessage) return;
    downloadFeedbackReportJson(payload);
    setStatusNotice({
      kind: 'success',
      text: 'Archivo JSON del reporte descargado.',
    });
  };

  const handleDownloadScreenshot = () => {
    if (!screenshotDataUrl) return;
    downloadFeedbackScreenshot(screenshotDataUrl, payload.id);
    setStatusNotice({
      kind: 'success',
      text: 'Captura descargada.',
    });
  };

  const handleMailto = () => {
    if (!hasMessage) return;
    const catLabel =
      FEEDBACK_CATEGORIES.find((c) => c.id === category)?.label ?? category;
    const subject = encodeURIComponent(
      `[LOOPA Demo] ${catLabel}`,
    );
    const fullText = formatFeedbackReportText(payload);
    const trimmedBody =
      fullText.length > 1600
        ? `${fullText.slice(0, 1550)}\n\n[Texto acortado para enlace de correo; descarga el JSON si necesitas el detalle completo.]`
        : fullText;
    const body = encodeURIComponent(trimmedBody);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleRemoteSubmit = async () => {
    if (!hasMessage || !transport.isConfigured) return;
    setIsSubmitting(true);
    try {
      const res = await transport.submit(payload);
      if (res.delivered) {
        setStatusNotice({ kind: 'success', text: res.message });
        onNotify?.(res.message);
      } else {
        setStatusNotice({ kind: 'info', text: res.message });
      }
    } catch {
      setStatusNotice({
        kind: 'error',
        text: 'Ocurrió un error al intentar enviar el reporte. Puedes copiarlo o descargarlo en JSON.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="feedback-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[92vh] rounded-2xl bg-[#181a1f] border border-[#323640] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#282c36] bg-[#14161b] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#5ecd6e]" />
            <h2 className="text-sm font-bold text-[#f3f4f6]">
              Comentarios y reporte de errores
            </h2>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Cerrar comentarios"
            className="w-8 h-8 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#323640] text-[#9ca3af] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto cad-scroll p-4 sm:p-5 space-y-4">
          {/* Category Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#cbd5e1]">
              Categoría
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      selected
                        ? 'bg-[#16261a] border-[#5ecd6e]/70 text-[#f3f4f6]'
                        : 'bg-[#14161b] hover:bg-[#1e2128] border-[#2a2e38] text-[#cbd5e1]'
                    }`}
                  >
                    <span className="mt-0.5">{CATEGORY_ICONS[cat.id]}</span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold">
                        {cat.label}
                      </span>
                      <span className="block text-[11px] text-[#8e95a2] leading-snug mt-0.5">
                        {cat.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label
              htmlFor="feedback-message-input"
              className="block text-xs font-semibold text-[#cbd5e1]"
            >
              Tu mensaje
            </label>
            <textarea
              id="feedback-message-input"
              data-testid="feedback-message-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe el problema encontrado, pasos para reproducirlo, mejora o herramienta que te gustaría tener..."
              className="w-full rounded-xl bg-[#111317] border border-[#2f3440] focus:border-[#5ecd6e] px-3 py-2.5 text-xs text-[#f3f4f6] placeholder:text-[#6b7280] outline-none resize-y min-h-[96px]"
            />
          </div>

          {/* Optional Viewport Screenshot */}
          <div className="rounded-xl bg-[#14161b] border border-[#282c36] p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#e4e6eb]">
                <ImageIcon className="w-4 h-4 text-[#5ecd6e]" />
                <span>Captura de pantalla del visor (opcional)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRecapture}
                  className="h-8 px-2.5 rounded-lg bg-[#20242c] hover:bg-[#2a2f3a] border border-[#323744] text-[11px] font-medium text-[#e4e6eb] flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#5ecd6e]" />
                  <span>{screenshotDataUrl ? 'Recapturar' : 'Capturar visor'}</span>
                </button>
                {screenshotDataUrl && (
                  <button
                    type="button"
                    onClick={() => setScreenshotDataUrl(null)}
                    aria-label="Quitar captura"
                    className="h-8 px-2.5 rounded-lg bg-[#261a1d] hover:bg-[#352025] border border-[#4c2830] text-[11px] font-medium text-[#fca5a5] flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar</span>
                  </button>
                )}
              </div>
            </div>

            {screenshotDataUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={screenshotDataUrl}
                  alt="Captura del viewport actual"
                  className="w-32 h-20 object-cover rounded-lg border border-[#303542] bg-[#0f1115]"
                />
                <div className="text-[11px] text-[#9ca3af] space-y-1">
                  <div>Captura lista para adjuntar al reporte.</div>
                  <button
                    type="button"
                    onClick={handleDownloadScreenshot}
                    className="text-[#7def8e] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar imagen</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#8e95a2]">
                No hay ninguna captura adjunta. Puedes tomar una del estado actual del visor si ayuda a explicar tu comentario.
              </p>
            )}
          </div>

          {/* Transparent Basic Technical Metadata */}
          <div className="rounded-xl bg-[#14161b] border border-[#282c36] p-3 space-y-2">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#e4e6eb]">
                <input
                  type="checkbox"
                  checked={includeTechnicalInfo}
                  onChange={(e) => setIncludeTechnicalInfo(e.target.checked)}
                  className="accent-[#5ecd6e]"
                />
                <span>Incluir información técnica básica</span>
              </span>
              <span className="text-[10px] text-[#8e95a2]">
                Sin datos personales ni geometría
              </span>
            </label>

            {includeTechnicalInfo && (
              <div className="rounded-lg bg-[#101216] border border-[#232730] p-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#9ca3af] font-mono-tabular">
                <span className="truncate">
                  Edición: {technicalMetadata.appEdition} v{technicalMetadata.appVersion}
                </span>
                <span className="truncate">
                  SO: {technicalMetadata.operatingSystem}
                </span>
                <span className="truncate">
                  Navegador: {technicalMetadata.browser}
                </span>
                <span className="truncate">
                  Visor: {technicalMetadata.viewportSize}
                </span>
                <span className="truncate">
                  Modo: {technicalMetadata.workMode === 'edit' ? `Edición (${technicalMetadata.editSelectionMode})` : 'Objeto'}
                </span>
                <span className="truncate">
                  Objetos: {technicalMetadata.sceneObjectCount}
                </span>
              </div>
            )}
          </div>

          {/* Honest Transport / Readiness Notice */}
          <div className="rounded-xl bg-[#161b23] border border-[#2d3b4e] p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#b4c3d8] leading-relaxed">
              {transport.isConfigured
                ? 'Tu reporte se enviará usando el canal configurado sin incluir datos personales ni tu modelo 3D.'
                : 'Esta Demo aún no tiene un servidor de envío directo conectado. Preparamos el reporte completo para que puedas copiarlo, descargarlo en JSON o abrirlo en tu cliente de correo sin simular envíos falsos.'}
            </p>
          </div>

          {statusNotice && (
            <div
              className={`rounded-xl border p-2.5 text-xs flex items-center gap-2 ${
                statusNotice.kind === 'success'
                  ? 'bg-[#13251a] border-[#5ecd6e]/50 text-[#7def8e]'
                  : statusNotice.kind === 'error'
                    ? 'bg-[#2a171a] border-[#7f1d1d] text-[#fca5a5]'
                    : 'bg-[#161c26] border-[#3b82f6]/40 text-[#bfdbfe]'
              }`}
            >
              {statusNotice.kind === 'success' && (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{statusNotice.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-5 py-3.5 border-t border-[#282c36] bg-[#14161b] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="feedback-copy-btn"
              disabled={!hasMessage}
              onClick={() => void handleCopyReport()}
              className="min-h-[38px] px-3 rounded-lg bg-[#22252d] hover:bg-[#2c313b] disabled:opacity-45 disabled:pointer-events-none border border-[#343a47] text-xs font-semibold text-[#e4e6eb] flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-[#5ecd6e]" />
              <span>Copiar reporte</span>
            </button>

            <button
              type="button"
              data-testid="feedback-download-btn"
              disabled={!hasMessage}
              onClick={handleDownloadJson}
              className="min-h-[38px] px-3 rounded-lg bg-[#22252d] hover:bg-[#2c313b] disabled:opacity-45 disabled:pointer-events-none border border-[#343a47] text-xs font-semibold text-[#e4e6eb] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Descargar JSON</span>
            </button>

            <button
              type="button"
              disabled={!hasMessage}
              onClick={handleMailto}
              className="min-h-[38px] px-3 rounded-lg bg-[#22252d] hover:bg-[#2c313b] disabled:opacity-45 disabled:pointer-events-none border border-[#343a47] text-xs font-semibold text-[#e4e6eb] flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#cbd5e1]" />
              <span>Correo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {transport.isConfigured && (
              <button
                type="button"
                disabled={!hasMessage || isSubmitting}
                onClick={() => void handleRemoteSubmit()}
                className="min-h-[38px] px-3.5 rounded-lg bg-[#49b459] hover:bg-[#5ecd6e] disabled:opacity-45 text-[#0d1114] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar'}</span>
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="min-h-[38px] px-3.5 rounded-lg bg-[#1d2027] hover:bg-[#272b34] border border-[#323744] text-xs font-semibold text-[#cbd5e1] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
