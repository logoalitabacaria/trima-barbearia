/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, Star, Check, Award, AlertCircle, Search, UserCheck, ShieldCheck, XCircle, MessageSquare, Gift, Tag, Users, Share2, Copy, Sparkles, Crown, ChevronDown, ChevronLeft, ChevronRight, MapPin, Phone, Instagram, Facebook, MessageCircle, LogIn, ExternalLink, Sun, Moon } from 'lucide-react';
import { User, Service, LoyaltyPlan, Appointment, CustomerSubscription, SystemParameters, NPSFeedback, CustomerBanner } from '../types';
import { buildWhatsAppReminderUrl, formatPortalText } from '../utils/helpers';
import PublicSEOComponent from './PublicSEOComponent';

interface CustomerPanelProps {
  users: User[];
  services: Service[];
  plans: LoyaltyPlan[];
  appointments: Appointment[];
  subscriptions: CustomerSubscription[];
  currentCustomer: User;
  parameters: SystemParameters;
  npsFeedbacks?: NPSFeedback[];
  onUpdateState: (key: string, val: any) => void;
  isGuestMode?: boolean;
  onOpenLoginModal?: () => void;
}

export default function CustomerPanel({
  users,
  services,
  plans,
  appointments,
  subscriptions,
  currentCustomer,
  parameters,
  npsFeedbacks = [],
  onUpdateState,
  isGuestMode = false,
  onOpenLoginModal
}: CustomerPanelProps) {
  const [activeTab, setActiveTab] = useState<'agendar' | 'assinatura' | 'historico'>('agendar');
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('customerPanelTheme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('customerPanelTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleNavigateTab = (tab: 'agendar' | 'assinatura' | 'historico', targetId: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Service Description Expansion State (Down Arrow toggle - Only 1 open at a time)
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const toggleServiceExpand = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedServiceId(prev => prev === serviceId ? null : serviceId);
  };

  // NPS Evaluation State (1 to 5 stars)
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsComment, setNpsComment] = useState('');
  const [npsBarberId, setNpsBarberId] = useState('');
  const [npsSubmitted, setNpsSubmitted] = useState(false);

  // Carousel Slide State
  const [carouselSlideIndex, setCarouselSlideIndex] = useState(0);

  // Collapsible Promos & Referral Section State (Default collapsed to reduce information overload)
  const [showPromosSection, setShowPromosSection] = useState(false);

  const handleSendNPSFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuestMode) {
      if (onOpenLoginModal) onOpenLoginModal();
      else alert('Por favor, faça login ou cadastre-se para enviar uma avaliação.');
      return;
    }

    if (npsScore === null) {
      alert('Por favor, escolha uma nota de 1 a 5 para enviar sua avaliação.');
      return;
    }

    const barberObj = users.find(u => u.id === npsBarberId);

    const newFeedback: NPSFeedback = {
      id: `nps-${Date.now()}`,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      score: npsScore,
      comment: npsComment.trim() || undefined,
      barberId: npsBarberId || undefined,
      barberName: barberObj ? barberObj.name : undefined,
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    onUpdateState('npsFeedbacks', [...npsFeedbacks, newFeedback]);
    setNpsSubmitted(true);
    alert('Agradecemos muito por sua avaliação! Sua opinião ajuda a aprimorar nossos serviços.');
  };

  // Search filter for services
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');

  // New Booking State
  const barbers = users.filter(u => u.role === 'BARBER' && u.isActive);
  const [bookingServiceId, setBookingServiceId] = useState(services[0]?.id || '');
  const [bookingBarberId, setBookingBarberId] = useState(barbers[0]?.id || '');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    const padDay = today.getDate().toString().padStart(2, '0');
    const padMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${today.getFullYear()}-${padMonth}-${padDay}`;
  });
  const [bookingTime, setBookingTime] = useState('');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const activeSubscription = subscriptions.find(
    s => s.customerId === currentCustomer.id && s.isActive
  );
  const activeSubscribedPlan = activeSubscription
    ? plans.find(p => p.id === activeSubscription.planId)
    : null;

  const [useSubscriptionForBooking, setUseSubscriptionForBooking] = useState<boolean>(true);

  // Subscription Builder State
  const [selectedServiceQuantities, setSelectedServiceQuantities] = useState<Record<string, number>>({});

  const handleAdjustServiceQuantity = (srvId: string, delta: number) => {
    setSelectedServiceQuantities(prev => {
      const current = prev[srvId] || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [srvId]: next
      };
    });
  };

  const totalQuantity: number = (Object.values(selectedServiceQuantities) as number[]).reduce((acc: number, q: number) => acc + q, 0);
  const rawTotalCost: number = services.reduce((acc: number, s: Service) => acc + (s.price * ((selectedServiceQuantities[s.id] as number) || 0)), 0);

  const getDiscountPercentage = (count: number): number => {
    if (count < 2) return 0;
    if (count === 2) return parameters.subDiscount2 ?? 0.05;
    if (count >= 3 && count <= 4) return parameters.subDiscount3to4 ?? 0.12;
    if (count >= 5 && count <= 6) return parameters.subDiscount5to6 ?? 0.20;
    return parameters.subDiscount7Plus ?? 0.28;
  };

  const discountPct: number = getDiscountPercentage(totalQuantity);
  const discountAmount: number = rawTotalCost * discountPct;
  const finalMonthlyCost: number = rawTotalCost - discountAmount;

  const handleCreateCustomSubscription = () => {
    if (isGuestMode) {
      if (onOpenLoginModal) onOpenLoginModal();
      else alert('Por favor, faça login ou crie sua conta para assinar o Clube VIP.');
      return;
    }

    if (totalQuantity === 0) {
      alert('Por favor, adicione pelo menos 1 serviço para assinar.');
      return;
    }

    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 30);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const selectedServiceIds: string[] = [];
    Object.entries(selectedServiceQuantities).forEach(([srvId, qty]) => {
      for (let i = 0; i < (qty as number); i++) {
        selectedServiceIds.push(srvId);
      }
    });

    const newSubscription: CustomerSubscription = {
      id: `sub-${Date.now()}`,
      customerId: currentCustomer.id,
      planId: 'custom',
      startDate: formatDate(today),
      endDate: formatDate(end),
      servicesRemaining: totalQuantity,
      isActive: true,
      selectedServiceIds,
      totalPriceMonthly: finalMonthlyCost,
      discountPercentage: discountPct
    };

    onUpdateState('subscriptions', [...subscriptions, newSubscription]);
    alert(`Parabéns! Sua assinatura mensal personalizada foi criada com sucesso!`);
    setSelectedServiceQuantities({});
  };

  const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const generateAvailableSlots = (dateString: string, barberId: string) => {
    const open = parameters?.openTime || "08:00";
    const close = parameters?.closeTime || "20:00";
    const slots: string[] = [];
    try {
      const [startH, startM] = open.split(':').map(Number);
      const [endH, endM] = close.split(':').map(Number);
      let currentMin = (isNaN(startH) ? 8 : startH) * 60 + (isNaN(startM) ? 0 : startM);
      const endMin = (isNaN(endH) ? 20 : endH) * 60 + (isNaN(endM) ? 0 : endM);
      const step = 30;

      while (currentMin < endMin) {
        const h = Math.floor(currentMin / 60);
        const m = currentMin % 60;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        slots.push(timeStr);
        currentMin += step;
      }
    } catch (err) {
      console.error("Error generating slots", err);
    }
    return slots;
  };

  const isSlotBooked = (date: string, time: string, barberId: string) => {
    return appointments.some(
      apt =>
        apt.date === date &&
        (barberId ? apt.barberId === barberId : true) &&
        apt.status !== 'CANCELLED' &&
        (apt.time === time || apt.serviceId === 'BLOCKED_FULL_DAY')
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: { dayNum: number | null; dateString: string | null }[] = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateString: null });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const padDay = d.toString().padStart(2, '0');
      const padMonth = (month + 1).toString().padStart(2, '0');
      const dateString = `${year}-${padMonth}-${padDay}`;
      days.push({ dayNum: d, dateString });
    }
    
    return days;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuestMode) {
      if (onOpenLoginModal) onOpenLoginModal();
      else alert('Por favor, faça login ou cadastre-se para concluir seu agendamento.');
      return;
    }

    const selectedService = services.find(s => s.id === bookingServiceId);
    const selectedBarber = barbers.find(b => b.id === bookingBarberId);

    if (!selectedService || !selectedBarber) {
      alert('Por favor, selecione um profissional e serviço válidos.');
      return;
    }

    if (!bookingTime) {
      alert('Por favor, selecione um horário de atendimento disponível na lista.');
      return;
    }

    if (isSlotBooked(bookingDate, bookingTime, selectedBarber.id)) {
      alert('Desculpe, este horário já está reservado. Por favor, escolha outro horário livre.');
      return;
    }

    let isSub = false;
    if (useSubscriptionForBooking && activeSubscription && activeSubscription.servicesRemaining > 0) {
      // Validate specific services included in customer's package
      if (activeSubscription.selectedServiceIds && activeSubscription.selectedServiceIds.length > 0) {
        const totalAllowedForService = activeSubscription.selectedServiceIds.filter(id => id === selectedService.id).length;
        const usedCountForService = myAppointments.filter(
          a => a.isSubscriptionUse && a.subscriptionId === activeSubscription.id && a.serviceId === selectedService.id && a.status !== 'CANCELLED'
        ).length;
        const remForService = totalAllowedForService - usedCountForService;

        if (totalAllowedForService === 0) {
          alert(`O serviço "${selectedService.name}" não faz parte do seu pacote de assinatura VIP. Desmarque a opção "Agendar via Assinatura" para agendar com pagamento avulso.`);
          return;
        }

        if (remForService <= 0) {
          alert(`Você já utilizou todas as ${totalAllowedForService} cotas do serviço "${selectedService.name}" do seu pacote este mês.`);
          return;
        }
      }
      isSub = true;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: bookingDate,
      time: bookingTime,
      status: 'SCHEDULED',
      isSubscriptionUse: isSub,
      subscriptionId: isSub ? activeSubscription.id : undefined,
      notes: isSub
        ? `[ASSINATURA] Agendamento do Clube VIP - ${selectedService.name}`
        : undefined
    };

    onUpdateState('appointments', [...appointments, newAppointment]);

    if (isSub && activeSubscription) {
      const updatedSubscriptions = subscriptions.map(s => {
        if (s.id === activeSubscription.id) {
          const newRem = Math.max(0, s.servicesRemaining - 1);
          return {
            ...s,
            servicesRemaining: newRem
          };
        }
        return s;
      });
      onUpdateState('subscriptions', updatedSubscriptions);
      alert(`Agendamento do serviço "${selectedService.name}" efetuado com sucesso via Assinatura VIP na cadeira de ${selectedBarber.name}!`);
    } else {
      alert(`Seu agendamento foi efetuado com sucesso na cadeira de ${selectedBarber.name}!`);
    }
    setBookingTime('');
    setBookingStep(1);
    handleNavigateTab('historico', 'secao-reservas');
  };

  const handleCancelMyAppointment = (aptId: string) => {
    const reason = prompt('Informe o motivo do cancelamento (opcional):');
    const updated = appointments.map(a => {
      if (a.id === aptId) {
        return {
          ...a,
          status: 'CANCELLED' as const,
          cancellationReason: reason ? reason.trim() : 'Cancelado pelo cliente na área logada',
          cancelledAt: new Date().toISOString(),
          cancelledBy: currentCustomer.name
        };
      }
      return a;
    });
    onUpdateState('appointments', updated);
    alert('Seu agendamento foi cancelado.');
  };

  const handleCancelMySubscription = () => {
    if (!confirm('Deseja realmente cancelar sua assinatura? Você perderá os serviços acumulados.')) return;
    onUpdateState(
      'subscriptions',
      subscriptions.map(s => s.customerId === currentCustomer.id ? { ...s, isActive: false } : s)
    );
    alert('Sua assinatura foi desativada.');
  };

  const myAppointments = appointments.filter(a => a.customerId === currentCustomer.id);

  // Filtered Services based on search & category
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || (s.description && s.description.toLowerCase().includes(serviceSearch.toLowerCase()));
    const matchesCategory = selectedCategory === 'TODOS' || (s.category || 'Outros') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = ['TODOS', ...Array.from(new Set(services.map(s => s.category || 'Outros')))];

  return (
    <div className={`space-y-5 text-left max-w-3xl mx-auto font-sans p-3 sm:p-5 pb-24 rounded-3xl shadow-sm border transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-200/80'
    }`}>
      
      {/* GUEST BANNER NOTIFICATION */}
      {isGuestMode && (
        <div className="bg-amber-500 text-slate-950 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 font-mono shadow-md border border-amber-400">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>👋 Você está no modo visitante. Navegue pelos nossos serviços e agende seu horário com facilidade!</span>
          </div>
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 text-[10px] font-bold uppercase rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" /> Entrar / Cadastrar
          </button>
        </div>
      )}

      {/* Top Banner Greeting - Clean High Contrast Light/Dark Design */}
      <div className={`p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'
      }`}>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold font-mono uppercase rounded-md">
              {formatPortalText(parameters.customerPortalHeaderTitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address) || 'Portal do Cliente'}
            </span>
            {/* DISCREET LIGHT/DARK MODE TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Alternar entre modo claro e modo escuro"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {parameters.customerPortalWelcomeTitle ? (
              <span>{formatPortalText(parameters.customerPortalWelcomeTitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}</span>
            ) : (
              <>Olá, <span className="text-amber-600">{currentCustomer.name}</span></>
            )}
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {formatPortalText(parameters.customerPortalWelcomeText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address) || 'Escolha seu barbeiro de preferência e agende seu horário com total facilidade.'}
          </p>

          {/* EDITABLE SCHEDULING INFO TEXT */}
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
            isDarkMode ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {parameters.customerPortalSchedulingInfoText ? (
                formatPortalText(parameters.customerPortalSchedulingInfoText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)
              ) : (
                'Atendimento com agendamento online 24h ou por ordem de chegada no balcão.'
              )}
            </span>
          </div>
        </div>

        {activeSubscription ? (
          <div className={`p-3 px-5 rounded-xl font-mono text-xs border shrink-0 ${
            isDarkMode ? 'bg-amber-950/40 border-amber-800/80 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <span className={`block text-[9px] uppercase font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Plano Ativo</span>
            <span className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeSubscribedPlan?.name || 'Assinatura VIP'}</span>
            <span className={`block text-[11px] font-semibold mt-0.5 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Cortes Restantes: <strong>{activeSubscription.servicesRemaining}</strong>
            </span>
          </div>
        ) : (
          <div className={`p-3.5 rounded-xl text-xs shrink-0 max-w-xs border ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            {formatPortalText(parameters.customerPortalClubBannerText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address) || '✨ Seja um assinante do clube e economize até 28% no seu visual mensal!'}
          </div>
        )}
      </div>

      {/* BANNERS PROMOCIONAIS CONFIGURADOS PELO ADMINISTRADOR (CARROSSEL & FIXOS) */}
      {parameters.customerPortalBanners && parameters.customerPortalBanners.filter(b => b.isActive).length > 0 && (() => {
        const activeBanners = parameters.customerPortalBanners.filter(b => b.isActive);
        const carouselBanners = activeBanners.filter(b => b.displayMode === 'CAROUSEL' || !b.displayMode);
        const staticBanners = activeBanners.filter(b => b.displayMode === 'STATIC');

        return (
          <div className="space-y-4">
            {/* 🎠 BANNER CARROSSEL ROTATIVO RESPONSIVO */}
            {carouselBanners.length > 0 && (() => {
              const currentSlide = carouselBanners[carouselSlideIndex % carouselBanners.length] || carouselBanners[0];
              const bgImg = currentSlide.imageUrl || '';
              const mobileBgImg = currentSlide.mobileImageUrl || bgImg;

              return (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 text-white min-h-[160px] sm:min-h-[200px] flex items-end p-5 sm:p-6 group transition-all duration-500">
                  {/* Background images for Responsive PC vs Mobile */}
                  <picture className="absolute inset-0 w-full h-full">
                    {currentSlide.mobileImageUrl && (
                      <source media="(max-width: 639px)" srcSet={mobileBgImg} />
                    )}
                    <img
                      src={bgImg}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Banner Content */}
                  <div className="relative z-10 space-y-1 max-w-xl text-left">
                    {currentSlide.badgeText && (
                      <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black font-mono text-[9px] uppercase rounded tracking-wider mb-1">
                        {formatPortalText(currentSlide.badgeText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
                      </span>
                    )}
                    <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                      {formatPortalText(currentSlide.title, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
                    </h3>
                    {currentSlide.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        {formatPortalText(currentSlide.subtitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
                      </p>
                    )}
                  </div>

                  {/* Carousel Nav Arrows */}
                  {carouselBanners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCarouselSlideIndex(prev => (prev - 1 + carouselBanners.length) % carouselBanners.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Banner Anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCarouselSlideIndex(prev => (prev + 1) % carouselBanners.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Próximo Banner"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Carousel Dots Indicator */}
                      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-full backdrop-blur-xs">
                        {carouselBanners.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCarouselSlideIndex(idx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              (carouselSlideIndex % carouselBanners.length) === idx ? 'bg-amber-400 w-5' : 'bg-white/50 w-2 hover:bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* 📌 BANNERS ESTÁTICOS / FIXOS */}
            {staticBanners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staticBanners.map(banner => (
                  <div
                    key={banner.id}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 text-white min-h-[140px] flex items-end p-5 bg-cover bg-center group"
                    style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.3) 100%), url(${banner.imageUrl})` }}
                  >
                    <div className="relative z-10 space-y-1">
                      {banner.badgeText && (
                        <span className="inline-block px-2 py-0.5 bg-amber-500 text-slate-950 font-bold font-mono text-[9px] uppercase rounded tracking-wider mb-1">
                          {formatPortalText(banner.badgeText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
                        </span>
                      )}
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        {formatPortalText(banner.title, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          {formatPortalText(banner.subtitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* BLUCO COMPACTO COLLAPSÍVEL DE VANTAGENS, PROMOÇÕES E FIDELIDADE */}
      {(parameters.enableReferralProgram !== false || (parameters.enablePromotions !== false && parameters.promotions && parameters.promotions.some(p => p.isActive)) || parameters.enableLoyalty !== false) && (
        <div className={`rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
          <button
            type="button"
            onClick={() => setShowPromosSection(prev => !prev)}
            className="w-full p-3.5 px-4 flex items-center justify-between text-xs font-mono font-bold cursor-pointer transition rounded-2xl hover:bg-slate-500/5"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className={isDarkMode ? 'text-amber-400' : 'text-slate-900'}>
                🎁 Vantagens, Cupons & Programa de Fidelidade
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                {showPromosSection ? 'Recolher' : 'Ver Ofertas'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPromosSection ? 'rotate-180 text-amber-500' : 'text-slate-400'}`} />
            </div>
          </button>

          {showPromosSection && (
            <div className="p-4 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800/80">
              {/* PROGRAMA DE INDICAÇÃO - INDIQUE E GANHE */}
              {parameters.enableReferralProgram !== false && (
                <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-xs font-extrabold uppercase font-mono tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {parameters.referralTitle ? (
                          formatPortalText(parameters.referralTitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)
                        ) : (
                          'Indique um Amigo e Ganhe Desconto'
                        )}
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold font-mono uppercase rounded">
                        Ganhe R$ {(parameters.referralDiscountReferrer ?? 10).toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {parameters.referralDescription ? (
                        formatPortalText(parameters.referralDescription, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)
                      ) : (
                        <>Ao indicar um amigo, você ganha <strong>R$ {(parameters.referralDiscountReferrer ?? 10).toFixed(2)}</strong> e seu amigo ganha <strong>R$ {(parameters.referralDiscountReferred ?? 10).toFixed(2)}</strong>!</>
                      )}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-lg flex items-center gap-2 font-mono text-xs shrink-0 w-full sm:w-auto justify-between border ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-amber-200'
                  }`}>
                    <div>
                      <span className={`text-[8px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Seu Código:</span>
                      <span className={`font-extrabold text-xs tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {currentCustomer.referralCode || currentCustomer.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const code = currentCustomer.referralCode || currentCustomer.id.slice(0, 8).toUpperCase();
                        navigator.clipboard.writeText(code);
                        alert(`Código de indicação ${code} copiado para a área de transferência! Compartilhe com seus amigos.`);
                      }}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] rounded-md flex items-center gap-1 cursor-pointer transition"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* PROMOÇÕES ATIVAS DA BARBEARIA */}
              {parameters.enablePromotions !== false && parameters.promotions && parameters.promotions.filter(p => p.isActive).length > 0 && (
                <div className={`p-4 rounded-xl space-y-2 border ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center gap-1.5 border-b pb-1.5 dark:border-slate-700/60 border-slate-200">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Cupons Especiais Ativos
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parameters.promotions.filter(p => p.isActive).map(promo => (
                      <div key={promo.id} className={`border rounded-lg p-2.5 text-left space-y-1 relative ${
                        isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded uppercase border ${
                            isDarkMode ? 'bg-amber-950/80 border-amber-800 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-800'
                          }`}>
                            CUPOM: {promo.code}
                          </span>
                          <span className="text-xs font-extrabold text-amber-500 font-mono">
                            {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `R$ ${promo.discountValue.toFixed(2)} OFF`}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{promo.title}</h4>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{promo.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROGRAMA DE FIDELIDADE */}
              {parameters.enableLoyalty !== false && (() => {
                const points = currentCustomer.loyaltyPoints || 0;
                const minToRedeem = parameters.loyaltyMinPointsRedeem || 100;
                const rewardVal = parameters.loyaltyRewardValue || 15;
                const progressPct = Math.min(100, Math.round((points / minToRedeem) * 100));
                const canRedeem = points >= minToRedeem;

                return (
                  <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
                    isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-900'}`}>
                            🏆 Programa Fidelidade
                          </h3>
                          {canRedeem && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-bold uppercase rounded font-mono">
                              Prêmio Disponível!
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Você tem <strong className="text-amber-500 font-mono">{points} pts</strong>.
                          {canRedeem
                            ? ` 🎉 Resgate R$ ${rewardVal},00 de desconto no caixa!`
                            : ` Faltam ${minToRedeem - points} pts para liberar R$ ${rewardVal},00.`}
                        </p>
                      </div>
                    </div>

                    <div className={`w-full sm:w-48 shrink-0 p-2.5 rounded-lg border ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <div className={`flex justify-between text-[9px] font-mono font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span>Progresso</span>
                        <span>{points} / {minToRedeem} pts</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className={`flex flex-wrap gap-2 p-1.5 rounded-xl border ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/60 border-slate-300/80'
      }`}>
        <button
          onClick={() => setActiveTab('agendar')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-lg text-xs font-bold font-mono uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'agendar'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
              : isDarkMode
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. Agendar Atendimento</span>
        </button>
        <button
          onClick={() => setActiveTab('assinatura')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-lg text-xs font-bold font-mono uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'assinatura'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
              : isDarkMode
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Clube de Assinatura</span>
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-lg text-xs font-bold font-mono uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'historico'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
              : isDarkMode
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Minhas Reservas ({myAppointments.length})</span>
        </button>
      </div>

      {/* TAB 1: INTUITIVE 3-STEP BOOKING FLOW */}
      {activeTab === 'agendar' && (
        <div id="secao-agendamento" className="space-y-6">
          {parameters.customerPortalAgendarSubtitle && (
            <div className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs border ${
              isDarkMode ? 'bg-amber-950/40 border-amber-800/80 text-amber-200' : 'bg-amber-50 border-amber-200/80 text-slate-800'
            }`}>
              <Scissors className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{formatPortalText(parameters.customerPortalAgendarSubtitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}</span>
            </div>
          )}
          {activeSubscription && activeSubscription.servicesRemaining > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-400 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm text-left">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-mono text-[10px] font-black uppercase rounded-md shadow-sm">
                    🌟 Assinatura Ativa Detectada
                  </span>
                  <span className={`text-xs font-black font-mono ${isDarkMode ? 'text-amber-300' : 'text-slate-900'}`}>
                    {activeSubscribedPlan?.name || 'Plano de Assinatura VIP'}
                  </span>
                </div>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Seu agendamento será vinculado à sua assinatura e utilizará seus créditos do pacote mensal!
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-amber-950 font-extrabold flex-wrap pt-1">
                  <span className="bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl text-slate-900">
                    ✂️ Serviços Restantes no Mês: <strong className="text-amber-800 text-sm">{activeSubscription.servicesRemaining} corte(s)</strong>
                  </span>
                  {activeSubscription.selectedServiceIds && activeSubscription.selectedServiceIds.length > 0 && (
                    <span className={`font-normal text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      (Serviços do pacote: {Array.from(new Set(activeSubscription.selectedServiceIds)).map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')})
                    </span>
                  )}
                </div>
              </div>

              <label className={`flex items-center gap-3 border border-amber-400 p-3 px-4 rounded-xl cursor-pointer shadow-sm transition shrink-0 select-none ${
                isDarkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-amber-50'
              }`}>
                <input
                  type="checkbox"
                  checked={useSubscriptionForBooking}
                  onChange={e => setUseSubscriptionForBooking(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <div className="text-left">
                  <span className={`text-xs font-extrabold block leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Agendar via Assinatura</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block">Utilizar crédito do mês</span>
                </div>
              </label>
            </div>
          )}

          {/* WIZARD STEP INDICATOR BAR */}
          <div className={`p-2.5 sm:p-3 rounded-2xl border shadow-xs flex items-center justify-between gap-2 sm:gap-3 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
          }`}>
            <button
              type="button"
              onClick={() => {
                setBookingStep(1);
                document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                bookingStep === 1
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-[1.02]'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
              <span className="truncate">1. Serviço</span>
            </button>

            <span className="text-slate-400 font-bold shrink-0">➔</span>

            <button
              type="button"
              onClick={() => {
                if (bookingServiceId) {
                  setBookingStep(2);
                  document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              disabled={!bookingServiceId}
              className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                bookingStep === 2
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-[1.02]'
                  : bookingServiceId
                  ? isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
              <span className="truncate">2. Profissional</span>
            </button>

            <span className="text-slate-400 font-bold shrink-0">➔</span>

            <button
              type="button"
              onClick={() => {
                if (bookingServiceId && bookingBarberId) {
                  setBookingStep(3);
                  document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              disabled={!bookingServiceId || !bookingBarberId}
              className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                bookingStep === 3
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-[1.02]'
                  : bookingServiceId && bookingBarberId
                  ? isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
              <span className="truncate">3. Data e Horário</span>
            </button>
          </div>

          {/* STEP 1: SELECT SERVICE */}
          {bookingStep === 1 && (
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 shadow-sm ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Etapa 1 de 3</span>
                  <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-amber-500" />
                    Selecione o Serviço Desejado
                  </h3>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar serviço por nome..."
                    value={serviceSearch}
                    onChange={e => setServiceSearch(e.target.value)}
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-mono scrollbar-none">
                  {categoriesList.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg uppercase whitespace-nowrap transition cursor-pointer font-bold ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'HAIR' ? 'Cabelo' : cat === 'BEARD' ? 'Barba' : cat === 'COMBO' ? 'Combos' : cat === 'TREATMENT' ? 'Tratamentos' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredServices.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center col-span-2">Nenhum serviço encontrado para este filtro.</p>
                ) : (
                  filteredServices.map(s => {
                    const totalInPkg = activeSubscription?.selectedServiceIds
                      ? activeSubscription.selectedServiceIds.filter(id => id === s.id).length
                      : 0;
                    const usedInPkg = myAppointments.filter(
                      a => a.isSubscriptionUse && a.subscriptionId === activeSubscription?.id && a.serviceId === s.id && a.status !== 'CANCELLED'
                    ).length;
                    const remInPkg = Math.max(0, totalInPkg - usedInPkg);
                    const hasPkgServices = activeSubscription?.selectedServiceIds && activeSubscription.selectedServiceIds.length > 0;
                    const isSelected = bookingServiceId === s.id;

                    return (
                      <label
                        key={s.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? isDarkMode ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm' : 'bg-amber-50/90 border-amber-500 text-slate-900 shadow-sm'
                            : isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="serviceRadio"
                          checked={isSelected}
                          onChange={() => setBookingServiceId(s.id)}
                          className="mt-1 accent-amber-500 cursor-pointer"
                        />
                        <div className="text-left select-none flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className={`font-bold text-xs leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                              {s.description && (
                                <button
                                  type="button"
                                  onClick={(e) => toggleServiceExpand(s.id, e)}
                                  className="p-1 text-slate-400 hover:text-amber-500 transition rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-0.5 text-[9px] font-mono"
                                  title={expandedServiceId === s.id ? 'Ocultar descrição' : 'Ver descrição completa'}
                                >
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedServiceId === s.id ? 'rotate-180 text-amber-500' : ''}`} />
                                </button>
                              )}
                            </div>
                            {hasPkgServices && useSubscriptionForBooking && (
                              totalInPkg > 0 ? (
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  remInPkg > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  ✨ Pacote: {remInPkg}/{totalInPkg} rest.
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shrink-0">
                                  Avulso
                                </span>
                              )
                            )}
                          </div>

                          {/* Service Description - Toggleable */}
                          {s.description && expandedServiceId === s.id && (
                            <p className={`text-[11px] mt-2 p-2.5 rounded-xl border leading-relaxed font-sans ${
                              isDarkMode ? 'bg-slate-950/80 border-slate-700 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-600'
                            }`}>
                              {s.description}
                            </p>
                          )}

                          <div className="flex gap-2 items-center mt-2">
                            <span className="text-xs text-amber-700 dark:text-amber-400 font-mono font-bold bg-amber-100/80 dark:bg-amber-950 px-2 py-0.5 rounded">
                              {formatCurrency(s.price)}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">⏱️ {s.durationMinutes} min</span>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Action Button Step 1 */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  disabled={!bookingServiceId}
                  onClick={() => {
                    setBookingStep(2);
                    document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                    bookingServiceId
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md scale-[1.01]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Avançar para Escolher Profissional</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT BARBER */}
          {bookingStep === 2 && (
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 shadow-sm ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Etapa 2 de 3</span>
                  <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    Escolha o Profissional (Barbeiro)
                  </h3>
                </div>
              </div>

              {/* Selected Service Summary */}
              {(() => {
                const selectedService = services.find(s => s.id === bookingServiceId);
                return (
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono font-bold ${
                    isDarkMode ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-500" />
                      <span>Serviço Selecionado: <strong>{selectedService?.name}</strong> ({formatCurrency(selectedService?.price || 0)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-[10px] underline hover:text-amber-500 cursor-pointer"
                    >
                      Alterar
                    </button>
                  </div>
                );
              })()}

              {/* Barbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {barbers.map(b => (
                  <label
                    key={b.id}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                      bookingBarberId === b.id
                        ? isDarkMode ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm' : 'bg-amber-50/90 border-amber-500 text-slate-900 shadow-sm'
                        : isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="barberRadio"
                          checked={bookingBarberId === b.id}
                          onChange={() => setBookingBarberId(b.id)}
                          className="accent-amber-500 cursor-pointer"
                        />
                        {b.photoUrl ? (
                          <img src={b.photoUrl} alt={b.name} className="h-10 w-10 object-cover rounded-xl border border-slate-200" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 border border-amber-200 text-slate-900 rounded-xl flex items-center justify-center text-xl font-bold">
                            {b.avatar || '🧔'}
                          </div>
                        )}
                        <div className="text-left select-none">
                          <h4 className={`font-extrabold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.name}</h4>
                          <span className="text-[9px] uppercase font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            Barbeiro Profissional
                          </span>
                        </div>
                      </div>
                      {bookingBarberId === b.id && (
                        <Check className="w-5 h-5 text-amber-500 font-bold" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Action Buttons Step 2 */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(1);
                    document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>← Voltar para Serviço</span>
                </button>

                <button
                  type="button"
                  disabled={!bookingBarberId}
                  onClick={() => {
                    setBookingStep(3);
                    document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                    bookingBarberId
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md scale-[1.01]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Avançar para Escolher Data e Horário</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE & TIME + CONFIRMATION */}
          {bookingStep === 3 && (
            <form onSubmit={handleConfirmBooking} className={`p-5 sm:p-6 rounded-2xl border space-y-5 shadow-sm ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Etapa 3 de 3</span>
                  <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Escolha a Data e o Horário Desejado
                  </h3>
                </div>
              </div>

              {/* Summary of Steps 1 & 2 */}
              {(() => {
                const selectedService = services.find(s => s.id === bookingServiceId);
                const selectedBarber = barbers.find(b => b.id === bookingBarberId);
                return (
                  <div className={`p-3.5 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono ${
                    isDarkMode ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>✂️ Serviço: <strong>{selectedService?.name}</strong> ({formatCurrency(selectedService?.price || 0)})</span>
                      <button type="button" onClick={() => setBookingStep(1)} className="text-[10px] underline hover:text-amber-500 cursor-pointer">Alterar</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🧔 Profissional: <strong>{selectedBarber?.name}</strong></span>
                      <button type="button" onClick={() => setBookingStep(2)} className="text-[10px] underline hover:text-amber-500 cursor-pointer">Alterar</button>
                    </div>
                  </div>
                );
              })()}

              {/* Date and Time Selectors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Date Picker & Month Calendar */}
                <div className="space-y-3">
                  <div className={`flex justify-between items-center gap-2 p-3 rounded-xl border ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                      Data do Agendamento:
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          setBookingDate(e.target.value);
                          setBookingTime('');
                        }
                      }}
                      className={`border rounded-lg py-1 px-2 text-xs font-mono font-bold outline-none focus:border-amber-500 cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  {/* Calendar Grid */}
                  <div className={`p-3 rounded-2xl border space-y-2 ${
                    isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200/90'
                  }`}>
                    <div className="flex justify-between items-center text-xs font-bold uppercase font-mono">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className={`p-1 px-2 border rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        &larr;
                      </button>
                      <span className="text-slate-900 dark:text-white text-xs font-extrabold">
                        {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className={`p-1 px-2 border rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-slate-500 dark:text-slate-400 font-mono font-bold border-b border-slate-200 dark:border-slate-700 pb-1">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                        <span key={idx}>{day}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {getCalendarDays().map((dayCell, idx) => {
                        if (dayCell.dayNum === null || !dayCell.dateString) {
                          return <div key={idx} />;
                        }

                        const isSelected = bookingDate === dayCell.dateString;
                        const parsedCellDate = new Date(dayCell.dateString + 'T23:59:59');
                        const todayBoundary = new Date();
                        todayBoundary.setHours(0, 0, 0, 0);
                        const isPast = parsedCellDate < todayBoundary;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              if (dayCell.dateString) {
                                setBookingDate(dayCell.dateString);
                                setBookingTime('');
                              }
                            }}
                            className={`h-7 w-full text-[10px] rounded transition-all font-mono font-bold flex items-center justify-center ${
                              isPast
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-transparent'
                                : isSelected
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                  : isDarkMode
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer'
                                    : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer'
                            }`}
                          >
                            {dayCell.dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Available Time Slots Grid & Final Booking Box */}
                <div className="space-y-4">
                  <div className={`p-3.5 rounded-2xl border space-y-2 ${
                    isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200/90'
                  }`}>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-mono uppercase font-bold text-slate-800 dark:text-slate-200">
                        Horários Disponíveis ({bookingDate.split('-').reverse().join('/')}):
                      </label>
                      {bookingTime && (
                        <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          {bookingTime}
                        </span>
                      )}
                    </div>

                    {(() => {
                      const slots = generateAvailableSlots(bookingDate, bookingBarberId);
                      if (slots.length === 0) {
                        return (
                          <p className="text-xs text-slate-400 italic font-mono bg-white dark:bg-slate-900 p-3 text-center rounded-xl border border-slate-200/60 dark:border-slate-800">
                            Nenhum horário comercial configurado para este dia.
                          </p>
                        );
                      }

                      return (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                          {slots.map(slot => {
                            const isBooked = isSlotBooked(bookingDate, slot, bookingBarberId);
                            const isSelected = bookingTime === slot;

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setBookingTime(slot)}
                                className={`py-2 px-1 text-xs font-mono rounded-xl border transition-all text-center font-bold ${
                                  isBooked
                                    ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs scale-105 font-black'
                                      : isDarkMode
                                        ? 'bg-slate-800 border-slate-700 hover:border-amber-400 hover:bg-slate-700 text-slate-200 cursor-pointer'
                                        : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-800 cursor-pointer shadow-2xs'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Booking Confirmation Box */}
                  {(() => {
                    const selectedService = services.find(s => s.id === bookingServiceId);
                    const selectedBarber = barbers.find(b => b.id === bookingBarberId);
                    return (
                      <div className={`p-4 rounded-2xl border space-y-2 text-xs font-mono ${
                        isDarkMode ? 'bg-slate-800/90 border-slate-700 text-slate-200' : 'bg-amber-50/60 border-amber-200 text-slate-800'
                      }`}>
                        <h4 className="font-bold uppercase text-[11px] text-amber-600 dark:text-amber-400 border-b border-amber-200/50 dark:border-slate-700 pb-1">Resumo do Agendamento:</h4>
                        <div className="space-y-1 text-[11px]">
                          <p>✂️ <strong>Serviço:</strong> {selectedService?.name || '-'}</p>
                          <p>🧔 <strong>Profissional:</strong> {selectedBarber?.name || '-'}</p>
                          <p>📅 <strong>Data:</strong> {bookingDate ? bookingDate.split('-').reverse().join('/') : '-'}</p>
                          <p>⏰ <strong>Horário:</strong> {bookingTime || 'Não selecionado'}</p>
                          <p className="pt-1 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                            💰 Valor: {selectedService ? formatCurrency(selectedService.price) : '-'}
                            {useSubscriptionForBooking && activeSubscription && activeSubscription.servicesRemaining > 0 ? ' (Cobrado no Pacote VIP)' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons Step 3 */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(2);
                    document.getElementById('secao-agendamento')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>← Voltar para Profissional</span>
                </button>

                <button
                  type="submit"
                  disabled={!bookingTime}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                    bookingTime
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 scale-[1.02]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>✨ Confirmar Agendamento</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: SUBSCRIPTIONS & CLUB BENEFITS */}
      {activeTab === 'assinatura' && (
        <div id="secao-clube-vip" className="space-y-6">
          <div className={`p-6 rounded-2xl text-left space-y-2 shadow-sm border ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'
          }`}>
            <h3 className="text-base font-extrabold text-amber-500 font-mono flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Clube de Assinatura Recorrente & Descontos
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Monte seu plano mensal sob medida. Quanto mais serviços adicionar ao seu pacote, maior é o desconto automático concedido!
            </p>
          </div>

          {activeSubscription ? (
            <div className={`p-6 rounded-2xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm border-2 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/80 text-slate-100' : 'bg-amber-50 border-amber-400 text-slate-900'
            }`}>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1 px-3 bg-amber-500 text-slate-950 text-xs font-black font-mono rounded-lg">
                    Assinante VIP Ativo
                  </span>
                  <span className={`text-xs font-mono font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Validade: {activeSubscription.startDate} até {activeSubscription.endDate}
                  </span>
                </div>
                
                <h4 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeSubscribedPlan?.name || 'Sua Assinatura Personalizada'}
                </h4>

                <p className={`text-xs font-mono font-extrabold p-2.5 rounded-xl inline-block border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-900'
                }`}>
                  Atendimentos restantes para este ciclo: {activeSubscription.servicesRemaining} cortes
                </p>
              </div>

              <button
                onClick={handleCancelMySubscription}
                className="p-2.5 px-4 text-xs font-mono font-bold uppercase bg-red-100 border border-red-200 text-red-700 hover:bg-red-200 rounded-xl transition cursor-pointer"
              >
                Cancelar Assinatura
              </button>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl space-y-6 shadow-sm border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  🛠️ Monte Seu Pacote Mensal de Cortes & Barba
                </h4>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Selecione quais serviços você deseja receber ao longo do mês:
                </p>
              </div>

              {/* Tabela de Descontos Progressivos */}
              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-amber-500 uppercase font-mono font-extrabold block mb-2">Tabela de Descontos do Clube:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className={`p-2.5 border rounded-lg ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>2 Serviços</span>
                    <span className="text-sm font-black text-amber-500">{Math.round((parameters.subDiscount2 ?? 0.05) * 100)}% OFF</span>
                  </div>
                  <div className={`p-2.5 border rounded-lg ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>3 a 4 Serviços</span>
                    <span className="text-sm font-black text-amber-500">{Math.round((parameters.subDiscount3to4 ?? 0.12) * 100)}% OFF</span>
                  </div>
                  <div className={`p-2.5 border rounded-lg ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>5 a 6 Serviços</span>
                    <span className="text-sm font-black text-amber-500">{Math.round((parameters.subDiscount5to6 ?? 0.20) * 100)}% OFF</span>
                  </div>
                  <div className={`p-2.5 border rounded-lg ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>7+ Serviços</span>
                    <span className="text-sm font-black text-amber-500">{Math.round((parameters.subDiscount7Plus ?? 0.28) * 100)}% OFF</span>
                  </div>
                </div>
              </div>

              {/* Seleção de Serviços por Categoria */}
              <div className="space-y-4">
                {categoriesList.filter(c => c !== 'TODOS').map(cat => {
                  const catServices = services.filter(s => (s.category || 'Outros') === cat);
                  if (catServices.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <h5 className={`text-[11px] font-extrabold uppercase font-mono px-3 py-1.5 rounded-lg border-l-4 border-amber-500 ${
                        isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {cat === 'HAIR' ? '✂️ Cabelo' : cat === 'BEARD' ? '🧔 Barba' : cat === 'COMBO' ? '⚡ Combos' : cat === 'TREATMENT' ? '🧼 Tratamentos' : cat}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {catServices.map(srv => {
                          const qty = selectedServiceQuantities[srv.id] || 0;
                          return (
                            <div key={srv.id} className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div>
                                <h6 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{srv.name}</h6>
                                <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatCurrency(srv.price)} / atendimento</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustServiceQuantity(srv.id, -1)}
                                  className={`w-7 h-7 border rounded-lg font-bold flex items-center justify-center cursor-pointer ${
                                    isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono font-extrabold text-amber-500 w-5 text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustServiceQuantity(srv.id, 1)}
                                  className="w-7 h-7 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumo */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="space-y-1 text-xs font-mono">
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Serviços Selecionados: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{totalQuantity}</strong></p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Valor de Tabela: <span className="line-through text-slate-400">{formatCurrency(rawTotalCost)}</span></p>
                  <p className="text-emerald-500 font-bold">Desconto Concedido ({Math.round(discountPct * 100)}%): -{formatCurrency(discountAmount)}</p>
                </div>
                <div className="text-left md:text-right">
                  <span className={`text-[10px] uppercase font-mono font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mensalidade Total</span>
                  <span className="text-2xl font-black text-amber-500 font-mono">{formatCurrency(finalMonthlyCost)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateCustomSubscription}
                disabled={totalQuantity === 0}
                className={`w-full font-bold text-xs py-3.5 rounded-xl cursor-pointer transition uppercase tracking-wider ${
                  totalQuantity > 0 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirmar Assinatura Mensal
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKINGS HISTORY & CANCELLATION */}
      {activeTab === 'historico' && (
        <div id="secao-reservas" className="space-y-4">
          <h3 className={`text-xs font-bold font-mono uppercase tracking-wider block text-left ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Histórico das Suas Marcações
          </h3>

          {myAppointments.length === 0 ? (
            <div className={`p-8 rounded-xl text-center text-xs border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              Você ainda não possui nenhum agendamento efetuado.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table View */}
              <div className={`hidden md:block rounded-2xl overflow-hidden shadow-sm border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className={`font-mono border-b ${
                        isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <th className="p-3">Ref ID</th>
                        <th className="p-3">Serviço</th>
                        <th className="p-3">Barbeiro</th>
                        <th className="p-3">Data</th>
                        <th className="p-3">Horário</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
                      {myAppointments.slice().reverse().map(apt => (
                        <tr key={apt.id} className={isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}>
                          <td className={`p-3 text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{apt.id.slice(-5)}</td>
                          <td className={`p-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <div>{apt.serviceName}</div>
                            {apt.isSubscriptionUse && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[9px] rounded font-mono">
                                🔄 Via Assinatura VIP
                              </span>
                            )}
                          </td>
                          <td className="p-3">{apt.barberName}</td>
                          <td className="p-3">{apt.date}</td>
                          <td className="p-3 text-amber-500 font-bold">{apt.time}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                              apt.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                              apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-200 text-slate-600 line-through'
                            }`}>
                              {apt.status === 'SCHEDULED' ? 'Confirmado' :
                               apt.status === 'IN_PROGRESS' ? 'Em Atendimento' :
                               apt.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {apt.status === 'SCHEDULED' && (
                              <button
                                onClick={() => handleCancelMyAppointment(apt.id)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold cursor-pointer transition"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {myAppointments.slice().reverse().map(apt => (
                  <div key={apt.id} className={`p-4 rounded-2xl space-y-3 shadow-sm text-left border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-mono block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>ID: #{apt.id.slice(-5)}</span>
                        <h4 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{apt.serviceName}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded-lg ${
                        apt.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        'bg-slate-100 text-slate-500 border border-slate-200 line-through'
                      }`}>
                        {apt.status === 'SCHEDULED' ? 'Confirmado' :
                         apt.status === 'IN_PROGRESS' ? 'Em Atendimento' :
                         apt.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                      </span>
                    </div>

                    <div className={`grid grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-xl border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div>
                        <span className={`text-[9px] block uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Barbeiro</span>
                        <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{apt.barberName}</span>
                      </div>
                      <div>
                        <span className={`text-[9px] block uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Data & Horário</span>
                        <span className="font-bold text-amber-500">{apt.date} às {apt.time}</span>
                      </div>
                    </div>

                    {apt.isSubscriptionUse && (
                      <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-md font-mono">
                        🔄 Via Assinatura VIP
                      </span>
                    )}

                    {apt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCancelMyAppointment(apt.id)}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                      >
                        Cancelar Agendamento
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NPS SURVEY CARD (Escala 1 a 5) */}
      {parameters.enableNPS !== false && (
        <div className={`p-6 rounded-2xl space-y-4 shadow-sm text-left border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className={`flex items-center gap-2 border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <h3 className={`text-sm font-extrabold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {parameters.npsTitle || 'Avalie Sua Experiência (Pesquisa NPS)'}
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {parameters.npsQuestion || 'Em uma escala de 1 a 5, como foi o seu atendimento em nosso estúdio?'}
              </p>
            </div>
          </div>

          {npsSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              Sua avaliação foi enviada com sucesso! Agradecemos o seu feedback para continuarmos melhorando.
            </div>
          ) : (
            <form onSubmit={handleSendNPSFeedback} className="space-y-4">
              <div>
                <label className={`text-[10px] font-mono uppercase font-bold block mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Escolha sua nota (1 = Insatisfeito, 5 = Excelente):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: '1 - Ruim', emoji: '😡' },
                    { val: 2, label: '2 - Regular', emoji: '🙁' },
                    { val: 3, label: '3 - Bom', emoji: '😐' },
                    { val: 4, label: '4 - Muito Bom', emoji: '🙂' },
                    { val: 5, label: '5 - Excelente', emoji: '😍' }
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setNpsScore(item.val)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold font-mono border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        npsScore === item.val
                          ? item.val >= 4
                            ? 'bg-emerald-500 text-slate-950 border-emerald-600 scale-105 shadow-md font-black'
                            : item.val === 3
                              ? 'bg-amber-500 text-slate-950 border-amber-600 scale-105 shadow-md font-black'
                              : 'bg-red-500 text-white border-red-600 scale-105 shadow-md font-black'
                          : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[9px] text-center hidden sm:inline">{item.label}</span>
                      <span className="text-xs font-bold sm:hidden">{item.val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] font-mono uppercase font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Profissional que Atendeu (Opcional):
                  </label>
                  <select
                    value={npsBarberId}
                    onChange={e => setNpsBarberId(e.target.value)}
                    className={`w-full rounded-xl py-2 px-3 text-xs font-mono cursor-pointer outline-none focus:border-amber-500 border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="">Selecione se desejar...</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-[10px] font-mono uppercase font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Comentário ou Sugestão (Opcional):
                  </label>
                  <input
                    type="text"
                    value={npsComment}
                    onChange={e => setNpsComment(e.target.value)}
                    placeholder="O que mais gostou ou pode melhorar?"
                    className={`w-full rounded-xl py-2 px-3 text-xs outline-none focus:border-amber-500 border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={npsScore === null}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider transition cursor-pointer ${
                    npsScore !== null
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Enviar Avaliação
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* LOCALIZAÇÃO (GOOGLE MAPS) E REDES SOCIAIS */}
      <div className={`p-5 rounded-2xl space-y-4 shadow-sm text-left border ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <h3 className={`text-sm font-extrabold font-mono flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <MapPin className="w-4 h-4 text-amber-500" /> Localização do Estúdio
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{parameters.address || 'Endereço da Barbearia'}</p>
          </div>

          <a
            href={parameters.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parameters.address || parameters.shopName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
          >
            <MapPin className="w-4 h-4" />
            <span>Abrir no Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* REDES SOCIAIS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`text-xs font-mono font-bold uppercase mr-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Redes Sociais:</span>
          {parameters.whatsappUrl && (
            <a href={parameters.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border ${
              isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}>
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          {parameters.instagramUrl && (
            <a href={parameters.instagramUrl} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border ${
              isDarkMode ? 'bg-pink-950/60 text-pink-300 border-pink-800 hover:bg-pink-900/60' : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
            }`}>
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </a>
          )}
          {parameters.facebookUrl && (
            <a href={parameters.facebookUrl} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border ${
              isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800 hover:bg-blue-900/60' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}>
              <Facebook className="w-3.5 h-3.5" /> Facebook
            </a>
          )}
          {parameters.tiktokUrl && (
            <a href={parameters.tiktokUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition">
              🎵 TikTok
            </a>
          )}
        </div>
      </div>

      {/* RODAPÉ DO PORTAL DO CLIENTE */}
      <div className={`border-t pt-4 mt-6 text-center text-xs font-sans ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200/80 text-slate-500'}`}>
        {parameters.customerPortalFooterText ? (
          <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {formatPortalText(parameters.customerPortalFooterText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
          </p>
        ) : (
          <p className="font-mono text-[11px]">
            {parameters.shopName} • {parameters.address} • Suporte: {parameters.phone}
          </p>
        )}
      </div>

      {/* SEÇÃO PÚBLICA INDEXÁVEL DE SEO DO TRIMA STUDIO */}
      <div className="mt-12 border-t border-slate-800/80 pt-8">
        <PublicSEOComponent
          services={services}
          plans={plans}
          parameters={parameters}
          onSelectServiceToBook={(srv) => {
            setBookingServiceId(srv.id);
            setBookingStep(2);
            setActiveTab('agendar');
            const bookingEl = document.getElementById('secao-agendamento');
            if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenBookingWizard={() => {
            setActiveTab('agendar');
            const bookingEl = document.getElementById('secao-agendamento');
            if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenLoginModal={onOpenLoginModal}
        />
      </div>

      {/* MENU DE FACILIDADES DE ACESSO FIXO NA PARTE INFERIOR DA TELA */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t py-2.5 px-3 flex justify-around items-center transition-colors ${
        isDarkMode
          ? 'bg-slate-950/95 border-slate-800 text-slate-100 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]'
      }`}>
        <button
          type="button"
          onClick={() => handleNavigateTab('agendar', 'secao-agendamento')}
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'agendar'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Agendar</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigateTab('assinatura', 'secao-clube-vip')}
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'assinatura'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Clube VIP</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigateTab('historico', 'secao-reservas')}
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Reservas</span>
        </button>

        <a
          href={parameters.whatsappUrl || `https://wa.me/${(parameters.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento da barbearia.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs border ${
            isDarkMode
              ? 'text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800/80'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
