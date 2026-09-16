/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, BarberDetail, Service, Product, LoyaltyPlan, CustomerSubscription, Appointment, Comanda, SystemParameters, SupplyTransaction, OperationalScript, DiscountCoupon, CustomerCreditTransaction } from './types';

export const INITIAL_SYSTEM_PARAMETERS: SystemParameters = {
  shopName: "Trima Studio",
  openTime: "09:00",
  closeTime: "20:00",
  defaultCommissionService: 0.50, // 50%
  defaultCommissionProduct: 0.10, // 10%
  address: "Presidente Arthur da Costa e Silva, 379",
  phone: "+55 11 92598-0946",
  primaryColor: "#eab308",
  backgroundColor: "#000000",
  enableQuantitySubscriptionDiscount: true,
  subDiscount2: 0.05,
  subDiscount3to4: 0.12,
  subDiscount5to6: 0.20,
  subDiscount7Plus: 0.28,
  paymentMethods: ['PIX', 'CARTÃO', 'DINHEIRO', 'ASSINATURA', 'CRÉDITO ANTECIPADO', 'FIADO (A PRAZO)'],
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

  // Referral Program Config (MGM)
  enableReferralProgram: true,
  referralDiscountReferrer: 10, // R$ 10 discount/credit for referrer upon first purchase of friend
  referralDiscountReferred: 10, // R$ 10 discount for referred friend on 1st purchase
  referralRewardReferredFirstPurchase: 10, // R$ 10 bonus credit for referred friend
  referralRulesText: "Compartilhe seu link exclusivo com amigos. Seu amigo ganha R$ 10,00 de bônus no primeiro atendimento e você recebe R$ 10,00 de crédito em sua conta assim que ele finalizar a compra!",

  // Coupons System
  enableCoupons: true,

  // Default Password for New Clients Created by Barbers / Staff
  defaultClientPassword: 'cliente123',

  // Customer Credit & Fiado
  enableCustomerCredit: true,
  enableCustomerDebt: true,

  // Customer Portal Visibility Flags
  portalShowGuestBanner: true,
  portalShowWelcomeHeader: true,
  portalShowBannersCarousel: true,
  portalShowAdvantagesCollapsible: true,
  portalShowReferralProgram: true,
  portalShowPromotions: true,
  portalShowLoyaltyCard: true,
  portalShowSubscriptionsSection: true,
  portalShowPackageBuilder: true,
  portalShowSchedulingFlow: true,
  portalShowServiceSearch: true,
  portalShowServiceCategories: true,
  portalShowAppointmentsHistory: true,
  portalShowNpsSurvey: true,
  portalShowContactFooter: true,

  // Customer Portal Section Titles & Subtitles
  customerPortalAgendarTitle: 'Agende Seu Atendimento',
  customerPortalAgendarSubtitle: 'Escolha os serviços desejados, seu profissional de preferência e o melhor horário.',
  customerPortalSubscriptionsTitle: 'Clube de Assinatura Recorrente & Descontos',
  customerPortalSubscriptionsSubtitle: 'Economize todo mês com planos mensais exclusivos ou monte seu próprio pacote com vantagens.',
  customerPortalPackageTitle: 'Monte Seu Pacote Mensal de Cortes & Barba',
  customerPortalPackageSubtitle: 'Selecione quais serviços você deseja receber ao longo do mês:',
  customerPortalAppointmentsTitle: 'Meus Agendamentos Recentes',
  customerPortalAppointmentsSubtitle: 'Acompanhe o status e histórico dos seus atendimentos agendados.',
  customerPortalBlockOrder: ['banners', 'promos', 'scheduling', 'subscriptions', 'appointments', 'nps', 'contact'],

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
    login: 'wagner',
    password: '123',
    permissions: ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL', 'DAILY_FACILITATOR']
  }
];

