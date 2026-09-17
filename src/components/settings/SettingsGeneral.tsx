/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Store, MapPin, Palette, CreditCard, Plus, Trash2, Globe, Instagram, MessageCircle, Facebook, Video, Star, ExternalLink, Sparkles } from 'lucide-react';
import { SystemParameters } from '../../types';
import { getGoogle5StarReviewUrl } from '../../utils/helpers';

interface SettingsGeneralProps {
  parameters: SystemParameters;
  onUpdateParameter: (key: string, val: any) => void;
  newPaymentMethodName: string;
  setNewPaymentMethodName: (val: string) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleLogoDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleLogoDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggingLogo: boolean;
}

export default function SettingsGeneral({
  parameters,
  onUpdateParameter,
  newPaymentMethodName,
  setNewPaymentMethodName,
  handleLogoUpload,
  handleLogoDrop,
  handleLogoDragOver,
  handleLogoDragLeave,
  isDraggingLogo
}: SettingsGeneralProps) {
  const paymentMethods = parameters.paymentMethods || ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'];

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentMethodName.trim()) return;
    const exists = paymentMethods.some(m => m.toLowerCase() === newPaymentMethodName.trim().toLowerCase());
    if (exists) return;
    onUpdateParameter('paymentMethods', [...paymentMethods, newPaymentMethodName.trim()]);
    setNewPaymentMethodName('');
  };

  const handleDeletePaymentMethod = (methodToDelete: string) => {
    onUpdateParameter('paymentMethods', paymentMethods.filter(m => m !== methodToDelete));
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. DADOS DA BARBEARIA */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="border-b border-zinc-850 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
            <Store className="w-4 h-4 text-yellow-400" />
            Parâmetros Básicos do Negócio
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            Informações cadastrais principais, horários de expediente e comissões padrão da barbearia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                Nome Comercial da Barbearia
              </label>
              <input
                type="text"
                value={parameters.shopName || ''}
                onChange={(e) => onUpdateParameter('shopName', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                Endereço Físico Completo
              </label>
              <input
                type="text"
                value={parameters.address || ''}
                onChange={(e) => onUpdateParameter('address', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                Telefone Fixo / WhatsApp de Suporte
              </label>
              <input
                type="text"
                value={parameters.phone || ''}
                onChange={(e) => onUpdateParameter('phone', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                  Abertura Loja (Hora)
                </label>
                <input
                  type="time"
                  value={parameters.openTime || '09:00'}
                  onChange={(e) => onUpdateParameter('openTime', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                  Fechamento Loja (Hora)
                </label>
                <input
                  type="time"
                  value={parameters.closeTime || '20:00'}
                  onChange={(e) => onUpdateParameter('closeTime', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                  Taxa Padrão Repasse Serviços (%)
                </label>
                <input
                  type="number"
                  value={Math.round((parameters.defaultCommissionService ?? 0.50) * 100)}
                  onChange={(e) => onUpdateParameter('defaultCommissionService', parseFloat(e.target.value) / 100)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                />
                <p className="text-[9px] text-zinc-500 font-mono mt-1">Padrão: 50%</p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                  Taxa Repasse Venda Produtos (%)
                </label>
                <input
                  type="number"
                  value={Math.round((parameters.defaultCommissionProduct ?? 0.10) * 100)}
                  onChange={(e) => onUpdateParameter('defaultCommissionProduct', parseFloat(e.target.value) / 100)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                />
                <p className="text-[9px] text-zinc-500 font-mono mt-1">Padrão: 10%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REDES SOCIAIS & GOOGLE MAPS */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 border-b border-zinc-850 pb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-yellow-400" />
          Redes Sociais & Localização Maps
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1.5 mb-1">
              <Instagram className="w-3.5 h-3.5 text-pink-500" /> Perfil no Instagram (URL ou @usuario)
            </label>
            <input
              type="text"
              value={parameters.instagramUrl || ''}
              onChange={(e) => onUpdateParameter('instagramUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              placeholder="Ex: @barbearia_oficial ou https://instagram.com/..."
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1.5 mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp da Barbearia (Link ou Número com DDD)
            </label>
            <input
              type="text"
              value={parameters.whatsappUrl || ''}
              onChange={(e) => onUpdateParameter('whatsappUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              placeholder="Ex: 5511999999999 ou https://wa.me/..."
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1.5 mb-1">
              <Facebook className="w-3.5 h-3.5 text-blue-500" /> Página do Facebook
            </label>
            <input
              type="text"
              value={parameters.facebookUrl || ''}
              onChange={(e) => onUpdateParameter('facebookUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              placeholder="Ex: https://facebook.com/minhabarbearia"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1.5 mb-1">
              <Video className="w-3.5 h-3.5 text-red-500" /> Perfil no TikTok
            </label>
            <input
              type="text"
              value={parameters.tiktokUrl || ''}
              onChange={(e) => onUpdateParameter('tiktokUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              placeholder="Ex: @barbearia_tiktok"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-yellow-500" /> Link de Localização no Google Maps
            </label>
            <input
              type="text"
              value={parameters.googleMapsUrl || ''}
              onChange={(e) => onUpdateParameter('googleMapsUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              placeholder="Ex: https://maps.google.com/?q=Rua+Exemplo+123"
            />
            <p className="text-[9px] text-zinc-500 mt-1 font-mono">
              Se deixado em branco, o sistema gera automaticamente o link com base no endereço físico cadastrado.
            </p>
          </div>

          <div className="md:col-span-2 border-t border-zinc-850 pt-4 mt-1 bg-zinc-900/40 p-4 rounded-xl border">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <label className="text-[11px] text-amber-400 uppercase font-mono font-bold flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Link Direto para Avaliação no Google (Abre com 5 Estrelas)
              </label>
              {parameters.googleReviewUrl && (
                <a
                  href={getGoogle5StarReviewUrl(parameters)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-mono flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Testar Link no Google (5★)</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={parameters.googleReviewUrl || ''}
              onChange={(e) => onUpdateParameter('googleReviewUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
              placeholder="Ex: https://search.google.com/local/writereview?placeid=SEU_PLACE_ID ou https://g.page/r/SEU_ID/review"
            />
            <div className="mt-2 text-[10px] text-zinc-400 font-mono space-y-1">
              <p className="flex items-start gap-1.5">
                <span className="text-amber-400 shrink-0 font-bold">⭐ Como funciona as 5 estrelas:</span>
                <span>
                  Cole o link gerado no perfil da sua empresa (Google Meu Negócio) ou o Place ID. O sistema injeta automaticamente o comando para <strong>já abrir o pop-up com as 5 estrelas marcadas</strong> para o cliente avaliar em 1 clique!
                </span>
              </p>
              <p className="text-[9px] text-zinc-500">
                Formatos aceitos: link do Google Meu Negócio (<code className="text-zinc-400">g.page/r/.../review</code>), link com placeid (<code className="text-zinc-400">search.google.com/local/writereview?placeid=...</code>) ou código Place ID do Google Maps (<code className="text-zinc-400">ChIJ...</code>).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONALIZAÇÃO VISUAL, CORES & LOGOMARCA */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="border-b border-zinc-850 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Palette className="w-4 h-4 text-yellow-400" />
              Personalização Visual, Identidade do Topo & Logomarca
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Personalize o nome exibido no canto superior, cor ao lado da logo, logotipo e paleta do sistema.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-lg">
            Cabeçalho & Tema
          </span>
        </div>

        {/* PRÉ-VISUALIZAÇÃO AO VIVO DO CABEÇALHO */}
        <div className="bg-black border border-zinc-800 rounded-xl p-3.5 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
              👁️ Pré-visualização do Canto Superior (ao lado do logo):
            </span>
            <span className="text-[9px] font-mono text-emerald-400">Tempo real</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl flex items-center gap-3">
            {parameters.logoUrl ? (
              <img
                src={parameters.logoUrl}
                alt="Logo"
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
                className="text-sm sm:text-base font-extrabold tracking-tight uppercase truncate transition-colors"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Nome do Sistema no Topo */}
            <div>
              <label className="text-[10px] text-zinc-300 uppercase font-mono font-bold block mb-1">
                Nome do Sistema no Topo (ao lado da Logo) *
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
                placeholder="Ex: Trima Studio"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-yellow-500 outline-none"
              />
            </div>

            {/* Cor do Nome do Topo */}
            <div>
              <label className="text-[10px] text-zinc-300 uppercase font-mono font-bold block mb-1">
                Cor do Nome no Topo (Hex) *
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={parameters.systemNameColor || parameters.primaryColor || '#eab308'}
                  onChange={(e) => onUpdateParameter('systemNameColor', e.target.value)}
                  className="h-9 w-10 bg-zinc-950 border border-zinc-800 rounded cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={parameters.systemNameColor || parameters.primaryColor || '#eab308'}
                  onChange={(e) => onUpdateParameter('systemNameColor', e.target.value)}
                  placeholder="#eab308"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:border-yellow-500 outline-none font-bold"
                />
              </div>
            </div>

            {/* Subtítulo no Topo */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                Slogan / Subtítulo Abaixo do Nome
              </label>
              <input
                type="text"
                value={parameters.systemSubtitle || 'Sempre em Boa Companhia'}
                onChange={(e) => onUpdateParameter('systemSubtitle', e.target.value)}
                placeholder="Ex: Sempre em Boa Companhia"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
              />
            </div>

            {/* Cor de Destaque / Tema */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                Cor de Destaque / Botões (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={parameters.primaryColor || '#eab308'}
                  onChange={(e) => onUpdateParameter('primaryColor', e.target.value)}
                  className="h-9 w-10 bg-zinc-950 border border-zinc-800 rounded cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={parameters.primaryColor || '#eab308'}
                  onChange={(e) => onUpdateParameter('primaryColor', e.target.value)}
                  placeholder="#eab308"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
                Cor do Fundo do Sistema (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={parameters.backgroundColor || '#000000'}
                  onChange={(e) => onUpdateParameter('backgroundColor', e.target.value)}
                  className="h-9 w-10 bg-zinc-950 border border-zinc-800 rounded cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={parameters.backgroundColor || '#000000'}
                  onChange={(e) => onUpdateParameter('backgroundColor', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
              Logotipo da Barbearia (Upload de Imagem)
            </label>
            <div
              onDragOver={handleLogoDragOver}
              onDragLeave={handleLogoDragLeave}
              onDrop={handleLogoDrop}
              className={`border-2 border-dashed rounded-xl p-4 transition text-center flex flex-col items-center justify-center cursor-pointer min-h-[120px] ${
                isDraggingLogo
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
              }`}
              onClick={() => document.getElementById('logo-file-picker')?.click()}
            >
              <input
                id="logo-file-picker"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {parameters.logoUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={parameters.logoUrl}
                    alt="Logotipo atual"
                    className="h-14 w-14 object-contain rounded-lg border border-zinc-800 p-1 bg-black"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-300 font-bold">Logotipo Carregado</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateParameter('logoUrl', '');
                      }}
                      className="mt-1 text-[9px] text-red-500 uppercase font-mono tracking-wider hover:underline cursor-pointer"
                    >
                      Remover logotipo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-lg">📁</span>
                  <p className="text-xs text-zinc-300">Arrastar & Soltar a Imagem aqui</p>
                  <p className="text-[9px] text-zinc-500 font-mono">ou clique para selecionar do dispositivo</p>
                </div>
              )}
            </div>
            <p className="text-[9px] text-zinc-500 italic mt-1">
              Carregue uma imagem quadrada da sua barbearia para o carregamento e topo dos painéis.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FORMAS DE PAGAMENTO */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 border-b border-zinc-850 pb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-yellow-400" />
          Gerenciamento de Formas de Pagamento
        </h4>

        <form onSubmit={handleAddPaymentMethod} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newPaymentMethodName}
            onChange={(e) => setNewPaymentMethodName(e.target.value)}
            placeholder="Ex: Vale Presente, Boleto..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {paymentMethods.map((method) => (
            <div
              key={method}
              className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300"
            >
              <span>💳 {method}</span>
              <button
                type="button"
                onClick={() => handleDeletePaymentMethod(method)}
                className="text-zinc-500 hover:text-red-400 transition cursor-pointer text-xs"
                title="Remover forma de pagamento"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
