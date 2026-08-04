/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, Wallet, Check, AlertCircle, Trash2, Clock, Eye, Info, Percent, Printer, X, Copy } from 'lucide-react';
import { User, Comanda, BarberDetail, SystemParameters, CustomerSubscription, Appointment } from '../types';

interface CashierPanelProps {
  currentUser?: User;
  comandas: Comanda[];
  users: User[];
  barberDetails: BarberDetail[];
  subscriptions: CustomerSubscription[];
  appointments?: Appointment[];
  parameters: SystemParameters;
  onUpdateState: (key: string, val: any) => void;
}

export default function CashierPanel({
  currentUser,
  comandas,
  users,
  barberDetails,
  subscriptions,
  appointments = [],
  parameters,
  onUpdateState
}: CashierPanelProps) {
  const [filterMode, setFilterMode] = useState<'PENDING' | 'PAID'>('PENDING');
  const [selectedCmdId, setSelectedCmdId] = useState<string | null>(null);
  const [viewingReceiptComanda, setViewingReceiptComanda] = useState<Comanda | null>(null);

  // checkout form state
  const [discountVal, setDiscountVal] = useState('0');
  const [isRedeemingLoyalty, setIsRedeemingLoyalty] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(() => {
    const list = parameters?.paymentMethods || ['PIX', 'CARTÃO', 'DINHEIRO', 'ASSINATURA'];
    return list.includes('PIX') ? 'PIX' : (list[0] || 'PIX');
  });

  const selectedComanda = comandas.find(c => c.id === selectedCmdId);
  const selectedCustomer = users.find(u => u.id === selectedComanda?.customerId);

  // Auto-set payment method to ASSINATURA if comanda is marked as subscription use
  React.useEffect(() => {
    if (selectedComanda?.isSubscriptionUse || selectedComanda?.paymentMethod === 'ASSINATURA') {
      setPaymentMethod('ASSINATURA');
    }
    setIsRedeemingLoyalty(false);
  }, [selectedCmdId]);

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Helper to check if date string matches today's local date
  const isToday = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    const today = new Date();
    const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (dateStr.startsWith(todayYMD)) return true;

    if (dateStr.includes('/')) {
      const parts = dateStr.trim().split(' ')[0].split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        const formatted = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        if (formatted === todayYMD) return true;
      }
    }

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return (
        parsed.getFullYear() === today.getFullYear() &&
        parsed.getMonth() === today.getMonth() &&
        parsed.getDate() === today.getDate()
      );
    }

    return false;
  };

  const isPaidToday = (c: Comanda): boolean => {
    if (c.status !== 'PAID') return false;
    const paidDate = c.completedAt || c.dispatchedAt || c.createdAt;
    return isToday(paidDate);
  };

  // FILTER COMANDAS AT CAIXA DESK
  const displayedComandas = (filterMode === 'PENDING'
    ? comandas.filter(c => c.status === 'OPEN')
    : comandas.filter(isPaidToday)
  ).slice().sort((a, b) => {
    if (a.readyForPayment && !b.readyForPayment) return -1;
    if (!a.readyForPayment && b.readyForPayment) return 1;
    const dateA = a.completedAt || a.dispatchedAt || a.createdAt;
    const dateB = b.completedAt || b.dispatchedAt || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // CHECKOUT ACTION: MARKS COMANDA AS PAID AND RE-CALCULATES COMMISSIONS
  const handleCheckoutComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComanda) return;

    const discount = parseFloat(discountVal) || 0;
    const finalTotal = Math.max(0, selectedComanda.subtotal - discount);

    // Dynamic and high-fidelity Barber Commission breakdown calculation:
    // 1. Find standard barber detail rates
    const bDetail = barberDetails.find(d => d.userId === selectedComanda.barberId);
    const standardSrvRate = bDetail?.commissionRateStandard ?? parameters.defaultCommissionService;
    const subscriptionSrvRate = bDetail?.commissionRateSubscription ?? 0.35;
    const productCommissionRate = bDetail?.commissionRateProduct ?? parameters.defaultCommissionProduct; // e.g. 15% custom or default 10%

    // 2. Compute dynamic item-by-item commission payout amounts
    let calculatedCommissionAmount = 0;

    selectedComanda.items.forEach(item => {
      const lineValue = item.quantity * item.unitPrice;
      if (item.isVipService) {
        // VIP service: 100% of the value goes to the barber (shop gets 0%)
        calculatedCommissionAmount += lineValue;
      } else if (item.isProduct) {
        // Product commission (standard e.g. 10%)
        calculatedCommissionAmount += lineValue * productCommissionRate;
      } else {
        // Service commission
        if (paymentMethod === 'SUBSCRIPTION' || paymentMethod === 'ASSINATURA') {
          // Find customer's active subscription to check plan discount percentage
          const activeSub = subscriptions.find(s => s.customerId === selectedComanda.customerId && s.isActive);
          let planDiscountPct = 0;
          if (activeSub && activeSub.discountPercentage !== undefined && activeSub.discountPercentage > 0) {
            planDiscountPct = activeSub.discountPercentage > 1 ? activeSub.discountPercentage / 100 : activeSub.discountPercentage;
          } else {
            // Default 12% discount for standard subscription plan (subDiscount3to4 = 0.12)
            planDiscountPct = parameters.subDiscount3to4 ?? 0.12;
          }
          // Service value after plan discount
          const discountedLineValue = lineValue * (1 - planDiscountPct);
          calculatedCommissionAmount += discountedLineValue * subscriptionSrvRate;
        } else {
          calculatedCommissionAmount += lineValue * standardSrvRate;
        }
      }
    });

    // Substract proportional discount from commission safely
    const ratio = selectedComanda.subtotal > 0 ? (finalTotal / selectedComanda.subtotal) : 1;
    calculatedCommissionAmount = calculatedCommissionAmount * ratio;

    // 3. Mark comanda as PAID
    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComanda.id) {
        return {
          ...c,
          status: 'PAID' as const,
          discount: discount,
          total: finalTotal,
          paymentMethod: paymentMethod,
          completedAt: new Date().toISOString(),
          commissionAmount: parseFloat(calculatedCommissionAmount.toFixed(2)),
          closedBy: currentUser?.name || 'Caixa'
        };
      }
      return c;
    });

    // 4. Update appointment status (if linked) to COMPLETED
    if (selectedComanda.appointmentId && appointments.length > 0) {
      const updatedApts = appointments.map(a => 
        a.id === selectedComanda.appointmentId ? { ...a, status: 'COMPLETED' as const, completedAt: new Date().toISOString() } : a
      );
      onUpdateState('appointments', updatedApts);
    }

    // 5. If paid by SUBSCRIPTION, deduct remaining times from active membership!
    if (paymentMethod === 'SUBSCRIPTION' || paymentMethod === 'ASSINATURA') {
      const activeMember = subscriptions.find(s => s.customerId === selectedComanda.customerId && s.isActive);
      if (activeMember) {
        onUpdateState('subscriptions', subscriptions.map(s => {
          if (s.id === activeMember.id) {
            return {
              ...s,
              servicesRemaining: Math.max(0, s.servicesRemaining - 1),
              isActive: s.servicesRemaining - 1 > 0
            };
          }
          return s;
        }));
      }
    }

    // 6. PROGRAMA DE FIDELIDADE: Credit points and deduct if redeemed
    if (parameters.enableLoyalty !== false && selectedComanda.customerId) {
      const ptsPerReal = parameters.loyaltyPointsPerReal || 1;
      const pointsEarned = Math.floor(finalTotal * ptsPerReal);
      const minToRedeem = parameters.loyaltyMinPointsRedeem || 100;

      const updatedUsers = users.map(u => {
        if (u.id === selectedComanda.customerId) {
          const currentPts = u.loyaltyPoints || 0;
          const ptsAfterRedemption = isRedeemingLoyalty ? Math.max(0, currentPts - minToRedeem) : currentPts;
          return {
            ...u,
            loyaltyPoints: ptsAfterRedemption + pointsEarned
          };
        }
        return u;
      });
      onUpdateState('users', updatedUsers);
    }

    onUpdateState('comandas', updatedComandas);
    setSelectedCmdId(null);
    setDiscountVal('0');
    setIsRedeemingLoyalty(false);
    setPaymentMethod('PIX');
    alert('Comanda registrada como PAGA com sucesso! Comissão provisionada na ficha do barbeiro e Pontos de Fidelidade atualizados.');
  };

  return (
    <div className="space-y-6 text-left">
      {/* EXTREMELY CRITICAL NOTIFICATION BANNER ENFORCING SCOPE boundaries */}
      <div className="bg-yellow-500/10 border-2 border-yellow-500/40 p-5 rounded-2xl flex items-start gap-3 text-yellow-500 text-xs leading-snug">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm tracking-wider uppercase font-mono mb-1">📢 IMPORTANTE: Espelho de Digitação Externa</h4>
          <p className="text-zinc-300">
            Este terminal **não substitui** o seu ERP ou PDV fiscal físico de balcão. Ele serve como um **espelho de consumo** intuitivo para o caixa ler o que foi consumido na cadeira, de onde poderá digitar as informações no software principal da loja de forma ágil.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest leading-none">
          Operador de Caixa: Balcão e Lançamentos
        </h3>
        {/* Toggle options */}
        <div className="flex gap-1.5 bg-[#121214] p-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono">
          <button
            onClick={() => {
              setFilterMode('PENDING');
              setSelectedCmdId(null);
            }}
            className={`px-3 py-1 rounded cursor-pointer ${filterMode === 'PENDING' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            Aguardando ({comandas.filter(c => c.status === 'OPEN').length})
          </button>
          <button
            onClick={() => {
              setFilterMode('PAID');
              setSelectedCmdId(null);
            }}
            className={`px-3 py-1 rounded cursor-pointer ${filterMode === 'PAID' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            Faturadas hoje ({comandas.filter(isPaidToday).length})
          </button>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column of list */}
        <div className="lg:col-span-1 space-y-2.5">
          {displayedComandas.length === 0 ? (
            <div className="bg-[#101012] border border-zinc-850 p-6 rounded-xl text-center text-zinc-500 text-xs">
              📂 Nenhuma comanda {filterMode === 'PENDING' ? 'aguardando pagamento' : 'paga'} neste momento.
            </div>
          ) : (
            <div className="space-y-2">
              {displayedComandas.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCmdId(c.id);
                  }}
                  className={`w-full p-4 rounded-xl text-left border text-xs transition ${
                    selectedCmdId === c.id
                      ? 'bg-[#18181D] border-yellow-500'
                      : 'bg-[#101012] border-zinc-850 hover:bg-[#131317]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="truncate max-w-[130px]">
                      <span className="font-bold text-white block truncate">{c.customerName}</span>
                      <span className="text-[10px] font-medium text-zinc-400">Atendido por: {c.barberName}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 text-yellow-500 border border-zinc-850 px-2 py-0.5 rounded font-bold">
                      {formatCurrency(c.total)}
                    </span>
                  </div>

                  {c.readyForPayment && (
                    <div className="mt-2 bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-[9px] font-mono font-extrabold uppercase flex items-center justify-between shadow-sm animate-pulse">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        SERVIÇO ENCERRADO
                      </span>
                      <span className="text-[8px] text-emerald-400/80">Despachado</span>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-zinc-900 mt-2.5 flex justify-between items-center text-[10px] text-zinc-500">
                    <span>{c.items.length} itens inclusos</span>
                    <span>Código {c.id.slice(-5)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column of details & checkout trigger */}
        <div className="lg:col-span-2">
          {!selectedComanda ? (
            <div className="bg-[#101012] border border-zinc-805 p-8 rounded-xl text-zinc-500 text-xs text-center flex flex-col items-center justify-center min-h-[250px] font-medium h-full">
              <Eye className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="font-semibold text-zinc-400">Nenhuma comanda aberta selecionada.</p>
              <p className="text-zinc-600 mt-0.5">Selecione ao lado para abrir o espelho de digitação e faturamento.</p>
            </div>
          ) : (
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-6">
              {/* Ready for payment banner */}
              {selectedComanda.readyForPayment && (
                <div className="bg-emerald-950/80 border-2 border-emerald-500/80 p-3.5 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-mono font-extrabold shadow-md">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-emerald-400 uppercase font-black tracking-wider">
                      SERVIÇO ENCERRADO / DESPACHADO PELO BARBEIRO ({selectedComanda.barberName})
                    </span>
                    <span className="text-white text-xs">
                      ✅ Atendimento concluído na cadeira! Liberado para receber o pagamento no caixa.
                    </span>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="pb-4 border-b border-zinc-850 flex justify-between items-start">
                <div>
                  <span className="text-[9px] text-yellow-500 font-mono block uppercase font-bold text-zinc-400 mb-1 leading-none">Espelho de Consumo para Digitação Fiscal</span>
                  <h4 className="text-base text-white font-extrabold">{selectedComanda.customerName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Lançada por barbeiro: <strong>{selectedComanda.barberName}</strong> | Ref: {selectedComanda.id}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    selectedComanda.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500 animate-pulse'
                  }`}>
                    {selectedComanda.status === 'PAID' ? 'Faturada/Paga' : 'Aguardando Checkout'}
                  </span>
                  {parameters.enableReceipts !== false && (
                    <button
                      type="button"
                      onClick={() => setViewingReceiptComanda(selectedComanda)}
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cupom Térmico
                    </button>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Resumo dos Consumos (Copiar p/ ERP):</span>
                <div className="bg-zinc-950 px-4 py-3 border border-zinc-850 rounded-xl space-y-2.5">
                  {selectedComanda.items.map(item => (
                    <div key={item.id} className="text-xs flex justify-between items-center text-zinc-300">
                      <div>
                        <p className="font-bold text-white max-w-[200px] truncate">{item.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">Qtd: {item.quantity} un x {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <span className="font-mono text-zinc-300">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                  <div className="text-xs flex justify-between items-center border-t border-zinc-900 pt-2 text-zinc-400 font-mono">
                    <span>Subtotal Líquido</span>
                    <span>{formatCurrency(selectedComanda.subtotal)}</span>
                  </div>
                </div>
              </div>

              {/* Comission simulation warning inside Caixa for transparency */}
              {selectedComanda.status === 'PAID' && (
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold font-mono">Cálculo de Repasse Associado:</span>
                  <p className="text-xs text-white">Comissão repassada para <strong>{selectedComanda.barberName}</strong>: <span className="font-mono text-yellow-500 font-bold">{formatCurrency(selectedComanda.commissionAmount || 0)}</span></p>
                  <p className="text-[10px] text-zinc-500">Forma utilizada: {selectedComanda.paymentMethod} (faturamento final de {formatCurrency(selectedComanda.total)})</p>
                </div>
              )}

              {/* Checkout inputs (only visible for pending) */}
              {selectedComanda.status === 'OPEN' && (
                <form onSubmit={handleCheckoutComanda} className="space-y-4 pt-2 border-t border-zinc-850">
                  {/* Loyalty Points Alert & Redemption Toggle */}
                  {parameters.enableLoyalty !== false && selectedCustomer && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                      <div>
                        <span className="text-amber-400 font-bold block">🏆 Programa de Fidelidade ({selectedCustomer.name})</span>
                        <span className="text-zinc-400 text-[11px]">
                          Pontos Acumulados: <strong className="text-white">{selectedCustomer.loyaltyPoints || 0} pts</strong>
                        </span>
                      </div>
                      {(selectedCustomer.loyaltyPoints || 0) >= (parameters.loyaltyMinPointsRedeem || 100) ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (isRedeemingLoyalty) {
                              setIsRedeemingLoyalty(false);
                              setDiscountVal('0');
                            } else {
                              setIsRedeemingLoyalty(true);
                              setDiscountVal((parameters.loyaltyRewardValue || 15).toString());
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition ${
                            isRedeemingLoyalty
                              ? 'bg-emerald-500 text-black border border-emerald-400'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                        >
                          {isRedeemingLoyalty ? '✓ Desconto Aplicado (-R$ ' + (parameters.loyaltyRewardValue || 15) + ')' : '🎁 Resgatar R$ ' + (parameters.loyaltyRewardValue || 15) + ' de Desconto'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic">
                          Mínimo {parameters.loyaltyMinPointsRedeem || 100} pts para resgate
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add Discount */}
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest block mb-1">Desconto Aplicado (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-zinc-500 text-xs font-mono">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={discountVal}
                          onChange={(e) => setDiscountVal(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-9 py-1 px-3 text-xs font-mono text-white text-right"
                        />
                      </div>
                    </div>

                    {/* Method */}
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest block mb-1">Forma de Recebimento</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-xs text-white font-mono cursor-pointer"
                      >
                        {(parameters?.paymentMethods || ['PIX', 'CARTÃO', 'DINHEIRO', 'ASSINATURA']).map(pm => (
                          <option key={pm} value={pm}>
                            {pm === 'PIX' ? '⚡ PIX instantâneo' : pm === 'CARTÃO' || pm === 'CARD' ? '💳 Cartão de Débito/Crédito' : pm === 'DINHEIRO' || pm === 'MONEY' ? '💵 Dinheiro Físico' : pm === 'ASSINATURA' || pm === 'SUBSCRIPTION' ? '🔄 Assinatura / Clube de Vantagem' : `💳 ${pm}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Complete Action buttons */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-3">
                    <div className="text-left">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono leading-none">VALOR COM DESCONTO</span>
                      <span className="text-xl font-bold font-mono text-yellow-500">
                        {formatCurrency(Math.max(0, selectedComanda.subtotal - (parseFloat(discountVal) || 0)))}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow transition"
                    >
                      Confirmar Pagamento & Finalizar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* THERMAL RECEIPT OVERLAY MODAL */}
      {viewingReceiptComanda && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full font-mono text-xs shadow-2xl relative space-y-4 text-left">
            {/* Header */}
            <div className="text-center border-b border-dashed border-zinc-400 pb-3 space-y-1">
              <h3 className="font-bold text-base uppercase tracking-wider">{parameters.shopName || 'Trima Studio'}</h3>
              <p className="text-[10px] text-zinc-600">{parameters.address || 'Rua Trima Studio, 777'}</p>
              <p className="text-[10px] text-zinc-600">Tel: {parameters.phone || '(11) 98765-4321'}</p>
              <div className="pt-2 text-[10px] font-bold text-zinc-800 uppercase tracking-widest">
                *** COMPROVANTE DE CONSUMO ***
              </div>
            </div>

            {/* Meta details */}
            <div className="text-[10px] space-y-1 text-zinc-700 border-b border-dashed border-zinc-400 pb-3">
              <p><strong>Comanda:</strong> #{viewingReceiptComanda.id.slice(-6).toUpperCase()}</p>
              <p><strong>Cliente:</strong> {viewingReceiptComanda.customerName}</p>
              <p><strong>Atendente:</strong> {viewingReceiptComanda.barberName}</p>
              <p><strong>Data/Hora:</strong> {new Date(viewingReceiptComanda.completedAt || viewingReceiptComanda.createdAt).toLocaleString('pt-BR')}</p>
              <p><strong>Status:</strong> {viewingReceiptComanda.status === 'PAID' ? 'PAGO / FATURADO' : 'EM ABERTO'}</p>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-dashed border-zinc-400 pb-3">
              <div className="flex justify-between font-bold text-[10px] text-zinc-800 uppercase border-b border-zinc-300 pb-1">
                <span>Item / Qtd</span>
                <span>Total</span>
              </div>
              {viewingReceiptComanda.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-zinc-800">
                  <div>
                    <span>{i.quantity}x {i.description}</span>
                  </div>
                  <span>{formatCurrency(i.quantity * i.unitPrice)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-right text-zinc-800 border-b border-dashed border-zinc-400 pb-3">
              <div className="flex justify-between text-[11px]">
                <span>Subtotal:</span>
                <span>{formatCurrency(viewingReceiptComanda.subtotal)}</span>
              </div>
              {viewingReceiptComanda.discount ? (
                <div className="flex justify-between text-[11px] text-red-600">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(viewingReceiptComanda.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-bold pt-1 text-black border-t border-zinc-300">
                <span>TOTAL PAGO:</span>
                <span>{formatCurrency(viewingReceiptComanda.total)}</span>
              </div>
              <div className="text-[10px] text-zinc-600 pt-0.5">
                Forma: <strong>{viewingReceiptComanda.paymentMethod || 'PIX'}</strong>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-zinc-600 italic">
              <p>{parameters.receiptFooterText || 'Obrigado pela preferência! Volte sempre.'}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-black text-white hover:bg-zinc-800 py-2 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Printer className="w-4 h-4" /> Imprimir Cupom
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `*${parameters.shopName}*\n` +
                    `Comprovante da Comanda #${viewingReceiptComanda.id.slice(-6).toUpperCase()}\n` +
                    `Cliente: ${viewingReceiptComanda.customerName}\n` +
                    `Atendente: ${viewingReceiptComanda.barberName}\n` +
                    `Itens:\n` + viewingReceiptComanda.items.map(i => `- ${i.quantity}x ${i.description} (${formatCurrency(i.quantity * i.unitPrice)} )`).join('\n') +
                    `\nSubtotal: ${formatCurrency(viewingReceiptComanda.subtotal)}\n` +
                    (viewingReceiptComanda.discount ? `Desconto: -${formatCurrency(viewingReceiptComanda.discount)}\n` : '') +
                    `*Total Pago: ${formatCurrency(viewingReceiptComanda.total)}*\n` +
                    `Forma: ${viewingReceiptComanda.paymentMethod || 'PIX'}\n` +
                    `\n_${parameters.receiptFooterText || 'Obrigado pela preferência!'}_`;
                  navigator.clipboard.writeText(text);
                  alert('Texto do comprovante copiado para a área de transferência! Pronto para enviar no WhatsApp.');
                }}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 py-2 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition border border-zinc-300"
              >
                <Copy className="w-4 h-4" /> Copiar Texto p/ WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setViewingReceiptComanda(null)}
                className="w-full text-zinc-500 hover:text-black py-1 font-bold text-[10px] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
