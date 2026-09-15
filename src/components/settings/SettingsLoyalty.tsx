/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gift, Award, MessageSquare, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { SystemParameters } from '../../types';

interface SettingsLoyaltyProps {
  parameters: SystemParameters;
  onUpdateParameter: (key: string, val: any) => void;
}

export default function SettingsLoyalty({ parameters, onUpdateParameter }: SettingsLoyaltyProps) {
  const isLoyaltyEnabled = parameters.enableLoyalty !== false;
  const isVipEnabled = parameters.enableVipServices !== false;
  const isNpsEnabled = parameters.enableNPS !== false;

  return (
    <div className="space-y-6 text-left">
      {/* 1. PROGRAMA DE PONTOS DE FIDELIDADE */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Gift className="w-4 h-4 text-yellow-400" />
              Programa de Fidelidade (Pontos & Recompensas)
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Premie a assiduidade dos clientes gerando pontos a cada real gasto no balcão.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateParameter('enableLoyalty', !isLoyaltyEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
              isLoyaltyEnabled
                ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10'
                : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {isLoyaltyEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-black" />
                <span>Programa Ativado</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-zinc-500" />
                <span>Programa Desativado</span>
              </>
            )}
          </button>
        </div>

        {isLoyaltyEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">
                Pontos Gerados por R$ 1,00 Gasto
              </label>
              <input
                type="number"
                step="0.1"
                value={parameters.loyaltyPointsPerReal ?? 1}
                onChange={(e) => onUpdateParameter('loyaltyPointsPerReal', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: 1 ponto por real</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">
                Mínimo de Pontos para Resgate
              </label>
              <input
                type="number"
                value={parameters.loyaltyMinPointsRedeem ?? 100}
                onChange={(e) => onUpdateParameter('loyaltyMinPointsRedeem', parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: 100 pontos</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">
                Valor do Desconto Resgatado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={parameters.loyaltyRewardValue ?? 10}
                onChange={(e) => onUpdateParameter('loyaltyRewardValue', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: R$ 10,00</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. CLIENTE VIP POR BARBEIRO */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Cota Mensal de Cortes VIP por Barbeiro
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Permite que cada profissional conceda um número restrito de cortes VIP gratuitos por mês para clientes especiais.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateParameter('enableVipServices', !isVipEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
              isVipEnabled
                ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10'
                : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {isVipEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-black" />
                <span>Cotas Ativadas</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-zinc-500" />
                <span>Cotas Desativadas</span>
              </>
            )}
          </button>
        </div>

        {isVipEnabled && (
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl max-w-sm space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-mono block">
              Limite Mensal de Cortes VIP por Barbeiro
            </label>
            <input
              type="number"
              min="0"
              value={parameters.vipServicesPerBarberMonthly ?? 2}
              onChange={(e) => onUpdateParameter('vipServicesPerBarberMonthly', parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
            />
            <p className="text-[9px] text-zinc-500 font-mono">Padrão: 2 cortes VIP por mês</p>
          </div>
        )}
      </div>

      {/* 3. PESQUISA NPS */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-yellow-400" />
              Pesquisa de Satisfação do Cliente (NPS)
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Avaliação de 0 a 10 exibida no portal do cliente após a finalização do atendimento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateParameter('enableNPS', !isNpsEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
              isNpsEnabled
                ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10'
                : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {isNpsEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-black" />
                <span>NPS Ativado</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-zinc-500" />
                <span>NPS Desativado</span>
              </>
            )}
          </button>
        </div>

        {isNpsEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título do Modal de Avaliação
              </label>
              <input
                type="text"
                value={parameters.npsTitle || ''}
                onChange={(e) => onUpdateParameter('npsTitle', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: Como foi sua experiência conosco?"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Pergunta da Avaliação (NPS)
              </label>
              <input
                type="text"
                value={parameters.npsQuestion || ''}
                onChange={(e) => onUpdateParameter('npsQuestion', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: De 0 a 10, qual a probabilidade de você nos recomendar?"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
