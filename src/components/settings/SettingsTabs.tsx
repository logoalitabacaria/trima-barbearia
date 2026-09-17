/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Tag, CreditCard, Store, Gift, Layout, ShieldCheck, Search, Sparkles, CheckCircle } from 'lucide-react';

export type SettingsCategoryId = 'geral' | 'portal' | 'assinaturas' | 'promocoes' | 'fidelidade' | 'dados';

interface SettingsTabsProps {
  activeCategory: SettingsCategoryId;
  onChangeCategory: (cat: SettingsCategoryId) => void;
  bannersCount?: number;
  couponsCount?: number;
}

export const SETTINGS_CATEGORIES: {
  id: SettingsCategoryId;
  icon: React.ElementType;
  emoji: string;
  label: string;
  desc: string;
  badge: string;
  keywords: string[];
}[] = [
  {
    id: 'geral',
    icon: Store,
    emoji: '🏪',
    label: 'Geral & Identidade',
    desc: 'Nome, Logo, Cor do Topo, Horários & Pagamentos',
    badge: 'Essencial',
    keywords: ['loja', 'nome', 'logo', 'logotipo', 'cor', 'topo', 'tema', 'horario', 'abertura', 'fechamento', 'endereco', 'telefone', 'pagamento', 'pix', 'cartao', 'redes', 'instagram', 'maps', 'google']
  },
  {
    id: 'portal',
    icon: Layout,
    emoji: '🌐',
    label: 'Portal do Cliente',
    desc: 'Nome & Cor ao lado da Logo, Banners, Blocos & Textos',
    badge: 'Visão Cliente',
    keywords: ['portal', 'cliente', 'nome', 'cor', 'logo', 'logotipo', 'topo', 'banner', 'carrossel', 'ordem', 'blocos', 'visibilidade', 'textos', 'saudacao', 'rodape', 'whatsapp', 'recibo']
  },
  {
    id: 'assinaturas',
    icon: CreditCard,
    emoji: '💳',
    label: 'Assinaturas & Planos',
    desc: 'Clube Mensal, Descontos Progressivos & Repasses',
    badge: 'Recorrência',
    keywords: ['assinatura', 'plano', 'clube', 'desconto', 'pacote', 'recorrente', 'comissao', 'repasse', 'barbeiro']
  },
  {
    id: 'promocoes',
    icon: Tag,
    emoji: '🏷️',
    label: 'Promoções & Cupons',
    desc: 'Campanhas, Cupons de Desconto & Bônus de Primeiro Agendamento',
    badge: 'Vendas',
    keywords: ['promocao', 'cupom', 'cupons', 'desconto', 'codigo', 'campanha', 'aniversario', 'primeiro agendamento']
  },
  {
    id: 'fidelidade',
    icon: Gift,
    emoji: '⭐',
    label: 'Fidelidade & NPS',
    desc: 'Pontos por Gasto, Indicação (MGM), VIP & Avaliações',
    badge: 'Retenção',
    keywords: ['fidelidade', 'pontos', 'recompensa', 'resgate', 'indicacao', 'mgm', 'amigo', 'vip', 'nps', 'satisfacao', 'avaliacao', 'google']
  },
  {
    id: 'dados',
    icon: ShieldCheck,
    emoji: '🛡️',
    label: 'Segurança & Dados',
    desc: 'Backup, Restauração, Limpeza & Manutenção',
    badge: 'Sistema',
    keywords: ['seguranca', 'backup', 'exportar', 'importar', 'restaurar', 'limpar', 'vendas', 'historico', 'banco']
  },
];

export default function SettingsTabs({
  activeCategory,
  onChangeCategory,
  bannersCount,
  couponsCount
}: SettingsTabsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = SETTINGS_CATEGORIES.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      cat.label.toLowerCase().includes(query) ||
      cat.desc.toLowerCase().includes(query) ||
      cat.keywords.some((k) => k.includes(query))
    );
  });

  return (
    <div className="bg-[#101012] border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
      {/* HEADER COM BUSCA RÁPIDA DE CONFIGURAÇÕES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500 font-mono flex items-center gap-2">
            <Settings className="w-4 h-4 text-yellow-400" />
            Configurações & Painel Administrativo
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerencie parâmetros da barbearia, identidade do topo, visão do cliente e regras comerciais com facilidade.
          </p>
        </div>

        {/* Campo de Busca Rápida de Configuração */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar configuração (ex: cor, logo, banner, pix)..."
            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-yellow-500 rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-mono font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* GRID DE ABAS TEMÁTICAS REORGANIZADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {SETTINGS_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const isMatched = searchQuery.trim() !== '' && filteredCategories.some((fc) => fc.id === cat.id);
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChangeCategory(cat.id)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group relative ${
                isSelected
                  ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/10 font-bold ring-2 ring-yellow-400/50'
                  : isMatched
                  ? 'bg-yellow-500/10 border-yellow-500/50 text-zinc-200 hover:bg-yellow-500/20'
                  : 'bg-zinc-950/90 border-zinc-850 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{cat.emoji}</span>
                  <span className={`text-xs font-mono font-black uppercase tracking-tight ${isSelected ? 'text-black' : 'text-zinc-100 group-hover:text-yellow-400'}`}>
                    {cat.label}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                    isSelected
                      ? 'bg-black/20 text-black'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {cat.badge}
                </span>
              </div>

              <p
                className={`text-[10px] line-clamp-2 leading-relaxed ${
                  isSelected ? 'text-black/80 font-medium' : 'text-zinc-400 group-hover:text-zinc-300'
                }`}
              >
                {cat.desc}
              </p>

              {/* Badges de contadores rápidos */}
              {cat.id === 'portal' && typeof bannersCount === 'number' && bannersCount > 0 && (
                <div className="pt-1 flex items-center gap-1 text-[9px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-black/25 text-black' : 'bg-amber-500/15 text-amber-400'}`}>
                    {bannersCount} Banners
                  </span>
                </div>
              )}

              {cat.id === 'promocoes' && typeof couponsCount === 'number' && couponsCount > 0 && (
                <div className="pt-1 flex items-center gap-1 text-[9px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-black/25 text-black' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {couponsCount} Cupons
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {searchQuery.trim() !== '' && filteredCategories.length === 0 && (
        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400 font-mono">
          Nenhuma categoria encontrada para "<span className="text-yellow-400">{searchQuery}</span>". Tente buscar por termos como <span className="text-zinc-300">"cor"</span>, <span className="text-zinc-300">"logo"</span>, <span className="text-zinc-300">"banner"</span> ou <span className="text-zinc-300">"pix"</span>.
        </div>
      )}
    </div>
  );
}
