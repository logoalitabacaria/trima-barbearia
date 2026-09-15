/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layout, MessageSquare, Receipt, Sparkles, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
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

export default function SettingsPortal({
  parameters,
  onUpdateParameter,
  onOpenNewBanner,
  onEditBanner,
  handleDeleteBanner,
  handleToggleBannerActive,
  handleMoveBanner
}: SettingsPortalProps) {
  const isReceiptsEnabled = parameters.enableReceipts !== false;
  const banners: CustomerBanner[] = parameters.customerPortalBanners || [];

  return (
    <div className="space-y-6 text-left">
      {/* 1. TEXTOS E BANNERS DO PORTAL DO CLIENTE */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="border-b border-zinc-850 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
            <Layout className="w-4 h-4 text-amber-400" />
            Visão do Cliente: Textos do Portal & Banners Promocionais
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            Personalize os títulos, saudações e banners visuais exibidos para o cliente logado ou visitante no portal.
          </p>
        </div>

        {/* GUIA DE VARIÁVEIS DINÂMICAS */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold font-mono uppercase">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Tags Dinâmicas Disponíveis:</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Insira as tags abaixo nos campos de texto para personalizar a mensagem em tempo real para cada cliente:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
            <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
              {'{NOME}'} <span className="text-zinc-400 font-normal">➔ Nome do cliente logado</span>
            </span>
            <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
              {'{BARBEARIA}'} <span className="text-zinc-400 font-normal">➔ Nome da barbearia</span>
            </span>
            <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
              {'{TELEFONE}'} <span className="text-zinc-400 font-normal">➔ Telefone de suporte</span>
            </span>
            <span className="bg-zinc-900 border border-amber-500/40 text-amber-400 px-2 py-1 rounded font-bold">
              {'{ENDERECO}'} <span className="text-zinc-400 font-normal">➔ Endereço físico</span>
            </span>
          </div>
        </div>

        {/* CAMPOS DE TEXTO DO PORTAL */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
          <h5 className="text-xs font-bold text-white uppercase font-mono border-b border-zinc-900 pb-2">
            ✍️ Textos do Portal do Cliente
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Etiqueta Superior do Portal
              </label>
              <input
                type="text"
                value={parameters.customerPortalHeaderTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalHeaderTitle', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Portal do Cliente ou Área VIP {BARBEARIA}"
              />
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">Padrão: Portal do Cliente</p>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título de Boas-Vindas Principal
              </label>
              <input
                type="text"
                value={parameters.customerPortalWelcomeTitle || ''}
                onChange={(e) => onUpdateParameter('customerPortalWelcomeTitle', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Olá, {NOME}! ou Seja bem-vindo(a) à {BARBEARIA}!"
              />
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">Padrão: Olá, [Nome do Cliente]</p>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Texto de Subtítulo de Boas-Vindas
              </label>
              <textarea
                rows={2}
                value={parameters.customerPortalWelcomeText || ''}
                onChange={(e) => onUpdateParameter('customerPortalWelcomeText', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Olá {NOME}, escolha seu profissional e agende seu corte..."
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Texto de Agendamento (Online 24h / Ordem de Chegada)
              </label>
              <textarea
                rows={2}
                value={parameters.customerPortalSchedulingInfoText || ''}
                onChange={(e) => onUpdateParameter('customerPortalSchedulingInfoText', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Atendimento com agendamento online 24h ou por ordem de chegada no balcão"
              />
            </div>
          </div>
        </div>

        {/* GESTÃO DE BANNERS */}
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div>
              <h5 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" /> Banners Promocionais do Carrossel ({banners.length})
              </h5>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Banners rotativos exibidos no topo do portal do cliente com links ou avisos.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={onOpenNewBanner}
                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Banner</span>
              </button>
            </div>
          </div>

          {banners.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-2 font-mono">
              Nenhum banner cadastrado. O portal exibirá o cabeçalho padrão sem carrossel.
            </p>
          ) : (
            <div className="space-y-2">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl hover:border-zinc-700 transition"
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
                      <span className="text-xs font-bold text-white font-mono block hover:text-yellow-400 transition">
                        {banner.title || `Banner #${index + 1}`}
                      </span>
                      {banner.subtitle && (
                        <span className="text-[10px] text-zinc-400 block">{banner.subtitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBanner(banner.id, 'up')}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 rounded transition cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMoveBanner(banner.id, 'down')}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 rounded transition cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(banner.id)}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                        banner.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {banner.isActive ? 'Ativo' : 'Pausado'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-1 bg-zinc-800 hover:bg-red-950/50 text-zinc-400 hover:text-red-400 rounded transition cursor-pointer"
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
      </div>

      {/* 2. MODELO DE LEMBRETE DE AGENDAMENTO (WHATSAPP) */}
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

      {/* 3. COMPROVANTE DIGITAL & IMPRESSÃO TÉRMICA */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-yellow-400" />
              Comprovante Digital & Impressão Térmica
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Geração de cupom fiscal não-oficial / recibo de atendimento após pagamento no caixa.
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
  );
}
