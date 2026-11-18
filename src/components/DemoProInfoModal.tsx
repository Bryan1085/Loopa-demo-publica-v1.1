import React from 'react';
import {
  Box,
  Check,
  FileBox,
  FolderOpen,
  Layers,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  DEMO_OBJECT_LIMIT,
  PRO_FEATURE_DESCRIPTIONS,
  ProFeatureKey,
} from '../config/appCapabilities';
import { LoopaFullLogo } from './BrandLogo';

interface DemoProInfoModalProps {
  highlightedFeature?: ProFeatureKey | null;
  onClose: () => void;
}

const DEMO_HIGHLIGHTS = [
  'Motor completo de modelado y edición de mallas',
  'Selección y edición de vértices, aristas y caras',
  'Extrusión, bisel, inserción, subdivisión y corte bucle',
  'Edición proporcional, modificadores y materiales',
  'Controles táctiles, gestos iPad y menú radial personalizable',
  `Escenas de hasta ${DEMO_OBJECT_LIMIT} objetos con guardado manual en navegador`,
];

const PRO_HIGHLIGHTS: { key: ProFeatureKey; label: string }[] = [
  { key: 'gallery', label: PRO_FEATURE_DESCRIPTIONS.gallery },
  { key: 'folders', label: PRO_FEATURE_DESCRIPTIONS.folders },
  { key: 'multi_project', label: PRO_FEATURE_DESCRIPTIONS.multi_project },
  { key: 'unlimited_objects', label: PRO_FEATURE_DESCRIPTIONS.unlimited_objects },
  { key: 'import_obj', label: PRO_FEATURE_DESCRIPTIONS.import_obj },
  { key: 'import_stl', label: PRO_FEATURE_DESCRIPTIONS.import_stl },
  { key: 'export_model', label: PRO_FEATURE_DESCRIPTIONS.export_model },
  { key: 'native_project_file', label: PRO_FEATURE_DESCRIPTIONS.native_project_file },
  { key: 'autosave', label: PRO_FEATURE_DESCRIPTIONS.autosave },
];

export const DemoProInfoModal: React.FC<DemoProInfoModalProps> = ({
  highlightedFeature = null,
  onClose,
}) => {
  const highlightedLabel = highlightedFeature
    ? PRO_FEATURE_DESCRIPTIONS[highlightedFeature]
    : null;

  return (
    <div
      data-testid="demo-pro-info-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#181a1f] border border-[#323640] shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#282c36] bg-[#14161b] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <LoopaFullLogo variant="horizontal" className="h-6 w-auto" />
            <span className="px-2 py-0.5 rounded bg-[#1d222b] border border-[#384050] text-[11px] font-bold text-[#93c5fd]">
              Demo vs Pro
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar información de LOOPA Pro"
            className="w-8 h-8 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#323640] text-[#9ca3af] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto cad-scroll p-5 space-y-4">
          {highlightedLabel && (
            <div className="rounded-xl bg-[#1a222c] border border-[#3b82f6]/40 p-3 flex items-start gap-2.5 text-xs text-[#dbeafe]">
              <Lock className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Función reservada para LOOPA Pro</div>
                <p className="text-[11px] text-[#bfdbfe] mt-0.5">
                  <strong>{highlightedLabel}</strong> forma parte de LOOPA Pro. En esta Demo pública puedes seguir modelando y probando todas las herramientas de creación y edición 3D.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* LOOPA Demo */}
            <div className="rounded-xl bg-[#14161b] border border-[#2b303a] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#5ecd6e]" />
                  <span className="text-sm font-bold text-[#f3f4f6]">
                    LOOPA Demo
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#16261a] text-[10px] font-semibold text-[#7def8e]">
                  Activa
                </span>
              </div>
              <ul className="space-y-2">
                {DEMO_HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-[#cbd5e1]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#5ecd6e] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* LOOPA Pro */}
            <div className="rounded-xl bg-[#14181e] border border-[#364152] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#60a5fa]" />
                  <span className="text-sm font-bold text-[#f3f4f6]">
                    LOOPA Pro
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1e2636] text-[10px] font-semibold text-[#93c5fd]">
                  Edición completa
                </span>
              </div>
              <ul className="space-y-2">
                {PRO_HIGHLIGHTS.map((item) => {
                  const isHighlighted = item.key === highlightedFeature;
                  return (
                    <li
                      key={item.key}
                      className={`flex items-start gap-2 text-xs rounded px-1.5 py-0.5 -mx-1.5 ${
                        isHighlighted
                          ? 'bg-[#1d2b3e] text-[#dbeafe] font-semibold'
                          : 'text-[#cbd5e1]'
                      }`}
                    >
                      {item.key === 'gallery' || item.key === 'folders' ? (
                        <FolderOpen className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                      ) : item.key === 'unlimited_objects' ? (
                        <Layers className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                      ) : (
                        <FileBox className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                      )}
                      <span>{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-[#8e95a2] leading-relaxed">
            LOOPA Demo comparte exactamente el mismo motor de modelado que LOOPA Pro para que puedas evaluar el flujo de trabajo real en navegador o tablet.
          </p>
        </div>

        <div className="px-5 py-3.5 border-t border-[#282c36] bg-[#14161b] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 rounded-lg bg-[#22252d] hover:bg-[#2c313b] border border-[#343a47] text-xs font-semibold text-[#f3f4f6] transition-colors"
          >
            Seguir modelando
          </button>
        </div>
      </div>
    </div>
  );
};
