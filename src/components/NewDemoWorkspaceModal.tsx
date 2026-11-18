import React, { useState } from 'react';
import {
  AlertTriangle,
  Box,
  Circle,
  FilePlus2,
  Square,
  Sparkles,
  X,
} from 'lucide-react';
import { DEMO_LOCAL_STORAGE_WARNING } from '../config/appCapabilities';
import { ProjectTemplateId } from '../core/project/types';

interface NewDemoWorkspaceModalProps {
  hasUnsavedChanges: boolean;
  hasSavedWorkspace: boolean;
  onCancel: () => void;
  onConfirmCreate: (params: {
    templateId: ProjectTemplateId;
    clearSaved: boolean;
  }) => Promise<void> | void;
}

const TEMPLATES: {
  id: ProjectTemplateId;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'cube',
    label: 'Cubo inicial',
    subtitle: 'Escena estándar con cubo listo para editar',
    icon: <Box className="w-4 h-4 text-[#5ecd6e]" />,
  },
  {
    id: 'uv_sphere',
    label: 'Esfera UV',
    subtitle: 'Malla esférica para formas orgánicas',
    icon: <Circle className="w-4 h-4 text-[#38bdf8]" />,
  },
  {
    id: 'plane',
    label: 'Plano base',
    subtitle: 'Superficie plana para arquitectura o suelos',
    icon: <Square className="w-4 h-4 text-[#a78bfa]" />,
  },
  {
    id: 'empty',
    label: 'Escena vacía',
    subtitle: 'Lienzo 3D limpio sin objetos de modelado',
    icon: <Sparkles className="w-4 h-4 text-[#facc15]" />,
  },
];

export const NewDemoWorkspaceModal: React.FC<NewDemoWorkspaceModalProps> = ({
  hasUnsavedChanges,
  hasSavedWorkspace,
  onCancel,
  onConfirmCreate,
}) => {
  const [templateId, setTemplateId] = useState<ProjectTemplateId>('cube');
  const [confirmAck, setConfirmAck] = useState(
    !hasSavedWorkspace && !hasUnsavedChanges,
  );
  const [submitting, setSubmitting] = useState(false);

  const needsConfirmation = hasSavedWorkspace || hasUnsavedChanges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsConfirmation && !confirmAck) return;
    setSubmitting(true);
    try {
      await onConfirmCreate({
        templateId,
        clearSaved: hasSavedWorkspace,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="new-demo-workspace-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-[#181a1f] border border-[#323640] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-4 py-3.5 border-b border-[#282c36] bg-[#14161b] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FilePlus2 className="w-4 h-4 text-[#5ecd6e]" />
            <h2 className="text-sm font-bold text-[#f3f4f6]">
              Nuevo espacio de trabajo
            </h2>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            aria-label="Cancelar"
            className="w-8 h-8 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#323640] text-[#9ca3af] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#cbd5e1]">
              Plantilla inicial
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {TEMPLATES.map((tpl) => {
                const selected = templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplateId(tpl.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                      selected
                        ? 'bg-[#16261a] border-[#5ecd6e]/70 text-[#f3f4f6]'
                        : 'bg-[#14161b] hover:bg-[#1e2128] border-[#2a2e38] text-[#cbd5e1]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1d2027] border border-[#2f3440] flex items-center justify-center shrink-0">
                      {tpl.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">{tpl.label}</div>
                      <div className="text-[11px] text-[#8e95a2]">
                        {tpl.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {needsConfirmation && (
            <div className="rounded-xl bg-[#261b16] border border-[#d97706]/55 p-3 space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-[#fde68a]">
                <AlertTriangle className="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">
                    Advertencia sobre tu proyecto actual
                  </div>
                  <p className="text-[11px] text-[#fcd34d]/90 leading-relaxed">
                    {hasSavedWorkspace
                      ? 'En LOOPA Demo solo existe un espacio de trabajo local. Comenzar uno nuevo reemplazará el proyecto guardado en este navegador y descartará los cambios sin guardar.'
                      : 'Tienes cambios sin guardar en la escena actual. Si comienzas un nuevo espacio de trabajo, se perderán.'}
                  </p>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#fde68a]">
                <input
                  type="checkbox"
                  checked={confirmAck}
                  onChange={(e) => setConfirmAck(e.target.checked)}
                  className="mt-0.5 accent-[#f59e0b]"
                />
                <span>
                  Entiendo que se reemplazará el espacio de trabajo anterior.
                </span>
              </label>
            </div>
          )}

          <p className="text-[11px] text-[#8e95a2] leading-relaxed">
            {DEMO_LOCAL_STORAGE_WARNING}
          </p>
        </div>

        <div className="px-4 py-3 border-t border-[#282c36] bg-[#14161b] flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="min-h-[38px] px-3.5 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#343a47] text-xs font-semibold text-[#e4e6eb] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="confirm-new-demo-workspace-btn"
            disabled={submitting || (needsConfirmation && !confirmAck)}
            className="min-h-[38px] px-4 rounded-lg bg-[#49b459] hover:bg-[#5ecd6e] disabled:opacity-45 disabled:pointer-events-none text-[#0d1114] text-xs font-bold transition-colors"
          >
            {submitting ? 'Creando...' : 'Comenzar nuevo'}
          </button>
        </div>
      </form>
    </div>
  );
};
