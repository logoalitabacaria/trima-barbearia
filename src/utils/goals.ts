import { Comanda, User, SystemParameters, BarberDetail, BarberGoalTier } from '../types';

export interface BarberMonthlyStats {
  totalRevenue: number;
  servicesCount: number;
  productSales: number;
}

export interface BarberGoalProgress {
  stats: BarberMonthlyStats;
  currentTier: BarberGoalTier | null;
  nextTier: BarberGoalTier | null;
  revenueTarget: number;
  servicesTarget: number;
  productSalesTarget: number;
  revenueProgressPercent: number;
  servicesProgressPercent: number;
  productProgressPercent: number;
  overallProgressPercent: number;
  earnedBonusFixed: number;
  earnedExtraCommissionPercent: number;
  badges: {
    id: string;
    title: string;
    icon: string;
    description: string;
    unlocked: boolean;
  }[];
}

export interface BarberLeaderboardEntry {
  barber: User;
  stats: BarberMonthlyStats;
  currentTier: BarberGoalTier | null;
  overallProgressPercent: number;
  earnedBonusFixed: number;
  earnedExtraCommissionPercent: number;
  rank: number;
}

/**
 * Default Goal Tiers if not set in parameters
 */
export const DEFAULT_GOAL_TIERS: BarberGoalTier[] = [
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
];

/**
 * Extracts YYYY-MM from ISO strings or localized dates (DD/MM/YYYY)
 */
