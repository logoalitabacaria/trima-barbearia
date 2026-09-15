/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Tag, CreditCard, Store, Gift, Layout, ShieldCheck } from 'lucide-react';

export type SettingsCategoryId = 'promocoes' | 'assinaturas' | 'geral' | 'fidelidade' | 'portal' | 'dados';

interface SettingsTabsProps {
  activeCategory: SettingsCategoryId;
  onChangeCategory: (cat: SettingsCategoryId) => void;
}

export const SETTINGS_CATEGORIES = [
  { id: 'promocoes' as SettingsCategoryId, icon: Tag, emoji: '🏷️', label: 'Promoções', desc: 'Campanhas & Cupons' },
  { id: 'assinaturas' as SettingsCategoryId, icon: CreditCard, emoji: '💳', label: 'Assinaturas', desc: 'Planos & Descontos' },
  { id: 'geral' as SettingsCategoryId, icon: Store, emoji: '🏪', label: 'Geral', desc: 'Loja, Horários & Pag.' },
  { id: 'fidelidade' as SettingsCategoryId, icon: Gift, emoji: '⭐', label: 'Fidelidade', desc: 'Pontos, VIP & NPS' },
  { id: 'portal' as SettingsCategoryId, icon: Layout, emoji: '🌐', label: 'Portal', desc: 'Banners & Lembretes' },
  { id: 'dados' as SettingsCategoryId, icon: ShieldCheck, emoji: '🛡️', label: 'Segurança', desc: 'Backup & Restauração' },
];

export default function SettingsTabs({ activeCategory, onChangeCategory }: SettingsTabsProps) {
  return (
    <div className="bg-[#101012] border border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-850">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500 font-mono flex items-center gap-2">
            <Settings className="w-4 h-4 text-yellow-400" />
            Configurações & Parâmetros do Sistema
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Organização modular por abas temáticas. Alterne entre as categorias abaixo para configurar a barbearia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SETTINGS_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChangeCategory(cat.id)}
              className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-yellow-500 border-yellow-400 text-black font-bold shadow-md shadow-yellow-500/10'
                  : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold uppercase truncate">
                <span className="text-sm">{cat.emoji}</span>
                <span className="truncate">{cat.label}</span>
              </div>
              <span className={`text-[10px] truncate ${isSelected ? 'text-black/80 font-medium' : 'text-zinc-500 font-mono'}`}>
                {cat.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