export const INITIAL_BARBER_DETAILS: BarberDetail[] = [];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Corte Masculino',
    price: 50,
    durationMinutes: 45,
    category: 'HAIR',
    description: 'Corte de cabelo tradicional ou moderno, alinhamento dos fios na tesoura e máquina com acerto do pezinho.',
    isActive: true
  },
  {
    id: 'srv-2',
    name: 'Corte Degradê (Fade)',
    price: 55,
    durationMinutes: 45,
    category: 'HAIR',
    description: 'Corte estilo degradê em transição suave (Low, Mid, High Fade ou Navalhado) para um acabamento impecável.',
    isActive: true
  },
  {
    id: 'srv-3',
    name: 'Corte Premium',
    price: 70,
    durationMinutes: 60,
    category: 'HAIR',
    description: 'Experiência completa com lavagem capilar, corte estilizado na tesoura e navalha, massagem craniana e finalização com pomada especial.',
    isActive: true
  },
  {
    id: 'srv-4',
    name: 'Corte na Máquina',
    price: 35,
    durationMinutes: 30,
    category: 'HAIR',
    description: 'Corte prático e uniforme utilizando até dois pentes na máquina com acabamento de pezinho.',
    isActive: true
  },
  {
    id: 'srv-5',
    name: 'Barba Clássica',
    price: 40,
    durationMinutes: 30,
    category: 'BEARD',
    description: 'Modelagem e alinhamento de barba na tesoura e máquina com acabamento das linhas da bochecha e pescoço.',
    isActive: true
  },
  {
    id: 'srv-6',
    name: 'Barba na Tesoura',
    price: 45,
    durationMinutes: 35,
    category: 'BEARD',
    description: 'Aparo artesanal de barba longa e volumosa realizado exclusivamente na tesoura para o caimento perfeito.',
    isActive: true
  },
  {
    id: 'srv-7',
    name: 'Barboterapia',
    price: 60,
    durationMinutes: 45,
    category: 'BEARD',
    description: 'Tratamento relaxante com aplicação de toalha quente, óleos emolientes, barbear com navalha e massagem pós-barba.',
    isActive: true
  },
  {
    id: 'srv-8',
    name: 'Barboterapia com Ozônio',
    price: 75,
    durationMinutes: 50,
    category: 'BEARD',
    description: 'Ritual de barboterapia potencializado com vapor de ozônio para abrir os poros, higienizar profundamente e acalmar a pele.',
    isActive: true
  },
  {
    id: 'srv-9',
    name: 'Combo Corte e Barba',
    price: 85,
    durationMinutes: 75,
    category: 'COMBO',
    description: 'Alinhamento completo do visual unindo corte masculino personalizado e barba esculpida.',
    isActive: true
  },
  {
    id: 'srv-10',
    name: 'Design de Sobrancelha',
    price: 25,
    durationMinutes: 20,
    category: 'TREATMENT',
    description: 'Limpeza e alinhamento de sobrancelhas masculinas na navalha ou tesoura com visual natural.',
    isActive: true
  },
  {
    id: 'srv-11',
    name: 'Pezinho e Acabamento',
    price: 20,
    durationMinutes: 15,
    category: 'HAIR',
    description: 'Manutenção do contorno do corte, nuca e costeletas para manter o cabelo sempre limpo.',
    isActive: true
  },
  {
    id: 'srv-12',
    name: 'Finalização Capilar',
    price: 20,
    durationMinutes: 15,
    category: 'HAIR',
    description: 'Modelagem e textura do cabelo utilizando pomadas mate, efeito molhado ou sprays de fixação profissional.',
    isActive: true
  },
  {
    id: 'srv-13',
    name: 'Luzes Masculinas',
    price: 90,
    durationMinutes: 90,
    category: 'TREATMENT',
    description: 'Mechas descoloridas e iluminação capilar com touca para dar contraste e estilo ao penteado.',
    isActive: true
  },
  {
    id: 'srv-14',
    name: 'Platinado Masculino',
    price: 130,
    durationMinutes: 120,
    category: 'TREATMENT',
    description: 'Descoloração global e matização platinada branco neve com produtos de alta proteção e reconstrução.',
    isActive: true
  },
  {
    id: 'srv-15',
    name: 'Selagem Capilar',
    price: 110,
    durationMinutes: 90,
    category: 'TREATMENT',
    description: 'Alinhamento térmico capilar que reduz o frizz, disciplina fios rebeldes e proporciona brilho e maciez.',
    isActive: true
  },
  {
    id: 'srv-16',
    name: 'Tratamentos Capilares',
    price: 60,
    durationMinutes: 40,
    category: 'TREATMENT',
    description: 'Hidratação profunda e reconstrução capilar com ampolas nutritivas para recuperar cabelos ressecados.',
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PLANS: LoyaltyPlan[] = [
  {
    id: 'pln-unlimited-hair',
    name: 'Clube Ilimitado Corte Masculino',
    priceMonthly: 119.90,
    description: 'Cortes de cabelo ilimitados no mês com repasse justo por atendimento ao barbeiro.',
    servicesIncludedCount: 999,
    currentCommissionRate: 35,
    isUnlimited: true,
    includedServiceIds: ['srv-1', 'srv-2', 'srv-4'],
    barberPayoutRate: 35,
    rules: [
      'Cortes de cabelo ilimitados no mês',
      'Válido para corte social, degradê e máquina',
      'Repasse proporcional garantido ao profissional',
      'Uso pessoal e intransferível'
    ]
  },
  {
    id: 'pln-vip-full',
    name: 'Clube VIP Total (Cabelo & Barba)',
    priceMonthly: 189.90,
    description: 'Acesso ilimitado a cortes e cuidados de barba com agendamento prioritário.',
    servicesIncludedCount: 999,
    currentCommissionRate: 40,
    isUnlimited: true,
    includedServiceIds: ['srv-1', 'srv-2', 'srv-5', 'srv-7', 'srv-9'],
    barberPayoutRate: 40,
    rules: [
      'Cortes e Barba ilimitados durante o mês vigente',
      'Desconto exclusivo de 10% em produtos da barbearia',
      'Repasse proporcional automático ao barbeiro por visita'
    ]
  }
];

export const INITIAL_SUBSCRIPTIONS: CustomerSubscription[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_COMANDAS: Comanda[] = [];

export const INITIAL_SCRIPTS: OperationalScript[] = [
  {
    id: 'script-1',
    title: 'Recepção Cordial e Análise de Visagismo',
    category: 'ATENDIMENTO',
    content: `1. Receba o cliente com aperto de mão ou cumprimento cordial, chamando-o pelo nome cadastrado.
2. Ofereça água, café expresso ou cortesia da casa.
3. Antes de molhar ou cortar, sente de frente para o espelho e faça a análise do formato do rosto e alinhamento da barba.
4. Pergunte: "Como você costuma pentear no dia a dia?" e "Qual a sua rotina de cuidados?".
5. Apresente as opções recomendadas com clareza antes de iniciar o corte.`,
    tips: 'A primeira impressão define a confiança. Olhe nos olhos do cliente e escute ativamente.',
    targetAudience: 'TODOS',
    tags: ['Recepção', 'Visagismo', 'Encantamento', 'Primeiro Contato'],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Administrador'
  },
  {
    id: 'script-2',
    title: 'Protocolo de Biossegurança e Esterilização',
    category: 'HIGIENE & BIOSSEGURANÇA',
    content: `1. Lâminas: NUNCA reutilize lâminas de barbear. Descarte imediatamente na caixa Descarpack na presença do cliente.
2. Pentes e Máquinas: Borrife álcool 70% ou spray desinfetante após cada atendimento.
3. Golas Higiênicas: Uso obrigatório da gola descartável antes de colocar a capa de corte.
4. Bancada: Mantenha sempre limpa de fios e cabelos com auxílio do espanador e pano de microfibra.`,
    tips: 'A esterilização na frente do cliente transmite profissionalismo e segurança máxima.',
    targetAudience: 'TODOS',
    tags: ['Biossegurança', 'Higiene', 'Normas', 'Lâminas'],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Administrador'
  },
  {
    id: 'script-3',
    title: 'Recomendação de Produtos no Pós-Corte',
    category: 'VENDAS & PRODUTOS',
    content: `1. Ao finalizar o penteado, mostre o produto utilizado (pomada matte, óleo de barba, balm ou pós-barba).
2. Explique como aplicar: "Coloque uma moeda de 1 real na palma, espalhe bem e aplique da raiz às pontas."
3. Pergunte naturalmente: "Você já tem essa pomada em casa para manter o penteado perfeito até o próximo retorno?"
4. Informe que os produtos da barbearia acumulam comissão para o barbeiro e pontos de fidelidade para o cliente.`,
    tips: 'Venda por consultoria, nunca force. Mostre os benefícios reais para o cabelo dele.',
    targetAudience: 'BARBEIROS',
    tags: ['Vendas', 'Produtos', 'Comissão', 'Finalização'],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Administrador'
  },
  {
    id: 'script-4',
    title: 'Agendamento de Retorno e Fidelização',
    category: 'FIDELIZAÇÃO & PÓS-VENDA',
    content: `1. Ao retirar a capa, mostre a nuca e a barba com o espelho de mão.
2. Pergunte: "Gostou do resultado? Ficou no padrão que você esperava?"
3. Diga: "Para manter esse degradê sempre alinhado, o ideal é refazer a cada 15 ou 20 dias. Vamos já deixar seu próximo horário reservado?"
4. Explique o aplicativo e como ele pode acumular pontos de fidelidade e indicar amigos com o link exclusivo.`,
    tips: 'Garantir a volta na cadeira é a chave para a agenda cheia todo mês.',
    targetAudience: 'TODOS',
    tags: ['Fidelização', 'Retorno', 'NPS', 'Indicação'],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Administrador'
  },
  {
    id: 'script-5',
    title: 'Técnica de Barbaterapia com Toalha Quente',
    category: 'TÉCNICAS & PROCEDIMENTOS',
    content: `1. Aplicação de óleo pré-barba com massagem circular no rosto.
2. Aqueça a toalha no vaporizador com óleo essencial de eucalipto ou menta.
3. Aplique a toalha quente no rosto por 2 a 3 minutos para abrir os poros e amaciar os fios.
4. Aplique o shaving gel transparente e execute o desenho da barba no sentido do crescimento dos fios.
5. Finalize com toalha fria para fechar os poros e aplique balm ou loção pós-barba calmante.`,
    tips: 'Ajuste a temperatura da toalha no dorso da sua mão antes de colocar no rosto do cliente.',
    targetAudience: 'BARBEIROS',
    tags: ['Barbaterapia', 'Toalha Quente', 'Relaxamento', 'Técnica'],
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Administrador'
  }
];

export const INITIAL_COUPONS: DiscountCoupon[] = [
  {
    id: 'coupon-1',
    code: 'BEMVINDO10',
    description: 'Cupom de 10% de desconto para novos clientes ou divulgação especial.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchaseAmount: 30,
    maxUsesTotal: 100,
    maxUsesPerCustomer: 1,
    timesUsed: 0,
    validUntil: '2027-12-31',
    isActive: true,
    rulesText: 'Válido para qualquer serviço ou combo da barbearia. Não cumulativo com outras promoções.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'coupon-2',
    code: 'TRIMA15',
    description: 'Desconto fixo de R$ 15,00 em compras acima de R$ 60,00.',
    discountType: 'FIXED',
    discountValue: 15,
    minPurchaseAmount: 60,
    maxUsesTotal: 50,
    maxUsesPerCustomer: 1,
    timesUsed: 0,
    validUntil: '2027-12-31',
    isActive: true,
    rulesText: 'Desconto direto no valor total da comanda.',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CREDIT_TRANSACTIONS: CustomerCreditTransaction[] = [];

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
      npsFeedbacks: [],
      scripts: INITIAL_SCRIPTS,
      coupons: INITIAL_COUPONS,
      creditTransactions: INITIAL_CREDIT_TRANSACTIONS,
      barberPayouts: []
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
    npsFeedbacks: getLocal('npsFeedbacks', []),
    scripts: getLocal('scripts', INITIAL_SCRIPTS),
    coupons: getLocal('coupons', INITIAL_COUPONS),
    creditTransactions: getLocal('creditTransactions', INITIAL_CREDIT_TRANSACTIONS),
    barberPayouts: getLocal('barberPayouts', [])
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