function extractYearMonth(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split(' ')[0].split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}`;
    }
  }
  return trimmed.substring(0, 7);
}

/**
 * Computes monthly revenue, services count, and product sales for a given barber
 */
export function getBarberMonthlyStats(
  barberId: string,
  comandas: Comanda[],
  yearMonth?: string // YYYY-MM
): BarberMonthlyStats {
  const targetYM = yearMonth || new Date().toISOString().substring(0, 7);

  const barberComandas = (comandas || []).filter(c => {
    if (!c || c.barberId !== barberId) return false;
    const isPaidOrClosed = c.status === 'PAID' || c.status === 'CLOSED' || c.status === 'COMPLETED';
    if (!isPaidOrClosed) return false;

    const dateStr = c.completedAt || c.dispatchedAt || c.createdAt;
    const ym = extractYearMonth(dateStr);
    return ym === targetYM;
  });

  let totalRevenue = 0;
  let servicesCount = 0;
  let productSales = 0;

  barberComandas.forEach(c => {
    totalRevenue += (c.total || 0);
    
    if (c.items && c.items.length > 0) {
      c.items.forEach(item => {
        if (!item) return;
        const qty = item.quantity || 1;
        const price = item.unitPrice || 0;
        if (item.isProduct) {
          productSales += (price * qty);
        } else {
          servicesCount += qty;
        }
      });
    } else {
      servicesCount += 1;
    }
  });

  return {
    totalRevenue,
    servicesCount,
    productSales
  };
}

/**
 * Calculates complete gamification progress, badges, and rewards for a barber
 */
export function calculateBarberGoalProgress(
  barberId: string,
  comandas: Comanda[],
  parameters: SystemParameters,
  barberDetail?: BarberDetail,
  yearMonth?: string
): BarberGoalProgress {
  const stats = getBarberMonthlyStats(barberId, comandas, yearMonth);
  const tiers = (parameters.barberGoalTiers && parameters.barberGoalTiers.length > 0)
    ? [...parameters.barberGoalTiers].sort((a, b) => a.targetRevenue - b.targetRevenue)
    : DEFAULT_GOAL_TIERS;

  // Custom targets override check
  const customConfig = parameters.barberCustomGoals?.[barberId];
  const customRev = customConfig?.monthlyRevenueTarget || barberDetail?.customMonthlyRevenueTarget;
  const customServ = customConfig?.monthlyServicesTarget || barberDetail?.customMonthlyServicesTarget;
  const customProd = customConfig?.monthlyProductSalesTarget || barberDetail?.customMonthlyProductSalesTarget;

  // Determine achieved tier
  let currentTier: BarberGoalTier | null = null;
  let nextTier: BarberGoalTier | null = tiers[0] || null;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const revTarget = customRev || tier.targetRevenue;
    if (stats.totalRevenue >= revTarget) {
      currentTier = tier;
      nextTier = tiers[i + 1] || null;
    }
  }

  // Active targets (either from next tier or current tier, or custom)
  const targetRefTier = nextTier || currentTier || tiers[0];
  const revenueTarget = customRev || targetRefTier?.targetRevenue || 3000;
  const servicesTarget = customServ || targetRefTier?.targetServicesCount || 50;
  const productSalesTarget = customProd || targetRefTier?.targetProductSales || 300;

  // Progress percentages capped at 100% for progress bars, but track actual
  const revenueProgressPercent = Math.min(100, Math.round((stats.totalRevenue / Math.max(1, revenueTarget)) * 100));
  const servicesProgressPercent = Math.min(100, Math.round((stats.servicesCount / Math.max(1, servicesTarget)) * 100));
  const productProgressPercent = Math.min(100, Math.round((stats.productSales / Math.max(1, productSalesTarget)) * 100));

  const overallProgressPercent = Math.min(100, Math.round((revenueProgressPercent + servicesProgressPercent + productProgressPercent) / 3));

  // Rewards earned from highest currentTier
  const earnedBonusFixed = currentTier ? currentTier.rewardBonusFixed : 0;
  const earnedExtraCommissionPercent = currentTier ? currentTier.rewardExtraCommissionPercent : 0;

  // Gamified Badges
  const badges = [
    {
      id: 'badge-1st',
      title: 'Primeiro Atendimento',
      icon: '💈',
      description: 'Concluiu o primeiro serviço com sucesso neste período.',
      unlocked: stats.servicesCount >= 1
    },
    {
      id: 'badge-cuts-50',
      title: 'Máquina de Cortes',
      icon: '⚡',
      description: 'Executou 30 ou mais atendimentos no mês.',
      unlocked: stats.servicesCount >= 30
    },
    {
      id: 'badge-products',
      title: 'Super Vendedor',
      icon: '🧴',
      description: 'Realizou mais de R$ 200,00 em vendas de produtos.',
      unlocked: stats.productSales >= 200
    },
    {
      id: 'badge-tier-bronze',
      title: 'Desafiante Bronze',
      icon: '🥉',
      description: 'Atingiu a meta de Nível Bronze.',
      unlocked: currentTier !== null
    },
    {
      id: 'badge-tier-ouro',
      title: 'Mestre da Barbearia',
      icon: '🥇',
      description: 'Superou o Nível Ouro de faturamento.',
      unlocked: currentTier?.id === 'tier-ouro' || currentTier?.id === 'tier-diamante'
    },
    {
      id: 'badge-triplice',
      title: 'Tríplice Coroa',
      icon: '🎯',
      description: 'Atingiu 100% de todas as 3 metas (Faturamento, Serviços e Produtos).',
      unlocked: revenueProgressPercent >= 100 && servicesProgressPercent >= 100 && productProgressPercent >= 100
    }
  ];

  return {
    stats,
    currentTier,
    nextTier,
    revenueTarget,
    servicesTarget,
    productSalesTarget,
    revenueProgressPercent,
    servicesProgressPercent,
    productProgressPercent,
    overallProgressPercent,
    earnedBonusFixed,
    earnedExtraCommissionPercent,
    badges
  };
}

/**
 * Builds the gamified leaderboard ranking for all active barbers
 */
export function getBarberLeaderboard(
  users: User[],
  comandas: Comanda[],
  parameters: SystemParameters,
  barberDetails?: BarberDetail[],
  yearMonth?: string
): BarberLeaderboardEntry[] {
  const barbers = users.filter(u => (u.role === 'BARBER' || u.role === 'ADMIN') && u.isActive);

  const entries: BarberLeaderboardEntry[] = barbers.map(b => {
    const detail = barberDetails?.find(d => d.userId === b.id);
    const progress = calculateBarberGoalProgress(b.id, comandas, parameters, detail, yearMonth);
    return {
      barber: b,
      stats: progress.stats,
      currentTier: progress.currentTier,
      overallProgressPercent: progress.overallProgressPercent,
      earnedBonusFixed: progress.earnedBonusFixed,
      earnedExtraCommissionPercent: progress.earnedExtraCommissionPercent,
      rank: 0
    };
  });

  // Sort by total revenue descending (or by progress %)
  entries.sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
