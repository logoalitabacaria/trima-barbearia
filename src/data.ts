/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, BarberDetail, Service, Product, LoyaltyPlan, CustomerSubscription, Appointment, Comanda, SystemParameters, SupplyTransaction } from './types';

export const INITIAL_SYSTEM_PARAMETERS: SystemParameters = {
  shopName: "Trima Studio",
  openTime: "09:00",
  closeTime: "20:00",
  defaultCommissionService: 0.50, // 50%
  defaultCommissionProduct: 0.10, // 10%
  address: "Rua Trima Studio, 777",
  phone: "(11) 98765-4321",
  primaryColor: "#eab308",
  backgroundColor: "#000000",
  subDiscount2: 0.05,
  subDiscount3to4: 0.12,
  subDiscount5to6: 0.20,
  subDiscount7Plus: 0.28,
  paymentMethods: ['PIX', 'CARTÃO', 'DINHEIRO', 'ASSINATURA'],
  whatsappTemplate: "Olá {NOME}! Confirmamos o seu agendamento no {LOJA} em {DATA} às {HORA} com o profissional {BARBEIRO} ({SERVICO}). Te esperamos!",
  enableLoyalty: true,
  loyaltyPointsPerReal: 1, // 1 ponto por cada R$ 1 gasto
  loyaltyMinPointsRedeem: 100, // 100 pontos para resgatar
  loyaltyRewardValue: 10, // R$ 10 de desconto
  enableReceipts: true, // Emissão de comprovante/impressão térmica
  receiptFooterText: "Obrigado pela preferência! Volte sempre ao Trima Studio.",
  enableNPS: true, // Pesquisa de Satisfação NPS
  npsTitle: "Avalie Sua Experiência (Pesquisa NPS)",
  npsQuestion: "De 0 a 10, qual a probabilidade de você recomendar o Trima Studio a um amigo?",

  // VIP Client Services
  enableVipServices: true,
  vipServicesPerBarberMonthly: 5,

  // Referral Discount Program
  enableReferralProgram: true,
  referralDiscountReferrer: 10, // R$ 10 discount for referrer
  referralDiscountReferred: 10, // R$ 10 discount for referred friend
  referralRulesText: "Indique seus amigos com o seu código exclusivo. Seu amigo ganha R$ 10,00 de desconto no primeiro atendimento e você ganha R$ 10,00 no seu próximo corte!",

  // Customer Portal Texts & Banners
  customerPortalWelcomeText: "Seja bem-vindo ao Trima Studio! Agende seu horário com os melhores profissionais da cidade.",
  customerPortalAnnouncementText: "⚡ Atendimento com agendamento online 24h ou por ordem de chegada no balcão!",
  customerPortalBanners: [
    {
      id: 'banner-1',
      title: 'Atendimento VIP & Exclusivo',
      subtitle: 'Conheça nossos planos de assinatura com cortes ilimitados todo mês.',
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      badgeText: 'CLUBE VIP',
      isActive: true
    },
    {
      id: 'banner-2',
      title: 'Corte + Barba de Respeito',
      subtitle: 'Produtos premium, toalha quente e tratamento completo para o seu estilo.',
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      badgeText: 'ESTILO',
      isActive: true
    }
  ],

  // Promotions System
  enablePromotions: true,
  promotions: [
    {
      id: 'promo-1',
      title: 'Primeira Visita (Boas-Vindas)',
      description: 'Desconto especial de R$ 15,00 no seu primeiro agendamento na barbearia!',
      discountType: 'FIXED',
      discountValue: 15,
      code: 'PRIMEIRO15',
      isActive: true,
      category: 'FIRST_BOOKING'
    },
    {
      id: 'promo-2',
      title: 'Aniversariante do Mês',
      description: 'Ganhe 20% de desconto no mês do seu aniversário!',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      code: 'ANIVER20',
      isActive: true,
      category: 'BIRTHDAY'
    }
  ],

  // Sistema de Metas Gamificado dos Barbeiros
  enableBarberGoals: true,
  barberGoalsRulesText: "As metas são apuradas mensalmente com base nos serviços executados, faturamento bruto e vendas de produtos. Os bônus financeiros em dinheiro e as comissões adicionais destravadas são integradas automaticamente no fechamento.",
  barberGoalTiers: [
    {
      id: 'tier-bronze',
      name: 'Nível Bronze (Iniciante)',
      badge: '🥉',
      targetRevenue: 2500,
      targetServicesCount: 40,
      targetProductSales: 200,
      rewardBonusFixed: 50,
      rewardExtraCommissionPercent: 1.0,
      color: '#cd7f32'
    },
    {
      id: 'tier-prata',
      name: 'Nível Prata (Especialista)',
      badge: '🥈',
      targetRevenue: 4500,
      targetServicesCount: 70,
      targetProductSales: 450,
      rewardBonusFixed: 120,
      rewardExtraCommissionPercent: 2.5,
      color: '#c0c0c0'
    },
    {
      id: 'tier-ouro',
      name: 'Nível Ouro (Mestre Navalha)',
      badge: '🥇',
      targetRevenue: 7000,
      targetServicesCount: 100,
      targetProductSales: 800,
      rewardBonusFixed: 250,
      rewardExtraCommissionPercent: 5.0,
      color: '#eab308'
    },
    {
      id: 'tier-diamante',
      name: 'Nível Diamante (Lenda da Barbearia)',
      badge: '💎',
      targetRevenue: 10000,
      targetServicesCount: 140,
      targetProductSales: 1200,
      rewardBonusFixed: 500,
      rewardExtraCommissionPercent: 7.5,
      color: '#38bdf8'
    }
  ]
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Wagner Barrera Moreno',
    email: 'wagnerbmoreno@gmail.com',
    role: 'ADMIN',
    phone: '(11) 99999-9999',
    isActive: true,
    avatar: '👑',
    login: 'wagnerbmoreno@gmail.com',
    password: 'Wag01121201!',
    permissions: ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL', 'DAILY_FACILITATOR']
  }
];

