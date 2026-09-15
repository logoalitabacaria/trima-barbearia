/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CreditCard, ToggleLeft, ToggleRight, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SystemParameters, LoyaltyPlan, Service, BarberDetail } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface SettingsSubscriptionsProps {
  parameters: SystemParameters;
  plans: LoyaltyPlan[];
  services: Service[];
  barberDetails?: BarberDetail[];
  onUpdateParameter: (key: string, val: any) => void;
  onNavigateToPlans: () => void;
}

export default function SettingsSubscriptions({
  parameters,
  plans,
  services,
  onUpdateParameter,
  onNavigateToPlans
}: SettingsSubscriptionsProps) {
  const isQuantityDiscountEnabled = parameters.enableQuantitySubscriptionDiscount !== false;

  return (
    <div className="space-y-6 text-left">
      {/* 1. DESCONTOS DE ASSINATURA POR QUANTIDADE DE SERVIÇOS */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-yellow-400" />
              Descontos de Assinatura por Quantidade de Serviços
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Ative ou desative o sistema que concede descontos progressivos conforme o cliente adiciona mais serviços ao montar uma assinatura personalizada.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateParameter('enableQuantitySubscriptionDiscount', !isQuantityDiscountEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
              isQuantityDiscountEnabled
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/10'
                : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {isQuantityDiscountEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-black" />
                <span>Sistema Ativado</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-zinc-500" />
                <span>Sistema Desativado</span>
              </>
            )}
          </button>
        </div>

        {!isQuantityDiscountEnabled ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-300 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">
                O sistema de descontos por volume de serviços está atualmente DESATIVADO.
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                No portal do cliente, as assinaturas personalizadas serão contratadas pelo <strong className="text-zinc-200">valor integral nominal</strong> dos serviços selecionados, sem conceder porcentagens de abatimento. Você pode manter ou ajustar as taxas percentuais abaixo para quando reativar a funcionalidade.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              O sistema de descontos está <strong>ativo</strong> e aplicando as faixas progressivas automaticamente no portal do cliente.
            </span>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[11px] uppercase font-mono font-bold text-zinc-300 block">
            Faixas de Desconto Progressivo por Quantidade de Serviços
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">2 Serviços (%)</label>
              <input
                type="number"
                value={Math.round((parameters.subDiscount2 ?? 0.05) * 100)}
                onChange={(e) => onUpdateParameter('subDiscount2', parseFloat(e.target.value) / 100)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: 5%</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">3 a 4 Serviços (%)</label>
              <input
                type="number"
                value={Math.round((parameters.subDiscount3to4 ?? 0.12) * 100)}
                onChange={(e) => onUpdateParameter('subDiscount3to4', parseFloat(e.target.value) / 100)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: 12%</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">5 a 6 Serviços (%)</label>
              <input
                type="number"
                value={Math.round((parameters.subDiscount5to6 ?? 0.20) * 100)}
                onChange={(e) => onUpdateParameter('subDiscount5to6', parseFloat(e.target.value) / 100)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: 20%</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase font-mono block">7 ou Mais Serviços (%)</label>
              <input
                type="number"
                value={Math.round((parameters.subDiscount7Plus ?? 0.28) * 100)}
                onChange={(e) => onUpdateParameter('subDiscount7Plus', parseFloat(e.target.value) / 100)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-yellow-500 outline-none"
              />
              <p className="text-[9px] text-zinc-500 font-mono">Padrão: 28%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLANOS DE ASSINATURA RECORRENTE VIGENTES & RESUMO */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Planos de Assinatura Recorrente Cadastrados ({plans.length})
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Planos fixos ou com uso ilimitado de serviços específicos e comissionamento editável para os profissionais.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToPlans}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-xl transition cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow"
          >
            <span>Gerenciar / Novo Plano</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {plans.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-3">Nenhum plano de fidelidade ou assinatura cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isUnlimited = plan.isUnlimited === true;
              const includedServices = (plan.includedServiceIds || [])
                .map(id => services.find(s => s.id === id))
                .filter(Boolean) as Service[];

              const payoutRate = plan.barberPayoutRate ?? 0.50;
              const simUses = 4;
              const simPerUse = plan.priceMonthly / simUses;
              const simBarberPayout = simPerUse * payoutRate;

              return (
                <div
                  key={plan.id}
                  className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white font-mono">{plan.name}</span>
                      {isUnlimited ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          ✨ ILIMITADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400">
                          {plan.servicesIncludedCount} USOS
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2">{plan.description}</p>

                    <div className="text-base font-extrabold text-yellow-500 font-mono">
                      {formatCurrency(plan.priceMonthly)} <span className="text-[10px] text-zinc-500 font-normal">/mês</span>
                    </div>

                    {isUnlimited && (
                      <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between text-zinc-300 font-mono">
                          <span>Repasse Barbeiro:</span>
                          <span className="text-amber-400 font-bold">{Math.round(payoutRate * 100)}%</span>
                        </div>
                        <div className="text-[9px] text-zinc-400">
                          Ex: Com {simUses} atendimentos/mês, o barbeiro recebe <strong className="text-emerald-400">{formatCurrency(simBarberPayout)}</strong> por corte.
                        </div>
                        {includedServices.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {includedServices.map(s => (
                              <span key={s.id} className="px-1.5 py-0.5 bg-zinc-950 text-zinc-300 rounded text-[9px] border border-zinc-800">
                                ✓ {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToPlans}
                    className="text-[11px] text-yellow-500 hover:text-yellow-400 font-mono font-bold flex items-center gap-1 pt-2 border-t border-zinc-900 cursor-pointer"
                  >
                    Editar Plano na Aba de Planos →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
