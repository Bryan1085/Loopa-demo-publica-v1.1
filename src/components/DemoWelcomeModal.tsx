import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Clock,
  HardDrive,
  Layers,
  RotateCcw,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import {
  DEMO_LOCAL_STORAGE_WARNING,
  DEMO_OBJECT_LIMIT,
  countUserModelingObjects,
} from '../config/appCapabilities';
import { DemoWorkspaceRecord } from '../core/project/storage';
import { LoopaFullLogo } from './BrandLogo';

interface DemoWelcomeModalProps {
  savedRecord: DemoWorkspaceRecord | null;
  startupError: string | null;
  onContinueSaved: () => void;
  onStartFresh: (clearSaved: boolean) => Promise<void> | void;
  onOpenProInfo: () => void;
  onClose?: () => void;
}

function formatSavedDate(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

export const DemoWelcomeModal: React.FC<DemoWelcomeModalProps> = ({
  savedRecord,
  startupError,
  onContinueSaved,
  onStartFresh,
  onOpenProInfo,
  onClose,
}) => {
  const [confirmReplaceSaved, setConfirmReplaceSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const savedModelingCount = savedRecord
    ? savedRecord.project.scenes.reduce(
        (sum, scene) => sum + countUserModelingObjects(scene.objects),
        0,
      )
    : 0;

  const handleConfirmNewWorkspace = async () => {
    setIsResetting(true);
    try {
      await onStartFresh(true);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      data-testid="demo-welcome-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-xl max-h-[92vh] rounded-2xl bg-[#181a1f] border border-[#323640] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#282c36] bg-[#14161b] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <LoopaFullLogo variant="horizontal" className="h-7 w-auto" />
            <span className="px-2 py-0.5 rounded bg-[#16261a] border border-[#5ecd6e]/45 text-[11px] font-bold tracking-wide text-[#7def8e] uppercase shrink-0">
              Demo pública
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar bienvenida"
              className="w-8 h-8 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#323640] text-[#9ca3af] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto cad-scroll p-5 space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-[#f3f4f6]">
              Bienvenido a LOOPA Demo
            </h2>
            <p className="text-xs sm:text-[13px] text-[#b4bac4] leading-relaxed">
              Explora el motor completo de modelado 3D directamente en tu navegador, sin cuentas ni registro previo.
            </p>
          </div>

          {startupError && (
            <div className="rounded-xl bg-[#2a171a] border border-[#7f1d1d] p-3 flex items-start gap-2.5 text-xs text-[#fecaca]">
              <AlertTriangle className="w-4 h-4 text-[#f87171] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">
                  No se pudo comprobar el espacio guardado
                </div>
                <p className="text-[11px] text-[#fca5a5]">{startupError}</p>
              </div>
            </div>
          )}

          {/* Saved Workspace Recovery Card */}
          {savedRecord && !confirmReplaceSaved && (
            <div
              data-testid="demo-saved-workspace-card"
              className="rounded-xl bg-[#131917] border border-[#5ecd6e]/45 p-3.5 space-y-3"
            >
              <div className="flex items-start gap-3">
                {savedRecord.thumbnailDataUrl ? (
                  <img
                    src={savedRecord.thumbnailDataUrl}
                    alt="Vista previa del proyecto guardado"
                    className="w-20 h-14 rounded-lg object-cover border border-[#2f3542] bg-[#101216] shrink-0"
                  />
                ) : (
                  <div className="w-20 h-14 rounded-lg border border-[#2f3542] bg-[#101216] flex items-center justify-center shrink-0">
                    <Box className="w-6 h-6 text-[#5ecd6e]" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-xs font-bold text-[#7def8e]">
                    Se encontró un proyecto guardado en este navegador
                  </div>
                  <div className="text-xs font-semibold text-[#f3f4f6] truncate">
                    {savedRecord.project.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9ca3af]">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#5ecd6e]" />
                      {savedModelingCount} / {DEMO_OBJECT_LIMIT} objetos
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9ca3af]" />
                      {formatSavedDate(savedRecord.savedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  data-testid="demo-continue-saved-btn"
                  onClick={onContinueSaved}
                  className="min-h-[42px] px-3.5 rounded-lg bg-[#49b459] hover:bg-[#5ecd6e] text-[#0d1114] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Continuar proyecto guardado</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-testid="demo-start-new-btn"
                  onClick={() => setConfirmReplaceSaved(true)}
                  className="min-h-[42px] px-3.5 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#343a47] text-[#e4e6eb] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#9ca3af]" />
                  <span>Comenzar uno nuevo</span>
                </button>
              </div>
            </div>
          )}

          {/* Confirmation step before replacing existing saved workspace */}
          {savedRecord && confirmReplaceSaved && (
            <div
              data-testid="demo-confirm-replace-card"
              className="rounded-xl bg-[#261b16] border border-[#d97706]/55 p-3.5 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-[#fde68a]">
                    ¿Reemplazar el proyecto guardado?
                  </div>
                  <p className="text-[11px] text-[#fcd34d]/90 leading-relaxed">
                    Al comenzar un nuevo espacio de trabajo se borrará el proyecto guardado actualmente en este navegador (<strong>{savedRecord.project.name}</strong>). Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setConfirmReplaceSaved(false)}
                  className="min-h-[38px] px-3 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#343a47] text-xs font-semibold text-[#e4e6eb] transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  data-testid="demo-confirm-replace-btn"
                  disabled={isResetting}
                  onClick={() => void handleConfirmNewWorkspace()}
                  className="min-h-[38px] px-3.5 rounded-lg bg-[#d97706] hover:bg-[#f59e0b] text-[#111317] text-xs font-bold transition-colors disabled:opacity-60"
                >
                  {isResetting
                    ? 'Reiniciando...'
                    : 'Reemplazar y empezar nuevo'}
                </button>
              </div>
            </div>
          )}

          {/* Demo Features & Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-[#14161b] border border-[#272b34] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7def8e]">
                <Box className="w-3.5 h-3.5 shrink-0" />
                <span>Modelado completo</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Primitivas, vértices, aristas y caras, extrusión, bisel, inserción, corte bucle, edición proporcional, modificadores y materiales.
              </p>
            </div>

            <div className="rounded-xl bg-[#14161b] border border-[#272b34] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e4e6eb]">
                <Layers className="w-3.5 h-3.5 text-[#5ecd6e] shrink-0" />
                <span>Hasta {DEMO_OBJECT_LIMIT} objetos</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                La escena permite hasta {DEMO_OBJECT_LIMIT} objetos de modelado (sin limitar vértices, aristas ni caras).
              </p>
            </div>

            <div className="rounded-xl bg-[#14161b] border border-[#272b34] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e4e6eb]">
                <Save className="w-3.5 h-3.5 text-[#5ecd6e] shrink-0" />
                <span>Guardado manual</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Sin guardado automático ni sincronización en la nube. Usa el botón <strong>Guardar</strong> cuando quieras conservar tu avance.
              </p>
            </div>
          </div>

          {/* Local Storage Warning */}
          <div className="rounded-xl bg-[#161920] border border-[#2d3340] p-3 flex items-start gap-2.5">
            <HardDrive className="w-4 h-4 text-[#93c5fd] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#b4c3d8] leading-relaxed">
              <strong className="text-[#e2e8f0]">Almacenamiento local:</strong>{' '}
              {DEMO_LOCAL_STORAGE_WARNING} No hay sincronización entre dispositivos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#282c36] bg-[#14161b] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            data-testid="demo-welcome-pro-btn"
            onClick={onOpenProInfo}
            className="min-h-[38px] px-3 rounded-lg bg-[#1d2027] hover:bg-[#252932] border border-[#323744] text-xs font-semibold text-[#cbd5e1] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5ecd6e]" />
            <span>Conocer LOOPA Pro</span>
          </button>

          {!savedRecord && (
            <button
              type="button"
              data-testid="demo-start-modeling-btn"
              onClick={() => void onStartFresh(false)}
              className="min-h-[40px] px-4 rounded-lg bg-[#49b459] hover:bg-[#5ecd6e] text-[#0d1114] text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <span>Comenzar a modelar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
