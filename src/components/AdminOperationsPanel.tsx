/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar, Plus, Scissors, Trash2, UserPlus, ShoppingBag, Clock, Check, Send,
  AlertCircle, Zap, Search, FileText, Cake, Phone, MessageSquare, Filter,
  CheckCircle2, UserCheck, ChevronRight, Edit3, X, AlertTriangle, RefreshCw,
  Users, Eye, ShieldCheck, Sparkles, LayoutGrid, ListFilter, ArrowRight
} from 'lucide-react';
import {
  User, Service, Product, Appointment, Comanda, ComandaItem, ComandaStatus,
  CustomerSubscription, SystemParameters, BarberDetail
} from '../types';
import { buildWhatsAppReminderUrl } from '../utils/helpers';
import { playComandaDispatchedSound, playAppointmentScheduledSound } from '../utils/soundEffects';

interface AdminOperationsPanelProps {
  currentUser: User;
  users: User[];
  services: Service[];
  products: Product[];
  appointments: Appointment[];
  comandas: Comanda[];
  subscriptions?: CustomerSubscription[];
  barberDetails?: BarberDetail[];
  parameters?: SystemParameters;
  onUpdateState: (key: string, val: any) => void;
}

export default function AdminOperationsPanel({
  currentUser,
  users,
  services,
  products,
  appointments,
  comandas,
  subscriptions = [],
  barberDetails = [],
  parameters,
  onUpdateState
}: AdminOperationsPanelProps) {
  // Main Sub-Tab inside Admin Operations
  const [activeTab, setActiveTab] = useState<'comandas' | 'agenda' | 'fichas'>('comandas');

  // Barber filter: 'ALL' or specific barber id
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('ALL');

  // Active barbers list (only users with role === 'BARBER' and isActive !== false)
  const activeBarbers = users.filter(u => u.role === 'BARBER' && u.isActive !== false);

  // Customers list
  const customersList = users.filter(u => u.role === 'CUSTOMER');

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const getBirthdayStatus = (birthday?: string) => {
    if (!birthday) return null;
    const parts = birthday.split('-');
    if (parts.length < 3) return null;
    const bMonth = parseInt(parts[1], 10);
    const bDay = parseInt(parts[2], 10);
    const now = new Date();
    const cMonth = now.getMonth() + 1;
    const cDay = now.getDate();

    if (bMonth === cMonth && bDay === cDay) return 'HOJE';
    if (bMonth === cMonth && Math.abs(bDay - cDay) <= 3) return 'PROXIMO';
    return null;
  };

  // --- COMANDAS STATE ---
  const [comandaStatusFilter, setComandaStatusFilter] = useState<'ALL_ACTIVE' | 'OPEN' | 'DISPATCHED' | 'PAID'>('ALL_ACTIVE');
  const [comandaSearchTerm, setComandaSearchTerm] = useState('');
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);

  // Comanda item addition state
  const [comandaItemType, setComandaItemType] = useState<'service' | 'product'>('service');
  const [addSelectedSrvId, setAddSelectedSrvId] = useState(services[0]?.id || '');
  const [addSelectedPrdId, setAddSelectedPrdId] = useState(products[0]?.id || '');
  const [addQuantity, setAddQuantity] = useState('1');
  const [isVipChecked, setIsVipChecked] = useState(false);
  const [vipCustomPrice, setVipCustomPrice] = useState('0');

  // Comanda reassign barber state inside editor
  const [reassignBarberId, setReassignBarberId] = useState<string>('');

  // --- AGENDA STATE ---
  const [agendaDate, setAgendaDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [agendaViewMode, setAgendaViewMode] = useState<'columns' | 'list'>('columns');
  const [agendaSearchTerm, setAgendaSearchTerm] = useState('');

  // --- MODALS STATE ---
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookBarberId, setBookBarberId] = useState(activeBarbers[0]?.id || '');
  const [bookClientId, setBookClientId] = useState(customersList[0]?.id || '');
  const [bookServiceId, setBookServiceId] = useState(services[0]?.id || '');
  const [bookDate, setBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('14:00');
  const [bookNotes, setBookNotes] = useState('');

  // Encaixe Modal state
  const [showEncaixeModal, setShowEncaixeModal] = useState(false);
  const [encaixeBarberId, setEncaixeBarberId] = useState(activeBarbers[0]?.id || '');
  const [encaixeClientId, setEncaixeClientId] = useState(customersList[0]?.id || '');
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

  // Manual Comanda Creation Modal state
  const [showManualComandaModal, setShowManualComandaModal] = useState(false);
  const [manualComandaBarberId, setManualComandaBarberId] = useState(activeBarbers[0]?.id || '');
  const [manualComandaClientId, setManualComandaClientId] = useState(customersList[0]?.id || '');
  const [manualInitialServiceId, setManualInitialServiceId] = useState<string>('');

  // Block Modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockBarberId, setBlockBarberId] = useState<string>('ALL');
  const [blockType, setBlockType] = useState<'slot' | 'day'>('slot');
  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockTime, setBlockTime] = useState('12:00');

  // Client Quick Creation Modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientBirthday, setClientBirthday] = useState('');

  // Ficha / Customer Notes state
  const [selectedFichaCliId, setSelectedFichaCliId] = useState(customersList[0]?.id || '');
  const [fichaSearchTerm, setFichaSearchTerm] = useState('');
  const [savedFichaMsg, setSavedFichaMsg] = useState(false);

  // Selected comanda object
  const activeComandaObj = comandas.find(c => c.id === selectedComandaId);

  // Today ISO string
  const todayStr = new Date().toISOString().split('T')[0];

  // --- DERIVED METRICS ---
  const todayAppointments = appointments.filter(
    a => a.date === todayStr && a.serviceId !== 'BLOCKED_SLOT' && a.serviceId !== 'BLOCKED_FULL_DAY'
  );

  const openComandas = comandas.filter(c => c.status === 'OPEN' && !c.readyForPayment);
  const dispatchedComandas = comandas.filter(c => c.status === 'OPEN' && c.readyForPayment);
  const activeComandasCount = openComandas.length;
  const dispatchedComandasCount = dispatchedComandas.length;
  const totalValueInService = [...openComandas, ...dispatchedComandas].reduce((acc, c) => acc + (c.total || 0), 0);

  // --- ACTIONS: CLIENT CREATION ---
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Preencha ao menos o nome e telefone do cliente.');
      return;
    }

    const defaultPwd = parameters?.defaultClientPassword || 'cliente123';
    const shortId = `cli-${Date.now()}`;
    const cleanPhone = clientPhone.replace(/\D/g, '');
    const userEmail = clientEmail.trim() || `${cleanPhone || shortId}@logoalibarber.com`;
    const userLogin = cleanPhone || shortId;

    const newClient: User = {
      id: shortId,
      name: clientName.trim(),
      email: userEmail,
      role: 'CUSTOMER',
      phone: clientPhone.trim(),
      birthday: clientBirthday || undefined,
      isActive: true,
      avatar: '🧔',
      login: userLogin,
      password: defaultPwd,
      requiresPasswordChange: true,
      createdBy: `${currentUser.name} (Admin)`,
      createdAt: new Date().toISOString(),
      permissions: ['CUSTOMER_PORTAL']
    };

    onUpdateState('users', [...users, newClient]);
    setBookClientId(shortId);
    setEncaixeClientId(shortId);
    setManualComandaClientId(shortId);
    setSelectedFichaCliId(shortId);

    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientBirthday('');
    setShowClientModal(false);
    alert(`Cliente ${newClient.name} cadastrado com sucesso!`);
  };

  // --- ACTIONS: APPOINTMENT CREATION (ON BEHALF OF ANY BARBER) ---
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const barber = users.find(u => u.id === bookBarberId);
    const cli = users.find(u => u.id === bookClientId);
    const srv = services.find(s => s.id === bookServiceId);

    if (!barber) {
      alert('Selecione o barbeiro responsável pelo atendimento.');
      return;
    }
    if (!cli) {
      alert('Selecione um cliente.');
      return;
    }
    if (!srv) {
      alert('Selecione o serviço.');
      return;
    }

    // Check collision for the selected barber
    const collision = appointments.some(
      a => a.date === bookDate && a.time === bookTime && a.barberId === barber.id && a.status === 'SCHEDULED'
    );
    if (collision) {
      if (!confirm(`O barbeiro ${barber.name} já possui um agendamento para ${bookDate} às ${bookTime}. Deseja agendar mesmo assim?`)) {
        return;
      }
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      customerPhone: cli.phone,
      barberId: barber.id,
      barberName: barber.name,
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      date: bookDate,
      time: bookTime,
      status: 'SCHEDULED',
      notes: bookNotes.trim() || undefined,
      createdBy: `${currentUser.name} (Administrador)`
    };

    onUpdateState('appointments', [...appointments, newAppointment]);
    playAppointmentScheduledSound();
    setShowBookingModal(false);
    setBookNotes('');
    alert(`Agendamento realizado com sucesso para ${cli.name} com o barbeiro ${barber.name}!`);
  };

  // --- ACTIONS: ENCAIXE RÁPIDO (ON BEHALF OF ANY BARBER) ---
  const handleCreateEncaixe = (e: React.FormEvent) => {
    e.preventDefault();
    const barber = users.find(u => u.id === encaixeBarberId);
    const cli = users.find(u => u.id === encaixeClientId);

    if (!barber) {
      alert('Selecione o barbeiro responsável pelo encaixe.');
      return;
    }
    if (!cli) {
      alert('Selecione um cliente para o encaixe.');
      return;
    }
    if (encaixeServiceIds.length === 0) {
      alert('Selecione ao menos um serviço para o encaixe.');
      return;
    }

    const selectedSrvObjects = services.filter(s => encaixeServiceIds.includes(s.id));
    const srvNames = selectedSrvObjects.map(s => s.name).join(', ');
    const totalVal = selectedSrvObjects.reduce((acc, s) => acc + s.price, 0);
    const today = new Date().toISOString().split('T')[0];

    const newEncaixeApt: Appointment = {
      id: `encaixe-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      customerPhone: cli.phone,
      barberId: barber.id,
      barberName: barber.name,
      serviceId: encaixeServiceIds.join(','),
      serviceName: `⚡ Encaixe: ${srvNames}`,
      servicePrice: totalVal,
      date: today,
      time: encaixeStartTime,
      endTime: encaixeEndTime,
      status: 'IN_PROGRESS',
      isEncaixe: true,
      notes: encaixeObs,
      createdBy: `${currentUser.name} (Administrador)`
    };

    const newComanda: Comanda = {
      id: `cmd-${Date.now()}`,
      appointmentId: newEncaixeApt.id,
      customerId: cli.id,
      customerName: cli.name,
      barberId: barber.id,
      barberName: barber.name,
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
      notes: encaixeObs,
      createdBy: `${currentUser.name} (Administrador)`
    };

    onUpdateState('appointments', [...appointments, newEncaixeApt]);
    onUpdateState('comandas', [...comandas, newComanda]);

    setShowEncaixeModal(false);
    setEncaixeObs('');
    setSelectedComandaId(newComanda.id);
    setActiveTab('comandas');
    alert(`Encaixe registrado com sucesso na cadeira de ${barber.name} para ${cli.name}! Comanda de ${formatCurrency(totalVal)} aberta.`);
  };

  // --- ACTIONS: MANUAL COMANDA CREATION ---
  const handleOpenManualComanda = (e: React.FormEvent) => {
    e.preventDefault();
    const barber = users.find(u => u.id === manualComandaBarberId);
    const cli = users.find(u => u.id === manualComandaClientId);

    if (!barber) {
      alert('Selecione o barbeiro responsável pela comanda.');
      return;
    }
    if (!cli) {
      alert('Selecione um cliente.');
      return;
    }

    let initialItems: ComandaItem[] = [];
    let initialTotal = 0;

    if (manualInitialServiceId) {
      const srv = services.find(s => s.id === manualInitialServiceId);
      if (srv) {
        initialItems.push({
          id: `item-${Date.now()}`,
          serviceId: srv.id,
          name: srv.name,
          unitPrice: srv.price,
          quantity: 1
        });
        initialTotal = srv.price;
      }
    }

    const newComanda: Comanda = {
      id: `cmd-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      barberId: barber.id,
      barberName: barber.name,
      items: initialItems,
      subtotal: initialTotal,
      discount: 0,
      total: initialTotal,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      createdBy: `${currentUser.name} (Administrador)`
    };

    onUpdateState('comandas', [...comandas, newComanda]);
    setSelectedComandaId(newComanda.id);
    setShowManualComandaModal(false);
    setManualInitialServiceId('');
    setActiveTab('comandas');
  };

  // --- ACTIONS: START COMANDA FROM APPOINTMENT ---
  const handleStartComandaFromAppointment = (apt: Appointment) => {
    const existing = comandas.find(c => c.appointmentId === apt.id);
    if (existing) {
      setSelectedComandaId(existing.id);
      setActiveTab('comandas');
      return;
    }

    const barber = users.find(u => u.id === apt.barberId) || { name: apt.barberName || 'Barbeiro' };

    const couponDiscount = apt.discountAmount || 0;
    const initialTotal = Math.max(0, apt.servicePrice - couponDiscount);

    const newComanda: Comanda = {
      id: `cmd-${Date.now()}`,
      appointmentId: apt.id,
      customerId: apt.customerId,
      customerName: apt.customerName,
      barberId: apt.barberId,
      barberName: apt.barberName || barber.name,
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
      discount: couponDiscount,
      total: initialTotal,
      appliedCouponCode: apt.appliedCouponCode,
      couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      createdBy: `${currentUser.name} (Administrador)`,
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
    setActiveTab('comandas');
  };

  // --- ACTIONS: BLOCK AGENDA (FOR ANY OR ALL BARBERS) ---
  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      alert('Selecione uma data para o bloqueio.');
      return;
    }

    const isFullDay = blockType === 'day';
    const targetBarbers = blockBarberId === 'ALL'
      ? activeBarbers
      : activeBarbers.filter(b => b.id === blockBarberId);

    if (targetBarbers.length === 0) {
      alert('Nenhum barbeiro ativo encontrado para aplicar o bloqueio.');
      return;
    }

    const newBlocks: Appointment[] = targetBarbers.map(barber => ({
      id: `block-${Date.now()}-${barber.id}`,
      customerId: 'BLOCKED_CUSTOMER',
      customerName: isFullDay ? '🚫 DIA INTEIRO BLOQUEADO' : '🚫 HORÁRIO FECHADO',
      customerPhone: 'N/A',
      barberId: barber.id,
      barberName: barber.name,
      serviceId: isFullDay ? 'BLOCKED_FULL_DAY' : 'BLOCKED_SLOT',
      serviceName: isFullDay ? 'Ausente (Dia Inteiro)' : 'Horário Desativado',
      servicePrice: 0,
      date: blockDate,
      time: isFullDay ? '00:00' : blockTime,
      status: 'SCHEDULED',
      createdBy: `${currentUser.name} (Administrador)`
    }));

    onUpdateState('appointments', [...appointments, ...newBlocks]);
    setShowBlockModal(false);
    alert(`Bloqueio de agenda criado com sucesso para ${targetBarbers.length} profissional(is)!`);
  };

  // --- ACTIONS: COMANDA ITEM MANAGEMENT ---
  const handleAddItemToComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComandaId) return;

    const qty = parseInt(addQuantity) || 1;
    let newItem: ComandaItem;

    if (comandaItemType === 'service') {
      const srv = services.find(s => s.id === addSelectedSrvId);
      if (!srv) return;

      if (isVipChecked) {
        const customPrice = parseFloat(vipCustomPrice) || 0;
        newItem = {
          id: `item-${Date.now()}`,
          serviceId: srv.id,
          name: `${srv.name} (VIP Cortesia)`,
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
        const newSubtotal = newItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
        return {
          ...c,
          items: newItems,
          subtotal: newSubtotal,
          total: Math.max(0, newSubtotal - (c.discount || 0))
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
    setIsVipChecked(false);
    setVipCustomPrice('0');
  };

  const handleRemoveItemFromComanda = (itemId: string) => {
    if (!selectedComandaId) return;

    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComandaId) {
        const newItems = c.items.filter(i => i.id !== itemId);
        const newSubtotal = newItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
        return {
          ...c,
          items: newItems,
          subtotal: newSubtotal,
          total: Math.max(0, newSubtotal - (c.discount || 0))
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
  };

  // --- ACTIONS: REASSIGN BARBER ON COMANDA ---
  const handleReassignComandaBarber = (newBarberId: string) => {
    if (!selectedComandaId || !newBarberId) return;
    const newBarber = users.find(u => u.id === newBarberId);
    if (!newBarber) return;

    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComandaId) {
        return {
          ...c,
          barberId: newBarber.id,
          barberName: newBarber.name,
          reassignedBy: currentUser.name,
          reassignedAt: new Date().toISOString()
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
    alert(`Comanda reatribuída com sucesso para o barbeiro ${newBarber.name}!`);
  };

  // --- ACTIONS: DISPATCH COMANDA TO CASHIER ---
  const handleToggleDispatchComanda = (cmdId: string) => {
    const cmd = comandas.find(c => c.id === cmdId);
    if (!cmd) return;

    const willDispatch = !cmd.readyForPayment;
    const updatedComandas = comandas.map(c => {
      if (c.id === cmdId) {
        return {
          ...c,
          readyForPayment: willDispatch,
          dispatchedAt: willDispatch ? new Date().toISOString() : undefined,
          dispatchedBy: willDispatch ? `${currentUser.name} (Admin)` : undefined
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
    if (willDispatch) {
      playComandaDispatchedSound();
    }
  };

  // --- ACTIONS: CANCEL COMANDA ---
  const handleCancelComanda = (cmdId: string) => {
    if (!confirm('Deseja realmente cancelar esta comanda?')) return;
    const updatedComandas = comandas.map(c => {
      if (c.id === cmdId) {
        return { ...c, status: 'CANCELLED' as ComandaStatus };
      }
      return c;
    });
    onUpdateState('comandas', updatedComandas);
    if (selectedComandaId === cmdId) {
      setSelectedComandaId(null);
    }
  };

  // --- ACTIONS: CANCEL APPOINTMENT ---
  const handleCancelAppointment = (aptId: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    const updatedApts = appointments.map(a =>
      a.id === aptId ? { ...a, status: 'CANCELLED' as const } : a
    );
    onUpdateState('appointments', updatedApts);
  };

  // --- FILTERED LISTS ---
  const filteredComandas = comandas.filter(c => {
    // Barber filter
    if (selectedBarberFilter !== 'ALL' && c.barberId !== selectedBarberFilter) {
      return false;
    }
    // Status filter
    if (comandaStatusFilter === 'ALL_ACTIVE') {
      if (c.status !== 'OPEN') return false;
    } else if (comandaStatusFilter === 'OPEN') {
      if (c.status !== 'OPEN' || c.readyForPayment) return false;
    } else if (comandaStatusFilter === 'DISPATCHED') {
      if (c.status !== 'OPEN' || !c.readyForPayment) return false;
    } else if (comandaStatusFilter === 'PAID') {
      if (c.status !== 'PAID') return false;
    }
    // Search filter
    if (comandaSearchTerm.trim()) {
      const term = comandaSearchTerm.toLowerCase();
      const matchCust = c.customerName?.toLowerCase().includes(term);
      const matchBarber = c.barberName?.toLowerCase().includes(term);
      const matchId = c.id?.toLowerCase().includes(term);
      if (!matchCust && !matchBarber && !matchId) return false;
    }
    return true;
  });

  const filteredAppointments = appointments.filter(a => {
    if (a.date !== agendaDate) return false;
    if (selectedBarberFilter !== 'ALL' && a.barberId !== selectedBarberFilter) return false;
    if (agendaSearchTerm.trim()) {
      const term = agendaSearchTerm.toLowerCase();
      const matchCust = a.customerName?.toLowerCase().includes(term);
      const matchBarber = a.barberName?.toLowerCase().includes(term);
      const matchService = a.serviceName?.toLowerCase().includes(term);
      if (!matchCust && !matchBarber && !matchService) return false;
    }
    return true;
  }).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="w-full max-w-full space-y-6 text-left font-sans overflow-x-hidden">

      {/* 1. TOP ADMIN CONTROL HEADER */}
      <div className="bg-[#101012] border border-zinc-800 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Central de Agendamentos & Comandas Gerais
              </h2>
              <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black font-mono uppercase rounded-md shadow-xs">
                Acesso Administrativo
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Supervisão global de todos os profissionais. Monitore, edite, crie comandas e agende serviços no nome de qualquer barbeiro.
            </p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>+ Novo Agendamento</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEncaixeModal(true)}
            className="px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Novo Encaixe</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualComandaModal(true)}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-yellow-500" />
            <span>+ Nova Comanda</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="px-3 py-2 bg-red-950/40 hover:bg-red-950/60 border border-red-800/60 text-red-300 font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>🚫 Bloquear Agenda</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClientModal(true)}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>+ Cliente</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 bg-[#101012] border border-zinc-850 rounded-xl">
          <span className="text-[10px] text-zinc-400 uppercase block">💈 Barbeiros Ativos</span>
          <span className="text-xl font-bold text-white mt-1 block">{activeBarbers.length} profissionais</span>
        </div>

        <div className="p-3.5 bg-[#101012] border border-zinc-850 rounded-xl">
          <span className="text-[10px] text-zinc-400 uppercase block">📅 Agendamentos Hoje</span>
          <span className="text-xl font-bold text-yellow-500 mt-1 block">{todayAppointments.length} clientes</span>
        </div>

        <div className="p-3.5 bg-[#101012] border border-zinc-850 rounded-xl">
          <span className="text-[10px] text-amber-400 uppercase block">✂️ Comandas em Cadeira</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{activeComandasCount} abertas</span>
        </div>

        <div className="p-3.5 bg-[#101012] border border-zinc-850 rounded-xl">
          <span className="text-[10px] text-emerald-400 uppercase block">🚀 Despachadas p/ Caixa</span>
          <div className="flex items-baseline justify-between gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-400">{dispatchedComandasCount}</span>
            <span className="text-xs text-zinc-400 font-normal">{formatCurrency(totalValueInService)}</span>
          </div>
        </div>
      </div>

      {/* 3. BARBER FILTER SELECTOR BAR */}
      <div className="bg-[#101012] border border-zinc-850 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-yellow-500" />
            <span>Filtrar por Barbeiro:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedBarberFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              selectedBarberFilter === 'ALL'
                ? 'bg-yellow-500 text-black shadow-xs'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            👥 Todos os Barbeiros ({activeBarbers.length})
          </button>

          {activeBarbers.map(barber => {
            const barberOpenCount = comandas.filter(c => c.barberId === barber.id && c.status === 'OPEN').length;
            const barberTodayAptCount = appointments.filter(a => a.barberId === barber.id && a.date === todayStr && a.status === 'SCHEDULED').length;
            const isSelected = selectedBarberFilter === barber.id;

            return (
              <button
                key={barber.id}
                type="button"
                onClick={() => setSelectedBarberFilter(barber.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-yellow-500 text-black shadow-xs'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <span>{barber.avatar || '🧔'}</span>
                <span>{barber.name}</span>
                {(barberOpenCount > 0 || barberTodayAptCount > 0) && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black text-yellow-500' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {barberOpenCount > 0 ? `${barberOpenCount} em cmd` : `${barberTodayAptCount} ag`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedBarberFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setSelectedBarberFilter('ALL')}
            className="text-xs text-zinc-400 hover:text-white underline font-mono cursor-pointer shrink-0"
          >
            Limpar filtro (Ver Todos)
          </button>
        )}
      </div>

      {/* 4. SUB-TABS NAVIGATION (COMANDAS vs AGENDA vs FICHAS) */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('comandas')}
          className={`py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'comandas'
              ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Comandas de Todos ({filteredComandas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'agenda'
              ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda Geral ({filteredAppointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fichas')}
          className={`py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'fichas'
              ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Fichas & Clientes</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. TAB COMANDAS */}
      {/* ======================================================== */}
      {activeTab === 'comandas' && (
        <div className="space-y-6">
          {/* Filter sub-bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setComandaStatusFilter('ALL_ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  comandaStatusFilter === 'ALL_ACTIVE' ? 'bg-zinc-200 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Todas em Atendimento ({openComandas.length + dispatchedComandas.length})
              </button>
              <button
                type="button"
                onClick={() => setComandaStatusFilter('OPEN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  comandaStatusFilter === 'OPEN' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Em Cadeira ({openComandas.length})
              </button>
              <button
                type="button"
                onClick={() => setComandaStatusFilter('DISPATCHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  comandaStatusFilter === 'DISPATCHED' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Despachadas ao Caixa ({dispatchedComandas.length})
              </button>
              <button
                type="button"
                onClick={() => setComandaStatusFilter('PAID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  comandaStatusFilter === 'PAID' ? 'bg-blue-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Finalizadas / Pagas
              </button>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={comandaSearchTerm}
                onChange={e => setComandaSearchTerm(e.target.value)}
                placeholder="Buscar cliente ou barbeiro..."
                className="w-full bg-[#101012] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 font-mono"
              />
            </div>
          </div>

          {/* Main Comandas Split View (List on left, Editor on right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left list of comandas */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest block">
                Comandas Encontradas ({filteredComandas.length})
              </h4>

              {filteredComandas.length === 0 ? (
                <div className="bg-[#101012] border border-zinc-850 rounded-xl p-8 text-center text-zinc-500 text-xs">
                  Nenhuma comanda encontrada para os filtros selecionados.
                </div>
              ) : (
                filteredComandas.map(cmd => {
                  const customerUser = users.find(u => u.id === cmd.customerId);
                  const bdayStatus = getBirthdayStatus(customerUser?.birthday);
                  const isSelected = selectedComandaId === cmd.id;

                  return (
                    <div
                      key={cmd.id}
                      onClick={() => setSelectedComandaId(cmd.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition text-left space-y-2.5 ${
                        isSelected
                          ? 'bg-[#151518] border-yellow-500 shadow-md ring-1 ring-yellow-500/50'
                          : 'bg-[#101012] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Birthday Alert */}
                      {bdayStatus === 'HOJE' && (
                        <div className="bg-amber-500/20 border border-amber-500/40 p-1.5 rounded-lg text-[10px] font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
                          <Cake className="w-3.5 h-3.5" />
                          <span>HOJE É ANIVERSÁRIO DO CLIENTE! 🎉</span>
                        </div>
                      )}

                      {/* Barbeiro Responsável Tag */}
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-850 pb-2">
                        <span className="text-[11px] font-mono font-extrabold text-yellow-400 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                          <span>🧔</span>
                          <span>Barbeiro: {cmd.barberName}</span>
                        </span>

                        {cmd.readyForPayment ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1">
                            <Send className="w-3 h-3" /> NO CAIXA
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> EM CADEIRA
                          </span>
                        )}
                      </div>

                      {/* Customer & Value */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-white uppercase block">{cmd.customerName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {cmd.items?.length || 0} item(ns) na comanda
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-yellow-500">
                          {formatCurrency(cmd.total)}
                        </span>
                      </div>

                      {/* Items Summary preview */}
                      <div className="text-[10px] font-mono text-zinc-400 line-clamp-1 border-t border-zinc-850/60 pt-1.5">
                        {cmd.items?.map(i => i.name).join(', ') || 'Nenhum item adicionado ainda'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Comanda Detail & Editor */}
            <div className="lg:col-span-2">
              {activeComandaObj ? (
                <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6">

                  {/* Comanda Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-zinc-400">Comanda #{activeComandaObj.id.slice(-6)}</span>
                        {activeComandaObj.readyForPayment ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            🚀 Despachada ao Caixa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ✂️ Em Atendimento na Cadeira
                          </span>
                        )}
                        {activeComandaObj.isEncaixe && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            ⚡ Encaixe
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                        Cliente: {activeComandaObj.customerName}
                      </h3>
                    </div>

                    {/* Reatribuir Barbeiro Selector */}
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Barbeiro:</span>
                      <select
                        value={activeComandaObj.barberId}
                        onChange={e => handleReassignComandaBarber(e.target.value)}
                        className="bg-black border border-zinc-700 text-yellow-400 font-mono font-bold text-xs rounded-lg px-2 py-1 cursor-pointer"
                        title="Reatribuir esta comanda a outro barbeiro"
                      >
                        {activeBarbers.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Items List in Comanda */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
                      Itens Lançados na Comanda ({activeComandaObj.items?.length || 0})
                    </h4>

                    {(!activeComandaObj.items || activeComandaObj.items.length === 0) ? (
                      <div className="bg-zinc-900/50 border border-zinc-850 rounded-xl p-6 text-center text-zinc-500 text-xs">
                        Nenhum item lançado. Adicione serviços ou produtos abaixo.
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950">
                        {activeComandaObj.items.map(item => (
                          <div key={item.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm">{item.isProduct ? '🧴' : '✂️'}</span>
                              <div>
                                <span className="font-bold text-white block">{item.name}</span>
                                <span className="text-[10px] text-zinc-400">
                                  {item.quantity}x {formatCurrency(item.unitPrice)}
                                  {item.isVipService && ' (VIP)'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white">
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromComanda(item.id)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
                                title="Remover item da comanda"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Addition Form for Comanda */}
                  <form onSubmit={handleAddItemToComanda} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold font-mono text-yellow-500 uppercase tracking-wider block">
                      + Adicionar Serviço ou Produto à Comanda
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Tipo</label>
                        <select
                          value={comandaItemType}
                          onChange={e => setComandaItemType(e.target.value as any)}
                          className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        >
                          <option value="service">✂️ Serviço</option>
                          <option value="product">🧴 Produto</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">
                          {comandaItemType === 'service' ? 'Selecione o Serviço' : 'Selecione o Produto'}
                        </label>
                        {comandaItemType === 'service' ? (
                          <select
                            value={addSelectedSrvId}
                            onChange={e => setAddSelectedSrvId(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          >
                            {services.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} - {formatCurrency(s.price)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={addSelectedPrdId}
                            onChange={e => setAddSelectedPrdId(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} - {formatCurrency(p.price)} (Estoque: {p.stock})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Qtd</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={addQuantity}
                          onChange={e => setAddQuantity(e.target.value)}
                          className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* VIP service Cortesia override option */}
                    {comandaItemType === 'service' && (
                      <div className="flex items-center gap-3 pt-1 border-t border-zinc-800">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                          <input
                            type="checkbox"
                            checked={isVipChecked}
                            onChange={e => setIsVipChecked(e.target.checked)}
                            className="rounded border-zinc-700 bg-black text-yellow-500 focus:ring-0"
                          />
                          <span>Serviço VIP / Cortesia Administrativa</span>
                        </label>

                        {isVipChecked && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-400">Valor (R$):</span>
                            <input
                              type="number"
                              step="0.5"
                              value={vipCustomPrice}
                              onChange={e => setVipCustomPrice(e.target.value)}
                              className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-yellow-400 font-mono"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-mono font-bold text-xs uppercase rounded-lg transition cursor-pointer"
                    >
                      + Lançar Item na Comanda
                    </button>
                  </form>

                  {/* Summary and Dispatch to Cashier Actions */}
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block">Total a Pagar no Caixa</span>
                      <span className="text-2xl font-black text-yellow-500">
                        {formatCurrency(activeComandaObj.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleDispatchComanda(activeComandaObj.id)}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-mono font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
                          activeComandaObj.readyForPayment
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-sm'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {activeComandaObj.readyForPayment ? '↩️ Retornar para Cadeira' : '🚀 Despachar ao Caixa'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancelComanda(activeComandaObj.id)}
                        className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-800/50 hover:bg-red-950/70 transition cursor-pointer"
                        title="Cancelar comanda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#101012] border border-zinc-850 rounded-2xl p-12 text-center text-zinc-500 space-y-2">
                  <Scissors className="w-10 h-10 mx-auto text-zinc-600 opacity-60" />
                  <p className="text-sm font-bold text-zinc-400">Nenhuma comanda selecionada</p>
                  <p className="text-xs">Selecione uma comanda na lista ao lado para visualizar e editar os itens, ou clique em "+ Nova Comanda".</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. TAB AGENDA GERAL */}
      {/* ======================================================== */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          {/* Agenda Control Toolbar */}
          <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Data:</span>

              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  setAgendaDate(d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 cursor-pointer"
              >
                Ontem
              </button>

              <button
                type="button"
                onClick={() => setAgendaDate(new Date().toISOString().split('T')[0])}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                  agendaDate === todayStr ? 'bg-yellow-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setAgendaDate(d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 cursor-pointer"
              >
                Amanhã
              </button>

              <input
                type="date"
                value={agendaDate}
                onChange={e => setAgendaDate(e.target.value)}
                className="bg-black border border-zinc-700 rounded-lg px-3 py-1 text-xs text-white font-mono"
              />
            </div>

            {/* View Mode & Search */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex bg-black border border-zinc-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setAgendaViewMode('columns')}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                    agendaViewMode === 'columns' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visão por colunas de cadeiras dos barbeiros"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Por Cadeira</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAgendaViewMode('list')}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                    agendaViewMode === 'list' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visão lista cronológica geral"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Cronológico</span>
                </button>
              </div>

              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={agendaSearchTerm}
                  onChange={e => setAgendaSearchTerm(e.target.value)}
                  placeholder="Buscar agendamento..."
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: COLUMNS BY BARBER CHAIR (DISPATCH BOARD) */}
          {agendaViewMode === 'columns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
              {(selectedBarberFilter === 'ALL' ? activeBarbers : activeBarbers.filter(b => b.id === selectedBarberFilter)).map(barber => {
                const barberApts = appointments.filter(
                  a => a.barberId === barber.id && a.date === agendaDate
                ).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

                return (
                  <div key={barber.id} className="bg-[#101012] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                    {/* Column Header */}
                    <div className="p-3.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{barber.avatar || '🧔'}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{barber.name}</h4>
                          <span className="text-[10px] text-yellow-500 font-mono">
                            {barberApts.filter(a => a.status === 'SCHEDULED' && a.serviceId !== 'BLOCKED_SLOT' && a.serviceId !== 'BLOCKED_FULL_DAY').length} agendamentos
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setBookBarberId(barber.id);
                          setBookDate(agendaDate);
                          setShowBookingModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Agendar diretamente para este barbeiro"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agendar</span>
                      </button>
                    </div>

                    {/* Appointments List for this Barber */}
                    <div className="p-3 space-y-2.5 max-h-[600px] overflow-y-auto">
                      {barberApts.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                          Nenhum horário marcado neste dia.
                        </div>
                      ) : (
                        barberApts.map(apt => {
                          const isBlocked = apt.serviceId === 'BLOCKED_SLOT' || apt.serviceId === 'BLOCKED_FULL_DAY';
                          const isCompleted = apt.status === 'COMPLETED';
                          const isCancelled = apt.status === 'CANCELLED';
                          const linkedComanda = comandas.find(c => c.appointmentId === apt.id);

                          if (isBlocked) {
                            return (
                              <div key={apt.id} className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-left space-y-1">
                                <span className="text-[10px] font-mono font-bold text-red-400 block">
                                  🚫 {apt.serviceName} ({apt.time})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateState('appointments', appointments.filter(a => a.id !== apt.id))}
                                  className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                                >
                                  Desbloquear horário
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={apt.id}
                              className={`p-3 rounded-xl border text-left space-y-2 transition ${
                                isCancelled
                                  ? 'bg-zinc-950/60 border-zinc-850 opacity-60'
                                  : isCompleted
                                  ? 'bg-emerald-950/20 border-emerald-800/40'
                                  : 'bg-[#151518] border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-mono font-extrabold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                                  {apt.time}{apt.endTime ? ` - ${apt.endTime}` : ''}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {formatCurrency(apt.servicePrice)}
                                </span>
                              </div>

                              <div>
                                <span className="text-xs font-bold text-white block">{apt.customerName}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">{apt.serviceName}</span>
                                {apt.appliedCouponCode && (
                                  <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold">
                                    <span>🎟️ {apt.appliedCouponCode}</span>
                                    {apt.discountAmount ? <span>(-{formatCurrency(apt.discountAmount)})</span> : null}
                                  </div>
                                )}
                              </div>

                              {apt.customerPhone && (
                                <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
                                  <span className="text-[10px] text-zinc-500 font-mono">{apt.customerPhone}</span>
                                  <a
                                    href={buildWhatsAppReminderUrl(apt, parameters)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3 h-3" /> WhatsApp
                                  </a>
                                </div>
                              )}

                              {/* Appointment Actions */}
                              <div className="flex items-center gap-1.5 pt-1">
                                {linkedComanda ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedComandaId(linkedComanda.id);
                                      setActiveTab('comandas');
                                    }}
                                    className="flex-1 py-1 text-center bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/30 rounded text-[10px] font-mono font-bold cursor-pointer"
                                  >
                                    Ver Comanda Aberta
                                  </button>
                                ) : (
                                  !isCancelled && !isCompleted && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartComandaFromAppointment(apt)}
                                      className="flex-1 py-1 text-center bg-yellow-500 hover:bg-yellow-600 text-black rounded text-[10px] font-mono font-bold cursor-pointer"
                                    >
                                      Iniciar Comanda
                                    </button>
                                  )
                                )}

                                {!isCancelled && !isCompleted && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelAppointment(apt.id)}
                                    className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-900 cursor-pointer"
                                    title="Cancelar agendamento"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: CHRONOLOGICAL UNIFIED TIMELINE */}
          {agendaViewMode === 'list' && (
            <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest block mb-2">
                Linha do Tempo Cronológica ({filteredAppointments.length} agendamentos)
              </h4>

              {filteredAppointments.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs font-mono">
                  Nenhum agendamento encontrado para esta data.
                </div>
              ) : (
                <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950">
                  {filteredAppointments.map(apt => {
                    const isBlocked = apt.serviceId === 'BLOCKED_SLOT' || apt.serviceId === 'BLOCKED_FULL_DAY';
                    const linkedComanda = comandas.find(c => c.appointmentId === apt.id);

                    if (isBlocked) {
                      return (
                        <div key={apt.id} className="p-3 bg-red-950/15 flex items-center justify-between text-xs font-mono">
                          <span className="text-red-400 font-bold">🚫 {apt.serviceName} ({apt.time}) - {apt.barberName}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateState('appointments', appointments.filter(a => a.id !== apt.id))}
                            className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                          >
                            Desbloquear
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={apt.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded text-xs">
                            {apt.time}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm block">{apt.customerName}</span>
                            <span className="text-[11px] text-zinc-400">{apt.serviceName} • {formatCurrency(apt.servicePrice)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[11px] font-bold text-yellow-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            🧔 {apt.barberName}
                          </span>

                          {linkedComanda ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedComandaId(linkedComanda.id);
                                setActiveTab('comandas');
                              }}
                              className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-bold cursor-pointer"
                            >
                              Comanda Aberta
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartComandaFromAppointment(apt)}
                              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded text-xs cursor-pointer"
                            >
                              Iniciar Comanda
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded cursor-pointer"
                            title="Cancelar agendamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 7. TAB FICHAS & CLIENTES */}
      {/* ======================================================== */}
      {activeTab === 'fichas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer list on left */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={fichaSearchTerm}
                onChange={e => setFichaSearchTerm(e.target.value)}
                placeholder="Buscar cliente por nome ou telefone..."
                className="w-full bg-[#101012] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 font-mono"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {customersList.filter(c =>
                c.name.toLowerCase().includes(fichaSearchTerm.toLowerCase()) ||
                (c.phone && c.phone.includes(fichaSearchTerm))
              ).map(customer => {
                const isSelected = selectedFichaCliId === customer.id;
                const bdayStatus = getBirthdayStatus(customer.birthday);
                const cComandasCount = comandas.filter(c => c.customerId === customer.id && c.status === 'PAID').length;

                return (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedFichaCliId(customer.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1 ${
                      isSelected
                        ? 'bg-[#151518] border-yellow-500 shadow-sm ring-1 ring-yellow-500/50'
                        : 'bg-[#101012] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white block">{customer.name}</span>
                      {bdayStatus === 'HOJE' && <span className="text-xs">🎂</span>}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>{customer.phone || 'Sem telefone'}</span>
                      <span className="text-yellow-500">{cComandasCount} cortes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Profile & Technical Notes on right */}
          <div className="lg:col-span-2">
            {(() => {
              const selectedCustomer = users.find(u => u.id === selectedFichaCliId);
              if (!selectedCustomer) {
                return (
                  <div className="bg-[#101012] border border-zinc-850 rounded-2xl p-12 text-center text-zinc-500">
                    Selecione um cliente ao lado para ver o histórico e ficha técnica.
                  </div>
                );
              }

              const custAppointments = appointments.filter(a => a.customerId === selectedCustomer.id);
              const custComandas = comandas.filter(c => c.customerId === selectedCustomer.id);

              return (
                <div className="bg-[#101012] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>👤</span>
                        <span>{selectedCustomer.name}</span>
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Telefone: {selectedCustomer.phone || 'N/A'} • Aniversário: {selectedCustomer.birthday || 'Não informado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCustomer.phone && (
                        <a
                          href={`https://wa.me/55${selectedCustomer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setBookClientId(selectedCustomer.id);
                          setShowBookingModal(true);
                        }}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                      >
                        + Agendar Atendimento
                      </button>
                    </div>
                  </div>

                  {/* Technical Notes / Cut Preferences */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest block">
                      Ficha Técnica & Preferências de Corte do Cliente
                    </label>
                    <textarea
                      rows={3}
                      value={selectedCustomer.barberNotes || ''}
                      onChange={e => {
                        const updatedUsers = users.map(u =>
                          u.id === selectedCustomer.id ? { ...u, barberNotes: e.target.value } : u
                        );
                        onUpdateState('users', updatedUsers);
                      }}
                      placeholder="Ex: Cabelo disfarçado na 0.5, barba desenhada sem lâmina alta, prefere pomada fosca..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 font-mono focus:border-yellow-500 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-zinc-500 font-mono">
                      * As notas ficam salvas no cadastro do cliente e visíveis para todos os barbeiros durante o atendimento.
                    </p>
                  </div>

                  {/* Customer History Summary */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
                      Histórico Recente de Atendimentos ({custComandas.length} comandas)
                    </h4>

                    {custComandas.length === 0 ? (
                      <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-center text-zinc-500 text-xs font-mono">
                        Nenhum atendimento registrado anteriormente.
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950 max-h-56 overflow-y-auto">
                        {custComandas.map(cmd => (
                          <div key={cmd.id} className="p-3 flex items-center justify-between text-xs font-mono">
                            <div>
                              <span className="font-bold text-white block">
                                {new Date(cmd.createdAt).toLocaleDateString('pt-BR')} • Barbeiro: {cmd.barberName}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {cmd.items?.map(i => i.name).join(', ')}
                              </span>
                            </div>
                            <span className="font-bold text-yellow-500">
                              {formatCurrency(cmd.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NOVO AGENDAMENTO (EM NOME DE QUALQUER BARBEIRO) */}
      {/* ======================================================== */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Novo Agendamento Administrativo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              {/* Seleção de Barbeiro */}
              <div>
                <label className="text-[10px] font-mono text-yellow-400 font-bold block uppercase mb-1">
                  💈 Barbeiro Responsável (Obrigatório)
                </label>
                <select
                  value={bookBarberId}
                  onChange={e => setBookBarberId(e.target.value)}
                  className="w-full bg-black border border-yellow-500/50 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono font-bold"
                  required
                >
                  {activeBarbers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.avatar || '🧔'} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Cliente */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase">
                    Cliente
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setShowClientModal(true);
                    }}
                    className="text-[10px] text-yellow-400 hover:underline font-mono cursor-pointer"
                  >
                    + Novo Cliente
                  </button>
                </div>
                <select
                  value={bookClientId}
                  onChange={e => setBookClientId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                >
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serviço */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">
                  Serviço
                </label>
                <select
                  value={bookServiceId}
                  onChange={e => setBookServiceId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {formatCurrency(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Data</label>
                  <input
                    type="date"
                    value={bookDate}
                    onChange={e => setBookDate(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Horário</label>
                  <input
                    type="time"
                    value={bookTime}
                    onChange={e => setBookTime(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Observações (Opcional)</label>
                <input
                  type="text"
                  value={bookNotes}
                  onChange={e => setBookNotes(e.target.value)}
                  placeholder="Ex: Cliente tem preferência por cadeira rápida..."
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Confirmar Agendamento no Nome do Barbeiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: NOVO ENCAIXE RÁPIDO */}
      {/* ======================================================== */}
      {showEncaixeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Lançar Encaixe Rápido na Cadeira
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEncaixeModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEncaixe} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-yellow-400 font-bold block uppercase mb-1">
                  Barbeiro que fará o atendimento
                </label>
                <select
                  value={encaixeBarberId}
                  onChange={e => setEncaixeBarberId(e.target.value)}
                  className="w-full bg-black border border-yellow-500/50 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono font-bold"
                  required
                >
                  {activeBarbers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.avatar || '🧔'} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Cliente</label>
                <select
                  value={encaixeClientId}
                  onChange={e => setEncaixeClientId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                >
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serviços do Encaixe */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Serviços Inclusos</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-black border border-zinc-800 rounded-xl">
                  {services.map(s => {
                    const isChecked = encaixeServiceIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setEncaixeServiceIds(prev =>
                              prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                            );
                          }}
                          className="rounded border-zinc-700 bg-zinc-900 text-yellow-500"
                        />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Horário Início / Fim */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Início</label>
                  <input
                    type="time"
                    value={encaixeStartTime}
                    onChange={e => setEncaixeStartTime(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Término Estimado</label>
                  <input
                    type="time"
                    value={encaixeEndTime}
                    onChange={e => setEncaixeEndTime(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Observações</label>
                <input
                  type="text"
                  value={encaixeObs}
                  onChange={e => setEncaixeObs(e.target.value)}
                  placeholder="Ex: Encaixe rápido entre horários..."
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEncaixeModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Lançar Encaixe & Abrir Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: NOVA COMANDA MANUAL */}
      {/* ======================================================== */}
      {showManualComandaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Abrir Nova Comanda
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualComandaModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenManualComanda} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-yellow-400 font-bold block uppercase mb-1">
                  Barbeiro Responsável
                </label>
                <select
                  value={manualComandaBarberId}
                  onChange={e => setManualComandaBarberId(e.target.value)}
                  className="w-full bg-black border border-yellow-500/50 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono font-bold"
                  required
                >
                  {activeBarbers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.avatar || '🧔'} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Cliente</label>
                <select
                  value={manualComandaClientId}
                  onChange={e => setManualComandaClientId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                >
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">
                  Serviço Inicial (Opcional)
                </label>
                <select
                  value={manualInitialServiceId}
                  onChange={e => setManualInitialServiceId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="">-- Comanda em branco (adicionar depois) --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {formatCurrency(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualComandaModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Abrir Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: BLOQUEAR HORÁRIO / DIA */}
      {/* ======================================================== */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Bloquear Agenda de Barbeiro
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">
                  Profissional a ser Bloqueado
                </label>
                <select
                  value={blockBarberId}
                  onChange={e => setBlockBarberId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                >
                  <option value="ALL">👥 Todos os Barbeiros Simultaneamente</option>
                  {activeBarbers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.avatar || '🧔'} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Tipo de Bloqueio</label>
                <select
                  value={blockType}
                  onChange={e => setBlockType(e.target.value as any)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="slot">Horário Específico (ex: Almoço, folga pontual)</option>
                  <option value="day">Dia Inteiro (Feriado, folga completa)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Data</label>
                  <input
                    type="date"
                    value={blockDate}
                    onChange={e => setBlockDate(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                {blockType === 'slot' && (
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Horário</label>
                    <input
                      type="time"
                      value={blockTime}
                      onChange={e => setBlockTime(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Confirmar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: CADASTRAR CLIENTE RÁPIDO */}
      {/* ======================================================== */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Cadastrar Novo Cliente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="(DDD) 99999-9999"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Data de Nascimento (Opcional)</label>
                <input
                  type="date"
                  value={clientBirthday}
                  onChange={e => setClientBirthday(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
