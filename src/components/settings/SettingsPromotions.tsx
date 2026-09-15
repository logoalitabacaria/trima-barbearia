/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tag, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Ticket, Users } from 'lucide-react';
import { SystemParameters, DiscountCoupon, PromotionRule } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface SettingsPromotionsProps {
  parameters: SystemParameters;
  coupons?: DiscountCoupon[];
  onUpdateParameter: (key: string, val: any) => void;
  onOpenNewPromotion: () => void;
  onEditPromotion: (promo: PromotionRule) => void;
  onTogglePromotionActive: (promoId: string) => void;
  onDeletePromotion: (promoId: string) => void;
  onOpenNewCoupon: () => void;
  onEditCoupon: (coupon: DiscountCoupon) => void;
  onToggleCouponActive: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
}

export default function SettingsPromotions({
  parameters,
  coupons = [],
  onUpdateParameter,
  onOpenNewPromotion,
  onEditPromotion,
  onTogglePromotionActive,
  onDeletePromotion,
  onOpenNewCoupon,
  onEditCoupon,
  onToggleCouponActive,
  onDeleteCoupon
}: SettingsPromotionsProps) {
  const isPromotionsEnabled = parameters.enablePromotions !== false;
  const isReferralEnabled = parameters.enableReferralProgram !== false;
  const promotionsList: PromotionRule[] = parameters.promotions || [];

  return (
    <div className="space-y-6 text-left">
      {/* 1. SISTEMA DE PROMOÇÕES DA BARBEARIA */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              Campanhas & Promoções da Barbearia
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Crie promoções sazonais, primeira compra, aniversários ou combos especiais para exibir aos clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateParameter('enablePromotions', !isPromotionsEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
              isPromotionsEnabled
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/10'
                : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {isPromotionsEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-black" />
                <span>Promoções Ativadas</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-zinc-500" />
                <span>Promoções Desativadas</span>
              </>
            )}
          </button>
        </div>

        {isPromotionsEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono text-zinc-300">
                Lista de Promoções Cadastradas ({promotionsList.length})
              </span>
              <button
                type="button"
                onClick={onOpenNewPromotion}
                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Promoção</span>
              </button>
            </div>

            {promotionsList.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 border border-zinc-850 rounded-xl">
                <Tag className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400 font-mono">Nenhuma promoção configurada no momento.</p>
                <button
                  type="button"
                  onClick={onOpenNewPromotion}
                  className="mt-3 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-yellow-500 text-xs font-mono rounded-lg transition cursor-pointer"
                >
                  + Criar Primeira Promoção
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {promotionsList.map((promo) => (
                  <div
                    key={promo.id}
                    className={`bg-zinc-950 border rounded-xl p-3.5 space-y-2 transition ${
                      promo.isActive ? 'border-zinc-800' : 'border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">{promo.title}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              promo.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {promo.isActive ? 'ATIVA' : 'INATIVA'}
                          </span>
                        </div>
                        {promo.code && (
                          <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                            CUPOM: {promo.code}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onTogglePromotionActive(promo.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer text-[10px] ${
                            promo.isActive
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          }`}
                          title={promo.isActive ? 'Desativar Promoção' : 'Ativar Promoção'}
                        >
                          {promo.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditPromotion(promo)}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-yellow-400 rounded-lg transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePromotion(promo.id)}
                          className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400">{promo.description}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
                      <span>
                        Desconto:{' '}
                        <strong className="text-yellow-400">
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}%`
                            : formatCurrency(promo.discountValue)}
                        </strong>
                      </span>
                      {promo.validUntil && <span>Válido até: {promo.validUntil}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. CUPONS DE DESCONTO */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-yellow-400" />
              Cupons de Desconto ({coupons.length})
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Cadastre códigos promocionais para clientes inserirem no portal ou no balcão do caixa.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewCoupon}
            className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-xl transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cupom</span>
          </button>
        </div>

        {coupons.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950 border border-zinc-850 rounded-xl">
            <Ticket className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-mono">Nenhum cupom de desconto criado.</p>
            <button
              type="button"
              onClick={onOpenNewCoupon}
              className="mt-3 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-yellow-500 text-xs font-mono rounded-lg transition cursor-pointer"
            >
              + Criar Primeiro Cupom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`bg-zinc-950 border rounded-xl p-3.5 space-y-2.5 transition flex flex-col justify-between ${
                  coupon.isActive ? 'border-zinc-800' : 'border-zinc-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-black text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                      {coupon.code}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        coupon.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {coupon.isActive ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 mt-2 line-clamp-2">
                    {coupon.description || 'Sem descrição cadastrada.'}
                  </p>

                  <div className="mt-2 space-y-1 text-[10px] font-mono text-zinc-400">
                    <div>
                      Desconto:{' '}
                      <strong className="text-white">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </strong>
                    </div>
                    {coupon.minPurchaseAmount ? (
                      <div>Gasto mínimo: {formatCurrency(coupon.minPurchaseAmount)}</div>
                    ) : null}
                    {coupon.validUntil ? <div>Validade: {coupon.validUntil}</div> : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => onToggleCouponActive(coupon.id)}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded text-[10px] font-mono transition cursor-pointer"
                  >
                    {coupon.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditCoupon(coupon)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-yellow-400 rounded transition cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCoupon(coupon.id)}
                    className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 text-zinc-400 hover:text-red-400 rounded transition cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PROGRAMA DE INDICAÇÃO COM DESCONTO */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Programa de Indicação ("Indique e Ganhe")
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Premie clientes que recomendam a barbearia para amigos, gerando cupons de desconto automáticos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUpdateParameter('enableReferralProgram', !isReferralEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto shadow-md ${
              isReferralEnabled
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/10'
                : 'bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {isReferralEnabled ? (
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

        {isReferralEnabled && (
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                  Desconto para Quem Indica (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parameters.referralDiscountReferrer ?? 10}
                  onChange={(e) => onUpdateParameter('referralDiscountReferrer', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                />
                <p className="text-[9px] text-zinc-500 mt-1">
                  Valor concedido ao cliente quando o amigo indicado concluir um serviço.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                  Desconto para o Amigo Indicado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parameters.referralDiscountReferred ?? 10}
                  onChange={(e) => onUpdateParameter('referralDiscountReferred', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                />
                <p className="text-[9px] text-zinc-500 mt-1">
                  Valor de boas-vindas no primeiro agendamento do amigo.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Título da Promoção de Indicação
              </label>
              <input
                type="text"
                value={parameters.referralTitle || ''}
                onChange={(e) => onUpdateParameter('referralTitle', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Ex: 🤝 Indique um Amigo e Ganhe R$ 10 de Desconto!"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                Texto Explicativo e Regras do Programa
              </label>
              <textarea
                rows={2}
                value={parameters.referralRulesText || ''}
                onChange={(e) => onUpdateParameter('referralRulesText', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                placeholder="Regras exibidas ao cliente ao compartilhar o link ou código..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
