/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, Star, Check, Award, AlertCircle, Search, UserCheck, ShieldCheck, XCircle, MessageSquare, Gift, Tag, Users, Share2, Copy, Sparkles, Crown, ChevronDown, ChevronLeft, ChevronRight, MapPin, Phone, Instagram, Facebook, MessageCircle, LogIn, ExternalLink } from 'lucide-react';
import { User, Service, LoyaltyPlan, Appointment, CustomerSubscription, SystemParameters, NPSFeedback, CustomerBanner } from '../types';
import { buildWhatsAppReminderUrl, formatPortalText } from '../utils/helpers';

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
    setActiveTab('historico');
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
    <div className="space-y-6 text-left max-w-6xl mx-auto font-sans bg-slate-50 p-4 sm:p-6 pb-24 rounded-3xl shadow-sm border border-slate-200/80">
      
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

      {/* Top Banner Greeting - Clean High Contrast Light Design */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1.5 flex-1">
          <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-700 text-[10px] font-bold font-mono uppercase rounded-md">
            {formatPortalText(parameters.customerPortalHeaderTitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address) || 'Portal do Cliente'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {parameters.customerPortalWelcomeTitle ? (
              <span>{formatPortalText(parameters.customerPortalWelcomeTitle, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}</span>
            ) : (
              <>Olá, <span className="text-amber-600">{currentCustomer.name}</span></>
            )}
          </h2>
          <p className="text-xs text-slate-600">
            {formatPortalText(parameters.customerPortalWelcomeText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address) || 'Escolha seu barbeiro de preferência e agende seu horário com total facilidade.'}
          </p>

          {/* EDITABLE SCHEDULING INFO TEXT */}
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
          <div className="bg-amber-50 border border-amber-300 p-3 px-5 rounded-xl font-mono text-xs text-amber-900 shrink-0">
            <span className="block text-[9px] uppercase font-bold text-amber-700">Plano Ativo</span>
            <span className="font-extrabold text-sm text-slate-900">{activeSubscribedPlan?.name || 'Assinatura VIP'}</span>
            <span className="block text-[11px] font-semibold mt-0.5 text-amber-800">
              Cortes Restantes: <strong>{activeSubscription.servicesRemaining}</strong>
            </span>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-slate-600 text-xs shrink-0 max-w-xs">
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

      {/* PROGRAMA DE INDICAÇÃO - INDIQUE E GANHE (Sem imagem antes do texto, texto editável) */}
      {parameters.enableReferralProgram !== false && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border border-amber-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono tracking-wider">
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
            <p className="text-xs text-slate-600">
              {parameters.referralDescription ? (
                formatPortalText(parameters.referralDescription, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)
              ) : (
                <>Ao indicar um amigo, você ganha <strong>R$ {(parameters.referralDiscountReferrer ?? 10).toFixed(2)}</strong> de desconto e seu amigo ganha <strong>R$ {(parameters.referralDiscountReferred ?? 10).toFixed(2)}</strong> no primeiro corte!</>
              )}
            </p>
            {parameters.referralRulesText && (
              <p className="text-[11px] text-slate-500 italic font-mono">
                {formatPortalText(parameters.referralRulesText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
              </p>
            )}
          </div>

          <div className="bg-white border border-amber-200 p-3 rounded-xl flex items-center gap-2 font-mono text-xs shadow-xs shrink-0 w-full md:w-auto justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Seu Código de Indicação:</span>
              <span className="font-extrabold text-slate-900 text-sm tracking-wider">
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
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar Código
            </button>
          </div>
        </div>
      )}

      {/* PROMOÇÕES ATIVAS DA BARBEARIA */}
      {parameters.enablePromotions !== false && parameters.promotions && parameters.promotions.filter(p => p.isActive).length > 0 && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Promoções e Cupons Especiais Ativos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {parameters.promotions.filter(p => p.isActive).map(promo => (
              <div key={promo.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-mono font-bold rounded uppercase">
                    CUPOM: {promo.code}
                  </span>
                  <span className="text-xs font-extrabold text-amber-700 font-mono">
                    {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `R$ ${promo.discountValue.toFixed(2)} OFF`}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{promo.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{promo.description}</p>
                <div className="pt-1 text-[10px] text-slate-400 font-mono italic">
                  Apresente o cupom ao barbeiro ou no caixa.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRAMA DE FIDELIDADE - WIDGET DE PONTOS */}
      {parameters.enableLoyalty !== false && (() => {
        const points = currentCustomer.loyaltyPoints || 0;
        const minToRedeem = parameters.loyaltyMinPointsRedeem || 100;
        const rewardVal = parameters.loyaltyRewardValue || 15;
        const progressPct = Math.min(100, Math.round((points / minToRedeem) * 100));
        const canRedeem = points >= minToRedeem;

        return (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-50 border border-amber-300/80 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                    🏆 Programa de Fidelidade Trima
                  </h3>
                  {canRedeem && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-bold uppercase rounded font-mono animate-bounce">
                      Prêmio Disponível!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-0.5">
                  Você possui <strong className="text-amber-800 font-mono text-sm">{points} pontos</strong> acumulados.
                  {canRedeem
                    ? ` 🎉 Parabéns! Apresente sua conta no caixa para resgatar R$ ${rewardVal},00 de desconto no seu atendimento!`
                    : ` Faltam apenas ${minToRedeem - points} pontos para liberar R$ ${rewardVal},00 de desconto.`}
                </p>
              </div>
            </div>

            <div className="w-full md:w-56 shrink-0 bg-white/80 p-3 rounded-xl border border-amber-200">
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-700 mb-1">
                <span>Progresso</span>
                <span>{points} / {minToRedeem} pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono block mt-1 text-right">
                {progressPct}% concluído
              </span>
            </div>
          </div>
        );
      })()}

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap gap-2 bg-slate-200/60 p-1.5 rounded-xl border border-slate-300/80">
        <button
          onClick={() => setActiveTab('agendar')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-lg text-xs font-bold font-mono uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'agendar'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
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
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Minhas Reservas ({myAppointments.length})</span>
        </button>
      </div>

      {/* TAB 1: INTUITIVE 3-STEP BOOKING FLOW */}
      {activeTab === 'agendar' && (
        <div className="space-y-6">
          {parameters.customerPortalAgendarSubtitle && (
            <div className="bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-xl text-xs text-slate-800 font-medium flex items-center gap-2 shadow-xs">
              <Scissors className="w-4 h-4 text-amber-600 shrink-0" />
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
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {activeSubscribedPlan?.name || 'Plano de Assinatura VIP'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Seu agendamento será vinculado à sua assinatura e utilizará seus créditos do pacote mensal!
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-amber-950 font-extrabold flex-wrap pt-1">
                  <span className="bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl">
                    ✂️ Serviços Restantes no Mês: <strong className="text-amber-800 text-sm">{activeSubscription.servicesRemaining} corte(s)</strong>
                  </span>
                  {activeSubscription.selectedServiceIds && activeSubscription.selectedServiceIds.length > 0 && (
                    <span className="text-slate-600 font-normal text-[11px]">
                      (Serviços do pacote: {Array.from(new Set(activeSubscription.selectedServiceIds)).map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')})
                    </span>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 bg-white border border-amber-400 p-3 px-4 rounded-xl cursor-pointer shadow-sm hover:bg-amber-50 transition shrink-0 select-none">
                <input
                  type="checkbox"
                  checked={useSubscriptionForBooking}
                  onChange={e => setUseSubscriptionForBooking(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <div className="text-left">
                  <span className="text-xs font-extrabold text-slate-900 block leading-tight">Agendar via Assinatura</span>
                  <span className="text-[10px] text-slate-500 font-mono block">Utilizar crédito do mês</span>
                </div>
              </label>
            </div>
          )}

          <form onSubmit={handleConfirmBooking} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* STEP 1: Select Service */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-xs font-bold font-mono uppercase text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">1</span>
                    Selecione o Serviço
                  </h3>
                </div>

                {/* Filter & Search Bar */}
                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar serviço por nome..."
                      value={serviceSearch}
                      onChange={e => setServiceSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'HAIR' ? 'Cabelo' : cat === 'BEARD' ? 'Barba' : cat === 'COMBO' ? 'Combos' : cat === 'TREATMENT' ? 'Tratamentos' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services list */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredServices.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum serviço encontrado para este filtro.</p>
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

                      return (
                        <label
                          key={s.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            bookingServiceId === s.id
                              ? 'bg-amber-50/80 border-amber-500 text-slate-900 shadow-sm'
                              : 'bg-slate-50/50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <input
                            type="radio"
                            name="serviceRadio"
                            checked={bookingServiceId === s.id}
                            onChange={() => setBookingServiceId(s.id)}
                            className="mt-1 accent-amber-500 cursor-pointer"
                          />
                          <div className="text-left select-none flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-xs text-slate-900 leading-tight">{s.name}</p>
                                {s.description && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleServiceExpand(s.id, e)}
                                    className="p-1 text-slate-400 hover:text-amber-600 transition rounded hover:bg-slate-200/60 cursor-pointer flex items-center gap-0.5 text-[9px] font-mono"
                                    title={expandedServiceId === s.id ? 'Ocultar descrição' : 'Ver descrição completa'}
                                  >
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedServiceId === s.id ? 'rotate-180 text-amber-600' : ''}`} />
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
                                  <span className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                                    Avulso
                                  </span>
                                )
                              )}
                            </div>

                            {/* Service Description - Only visible when down arrow is clicked */}
                            {s.description && expandedServiceId === s.id && (
                              <p className="text-[11px] text-slate-600 mt-2 bg-slate-100/90 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-sans">
                                {s.description}
                              </p>
                            )}

                            <div className="flex gap-2 items-center mt-2">
                              <span className="text-xs text-amber-700 font-mono font-bold bg-amber-100/80 px-2 py-0.5 rounded">
                                {formatCurrency(s.price)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">⏱️ {s.durationMinutes} min</span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: Choose Date */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-xs font-bold font-mono uppercase text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">2</span>
                    Escolha a Data
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 mb-2">Selecione o dia do seu atendimento:</p>

                {/* Day Picker: Date Input + Month Calendar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <label className="text-[10px] font-mono font-bold text-slate-700 uppercase">
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
                      className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-mono text-slate-800 font-bold outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                    />
                  </div>

                  {/* Calendar Grid */}
                  <div className="bg-slate-50 border border-slate-200/90 p-3 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase font-mono">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 px-2 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      >
                        &larr;
                      </button>
                      <span className="text-slate-900 text-[11px] font-extrabold">
                        {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 px-2 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      >
                        &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-slate-500 font-mono font-bold border-b border-slate-200 pb-1">
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
                                ? 'text-slate-300 cursor-not-allowed bg-transparent'
                                : isSelected
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                  : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer'
                            }`}
                          >
                            {dayCell.dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Directly Inside Step 2 Calendar Card */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-700 font-mono uppercase font-bold">
                        Horários ({bookingDate.split('-').reverse().join('/')}):
                      </label>
                      {bookingTime && (
                        <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Selecionado: {bookingTime}
                        </span>
                      )}
                    </div>

                    {(() => {
                      const slots = generateAvailableSlots(bookingDate, bookingBarberId);
                      if (slots.length === 0) {
                        return (
                          <p className="text-[11px] text-slate-400 italic font-mono bg-slate-50 p-2 text-center rounded-xl border border-slate-200/60">
                            Nenhum horário comercial configurado para este dia.
                          </p>
                        );
                      }

                      return (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {slots.map(slot => {
                            const isBooked = isSlotBooked(bookingDate, slot, bookingBarberId);
                            const isSelected = bookingTime === slot;

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setBookingTime(slot)}
                                className={`py-1.5 px-1 text-[10px] font-mono rounded-xl border transition-all text-center font-bold ${
                                  isBooked
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs scale-105 font-black'
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
                </div>
              </div>
            </div>

            {/* STEP 3: Choose Barber & Horários */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-xs font-bold font-mono uppercase text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">3</span>
                    Profissional & Horário
                  </h3>
                </div>

                <div className="mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] font-mono text-amber-900 font-bold flex items-center justify-between">
                  <span>📅 Data selecionada:</span>
                  <span className="text-amber-800 font-extrabold">{bookingDate.split('-').reverse().join('/')}</span>
                </div>

                {/* Barbers Selection */}
                <div className="space-y-2 mb-4">
                  <label className="text-[10px] text-slate-700 font-mono block uppercase font-bold">
                    1. Barbeiros Disponíveis:
                  </label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {barbers.map(b => (
                      <label
                        key={b.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                          bookingBarberId === b.id
                            ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-2xs font-bold'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="barberRadio"
                            checked={bookingBarberId === b.id}
                            onChange={() => {
                              setBookingBarberId(b.id);
                              setBookingTime('');
                            }}
                            className="accent-amber-500 cursor-pointer"
                          />
                          {b.photoUrl ? (
                            <img src={b.photoUrl} alt={b.name} className="h-7 w-7 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-7 h-7 bg-amber-100 border border-amber-200 text-slate-900 rounded-lg flex items-center justify-center text-xs font-bold">
                              {b.avatar || '🧔'}
                            </div>
                          )}
                          <span className="text-xs font-extrabold text-slate-900">{b.name}</span>
                        </div>
                        {bookingBarberId === b.id && (
                          <Check className="w-4 h-4 text-amber-600 font-bold" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-700 font-mono block uppercase font-bold">
                    2. Horários Disponíveis:
                  </label>

                  {(() => {
                    const slots = generateAvailableSlots(bookingDate, bookingBarberId);
                    if (slots.length === 0) {
                      return (
                        <p className="text-[11px] text-slate-400 italic font-mono bg-slate-50 p-2.5 text-center rounded-xl border border-slate-200/60">
                          Nenhum horário comercial configurado para este dia.
                        </p>
                      );
                    }

                    return (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {slots.map(slot => {
                          const isBooked = isSlotBooked(bookingDate, slot, bookingBarberId);
                          const isSelected = bookingTime === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setBookingTime(slot)}
                              className={`py-1.5 px-1 text-[10px] font-mono rounded-xl border transition-all text-center font-bold ${
                                isBooked
                                  ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs scale-105 font-black'
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
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!bookingTime}
                  className={`w-full font-extrabold text-xs py-3.5 rounded-xl cursor-pointer transition uppercase tracking-wider shadow-md ${
                    bookingTime
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {bookingTime ? `Confirmar para às ${bookingTime}` : 'Selecione um Horário'}
                </button>
              </div>

            </div>

          </div>
        </form>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTIONS & CLUB BENEFITS */}
      {activeTab === 'assinatura' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl text-left space-y-2 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Clube de Assinatura Recorrente & Descontos
            </h3>
            <p className="text-xs text-slate-600">
              Monte seu plano mensal sob medida. Quanto mais serviços adicionar ao seu pacote, maior é o desconto automático concedido!
            </p>
          </div>

          {activeSubscription ? (
            <div className="bg-amber-50 border-2 border-amber-400 p-6 rounded-2xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1 px-3 bg-amber-500 text-slate-950 text-xs font-black font-mono rounded-lg">
                    Assinante VIP Ativo
                  </span>
                  <span className="text-xs text-slate-600 font-mono font-semibold">
                    Validade: {activeSubscription.startDate} até {activeSubscription.endDate}
                  </span>
                </div>
                
                <h4 className="text-lg font-black text-slate-900">
                  {activeSubscribedPlan?.name || 'Sua Assinatura Personalizada'}
                </h4>

                <p className="text-xs font-mono text-amber-900 font-extrabold bg-amber-100 border border-amber-300 p-2.5 rounded-xl inline-block">
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
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                  🛠️ Monte Seu Pacote Mensal de Cortes & Barba
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Selecione quais serviços você deseja receber ao longo do mês:
                </p>
              </div>

              {/* Tabela de Descontos Progressivos */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-amber-700 uppercase font-mono font-extrabold block mb-2">Tabela de Descontos do Clube:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">2 Serviços</span>
                    <span className="text-sm font-black text-amber-600">{Math.round((parameters.subDiscount2 ?? 0.05) * 100)}% OFF</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">3 a 4 Serviços</span>
                    <span className="text-sm font-black text-amber-600">{Math.round((parameters.subDiscount3to4 ?? 0.12) * 100)}% OFF</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">5 a 6 Serviços</span>
                    <span className="text-sm font-black text-amber-600">{Math.round((parameters.subDiscount5to6 ?? 0.20) * 100)}% OFF</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">7+ Serviços</span>
                    <span className="text-sm font-black text-amber-600">{Math.round((parameters.subDiscount7Plus ?? 0.28) * 100)}% OFF</span>
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
                      <h5 className="text-[11px] font-extrabold text-amber-800 uppercase font-mono bg-amber-50 px-3 py-1.5 rounded-lg border-l-4 border-amber-500">
                        {cat === 'HAIR' ? '✂️ Cabelo' : cat === 'BEARD' ? '🧔 Barba' : cat === 'COMBO' ? '⚡ Combos' : cat === 'TREATMENT' ? '🧼 Tratamentos' : cat}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {catServices.map(srv => {
                          const qty = selectedServiceQuantities[srv.id] || 0;
                          return (
                            <div key={srv.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
                              <div>
                                <h6 className="text-xs font-bold text-slate-900">{srv.name}</h6>
                                <p className="text-[10px] text-slate-500 font-mono">{formatCurrency(srv.price)} / atendimento</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustServiceQuantity(srv.id, -1)}
                                  className="w-7 h-7 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono font-extrabold text-amber-700 w-5 text-center">{qty}</span>
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
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 text-xs font-mono">
                  <p className="text-slate-600">Serviços Selecionados: <strong className="text-slate-900">{totalQuantity}</strong></p>
                  <p className="text-slate-600">Valor de Tabela: <span className="line-through text-slate-400">{formatCurrency(rawTotalCost)}</span></p>
                  <p className="text-emerald-700 font-bold">Desconto Concedido ({Math.round(discountPct * 100)}%): -{formatCurrency(discountAmount)}</p>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Mensalidade Total</span>
                  <span className="text-2xl font-black text-amber-600 font-mono">{formatCurrency(finalMonthlyCost)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateCustomSubscription}
                disabled={totalQuantity === 0}
                className={`w-full font-bold text-xs py-3.5 rounded-xl cursor-pointer transition uppercase tracking-wider ${
                  totalQuantity > 0 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-600 uppercase tracking-wider block text-left">
            Histórico das Suas Marcações
          </h3>

          {myAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-500 text-xs">
              Você ainda não possui nenhum agendamento efetuado.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-mono">
                        <th className="p-3">Ref ID</th>
                        <th className="p-3">Serviço</th>
                        <th className="p-3">Barbeiro</th>
                        <th className="p-3">Data</th>
                        <th className="p-3">Horário</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {myAppointments.slice().reverse().map(apt => (
                        <tr key={apt.id} className="hover:bg-slate-50 text-slate-800">
                          <td className="p-3 text-[10px] text-slate-400">{apt.id.slice(-5)}</td>
                          <td className="p-3 font-bold text-slate-900">
                            <div>{apt.serviceName}</div>
                            {apt.isSubscriptionUse && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[9px] rounded font-mono">
                                🔄 Via Assinatura VIP
                              </span>
                            )}
                          </td>
                          <td className="p-3">{apt.barberName}</td>
                          <td className="p-3">{apt.date}</td>
                          <td className="p-3 text-amber-700 font-bold">{apt.time}</td>
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
                  <div key={apt.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">ID: #{apt.id.slice(-5)}</span>
                        <h4 className="font-extrabold text-sm text-slate-900">{apt.serviceName}</h4>
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

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Barbeiro</span>
                        <span className="font-bold text-slate-800">{apt.barberName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Data & Horário</span>
                        <span className="font-bold text-amber-700">{apt.date} às {apt.time}</span>
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
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-mono">
                {parameters.npsTitle || 'Avalie Sua Experiência (Pesquisa NPS)'}
              </h3>
              <p className="text-xs text-slate-600">
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
                <label className="text-[10px] text-slate-500 font-mono uppercase font-bold block mb-2">
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
                  <label className="text-[10px] text-slate-500 font-mono uppercase font-bold block mb-1">
                    Profissional que Atendeu (Opcional):
                  </label>
                  <select
                    value={npsBarberId}
                    onChange={e => setNpsBarberId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono cursor-pointer outline-none focus:border-amber-500"
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
                  <label className="text-[10px] text-slate-500 font-mono uppercase font-bold block mb-1">
                    Comentário ou Sugestão (Opcional):
                  </label>
                  <input
                    type="text"
                    value={npsComment}
                    onChange={e => setNpsComment(e.target.value)}
                    placeholder="O que mais gostou ou pode melhorar?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-amber-500"
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
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" /> Localização do Estúdio
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">{parameters.address || 'Endereço da Barbearia'}</p>
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
          <span className="text-xs font-mono font-bold text-slate-500 uppercase mr-1">Redes Sociais:</span>
          {parameters.whatsappUrl && (
            <a href={parameters.whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          {parameters.instagramUrl && (
            <a href={parameters.instagramUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition">
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </a>
          )}
          {parameters.facebookUrl && (
            <a href={parameters.facebookUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition">
              <Facebook className="w-3.5 h-3.5" /> Facebook
            </a>
          )}
          {parameters.tiktokUrl && (
            <a href={parameters.tiktokUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition">
              🎵 TikTok
            </a>
          )}
        </div>
      </div>

      {/* RODAPÉ DO PORTAL DO CLIENTE */}
      <div className="border-t border-slate-200/80 pt-4 mt-6 text-center text-xs text-slate-500 font-sans">
        {parameters.customerPortalFooterText ? (
          <p className="font-medium text-slate-600">
            {formatPortalText(parameters.customerPortalFooterText, currentCustomer.name, parameters.shopName, parameters.phone, parameters.address)}
          </p>
        ) : (
          <p className="font-mono text-[11px] text-slate-400">
            {parameters.shopName} • {parameters.address} • Suporte: {parameters.phone}
          </p>
        )}
      </div>

      {/* MENU DE FACILIDADES DE ACESSO FIXO NA PARTE INFERIOR DA TELA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2.5 px-3 shadow-[0_-4px_25px_rgba(0,0,0,0.3)] flex justify-around items-center">
        <button
          type="button"
          onClick={() => {
            setActiveTab('agendar');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'agendar'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Agendar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('assinatura');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'assinatura'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Clube VIP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('historico');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Reservas</span>
        </button>

        <a
          href={parameters.whatsappUrl || `https://wa.me/${(parameters.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento da barbearia.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[95px] py-1.5 px-2 rounded-xl text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
