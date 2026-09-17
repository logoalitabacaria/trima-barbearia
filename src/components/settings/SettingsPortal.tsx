/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layout,
  MessageSquare,
  Receipt,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  MoveVertical,
  Type,
  CheckCircle2,
  Calendar,
  Gift,
  Award,
  Share2,
  Clock,
  Scissors,
  Palette,
  Edit3
} from 'lucide-react';
import { SystemParameters, CustomerBanner } from '../../types';

interface SettingsPortalProps {
  parameters: SystemParameters;
  onUpdateParameter: (key: string, val: any) => void;
  onOpenNewBanner: () => void;
  onEditBanner: (banner: CustomerBanner) => void;
  handleDeleteBanner: (id: string) => void;
  handleToggleBannerActive: (id: string) => void;
  handleMoveBanner: (id: string, direction: 'up' | 'down') => void;
}

type PortalEditorTab = 'identity' | 'visibility' | 'order' | 'texts' | 'banners' | 'communication';

export default function SettingsPortal({
  parameters,
  onUpdateParameter,
  onOpenNewBanner,
  onEditBanner,
  handleDeleteBanner,
  handleToggleBannerActive,
  handleMoveBanner
}: SettingsPortalProps) {
  const [activeTab, setActiveTab] = useState<PortalEditorTab>('identity');
  const isReceiptsEnabled = parameters.enableReceipts !== false;
  const banners: CustomerBanner[] = parameters.customerPortalBanners || [];

  // Default block sequence
  const DEFAULT_BLOCKS = [
    { id: 'welcome', name: 'Cabeçalho & Saudação de Boas-Vindas', icon: '👋' },
    { id: 'banners', name: 'Carrossel de Banners Promocionais', icon: '🎠' },
    { id: 'scheduling', name: 'Agendamento de Horários & Serviços', icon: '✂️' },
    { id: 'advantages', name: 'Vantagens, Cupons & Fidelidade', icon: '🎁' },
    { id: 'subscriptions', name: 'Clube de Assinaturas & Pacotes', icon: '⭐' },
    { id: 'appointments', name: 'Meus Agendamentos Recentes', icon: '📅' },
    { id: 'nps', name: 'Pesquisa de Satisfação NPS', icon: '⭐' },
    { id: 'footer', name: 'Rodapé, Redes Sociais & Contato', icon: '📍' }
  ];

  const currentBlockOrder = (parameters.customerPortalBlockOrder && parameters.customerPortalBlockOrder.length > 0)
    ? parameters.customerPortalBlockOrder
    : DEFAULT_BLOCKS.map(b => b.id);

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...currentBlockOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onUpdateParameter('customerPortalBlockOrder', newOrder);
  };

  const handleResetBlockOrder = () => {
    onUpdateParameter('customerPortalBlockOrder', DEFAULT_BLOCKS.map(b => b.id));
  };

  return (
    <div className="space-y-6 text-left">
      {/* HEADER DA ABA */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Layout className="w-5 h-5 text-amber-400" />
              Central de Personalização da Visão do Cliente & Topo
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Configure o nome e a cor exibidos ao lado do logotipo no topo, controle quais blocos aparecem e personalize textos e banners.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg self-start sm:self-auto">
            100% Customizável
          </span>
        </div>

        {/* SUBTABS INTERNAS DO EDITOR REORGANIZADAS */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'identity'
                ? 'bg-yellow-500 text-black shadow-md font-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span>1. Topo & Identidade Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visibility')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'visibility'
                ? 'bg-yellow-500 text-black shadow-md font-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Visibilidade dos Blocos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'order'
                ? 'bg-yellow-500 text-black shadow-md font-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <MoveVertical className="w-4 h-4" />
            <span>3. Ordem na Tela</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('texts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'texts'
                ? 'bg-yellow-500 text-black shadow-md font-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>4. Textos & Mensagens</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-yellow-500 text-black shadow-md font-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>5. Banners Promocionais ({banners.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('communication')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'communication'
                ? 'bg-yellow-500 text-black shadow-md font-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>6. WhatsApp & Recibos</span>
          </button>
        </div>
      </div>

      {/* ABA 1: IDENTIDADE VISUAL & TOPO (NOME E COR AO LADO DA LOGOTIPO) */}
      {activeTab === 'identity' && (
        <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-6">
          <div className="border-b border-zinc-850 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
                <Palette className="w-4 h-4 text-yellow-400" />
                Identidade do Topo: Nome, Cor ao lado da Logo & Logotipo
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Personalize o nome da sua barbearia/sistema e escolha a cor de exibição exata no canto superior esquerdo ao lado da logotipo.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-lg">
              Cabeçalho Superior
            </span>
          </div>

          {/* PRÉ-VISUALIZAÇÃO AO VIVO DO CABEÇALHO */}
          <div className="bg-black border border-zinc-800 rounded-xl p-4 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-yellow-500" /> Pré-visualização ao vivo do Canto Superior:
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Atualização em tempo real
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3 sm:p-4 rounded-xl flex items-center gap-3">
              {parameters.logoUrl ? (
                <img
                  src={parameters.logoUrl}
                  alt="Logotipo"
                  className="h-10 w-10 object-contain rounded-lg border border-zinc-800 bg-black shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl bg-yellow-500 text-black p-1.5 rounded-lg font-black font-mono shrink-0">
                  LA
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h1
                  className="text-base sm:text-lg font-extrabold tracking-tight uppercase truncate transition-colors"
                  style={{ color: parameters.systemNameColor || parameters.primaryColor || '#eab308' }}
                >
                  {parameters.systemName || parameters.shopName || 'Trima Studio'}
                </h1>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono truncate">
                  {parameters.systemSubtitle || 'Sempre em Boa Companhia'}
                </p>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO DE CONFIGURAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome do Sistema e Subtítulo */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-300 uppercase font-mono font-bold block mb-1">
                  Nome do Sistema / Barbearia no Topo *
                </label>
                <input
                  type="text"
                  value={parameters.systemName || parameters.shopName || ''}
                  onChange={(e) => {
                    onUpdateParameter('systemName', e.target.value);
                    if (!parameters.shopName) {
                      onUpdateParameter('shopName', e.target.value);
                    }
                  }}
                  placeholder="Ex: Trima Studio ou Nome da Sua Barbearia"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white focus:border-yellow-500 outline-none font-bold"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Texto principal que fica destacado em letras maiúsculas ao lado do logotipo.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-300 uppercase font-mono font-bold block mb-1">
                  Subtítulo / Slogan Abaixo do Nome
                </label>
                <input
                  type="text"
                  value={parameters.systemSubtitle || 'Sempre em Boa Companhia'}
                  onChange={(e) => onUpdateParameter('systemSubtitle', e.target.value)}
                  placeholder="Ex: Sempre em Boa Companhia ou Barbearia & Estilo"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Frase secundária exibida em fonte mono abaixo do nome no topo.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-300 uppercase font-mono font-bold block mb-1">
                  URL do Logotipo da Barbearia
                </label>
                <input
                  type="text"
                  value={parameters.logoUrl || ''}
                  onChange={(e) => onUpdateParameter('logoUrl', e.target.value)}
                  placeholder="Ex: https://.../logo.png ou use o envio de arquivo na aba Geral"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Link direto para a imagem do seu logotipo (PNG com fundo transparente recomendado).
                </p>
              </div>
            </div>

            {/* Cor do Nome do Sistema */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-300 uppercase font-mono font-bold block mb-1">
                  Cor do Nome do Sistema no Topo (ao lado da Logo) *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="color"
                    value={parameters.systemNameColor || parameters.primaryColor || '#eab308'}
                    onChange={(e) => onUpdateParameter('systemNameColor', e.target.value)}
                    className="h-10 w-12 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={parameters.systemNameColor || parameters.primaryColor || '#eab308'}
                    onChange={(e) => onUpdateParameter('systemNameColor', e.target.value)}
                    placeholder="#eab308"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:border-yellow-500 outline-none font-bold"
                  />
                </div>

                {/* Paleta Rápida de Cores */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-mono block">Cores Rápidas Recomendadas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Ouro Âmbar', hex: '#f59e0b' },
                      { name: 'Amarelo Padrão', hex: '#eab308' },
                      { name: 'Branco Neve', hex: '#ffffff' },
                      { name: 'Verde Esmeralda', hex: '#10b981' },
                      { name: 'Azul Real', hex: '#3b82f6' },
                      { name: 'Laranja Neon', hex: '#f97316' },
                      { name: 'Vermelho Rubi', hex: '#ef4444' },
                      { name: 'Violeta / Roxo', hex: '#8b5cf6' },
                      { name: 'Ciano / Turquesa', hex: '#06b6d4' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => onUpdateParameter('systemNameColor', c.hex)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                          (parameters.systemNameColor || parameters.primaryColor || '#eab308').toLowerCase() === c.hex.toLowerCase()
                            ? 'border-white bg-zinc-800 text-white shadow-xs'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dica & Explicação */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-[11px] text-zinc-300 font-mono space-y-1">
                <p className="text-yellow-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Destaque Visual Imediato
                </p>
                <p className="text-zinc-400 text-[10px]">
                  Essa alteração impacta diretamente o cabeçalho superior visível para clientes e funcionários ao navegar pelo sistema em qualquer tela ou dispositivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 1: VISIBILIDADE DOS ELEMENTOS */}
      {activeTab === 'visibility' && (
        <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-6">
          <div className="border-b border-zinc-850 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Eye className="w-4 h-4 text-yellow-400" />
              Controle de Visibilidade dos Elementos
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Desative o que não deseja exibir na visão do cliente. As seções desativadas serão completamente ocultadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Boas-vindas */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">👋 Cabeçalho & Saudação de Boas-Vindas</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Exibe saudação com o nome do cliente e botão de tema claro/escuro.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowWelcomeHeader', parameters.portalShowWelcomeHeader === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowWelcomeHeader !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowWelcomeHeader !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowWelcomeHeader !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Banners do Topo */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🎠 Carrossel de Banners Promocionais</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Exibe os banners rotativos no topo do portal do cliente.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowBannersCarousel', parameters.portalShowBannersCarousel === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowBannersCarousel !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowBannersCarousel !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowBannersCarousel !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Agendamento */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">✂️ Seção de Agendamento Online</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Fluxo de escolha de serviço, barbeiro, data e horário.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowSchedulingFlow', parameters.portalShowSchedulingFlow === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowSchedulingFlow !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowSchedulingFlow !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowSchedulingFlow !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Busca de Serviços */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🔍 Campo de Busca de Serviços</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Barra de busca por texto na tela de seleção de serviços.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowServiceSearch', parameters.portalShowServiceSearch === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowServiceSearch !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowServiceSearch !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowServiceSearch !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Filtros de Categoria */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🏷️ Filtros de Categoria no Agendamento</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Botões de categorias (Cabelo, Barba, Combos, etc.) sem o botão "Todos".</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowServiceCategories', parameters.portalShowServiceCategories === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowServiceCategories !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowServiceCategories !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowServiceCategories !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Bloco de Vantagens e Cupons */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🎁 Bloco de Vantagens, Cupons & Fidelidade</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Card expansível contendo cupons, indique e ganhe e fidelidade.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowAdvantagesCollapsible', parameters.portalShowAdvantagesCollapsible === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowAdvantagesCollapsible !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowAdvantagesCollapsible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowAdvantagesCollapsible !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Indique e Ganhe */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🤝 Programa Indique e Ganhe (MGM)</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Código e botão para copiar link de indicação de amigos.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowReferralProgram', parameters.portalShowReferralProgram === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowReferralProgram !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowReferralProgram !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowReferralProgram !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Promoções Ativas */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🏷️ Promoções & Cupons de Desconto</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Lista de cupons e promoções com botão para copiar o código.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowPromotions', parameters.portalShowPromotions === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowPromotions !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowPromotions !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowPromotions !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Cartão de Fidelidade */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">💳 Cartão de Fidelidade Digital</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Pontos acumulados e progresso para resgatar desconto.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowLoyaltyCard', parameters.portalShowLoyaltyCard === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowLoyaltyCard !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowLoyaltyCard !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowLoyaltyCard !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Seção de Assinaturas */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">⭐ Clube VIP & Assinaturas Recorrentes</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Exibição de planos mensais e contratação de assinatura.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowSubscriptionsSection', parameters.portalShowSubscriptionsSection === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowSubscriptionsSection !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowSubscriptionsSection !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowSubscriptionsSection !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Montador de Pacote */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">🛠️ Montador de Pacotes Personalizados</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Permite ao cliente montar seu próprio pacote mensal com quantidade de serviços.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowPackageBuilder', parameters.portalShowPackageBuilder === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowPackageBuilder !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowPackageBuilder !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowPackageBuilder !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Histórico de Agendamentos */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">📅 Meus Agendamentos Recentes</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Lista de agendamentos futuros e passados do cliente logado.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowAppointmentsHistory', parameters.portalShowAppointmentsHistory === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowAppointmentsHistory !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowAppointmentsHistory !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowAppointmentsHistory !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Pesquisa NPS */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">⭐ Pesquisa de Satisfação NPS</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Coleta de nota de 0 a 10 e comentário de avaliação do cliente.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowNpsSurvey', parameters.portalShowNpsSurvey === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowNpsSurvey !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowNpsSurvey !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowNpsSurvey !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Avaliação no Google (5 Estrelas) */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  <span>⭐ Direcionamento para Avaliação no Google (5 Estrelas)</span>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Card em destaque para o cliente avaliar sua barbearia no Google com 5 estrelas em 1 clique.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowGoogleReviews', parameters.portalShowGoogleReviews === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowGoogleReviews !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowGoogleReviews !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowGoogleReviews !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>

            {/* Rodapé e Redes Sociais */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white font-mono">📍 Rodapé, Contatos & Redes Sociais</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Endereço físico, telefone, horários e links para Instagram / WhatsApp.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateParameter('portalShowContactFooter', parameters.portalShowContactFooter === false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  parameters.portalShowContactFooter !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                }`}
              >
                {parameters.portalShowContactFooter !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{parameters.portalShowContactFooter !== false ? 'Visível' : 'Oculto'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: ORDEM DOS BLOCOS NA TELA */}
      {activeTab === 'order' && (
        <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
                <MoveVertical className="w-4 h-4 text-yellow-400" />
                Ordem de Exibição dos Blocos na Tela
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Altere a sequência das seções no portal do cliente usando os botões de subir e descer.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetBlockOrder}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono rounded-lg transition border border-zinc-800 self-start sm:self-auto cursor-pointer"
            >
              Restaurar Ordem Padrão
            </button>
          </div>

          <div className="space-y-2.5 max-w-2xl">
            {currentBlockOrder.map((blockId, index) => {
              const blockInfo = DEFAULT_BLOCKS.find(b => b.id === blockId) || {
                id: blockId,
                name: blockId,
                icon: '📦'
              };

              return (
                <div
                  key={blockId}
                  className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-yellow-400 font-mono text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-lg">{blockInfo.icon}</span>
                    <span className="text-xs font-bold text-white font-mono">{blockInfo.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBlock(index, 'up')}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-20 rounded-lg transition cursor-pointer border border-zinc-800"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === currentBlockOrder.length - 1}
                      onClick={() => handleMoveBlock(index, 'down')}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-20 rounded-lg transition cursor-pointer border border-zinc-800"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: TEXTOS & MENSAGENS */}
      {activeTab === 'texts' && (
        <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
          <div className="border-b border-zinc-850 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Type className="w-4 h-4 text-yellow-400" />
              Edição de Textos & Títulos das Telas
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Modifique livremente os títulos, descrições e avisos para refletir a comunicação exata da sua barbearia.
            </p>
          </div>

          {/* GUIA DE VARIÁVEIS DINÂMICAS */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold font-mono uppercase">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Tags Dinâmicas (Substituídas Automaticamente):</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
              <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
                {'{NOME}'} <span className="text-zinc-400 font-normal">➔ Nome do cliente</span>
              </span>
              <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
                {'{BARBEARIA}'} <span className="text-zinc-400 font-normal">➔ Nome do estabelecimento</span>
              </span>
              <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
                {'{TELEFONE}'} <span className="text-zinc-400 font-normal">➔ Telefone de contato</span>
              </span>
              <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
                {'{ENDERECO}'} <span className="text-zinc-400 font-normal">➔ Endereço físico</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Etiqueta superior */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Etiqueta Superior do Topo
              </label>
              <input
                type="text"
                value={parameters.customerPortalHeaderTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalHeaderTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Portal do Cliente ou Área VIP {BARBEARIA}"
              />
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">Padrão: Portal do Cliente</p>
            </div>

            {/* Título de Boas-vindas */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título de Boas-Vindas Principal
              </label>
              <input
                type="text"
                value={parameters.customerPortalWelcomeTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalWelcomeTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Olá, {NOME}! ou Seja bem-vindo(a) à {BARBEARIA}!"
              />
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">Padrão: Olá, [Nome do Cliente]</p>
            </div>

            {/* Subtítulo de Boas-vindas */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Texto de Subtítulo de Boas-Vindas
              </label>
              <textarea
                rows={2}
                value={parameters.customerPortalWelcomeText || ''}
                onChange={(e) => onUpdateParameter('customerPortalWelcomeText', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Escolha seu barbeiro de preferência e agende seu horário com total facilidade."
              />
            </div>

            {/* Aviso de Agendamento */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Aviso de Atendimento (Online 24h / Balcão)
              </label>
              <textarea
                rows={2}
                value={parameters.customerPortalSchedulingInfoText || ''}
                onChange={(e) => onUpdateParameter('customerPortalSchedulingInfoText', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Atendimento com agendamento online 24h ou por ordem de chegada no balcão."
              />
            </div>

            {/* Título de Agendamento */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título da Seção de Agendamento
              </label>
              <input
                type="text"
                value={parameters.customerPortalAgendarTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalAgendarTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Agende Seu Atendimento"
              />
            </div>

            {/* Subtítulo de Agendamento */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Subtítulo da Seção de Agendamento
              </label>
              <input
                type="text"
                value={parameters.customerPortalAgendarSubtitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalAgendarSubtitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Escolha os serviços desejados, seu profissional e o melhor horário."
              />
            </div>

            {/* Título do Clube de Assinaturas */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título do Clube de Assinaturas Recorrente
              </label>
              <input
                type="text"
                value={parameters.customerPortalSubscriptionsTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalSubscriptionsTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Clube de Assinatura Recorrente & Descontos"
              />
            </div>

            {/* Subtítulo do Clube de Assinaturas */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Subtítulo do Clube de Assinaturas
              </label>
              <input
                type="text"
                value={parameters.customerPortalSubscriptionsSubtitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalSubscriptionsSubtitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Economize todo mês com planos mensais exclusivos."
              />
            </div>

            {/* Título do Montador de Pacotes */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título do Montador de Pacotes
              </label>
              <input
                type="text"
                value={parameters.customerPortalPackageTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalPackageTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Monte Seu Pacote Mensal de Cortes & Barba"
              />
            </div>

            {/* Subtítulo do Montador de Pacotes */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Subtítulo do Montador de Pacotes
              </label>
              <input
                type="text"
                value={parameters.customerPortalPackageSubtitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalPackageSubtitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Selecione quais serviços você deseja receber ao longo do mês:"
              />
            </div>

            {/* Título de Agendamentos Recentes */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título dos Agendamentos Recentes do Cliente
              </label>
              <input
                type="text"
                value={parameters.customerPortalAppointmentsTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalAppointmentsTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Meus Agendamentos Recentes"
              />
            </div>

            {/* Rodapé do Portal */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Mensagem Final do Rodapé do Portal
              </label>
              <input
                type="text"
                value={parameters.customerPortalFooterText || ''}
                onChange={(e) => onUpdateParameter('customerPortalFooterText', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: {BARBEARIA} - O melhor estilo e cuidado para você."
              />
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: BANNERS DO TOPO */}
      {activeTab === 'banners' && (
        <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div>
              <h5 className="text-sm font-bold text-yellow-500 uppercase font-mono flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" /> Banners Promocionais do Topo ({banners.length})
              </h5>
              <p className="text-xs text-zinc-400 mt-1">
                Banners rotativos exibidos no topo do portal do cliente com links, anúncios ou avisos.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNewBanner}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Banner</span>
            </button>
          </div>

          {banners.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4 font-mono text-center">
              Nenhum banner cadastrado. O portal exibirá o cabeçalho padrão sem carrossel.
            </p>
          ) : (
            <div className="space-y-2.5">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-850 p-3 rounded-xl hover:border-zinc-700 transition"
                >
                  <div
                    onClick={() => onEditBanner(banner)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'Banner'}
                      className="w-16 h-10 object-cover rounded-lg border border-zinc-700 bg-black"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono block hover:text-yellow-400 transition">
                          {banner.title || `Banner #${index + 1}`}
                        </span>
                        {banner.badgeText && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                            {banner.badgeText}
                          </span>
                        )}
                      </div>
                      {banner.subtitle && (
                        <span className="text-[10px] text-zinc-400 block">{banner.subtitle}</span>
                      )}
                      {banner.linkUrl && (
                        <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5 max-w-xs truncate" title={banner.linkUrl}>
                          🔗 {banner.linkUrl}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditBanner(banner)}
                      className="p-1.5 bg-zinc-900 hover:bg-yellow-500/20 text-zinc-300 hover:text-yellow-400 rounded-lg transition cursor-pointer border border-zinc-800"
                      title="Editar Banner"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBanner(banner.id, 'up')}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 rounded-lg transition cursor-pointer border border-zinc-800"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMoveBanner(banner.id, 'down')}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 rounded-lg transition cursor-pointer border border-zinc-800"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(banner.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        banner.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-850 text-zinc-400'
                      }`}
                    >
                      {banner.isActive ? 'Ativo' : 'Pausado'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-1.5 bg-zinc-900 hover:bg-red-950/50 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer border border-zinc-800"
                      title="Excluir Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 5: WHATSAPP & RECIBOS */}
      {activeTab === 'communication' && (
        <div className="space-y-6">
          {/* Lembrete WhatsApp */}
          <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 border-b border-zinc-850 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-yellow-400" />
              Modelo de Lembrete de Agendamento (WhatsApp)
            </h4>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Texto Padrão Enviado pelo Barbeiro ou Caixa
              </label>
              <textarea
                rows={4}
                value={parameters.whatsappTemplate || ''}
                onChange={(e) => onUpdateParameter('whatsappTemplate', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                placeholder="Olá {CLIENTE}, confirmando seu horário na {BARBEARIA} dia {DATA} às {HORA} com {BARBEIRO}..."
              />
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">
                Tags disponíveis: {'{CLIENTE}'}, {'{BARBEARIA}'}, {'{BARBEIRO}'}, {'{DATA}'}, {'{HORA}'}, {'{SERVICO}'}.
              </p>
            </div>
          </div>

          {/* Comprovante Digital */}
          <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-yellow-400" />
                  Comprovante Digital & Impressão Térmica
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Geração de cupom de atendimento após pagamento no caixa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onUpdateParameter('enableReceipts', !isReceiptsEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
                  isReceiptsEnabled
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10'
                    : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                {isReceiptsEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-black" />
                    <span>Recibos Ativados</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-zinc-500" />
                    <span>Recibos Desativados</span>
                  </>
                )}
              </button>
            </div>

            {isReceiptsEnabled && (
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                  Texto de Rodapé do Comprovante
                </label>
                <input
                  type="text"
                  value={parameters.receiptFooterText || ''}
                  onChange={(e) => onUpdateParameter('receiptFooterText', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  placeholder="Ex: Obrigado pela preferência! Volte sempre."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