export const INITIAL_BARBER_DETAILS: BarberDetail[] = [];

export const INITIAL_SERVICES: Service[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PLANS: LoyaltyPlan[] = [];

export const INITIAL_SUBSCRIPTIONS: CustomerSubscription[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_COMANDAS: Comanda[] = [];

export function getSavedState() {
  const getLocal = (key: string, defaultVal: any) => {
    try {
      const data = localStorage.getItem(`logo_ali_b2_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const users = getLocal('users', INITIAL_USERS);
  const isLegacyUser = Array.isArray(users) && users.some(u => u.email === 'trimastudio@gmail.com' || u.login === 'admin');
  if (isLegacyUser) {
    try {
      localStorage.clear();
    } catch {}
    return {
      users: INITIAL_USERS,
      barberDetails: INITIAL_BARBER_DETAILS,
      services: INITIAL_SERVICES,
      products: INITIAL_PRODUCTS,
      plans: INITIAL_PLANS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      appointments: INITIAL_APPOINTMENTS,
      comandas: INITIAL_COMANDAS,
      parameters: INITIAL_SYSTEM_PARAMETERS,
      categories: ['HAIR', 'BEARD', 'COMBO', 'TREATMENT'],
      supplyTransactions: [],
      npsFeedbacks: []
    };
  }

  return {
    users: users,
    barberDetails: getLocal('barberDetails', INITIAL_BARBER_DETAILS),
    services: getLocal('services', INITIAL_SERVICES),
    products: getLocal('products', INITIAL_PRODUCTS),
    plans: getLocal('plans', INITIAL_PLANS),
    subscriptions: getLocal('subscriptions', INITIAL_SUBSCRIPTIONS),
    appointments: getLocal('appointments', INITIAL_APPOINTMENTS),
    comandas: getLocal('comandas', INITIAL_COMANDAS),
    parameters: getLocal('parameters', INITIAL_SYSTEM_PARAMETERS),
    categories: getLocal('categories', ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']),
    supplyTransactions: getLocal('supplyTransactions', []),
    npsFeedbacks: getLocal('npsFeedbacks', [])
  };
}

export function saveState(state: any) {
  try {
    Object.keys(state).forEach(key => {
      localStorage.setItem(`logo_ali_b2_${key}`, JSON.stringify(state[key]));
    });
  } catch (e) {
    console.error('Error saving state', e);
  }
}
