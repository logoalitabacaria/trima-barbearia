/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Plus, Scissors, Trash2, UserPlus, ShoppingBag, CreditCard, Clock, Check, Send, AlertCircle, Zap, Search, FileText, Cake, Phone, MessageSquare, Copy, ExternalLink, Filter, UserCheck, AlertTriangle, CheckCircle2, Trophy, Target, Award, Crown, Star, Flame, Medal, Percent, TrendingUp, Sparkles } from 'lucide-react';
import { User, Service, Product, Appointment, Comanda, ComandaItem, ComandaStatus, CustomerSubscription, SystemParameters, BarberDetail } from '../types';
import { buildWhatsAppReminderUrl } from '../utils/helpers';
import { calculateBarberGoalProgress, getBarberLeaderboard, DEFAULT_GOAL_TIERS } from '../utils/goals';

interface BarberPanelProps {
  users: User[];
  services: Service[];
  products: Product[];
  appointments: Appointment[];
  comandas: Comanda[];
  subscriptions?: CustomerSubscription[];
  barberDetails?: BarberDetail[];
  parameters?: SystemParameters;
  currentBarber: User;
  onUpdateState: (key: string, val: any) => void;
}

export default function BarberPanel({
  users,
  services,
  products,
  appointments,
  comandas,
  subscriptions = [],
  barberDetails = [],
  parameters,
  currentBarber,
  onUpdateState
}: BarberPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'comandas' | 'agenda' | 'fichas' | 'comissoes' | 'leads' | 'metas'>('comandas');

  // Leads filter state
  const [leadFilter, setLeadFilter] = useState<'ANIVERSARIANTE' | 'INATIVO_15' | 'INATIVO_30' | 'INATIVO_60' | 'TODOS'>('TODOS');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');

  // Barber commission period filtering states
  const [bPeriod, setBPeriod] = useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('mensal');
  const [bStartDate, setBStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [bEndDate, setBEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Client Quick Creation Form
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientBirthday, setClientBirthday] = useState('');

  // Client search term for all select dropdowns
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Schedulings Quick Creation Form
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCliId, setSelectedCliId] = useState(users.find(u => u.role === 'CUSTOMER')?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('14:00');

  // ENCAIXE (Quick Service) Form
  const [showEncaixeModal, setShowEncaixeModal] = useState(false);
  const [encaixeCliId, setEncaixeCliId] = useState(users.find(u => u.role === 'CUSTOMER')?.id || '');
  const [encaixeServiceIds, setEncaixeServiceIds] = useState<string[]>(() => services[0] ? [services[0].id] : []);
  const [encaixeStartTime, setEncaixeStartTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const [encaixeEndTime, setEncaixeEndTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const [encaixeObs, setEncaixeObs] = useState('');

  const toggleEncaixeService = (srvId: string) => {
    setEncaixeServiceIds(prev => {
      if (prev.includes(srvId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== srvId);
      } else {
        return [...prev, srvId];
      }
    });
  };

  const encaixeTotalPrice = services
    .filter(s => encaixeServiceIds.includes(s.id))
    .reduce((acc, s) => acc + s.price, 0);

  // Comanda Edition / Detail View Active State
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);

  // Addition of items form inside Comanda
  const [comandaItemType, setComandaItemType] = useState<'service' | 'product'>('service');
  const [addSelectedSrvId, setAddSelectedSrvId] = useState(services[0]?.id || '');
  const [addSelectedPrdId, setAddSelectedPrdId] = useState(products[0]?.id || '');
  const [addQuantity, setAddQuantity] = useState('1');
  const [isVipChecked, setIsVipChecked] = useState(false);
  const [vipCustomPrice, setVipCustomPrice] = useState('0');

  // VIP Quota Calculation for current barber
  const myBarberDetail = barberDetails.find(d => d.userId === currentBarber.id);
  const currentMonthVipCount = comandas
    .filter(c => c.barberId === currentBarber.id)
    .filter(c => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((count, c) => count + c.items.filter(i => i.isVipService).length, 0);

  const vipMonthlyQuota = myBarberDetail?.vipServicesMonthlyQuota ?? parameters?.vipServicesPerBarberMonthly ?? 5;
  const remainingVipQuota = Math.max(0, vipMonthlyQuota - currentMonthVipCount);

  // Manual Comanda Opening states
  const [showManualComandaForm, setShowManualComandaForm] = useState(false);
  const [manualComandaCliId, setManualComandaCliId] = useState(users.find(u => u.role === 'CUSTOMER')?.id || '');

  // Ficha / Customer Notes states
  const [selectedFichaCliId, setSelectedFichaCliId] = useState(users.find(u => u.role === 'CUSTOMER')?.id || '');
  const [savedFichaMsg, setSavedFichaMsg] = useState(false);

  // Agenda Blocking/Closure states
  const [blockType, setBlockType] = useState<'slot' | 'day'>('slot');
  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockTime, setBlockTime] = useState('12:00');

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const customersList = users.filter(u => u.role === 'CUSTOMER' || u.role === 'ADMIN');
  const filteredCustomersList = customersList.filter(u =>
    u.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(clientSearchTerm))
  );

  const getBirthdayStatus = (birthday?: string) => {
    if (!birthday) return null;
    const parts = birthday.split('-');
    if (parts.length < 3) return null;
    const bMonth = parseInt(parts[1], 10);
    const bDay = parseInt(parts[2], 10);
    const now = new Date();
    const cMonth = now.getMonth() + 1;
    const cDay = now.getDate();

    if (bMonth === cMonth && bDay === cDay) {
      return 'HOJE';
    }
    if (bMonth === cMonth && Math.abs(bDay - cDay) <= 3) {
      return 'PROXIMO';
    }
    return null;
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      alert('Selecione uma data para o bloqueio.');
      return;
    }
    if (blockType === 'slot' && !blockTime) {
      alert('Selecione um horário para o bloqueio.');
      return;
    }

    const isFullDay = blockType === 'day';
    const newBlock: Appointment = {
      id: `block-${Date.now()}`,
      customerId: 'BLOCKED_CUSTOMER',
      customerName: isFullDay ? '🚫 DIA INTEIRO BLOQUEADO' : '🚫 HORÁRIO FECHADO',
      customerPhone: 'N/A',
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      serviceId: isFullDay ? 'BLOCKED_FULL_DAY' : 'BLOCKED_SLOT',
      serviceName: isFullDay ? 'Ausente (Dia Inteiro)' : 'Horário Desativado',
      servicePrice: 0,
      date: blockDate,
      time: isFullDay ? '00:00' : blockTime,
      status: 'SCHEDULED'
    };

    if (blockType === 'slot') {
      const collision = appointments.some(
        a => a.date === blockDate && a.time === blockTime && a.barberId === currentBarber.id && a.status === 'SCHEDULED' && a.serviceId !== 'BLOCKED_SLOT' && a.serviceId !== 'BLOCKED_FULL_DAY'
      );
      if (collision) {
        if (!confirm('Já existe um cliente agendado para este horário. Deseja mesmo fechar este horário e sobrepor visualmente?')) {
          return;
        }
      }
    } else {
      const collisionCount = appointments.filter(
        a => a.date === blockDate && a.barberId === currentBarber.id && a.status === 'SCHEDULED' && a.serviceId !== 'BLOCKED_SLOT' && a.serviceId !== 'BLOCKED_FULL_DAY'
      ).length;
      if (collisionCount > 0) {
        if (!confirm(`Já existem ${collisionCount} clientes agendados para este dia. Deseja mesmo fechar o dia inteiro e impedir novos agendamentos?`)) {
          return;
        }
      }
    }

    onUpdateState('appointments', [...appointments, newBlock]);
    alert('Bloqueio de agenda criado com sucesso!');
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!confirm('Deseja realmente reabrir a agenda para este período?')) return;
    onUpdateState('appointments', appointments.filter(a => a.id !== blockId));
  };

  // REGISTER CLIENTS DIRECTLY BY THE BARBER
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const shortId = `cli-${Date.now()}`;
    const newClient: User = {
      id: shortId,
      name: clientName,
      email: `${shortId}@logoalibarber.com`,
      role: 'CUSTOMER',
      phone: clientPhone,
      birthday: clientBirthday || undefined,
      isActive: true,
      avatar: '🧔',
      login: clientPhone.replace(/\D/g, '').slice(-6) || 'cliente',
      password: '123',
      permissions: ['CUSTOMER_PORTAL']
    };

    onUpdateState('users', [...users, newClient]);
    setSelectedCliId(shortId);
    setManualComandaCliId(shortId);
    setEncaixeCliId(shortId);
    setSelectedFichaCliId(shortId);

    setClientName('');
    setClientPhone('');
    setClientBirthday('');
    setShowClientModal(false);
    alert('Cliente cadastrado com sucesso!');
  };

  // SCHEDULE NEW SERVICES DIRECTLY BY THE BARBER
  const handleCreateAppointmentSymbolic = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = users.find(u => u.id === selectedCliId);
    const srv = services.find(u => u.id === selectedServiceId);

    if (!cli || !srv) {
      alert('Selecione um cliente e um serviço válidos.');
      return;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      customerPhone: cli.phone,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      date: bookingDate,
      time: bookingTime,
      status: 'SCHEDULED'
    };

    onUpdateState('appointments', [...appointments, newAppointment]);
    setShowBookingForm(false);
    alert(`Agendamento realizado com sucesso para ${cli.name}!`);
  };

  // CREATE ENCAIXE (QUICK SERVICE)
  const handleCreateEncaixe = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = users.find(u => u.id === encaixeCliId);
    if (!cli) {
      alert('Por favor, selecione um cliente para o encaixe.');
      return;
    }

    if (encaixeServiceIds.length === 0) {
      alert('Por favor, selecione ao menos um serviço para o encaixe.');
      return;
    }

    if (!encaixeStartTime || !encaixeEndTime) {
      alert('Por favor, informe o horário de início e término.');
      return;
    }

    const selectedSrvObjects = services.filter(s => encaixeServiceIds.includes(s.id));
    const srvNames = selectedSrvObjects.map(s => s.name).join(', ');
    const totalVal = selectedSrvObjects.reduce((acc, s) => acc + s.price, 0);
    const today = new Date().toISOString().split('T')[0];

    // Create an Encaixe appointment with specific start and end time
    const newEncaixeApt: Appointment = {
      id: `encaixe-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      customerPhone: cli.phone,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      serviceId: encaixeServiceIds.join(','),
      serviceName: `⚡ Encaixe: ${srvNames}`,
      servicePrice: totalVal,
      date: today,
      time: encaixeStartTime,
      endTime: encaixeEndTime,
      status: 'IN_PROGRESS',
      isEncaixe: true,
      notes: encaixeObs
    };

    // Also immediately create a comanda with selected service items
    const newComanda: Comanda = {
      id: `cmd-${Date.now()}`,
      appointmentId: newEncaixeApt.id,
      customerId: cli.id,
      customerName: cli.name,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      items: selectedSrvObjects.map(s => ({
        id: `item-${Date.now()}-${s.id}`,
        serviceId: s.id,
        name: s.name,
        unitPrice: s.price,
        quantity: 1
      })),
      subtotal: totalVal,
      discount: 0,
      total: totalVal,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      isEncaixe: true,
      notes: encaixeObs
    };

    onUpdateState('appointments', [...appointments, newEncaixeApt]);
    onUpdateState('comandas', [...comandas, newComanda]);

    setShowEncaixeModal(false);
    setEncaixeObs('');
    alert(`Encaixe registrado com sucesso para ${cli.name} das ${encaixeStartTime} às ${encaixeEndTime}! Comanda de R$ ${totalVal.toFixed(2)} aberta.`);
  };

  // OPEN MANUAL COMANDA BY THE BARBER
  const handleOpenManualComanda = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = users.find(u => u.id === manualComandaCliId);
    if (!cli) return;

    const newComanda: Comanda = {
      id: `cmd-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    onUpdateState('comandas', [...comandas, newComanda]);
    setSelectedComandaId(newComanda.id);
    setShowManualComandaForm(false);
  };

  // START COMANDA FROM APPOINTMENT
  const handleStartComandaForAppointment = (apt: Appointment) => {
    const existing = comandas.find(c => c.appointmentId === apt.id);
    if (existing) {
      setSelectedComandaId(existing.id);
      setActiveSubTab('comandas');
      return;
    }

    const newComanda: Comanda = {
      id: `cmd-${Date.now()}`,
      appointmentId: apt.id,
      customerId: apt.customerId,
      customerName: apt.customerName,
      barberId: currentBarber.id,
      barberName: apt.barberName || currentBarber.name,
      items: [
        {
          id: `item-${Date.now()}`,
          serviceId: apt.serviceId,
          name: apt.serviceName,
          unitPrice: apt.servicePrice,
          quantity: 1
        }
      ],
      subtotal: apt.servicePrice,
      discount: 0,
      total: apt.servicePrice,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      isSubscriptionUse: apt.isSubscriptionUse,
      subscriptionId: apt.subscriptionId,
      paymentMethod: apt.isSubscriptionUse ? 'ASSINATURA' : undefined
    };

    const updatedApts = appointments.map(a =>
      a.id === apt.id ? { ...a, status: 'IN_PROGRESS' as const } : a
    );

    onUpdateState('appointments', updatedApts);
    onUpdateState('comandas', [...comandas, newComanda]);
    setSelectedComandaId(newComanda.id);
    setActiveSubTab('comandas');
  };

  // ADD ITEM TO COMANDA
  const handleAddItemToComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComandaId) return;

    const qty = parseInt(addQuantity) || 1;
    let newItem: ComandaItem;

    if (comandaItemType === 'service') {
      const srv = services.find(s => s.id === addSelectedSrvId);
      if (!srv) return;

      if (isVipChecked) {
        if (remainingVipQuota <= 0) {
          alert(`Sua cota de serviços VIP deste mês (${vipMonthlyQuota}) foi esgotada!`);
          return;
        }
        const customPrice = parseFloat(vipCustomPrice) || 0;
        newItem = {
          id: `item-${Date.now()}`,
          serviceId: srv.id,
          name: `${srv.name} (VIP)`,
          unitPrice: customPrice,
          quantity: qty,
          isVipService: true
        };
      } else {
        newItem = {
          id: `item-${Date.now()}`,
          serviceId: srv.id,
          name: srv.name,
          unitPrice: srv.price,
          quantity: qty
        };
      }
    } else {
      const prd = products.find(p => p.id === addSelectedPrdId);
      if (!prd) return;
      newItem = {
        id: `item-${Date.now()}`,
        productId: prd.id,
        name: prd.name,
        unitPrice: prd.price,
        quantity: qty,
        isProduct: true
      };
    }

    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComandaId) {
        const newItems = [...c.items, newItem];
        const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        return {
          ...c,
          items: newItems,
          subtotal: subtotal,
          total: Math.max(0, subtotal - c.discount)
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
    setAddQuantity('1');
    setIsVipChecked(false);
    setVipCustomPrice('0');
  };

  const handleRemoveItemFromComanda = (itemId: string) => {
    if (!selectedComandaId) return;

    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComandaId) {
        const newItems = c.items.filter(i => i.id !== itemId);
        const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        return {
          ...c,
          items: newItems,
          subtotal: subtotal,
          total: Math.max(0, subtotal - c.discount)
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
  };

  // CANCEL COMANDA WITH REASON
  const handleCancelComanda = (cmdId: string) => {
    const reason = prompt('Informe o motivo do cancelamento da comanda (obrigatório para auditoria):');
    if (!reason || !reason.trim()) {
      alert('O motivo do cancelamento é obrigatório.');
      return;
    }

    const matched = comandas.find(c => c.id === cmdId);
    if (matched && matched.appointmentId) {
      onUpdateState('appointments', appointments.map(a => {
        if (a.id === matched.appointmentId) {
          return {
            ...a,
            status: 'CANCELLED' as const,
            cancellationReason: reason.trim(),
            cancelledAt: new Date().toISOString(),
            cancelledBy: currentBarber.name
          };
        }
        return a;
      }));
    }

    const updatedComandas = comandas.map(c => {
      if (c.id === cmdId) {
        return {
          ...c,
          status: 'CANCELLED' as const,
          cancellationReason: reason.trim(),
          cancelledAt: new Date().toISOString(),
          cancelledBy: currentBarber.name
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
    setSelectedComandaId(null);
    alert('Comanda cancelada e registrada no relatório do administrador.');
  };

  // DISPATCH COMANDA TO CASHIER (SIGNAL SERVICE FINISHED)
  const handleDispatchToCashier = (cmdId: string) => {
    const matched = comandas.find(c => c.id === cmdId);
    if (!matched) return;

    const updatedComandas = comandas.map(c => {
      if (c.id === cmdId) {
        return {
          ...c,
          readyForPayment: true,
          dispatchedAt: new Date().toISOString()
        };
      }
      return c;
    });
    onUpdateState('comandas', updatedComandas);

    if (matched.appointmentId) {
      const updatedApts = appointments.map(a => {
        if (a.id === matched.appointmentId) {
          return {
            ...a,
            status: 'COMPLETED' as const,
            completedAt: new Date().toISOString()
          };
        }
        return a;
      });
      onUpdateState('appointments', updatedApts);
    }

    alert(`Comanda de ${matched.customerName} despachada com sucesso ao Caixa! O atendimento foi marcado como ENCERRADO.`);
    setSelectedComandaId(null);
  };

  // DELETE COMANDA PERMANENTLY (IF SERVICE CANCELLED)
  const handleDeleteComanda = (cmdId: string) => {
    const matched = comandas.find(c => c.id === cmdId);
    if (!matched) return;

    if (!confirm(`Tem certeza que deseja excluir permanentemente a comanda de ${matched.customerName}?`)) {
      return;
    }

    if (matched.appointmentId) {
      onUpdateState('appointments', appointments.map(a => {
        if (a.id === matched.appointmentId) {
          return {
            ...a,
            status: 'CANCELLED' as const,
            cancellationReason: 'Comanda excluída pelo barbeiro',
            cancelledAt: new Date().toISOString(),
            cancelledBy: currentBarber.name
          };
        }
        return a;
      }));
    }

    const updatedComandas = comandas.filter(c => c.id !== cmdId);
    onUpdateState('comandas', updatedComandas);
    setSelectedComandaId(null);
    alert(`Comanda de ${matched.customerName} excluída com sucesso.`);
  };

  // CANCEL APPOINTMENT WITH REASON
  const handleCancelAppointment = (apt: Appointment) => {
    const reason = prompt(`Informe o motivo do cancelamento do agendamento de ${apt.customerName} (obrigatório):`);
    if (!reason || !reason.trim()) {
      alert('O motivo do cancelamento é obrigatório.');
      return;
    }

    const updated = appointments.map(a => {
      if (a.id === apt.id) {
        return {
          ...a,
          status: 'CANCELLED' as const,
          cancellationReason: reason.trim(),
          cancelledAt: new Date().toISOString(),
          cancelledBy: currentBarber.name
        };
      }
      return a;
    });

    onUpdateState('appointments', updated);
    alert('Agendamento cancelado com sucesso.');
  };

  // SAVE BARBER NOTES ON CLIENT
  const handleSaveBarberNotes = (userId: string, notesText: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, barberNotes: notesText };
      }
      return u;
    });
    onUpdateState('users', updatedUsers);
    setSavedFichaMsg(true);
    setTimeout(() => setSavedFichaMsg(false), 3000);
  };

  // FILTERED RECORDS FOR THIS BARBER
  const activeComandasForBarber = comandas.filter(
    c => c.barberId === currentBarber.id && c.status === 'OPEN'
  );

  const appointmentsForBarber = appointments.filter(
    a =>
      a.barberId === currentBarber.id &&
      a.status === 'SCHEDULED' &&
      a.serviceId !== 'BLOCKED_SLOT' &&
      a.serviceId !== 'BLOCKED_FULL_DAY'
  );

  const activeComandaObj = comandas.find(c => c.id === selectedComandaId);
  const selectedFichaUser = users.find(u => u.id === selectedFichaCliId);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#101012] border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-zinc-900 p-2 rounded-xl border border-zinc-850">💈</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Cadeira do Profissional: <strong className="text-yellow-500">{currentBarber.name}</strong></h2>
              {parameters?.enableBarberGoals !== false && (() => {
                const detail = barberDetails?.find(d => d.userId === currentBarber.id);
                const progress = calculateBarberGoalProgress(currentBarber.id, comandas, parameters as SystemParameters, detail);
                return (
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('metas')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs font-mono font-bold text-yellow-400 transition cursor-pointer shadow"
                    title="Clique para abrir suas metas e conquistas"
                  >
                    <span>{progress.currentTier?.badge || '🎯'}</span>
                    <span>{progress.currentTier?.name || 'Iniciante'}</span>
                    <span className="text-zinc-400">({progress.overallProgressPercent}%)</span>
                  </button>
                );
              })()}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Gerencie comandas, lance encaixes rápidos, acompanhe suas metas e consulte clientes.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:text-yellow-500 text-xs font-semibold uppercase font-mono rounded-lg transition duration-150 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Novo Cliente</span>
          </button>

          <button
            onClick={() => setShowEncaixeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 text-xs font-bold uppercase font-mono rounded-lg transition duration-150 cursor-pointer shadow"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Novo Encaixe</span>
          </button>

          <button
            onClick={() => setShowManualComandaForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:text-yellow-500 text-xs font-semibold uppercase font-mono rounded-lg transition duration-150 cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Comanda Avulsa</span>
          </button>

          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold uppercase font-mono rounded-lg transition duration-150 cursor-pointer shadow"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar Horário</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-850 pb-2">
        <button
          onClick={() => setActiveSubTab('comandas')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'comandas' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          📝 Comandas Abertas ({activeComandasForBarber.length})
        </button>
        <button
          onClick={() => setActiveSubTab('agenda')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'agenda' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          📅 Minha Agenda ({appointmentsForBarber.length} Pendentes)
        </button>
        <button
          onClick={() => setActiveSubTab('fichas')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'fichas' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          📋 Ficha & Observações do Cliente
        </button>
        <button
          onClick={() => setActiveSubTab('comissoes')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'comissoes' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          💰 Minhas Comissões & Relatório
        </button>
        <button
          onClick={() => setActiveSubTab('leads')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'leads' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          🎯 Buscar Leads & Captação
        </button>
        {parameters?.enableBarberGoals !== false && (
          <button
            onClick={() => setActiveSubTab('metas')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
              activeSubTab === 'metas' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
            }`}
          >
            🏆 Minhas Metas & Gamificação
          </button>
        )}
      </div>

      {/* MODAL: REGISTRAR ENCAIXE */}
      {showEncaixeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-amber-500 rounded-2xl p-6 w-full max-w-lg text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Lançar Atendimento Encaixe
              </h3>
              <button onClick={() => setShowEncaixeModal(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEncaixe} className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">
                  🔍 Cliente *
                </label>
                <input
                  type="text"
                  placeholder="Filtrar cliente pelo nome..."
                  value={clientSearchTerm}
                  onChange={e => setClientSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white mb-2"
                />
                <select
                  value={encaixeCliId}
                  onChange={e => setEncaixeCliId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                >
                  {filteredCustomersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - ({c.phone || 'Sem WhatsApp'})</option>
                  ))}
                </select>
              </div>

              {/* Seleção de Serviços Prestados da Barbearia */}
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">
                  ✂️ Selecionar Serviços Prestados do Catálogo *
                </label>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                  {services.map(srv => {
                    const isSelected = encaixeServiceIds.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleEncaixeService(srv.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition select-none ${
                          isSelected
                            ? 'bg-amber-500/20 border border-amber-500/60 text-white font-bold'
                            : 'bg-zinc-900 border border-zinc-850 text-zinc-400 hover:bg-zinc-850'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="accent-amber-500 cursor-pointer"
                          />
                          <span>{srv.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-zinc-500">⏱️ {srv.durationMinutes}m</span>
                          <span className="text-amber-400 font-bold">{formatCurrency(srv.price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Horário Personalizado (Início e Término) */}
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">
                  ⏱️ Horário Personalizado (Início e Término) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono mb-0.5">Início</span>
                    <input
                      type="time"
                      required
                      value={encaixeStartTime}
                      onChange={e => setEncaixeStartTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono mb-0.5">Término</span>
                    <input
                      type="time"
                      required
                      value={encaixeEndTime}
                      onChange={e => setEncaixeEndTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Total do Atendimento de Encaixe */}
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Total dos Serviços:</span>
                <span className="text-sm font-black text-amber-400">
                  {formatCurrency(encaixeTotalPrice)}
                </span>
              </div>

              {/* Observações */}
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">
                  Observações do Atendimento
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cliente com pressa, atendimento expresso feito com sucesso..."
                  value={encaixeObs}
                  onChange={e => setEncaixeObs(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEncaixeModal(false)}
                  className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-bold uppercase font-mono shadow"
                >
                  Confirmar Encaixe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm text-left">
            <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 mb-3 block">Novo Cadastro de Cliente</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Data de Aniversário (Opcional)</label>
                <input
                  type="date"
                  value={clientBirthday}
                  onChange={e => setClientBirthday(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-3 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE APPOINTMENT */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-md text-left space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 block">Agendar Horário na Cadeira</h3>
            <form onSubmit={handleCreateAppointmentSymbolic} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">
                  🔍 Buscar e Selecionar Cliente
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por nome do cliente..."
                  value={clientSearchTerm}
                  onChange={e => setClientSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white mb-2"
                />
                <select
                  value={selectedCliId}
                  onChange={e => setSelectedCliId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                >
                  {filteredCustomersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Sem fone'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Serviço Pretendido</label>
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ({formatCurrency(s.price)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-3 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL COMANDA */}
      {showManualComandaForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm text-left space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 block">Abrir Comanda Avulsa</h3>
            <form onSubmit={handleOpenManualComanda} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">🔍 Buscar e Selecionar Cliente</label>
                <input
                  type="text"
                  placeholder="Filtrar cliente por nome..."
                  value={clientSearchTerm}
                  onChange={e => setClientSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white mb-2"
                />
                <select
                  value={manualComandaCliId}
                  onChange={e => setManualComandaCliId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                >
                  {filteredCustomersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualComandaForm(false)}
                  className="px-3 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase"
                >
                  Abrir Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: COMANDAS ABERTAS DA CADEIRA */}
      {activeSubTab === 'comandas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest block mb-2">
              Comandas Abertas em Atendimento ({activeComandasForBarber.length})
            </h3>

            {activeComandasForBarber.length === 0 ? (
              <div className="bg-[#101012] border border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-xs">
                Nenhuma comanda aberta na sua cadeira no momento.
              </div>
            ) : (
              activeComandasForBarber.map(cmd => {
                const customerUser = users.find(u => u.id === cmd.customerId);
                const bdayStatus = getBirthdayStatus(customerUser?.birthday);
                const linkedApt = appointments.find(a => a.id === cmd.appointmentId);
                const timeDisplay = linkedApt 
                  ? `${linkedApt.time}${linkedApt.endTime ? ' - ' + linkedApt.endTime : ''}` 
                  : (cmd.createdAt ? new Date(cmd.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Em Atendimento');

                return (
                  <div
                    key={cmd.id}
                    onClick={() => setSelectedComandaId(cmd.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition text-left space-y-2 ${
                      selectedComandaId === cmd.id
                        ? 'bg-[#151518] border-yellow-500 shadow-md'
                        : 'bg-[#101012] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Birthday Alert Banner */}
                    {bdayStatus === 'HOJE' && (
                      <div className="bg-amber-500/20 border border-amber-500/40 p-2 rounded-lg text-[10px] font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
                        <Cake className="w-3.5 h-3.5" />
                        <span>🎉 HOJE É ANIVERSÁRIO DELE! PARABENIZE-O! 🎂</span>
                      </div>
                    )}

                    {/* Dispatched to Cashier Status Badge */}
                    {cmd.readyForPayment ? (
                      <div className="bg-emerald-500/20 border border-emerald-500/50 p-2 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>🚀 DESPACHADA AO CAIXA</span>
                        </div>
                        <span className="font-mono text-[9px] text-emerald-300">
                          {cmd.dispatchedAt ? new Date(cmd.dispatchedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pronta'}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg text-[10px] font-semibold text-amber-400/90 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Em Atendimento na Cadeira</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white uppercase">{cmd.customerName}</span>
                      <span className="text-[10px] font-mono text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded">
                        {formatCurrency(cmd.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Horário: <strong>{timeDisplay}</strong></span>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-mono">
                      {cmd.items.length} item(ns) | Barbeiro: {cmd.barberName}
                    </p>

                    {cmd.isEncaixe && (
                      <span className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold uppercase rounded">
                        ⚡ Encaixe
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Active Comanda Details & Items Editor */}
          <div className="lg:col-span-2">
            {!activeComandaObj ? (
              <div className="bg-[#101012] border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 text-xs">
                Selecione uma comanda da lista ao lado para adicionar serviços, produtos ou despachar ao caixa.
              </div>
            ) : (
              <div className="bg-[#101012] border border-zinc-800 p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-yellow-500 block uppercase font-bold mb-1">Mesa do Profissional / Comanda</span>
                    <h3 className="text-base font-bold text-white uppercase">{activeComandaObj.customerName}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Barbeiro: <strong>{activeComandaObj.barberName}</strong> | Código: {activeComandaObj.id}</p>
                    {(() => {
                      const linked = appointments.find(a => a.id === activeComandaObj.appointmentId);
                      const tDisp = linked ? `${linked.time}${linked.endTime ? ' - ' + linked.endTime : ''}` : (activeComandaObj.createdAt ? new Date(activeComandaObj.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A');
                      return (
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-lg mt-2">
                          <Clock className="w-3.5 h-3.5 text-yellow-500" />
                          <span>Horário Agendado: {tDisp}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => handleDeleteComanda(activeComandaObj.id)}
                    className="p-1.5 px-3 text-[10px] font-bold text-red-400 border border-red-900/40 bg-red-950/20 hover:bg-red-950/50 rounded uppercase font-mono cursor-pointer transition"
                  >
                    Excluir Comanda
                  </button>
                </div>

                {/* Dispatched to Cashier High-Visibility Alert Banner */}
                {activeComandaObj.readyForPayment ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 border border-emerald-500/30">
                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-emerald-400 uppercase font-mono tracking-wider">
                            🚀 COMANDA DESPACHADA PARA O CAIXA
                          </h4>
                          <span className="px-2 py-0.5 bg-emerald-500 text-black font-extrabold text-[9px] font-mono uppercase rounded">
                            Aguardando Caixa
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                          Esta comanda foi enviada com sucesso para o caixa às <strong className="text-emerald-300 font-mono">{activeComandaObj.dispatchedAt ? new Date(activeComandaObj.dispatchedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'recente'}</strong>. O cliente já pode realizar o pagamento.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl flex items-center gap-2 text-xs text-zinc-400 font-mono">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Comanda em atendimento na cadeira. Quando terminar o serviço, clique em <strong>"Despachar p/ Caixa"</strong> abaixo.</span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">Itens Consumidos:</h4>
                  {activeComandaObj.items.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2">Nenhum item adicionado ainda nesta comanda.</p>
                  ) : (
                    <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-lg overflow-hidden font-mono text-xs">
                      {activeComandaObj.items.map(item => (
                        <div key={item.id} className="p-3 bg-zinc-950 flex justify-between items-center text-white">
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-[10px] text-zinc-400">
                              {item.quantity}x {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-yellow-500">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => handleRemoveItemFromComanda(item.id)}
                              className="text-zinc-500 hover:text-red-400 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Item Form */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase">+ Adicionar Item à Comanda</h4>
                    {parameters?.enableVipServices !== false && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                        Cota VIP do Mês: {remainingVipQuota}/{vipMonthlyQuota}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() => setComandaItemType('service')}
                      className={`px-3 py-1 rounded uppercase font-bold cursor-pointer ${comandaItemType === 'service' ? 'bg-yellow-500 text-black' : 'bg-zinc-900 text-zinc-400'}`}
                    >
                      Serviço
                    </button>
                    <button
                      type="button"
                      onClick={() => setComandaItemType('product')}
                      className={`px-3 py-1 rounded uppercase font-bold cursor-pointer ${comandaItemType === 'product' ? 'bg-yellow-500 text-black' : 'bg-zinc-900 text-zinc-400'}`}
                    >
                      Produto Barbearia
                    </button>
                  </div>

                  {comandaItemType === 'service' && parameters?.enableVipServices !== false && (
                    <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-amber-400 font-bold font-mono text-[11px]">
                        <input
                          type="checkbox"
                          checked={isVipChecked}
                          onChange={(e) => setIsVipChecked(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-700 text-yellow-500 focus:ring-0 cursor-pointer accent-yellow-500"
                        />
                        <span>Marcar como Serviço VIP (100% para o barbeiro)</span>
                      </label>
                      {isVipChecked && (
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-zinc-400 font-mono">Valor Cobrado (R$):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={vipCustomPrice}
                            onChange={(e) => setVipCustomPrice(e.target.value)}
                            className="w-24 bg-zinc-950 border border-yellow-500/50 rounded px-2 py-1 text-xs text-white font-mono text-right"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleAddItemToComanda} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
                    <div className="md:col-span-7">
                      <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Item Selecionado</label>
                      {comandaItemType === 'service' ? (
                        <select
                          value={addSelectedSrvId}
                          onChange={e => setAddSelectedSrvId(e.target.value)}
                          className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1.5 text-xs text-white"
                        >
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={addSelectedPrdId}
                          onChange={e => setAddSelectedPrdId(e.target.value)}
                          className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1.5 text-xs text-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={addQuantity}
                        onChange={e => setAddQuantity(e.target.value)}
                        className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1.5 text-xs text-white text-center font-mono"
                      />
                    </div>

                    <div className="md:col-span-5 flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2 rounded cursor-pointer transition uppercase font-mono"
                      >
                        + Inserir na Comanda
                      </button>
                    </div>
                  </form>
                </div>

                {/* Subtotal & Action buttons */}
                <div className="pt-4 border-t border-zinc-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="font-mono bg-[#09090b] px-4 py-2 border border-zinc-850 rounded-xl">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase leading-none mb-1">Total da Comanda</span>
                    <span className="text-lg font-bold text-yellow-500">{formatCurrency(activeComandaObj.total)}</span>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setSelectedComandaId(null)}
                      className="px-4 py-2 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                    >
                      Recolher
                    </button>
                    <button
                      onClick={() => handleDispatchToCashier(activeComandaObj.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 font-extrabold rounded-lg text-xs uppercase cursor-pointer shadow-md transition ${
                        activeComandaObj.readyForPayment
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      {activeComandaObj.readyForPayment ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✓ Despachada (Atualizar Caixa)</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Despachar p/ Caixa</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: COMANDAS DESPACHADAS E FINALIZADAS HOJE */}
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const dispatchedToday = comandas.filter(c =>
            c.barberId === currentBarber.id &&
            (c.readyForPayment || c.status === 'PAID') &&
            (c.dispatchedAt?.startsWith(todayStr) || c.completedAt?.startsWith(todayStr) || c.createdAt?.startsWith(todayStr))
          );

          if (dispatchedToday.length === 0) return null;

          return (
            <div className="mt-8 border-t border-zinc-850 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Comandas Despachadas ao Caixa Hoje ({dispatchedToday.length})
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Histórico do dia ({currentBarber.name})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dispatchedToday.map(c => (
                  <div key={c.id} className="p-3.5 bg-[#0d0d0f] border border-emerald-900/40 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white uppercase block">{c.customerName}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-0.5">
                        {c.status === 'PAID' ? '✅ PAGO NO CAIXA' : '🚀 DESPACHADO (AGUARDANDO PAGO)'}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {c.items?.length || 0} item(ns)
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-yellow-500 text-sm block">{formatCurrency(c.total)}</span>
                      <span className="text-[9px] text-zinc-400">
                        {c.dispatchedAt ? new Date(c.dispatchedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Hoje'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        </div>
      )}

      {/* SUB-TAB 2: MINHA AGENDA HOJE */}
      {activeSubTab === 'agenda' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest block mb-2">
              Seus Atendimentos Agendados Ativos
            </h3>

            {appointmentsForBarber.length === 0 ? (
              <div className="bg-[#101012] border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
                ☕ Nenhuma reserva de corte pendente para você na fila de agendamento hoje.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointmentsForBarber.map(apt => {
                  const cust = users.find(u => u.id === apt.customerId);
                  const bdayStatus = getBirthdayStatus(cust?.birthday);
                  const linkedComanda = comandas.find(c => c.appointmentId === apt.id);

                  return (
                    <div key={apt.id} className="bg-[#101012] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                      <div>
                        {bdayStatus === 'HOJE' && (
                          <div className="mb-2 bg-amber-500/20 border border-amber-500/40 p-1.5 rounded-md text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
                            <Cake className="w-3.5 h-3.5" />
                            <span>🎉 Aniversariante do Dia! Parabenize-o!</span>
                          </div>
                        )}

                        {linkedComanda?.readyForPayment && (
                          <div className="mb-2 bg-emerald-500/20 border border-emerald-500/50 p-1.5 rounded-md text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                            <Send className="w-3.5 h-3.5" />
                            <span>🚀 COMANDA DESPACHADA PARA O CAIXA</span>
                          </div>
                        )}

                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                            ID: {apt.id.slice(-5)}
                          </span>
                          <span className="font-mono text-yellow-500 font-bold text-xs bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 rounded flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {apt.time}
                          </span>
                        </div>

                        <div className="mt-3 text-left">
                          <h4 className="font-bold text-white text-sm">{apt.customerName}</h4>
                          <p className="text-xs text-yellow-500 font-semibold mt-0.5">Serviço: {apt.serviceName}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{apt.customerPhone ? `WhatsApp: ${apt.customerPhone}` : 'Sem telefone'}</p>
                          <p className="text-[11px] font-mono text-zinc-500">Data: {apt.date}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleStartComandaForAppointment(apt)}
                          className={`w-full font-bold text-xs py-2.5 rounded-lg transition duration-150 uppercase cursor-pointer ${
                            linkedComanda?.readyForPayment
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-yellow-500 text-black hover:bg-yellow-600'
                          }`}
                        >
                          {linkedComanda?.readyForPayment ? '✓ Ver Comanda (Despachada ao Caixa)' : 'Iniciar Atendimento'}
                        </button>

                        {apt.customerPhone && (
                          <a
                            href={buildWhatsAppReminderUrl(apt, parameters)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold text-[10px] py-1.5 rounded-lg transition uppercase font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Lembrete WhatsApp</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleCancelAppointment(apt)}
                          className="w-full bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/50 font-bold text-[10px] py-1.5 rounded-lg transition uppercase font-mono"
                        >
                          Cancelar Agendamento
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agenda Closure Block */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-yellow-500 uppercase tracking-widest block border-b border-zinc-850 pb-2">
                🚫 Bloquear Agenda
              </h3>
              <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">Modo de Bloqueio</label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setBlockType('slot')}
                      className={`py-1.5 rounded text-[10px] font-mono uppercase font-bold ${blockType === 'slot' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
                    >
                      Horário
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockType('day')}
                      className={`py-1.5 rounded text-[10px] font-mono uppercase font-bold ${blockType === 'day' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
                    >
                      Dia Inteiro
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">Dia</label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={e => setBlockDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                {blockType === 'slot' && (
                  <div>
                    <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">Horário de Pausa</label>
                    <input
                      type="time"
                      required
                      value={blockTime}
                      onChange={e => setBlockTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-950/70 font-bold text-xs py-2 rounded-lg transition uppercase font-mono"
                >
                  Confirmar Bloqueio
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FICHA & OBSERVAÇÕES DO CLIENTE */}
      {activeSubTab === 'fichas' && (
        <div className="bg-[#101012] border border-zinc-800 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Ficha de Observações Privadas do Cliente
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Anotações confidenciais sobre gostos, estilo de corte e particularidades do cliente (visível apenas para barbeiros e administradores).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Selector */}
            <div className="space-y-3">
              <label className="text-[10px] text-zinc-400 font-mono block uppercase">
                🔍 Buscar e Selecionar Cliente
              </label>
              <input
                type="text"
                placeholder="Filtrar cliente por nome..."
                value={clientSearchTerm}
                onChange={e => setClientSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
              />

              <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                {filteredCustomersList.map(cust => (
                  <button
                    key={cust.id}
                    onClick={() => setSelectedFichaCliId(cust.id)}
                    className={`w-full text-left p-3 rounded-lg border transition text-xs flex justify-between items-center ${
                      selectedFichaCliId === cust.id
                        ? 'bg-yellow-500/10 border-yellow-500 text-white font-bold'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="leading-tight">{cust.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{cust.phone || 'Sem WhatsApp'}</p>
                    </div>
                    {cust.birthday && (
                      <span title={`Aniversário: ${cust.birthday}`}>
                        <Cake className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details & Notes Editor */}
            <div className="md:col-span-2 space-y-4">
              {!selectedFichaUser ? (
                <div className="bg-zinc-950 border border-zinc-850 p-8 rounded-xl text-center text-zinc-500 text-xs">
                  Selecione um cliente na lista à esquerda para consultar ou atualizar suas observações privadas.
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedFichaUser.name}</h4>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        WhatsApp: {selectedFichaUser.phone || 'Não informado'} | Login: {selectedFichaUser.login}
                      </p>
                      {selectedFichaUser.birthday && (
                        <p className="text-xs text-amber-400 font-mono mt-1 font-bold flex items-center gap-1">
                          <Cake className="w-3.5 h-3.5" />
                          <span>Data de Aniversário: {selectedFichaUser.birthday.split('-').reverse().join('/')}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-yellow-500 font-mono uppercase font-bold block mb-1">
                      📝 Observações do Barbeiro (Anotações do Corte, Preferências, Produtos):
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Ex: Prefere degradê navalhado na lateral, tesoura em cima, não gosta de pomada brilhosa, toma cerveja Heineken..."
                      value={selectedFichaUser.barberNotes || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const updated = users.map(u => u.id === selectedFichaUser.id ? { ...u, barberNotes: val } : u);
                        onUpdateState('users', updated);
                      }}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    {savedFichaMsg ? (
                      <span className="text-xs text-emerald-400 font-bold font-mono">✓ Observações salvas com sucesso!</span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">As alterações são salvas automaticamente.</span>
                    )}

                    <button
                      onClick={() => handleSaveBarberNotes(selectedFichaUser.id, selectedFichaUser.barberNotes || '')}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold font-mono uppercase rounded-lg transition"
                    >
                      Salvar Observações
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RELATÓRIO DE COMISSÕES */}
      {activeSubTab === 'comissoes' && (() => {
        const getFilteredComandasForBarber = () => {
          let start: Date;
          let end: Date = new Date();
          end.setHours(23, 59, 59, 999);

          if (bPeriod === 'diario') {
            start = new Date();
            start.setHours(0, 0, 0, 0);
          } else if (bPeriod === 'semanal') {
            start = new Date();
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
          } else if (bPeriod === 'mensal') {
            start = new Date();
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
          } else {
            start = bStartDate ? new Date(bStartDate + 'T00:00:00') : new Date(0);
            const parsedEnd = bEndDate ? new Date(bEndDate + 'T23:59:59') : new Date();
            end = parsedEnd;
          }

          return comandas.filter(c => {
            if (c.barberId !== currentBarber.id || c.status !== 'PAID') return false;
            const dateStr = c.completedAt || c.dispatchedAt || c.createdAt;
            if (!dateStr) return false;
            const cDate = new Date(dateStr);
            return cDate >= start && cDate <= end;
          });
        };

        const filteredCmds = getFilteredComandasForBarber();
        const totalBruto = filteredCmds.reduce((acc, c) => acc + (c.total || 0), 0);
        const totalComissao = filteredCmds.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);

        return (
          <div className="space-y-6">
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xs font-mono font-bold text-yellow-500 uppercase">Filtro do Período de Comissões</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {(['diario', 'semanal', 'mensal', 'personalizado'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setBPeriod(p)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition cursor-pointer ${bPeriod === p ? 'bg-yellow-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                      {p === 'diario' ? 'Hoje' : p === 'semanal' ? '7 dias' : p === 'mensal' ? '30 dias' : 'Personalizado'}
                    </button>
                  ))}
                </div>
              </div>

              {bPeriod === 'personalizado' && (
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-850 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase">Data Inicial:</label>
                    <input
                      type="date"
                      value={bStartDate}
                      onChange={(e) => setBStartDate(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase">Data Final:</label>
                    <input
                      type="date"
                      value={bEndDate}
                      onChange={(e) => setBEndDate(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-yellow-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total de Atendimentos Concluídos</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">{filteredCmds.length} comandas</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Faturamento Bruto Gerado</span>
                <span className="text-xl font-bold font-mono text-yellow-500 mt-1 block">{formatCurrency(totalBruto)}</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Sua Comissão Devida</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{formatCurrency(totalComissao)}</span>
              </div>
            </div>

            <div className="bg-[#101012] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                      <th className="p-3">Comanda</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Data/Hora</th>
                      <th className="p-3">Forma PGTO</th>
                      <th className="p-3 text-right">Valor Total</th>
                      <th className="p-3 text-right">Sua Comissão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {filteredCmds.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-900/10 text-zinc-300">
                        <td className="p-3 text-zinc-500">{c.id.slice(-5)}</td>
                        <td className="p-3 font-bold text-white">{c.customerName}</td>
                        <td className="p-3 text-zinc-400">{c.completedAt?.replace('T', ' ').slice(0, 16) || 'Hoje'}</td>
                        <td className="p-3 text-yellow-500">{c.paymentMethod || 'Dinheiro'}</td>
                        <td className="p-3 text-right text-white">{formatCurrency(c.total)}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{formatCurrency(c.commissionAmount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUB-TAB 5: BUSCAR LEADS & CAPTAÇÃO DE CLIENTES */}
      {activeSubTab === 'leads' && (() => {
        const allCustomerUsers = users.filter(u => u.role === 'CUSTOMER');
        
        const leadsData = allCustomerUsers.map(customer => {
          const cAppointments = appointments.filter(a => a.customerId === customer.id && a.status !== 'CANCELLED');
          const sortedApts = cAppointments.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const lastApt = sortedApts[0];

          let daysSinceLastVisit: number | null = null;
          if (lastApt && lastApt.date) {
            const lastDate = new Date(lastApt.date);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            daysSinceLastVisit = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }

          const bdayStat = getBirthdayStatus(customer.birthday);
          const isBdayToday = bdayStat === 'HOJE';
          const isBdayUpcoming = bdayStat === 'PROXIMO';

          return {
            customer,
            lastApt,
            daysSinceLastVisit,
            isBdayToday,
            isBdayUpcoming,
            totalVisits: cAppointments.length
          };
        });

        const filteredLeadsList = leadsData.filter(lead => {
          const nameOrPhone = lead.customer.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
            (lead.customer.phone && lead.customer.phone.includes(leadSearchTerm));

          if (!nameOrPhone) return false;

          if (leadFilter === 'ANIVERSARIANTE') return lead.isBdayToday || lead.isBdayUpcoming;
          if (leadFilter === 'INATIVO_15') return lead.daysSinceLastVisit !== null && lead.daysSinceLastVisit >= 15;
          if (leadFilter === 'INATIVO_30') return lead.daysSinceLastVisit !== null && lead.daysSinceLastVisit >= 30;
          if (leadFilter === 'INATIVO_60') return lead.daysSinceLastVisit !== null && lead.daysSinceLastVisit >= 60;
          return true;
        });

        return (
          <div className="space-y-6 text-left">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  🎯 Central de Prospecção & Retenção de Clientes
                </span>
                <h3 className="text-lg font-bold text-white uppercase">Buscar Leads & Reativação no WhatsApp</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Encontre aniversariantes e clientes inativos para enviar mensagens e reativar agendamentos.
                </p>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar lead por nome ou telefone..."
                    value={leadSearchTerm}
                    onChange={e => setLeadSearchTerm(e.target.value)}
                    className="w-full bg-[#18181c] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => setLeadFilter('TODOS')}
                    className={`px-3 py-2 rounded-lg font-bold uppercase cursor-pointer transition ${
                      leadFilter === 'TODOS' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    🌟 Todos ({leadsData.length})
                  </button>
                  <button
                    onClick={() => setLeadFilter('ANIVERSARIANTE')}
                    className={`px-3 py-2 rounded-lg font-bold uppercase cursor-pointer transition flex items-center gap-1.5 ${
                      leadFilter === 'ANIVERSARIANTE' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Cake className="w-3.5 h-3.5 text-amber-400" />
                    Aniversariantes ({leadsData.filter(l => l.isBdayToday || l.isBdayUpcoming).length})
                  </button>
                  <button
                    onClick={() => setLeadFilter('INATIVO_15')}
                    className={`px-3 py-2 rounded-lg font-bold uppercase cursor-pointer transition ${
                      leadFilter === 'INATIVO_15' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    💤 Inativos (+15d)
                  </button>
                  <button
                    onClick={() => setLeadFilter('INATIVO_30')}
                    className={`px-3 py-2 rounded-lg font-bold uppercase cursor-pointer transition ${
                      leadFilter === 'INATIVO_30' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    😴 Ausentes (+30d)
                  </button>
                  <button
                    onClick={() => setLeadFilter('INATIVO_60')}
                    className={`px-3 py-2 rounded-lg font-bold uppercase cursor-pointer transition ${
                      leadFilter === 'INATIVO_60' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    🚨 Risco (+60d)
                  </button>
                </div>
              </div>
            </div>

            {/* Leads Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeadsList.length === 0 ? (
                <div className="col-span-full bg-[#101012] border border-zinc-800 p-8 rounded-xl text-center text-zinc-500 text-xs font-mono">
                  Nenhum cliente encontrado para os filtros selecionados.
                </div>
              ) : (
                filteredLeadsList.map(lead => {
                  const phoneDigits = lead.customer.phone ? lead.customer.phone.replace(/\D/g, '') : '';
                  
                  let waMsg = `Olá ${lead.customer.name}! Tudo bem? Sou o barbeiro ${currentBarber.name}.`;
                  if (lead.isBdayToday) {
                    waMsg = `Olá ${lead.customer.name}! Parabéns pelo seu aniversário hoje! 🎉 Sou o barbeiro ${currentBarber.name}. Que tal agendar um horário especial para comemorar em grande estilo?`;
                  } else if (lead.isBdayUpcoming) {
                    waMsg = `Olá ${lead.customer.name}! Vi que seu aniversário está chegando! Sou o barbeiro ${currentBarber.name}. Gostaria de garantir seu horário para estar com o visual em dia?`;
                  } else if (lead.daysSinceLastVisit && lead.daysSinceLastVisit >= 30) {
                    waMsg = `Olá ${lead.customer.name}! Tudo bem? Faz ${lead.daysSinceLastVisit} dias que não te vemos na barbearia! Sentimos sua falta. Que tal agendar seu horário essa semana?`;
                  } else {
                    waMsg = `Olá ${lead.customer.name}! Tudo bem? Sou o barbeiro ${currentBarber.name}. Passando para saber se gostaria de renovar seu corte de cabelo esta semana!`;
                  }

                  const waUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <div key={lead.customer.id} className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4 hover:border-zinc-700 transition flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl bg-zinc-900 p-2 rounded-xl border border-zinc-800">{lead.customer.avatar || '🧔'}</span>
                            <div>
                              <h4 className="font-bold text-sm text-white uppercase">{lead.customer.name}</h4>
                              <span className="text-[10px] text-zinc-400 font-mono block">
                                Total de Visitas: <strong className="text-amber-400">{lead.totalVisits}</strong>
                              </span>
                            </div>
                          </div>

                          {lead.isBdayToday ? (
                            <span className="px-2 py-0.5 bg-amber-500 text-black font-mono font-bold text-[9px] uppercase rounded animate-pulse">
                              🎂 Niver Hoje!
                            </span>
                          ) : lead.daysSinceLastVisit !== null && lead.daysSinceLastVisit >= 30 ? (
                            <span className="px-2 py-0.5 bg-red-950/80 text-red-400 border border-red-800/60 font-mono font-bold text-[9px] uppercase rounded">
                              🚨 Ausente {lead.daysSinceLastVisit}d
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-bold text-[9px] uppercase rounded">
                              ✨ Cliente
                            </span>
                          )}
                        </div>

                        {/* Telefone Destacado */}
                        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <span className="text-[9px] text-zinc-500 uppercase block font-bold">Telefone do Cliente</span>
                              <span className="font-black text-emerald-400 text-sm tracking-wider">{lead.customer.phone || 'Sem telefone'}</span>
                            </div>
                          </div>
                          {lead.customer.phone && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(lead.customer.phone);
                                alert(`Telefone ${lead.customer.phone} copiado!`);
                              }}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
                              title="Copiar Telefone"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Visita anterior info */}
                        <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-850 space-y-1">
                          <p>
                            <strong>Última Visita:</strong> {lead.lastApt ? `${lead.lastApt.date} (${lead.daysSinceLastVisit} dias atrás)` : 'Nenhum histórico recente'}
                          </p>
                          {lead.lastApt && (
                            <p className="text-zinc-500">
                              Serviço: {lead.lastApt.serviceName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 grid grid-cols-2 gap-2 font-mono text-xs">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] shadow-sm uppercase"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => {
                            setSelectedCliId(lead.customer.id);
                            setShowBookingForm(true);
                          }}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] uppercase cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Agendar</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* SUBTAB 6: GAMIFIED GOALS & BARBER ACHIEVEMENTS */}
      {activeSubTab === 'metas' && (() => {
        const detail = barberDetails?.find(d => d.userId === currentBarber.id);
        const progress = calculateBarberGoalProgress(currentBarber.id, comandas, parameters as SystemParameters, detail);
        const tiers = (parameters?.barberGoalTiers && parameters.barberGoalTiers.length > 0)
          ? parameters.barberGoalTiers
          : DEFAULT_GOAL_TIERS;
        const leaderboard = getBarberLeaderboard(users, comandas, parameters as SystemParameters, barberDetails);
        const currentRank = leaderboard.find(l => l.barber.id === currentBarber.id)?.rank || '-';

        return (
          <div className="space-y-6 text-left animate-fadeIn">
            {/* HERO BANNER - NÍVEL E PROGRESSO ATUAL */}
            <div className="bg-[#101012] border border-zinc-800 p-6 rounded-2xl relative overflow-hidden space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center text-3xl shadow-lg">
                    {progress.currentTier?.badge || '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold">Nível Atual do Mês</span>
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[9px] font-mono font-bold uppercase rounded-full">
                        Posição #{currentRank} no Ranking
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-wide">
                      {progress.currentTier ? progress.currentTier.name : 'Nível Desafiante (Iniciante)'}
                    </h3>
                  </div>
                </div>

                {/* Bônus acumulado no topo */}
                <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-1 text-right font-mono">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold block">Premiação Destravada Este Mês:</span>
                  <div className="text-base font-black text-emerald-400">
                    + R$ {progress.earnedBonusFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {progress.earnedExtraCommissionPercent > 0 && (
                    <div className="text-[10px] font-bold text-cyan-400">
                      +{progress.earnedExtraCommissionPercent}% de Comissão Extra
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar Geral */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" /> Progresso da Meta Geral
                  </span>
                  <strong className="text-yellow-400 text-sm">{progress.overallProgressPercent}%</strong>
                </div>
                <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow"
                    style={{ width: `${progress.overallProgressPercent}%` }}
                  />
                </div>
                {progress.nextTier ? (
                  <p className="text-[11px] text-zinc-400 font-mono">
                    💡 <strong>Próximo Nível:</strong> Complete mais metas para alcançar <span className="text-white font-bold">{progress.nextTier.badge} {progress.nextTier.name}</span> e destravar mais <span className="text-emerald-400 font-bold">+R$ {progress.nextTier.rewardBonusFixed}</span> em bônus!
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-400 font-mono font-bold">
                    🎉 PARABÉNS! Você atingiu o nível mais alto das metas da barbearia este mês!
                  </p>
                )}
              </div>
            </div>

            {/* 3 METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Faturamento Mensal */}
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-3 hover:border-yellow-500/40 transition">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-xs font-bold uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Faturamento Mensal
                  </span>
                  <strong className="text-xs font-mono text-emerald-400">{progress.revenueProgressPercent}%</strong>
                </div>

                <div className="space-y-1 font-mono">
                  <div className="text-lg font-black text-white">
                    R$ {progress.stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Meta Alvo: R$ {progress.revenueTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.revenueProgressPercent}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-zinc-400 pt-1">
                  {progress.stats.totalRevenue >= progress.revenueTarget ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Meta de faturamento alcançada!
                    </span>
                  ) : (
                    <span>Faltam R$ {(progress.revenueTarget - progress.stats.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para a meta</span>
                  )}
                </div>
              </div>

              {/* Card 2: Atendimentos & Serviços */}
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-3 hover:border-yellow-500/40 transition">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-xs font-bold uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-amber-400" /> Atendimentos / Serviços
                  </span>
                  <strong className="text-xs font-mono text-amber-400">{progress.servicesProgressPercent}%</strong>
                </div>

                <div className="space-y-1 font-mono">
                  <div className="text-lg font-black text-white">
                    {progress.stats.servicesCount} serviços realizados
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Meta Alvo: {progress.servicesTarget} serviços
                  </div>
                </div>

                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.servicesProgressPercent}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-zinc-400 pt-1">
                  {progress.stats.servicesCount >= progress.servicesTarget ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Meta de serviços concluída!
                    </span>
                  ) : (
                    <span>Faltam {progress.servicesTarget - progress.stats.servicesCount} atendimentos para a meta</span>
                  )}
                </div>
              </div>

              {/* Card 3: Venda de Produtos */}
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-3 hover:border-yellow-500/40 transition">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-xs font-bold uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" /> Vendas de Produtos
                  </span>
                  <strong className="text-xs font-mono text-cyan-400">{progress.productProgressPercent}%</strong>
                </div>

                <div className="space-y-1 font-mono">
                  <div className="text-lg font-black text-white">
                    R$ {progress.stats.productSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Meta Alvo: R$ {progress.productSalesTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.productProgressPercent}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-zinc-400 pt-1">
                  {progress.stats.productSales >= progress.productSalesTarget ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Meta de produtos batida!
                    </span>
                  ) : (
                    <span>Faltam R$ {(progress.productSalesTarget - progress.stats.productSales).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em produtos</span>
                  )}
                </div>
              </div>
            </div>

            {/* SEÇÃO GALERIA DE TIERS DA BARBEARIA */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Níveis de Conquista & Bônus
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((t) => {
                  const isCurrent = progress.currentTier?.id === t.id;
                  const isAchieved = progress.stats.totalRevenue >= t.targetRevenue;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition relative space-y-3 ${
                        isCurrent
                          ? 'bg-yellow-500/10 border-2 border-yellow-500 shadow-xl'
                          : isAchieved
                          ? 'bg-emerald-950/20 border border-emerald-800/60'
                          : 'bg-[#101012] border border-zinc-850 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{t.badge}</span>
                          <div>
                            <h5 className="text-xs font-bold text-white">{t.name}</h5>
                            {isCurrent && (
                              <span className="text-[9px] font-mono uppercase text-yellow-400 font-extrabold block">⭐ Seu Nível Atual</span>
                            )}
                          </div>
                        </div>
                        {isAchieved && (
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">Conquistado ✅</span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs font-mono text-zinc-300">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Faturamento:</span>
                          <strong>R$ {t.targetRevenue.toLocaleString('pt-BR')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Atendimentos:</span>
                          <strong>{t.targetServicesCount} serviços</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Produtos:</span>
                          <strong>R$ {t.targetProductSales.toLocaleString('pt-BR')}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-850 font-mono space-y-0.5">
                        <span className="text-[9px] uppercase text-zinc-400 block font-bold">Bônus Destravado:</span>
                        <div className="text-xs font-bold text-emerald-400">
                          + R$ {t.rewardBonusFixed} Cash
                        </div>
                        <div className="text-[10px] text-cyan-400 font-bold">
                          +{t.rewardExtraCommissionPercent}% Comissão Extra
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEÇÃO GALERIA DE BADGES GAMIFICADOS */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> Galeria de Conquistas & Emblemas Destravados
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {progress.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center space-y-1.5 transition ${
                      b.unlocked
                        ? 'bg-yellow-500/10 border-yellow-500/40 text-white shadow'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-600 opacity-60'
                    }`}
                  >
                    <div className="text-2xl">{b.icon}</div>
                    <div className="font-bold text-xs">{b.title}</div>
                    <div className="text-[9px] font-mono leading-tight text-zinc-400">{b.description}</div>
                    <div className="pt-1">
                      {b.unlocked ? (
                        <span className="text-[9px] font-mono uppercase font-bold text-yellow-400">Desbloqueado</span>
                      ) : (
                        <span className="text-[9px] font-mono uppercase text-zinc-600">Bloqueado 🔒</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO RANKING DA EQUIPE */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" /> Ranking Amigável da Equipe
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] uppercase text-zinc-400">
                      <th className="py-2.5 px-3">Posição</th>
                      <th className="py-2.5 px-3">Barbeiro</th>
                      <th className="py-2.5 px-3">Nível Alcançado</th>
                      <th className="py-2.5 px-3">Atendimentos</th>
                      <th className="py-2.5 px-3 text-right">Bônus Ganho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {leaderboard.map((e) => {
                      const isMe = e.barber.id === currentBarber.id;
                      return (
                        <tr key={e.barber.id} className={isMe ? 'bg-yellow-500/10 font-bold' : 'hover:bg-zinc-900/50'}>
                          <td className="py-3 px-3">
                            {e.rank === 1 ? '👑 1º' : e.rank === 2 ? '🥈 2º' : e.rank === 3 ? '🥉 3º' : `${e.rank}º`}
                          </td>
                          <td className="py-3 px-3 flex items-center gap-2">
                            <span>{e.barber.avatar || '🧔'}</span>
                            <span className={isMe ? 'text-yellow-400 font-bold' : 'text-white'}>
                              {e.barber.name} {isMe && '(Você)'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {e.currentTier ? (
                              <span className="text-[10px] font-bold uppercase text-yellow-400">
                                {e.currentTier.badge} {e.currentTier.name}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-[10px] font-mono">Iniciante 🎯</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-zinc-300">
                            {e.stats.servicesCount} serviços
                          </td>
                          <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                            + R$ {e.earnedBonusFixed}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* REGRAS DO JOGO INFORMATIVAS */}
            {parameters?.barberGoalsRulesText && (
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-xs space-y-1">
                <h5 className="font-bold font-mono text-yellow-500 uppercase text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Regras de Funcionamento e Políticas de Bônus
                </h5>
                <p className="text-zinc-400 whitespace-pre-line leading-relaxed">
                  {parameters.barberGoalsRulesText}
                </p>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
