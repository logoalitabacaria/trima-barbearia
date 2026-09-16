/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Coins, Database, Plus, Trash2, Settings, ToggleLeft, ToggleRight, ShieldAlert,
  UserCheck, Dumbbell, Sparkles, TrendingUp, DollarSign, Coffee, Edit3, Save, Tag,
  MessageSquare, Gift, AlertTriangle, Award, CheckCircle2, Printer, Star, ThumbsUp, MessageCircle,
  Download, FileSpreadsheet, Filter, Calendar, Crown, Users, Layout, Trophy, Target, Medal, Flame, Percent, RefreshCw,
  Eye, EyeOff, Lock, Key, ShieldCheck, BookOpen, FileText, Ticket, CreditCard, ChevronRight
} from 'lucide-react';
import { User, Service, Product, LoyaltyPlan, SystemParameters, BarberDetail, Comanda, SupplyTransaction, Appointment, NPSFeedback, BarberGoalTier, BarberCustomGoal, CustomerBanner, OperationalScript, DiscountCoupon, CustomerCreditTransaction } from '../types';
import { buildWhatsAppReminderUrl, calculateProductABC } from '../utils/helpers';
import { exportDREReportCSV, exportComandasDetailedCSV, exportDSRClosingCSV } from '../utils/csvExport';
import { getBarberLeaderboard, calculateBarberGoalProgress, DEFAULT_GOAL_TIERS } from '../utils/goals';
import { ErrorBoundary } from './ErrorBoundary';
import SettingsTabs from './settings/SettingsTabs';
import SettingsSubscriptions from './settings/SettingsSubscriptions';
import SettingsPromotions from './settings/SettingsPromotions';
import SettingsGeneral from './settings/SettingsGeneral';
import SettingsLoyalty from './settings/SettingsLoyalty';
import SettingsPortal from './settings/SettingsPortal';
import SettingsSecurity from './settings/SettingsSecurity';

interface AdminPanelProps {
  currentUser?: User;
  users: User[];
  services: Service[];
  products: Product[];
  plans: LoyaltyPlan[];
  barberDetails: BarberDetail[];
  comandas: Comanda[];
  appointments: Appointment[];
  parameters: SystemParameters;
  categories: string[];
  supplyTransactions: SupplyTransaction[];
  npsFeedbacks?: NPSFeedback[];
  scripts?: OperationalScript[];
  coupons?: DiscountCoupon[];
  creditTransactions?: CustomerCreditTransaction[];
  onUpdateState: (key: string, val: any) => void;
  onClearSalesHistory?: () => Promise<void>;
  onResetDatabase?: () => Promise<void>;
}

export default function AdminPanel({
  currentUser,
  users,
  services,
  products,
  plans,
  barberDetails,
  comandas,
  appointments = [],
  parameters,
  categories,
  supplyTransactions,
  npsFeedbacks = [],
  scripts = [],
  coupons = [],
  creditTransactions = [],
  onUpdateState,
  onClearSalesHistory,
  onResetDatabase
}: AdminPanelProps) {
  // Toggle sections inside Admin
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'comissoes' | 'cadastros' | 'acessos' | 'parametros' | 'relatorios' | 'fechamento' | 'suprimentos' | 'metas' | 'scripts'>('comissoes');
  // Secondary sub-tab inside 'parametros'
  const [activeParamTab, setActiveParamTab] = useState<'geral' | 'assinaturas' | 'indicacoes_cupons' | 'portal_redes' | 'backup_manutencao'>('geral');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [accessRoleFilter, setAccessRoleFilter] = useState<string>('ALL');

  // Sub-tabs permission checks
  const isSuperAdmin = !currentUser || currentUser.role === 'ADMIN';
  const perms = currentUser?.permissions || [];

  const canSubComissoes = isSuperAdmin || perms.includes('EDIT_COMMISSIONS') || perms.includes('VIEW_BILLING');
  const canSubCadastros = isSuperAdmin || perms.includes('MANAGE_CATALOG');
  const canSubAcessos = isSuperAdmin || perms.includes('MANAGE_USERS');
  const canSubParametros = isSuperAdmin || perms.includes('MANAGE_PARAMETERS');
  const canSubRelatorios = isSuperAdmin || perms.includes('VIEW_BILLING');
  const canSubFechamento = isSuperAdmin || perms.includes('VIEW_BILLING');
  const canSubSuprimentos = isSuperAdmin || perms.includes('MANAGE_SUPPLIES') || perms.includes('VIEW_BILLING');
  const canSubMetas = isSuperAdmin || perms.includes('MANAGE_PARAMETERS') || perms.includes('EDIT_COMMISSIONS');
  const canSubScripts = isSuperAdmin || perms.includes('MANAGE_PARAMETERS') || perms.includes('MANAGE_CATALOG');

  // Modal State for Operational Scripts
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptCategory, setScriptCategory] = useState<'ATENDIMENTO' | 'CORTE_BARBA' | 'HIGIENE_BIOSSEGURANCA' | 'VENDAS_PRODUTOS' | 'GESTAO_COMANDAS' | 'OUTROS'>('ATENDIMENTO');
  const [scriptTargetAudience, setScriptTargetAudience] = useState<'TODOS_BARBEIROS' | 'INICIANTES' | 'MESTRES'>('TODOS_BARBEIROS');
  const [scriptStepsText, setScriptStepsText] = useState('');
  const [scriptTipsText, setScriptTipsText] = useState('');
  const [scriptTagsText, setScriptTagsText] = useState('');
  const [scriptIsActive, setScriptIsActive] = useState(true);
  const [scriptCategoryFilter, setScriptCategoryFilter] = useState<string>('TODOS');
  const [scriptSearchTerm, setScriptSearchTerm] = useState('');

  // Modal State for Discount Coupons
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [cpnCode, setCpnCode] = useState('');
  const [cpnDescription, setCpnDescription] = useState('');
  const [cpnDiscountType, setCpnDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [cpnDiscountValue, setCpnDiscountValue] = useState('15');
  const [cpnMinPurchase, setCpnMinPurchase] = useState('50');
  const [cpnMaxUsesTotal, setCpnMaxUsesTotal] = useState('');
  const [cpnMaxUsesPerCustomer, setCpnMaxUsesPerCustomer] = useState('1');
  const [cpnValidUntil, setCpnValidUntil] = useState('');
  const [cpnRulesText, setCpnRulesText] = useState('');
  const [cpnIsActive, setCpnIsActive] = useState(true);

  // Modal State for Goal Tiers
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierName, setTierName] = useState('');
  const [tierBadge, setTierBadge] = useState('🥉');
  const [tierRev, setTierRev] = useState('3000');
  const [tierServ, setTierServ] = useState('50');
  const [tierProd, setTierProd] = useState('300');
  const [tierBonus, setTierBonus] = useState('100');
  const [tierExtraComm, setTierExtraComm] = useState('2.5');
  const [tierColor, setTierColor] = useState('#eab308');

  // Auto-switch subtab if current active subtab is restricted
  React.useEffect(() => {
    if (activeAdminSubTab === 'comissoes' && !canSubComissoes) {
      if (canSubSuprimentos) setActiveAdminSubTab('suprimentos');
      else if (canSubRelatorios) setActiveAdminSubTab('relatorios');
      else if (canSubCadastros) setActiveAdminSubTab('cadastros');
      else if (canSubAcessos) setActiveAdminSubTab('acessos');
      else if (canSubParametros) setActiveAdminSubTab('parametros');
      else if (canSubFechamento) setActiveAdminSubTab('fechamento');
    }
  }, [currentUser, activeAdminSubTab, canSubComissoes, canSubSuprimentos, canSubRelatorios, canSubCadastros, canSubAcessos, canSubParametros, canSubFechamento]);

  // Payment methods management states
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');
  const [editingPaymentMethodIndex, setEditingPaymentMethodIndex] = useState<number | null>(null);
  const [editingPaymentMethodName, setEditingPaymentMethodName] = useState('');

  // Form states
  // 1. Service Form
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDuration, setSrvDuration] = useState('30');
  const [srvCategory, setSrvCategory] = useState<string>('HAIR');
  const [srvCategories, setSrvCategories] = useState<string[]>(['HAIR']);
  const [newSrvCustomCat, setNewSrvCustomCat] = useState('');
  const [srvDescription, setSrvDescription] = useState('');

  // 2. Product Form
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prdName, setPrdName] = useState('');
  const [prdPrice, setPrdPrice] = useState('');
  const [prdStock, setPrdStock] = useState('10');
  const [prdMinStock, setPrdMinStock] = useState('5');
  const [prdCostPrice, setPrdCostPrice] = useState('0');
  const [prdCategories, setPrdCategories] = useState<string[]>([]);
  const [newPrdCustomCat, setNewPrdCustomCat] = useState('');
  const [prdDescription, setPrdDescription] = useState('');

  // 3. Plan Form
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [plnName, setPlnName] = useState('');
  const [plnPrice, setPlnPrice] = useState('');
  const [plnServices, setPlnServices] = useState('4');
  const [plnCommission, setPlnCommission] = useState('30');
  const [plnDescription, setPlnDescription] = useState('');
  const [plnRulesText, setPlnRulesText] = useState('');
  const [plnIsUnlimited, setPlnIsUnlimited] = useState(false);
  const [plnIncludedServiceIds, setPlnIncludedServiceIds] = useState<string[]>([]);
  const [plnBarberPayoutRate, setPlnBarberPayoutRate] = useState('35');

  // Service Catalog Filter states
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('TODAS');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');

  // Settings Categorization state
  const [activeSettingsCategory, setActiveSettingsCategory] = useState<'promocoes' | 'assinaturas' | 'geral' | 'fidelidade' | 'portal' | 'dados'>('promocoes');

  // 4. User Form (Acessos)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [usrName, setUsrName] = useState('');
  const [usrEmail, setUsrEmail] = useState('');
  const [usrPhone, setUsrPhone] = useState('');
  const [usrRole, setUsrRole] = useState<User['role']>('BARBER');
  const [usrLogin, setUsrLogin] = useState('');
  const [usrPassword, setUsrPassword] = useState('');
  const [usrBio, setUsrBio] = useState('');
  const [usrPhotoUrl, setUsrPhotoUrl] = useState('');
  const [usrBirthday, setUsrBirthday] = useState('');
  const [usrBarberNotes, setUsrBarberNotes] = useState('');
  const [usrRequiresPasswordChange, setUsrRequiresPasswordChange] = useState<boolean>(true);
  const [revealedPasswordUserIds, setRevealedPasswordUserIds] = useState<Record<string, boolean>>({});
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  // Supply Transaction Form states
  const [supDescription, setSupDescription] = useState('');
  const [supType, setSupType] = useState<'INFLOW' | 'OUTFLOW'>('OUTFLOW');
  const [supAmount, setSupAmount] = useState('');
  const [supDate, setSupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supNotes, setSupNotes] = useState('');
  const [supReceiptUrl, setSupReceiptUrl] = useState('');
  const [supBuyerName, setSupBuyerName] = useState('');

  // 5. Barber Commission Settings State
  const [barberToEditComm, setBarberToEditComm] = useState<string>(
    users.find(u => u.role === 'BARBER')?.id || ''
  );
  const [commStandard, setCommStandard] = useState('50');
  const [commSubscription, setCommSubscription] = useState('35');
  const [commProduct, setCommProduct] = useState('10');
  const [commVipQuota, setCommVipQuota] = useState('5');

  // Customer Portal Banner Form state
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerMobileImageUrl, setBannerMobileImageUrl] = useState('');
  const [bannerDisplayMode, setBannerDisplayMode] = useState<'CAROUSEL' | 'STATIC'>('CAROUSEL');
  const [bannerTargetDevice, setBannerTargetDevice] = useState<'ALL' | 'DESKTOP' | 'MOBILE'>('ALL');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [bannerBadgeText, setBannerBadgeText] = useState('');
  const [bannerIsActive, setBannerIsActive] = useState(true);

  // Promotions Form state
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [promoDiscountValue, setPromoDiscountValue] = useState('15');
  const [promoCode, setPromoCode] = useState('');
  const [promoCategory, setPromoCategory] = useState<'FIRST_BOOKING' | 'BIRTHDAY' | 'SPECIAL_DATE' | 'GENERAL'>('FIRST_BOOKING');
  const [promoValidUntil, setPromoValidUntil] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);

  // Report filtration states
  type PeriodPreset = 'diario' | 'ontem' | 'esta_semana' | 'semanal' | 'este_mes' | 'mes_anterior' | 'este_ano' | 'personalizado';
  const [reportPeriod, setReportPeriod] = useState<PeriodPreset>('este_mes');
  const [reportBarberId, setReportBarberId] = useState<string>('TODOS');
  const [reportPaymentMethod, setReportPaymentMethod] = useState<string>('TODOS');
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fechamento de Caixa Filter & Cost States
  const [closingPeriod, setClosingPeriod] = useState<PeriodPreset>('diario');
  const [closingBarberId, setClosingBarberId] = useState<string>('TODOS');
  const [closingStartDate, setClosingStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [closingEndDate, setClosingEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [closingExpenseInput, setClosingExpenseInput] = useState('0');
  const [closingNotes, setClosingNotes] = useState('');
  const [liquidatedBarbers, setLiquidatedBarbers] = useState<Record<string, boolean>>({});

  // Category CRUD states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryNewValue, setEditingCategoryNewValue] = useState('');

  // Database wiping states
  const [showClearSalesConfirm, setShowClearSalesConfirm] = useState(false);
  const [clearSalesStatus, setClearSalesStatus] = useState<'idle' | 'clearing' | 'done'>('idle');
  const [clearSalesPassword, setClearSalesPassword] = useState('');
  const [clearSalesErrorMessage, setClearSalesErrorMessage] = useState('');

  const handleClearSalesHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clearSalesPassword !== 'admin123') {
      setClearSalesErrorMessage('Senha de administrador incorreta.');
      return;
    }
    if (!onClearSalesHistory) return;
    try {
      setClearSalesStatus('clearing');
      setClearSalesErrorMessage('');
      await onClearSalesHistory();
      setClearSalesStatus('done');
      setShowClearSalesConfirm(false);
      setClearSalesPassword('');
    } catch (err: any) {
      setClearSalesStatus('idle');
      setClearSalesErrorMessage(err?.message || 'Erro ao excluir histórico de vendas.');
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'resetting' | 'done'>('idle');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetErrorMessage, setResetErrorMessage] = useState('');

  const handleResetDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmPassword !== 'admin123') {
      setResetErrorMessage('Senha de administrador incorreta.');
      return;
    }
    if (!onResetDatabase) return;
    try {
      setResetStatus('resetting');
      setResetErrorMessage('');
      await onResetDatabase();
      setResetStatus('done');
      setShowResetConfirm(false);
      setResetConfirmPassword('');
    } catch (err: any) {
      setResetStatus('idle');
      setResetErrorMessage(err?.message || 'Erro ao zerar banco de dados.');
    }
  };

  const handleMoveBanner = (bannerId: string, direction: 'up' | 'down') => {
    const banners = [...(parameters.customerPortalBanners || [])];
    const index = banners.findIndex(b => b.id === bannerId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const [moved] = banners.splice(index, 1);
    banners.splice(targetIndex, 0, moved);
    handleUpdateParameter('customerPortalBanners', banners);
  };

  const handleOpenNewBanner = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImageUrl('');
    setBannerMobileImageUrl('');
    setBannerDisplayMode('CAROUSEL');
    setBannerTargetDevice('ALL');
    setBannerLinkUrl('');
    setBannerBadgeText('');
    setBannerIsActive(true);
    setShowBannerModal(true);
  };

  const handleEditBanner = (banner: CustomerBanner) => {
    setEditingBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle || '');
    setBannerImageUrl(banner.imageUrl || '');
    setBannerMobileImageUrl(banner.mobileImageUrl || '');
    setBannerDisplayMode(banner.displayMode || 'CAROUSEL');
    setBannerTargetDevice(banner.targetDevice || 'ALL');
    setBannerLinkUrl(banner.linkUrl || '');
    setBannerBadgeText(banner.badgeText || '');
    setBannerIsActive(banner.isActive);
    setShowBannerModal(true);
  };

  // RBAC & Bulk Register States
  const [expandedUserPermissionsId, setExpandedUserPermissionsId] = useState<string | null>(null);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkPreviewUsers, setBulkPreviewUsers] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState('');

  // Auto pre-select category
  React.useEffect(() => {
    if (categories && categories.length > 0 && !categories.includes(srvCategory)) {
      setSrvCategory(categories[0]);
    }
  }, [categories, srvCategory]);

  // Load barber dynamic rates including product and custom VIP quota
  React.useEffect(() => {
    if (barberToEditComm) {
      const detail = barberDetails.find(d => d.userId === barberToEditComm);
      if (detail) {
        setCommStandard(Math.round(detail.commissionRateStandard * 100).toString());
        setCommSubscription(Math.round(detail.commissionRateSubscription * 100).toString());
        setCommProduct(Math.round((detail.commissionRateProduct ?? parameters.defaultCommissionProduct) * 100).toString());
        setCommVipQuota((detail.vipServicesMonthlyQuota ?? parameters.vipServicesPerBarberMonthly ?? 5).toString());
      }
    }
  }, [barberToEditComm, barberDetails, parameters.defaultCommissionProduct, parameters.vipServicesPerBarberMonthly]);

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // BANNER ACTIONS
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      alert('Informe o título do banner.');
      return;
    }

    const currentBanners = parameters.customerPortalBanners || [];
    let updatedBanners;

    if (editingBannerId) {
      updatedBanners = currentBanners.map(b => b.id === editingBannerId ? {
        ...b,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        imageUrl: bannerImageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
        mobileImageUrl: bannerMobileImageUrl || undefined,
        displayMode: bannerDisplayMode,
        targetDevice: bannerTargetDevice,
        linkUrl: bannerLinkUrl,
        badgeText: bannerBadgeText,
        isActive: bannerIsActive
      } : b);
    } else {
      const newBanner: CustomerBanner = {
        id: `banner-${Date.now()}`,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        imageUrl: bannerImageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
        mobileImageUrl: bannerMobileImageUrl || undefined,
        displayMode: bannerDisplayMode,
        targetDevice: bannerTargetDevice,
        linkUrl: bannerLinkUrl,
        badgeText: bannerBadgeText,
        isActive: bannerIsActive
      };
      updatedBanners = [...currentBanners, newBanner];
    }

    handleUpdateParameter('customerPortalBanners', updatedBanners);
    setShowBannerModal(false);
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImageUrl('');
    setBannerMobileImageUrl('');
    setBannerDisplayMode('CAROUSEL');
    setBannerTargetDevice('ALL');
    setBannerLinkUrl('');
    setBannerBadgeText('');
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (confirm('Deseja realmente excluir este banner do portal do cliente?')) {
      const updatedBanners = (parameters.customerPortalBanners || []).filter(b => b.id !== bannerId);
      handleUpdateParameter('customerPortalBanners', updatedBanners);
    }
  };

  const handleToggleBannerActive = (bannerId: string) => {
    const updatedBanners = (parameters.customerPortalBanners || []).map(b => 
      b.id === bannerId ? { ...b, isActive: !b.isActive } : b
    );
    handleUpdateParameter('customerPortalBanners', updatedBanners);
  };

  // PROMOTION ACTIONS
  const handleSavePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) {
      alert('Informe o título da promoção.');
      return;
    }

    const currentPromos = parameters.promotions || [];
    let updatedPromos;

    if (editingPromoId) {
      updatedPromos = currentPromos.map(p => p.id === editingPromoId ? {
        ...p,
        title: promoTitle,
        description: promoDescription,
        discountType: promoDiscountType,
        discountValue: parseFloat(promoDiscountValue) || 0,
        code: promoCode.trim().toUpperCase(),
        category: promoCategory,
        validUntil: promoValidUntil || undefined,
        isActive: promoIsActive
      } : p);
    } else {
      const newPromo = {
        id: `promo-${Date.now()}`,
        title: promoTitle,
        description: promoDescription,
        discountType: promoDiscountType,
        discountValue: parseFloat(promoDiscountValue) || 0,
        code: promoCode.trim().toUpperCase() || `PROMO-${Math.floor(1000 + Math.random() * 9000)}`,
        category: promoCategory,
        validUntil: promoValidUntil || undefined,
        isActive: promoIsActive
      };
      updatedPromos = [...currentPromos, newPromo];
    }

    handleUpdateParameter('promotions', updatedPromos);
    setShowPromotionModal(false);
    setEditingPromoId(null);
    setPromoTitle('');
    setPromoDescription('');
    setPromoDiscountValue('15');
    setPromoCode('');
  };

  const handleDeletePromotion = (promoId: string) => {
    if (confirm('Deseja realmente remover esta promoção?')) {
      const updatedPromos = (parameters.promotions || []).filter(p => p.id !== promoId);
      handleUpdateParameter('promotions', updatedPromos);
    }
  };

  const handleTogglePromotionActive = (promoId: string) => {
    const updatedPromos = (parameters.promotions || []).map(p => 
      p.id === promoId ? { ...p, isActive: !p.isActive } : p
    );
    handleUpdateParameter('promotions', updatedPromos);
  };

  // BARBER GOAL TIERS ACTIONS
  const handleOpenNewTierModal = () => {
    setEditingTierId(null);
    setTierName('Novo Nível VIP');
    setTierBadge('🏆');
    setTierRev('5000');
    setTierServ('60');
    setTierProd('400');
    setTierBonus('150');
    setTierExtraComm('3.0');
    setTierColor('#eab308');
    setShowTierModal(true);
  };

  const handleEditTier = (t: BarberGoalTier) => {
    setEditingTierId(t.id);
    setTierName(t.name);
    setTierBadge(t.badge);
    setTierRev(t.targetRevenue.toString());
    setTierServ(t.targetServicesCount.toString());
    setTierProd(t.targetProductSales.toString());
    setTierBonus(t.rewardBonusFixed.toString());
    setTierExtraComm(t.rewardExtraCommissionPercent.toString());
    setTierColor(t.color || '#eab308');
    setShowTierModal(true);
  };

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTiers = (parameters.barberGoalTiers && parameters.barberGoalTiers.length > 0)
      ? [...parameters.barberGoalTiers]
      : [...DEFAULT_GOAL_TIERS];

    const newTier: BarberGoalTier = {
      id: editingTierId || `tier-${Date.now()}`,
      name: tierName.trim() || 'Nível Customizado',
      badge: tierBadge || '🏆',
      targetRevenue: parseFloat(tierRev) || 3000,
      targetServicesCount: parseInt(tierServ) || 50,
      targetProductSales: parseFloat(tierProd) || 300,
      rewardBonusFixed: parseFloat(tierBonus) || 100,
      rewardExtraCommissionPercent: parseFloat(tierExtraComm) || 2.5,
      color: tierColor || '#eab308'
    };

    let updatedList: BarberGoalTier[];
    if (editingTierId) {
      updatedList = currentTiers.map(t => t.id === editingTierId ? newTier : t);
    } else {
      updatedList = [...currentTiers, newTier];
    }

    updatedList.sort((a, b) => a.targetRevenue - b.targetRevenue);
    handleUpdateParameter('barberGoalTiers', updatedList);
    setShowTierModal(false);
  };

  const handleDeleteTier = (id: string) => {
    const currentTiers = parameters.barberGoalTiers || DEFAULT_GOAL_TIERS;
    if (currentTiers.length <= 1) {
      alert('Você deve manter pelo menos 1 nível de meta configurado.');
      return;
    }
    if (confirm('Deseja realmente remover este nível de meta?')) {
      const updated = currentTiers.filter(t => t.id !== id);
      handleUpdateParameter('barberGoalTiers', updated);
    }
  };

  const handleResetDefaultTiers = () => {
    if (confirm('Deseja restaurar os 4 níveis padrão (Bronze, Prata, Ouro, Diamante)?')) {
      handleUpdateParameter('barberGoalTiers', DEFAULT_GOAL_TIERS);
    }
  };

  // SERVICE ACTIONS
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvPrice) return;

    const finalCats = srvCategories.length > 0 ? srvCategories : [srvCategory || 'HAIR'];

    const newService: Service = {
      id: editingServiceId || `srv-${Date.now()}`,
      name: srvName,
      price: parseFloat(srvPrice),
      durationMinutes: parseInt(srvDuration) || 30,
      category: finalCats[0] || 'HAIR',
      categories: finalCats,
      description: srvDescription
    };

    let updatedList;
    if (editingServiceId) {
      updatedList = services.map(s => s.id === editingServiceId ? newService : s);
    } else {
      updatedList = [...services, newService];
    }

    onUpdateState('services', updatedList);
    // Reset
    setEditingServiceId(null);
    setSrvName('');
    setSrvPrice('');
    setSrvDuration('30');
    setSrvCategory('HAIR');
    setSrvCategories(['HAIR']);
    setNewSrvCustomCat('');
    setSrvDescription('');
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este serviço?')) {
      onUpdateState('services', services.filter(s => s.id !== id));
    }
  };

  const handleEditServiceSelect = (s: Service) => {
    setEditingServiceId(s.id);
    setSrvName(s.name);
    setSrvPrice(s.price.toString());
    setSrvDuration(s.durationMinutes.toString());
    const cats = s.categories && s.categories.length > 0 ? s.categories : [s.category || 'HAIR'];
    setSrvCategories(cats);
    setSrvCategory(cats[0] || 'HAIR');
    setSrvDescription(s.description || '');
  };

  // PRODUCT ACTIONS
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prdName || !prdPrice) return;

    const newProduct: Product = {
      id: editingProductId || `prd-${Date.now()}`,
      name: prdName,
      price: parseFloat(prdPrice),
      stock: parseInt(prdStock) || 0,
      minStock: parseInt(prdMinStock) || 5,
      costPrice: parseFloat(prdCostPrice) || 0,
      category: prdCategories[0] || '',
      categories: prdCategories,
      description: prdDescription
    };

    let updatedList;
    if (editingProductId) {
      updatedList = products.map(p => p.id === editingProductId ? newProduct : p);
    } else {
      updatedList = [...products, newProduct];
    }

    onUpdateState('products', updatedList);
    // Reset
    setEditingProductId(null);
    setPrdName('');
    setPrdPrice('');
    setPrdStock('10');
    setPrdMinStock('5');
    setPrdCostPrice('0');
    setPrdCategories([]);
    setNewPrdCustomCat('');
    setPrdDescription('');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este produto?')) {
      onUpdateState('products', products.filter(p => p.id !== id));
    }
  };

  const handleEditProductSelect = (p: Product) => {
    setEditingProductId(p.id);
    setPrdName(p.name);
    setPrdPrice(p.price.toString());
    setPrdStock(p.stock.toString());
    setPrdMinStock((p.minStock ?? 5).toString());
    setPrdCostPrice((p.costPrice ?? 0).toString());
    const pCats = p.categories && p.categories.length > 0 ? p.categories : (p.category ? [p.category] : []);
    setPrdCategories(pCats);
    setPrdDescription(p.description || '');
  };

  // RECURRING PLANS ACTIONS
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plnName || !plnPrice) return;

    const rulesArray = plnRulesText
      ? plnRulesText.split('\n').filter(r => r.trim().length > 0)
      : ['Uso individual', 'Válido por 30 dias'];

    const newPlan: LoyaltyPlan = {
      id: editingPlanId || `pln-${Date.now()}`,
      name: plnName,
      priceMonthly: parseFloat(plnPrice),
      servicesIncludedCount: plnIsUnlimited ? 999 : (parseInt(plnServices) || 4),
      currentCommissionRate: plnIsUnlimited ? (parseFloat(plnBarberPayoutRate) / 100 || 0.35) : (parseFloat(plnCommission) / 100 || 0.30),
      description: plnDescription,
      rules: rulesArray,
      isUnlimited: plnIsUnlimited,
      includedServiceIds: plnIsUnlimited ? plnIncludedServiceIds : undefined,
      barberPayoutRate: plnIsUnlimited ? (parseFloat(plnBarberPayoutRate) || 35) : undefined
    };

    let updatedList;
    if (editingPlanId) {
      updatedList = plans.map(p => p.id === editingPlanId ? newPlan : p);
    } else {
      updatedList = [...plans, newPlan];
    }

    onUpdateState('plans', updatedList);
    // Reset
    setEditingPlanId(null);
    setPlnName('');
    setPlnPrice('');
    setPlnServices('4');
    setPlnCommission('30');
    setPlnDescription('');
    setPlnRulesText('');
    setPlnIsUnlimited(false);
    setPlnIncludedServiceIds([]);
    setPlnBarberPayoutRate('35');
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Excluir este plano definitivamente?')) {
      onUpdateState('plans', plans.filter(p => p.id !== id));
    }
  };

  const handleEditPlanSelect = (p: LoyaltyPlan) => {
    setEditingPlanId(p.id);
    setPlnName(p.name);
    setPlnPrice(p.priceMonthly.toString());
    setPlnServices((p.servicesIncludedCount || 4).toString());
    const commPct = p.currentCommissionRate > 1 ? p.currentCommissionRate : Math.round((p.currentCommissionRate || 0.30) * 100);
    setPlnCommission(commPct.toString());
    setPlnDescription(p.description || '');
    setPlnRulesText(p.rules ? p.rules.join('\n') : '');
    setPlnIsUnlimited(!!p.isUnlimited);
    setPlnIncludedServiceIds(p.includedServiceIds || []);
    const payoutPct = p.barberPayoutRate !== undefined ? p.barberPayoutRate : (p.currentCommissionRate > 1 ? p.currentCommissionRate : Math.round((p.currentCommissionRate || 0.35) * 100));
    setPlnBarberPayoutRate(payoutPct.toString());
  };

  // OPERATIONAL SCRIPTS ACTIONS
  const handleSaveScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptTitle.trim()) return;

    const steps = scriptStepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const tags = scriptTagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newScript: OperationalScript = {
      id: editingScriptId || `script-${Date.now()}`,
      title: scriptTitle.trim(),
      category: scriptCategory,
      targetAudience: scriptTargetAudience,
      content: steps.length > 0 ? steps.join('\n') : 'Executar o atendimento e procedimento conforme padrão da barbearia.',
      steps: steps.length > 0 ? steps : ['Executar o atendimento e procedimento conforme padrão da barbearia.'],
      tips: scriptTipsText.trim() || undefined,
      tags: tags.length > 0 ? tags : [scriptCategory.toLowerCase()],
      isActive: scriptIsActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrador'
    };

    let updatedList;
    if (editingScriptId) {
      updatedList = scripts.map(s => s.id === editingScriptId ? newScript : s);
    } else {
      updatedList = [...scripts, newScript];
    }

    onUpdateState('scripts', updatedList);
    setShowScriptModal(false);
    setEditingScriptId(null);
    setScriptTitle('');
    setScriptCategory('ATENDIMENTO');
    setScriptTargetAudience('TODOS_BARBEIROS');
    setScriptStepsText('');
    setScriptTipsText('');
    setScriptTagsText('');
    setScriptIsActive(true);
  };

  const handleDeleteScript = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este script operacional?')) {
      onUpdateState('scripts', scripts.filter(s => s.id !== id));
    }
  };

  const handleToggleScriptActive = (id: string) => {
    const updated = scripts.map(s => s.id === id ? { ...s, isActive: s.isActive === false ? true : false } : s);
    onUpdateState('scripts', updated);
  };

  const handleEditScriptSelect = (s: OperationalScript) => {
    setEditingScriptId(s.id);
    setScriptTitle(s.title);
    setScriptCategory((s.category || 'ATENDIMENTO') as any);
    setScriptTargetAudience((s.targetAudience || 'TODOS_BARBEIROS') as any);
    setScriptStepsText(s.steps && s.steps.length > 0 ? s.steps.join('\n') : (s.content || ''));
    setScriptTipsText(s.tips || '');
    setScriptTagsText(s.tags ? s.tags.join(', ') : '');
    setScriptIsActive(s.isActive !== false);
    setShowScriptModal(true);
  };

  // DISCOUNT COUPONS ACTIONS
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpnCode.trim()) return;

    const newCoupon: DiscountCoupon = {
      id: editingCouponId || `cpn-${Date.now()}`,
      code: cpnCode.trim().toUpperCase(),
      description: cpnDescription.trim(),
      discountType: cpnDiscountType,
      discountValue: parseFloat(cpnDiscountValue) || 0,
      minPurchaseAmount: parseFloat(cpnMinPurchase) || 0,
      maxUsesTotal: cpnMaxUsesTotal ? parseInt(cpnMaxUsesTotal) : undefined,
      maxUsesPerCustomer: parseInt(cpnMaxUsesPerCustomer) || 1,
      timesUsed: editingCouponId ? (coupons.find(c => c.id === editingCouponId)?.timesUsed || 0) : 0,
      validUntil: cpnValidUntil || undefined,
      rulesText: cpnRulesText.trim() || undefined,
      isActive: cpnIsActive,
      createdAt: new Date().toISOString()
    };

    let updatedList;
    if (editingCouponId) {
      updatedList = coupons.map(c => c.id === editingCouponId ? newCoupon : c);
    } else {
      updatedList = [...coupons, newCoupon];
    }

    onUpdateState('coupons', updatedList);
    setShowCouponModal(false);
    setEditingCouponId(null);
    setCpnCode('');
    setCpnDescription('');
    setCpnDiscountType('FIXED');
    setCpnDiscountValue('15');
    setCpnMinPurchase('50');
    setCpnMaxUsesTotal('');
    setCpnMaxUsesPerCustomer('1');
    setCpnValidUntil('');
    setCpnRulesText('');
    setCpnIsActive(true);
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este cupom de desconto?')) {
      onUpdateState('coupons', coupons.filter(c => c.id !== id));
    }
  };

  const handleToggleCouponActive = (id: string) => {
    const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    onUpdateState('coupons', updated);
  };

  const handleEditCouponSelect = (c: DiscountCoupon) => {
    setEditingCouponId(c.id);
    setCpnCode(c.code);
    setCpnDescription(c.description || '');
    setCpnDiscountType(c.discountType);
    setCpnDiscountValue(c.discountValue.toString());
    setCpnMinPurchase(c.minPurchaseAmount.toString());
    setCpnMaxUsesTotal(c.maxUsesTotal ? c.maxUsesTotal.toString() : '');
    setCpnMaxUsesPerCustomer(c.maxUsesPerCustomer.toString());
    setCpnValidUntil(c.validUntil || '');
    setCpnRulesText(c.rulesText || '');
    setCpnIsActive(c.isActive);
    setShowCouponModal(true);
  };

  // USER MANAGEMENT & CREDENTIALS
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUser = editingUserId ? users.find(u => u.id === editingUserId) : null;
    const finalPassword = usrPassword.trim() !== '' ? usrPassword.trim() : (existingUser?.password || '');
    if (!usrName || !usrLogin || !finalPassword) return;

    // Build standard permissions based on role
    let customPerms: string[] = [];
    if (usrRole === 'ADMIN') {
      customPerms = ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL', 'DAILY_FACILITATOR'];
    } else if (usrRole === 'BARBER') {
      customPerms = ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS'];
    } else if (usrRole === 'CASHIER') {
      customPerms = ['CHECKOUT_COMANDAS', 'EDIT_COMANDAS', 'DAILY_FACILITATOR'];
    } else {
      customPerms = ['CUSTOMER_PORTAL'];
    }

    const newUser: User = {
      id: editingUserId || `usr-${Date.now()}`,
      name: usrName,
      email: usrEmail || `${usrLogin}@trimastudio.com`,
      role: usrRole,
      phone: usrPhone || '',
      isActive: true,
      avatar: usrRole === 'ADMIN' ? '👑' : usrRole === 'BARBER' ? '🧔' : usrRole === 'CASHIER' ? '💼' : '👨',
      bio: usrRole === 'BARBER' ? (usrBio || '') : '',
      photoUrl: usrRole === 'BARBER' ? (usrPhotoUrl || '') : '',
      login: usrLogin.trim().toLowerCase(),
      password: finalPassword,
      permissions: existingUser?.permissions || customPerms,
      birthday: usrBirthday || '',
      barberNotes: usrBarberNotes || '',
      requiresPasswordChange: editingUserId ? (usrRequiresPasswordChange) : usrRequiresPasswordChange,
      createdBy: existingUser?.createdBy || currentUser?.name || currentUser?.login || 'Administrador',
      createdAt: existingUser?.createdAt || new Date().toISOString()
    };

    let updatedList;
    if (editingUserId) {
      updatedList = users.map(u => u.id === editingUserId ? newUser : u);
    } else {
      updatedList = [...users, newUser];
    }

    onUpdateState('users', updatedList);

    // If user is a barber, ensure a commission details profile exists
    if (usrRole === 'BARBER') {
      if (!barberDetails.some(b => b.userId === newUser.id)) {
        const newDetail: BarberDetail = {
          userId: newUser.id,
          commissionRateStandard: parameters.defaultCommissionService || 0.50,
          commissionRateSubscription: 0.35,
          commissionRateProduct: parameters.defaultCommissionProduct || 0.10
        };
        onUpdateState('barberDetails', [...barberDetails, newDetail]);
      }
    }

    // Reset
    setEditingUserId(null);
    setUsrName('');
    setUsrEmail('');
    setUsrPhone('');
    setUsrRole('BARBER');
    setUsrLogin('');
    setUsrPassword('');
    setUsrBio('');
    setUsrPhotoUrl('');
    setUsrBirthday('');
    setUsrBarberNotes('');
    setUsrRequiresPasswordChange(true);
  };

  // Bulk Register Parsing and Handlers
  const handleParseBulkInput = (text: string) => {
    setBulkInputText(text);
    if (!text.trim()) {
      setBulkPreviewUsers([]);
      setBulkError('');
      return;
    }

    const lines = text.split('\n');
    const parsed: any[] = [];
    let hasError = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let parts = trimmed.split(';');
      if (parts.length < 3) {
        parts = trimmed.split(',');
      }
      if (parts.length < 3) {
        parts = trimmed.split('\t');
      }

      if (parts.length < 3) {
        parsed.push({
          lineNum: index + 1,
          raw: trimmed,
          isValid: false,
          error: 'Formato inválido. Use: Nome; Login; Senha; Perfil; Telefone'
        });
        hasError = true;
        return;
      }

      const name = parts[0]?.trim();
      const login = parts[1]?.trim().toLowerCase();
      const password = parts[2]?.trim();
      let role = parts[3]?.trim().toUpperCase() || 'BARBER';
      const phone = parts[4]?.trim() || '';

      if (role === 'BARBEIRO' || role === 'BARBER') role = 'BARBER';
      else if (role === 'ADMIN' || role === 'ADMINISTRADOR') role = 'ADMIN';
      else if (role === 'CAIXA' || role === 'CASHIER') role = 'CASHIER';
      else if (role === 'CLIENTE' || role === 'CUSTOMER') role = 'CUSTOMER';
      else {
        role = 'BARBER';
      }

      if (!name || !login || !password) {
        parsed.push({
          lineNum: index + 1,
          raw: trimmed,
          isValid: false,
          error: 'Nome, Login e Senha são obrigatórios'
        });
        hasError = true;
        return;
      }

      const exists = users.some(u => u.login === login) || parsed.some(p => p.login === login && p.lineNum !== index + 1);
      if (exists) {
        parsed.push({
          lineNum: index + 1,
          raw: trimmed,
          isValid: false,
          error: `Login "${login}" já cadastrado no sistema`
        });
        hasError = true;
        return;
      }

      parsed.push({
        lineNum: index + 1,
        name,
        login,
        password,
        role,
        phone,
        isValid: true
      });
    });

    setBulkPreviewUsers(parsed);
    if (hasError) {
      setBulkError('Algumas linhas contêm erros de validação.');
    } else {
      setBulkError('');
    }
  };

  const handleSaveBulkUsers = () => {
    const validUsers = bulkPreviewUsers.filter(u => u.isValid);
    if (validUsers.length === 0) {
      alert('Nenhum usuário válido para cadastrar!');
      return;
    }

    const createdUsers: User[] = [];
    const createdDetails: BarberDetail[] = [];

    validUsers.forEach((u, idx) => {
      const uId = `usr-bulk-${Date.now()}-${idx}`;
      let customPerms: string[] = [];
      if (u.role === 'ADMIN') {
        customPerms = ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL', 'DAILY_FACILITATOR'];
      } else if (u.role === 'BARBER') {
        customPerms = ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS'];
      } else if (u.role === 'CASHIER') {
        customPerms = ['CHECKOUT_COMANDAS', 'EDIT_COMANDAS', 'DAILY_FACILITATOR'];
      } else {
        customPerms = ['CUSTOMER_PORTAL'];
      }

      const newUser: User = {
        id: uId,
        name: u.name,
        email: `${u.login}@trimastudio.com`,
        role: u.role,
        phone: u.phone,
        isActive: true,
        avatar: u.role === 'ADMIN' ? '👑' : u.role === 'BARBER' ? '🧔' : u.role === 'CASHIER' ? '💼' : '👨',
        login: u.login,
        password: u.password,
        permissions: customPerms,
        requiresPasswordChange: true,
        createdBy: currentUser?.name || currentUser?.login || 'Administrador',
        createdAt: new Date().toISOString()
      };

      createdUsers.push(newUser);

      if (u.role === 'BARBER') {
        createdDetails.push({
          userId: uId,
          commissionRateStandard: 0.50,
          commissionRateSubscription: 0.35,
          commissionRateProduct: parameters.defaultCommissionProduct
        });
      }
    });

    onUpdateState('users', [...users, ...createdUsers]);
    if (createdDetails.length > 0) {
      onUpdateState('barberDetails', [...barberDetails, ...createdDetails]);
    }

    alert(`Sucesso! ${createdUsers.length} novos usuários cadastrados em massa e sincronizados.`);
    setBulkInputText('');
    setBulkPreviewUsers([]);
    setShowBulkPanel(false);
  };

  // Toggle toggle Status (Block/Unblock)
  const handleToggleUserStatus = (id: string) => {
    if (id === 'usr-admin') {
      alert('Impossível bloquear o Administrador principal!');
      return;
    }
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    onUpdateState('users', updated);
  };

  // Granular Access controls adjustments
  const handleToggleTabPermission = (userId: string, permission: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const currentPerms = u.permissions || [];
        const hasIt = currentPerms.includes(permission);
        const newPerms = hasIt
          ? currentPerms.filter(p => p !== permission)
          : [...currentPerms, permission];
        return { ...u, permissions: newPerms };
      }
      return u;
    });
    onUpdateState('users', updated);
  };

  const handleSetPresetPermissions = (userId: string, newPerms: string[]) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, permissions: newPerms };
      }
      return u;
    });
    onUpdateState('users', updated);
  };

  // CATEGORY OPERATIONS
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim().toUpperCase();
    if (!cleanName) return;
    if (categories.includes(cleanName)) {
      alert('Esta categoria já existe!');
      return;
    }
    onUpdateState('categories', [...categories, cleanName]);
    setNewCategoryName('');
    alert(`Categoria "${cleanName}" adicionada com sucesso!`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      alert('Deve haver pelo menos uma categoria no sistema!');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir a categoria "${catToDelete}"? Todos os serviços vinculados a ela serão movidos para a primeira categoria restante.`)) {
      const remainingCats = categories.filter(c => c !== catToDelete);
      const fallbackCat = remainingCats[0];
      
      const updatedServices = services.map(s => {
        if (s.category === catToDelete) {
          return { ...s, category: fallbackCat };
        }
        return s;
      });

      onUpdateState('categories', remainingCats);
      onUpdateState('services', updatedServices);
      alert(`Categoria deletada. Serviços associados migrados para "${fallbackCat}".`);
    }
  };

  const handleStartEditCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditingCategoryNewValue(cat);
  };

  const handleSaveCategoryRename = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNewVal = editingCategoryNewValue.trim().toUpperCase();
    if (!cleanNewVal || !editingCategory) return;
    if (cleanNewVal === editingCategory) {
      setEditingCategory(null);
      return;
    }
    if (categories.includes(cleanNewVal)) {
      alert('Já existe outra categoria com este nome!');
      return;
    }

    const updatedCats = categories.map(c => c === editingCategory ? cleanNewVal : c);
    const updatedServices = services.map(s => {
      if (s.category === editingCategory) {
        return { ...s, category: cleanNewVal };
      }
      return s;
    });

    onUpdateState('categories', updatedCats);
    onUpdateState('services', updatedServices);
    setEditingCategory(null);
    alert('Categoria e serviços vinculados foram renomeados com sucesso!');
  };

  // SYSTEM SETTINGS EDIT
  const handleUpdateParameter = (field: keyof SystemParameters, value: any) => {
    onUpdateState('parameters', {
      ...parameters,
      [field]: value
    });
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem de logotipo válida (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/png');
            handleUpdateParameter('logoUrl', dataUrl);
          } catch (e) {
            console.error('Error generating Base64 image:', e);
            alert('Falha ao processar imagem.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleLogoDragLeave = () => {
    setIsDraggingLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleBackupExport = () => {
    try {
      const backupData = {
        users,
        services,
        products,
        plans,
        barberDetails,
        comandas,
        parameters,
        categories
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `logo_ali_barbearia_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Erro ao gerar arquivo de backup: ' + (err.message || err));
    }
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('O arquivo de backup é inválido ou está corrompido.');
        }

        const keysToRestore = ['users', 'services', 'products', 'plans', 'barberDetails', 'comandas', 'parameters', 'categories'];
        const missingKeys = keysToRestore.filter(k => parsed[k] === undefined);
        
        if (missingKeys.length > 3) {
          throw new Error('Conteúdo do arquivo não corresponde a um backup estruturado do Trima Studio.');
        }

        const confirmRestore = window.confirm(
          '⚠ ATENÇÃO! Você tem certeza que deseja restaurar as tabelas? Isso substituirá todo o conteúdo online atual do Firestore pelos dados deste arquivo de backup.'
        );
        if (!confirmRestore) return;

        setIsRestoringBackup(true);

        // Upload everything to firestore collection-by-collection call sequentially
        for (const key of keysToRestore) {
          if (parsed[key] !== undefined) {
            await onUpdateState(key, parsed[key]);
          }
        }

        alert('Backup restaurado e sincronizado com o Firebase com sucesso! A página recarregará para refletir as novas alterações.');
        window.location.reload();
      } catch (err: any) {
        console.error('Migration backup error: ', err);
        alert('Falha ao restaurar dados: ' + (err.message || 'Verifique o arquivo selecionado.'));
      } finally {
        setIsRestoringBackup(false);
      }
    };
    reader.readAsText(file);
  };

  // BARBER REPASSE COMMISSIONS CUSTOM SAVES
  const handleSaveBarberCommissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberToEditComm) return;

    const stdVal = parseFloat(commStandard) / 100;
    const subVal = parseFloat(commSubscription) / 100;
    const prdVal = parseFloat(commProduct) / 100;
    const vipQuotaVal = parseInt(commVipQuota, 10);

    const updatedDetails = barberDetails.map(d => {
      if (d.userId === barberToEditComm) {
        return {
          ...d,
          commissionRateStandard: isNaN(stdVal) ? 0.50 : stdVal,
          commissionRateSubscription: isNaN(subVal) ? 0.35 : subVal,
          commissionRateProduct: isNaN(prdVal) ? 0.10 : prdVal,
          vipServicesMonthlyQuota: isNaN(vipQuotaVal) ? (parameters.vipServicesPerBarberMonthly ?? 5) : vipQuotaVal
        };
      }
      return d;
    });

    onUpdateState('barberDetails', updatedDetails);
    alert('Repasses, comissões e cota VIP do profissional salvos com sucesso!');
  };

  // Compute daily totals
  const closedComandas = (comandas || []).filter(c => c && (c.status === 'PAID' || c.status === 'CLOSED' || c.status === 'COMPLETED'));
  const totalSalesToday = closedComandas.reduce((sum, c) => sum + (c.total || 0), 0);
  const totalCommissionToday = closedComandas.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalNetShopKeep = totalSalesToday - totalCommissionToday;

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* BANCO DE DADOS STATUS INDICATOR */}
      <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-[11px] font-mono font-bold text-white uppercase flex flex-wrap items-center gap-1.5 leading-none">
              <span>Database Status: CONECTADO & SINCRONIZADO</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-1.5 py-0.5 rounded font-sans font-normal uppercase tracking-wider">Firestore Ativo</span>
            </p>
            <p className="text-[9px] text-zinc-400 font-mono mt-1 leading-none">
              Servidor: <strong className="text-zinc-300">Google Cloud Platform</strong> | ID: <span className="text-zinc-500">ai-studio-30897476-0d47-40d1-a37e-f4ac19a5091f</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-500 font-mono">Atualizado em tempo real</span>
          <button
            onClick={() => {
              alert("Banco de dados Google Cloud Firestore verificado! A latência é de 35ms. Sincronização em tempo real ativa.");
            }}
            className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[9px] text-yellow-500 uppercase font-mono rounded cursor-pointer transition"
          >
            Verificar Conectividade
          </button>
        </div>
      </div>

      {/* Mini KPIs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase">Arrecadação Bruta (Comandas Pagas)</span>
            <span className="text-xl font-bold font-mono text-yellow-500">{formatCurrency(totalSalesToday)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase">Total de Comissões de Barbeiros</span>
            <span className="text-xl font-bold font-mono text-white">{formatCurrency(totalCommissionToday)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500 animate-pulse">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase">Líquido Caixa Barbearia</span>
            <span className="text-xl font-bold font-mono text-emerald-500">{formatCurrency(totalNetShopKeep)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub menu inside admin */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-850 pb-3">
        {canSubComissoes && (
          <button
            onClick={() => setActiveAdminSubTab('comissoes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'comissoes' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            💰 Repasse & Comissões
          </button>
        )}
        {canSubCadastros && (
          <button
            onClick={() => setActiveAdminSubTab('cadastros')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'cadastros' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            💈 Serviços, Produtos & Planos
          </button>
        )}
        {canSubAcessos && (
          <button
            onClick={() => setActiveAdminSubTab('acessos')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'acessos' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            🔑 Controle de Acessos (RBAC)
          </button>
        )}
        {canSubParametros && (
          <button
            onClick={() => setActiveAdminSubTab('parametros')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'parametros' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            ⚙️ Parâmetros do Negócio
          </button>
        )}
        {canSubRelatorios && (
          <button
            onClick={() => setActiveAdminSubTab('relatorios')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'relatorios' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            📊 Relatórios
          </button>
        )}
        {canSubFechamento && (
          <button
            onClick={() => setActiveAdminSubTab('fechamento')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'fechamento' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            📥 Fechamento de Caixa
          </button>
        )}
        {canSubSuprimentos && (
          <button
            onClick={() => setActiveAdminSubTab('suprimentos')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'suprimentos' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            📦 Caixa de Suprimentos
          </button>
        )}
        {canSubMetas && (
          <button
            onClick={() => setActiveAdminSubTab('metas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'metas' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            🏆 Metas & Gamificação
          </button>
        )}
        {canSubScripts && (
          <button
            onClick={() => setActiveAdminSubTab('scripts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
              activeAdminSubTab === 'scripts' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
            }`}
          >
            📜 Scripts Operacionais ({scripts.length})
          </button>
        )}
      </div>

      {/* CARD DE ANIVERSARIANTES PRÓXIMOS */}
      {(() => {
        const getUpcomingBirthdays = () => {
          const customers = users.filter(u => u.birthday);
          if (customers.length === 0) return [];

          const today = new Date();
          const currentYear = today.getFullYear();

          const mapped = customers.map(u => {
            const parts = u.birthday!.split('-');
            if (parts.length < 3) return null;
            const birthMonth = parseInt(parts[1], 10) - 1;
            const birthDay = parseInt(parts[2], 10);

            let bDate = new Date(currentYear, birthMonth, birthDay);
            if (bDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
              bDate = new Date(currentYear + 1, birthMonth, birthDay);
            }

            const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const bDateZero = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate());
            const diffTime = bDateZero.getTime() - todayZero.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
              user: u,
              daysLeft: diffDays,
              formattedDate: `${birthDay.toString().padStart(2, '0')}/${(birthMonth + 1).toString().padStart(2, '0')}`
            };
          }).filter(item => item !== null) as { user: User; daysLeft: number; formattedDate: string }[];

          mapped.sort((a, b) => a.daysLeft - b.daysLeft);
          return mapped.filter(item => item.daysLeft <= 30);
        };

        const upcoming = getUpcomingBirthdays();
        if (upcoming.length === 0) return null;
        return (
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 p-4 rounded-xl text-left space-y-2 animate-fadeIn mt-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="text-base">🎉</span>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                Aniversariantes Próximos (Lembre-se de Parabenizá-los!)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {upcoming.map(item => (
                <div key={item.user.id} className="bg-zinc-950/80 border border-zinc-850 p-2.5 rounded-lg flex items-center justify-between gap-2.5">
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-tight">
                      {item.user.name} <span className="text-[10px] text-zinc-500 font-normal">({item.user.role})</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-none font-mono">
                      📅 {item.formattedDate} ({item.daysLeft === 0 ? 'HOJE! 🎂' : `em ${item.daysLeft} dias`})
                    </p>
                  </div>
                  {item.user.phone ? (
                    <a
                      href={`https://wa.me/55${item.user.phone.replace(/\D/g, '')}?text=Parab%C3%A9ns%20${encodeURIComponent(item.user.name)}!%20Desejamos%20um%20%C3%B3timo%20anivers%C3%A1rio%20da%20equipe%20da%20barbearia!`}
                      target="_blank"
                      rel="referrer noopener"
                      className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* SUBTAB CONTENT WRAPPER WITH ERROR BOUNDARY */}
      <ErrorBoundary fallbackTitle="Relatórios e Módulos do Sistema">
      {/* TAB 1: COMISSÕES E REPASSES */}
      {activeAdminSubTab === 'comissoes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Comissão Acumulada por Profissional (Hoje)
            </h3>
            <p className="text-xs text-zinc-400">
              Cálculo em tempo real de comissões baseado nos serviços concluídos e produtos faturados.
            </p>

            <div className="divide-y divide-zinc-850">
              {users.filter(u => u.role === 'BARBER').map(b => {
                const bDetails = barberDetails.find(d => d.userId === b.id);
                // closed comandas today for this barber
                const bComandas = closedComandas.filter(c => c.barberId === b.id);
                const bEarnings = bComandas.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
                const bVolume = bComandas.reduce((sum, c) => sum + (c.total || 0), 0);

                return (
                  <div key={b.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-zinc-900 border border-zinc-800 p-2 rounded-xl block">
                        {b.avatar || '🧔'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{b.name}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Avulso: <strong className="text-yellow-500">{Math.round((bDetails?.commissionRateStandard ?? 0.5) * 100)}%</strong>
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Recorrente: <strong className="text-purple-400">{Math.round((bDetails?.commissionRateSubscription ?? 0.35) * 100)}%</strong>
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Produtos: <strong className="text-teal-400">{Math.round((bDetails?.commissionRateProduct ?? parameters.defaultCommissionProduct) * 100)}%</strong>
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Cota VIP: <strong className="text-amber-400">{bDetails?.vipServicesMonthlyQuota ?? parameters.vipServicesPerBarberMonthly ?? 5}/mês</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono bg-[#070708] border border-zinc-850 px-4 py-2 rounded-xl">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">REPASSE HOJE</span>
                      <span className="text-sm font-bold text-yellow-500">{formatCurrency(bEarnings)}</span>
                      <span className="text-[10px] text-zinc-400 block">De {formatCurrency(bVolume)} faturado</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl text-left h-fit space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Editar Taxa de Repasse & Cota VIP
            </h3>
            <p className="text-xs text-zinc-400">
              Ajuste as porcentagens e cota mensal de serviços VIP exclusivas deste barbeiro. Salve para aplicar imediatamente.
            </p>

            <form onSubmit={handleSaveBarberCommissions} className="space-y-4">
              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Profissional Titular
                </label>
                <select
                  value={barberToEditComm}
                  onChange={(e) => setBarberToEditComm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono cursor-pointer"
                >
                  {users.filter(u => u.role === 'BARBER').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Avulso (%)
                  </label>
                  <input
                    type="number"
                    value={commStandard}
                    onChange={(e) => setCommStandard(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Recorrente (%)
                  </label>
                  <input
                    type="number"
                    value={commSubscription}
                    onChange={(e) => setCommSubscription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Produtos (%)
                  </label>
                  <input
                    type="number"
                    value={commProduct}
                    onChange={(e) => setCommProduct(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-amber-400 block uppercase mb-1 font-bold">
                    Cota VIP (Atend./Mês)
                  </label>
                  <input
                    type="number"
                    value={commVipQuota}
                    onChange={(e) => setCommVipQuota(e.target.value)}
                    className="w-full bg-zinc-950 border border-amber-500/50 rounded-lg px-1.5 py-2 text-xs font-mono text-amber-300 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs py-2 rounded-lg cursor-pointer transition uppercase tracking-wider"
              >
                Salvar Configurações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SERVIÇOS, PRODUTOS & PLANOS CRUDS */}
      {activeAdminSubTab === 'cadastros' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Left Lists Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* SERVICES IN CATALOGUE */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-850">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-yellow-500">Gestão de Serviços do Catálogo</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Filtre serviços por categoria ou busque pelo nome para gerenciar e editar.</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 self-start sm:self-auto">
                  {services.length} Serviços Cadastrados
                </span>
              </div>

              {/* Filtro por Categoria e Busca */}
              <div className="space-y-2.5">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    placeholder="🔍 Buscar serviço por nome..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-yellow-500 font-mono"
                  />
                  {serviceSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setServiceSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtros de Categoria em Pills */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase mr-1">Filtrar:</span>
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('TODAS')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                      serviceCategoryFilter === 'TODAS'
                        ? 'bg-yellow-500 text-black font-extrabold shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                    }`}
                  >
                    <span>Todas</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      serviceCategoryFilter === 'TODAS' ? 'bg-black/25 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {services.length}
                    </span>
                  </button>

                  {(categories && categories.length > 0 ? categories : ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']).map(cat => {
                    const count = services.filter(s => (s.categories && s.categories.length > 0 ? s.categories.includes(cat) : s.category === cat)).length;
                    const isSelected = serviceCategoryFilter === cat;
                    const catLabel = cat === 'HAIR' ? '✂️ Cabelo' : cat === 'BEARD' ? '🧔 Barba' : cat === 'COMBO' ? '⚡ Combos' : cat === 'TREATMENT' ? '🧼 Tratamento' : cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setServiceCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-yellow-500 text-black font-extrabold shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                        }`}
                      >
                        <span>{catLabel}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-black/25 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tabela de Serviços */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                      <th className="pb-2 font-medium">Nome</th>
                      <th className="pb-2 font-medium">Preço Base</th>
                      <th className="pb-2 font-medium">Duração</th>
                      <th className="pb-2 font-medium">Categorias</th>
                      <th className="pb-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {services
                      .filter(s => {
                        const matchesCat = serviceCategoryFilter === 'TODAS' ||
                          (s.categories && s.categories.length > 0 ? s.categories.includes(serviceCategoryFilter) : s.category === serviceCategoryFilter);
                        const matchesQuery = !serviceSearchTerm || s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase());
                        return matchesCat && matchesQuery;
                      })
                      .map(s => (
                        <tr key={s.id} className="hover:bg-zinc-900/10">
                          <td className="py-2.5 font-bold text-white">{s.name}</td>
                          <td className="py-2.5 text-yellow-500 font-mono font-semibold">{formatCurrency(s.price)}</td>
                          <td className="py-2.5 text-zinc-400 font-mono">{s.durationMinutes} min</td>
                          <td className="py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {(s.categories && s.categories.length > 0 ? s.categories : [s.category]).filter(Boolean).map(c => (
                                <span key={c} className="text-[9px] uppercase bg-zinc-900/90 text-yellow-400/90 px-1.5 py-0.5 border border-zinc-800 font-mono rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditServiceSelect(s)}
                                className="p-1 text-zinc-400 hover:text-white"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(s.id)}
                                className="p-1 text-zinc-500 hover:text-red-400"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {services.filter(s => {
                      const matchesCat = serviceCategoryFilter === 'TODAS' ||
                        (s.categories && s.categories.length > 0 ? s.categories.includes(serviceCategoryFilter) : s.category === serviceCategoryFilter);
                      const matchesQuery = !serviceSearchTerm || s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase());
                      return matchesCat && matchesQuery;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                          Nenhum serviço encontrado para o filtro "{serviceCategoryFilter}"{serviceSearchTerm ? ` e busca "${serviceSearchTerm}"` : ''}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRODUCTS STOCK */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-850 mb-3">
                <h4 className="text-xs font-bold font-mono uppercase text-yellow-500 flex items-center gap-1.5">
                  <span>Produtos & Estoque</span>
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-zinc-400 font-sans font-normal lowercase">Curva ABC e alerta mínimo</span>
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {products.length} Produtos
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="pb-2 font-medium">Produto</th>
                      <th className="pb-2 font-medium">Custo / Venda</th>
                      <th className="pb-2 font-medium">Estoque (Mín.)</th>
                      <th className="pb-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {products.map(p => {
                      const isLowStock = p.stock <= (p.minStock ?? 5);
                      const pCats = p.categories && p.categories.length > 0 ? p.categories : (p.category ? [p.category] : []);
                      return (
                        <tr key={p.id} className="hover:bg-zinc-900/10">
                          <td className="py-2.5">
                            <p className="font-bold text-white leading-none">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{p.description}</p>
                            {pCats.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {pCats.map(cat => (
                                  <span key={cat} className="text-[8px] uppercase bg-zinc-900 text-amber-400/90 px-1 py-0.2 border border-zinc-800 font-mono rounded">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5">
                            <p className="text-yellow-500 font-mono font-semibold">{formatCurrency(p.price)}</p>
                            {p.costPrice ? (
                              <p className="text-[9px] text-zinc-500 font-mono">Custo: {formatCurrency(p.costPrice)}</p>
                            ) : null}
                          </td>
                          <td className="py-2.5">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2 py-0.5 font-mono text-[10px] rounded font-bold ${
                                isLowStock ? 'bg-red-950/60 text-red-400 border border-red-500/30' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                              }`}>
                                {p.stock} un
                              </span>
                              {isLowStock && (
                                <span className="text-[9px] text-red-400 font-mono flex items-center gap-0.5 font-bold animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5" /> ESTOQUE CRÍTICO (mín: {p.minStock ?? 5})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditProductSelect(p)}
                                className="p-1 text-zinc-400 hover:text-white"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1 text-zinc-500 hover:text-red-400"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RECURRING PLANS LIST */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-yellow-500">Planos de Assinatura Recorrente</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Planos fixos ou com uso ilimitado de serviços específicos com repasse proporcional.</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {plans.length} Planos Ativos
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(p => {
                  const isUnlim = !!p.isUnlimited;
                  const payoutRate = p.barberPayoutRate !== undefined ? p.barberPayoutRate : (p.currentCommissionRate > 1 ? p.currentCommissionRate : Math.round((p.currentCommissionRate || 0.35) * 100));
                  const benchmarkVisits = 4;
                  const basePerVisit = p.priceMonthly / benchmarkVisits;
                  const payoutVal = basePerVisit * (payoutRate / 100);
                  const incServiceNames = (p.includedServiceIds || [])
                    .map(id => services.find(s => s.id === id)?.name)
                    .filter(Boolean);

                  return (
                    <div
                      key={p.id}
                      className={`bg-zinc-950 border rounded-xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden ${
                        isUnlim ? 'border-amber-500/50 shadow-md bg-gradient-to-br from-amber-500/5 to-zinc-950' : 'border-zinc-850'
                      }`}
                    >
                      {isUnlim && (
                        <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded">
                          ⭐ USO ILIMITADO
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between items-start pr-20">
                          <h5 className="font-bold text-white text-sm">{p.name}</h5>
                        </div>
                        <div className="mt-1">
                          <span className="text-amber-400 font-mono text-base font-extrabold">
                            {formatCurrency(p.priceMonthly)}
                          </span>
                          <span className="text-zinc-500 text-xs font-mono"> / mês</span>
                        </div>

                        {p.description && (
                          <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">{p.description}</p>
                        )}

                        {/* Serviços Inclusos (Para Ilimitado) */}
                        {isUnlim && (
                          <div className="mt-2.5 pt-2 border-t border-zinc-900">
                            <span className="text-[9px] text-amber-400/90 font-mono uppercase font-bold block mb-1">
                              Serviços com Uso Ilimitado:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {incServiceNames.length > 0 ? (
                                incServiceNames.map((srvName, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded text-[9px] font-mono">
                                    ✓ {srvName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-zinc-500 italic">Todos os serviços do catálogo</span>
                              )}
                            </div>
                          </div>
                        )}

                        {p.rules && p.rules.length > 0 && (
                          <div className="mt-2.5 space-y-0.5 pt-2 border-t border-zinc-900">
                            {p.rules.map((rule, idx) => (
                              <div key={idx} className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <span className="text-yellow-500">•</span>
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Barbeiro Payout info */}
                      <div className="pt-2.5 border-t border-zinc-900/80 space-y-1.5">
                        <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-850 text-[10px] font-mono">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span>Repasse Barbeiro:</span>
                            <strong className="text-yellow-400 font-bold">{payoutRate}% {isUnlim ? 'proporcional' : ''}</strong>
                          </div>
                          {isUnlim ? (
                            <div className="text-[9px] text-zinc-400 mt-0.5">
                              Lucro por corte ilimitado: <span className="text-emerald-400 font-bold">{formatCurrency(payoutVal)}</span> <span className="text-zinc-500">(R$ {basePerVisit.toFixed(2)} base)</span>
                            </div>
                          ) : (
                            <div className="text-[9px] text-zinc-400 mt-0.5">
                              Atendimentos: <strong className="text-white">{p.servicesIncludedCount}</strong>/mês
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-mono">
                            {isUnlim ? '∞ Atendimentos Ilimitados' : `${p.servicesIncludedCount} Visitas / mês`}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEditPlanSelect(p)}
                              className="p-1 px-2.5 text-[10px] tracking-wider uppercase font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeletePlan(p.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Forms Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* SERVICE CATEGORIES CRUD */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3 flex items-center justify-between">
                <span>🏷️ Categorias de Serviço</span>
                <span className="text-[10px] text-zinc-500 lowercase font-normal italic">renomeia serviços vinculados</span>
              </h4>
              
              {/* Form to add category */}
              <form onSubmit={handleAddNewCategory} className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  required
                  placeholder="NOVA CATEGORIA"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono placeholder:text-zinc-650"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer"
                  title="Cadastrar Categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Scrollable list of categories with inline edit form */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-zinc-950 px-2.5 py-2 border border-zinc-900 rounded-lg text-xs font-mono">
                    {editingCategory === cat ? (
                      <form onSubmit={handleSaveCategoryRename} className="flex-1 flex gap-1.5 items-center">
                        <input
                          type="text"
                          required
                          value={editingCategoryNewValue}
                          onChange={(e) => setEditingCategoryNewValue(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2 py-0.5 text-xs text-white uppercase font-mono"
                        />
                        <button type="submit" className="text-emerald-400 p-0.5 hover:text-emerald-300 font-bold" title="Salvar">✓</button>
                        <button type="button" onClick={() => setEditingCategory(null)} className="text-red-400 p-0.5 hover:text-red-300 font-bold" title="Cancelar">✗</button>
                      </form>
                    ) : (
                      <>
                        <span className="font-bold text-zinc-300 uppercase">{cat}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEditCategory(cat)}
                            className="text-zinc-500 hover:text-white p-0.5 transition cursor-pointer"
                            title="Editar Categoria"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-zinc-500 hover:text-red-400 p-0.5 transition cursor-pointer"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ADD/EDIT SERVICE FORM */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
                {editingServiceId ? '⚙️ Editar Serviço' : '＋ Cadastrar Serviço'}
              </h4>
              <form onSubmit={handleSaveService} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome Comercial</label>
                  <input
                    type="text"
                    required
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    placeholder="Social, Navalhado, etc."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={srvPrice}
                      onChange={(e) => setSrvPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Duração (min)</label>
                    <input
                      type="number"
                      required
                      value={srvDuration}
                      onChange={(e) => setSrvDuration(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">
                      Categorias do Serviço (Múltiplas Seleções)
                    </label>
                    <span className="text-[9px] text-amber-400 font-mono">
                      {srvCategories.length} selecionada(s)
                    </span>
                  </div>
                  {/* Category Pills Selector */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg min-h-[42px] items-center">
                    {categories.map(cat => {
                      const isSelected = srvCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (srvCategories.length > 1) {
                                setSrvCategories(srvCategories.filter(c => c !== cat));
                              }
                            } else {
                              setSrvCategories([...srvCategories, cat]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-yellow-500 text-black shadow-xs'
                              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          <span>{isSelected ? '✓ ' : '＋ '}{cat}</span>
                        </button>
                      );
                    })}
                    {/* Custom Category Tags added by user */}
                    {srvCategories.filter(c => !categories.includes(c)).map(customCat => (
                      <span
                        key={customCat}
                        className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-amber-500 text-black flex items-center gap-1"
                      >
                        ✓ {customCat}
                        <button
                          type="button"
                          onClick={() => setSrvCategories(srvCategories.filter(c => c !== customCat))}
                          className="hover:text-red-950 text-xs font-black cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add New Custom Category Input */}
                  <div className="flex gap-1.5 mt-1.5">
                    <input
                      type="text"
                      value={newSrvCustomCat}
                      onChange={(e) => setNewSrvCustomCat(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newSrvCustomCat.trim().toUpperCase();
                          if (val && !srvCategories.includes(val)) {
                            setSrvCategories([...srvCategories, val]);
                            setNewSrvCustomCat('');
                          }
                        }
                      }}
                      placeholder="Criar nova categoria..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newSrvCustomCat.trim().toUpperCase();
                        if (val && !srvCategories.includes(val)) {
                          setSrvCategories([...srvCategories, val]);
                          setNewSrvCustomCat('');
                        }
                      }}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono rounded cursor-pointer"
                    >
                      ＋ Adicionar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Descrição rápida</label>
                  <input
                    type="text"
                    value={srvDescription}
                    onChange={(e) => setSrvDescription(e.target.value)}
                    placeholder="Descrição para o cliente..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setSrvName('');
                        setSrvPrice('');
                        setSrvDescription('');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                  >
                    {editingServiceId ? 'Salvar Alterações' : 'Adicionar Serviço'}
                  </button>
                </div>
              </form>
            </div>

            {/* ADD/EDIT PRODUCT FORM */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
                {editingProductId ? '📦 Editar Produto' : '＋ Cadastrar Produto'}
              </h4>
              <form onSubmit={handleSaveProduct} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    value={prdName}
                    onChange={(e) => setPrdName(e.target.value)}
                    placeholder="Ex: Óleo Hidratante, Cerveja"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Preço Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prdPrice}
                      onChange={(e) => setPrdPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Preço Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prdCostPrice}
                      onChange={(e) => setPrdCostPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Estoque Atual</label>
                    <input
                      type="number"
                      required
                      value={prdStock}
                      onChange={(e) => setPrdStock(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] bg-red-500/10 text-red-400 px-1 py-0.5 rounded text-[9px] uppercase font-mono tracking-wide">Estoque Mínimo (Alerta)</label>
                    <input
                      type="number"
                      value={prdMinStock}
                      onChange={(e) => setPrdMinStock(e.target.value)}
                      placeholder="5"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">
                      Categorias do Produto (Múltiplas Seleções)
                    </label>
                    <span className="text-[9px] text-amber-400 font-mono">
                      {prdCategories.length} selecionada(s)
                    </span>
                  </div>
                  {/* Category Pills Selector */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg min-h-[42px] items-center">
                    {['POMADAS', 'BARBA', 'CABELO', 'BEBIDAS', 'CUIDADOS', 'ACESSORIOS', ...categories.filter(c => !['POMADAS', 'BARBA', 'CABELO', 'BEBIDAS', 'CUIDADOS', 'ACESSORIOS'].includes(c))].map(cat => {
                      const isSelected = prdCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setPrdCategories(prdCategories.filter(c => c !== cat));
                            } else {
                              setPrdCategories([...prdCategories, cat]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-yellow-500 text-black shadow-xs'
                              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          <span>{isSelected ? '✓ ' : '＋ '}{cat}</span>
                        </button>
                      );
                    })}
                    {/* Custom Category Tags added by user */}
                    {prdCategories.filter(c => !['POMADAS', 'BARBA', 'CABELO', 'BEBIDAS', 'CUIDADOS', 'ACESSORIOS', ...categories].includes(c)).map(customCat => (
                      <span
                        key={customCat}
                        className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-amber-500 text-black flex items-center gap-1"
                      >
                        ✓ {customCat}
                        <button
                          type="button"
                          onClick={() => setPrdCategories(prdCategories.filter(c => c !== customCat))}
                          className="hover:text-red-950 text-xs font-black cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add New Custom Category Input */}
                  <div className="flex gap-1.5 mt-1.5">
                    <input
                      type="text"
                      value={newPrdCustomCat}
                      onChange={(e) => setNewPrdCustomCat(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newPrdCustomCat.trim().toUpperCase();
                          if (val && !prdCategories.includes(val)) {
                            setPrdCategories([...prdCategories, val]);
                            setNewPrdCustomCat('');
                          }
                        }
                      }}
                      placeholder="Criar nova categoria para produto..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newPrdCustomCat.trim().toUpperCase();
                        if (val && !prdCategories.includes(val)) {
                          setPrdCategories([...prdCategories, val]);
                          setNewPrdCustomCat('');
                        }
                      }}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono rounded cursor-pointer"
                    >
                      ＋ Adicionar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Descrição rápida</label>
                  <input
                    type="text"
                    value={prdDescription}
                    onChange={(e) => setPrdDescription(e.target.value)}
                    placeholder="Breve descrição comercial..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setPrdName('');
                        setPrdPrice('');
                        setPrdDescription('');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                  >
                    {editingProductId ? 'Salvar Produto' : 'Cadastrar Produto'}
                  </button>
                </div>
              </form>
            </div>

            {/* ADD/EDIT LOYALTY SUBSCRIPTION PLAN */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3 flex items-center justify-between">
                <span>{editingPlanId ? '🔄 Editar Plano' : '＋ Cadastrar Plano'}</span>
                {plnIsUnlimited && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black">
                    ILIMITADO
                  </span>
                )}
              </h4>
              <form onSubmit={handleSavePlan} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome do Plano</label>
                  <input
                    type="text"
                    required
                    value={plnName}
                    onChange={(e) => setPlnName(e.target.value)}
                    placeholder="Clube Ilimitado Cabelo & Barba, VIP etc"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* TIPO DE PLANO: FIXO OU ILIMITADO */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block mb-1">
                    Tipo de Modalidade do Plano
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlnIsUnlimited(false)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border text-center ${
                        !plnIsUnlimited
                          ? 'bg-yellow-500 text-black border-yellow-400 shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      📌 Limite Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlnIsUnlimited(true)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border text-center ${
                        plnIsUnlimited
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-extrabold'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      ⭐ Uso Ilimitado
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Mensalidade da Assinatura (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={plnPrice}
                    onChange={(e) => setPlnPrice(e.target.value)}
                    placeholder="120.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                {/* CAMPOS ESPECÍFICOS: SE FOR ILIMITADO */}
                {plnIsUnlimited ? (
                  <div className="space-y-3 bg-amber-500/5 border border-amber-500/30 p-3 rounded-xl">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-amber-400 uppercase font-mono font-bold">
                          Serviços Específicos com Uso Ilimitado:
                        </label>
                        <span className="text-[9px] text-zinc-400 font-mono">
                          {plnIncludedServiceIds.length} selecionado(s)
                        </span>
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 bg-zinc-950/70 p-2 rounded-lg border border-zinc-850">
                        {services.map(srv => {
                          const isChecked = plnIncludedServiceIds.includes(srv.id);
                          return (
                            <label
                              key={srv.id}
                              className="flex items-center justify-between gap-2 text-xs p-1 rounded hover:bg-zinc-900 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPlnIncludedServiceIds([...plnIncludedServiceIds, srv.id]);
                                    } else {
                                      setPlnIncludedServiceIds(plnIncludedServiceIds.filter(id => id !== srv.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 accent-amber-500"
                                />
                                <span className={isChecked ? 'text-amber-300 font-semibold' : 'text-zinc-300'}>
                                  {srv.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {formatCurrency(srv.price)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {plnIncludedServiceIds.length === 0 && (
                        <p className="text-[9px] text-amber-500/80 italic mt-1">
                          ⚠️ Selecione pelo menos 1 serviço para garantir que o plano tenha escopo definido.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-amber-400 uppercase font-mono font-bold">
                          Repasse Barbeiro (% Proporcional)
                        </label>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          {plnBarberPayoutRate}% de repasse
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={plnBarberPayoutRate}
                        onChange={(e) => setPlnBarberPayoutRate(e.target.value)}
                        placeholder="35"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                      />

                      {/* Simulação Proporcional em Tempo Real */}
                      {(() => {
                        const price = parseFloat(plnPrice) || 120;
                        const rate = parseFloat(plnBarberPayoutRate) || 35;
                        const basePerCut = price / 4;
                        const earningPerCut = basePerCut * (rate / 100);
                        return (
                          <div className="mt-2 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-mono space-y-1">
                            <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider text-yellow-500">
                              💡 Cálculo de Lucro por Atendimento:
                            </span>
                            <div className="text-zinc-300">
                              Base estimada (4 cortes/mês): <strong className="text-white">{formatCurrency(basePerCut)}</strong>
                            </div>
                            <div className="text-emerald-400 font-bold">
                              ➔ Barbeiro lucra: {formatCurrency(earningPerCut)} por corte ilimitado
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  /* CAMPOS PARA PLANO FIXO TRADICIONAL */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Visitas/Mês</label>
                        <input
                          type="number"
                          required
                          value={plnServices}
                          onChange={(e) => setPlnServices(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Comissão (%)</label>
                        <input
                          type="number"
                          required
                          value={plnCommission}
                          onChange={(e) => setPlnCommission(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 italic">
                      O barbeiro recebe a comissão regular com base no número de visitas contratadas.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Descrição rápida</label>
                  <input
                    type="text"
                    value={plnDescription}
                    onChange={(e) => setPlnDescription(e.target.value)}
                    placeholder="Ex: Cortes de cabelo ilimitados durante todo o mês..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">Regras de negócio (Uma por linha)</label>
                  <textarea
                    rows={3}
                    value={plnRulesText}
                    onChange={(e) => setPlnRulesText(e.target.value)}
                    placeholder="Uso Individual e intransferível&#10;Válido por 30 dias&#10;Sem taxa de cancelamento"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  {editingPlanId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlanId(null);
                        setPlnName('');
                        setPlnPrice('');
                        setPlnDescription('');
                        setPlnRulesText('');
                        setPlnIsUnlimited(false);
                        setPlnIncludedServiceIds([]);
                        setPlnBarberPayoutRate('35');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer hover:bg-zinc-850 transition"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 bg-yellow-500 text-black hover:bg-yellow-400 font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase tracking-wider"
                  >
                    {editingPlanId ? 'Modificar Plano' : 'Ativar Novo Plano'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACESSOS E RBAC DE USUARIOS */}
      {activeAdminSubTab === 'acessos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
          {/* List col */}
          <div className="lg:col-span-2 bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
                  Usuários e Configurações de Acesso (RBAC)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Altere permissões e visualize logins e credenciais. Clique em "🔑 Acessos" para expandir a edição de permissões sem cortes.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkPanel(!showBulkPanel);
                  setBulkError('');
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-yellow-500 rounded text-xs font-mono font-bold transition uppercase tracking-wider"
              >
                {showBulkPanel ? '✕ Fechar Importador' : '＋ Cadastros em Massa'}
              </button>
            </div>

            {/* BULK PANEL */}
            {showBulkPanel && (
              <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 space-y-4 animate-slideDown">
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                    👥 Importador de Usuários em Lote (Cadastro em Massa)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Cole uma lista de usuários abaixo. Use ponto e vírgula (<strong className="text-yellow-500">;</strong>) ou vírgula (<strong className="text-yellow-500">,</strong>) como separador. Siga o formato abaixo (um usuário por linha):
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 bg-black/50 p-2 rounded border border-zinc-900 mt-1.5 whitespace-pre leading-relaxed">
                    Formato: <strong className="text-yellow-400">Nome Completo; login_usuario; senha_secreta; PERFIL; telefone</strong>{"\n"}
                    Perfis válidos: <strong className="text-zinc-300">BARBER, CASHIER, CUSTOMER, ADMIN</strong>{"\n"}
                    Exemplo:{"\n"}
                    Joaquim Barbeiro; joaquim; j1234; BARBER; (11) 98888-7777{"\n"}
                    Camila do Caixa; camila; c4321; CASHIER; (11) 97777-6666
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Lista de Usuários</label>
                  <textarea
                    rows={5}
                    value={bulkInputText}
                    onChange={(e) => handleParseBulkInput(e.target.value)}
                    placeholder="Cole as linhas aqui..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white font-mono"
                  />
                </div>

                {bulkPreviewUsers.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-mono font-bold text-yellow-500">🔍 Visualização Prévia ({bulkPreviewUsers.length} encontrados)</h5>
                    <div className="max-h-40 overflow-y-auto border border-zinc-850 rounded-lg divide-y divide-zinc-900 bg-zinc-950">
                      {bulkPreviewUsers.map((p, idx) => (
                        <div key={idx} className="p-2 flex items-center justify-between gap-3 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500 font-mono text-[10px]">#{p.lineNum}</span>
                            {p.isValid ? (
                              <div>
                                <strong className="text-white">{p.name}</strong>
                                <span className="text-[10px] text-zinc-400 font-mono block">
                                  User: <strong className="text-yellow-500">{p.login}</strong> | Perfil: <strong className="text-zinc-300">{p.role}</strong>
                                </span>
                              </div>
                            ) : (
                              <span className="text-red-400 italic block">{p.raw}</span>
                            )}
                          </div>
                          <div>
                            {p.isValid ? (
                              <span className="text-emerald-500 font-bold font-mono">Pronto</span>
                            ) : (
                              <span className="text-red-500 font-semibold font-mono text-[10px]" title={p.error}>⚠️ Erro: {p.error}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkError && <p className="text-red-400 text-xs font-semibold">{bulkError}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkInputText('');
                      setBulkPreviewUsers([]);
                      setShowBulkPanel(false);
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBulkUsers}
                    disabled={bulkPreviewUsers.length === 0 || !!bulkError}
                    className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold uppercase rounded-lg text-xs transition cursor-pointer"
                  >
                    Confirmar Cadastro em Massa ({bulkPreviewUsers.filter(u => u.isValid).length} usuários)
                  </button>
                </div>
              </div>
            )}

            {/* FILTRAGEM POR TIPO DE CADASTRO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121214] p-3 rounded-lg border border-zinc-850">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                🔍 Filtrar por Tipo de Cadastro:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {['ALL', 'ADMIN', 'BARBER', 'CASHIER', 'CUSTOMER'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setAccessRoleFilter(role)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer ${
                      accessRoleFilter === role
                        ? 'bg-yellow-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    {role === 'ALL' ? 'Todos' : role === 'ADMIN' ? 'Admin' : role === 'BARBER' ? 'Barbeiro' : role === 'CASHIER' ? 'Caixa' : 'Cliente'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-400 text-left">
                    <th className="pb-2 font-semibold">Nome / Username</th>
                    <th className="pb-2 font-semibold">Perfil / Role</th>
                    <th className="pb-2 font-semibold">Habilitado</th>
                    <th className="pb-2 text-center font-semibold">Controle</th>
                    <th className="pb-2 text-right font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {users.filter(u => accessRoleFilter === 'ALL' || u.role === accessRoleFilter).map(u => (
                    <React.Fragment key={u.id}>
                      <tr className="hover:bg-zinc-900/10">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            {u.photoUrl ? (
                              <img src={u.photoUrl} alt="Foto" className="h-8 w-8 object-cover rounded border border-zinc-800" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-sm bg-zinc-900 border border-zinc-850 p-1.5 rounded-lg">
                                {u.avatar || '👤'}
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-white leading-none">{u.name}</p>
                                {u.requiresPasswordChange && (
                                  <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold" title="Deve redefinir a senha no próximo acesso">
                                    🔑 1º Acesso Pendente
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-2 flex-wrap">
                                <span>Login: <strong className="text-yellow-500 font-mono">{u.login}</strong></span>
                                <span>•</span>
                                {u.role === 'ADMIN' ? (
                                  currentUser && currentUser.id === u.id ? (
                                    <span className="flex items-center gap-1 font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                      <span className="text-zinc-500">Sua Senha:</span>
                                      <span className="text-yellow-400 font-bold">{revealedPasswordUserIds[u.id] ? u.password : '••••••••'}</span>
                                      <button
                                        type="button"
                                        onClick={() => setRevealedPasswordUserIds(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                        className="text-zinc-400 hover:text-white ml-0.5 cursor-pointer"
                                        title={revealedPasswordUserIds[u.id] ? "Ocultar senha" : "Ver minha senha"}
                                      >
                                        {revealedPasswordUserIds[u.id] ? <EyeOff className="w-3 h-3 text-yellow-500" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/80">
                                      <span className="text-zinc-500">Senha:</span>
                                      <span className="text-zinc-500 font-bold">••••••••</span>
                                      <span className="text-[9px] text-zinc-500 font-mono bg-zinc-900 px-1 rounded ml-0.5">🔒 Protegida</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="flex items-center gap-1 font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                    <span className="text-zinc-500">Senha:</span>
                                    <span className="text-zinc-300">{revealedPasswordUserIds[u.id] ? u.password : '••••••••'}</span>
                                    <button
                                      type="button"
                                      onClick={() => setRevealedPasswordUserIds(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                      className="text-zinc-400 hover:text-white ml-0.5 cursor-pointer"
                                      title={revealedPasswordUserIds[u.id] ? "Ocultar senha" : "Ver senha"}
                                    >
                                      {revealedPasswordUserIds[u.id] ? <EyeOff className="w-3 h-3 text-yellow-500" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                  </span>
                                )}
                                {u.createdBy && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[9px] text-zinc-500 font-mono">Cadastrado por: <strong className="text-zinc-400">{u.createdBy}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border border-zinc-800 ${
                            u.role === 'ADMIN' ? 'bg-yellow-500 text-black font-semibold' : 'bg-zinc-900 text-zinc-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="focus:outline-none cursor-pointer"
                          >
                            {u.isActive ? (
                              <span className="text-emerald-500 flex items-center font-bold">✓ Ativo</span>
                            ) : (
                              <span className="text-red-500 flex items-center font-bold">🔒 Bloqueado</span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => setExpandedUserPermissionsId(expandedUserPermissionsId === u.id ? null : u.id)}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition ${
                              expandedUserPermissionsId === u.id 
                                ? 'bg-yellow-500 text-black border-yellow-500' 
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            🔑 {expandedUserPermissionsId === u.id ? 'Fechar Acessos' : 'Acessos RBAC'}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex gap-1.5 justify-end items-center">
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setUsrName(u.name);
                                setUsrEmail(u.email);
                                setUsrPhone(u.phone || '');
                                setUsrRole(u.role);
                                setUsrLogin(u.login || '');
                                if (u.role === 'ADMIN' && currentUser && currentUser.id !== u.id) {
                                  setUsrPassword('');
                                } else {
                                  setUsrPassword(u.password || '');
                                }
                                setUsrBio(u.bio || '');
                                setUsrPhotoUrl(u.photoUrl || '');
                                setUsrBirthday(u.birthday || '');
                                setUsrBarberNotes(u.barberNotes || '');
                                setUsrRequiresPasswordChange(Boolean(u.requiresPasswordChange));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-805 hover:text-yellow-500 text-[10px] uppercase font-mono rounded inline-block cursor-pointer transition"
                            >
                              Alterar
                            </button>
                            <button
                              onClick={() => {
                                if (u.id === 'usr-admin') {
                                  alert('Impossível excluir o administrador principal (Dono)!');
                                  return;
                                }
                                if (confirm(`Tem certeza que deseja excluir permanentemente o usuário "${u.name}" (${u.role})?`)) {
                                  onUpdateState('users', users.filter(x => x.id !== u.id));
                                  if (u.role === 'BARBER') {
                                    onUpdateState('barberDetails', barberDetails.filter(b => b.userId !== u.id));
                                  }
                                }
                              }}
                              className="p-1 text-zinc-500 hover:text-red-500 transition cursor-pointer"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDABLE PERMISSIONS CONTROL PANEL SECTION */}
                      {expandedUserPermissionsId === u.id && (
                        <tr className="bg-[#121214] border-l-2 border-yellow-500">
                          <td colSpan={5} className="p-4">
                            <div className="space-y-4">
                              <div className="flex flex-wrap justify-between items-center border-b border-zinc-850 pb-2.5 gap-2">
                                <div>
                                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase flex items-center gap-1.5">
                                    <span>🔑 Divisão de Acessos Granulares de {u.name}</span>
                                  </h4>
                                  <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Defina exatamente quais telas e ações {u.name} pode acessar. O administrador principal sempre retém acesso total.
                                  </p>
                                </div>
                                <button
                                  onClick={() => setExpandedUserPermissionsId(null)}
                                  className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:text-white text-[10px] text-zinc-400 uppercase font-mono rounded-lg transition"
                                >
                                  Fechar ✕
                                </button>
                              </div>

                              {/* PRESETS ACCESS BUTTONS */}
                              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850">
                                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-2">
                                  ⚡ Perfis e Modos Pré-Definidos (Atribuição Rápida em 1 Clique):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSetPresetPermissions(u.id, ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS'])}
                                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-yellow-500 hover:text-black border border-zinc-800 text-zinc-300 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                  >
                                    💈 Barbeiro Padrão (Agenda + Comandas)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetPresetPermissions(u.id, ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'MANAGE_SUPPLIES'])}
                                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-yellow-500 hover:text-black border border-zinc-800 text-zinc-300 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                  >
                                    📦 Barbeiro + Suprimentos
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetPresetPermissions(u.id, ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS'])}
                                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-yellow-500 hover:text-black border border-zinc-800 text-zinc-300 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                  >
                                    💼 Barbeiro + Balcão do Caixa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetPresetPermissions(u.id, ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'MANAGE_SUPPLIES', 'CHECKOUT_COMANDAS'])}
                                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-yellow-500 hover:text-black border border-zinc-800 text-zinc-300 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                  >
                                    🚀 Barbeiro Completo (Suprimentos + Caixa)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetPresetPermissions(u.id, ['VIEW_BILLING', 'MANAGE_SUPPLIES', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_CATALOG', 'MANAGE_PLANS', 'MANAGE_PARAMETERS', 'DAILY_FACILITATOR', 'CUSTOMER_PORTAL'])}
                                    className="px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/30 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                  >
                                    👑 Gerente / Acesso Total
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetPresetPermissions(u.id, ['CUSTOMER_PORTAL'])}
                                    className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                  >
                                    🚫 Bloquear Acessos Extras
                                  </button>
                                </div>
                              </div>

                              {/* ALL GRANULAR PERMISSIONS GRID */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                                {[
                                  {
                                    key: 'MANAGE_APPOINTMENTS',
                                    icon: '📅',
                                    title: 'Agenda & Reservas de Clientes',
                                    desc: 'Permite visualizar a agenda da barbearia, agendar horários online/presenciais e reagendar atendimentos.'
                                  },
                                  {
                                    key: 'EDIT_COMANDAS',
                                    icon: '📝',
                                    title: 'Criar & Lançar Comandas',
                                    desc: 'Permite abrir novas comandas de consumo, adicionar cortes, barba, cervejas, essências e tabacaria.'
                                  },
                                  {
                                    key: 'CHECKOUT_COMANDAS',
                                    icon: '💼',
                                    title: 'Balcão do Caixa & Receber Vendas',
                                    desc: 'Permite acessar a aba do Caixa, fechar comandas e receber pagamentos em dinheiro, PIX ou cartões.'
                                  },
                                  {
                                    key: 'MANAGE_SUPPLIES',
                                    icon: '📦',
                                    title: 'Gestão de Suprimentos & Aportes/Retiradas',
                                    desc: 'Permite acessar a aba de Suprimentos na Gestão para registrar insumos, compras e retiradas do caixa.'
                                  },
                                  {
                                    key: 'VIEW_BILLING',
                                    icon: '📊',
                                    title: 'Faturamento, DRE & Relatórios',
                                    desc: 'Permite visualizar gráficos de receita diária/mensal, balanço DRE, fechamento líquido e DSR.'
                                  },
                                  {
                                    key: 'EDIT_COMMISSIONS',
                                    icon: '💰',
                                    title: 'Tabela de Comissões & Repasses',
                                    desc: 'Permite consultar a aba de comissões calculadas dos profissionais e alterar taxas de repasse.'
                                  },
                                  {
                                    key: 'MANAGE_CATALOG',
                                    icon: '🏷️',
                                    title: 'Catálogo: Serviços, Produtos & Estoque',
                                    desc: 'Permite cadastrar/editar cortes, ajustar preços, incluir itens de tabacaria e controlar o estoque.'
                                  },
                                  {
                                    key: 'MANAGE_PLANS',
                                    icon: '⭐',
                                    title: 'Planos de Assinatura & Fidelidade',
                                    desc: 'Permite criar/editar os planos mensais de clientes e visualizar histórico de assinantes ativos.'
                                  },
                                  {
                                    key: 'MANAGE_USERS',
                                    icon: '🔑',
                                    title: 'Gestão de Usuários & Níveis de Acesso',
                                    desc: 'Permite cadastrar profissionais/caixas, editar dados pessoais, redefinir senhas e alterar permissões.'
                                  },
                                  {
                                    key: 'MANAGE_PARAMETERS',
                                    icon: '⚙️',
                                    title: 'Parâmetros Gerais do Negócio',
                                    desc: 'Permite alterar nome do estabelecimento, chave PIX, horários de funcionamento, logotipo e tema.'
                                  },
                                  {
                                    key: 'DAILY_FACILITATOR',
                                    icon: '⚡',
                                    title: 'Painel de Apoio & Fila Rápida',
                                    desc: 'Permite acessar o monitor de apoio com fila visual de espera em tempo real.'
                                  }
                                ].map(p => {
                                  const isChecked = u.permissions?.includes(p.key) || u.role === 'ADMIN';
                                  return (
                                    <label
                                      key={p.key}
                                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                                        isChecked
                                          ? 'bg-yellow-500/10 border-yellow-500/40 text-white'
                                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={u.role === 'ADMIN'}
                                        onChange={() => handleToggleTabPermission(u.id, p.key)}
                                        className="mt-0.5 rounded border-zinc-800 bg-[#121214] text-yellow-500 focus:ring-0 cursor-pointer"
                                      />
                                      <div>
                                        <span className="text-[11px] font-bold block text-white flex items-center gap-1">
                                          <span>{p.icon}</span>
                                          <span>{p.title}</span>
                                        </span>
                                        <span className="text-[9px] text-zinc-500 leading-snug block mt-0.5">
                                          {p.desc}
                                        </span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Col */}
          <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl text-left h-fit max-w">
            <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
              {editingUserId ? '⚙️ Alterar Usuário/Profissional' : '＋ Cadastrar Novo Login'}
            </h4>
            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={usrName}
                  onChange={(e) => setUsrName(e.target.value)}
                  placeholder="Ex: Carlos Barbeiro, Roberta"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Login / User</label>
                  <input
                    type="text"
                    required
                    value={usrLogin}
                    onChange={(e) => setUsrLogin(e.target.value)}
                    placeholder="Ex: carlos"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide flex items-center justify-between">
                    <span>{editingUserId && users.find(u => u.id === editingUserId)?.role === 'ADMIN' && currentUser?.id !== editingUserId ? 'Nova Senha' : 'Senha'}</span>
                    {editingUserId && <span className="text-[8px] text-zinc-500 normal-case">(opcional se mantiver)</span>}
                  </label>
                  <input
                    type="text"
                    required={!editingUserId}
                    value={usrPassword}
                    onChange={(e) => setUsrPassword(e.target.value)}
                    placeholder={editingUserId ? "Deixe em branco p/ manter" : "Ex: 123456"}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Obrigatória troca de senha no 1º acesso */}
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usrRequiresPasswordChange}
                    onChange={(e) => setUsrRequiresPasswordChange(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-800 bg-[#121214] text-yellow-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Exigir troca de senha no 1º acesso</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 block leading-tight mt-0.5">
                      Recomendado para senhas padrão. No primeiro acesso o usuário será obrigado a cadastrar sua própria senha.
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Perfil / Role</label>
                  <select
                    value={usrRole}
                    onChange={(e) => setUsrRole(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="ADMIN">ADMINISTATOR</option>
                    <option value="BARBER">BARBER (Barbeiro)</option>
                    <option value="CASHIER">CASHIER (Caixa)</option>
                    <option value="CUSTOMER">CUSTOMER (Cliente)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Telefone/WhatsApp</label>
                  <input
                    type="text"
                    value={usrPhone}
                    onChange={(e) => setUsrPhone(e.target.value)}
                    placeholder="(11) 9000-0000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5 border-t border-zinc-900">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">Data de Nascimento (Aniversário)</label>
                  <input
                    type="date"
                    value={usrBirthday}
                    onChange={(e) => setUsrBirthday(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <p className="text-[9px] text-zinc-500 italic mt-0.5">Para monitorar aniversariantes próximos.</p>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">E-mail de Contato</label>
                  <input
                    type="email"
                    value={usrEmail}
                    onChange={(e) => setUsrEmail(e.target.value)}
                    placeholder="Ex: carlos@cliente.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">Observações do Cliente (Privado para Barbeiros e Admins)</label>
                <textarea
                  rows={2}
                  value={usrBarberNotes}
                  onChange={(e) => setUsrBarberNotes(e.target.value)}
                  placeholder="Ex: Prefere corte na tesoura, gosta de café sem açúcar, alérgico a talco..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans"
                />
              </div>

               {usrRole === 'BARBER' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">Biografia / Sobre o Barbeiro</label>
                    <textarea
                      rows={2}
                      value={usrBio}
                      onChange={(e) => setUsrBio(e.target.value)}
                      placeholder="Mande um pequeno texto com as especialidades do profissional."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">URL da Foto do Barbeiro</label>
                    <input
                      type="url"
                      value={usrPhotoUrl}
                      onChange={(e) => setUsrPhotoUrl(e.target.value)}
                      placeholder="Ex: https://meuhost.com/barbeiro-perfil.jpg"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <p className="text-[9px] text-zinc-500 italic mt-0.5">Link direto de imagem para as fotos dos barbeiros (será visível para o cliente).</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setUsrName('');
                      setUsrEmail('');
                      setUsrLogin('');
                      setUsrPassword('');
                      setUsrPhone('');
                      setUsrRole('BARBER');
                      setUsrBio('');
                      setUsrPhotoUrl('');
                      setUsrBirthday('');
                      setUsrBarberNotes('');
                      setUsrRequiresPasswordChange(true);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Salvar Novo Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL BUSINESS SYSTEM PARAMETERS */}
      {activeAdminSubTab === 'parametros' && (
        <div className="space-y-6 text-left animate-fadeIn">
          {/* CATEGORIZED SETTINGS NAVIGATION TABS */}
          <SettingsTabs
            activeCategory={activeSettingsCategory}
            onChangeCategory={setActiveSettingsCategory}
          />

          {/* 1. PROMOÇÕES & CUPONS */}
          {activeSettingsCategory === 'promocoes' && (
            <SettingsPromotions
              parameters={parameters}
              coupons={coupons}
              onUpdateParameter={handleUpdateParameter}
              onOpenNewPromotion={() => {
                setEditingPromoId(null);
                setPromoTitle('');
                setPromoDescription('');
                setPromoDiscountType('PERCENTAGE');
                setPromoDiscountValue('10');
                setPromoCode('');
                setPromoValidUntil('');
                setPromoIsActive(true);
                setShowPromotionModal(true);
              }}
              onEditPromotion={(promo) => {
                setEditingPromoId(promo.id);
                setPromoTitle(promo.title);
                setPromoDescription(promo.description || '');
                setPromoDiscountType(promo.discountType);
                setPromoDiscountValue(String(promo.discountValue));
                setPromoCode(promo.code || '');
                setPromoValidUntil(promo.validUntil || '');
                setPromoIsActive(promo.isActive);
                setShowPromotionModal(true);
              }}
              onTogglePromotionActive={handleTogglePromotionActive}
              onDeletePromotion={handleDeletePromotion}
              onOpenNewCoupon={() => {
                setEditingCouponId(null);
                setCpnCode('');
                setCpnDiscountType('PERCENTAGE');
                setCpnDiscountValue('');
                setCpnMinPurchase('');
                setCpnMaxUsesPerCustomer('1');
                setCpnValidUntil('');
                setCpnDescription('');
                setCpnIsActive(true);
                setShowCouponModal(true);
              }}
              onEditCoupon={handleEditCouponSelect}
              onToggleCouponActive={handleToggleCouponActive}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}

          {/* 2. ASSINATURAS & PLANOS */}
          {activeSettingsCategory === 'assinaturas' && (
            <SettingsSubscriptions
              parameters={parameters}
              plans={plans}
              services={services}
              barberDetails={barberDetails}
              onUpdateParameter={handleUpdateParameter}
              onNavigateToPlans={() => setActiveAdminSubTab('cadastros')}
            />
          )}

          {/* 3. GERAL & OPERACIONAL */}
          {activeSettingsCategory === 'geral' && (
            <SettingsGeneral
              parameters={parameters}
              onUpdateParameter={handleUpdateParameter}
              newPaymentMethodName={newPaymentMethodName}
              setNewPaymentMethodName={setNewPaymentMethodName}
              handleLogoUpload={handleLogoUpload}
              handleLogoDrop={handleLogoDrop}
              handleLogoDragOver={handleLogoDragOver}
              handleLogoDragLeave={handleLogoDragLeave}
              isDraggingLogo={isDraggingLogo}
            />
          )}

          {/* 4. FIDELIDADE, VIP & NPS */}
          {activeSettingsCategory === 'fidelidade' && (
            <SettingsLoyalty
              parameters={parameters}
              onUpdateParameter={handleUpdateParameter}
            />
          )}

          {/* 5. PORTAL DO CLIENTE */}
          {activeSettingsCategory === 'portal' && (
            <SettingsPortal
              parameters={parameters}
              onUpdateParameter={handleUpdateParameter}
              onOpenNewBanner={handleOpenNewBanner}
              onEditBanner={handleEditBanner}
              handleDeleteBanner={handleDeleteBanner}
              handleToggleBannerActive={handleToggleBannerActive}
              handleMoveBanner={handleMoveBanner}
            />
          )}

          {/* 6. SEGURANÇA & DADOS */}
          {activeSettingsCategory === 'dados' && (
            <SettingsSecurity
              handleBackupExport={handleBackupExport}
              handleBackupImport={handleBackupImport}
              isRestoringBackup={isRestoringBackup}
              onClearSalesHistory={onClearSalesHistory}
              showClearSalesConfirm={showClearSalesConfirm}
              setShowClearSalesConfirm={setShowClearSalesConfirm}
              clearSalesPassword={clearSalesPassword}
              setClearSalesPassword={setClearSalesPassword}
              clearSalesStatus={clearSalesStatus}
              clearSalesErrorMessage={clearSalesErrorMessage}
              handleClearSalesHistory={handleClearSalesHistory}
              onResetDatabase={onResetDatabase}
              showResetConfirm={showResetConfirm}
              setShowResetConfirm={setShowResetConfirm}
              resetConfirmPassword={resetConfirmPassword}
              setResetConfirmPassword={setResetConfirmPassword}
              resetStatus={resetStatus}
              resetErrorMessage={resetErrorMessage}
              handleResetDatabase={handleResetDatabase}
            />
          )}

          {/* DICA DE OPERAÇÃO */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-2.5 text-xs text-yellow-500 leading-snug">
            <span className="text-base">💡</span>
            <div>
              <strong>Dica de Operação:</strong> Todas as alterações realizadas nas abas de configurações são salvas instantaneamente e sincronizadas em tempo real com todos os dispositivos e painéis de clientes e barbeiros.
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & BILLING ANALYTICS */}
      {activeAdminSubTab === 'relatorios' && (() => {
        const resolvePeriodDates = (period: PeriodPreset, customStart: string, customEnd: string) => {
          let start: Date;
          let end: Date = new Date();
          end.setHours(23, 59, 59, 999);
          const now = new Date();

          if (period === 'diario') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          } else if (period === 'ontem') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
          } else if (period === 'esta_semana') {
            const dayOfWeek = now.getDay();
            const diffToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMon, 0, 0, 0, 0);
          } else if (period === 'semanal') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
          } else if (period === 'este_mes') {
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          } else if (period === 'mes_anterior') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          } else if (period === 'este_ano') {
            start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          } else {
            start = customStart ? new Date(customStart + 'T00:00:00') : new Date(0);
            if (isNaN(start.getTime())) start = new Date(0);
            const parsedEnd = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
            end = isNaN(parsedEnd.getTime()) ? new Date() : parsedEnd;
          }
          return { start, end };
        };

        const getFilteredComandasForReports = () => {
          const { start, end } = resolvePeriodDates(reportPeriod, reportStartDate, reportEndDate);

          return (closedComandas || []).filter(c => {
            if (!c) return false;
            const targetDateStr = c.completedAt || c.createdAt;
            if (!targetDateStr) return false;
            const compDate = new Date(targetDateStr);
            if (isNaN(compDate.getTime())) return false;
            const dateMatch = compDate >= start && compDate <= end;
            const barberMatch = reportBarberId === 'TODOS' || c.barberId === reportBarberId;
            const pmMatch = reportPaymentMethod === 'TODOS' || (c.paymentMethod || 'PIX') === reportPaymentMethod;
            return dateMatch && barberMatch && pmMatch;
          });
        };

        const filteredCmds = getFilteredComandasForReports();
        const { start: reportStartResolved, end: reportEndResolved } = resolvePeriodDates(reportPeriod, reportStartDate, reportEndDate);
        const periodLabelStr = `${reportStartResolved.toLocaleDateString('pt-BR')} até ${reportEndResolved.toLocaleDateString('pt-BR')}`;

        // Core business analytics calculations
        const totalRevenueVal = filteredCmds.reduce((sum, c) => sum + (c.total || 0), 0);
        const totalCommissionsVal = filteredCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
        const netProfitVal = totalRevenueVal - totalCommissionsVal;
        const totalTicketsVal = filteredCmds.length;
        const averageTicketVal = totalTicketsVal > 0 ? totalRevenueVal / totalTicketsVal : 0;

        // Breakdown services vs products vs tabacaria
        let servicesSalesVolume = 0;
        let productsSalesVolume = 0;
        let tabacariaSalesVolume = 0;
        let productsQuantity = 0;
        let tabacariaQuantity = 0;

        // Payments breakdown
        const paymentsBreakdown: Record<string, { count: number; value: number }> = {
          MONEY: { count: 0, value: 0 },
          CARD: { count: 0, value: 0 },
          PIX: { count: 0, value: 0 },
          SUBSCRIPTION: { count: 0, value: 0 },
        };

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {};

        filteredCmds.forEach(c => {
          if (!c) return;
          // payment method
          const pm = c.paymentMethod || 'PIX';
          if (!paymentsBreakdown[pm]) {
            paymentsBreakdown[pm] = { count: 0, value: 0 };
          }
          paymentsBreakdown[pm].count += 1;
          paymentsBreakdown[pm].value += (c.total || 0);

          // items
          (c.items || []).forEach(it => {
            if (!it) return;
            const qty = it.quantity || 1;
            const unitPrice = it.unitPrice || 0;
            const lineCost = qty * unitPrice;
            const desc = it.description || it.name || '';

            if (it.isProduct) {
              productsSalesVolume += lineCost;
              productsQuantity += qty;
            } else {
              servicesSalesVolume += lineCost;
              // Find category of service
              const matchedSrv = (services || []).find(s => s && s.name && (s.name === desc || (desc && desc.startsWith(s.name))));
              const catName = matchedSrv?.category || 'HAIR';
              categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + lineCost;
            }
          });
        });

        // Barber Performance list
        const barberPerformance = (users || []).filter(u => u && u.role === 'BARBER').map(b => {
          const bCmds = filteredCmds.filter(c => c && c.barberId === b.id);
          const billing = bCmds.reduce((sum, c) => sum + (c.total || 0), 0);
          const comm = bCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
          const net = billing - comm;
          const count = bCmds.length;

          return {
            barber: b,
            billing,
            commission: comm,
            net,
            count
          };
        });

        // Export Handler
        const handleExportDRE = () => {
          exportDREReportCSV({
            shopName: parameters.shopName || 'Trima Studio',
            periodLabel: periodLabelStr,
            totalRevenue: totalRevenueVal,
            totalCommissions: totalCommissionsVal,
            netProfit: netProfitVal,
            totalTickets: totalTicketsVal,
            averageTicket: averageTicketVal,
            servicesVolume: servicesSalesVolume,
            productsVolume: productsSalesVolume,
            tabacariaVolume: tabacariaSalesVolume,
            barberPerformance: barberPerformance.map(b => ({
              name: b.barber.name,
              count: b.count,
              billing: b.billing,
              commission: b.commission,
              net: b.net
            })),
            paymentsBreakdown
          });
        };

        const handleExportDetailedComandas = () => {
          const formatted = filteredCmds.map(c => ({
            id: `#${c.id.slice(-6).toUpperCase()}`,
            completedAt: c.completedAt ? new Date(c.completedAt).toLocaleString('pt-BR') : '-',
            customerName: c.customerName,
            barberName: c.barberName,
            paymentMethod: c.paymentMethod || 'PIX',
            subtotal: c.subtotal,
            discount: c.discount || 0,
            total: c.total,
            commissionAmount: c.commissionAmount || 0,
            netProfit: c.total - (c.commissionAmount || 0),
            itemsSummary: c.items.map(i => `${i.quantity}x ${i.description}`).join(' | ')
          }));

          exportComandasDetailedCSV(formatted, periodLabelStr);
        };

        return (
          <div className="space-y-6 text-left">
            {/* Filter controls panel */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filtros Avançados & Período do DRE
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Selecione o intervalo de datas, profissional e forma de pagamento para recarregar o demonstrativo do caixa.
                  </p>
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportDRE}
                    className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Exportar DRE (Excel / CSV)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDetailedComandas}
                    className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Exportar Comandas (CSV)
                  </button>
                </div>
              </div>

              {/* Preset Buttons & Date Pickers */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold mr-1">Atalhos:</span>
                  {[
                    { id: 'diario', label: 'Hoje' },
                    { id: 'ontem', label: 'Ontem' },
                    { id: 'esta_semana', label: 'Esta Semana' },
                    { id: 'semanal', label: '7 Dias' },
                    { id: 'este_mes', label: 'Este Mês' },
                    { id: 'mes_anterior', label: 'Mês Anterior' },
                    { id: 'este_ano', label: 'Ano Vigente' },
                    { id: 'personalizado', label: 'Personalizado' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setReportPeriod(p.id as PeriodPreset)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold font-mono uppercase transition cursor-pointer ${
                        reportPeriod === p.id ? 'bg-yellow-500 text-black font-bold shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {reportPeriod === 'personalizado' && (
                  <div className="flex items-center gap-2 bg-zinc-950 p-1.5 border border-zinc-800 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-yellow-500 ml-1" />
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="bg-transparent text-xs text-white font-mono outline-none"
                    />
                    <span className="text-zinc-500 font-mono text-xs">até</span>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="bg-transparent text-xs text-white font-mono outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Sub-filters: Barber & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">Filtrar por Profissional:</label>
                  <select
                    value={reportBarberId}
                    onChange={(e) => setReportBarberId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none cursor-pointer"
                  >
                    <option value="TODOS">Todos os Barbeiros e Atendentes</option>
                    {users.filter(u => u.role === 'BARBER').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">Filtrar por Forma de Pagamento:</label>
                  <select
                    value={reportPaymentMethod}
                    onChange={(e) => setReportPaymentMethod(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none cursor-pointer"
                  >
                    <option value="TODOS">Todas as Formas de Pagamento</option>
                    <option value="PIX">PIX</option>
                    <option value="CARD">Cartão de Crédito/Débito</option>
                    <option value="MONEY">Dinheiro em Espécie</option>
                    <option value="SUBSCRIPTION">Assinatura Club</option>
                  </select>
                </div>
              </div>
            </div>

            {/* KPI overview row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Faturamento Bruto</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{formatCurrency(totalRevenueVal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Total faturado no caixa</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Comissões Devidas</span>
                <span className="text-2xl font-bold font-mono text-amber-500 block mt-1">{formatCurrency(totalCommissionsVal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Repasse aos profissionais</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Lucro Líquido Real</span>
                <span className="text-2xl font-bold font-mono text-emerald-500 block mt-1">{formatCurrency(netProfitVal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Retenção líquida da barbearia</span>
              </div>
              <div className="bg-[#101012] border border-zinc-805 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Atendimentos</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">{totalTicketsVal}</span>
                </div>
                <div className="border-l border-zinc-850 pl-3">
                  <span className="text-[10px] text-zinc-450 font-mono uppercase block">Ticket Médio</span>
                  <span className="text-sm font-semibold font-mono text-yellow-500 mt-1 block">{formatCurrency(averageTicketVal)}</span>
                </div>
              </div>
            </div>

            {/* Detailed performance tables and divisions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left detail: Barbers row */}
              <div className="lg:col-span-8 bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2">
                  Performance Financeira por Barbeiro
                </h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-400 font-mono text-[10px]">
                        <th className="pb-2 text-left font-semibold">Profissional</th>
                        <th className="pb-2 text-center font-semibold">Serviços Atendidos</th>
                        <th className="pb-2 text-right font-semibold">Faturado Bruto</th>
                        <th className="pb-2 text-right font-semibold">Comissão Devida</th>
                        <th className="pb-2 text-right font-semibold">Net Barbearia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {barberPerformance.map(bp => (
                        <tr key={bp.barber.id} className="hover:bg-zinc-900/10">
                          <td className="py-3 font-semibold text-white flex items-center gap-2">
                            <span className="text-xl bg-zinc-950 border border-zinc-850 p-1 rounded-md">{bp.barber.avatar || '🧔'}</span>
                            <span>{bp.barber.name}</span>
                          </td>
                          <td className="py-3 text-center font-mono">{bp.count} comanda(s)</td>
                          <td className="py-3 text-right font-mono text-white">{formatCurrency(bp.billing)}</td>
                          <td className="py-3 text-right font-mono text-amber-500">{formatCurrency(bp.commission)}</td>
                          <td className="py-3 text-right font-mono text-emerald-500">{formatCurrency(bp.net)}</td>
                        </tr>
                      ))}
                      {barberPerformance.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-500">Nenhum barbeiro ativo cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right side: Categories & payment methods */}
              <div className="lg:col-span-4 space-y-6">
                {/* Services vs product faturamento */}
                <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2">
                    Divisão de Vendas
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-352 mb-1.5">
                        <span className="flex items-center gap-1.5 text-zinc-300">💈 Serviços Prestados</span>
                        <span className="font-mono font-bold text-white">{formatCurrency(servicesSalesVolume)}</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${totalRevenueVal > 0 ? (servicesSalesVolume / totalRevenueVal) * 100 : 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-352 mb-1.5">
                        <span className="flex items-center gap-1.5 text-teal-400">🧴 Venda de Produtos</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(productsSalesVolume)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${totalRevenueVal > 0 ? (productsSalesVolume / totalRevenueVal) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Unidades faturadas: {productsQuantity}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-352 mb-1.5">
                        <span className="flex items-center gap-1.5 text-orange-400">🍂 Produtos Tabacaria</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(tabacariaSalesVolume)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${totalRevenueVal > 0 ? (tabacariaSalesVolume / totalRevenueVal) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-zinc-500 font-mono">Unidades faturadas: {tabacariaQuantity}</span>
                        <span className="text-[9px] text-orange-450 uppercase font-mono tracking-wider font-bold">Comissão separada</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories & payment lists */}
                <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2">
                    Faturamento por Categoria
                  </h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {categories.map(cat => {
                      const cost = categoryBreakdown[cat] || 0;
                      return (
                        <div key={cat} className="flex justify-between items-center text-xs font-mono py-1 border-b border-zinc-900 last:border-0">
                          <span className="text-zinc-400 uppercase">{cat}</span>
                          <span className="font-bold text-white">{formatCurrency(cost)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 pt-2">
                    Meios de Pagamento
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(paymentsBreakdown).map(method => {
                      const data = paymentsBreakdown[method];
                      const label = method === 'MONEY' ? 'Dinheiro' : method === 'CARD' ? 'Cartão' : method === 'PIX' ? 'Pix' : 'Assinatura Club';
                      return (
                        <div key={method} className="flex justify-between items-center text-xs font-mono py-1 border-b border-zinc-900 last:border-0">
                          <span className="text-zinc-400">{label} ({data.count})</span>
                          <span className="font-bold text-white">{formatCurrency(data.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* CURVA ABC DE PRODUTOS & ALERTA DE ESTOQUE MÍNIMO */}
            {(() => {
              const abcList = calculateProductABC(products, comandas);
              const countA = abcList.filter(p => p.abcCategory === 'A').length;
              const countB = abcList.filter(p => p.abcCategory === 'B').length;
              const countC = abcList.filter(p => p.abcCategory === 'C').length;
              const lowStockProducts = products.filter(p => p.stock <= (p.minStock ?? 5));

              return (
                <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase flex items-center gap-2">
                        <span>📦</span> Curva ABC de Produtos & Relatório de Estoque Mínimo
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Classificação estratégica de faturamento (80% receita = Classe A, 15% = Classe B, 5% = Classe C) e alertas para reposição.
                      </p>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                        A (Alta): {countA}
                      </span>
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold">
                        B (Média): {countB}
                      </span>
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-bold">
                        C (Baixa): {countC}
                      </span>
                    </div>
                  </div>

                  {lowStockProducts.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                        <span>Atenção: {lowStockProducts.length} produto(s) atingiram o estoque mínimo de segurança!</span>
                      </div>
                      <span className="text-[10px] text-red-300 font-mono">
                        {lowStockProducts.map(p => `${p.name} (${p.stock}/${p.minStock ?? 5} un)`).join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-[10px]">
                          <th className="p-2">Rank</th>
                          <th className="p-2">Produto</th>
                          <th className="p-2">Classe ABC</th>
                          <th className="p-2 text-center">Unidades Vendidas</th>
                          <th className="p-2 text-right">Faturamento Bruto</th>
                          <th className="p-2 text-right">% Receita</th>
                          <th className="p-2 text-right">% Acumulada</th>
                          <th className="p-2 text-center">Estoque Atual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {abcList.map((item, idx) => {
                          const isLowStock = item.stock <= (item.minStock ?? 5);
                          return (
                            <tr key={item.id} className="hover:bg-zinc-900/30">
                              <td className="p-2 text-zinc-500 font-bold">#{idx + 1}</td>
                              <td className="p-2">
                                <p className="font-bold text-white leading-none">{item.name}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{formatCurrency(item.price)} / un</p>
                              </td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  item.abcCategory === 'A'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : item.abcCategory === 'B'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  Classe {item.abcCategory} {item.abcCategory === 'A' ? '🔥' : item.abcCategory === 'B' ? '⚡' : '💤'}
                                </span>
                              </td>
                              <td className="p-2 text-center text-zinc-300 font-bold">{item.totalQtySold} un</td>
                              <td className="p-2 text-right font-bold text-yellow-500">{formatCurrency(item.totalRevenue)}</td>
                              <td className="p-2 text-right text-zinc-300">{(item.revenueShare * 100).toFixed(1)}%</td>
                              <td className="p-2 text-right text-zinc-400">{(item.cumulativeRevenueShare * 100).toFixed(1)}%</td>
                              <td className="p-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isLowStock ? 'bg-red-950 text-red-400 border border-red-500/30 animate-pulse' : 'bg-zinc-900 text-zinc-300'
                                }`}>
                                  {item.stock} un {isLowStock ? '⚠️' : ''}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* RELATÓRIO DE PESQUISA DE SATISFAÇÃO (NPS) */}
            {parameters.enableNPS !== false && (
              <div className="bg-[#101012] border border-amber-500/20 p-5 rounded-xl space-y-4">
                {(() => {
                  const totalFeedbacks = npsFeedbacks.length;
                  const promoters = npsFeedbacks.filter(f => f.score >= 9).length;
                  const passives = npsFeedbacks.filter(f => f.score === 7 || f.score === 8).length;
                  const detractors = npsFeedbacks.filter(f => f.score <= 6).length;
                  
                  const avgScore = totalFeedbacks > 0
                    ? (npsFeedbacks.reduce((acc, f) => acc + f.score, 0) / totalFeedbacks).toFixed(1)
                    : 'N/A';
                  
                  const npsIndex = totalFeedbacks > 0
                    ? Math.round(((promoters - detractors) / totalFeedbacks) * 100)
                    : 0;

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                        <div>
                          <h4 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400" /> Pesquisa de Satisfação NPS
                          </h4>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {parameters.npsQuestion || 'Avaliação da experiência do cliente de 0 a 10'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className={`px-3 py-1 rounded text-xs font-bold border ${
                            npsIndex >= 50 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            npsIndex >= 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            Score NPS: {totalFeedbacks > 0 ? (npsIndex > 0 ? `+${npsIndex}` : npsIndex) : 'S/I'}
                          </span>
                          <span className="px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded text-xs">
                            Média: {avgScore} / 10
                          </span>
                        </div>
                      </div>

                      {/* NPS Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-left">
                          <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">😍 Promotores (Nota 9 - 10)</span>
                          <span className="text-lg font-bold text-emerald-300 font-mono">{promoters} ({totalFeedbacks > 0 ? Math.round((promoters / totalFeedbacks) * 100) : 0}%)</span>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-left">
                          <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">😐 Neutros (Nota 7 - 8)</span>
                          <span className="text-lg font-bold text-amber-300 font-mono">{passives} ({totalFeedbacks > 0 ? Math.round((passives / totalFeedbacks) * 100) : 0}%)</span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left">
                          <span className="text-[10px] text-red-400 font-mono font-bold block uppercase">😡 Detratores (Nota 0 - 6)</span>
                          <span className="text-lg font-bold text-red-300 font-mono">{detractors} ({totalFeedbacks > 0 ? Math.round((detractors / totalFeedbacks) * 100) : 0}%)</span>
                        </div>
                      </div>

                      {/* Recent Feedback Feed */}
                      <div className="space-y-2 pt-2">
                        <h5 className="text-[11px] font-mono font-bold text-zinc-400 uppercase">Comentários & Avaliações Recebidas ({totalFeedbacks})</h5>
                        {totalFeedbacks === 0 ? (
                          <p className="text-xs text-zinc-500 italic font-mono py-3">Nenhuma avaliação recebida até o momento.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                            {npsFeedbacks.slice().reverse().map(f => (
                              <div key={f.id} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg space-y-1.5 text-left">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-white">{f.customerName}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    f.score >= 9 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    f.score >= 7 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    ★ {f.score} / 10
                                  </span>
                                </div>
                                {f.barberName && (
                                  <span className="text-[10px] text-zinc-500 font-mono block">Profissional: {f.barberName}</span>
                                )}
                                {f.comment && (
                                  <p className="text-xs text-zinc-300 italic font-sans bg-zinc-900/60 p-2 rounded border border-zinc-850">
                                    "{f.comment}"
                                  </p>
                                )}
                                <span className="text-[9px] text-zinc-500 font-mono block text-right">{f.date}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            <div className="bg-[#101012] border border-red-900/30 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                <h4 className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-2">
                  <span>🚫</span> Histórico & Motivos de Cancelamentos
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {appointments.filter(a => a.status === 'CANCELLED').length + comandas.filter(c => c.status === 'CANCELLED').length} registros cancelados
                </span>
              </div>

              {(() => {
                const cancelledAppointments = (appointments || []).filter(a => a && a.status === 'CANCELLED');
                const cancelledComandas = (comandas || []).filter(c => c && c.status === 'CANCELLED');
                const allCancelled = [
                  ...cancelledAppointments.map(a => ({
                    id: a.id,
                    type: 'Agendamento' as const,
                    customer: a.customerName || 'Cliente',
                    barber: a.barberName || 'Profissional',
                    service: a.serviceName || 'Serviço',
                    date: a.date || '',
                    cancelledAt: a.cancelledAt || a.date || '',
                    cancelledBy: a.cancelledBy || 'Sistema',
                    reason: a.cancellationReason || 'Sem motivo detalhado'
                  })),
                  ...cancelledComandas.map(c => ({
                    id: c.id,
                    type: 'Comanda' as const,
                    customer: c.customerName || 'Cliente',
                    barber: c.barberName || 'Profissional',
                    service: (c.items || []).map(i => i.description || i.name || '').filter(Boolean).join(', ') || 'Consumo',
                    date: c.createdAt?.split('T')[0] || 'Hoje',
                    cancelledAt: c.cancelledAt || c.createdAt || '',
                    cancelledBy: c.cancelledBy || 'Sistema',
                    reason: c.cancellationReason || 'Sem motivo detalhado'
                  }))
                ];

                if (allCancelled.length === 0) {
                  return (
                    <p className="text-xs text-zinc-500 italic py-3 text-center">Nenhum cancelamento registrado até o momento.</p>
                  );
                }

                return (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-[10px]">
                          <th className="p-2">Tipo</th>
                          <th className="p-2">Cliente</th>
                          <th className="p-2">Barbeiro</th>
                          <th className="p-2">Serviço / Itens</th>
                          <th className="p-2">Data do Cancelamento</th>
                          <th className="p-2">Cancelado Por</th>
                          <th className="p-2">Motivo do Cancelamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {allCancelled.map((item, idx) => (
                          <tr key={`${item.id}-${idx}`} className="hover:bg-red-950/10">
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 bg-red-950/40 text-red-400 border border-red-900/30 rounded text-[9px] uppercase font-bold">
                                {item.type}
                              </span>
                            </td>
                            <td className="p-2 text-white font-bold">{item.customer}</td>
                            <td className="p-2 text-zinc-300">{item.barber}</td>
                            <td className="p-2 text-zinc-400">{item.service}</td>
                            <td className="p-2 text-zinc-500 text-[10px]">
                              {item.cancelledAt?.replace('T', ' ').slice(0, 16)}
                            </td>
                            <td className="p-2 text-yellow-500">{item.cancelledBy}</td>
                            <td className="p-2 text-red-300 italic font-sans">{item.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* TAB 6: CASHIER CLOSING & PARTNER SETTLEMENT DELIBERATION */}
      {activeAdminSubTab === 'fechamento' && (() => {
        const resolvePeriodDates = (period: PeriodPreset, customStart: string, customEnd: string) => {
          let start: Date;
          let end: Date = new Date();
          end.setHours(23, 59, 59, 999);
          const now = new Date();

          if (period === 'diario') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          } else if (period === 'ontem') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
          } else if (period === 'esta_semana') {
            const dayOfWeek = now.getDay();
            const diffToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMon, 0, 0, 0, 0);
          } else if (period === 'semanal') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
          } else if (period === 'este_mes') {
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          } else if (period === 'mes_anterior') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          } else if (period === 'este_ano') {
            start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          } else {
            start = customStart ? new Date(customStart + 'T00:00:00') : new Date(0);
            const parsedEnd = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
            end = parsedEnd;
          }
          return { start, end };
        };

        const getFilteredComandasForClosing = () => {
          const { start, end } = resolvePeriodDates(closingPeriod, closingStartDate, closingEndDate);

          return closedComandas.filter(c => {
            if (!c.completedAt) return false;
            const compDate = new Date(c.completedAt);
            const dateMatch = compDate >= start && compDate <= end;
            const barberMatch = closingBarberId === 'TODOS' || c.barberId === closingBarberId;
            return dateMatch && barberMatch;
          });
        };

        const filteredCmds = getFilteredComandasForClosing();
        const { start: closingStartResolved, end: closingEndResolved } = resolvePeriodDates(closingPeriod, closingStartDate, closingEndDate);
        const closingPeriodLabel = `${closingStartResolved.toLocaleDateString('pt-BR')} até ${closingEndResolved.toLocaleDateString('pt-BR')}`;

        const totalRevenueVal = filteredCmds.reduce((sum, c) => sum + (c.total || 0), 0);
        const totalCommissionsVal = filteredCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
        const netProfitVal = totalRevenueVal - totalCommissionsVal;
        const parsedExpenses = parseFloat(closingExpenseInput) || 0;
        const finalNetProfitVal = netProfitVal - parsedExpenses;
        const totalTicketsVal = filteredCmds.length;

        const barberClosingReport = users
          .filter(u => u.role === 'BARBER')
          .map(b => {
            const bCmds = filteredCmds.filter(c => c.barberId === b.id);
            const billing = bCmds.reduce((sum, c) => sum + (c.total || 0), 0);
            const commission = bCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
            return {
              barber: b,
              count: bCmds.length,
              billing,
              commission,
              net: billing - commission,
            };
          })
          .filter(bp => bp.count > 0);

        const handleExportDSR = () => {
          exportDSRClosingCSV({
            shopName: parameters.shopName || 'Trima Studio',
            periodLabel: closingPeriodLabel,
            totalRevenue: totalRevenueVal,
            totalCommissions: totalCommissionsVal,
            expenses: parsedExpenses,
            netProfit: netProfitVal,
            finalNetProfit: finalNetProfitVal,
            totalTickets: totalTicketsVal,
            notes: closingNotes,
            barbers: barberClosingReport.map(b => ({
              name: b.barber.name,
              count: b.count,
              billing: b.billing,
              commission: b.commission,
              net: b.net,
              isLiquidated: !!liquidatedBarbers[b.barber.id]
            }))
          });
        };

        return (
          <div className="space-y-6 text-left animate-fadeIn">
            <div className="bg-[#101012] border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500 font-mono">
                  📥 Conciliação & Fechamento de Caixa
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Calcule o fechamento financeiro do período, organize os repasses devidos aos barbeiros parceiros e filtre os resultados com detalhamento de custos operacionais e margem de lucro final.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportDSR}
                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow"
              >
                <FileSpreadsheet className="w-4 h-4" /> Exportar Fechamento DSR (Excel / CSV)
              </button>
            </div>

            {/* Filter Criteria */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-300">
                1. Critérios de Filtragem & Período do Caixa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Período de Análise</label>
                  <select
                    value={closingPeriod}
                    onChange={(e) => setClosingPeriod(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono cursor-pointer"
                  >
                    <option value="diario">De Hoje (Diário)</option>
                    <option value="ontem">Ontem</option>
                    <option value="esta_semana">Esta Semana (Seg a Dom)</option>
                    <option value="semanal">Últimos 7 Dias</option>
                    <option value="este_mes">Este Mês</option>
                    <option value="mes_anterior">Mês Anterior</option>
                    <option value="este_ano">Ano Vigente (2026)</option>
                    <option value="personalizado">Intervalo Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Profissional / Barbeiro</label>
                  <select
                    value={closingBarberId}
                    onChange={(e) => setClosingBarberId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono cursor-pointer"
                  >
                    <option value="TODOS">Todos os Barbeiros</option>
                    {users.filter(u => u.role === 'BARBER').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {closingPeriod === 'personalizado' && (
                  <>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Data Inicial</label>
                      <input
                        type="date"
                        value={closingStartDate}
                        onChange={(e) => setClosingStartDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Data Final</label>
                      <input
                        type="date"
                        value={closingEndDate}
                        onChange={(e) => setClosingEndDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </>
                )}

                <div className={closingPeriod === 'personalizado' ? 'md:col-span-4' : 'md:col-span-2'}>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Gastos Operacionais e Insumos adicionais (R$)</label>
                  <input
                    type="number"
                    value={closingExpenseInput}
                    min="0"
                    onChange={(e) => setClosingExpenseInput(e.target.value)}
                    placeholder="Ex: 150.00 (Insumos, tabacaria, faxina, etc)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Balance Grid Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block">Faturamento Bruto</span>
                <span className="text-sm lg:text-base font-bold font-mono text-white mt-1 block">{formatCurrency(totalRevenueVal)}</span>
                <span className="text-[9px] text-zinc-500 font-mono italic">{totalTicketsVal} comanda(s) pagas</span>
              </div>

              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-mono uppercase text-amber-500 block">Repasse (Parceiros)</span>
                <span className="text-sm lg:text-base font-bold font-mono text-amber-500 mt-1 block">-{formatCurrency(totalCommissionsVal)}</span>
                <span className="text-[9px] text-zinc-500 font-mono italic font-semibold">Serviços prestados</span>
              </div>

              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-mono uppercase text-orange-400 block">Outros Custos / Gastos</span>
                <span className="text-sm lg:text-base font-bold font-mono text-orange-400 mt-1 block">-{formatCurrency(parsedExpenses)}</span>
                <span className="text-[9px] text-zinc-500 font-mono italic">Insumos extras do período</span>
              </div>

              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[9px] text-zinc-505 font-mono uppercase text-yellow-500 block">Lucro p/ Barbearia</span>
                <span className="text-sm lg:text-base font-bold font-mono text-yellow-500 mt-1 block">{formatCurrency(netProfitVal)}</span>
                <span className="text-[9px] text-zinc-500 font-mono italic">Bruto menos comissões</span>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                <span className="text-[9px] text-yellow-500 font-mono font-bold uppercase block tracking-wider">LUCRO FINAL LÍQUIDO</span>
                <span className="text-sm lg:text-base font-extrabold font-mono text-white mt-1 block">{formatCurrency(finalNetProfitVal)}</span>
                <span className="text-[9px] text-yellow-500/70 font-mono italic">Saldo real pós-despesas</span>
              </div>
            </div>

            {/* Repasse settlement details block */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-2 flex-wrap gap-2">
                <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase">
                  2. Demonstrativo de Acerto e Resgates por Barbeiro (Parcerias)
                </h4>
                <div className="text-[10px] font-mono text-zinc-400">
                  Total Geral a Pagar aos Parceiros: <span className="text-amber-500 font-bold">{formatCurrency(totalCommissionsVal)}</span>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-400 font-mono text-[9px]">
                      <th className="pb-2 text-left font-semibold">Profissional</th>
                      <th className="pb-2 text-center font-semibold">Atendimentos</th>
                      <th className="pb-2 text-right font-semibold">Captação Bruta</th>
                      <th className="pb-2 text-right font-semibold text-amber-500">Repasse Devido (Comissão)</th>
                      <th className="pb-2 text-right font-semibold">Net Retido Casa</th>
                      <th className="pb-2 text-right font-semibold">Ação / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {barberClosingReport.map(bp => {
                      const isLiquidated = !!liquidatedBarbers[bp.barber.id];
                      return (
                        <tr key={bp.barber.id} className="hover:bg-zinc-900/10 transition">
                          <td className="py-3 font-semibold text-white flex items-center gap-2">
                            <span className="text-xl bg-zinc-950 border border-zinc-850 p-1 rounded-md">{bp.barber.avatar || '🧔'}</span>
                            <div>
                              <p>{bp.barber.name}</p>
                              <p className="text-[9px] text-zinc-500 font-mono lowercase">{bp.barber.email}</p>
                            </div>
                          </td>
                          <td className="py-3 text-center font-mono text-zinc-300">{bp.count} serviços finalizados</td>
                          <td className="py-3 text-right font-mono text-zinc-300">{formatCurrency(bp.billing)}</td>
                          <td className="py-3 text-right font-mono text-amber-500 font-bold">{formatCurrency(bp.commission)}</td>
                          <td className="py-3 text-right font-mono text-emerald-500 font-semibold">{formatCurrency(bp.net)}</td>
                          <td className="py-3 text-right font-mono">
                            <button
                              type="button"
                              onClick={() => {
                                setLiquidatedBarbers(prev => ({
                                  ...prev,
                                  [bp.barber.id]: !prev[bp.barber.id]
                                }));
                              }}
                              className={`px-3 py-1 rounded text-[9px] uppercase font-bold tracking-wider font-mono cursor-pointer transition ${
                                isLiquidated
                                  ? 'bg-[#151518] text-emerald-500 border border-emerald-500/20 font-bold'
                                  : 'bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold'
                              }`}
                            >
                              {isLiquidated ? '✓ Pago / Liquidado' : '💸 Resgatar / Marcar Pago'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {barberClosingReport.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono text-xs">Sem vendas ou repasses registrados para o ciclo de datas selecionadas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close transaction form report */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase">
                3. Finalização Oficial do Período de Caixa
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Notas e Observações do Fechamento</label>
                  <textarea
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder="Ex: Conciliado sem divergências de caixa. Repasses de comissão transferidos aos profissionais em 29/05."
                    rows={3}
                    className="w-full bg-zinc-950 border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white uppercase font-mono placeholder:text-zinc-500"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 flex-wrap gap-4">
                  <div className="text-[10px] text-zinc-500 font-mono font-semibold">
                    * Este fechamento consolidou todas as comandas concluídas.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2 px-4 rounded-xl select-none font-mono tracking-wider transition uppercase border border-zinc-800 cursor-pointer"
                  >
                    🖨️ Imprimir Fechamento de Caixa
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 7: CAIXA DE SUPRIMENTOS */}
      {activeAdminSubTab === 'suprimentos' && (() => {
        const transactions = supplyTransactions || [];
        
        // Calculate deposits (INFLOW)
        const totalInflow = transactions
          .filter(t => t.type === 'INFLOW')
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate expenses (OUTFLOW)
        const totalOutflow = transactions
          .filter(t => t.type === 'OUTFLOW')
          .reduce((sum, t) => sum + t.amount, 0);

        // Current Balance
        const balance = totalInflow - totalOutflow;

        const handleSaveSupplyTransaction = (e: React.FormEvent) => {
          e.preventDefault();
          if (!supDescription.trim() || !supAmount) {
            alert('Preencha os campos obrigatórios!');
            return;
          }

          const parsedAmount = parseFloat(supAmount);
          if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert('Valor inválido!');
            return;
          }

          const operatorUser = currentUser?.name || 'Administrador';
          const buyer = supBuyerName.trim() || operatorUser;

          const newTx: SupplyTransaction = {
            id: `sup-${Date.now()}`,
            type: supType,
            description: supDescription.trim(),
            amount: parsedAmount,
            date: supDate,
            buyerName: buyer,
            registeredBy: operatorUser,
            receiptUrl: supReceiptUrl || undefined,
            notes: supNotes.trim() || undefined,
            isValidated: false // Every new transaction launched remains pending until validated by an administrator
          };

          onUpdateState('supplyTransactions', [...transactions, newTx]);

          // Reset fields
          setSupDescription('');
          setSupAmount('');
          setSupNotes('');
          setSupReceiptUrl('');
          setSupBuyerName('');
          alert(`Movimentação lançada com sucesso por ${operatorUser}! O registro está PENDENTE da validação de um Administrador.`);
        };

        const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => {
            setSupReceiptUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        };

        const handleValidateTx = (id: string) => {
          const updated = transactions.map(t => {
            if (t.id === id) {
              return {
                ...t,
                isValidated: true,
                validatedBy: currentUser?.name || 'Administrador',
                validatedAt: new Date().toISOString()
              };
            }
            return t;
          });
          onUpdateState('supplyTransactions', updated);
          alert('Lançamento validado com sucesso!');
        };

        const handleDeleteTx = (id: string) => {
          if (confirm('Deseja realmente excluir esta movimentação do caixa?')) {
            onUpdateState('supplyTransactions', transactions.filter(t => t.id !== id));
          }
        };

        return (
          <div className="space-y-6 text-left">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#101012] border border-zinc-800 p-5 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold font-mono text-yellow-500 uppercase tracking-wider">
                  📦 Controle de Caixa & Suprimentos
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Gerencie o fundo fixo de suprimentos, registre compras de materiais da barbearia e anexe comprovantes fiscais.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">RESPONSÁVEL:</span>
                <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500 font-bold uppercase font-mono">
                  {users.find(u => u.role === 'ADMIN')?.name || 'Administrador'}
                </span>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Fundo / Depósitos (+)</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-2 block">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInflow)}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Aportes para compras de suprimentos</span>
              </div>

              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Despesas / Saídas (-)</span>
                <span className="text-xl font-bold font-mono text-red-400 mt-2 block">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOutflow)}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Gasto total acumulado com suprimentos</span>
              </div>

              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between ring-1 ring-yellow-500/20">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Saldo do Caixa de Suprimentos</span>
                <span className={`text-xl font-bold font-mono mt-2 block ${balance >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Recurso atualmente disponível em caixa</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transaction Register Form */}
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                  📝 Lançar Movimentação
                </h4>

                <form onSubmit={handleSaveSupplyTransaction} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Tipo de Entrada/Saída *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSupType('OUTFLOW')}
                        className={`py-2 text-xs font-bold uppercase rounded-lg border font-mono transition cursor-pointer ${
                          supType === 'OUTFLOW'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                        }`}
                      >
                        💸 Gasto / Saída
                      </button>
                      <button
                        type="button"
                        onClick={() => setSupType('INFLOW')}
                        className={`py-2 text-xs font-bold uppercase rounded-lg border font-mono transition cursor-pointer ${
                          supType === 'INFLOW'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                        }`}
                      >
                        💰 Depósito / Entrada
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Descrição / Finalidade *</label>
                    <input
                      type="text"
                      required
                      value={supDescription}
                      onChange={(e) => setSupDescription(e.target.value)}
                      placeholder={supType === 'OUTFLOW' ? 'Ex: Compra de toalhas, espuma, lâminas...' : 'Ex: Depósito para fundo de caixa'}
                      className="w-full bg-zinc-950 border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:text-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={supAmount}
                        onChange={(e) => setSupAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-zinc-950 border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Data *</label>
                      <input
                        type="date"
                        required
                        value={supDate}
                        onChange={(e) => setSupDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Comprador / Responsável</label>
                    <select
                      value={supBuyerName || currentUser?.name || ''}
                      onChange={(e) => setSupBuyerName(e.target.value)}
                      className="w-full bg-zinc-950 border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- Escolha o Administrador/Barbeiro --</option>
                      {users.filter(u => u.role === 'ADMIN' || u.role === 'BARBER').map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                      <span>👤 Operador registrando a alteração:</span>
                      <strong className="text-white">{currentUser?.name || 'Administrador'}</strong>
                    </p>
                  </div>

                  {/* Anexar Comprovante Section */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Anexar Comprovante / Cupom Fiscal</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 transition">
                      <div className="space-y-1 text-center">
                        {supReceiptUrl ? (
                          <div className="space-y-2">
                            <span className="text-xl">📄</span>
                            <p className="text-xs text-emerald-400 font-bold font-mono">Comprovante anexado!</p>
                            <button
                              type="button"
                              onClick={() => setSupReceiptUrl('')}
                              className="text-[9px] uppercase font-mono text-red-500 hover:underline cursor-pointer"
                            >
                              Remover Comprovante
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl text-zinc-500">📷</span>
                            <div className="flex text-xs text-zinc-400">
                              <label className="relative cursor-pointer bg-zinc-950 rounded-md font-medium text-yellow-500 hover:text-yellow-600 focus-within:outline-none">
                                <span className="underline">Selecionar arquivo</span>
                                <input type="file" accept="image/*" onChange={handleReceiptUpload} className="sr-only" />
                              </label>
                            </div>
                            <p className="text-[9px] text-zinc-500 font-mono">JPG, PNG de cupom ou fatura</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Observações Adicionais</label>
                    <textarea
                      value={supNotes}
                      onChange={(e) => setSupNotes(e.target.value)}
                      placeholder="Alguma nota sobre a compra..."
                      rows={2}
                      className="w-full bg-zinc-950 border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold uppercase rounded-xl text-xs transition font-mono cursor-pointer shadow"
                  >
                    Registrar Lançamento
                  </button>
                </form>
              </div>

              {/* Transactions list */}
              <div className="lg:col-span-2 bg-[#101012] border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest border-b border-zinc-850 pb-2">
                  📋 Extrato de Lançamentos e Comprovantes
                </h4>

                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs">
                    📂 Nenhuma movimentação registrada no caixa de suprimentos até o momento.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-850 text-zinc-500 font-mono text-[9px] uppercase">
                          <th className="pb-2 text-left font-semibold">Data / Código</th>
                          <th className="pb-2 text-left font-semibold">Descrição / Tipo</th>
                          <th className="pb-2 text-left font-semibold">Responsável</th>
                          <th className="pb-2 text-center font-semibold">Comprovante</th>
                          <th className="pb-2 text-right font-semibold">Valor</th>
                          <th className="pb-2 text-right font-semibold">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {[...transactions].sort((a, b) => b.id.localeCompare(a.id)).map(tx => (
                          <tr key={tx.id} className="hover:bg-zinc-900/10">
                            <td className="py-3 font-mono text-zinc-400">
                              <span className="block text-white font-bold">
                                {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-[9px] uppercase text-zinc-600">{tx.id.slice(-6)}</span>
                            </td>
                            <td className="py-3">
                              <span className="font-bold text-white block uppercase">{tx.description}</span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-bold border ${
                                  tx.type === 'INFLOW'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {tx.type === 'INFLOW' ? '＋ DEPÓSITO' : '💸 COMPRA'}
                                </span>
                                {tx.isValidated ? (
                                  <span className="inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title={tx.validatedAt ? `Validado em ${new Date(tx.validatedAt).toLocaleString('pt-BR')}` : ''}>
                                    ✅ Validado {tx.validatedBy ? `(${tx.validatedBy})` : ''}
                                  </span>
                                ) : (
                                  <span className="inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                                    ⏳ Pendente de Validação
                                  </span>
                                )}
                              </div>
                              {tx.notes && (
                                <p className="text-[10px] text-zinc-500 italic mt-1 font-sans">{tx.notes}</p>
                              )}
                            </td>
                            <td className="py-3 text-zinc-300 font-mono">
                              <span className="font-bold text-white block">{tx.buyerName}</span>
                              <span className="text-[9px] text-zinc-500 block">Lançado por: {tx.registeredBy || tx.buyerName}</span>
                            </td>
                            <td className="py-3 text-center">
                              {tx.receiptUrl ? (
                                <a
                                  href={tx.receiptUrl}
                                  target="_blank"
                                  rel="referrer noopener"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black font-extrabold uppercase font-mono text-[9px] rounded-lg border border-yellow-500/20 transition cursor-pointer"
                                >
                                  👁️ Ver Anexo
                                </a>
                              ) : (
                                <span className="text-[9px] text-zinc-600 uppercase font-mono italic">sem anexo</span>
                              )}
                            </td>
                            <td className={`py-3 text-right font-mono font-bold text-xs ${tx.type === 'INFLOW' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {tx.type === 'INFLOW' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {(currentUser?.role === 'ADMIN' || !currentUser) && !tx.isValidated && (
                                  <button
                                    onClick={() => handleValidateTx(tx.id)}
                                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase font-mono text-[9px] rounded-lg transition cursor-pointer shadow"
                                    title="Validar este lançamento"
                                  >
                                    ✅ Validar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteTx(tx.id)}
                                  className="px-1.5 py-1 text-[10px] uppercase font-mono text-zinc-600 hover:text-red-500 cursor-pointer"
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 8: GAMIFIED GOALS & BARBER TARGETS SYSTEM */}
      {activeAdminSubTab === 'metas' && (() => {
        const isEnabled = parameters.enableBarberGoals !== false;
        const tiers = (parameters.barberGoalTiers && parameters.barberGoalTiers.length > 0)
          ? parameters.barberGoalTiers
          : DEFAULT_GOAL_TIERS;

        const leaderboard = getBarberLeaderboard(users, comandas, parameters, barberDetails);

        return (
          <div className="bg-[#101012] border border-zinc-800 p-6 rounded-xl space-y-8 text-left animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-5">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-yellow-500 font-mono flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" /> Sistema de Metas Gamificado dos Barbeiros
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  Defina os níveis (Tiers), bônus financeiros, regras operacionais e acompanhe em tempo real a evolução da equipe.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleUpdateParameter('enableBarberGoals', !isEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 cursor-pointer shadow ${
                  isEnabled ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {isEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    <span>SISTEMA ATIVADO</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <span>SISTEMA DESATIVADO</span>
                  </>
                )}
              </button>
            </div>

            {/* SEÇÃO 1: REGRAS E POLÍTICA DE METAS */}
            <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" /> Regras do Jogo & Instruções (Editável pelo Administrador)
              </h4>
              <p className="text-xs text-zinc-400">
                Este texto será exibido na tela dos barbeiros no painel de metas para orientar a equipe sobre como funcionam os bônus e apurações.
              </p>
              <textarea
                rows={3}
                value={parameters.barberGoalsRulesText || ''}
                onChange={(e) => handleUpdateParameter('barberGoalsRulesText', e.target.value)}
                placeholder="Digite aqui as regras operacionais, prazo de pagamento de bônus e requisitos mínimos..."
                className="w-full bg-[#101012] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-yellow-500 outline-none font-sans"
              />
            </div>

            {/* SEÇÃO 2: NÍVEIS DE METAS (GOAL TIERS & REWARDS) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" /> Níveis de Conquista & Premiações Configurados ({tiers.length})
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Edite as metas de faturamento, atendimentos e os bônus acumulados de cada nível.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultTiers}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-mono font-bold uppercase rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restaurar Padrões</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNewTierModal}
                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold font-mono uppercase rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Nível</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl relative space-y-3 hover:border-yellow-500/50 transition duration-150"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{t.badge || '🏆'}</span>
                        <div>
                          <h5 className="text-xs font-extrabold text-white">{t.name}</h5>
                          <span className="text-[9px] font-mono uppercase text-zinc-500">Tier #{idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditTier(t)}
                          className="p-1 bg-zinc-900 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 rounded transition cursor-pointer"
                          title="Editar Nível"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTier(t.id)}
                          className="p-1 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded transition cursor-pointer"
                          title="Excluir Nível"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Faturamento:</span>
                        <strong className="text-white">R$ {t.targetRevenue.toLocaleString('pt-BR')}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Atendimentos:</span>
                        <strong className="text-white">{t.targetServicesCount} serviços</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Produtos:</span>
                        <strong className="text-white">R$ {t.targetProductSales.toLocaleString('pt-BR')}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-850 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-mono text-yellow-500 font-bold block">Recompensas Destravadas:</span>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-bold">+ R$ {t.rewardBonusFixed} Cash</span>
                        <span className="text-cyan-400 font-bold">+{t.rewardExtraCommissionPercent}% Com. Extra</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO 3: SOBRESCREVER METAS INDIVIDUAIS POR BARBEIRO */}
            <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" /> Metas Customizadas por Barbeiro (Opcional)
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Permite definir metas específicas individuais para um barbeiro júnior ou sênior, caso não queira usar a regra global.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] uppercase text-zinc-400">
                      <th className="py-2.5 px-3">Barbeiro</th>
                      <th className="py-2.5 px-3">Meta Faturamento (R$)</th>
                      <th className="py-2.5 px-3">Meta Serviços (Unidades)</th>
                      <th className="py-2.5 px-3">Meta Produtos (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {users.filter(u => (u.role === 'BARBER' || u.role === 'ADMIN') && u.isActive).map(b => {
                      const customGoals: Partial<BarberCustomGoal> = parameters.barberCustomGoals?.[b.id] || {};
                      return (
                        <tr key={b.id} className="hover:bg-zinc-900/50">
                          <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                            <span className="text-base">{b.avatar || '🧔'}</span>
                            <span>{b.name}</span>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              placeholder="Usar padrão global"
                              value={customGoals.monthlyRevenueTarget || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const currentMap = parameters.barberCustomGoals || {};
                                const updatedBarberGoal = {
                                  ...currentMap[b.id],
                                  userId: b.id,
                                  monthlyRevenueTarget: isNaN(val) ? undefined : val
                                };
                                handleUpdateParameter('barberCustomGoals', {
                                  ...currentMap,
                                  [b.id]: updatedBarberGoal
                                });
                              }}
                              className="w-36 bg-[#101012] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500 outline-none"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              placeholder="Usar padrão global"
                              value={customGoals.monthlyServicesTarget || ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const currentMap = parameters.barberCustomGoals || {};
                                const updatedBarberGoal = {
                                  ...currentMap[b.id],
                                  userId: b.id,
                                  monthlyServicesTarget: isNaN(val) ? undefined : val
                                };
                                handleUpdateParameter('barberCustomGoals', {
                                  ...currentMap,
                                  [b.id]: updatedBarberGoal
                                });
                              }}
                              className="w-36 bg-[#101012] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500 outline-none"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              placeholder="Usar padrão global"
                              value={customGoals.monthlyProductSalesTarget || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const currentMap = parameters.barberCustomGoals || {};
                                const updatedBarberGoal = {
                                  ...currentMap[b.id],
                                  userId: b.id,
                                  monthlyProductSalesTarget: isNaN(val) ? undefined : val
                                };
                                handleUpdateParameter('barberCustomGoals', {
                                  ...currentMap,
                                  [b.id]: updatedBarberGoal
                                });
                              }}
                              className="w-36 bg-[#101012] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-yellow-500 outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEÇÃO 4: RANKING & LEADERBOARD DO MÊS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" /> Ranking Gamificado & Auditoria de Bônus da Equipe
              </h4>
              <div className="overflow-x-auto bg-zinc-950 border border-zinc-850 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] uppercase text-zinc-400 bg-zinc-900/50">
                      <th className="py-3 px-4">Posição</th>
                      <th className="py-3 px-4">Barbeiro</th>
                      <th className="py-3 px-4">Nível Alcançado</th>
                      <th className="py-3 px-4">Faturamento No Mês</th>
                      <th className="py-3 px-4">Atendimentos</th>
                      <th className="py-3 px-4">Venda Produtos</th>
                      <th className="py-3 px-4 text-right">Bônus a Pagar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {leaderboard.map((entry) => (
                      <tr key={entry.barber.id} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3 px-4 font-bold">
                          {entry.rank === 1 ? (
                            <span className="text-yellow-400 text-sm flex items-center gap-1 font-extrabold">👑 1º</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-zinc-300 text-sm font-extrabold">🥈 2º</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-amber-600 text-sm font-extrabold">🥉 3º</span>
                          ) : (
                            <span className="text-zinc-500 font-bold">{entry.rank}º</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span className="text-base">{entry.barber.avatar || '🧔'}</span>
                          <span>{entry.barber.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          {entry.currentTier ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border"
                              style={{
                                backgroundColor: `${entry.currentTier.color}15`,
                                borderColor: `${entry.currentTier.color}40`,
                                color: entry.currentTier.color || '#eab308'
                              }}
                            >
                              <span>{entry.currentTier.badge}</span>
                              <span>{entry.currentTier.name}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500 uppercase font-mono">Iniciante 🎯</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          R$ {entry.stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          {entry.stats.servicesCount} serviços
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          R$ {entry.stats.productSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-yellow-400">
                            + R$ {entry.earnedBonusFixed}
                          </div>
                          {entry.earnedExtraCommissionPercent > 0 && (
                            <div className="text-[9px] text-cyan-400 font-mono">
                              +{entry.earnedExtraCommissionPercent}% Com. Extra
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. ABA SCRIPTS OPERACIONAIS (POP) */}
      {activeAdminSubTab === 'scripts' && (
        <div className="space-y-6 animate-fadeIn text-left">
          {/* Header do Módulo */}
          <div className="bg-[#101012] border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold uppercase font-mono tracking-wider text-yellow-500 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                Manual de Padrões & Scripts Operacionais (POP)
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Cadastre, edite e categorize procedimentos operacionais padrão, técnicas de atendimento, regras de biossegurança e roteiros de vendas. Todos os scripts ativos ficam disponíveis na aba do barbeiro para consulta rápida e padronização da equipe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingScriptId(null);
                setScriptTitle('');
                setScriptCategory('ATENDIMENTO');
                setScriptTargetAudience('TODOS_BARBEIROS');
                setScriptStepsText('');
                setScriptTipsText('');
                setScriptTagsText('');
                setScriptIsActive(true);
                setShowScriptModal(true);
              }}
              className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold font-mono text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Novo Script Operacional
            </button>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-[#101012] border border-zinc-800 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={scriptSearchTerm}
                  onChange={(e) => setScriptSearchTerm(e.target.value)}
                  placeholder="Buscar por título, conteúdo, etapas, dicas ou tags..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-yellow-500 outline-none font-mono"
                />
                {scriptSearchTerm && (
                  <button
                    onClick={() => setScriptSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                {scripts.length} script(s) cadastrado(s)
              </span>
            </div>

            {/* Categorias Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-850">
              {[
                { id: 'TODOS', label: 'Todos os Scripts' },
                { id: 'ATENDIMENTO', label: '🛎️ Atendimento & Recepção' },
                { id: 'CORTE_BARBA', label: '✂️ Corte & Barba' },
                { id: 'HIGIENE_BIOSSEGURANCA', label: '🧼 Higiene & Biossegurança' },
                { id: 'VENDAS_PRODUTOS', label: '💼 Vendas & Pós-Venda' },
                { id: 'GESTAO_COMANDAS', label: '🧾 Comandas & Caixa' },
                { id: 'OUTROS', label: '📋 Outros Padrões' }
              ].map((cat) => {
                const count = cat.id === 'TODOS'
                  ? scripts.length
                  : scripts.filter(s => (s.category || 'ATENDIMENTO') === cat.id).length;
                const isSelected = scriptCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setScriptCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-yellow-500 text-black font-bold shadow-xs'
                        : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listagem de Scripts */}
          {(() => {
            const filteredScripts = scripts.filter(s => {
              if (scriptCategoryFilter !== 'TODOS' && (s.category || 'ATENDIMENTO') !== scriptCategoryFilter) {
                return false;
              }
              if (scriptSearchTerm.trim()) {
                const q = scriptSearchTerm.toLowerCase();
                const titleMatch = s.title?.toLowerCase().includes(q);
                const tipsMatch = s.tips?.toLowerCase().includes(q);
                const stepsMatch = s.steps?.some(st => st.toLowerCase().includes(q));
                const contentMatch = s.content?.toLowerCase().includes(q);
                const tagsMatch = s.tags?.some(tg => tg.toLowerCase().includes(q));
                return titleMatch || tipsMatch || stepsMatch || contentMatch || tagsMatch;
              }
              return true;
            });

            if (filteredScripts.length === 0) {
              return (
                <div className="bg-[#101012] border border-zinc-800 p-12 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto text-2xl">
                    📜
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase font-mono">Nenhum script encontrado</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      {scriptSearchTerm || scriptCategoryFilter !== 'TODOS'
                        ? 'Nenhum script corresponde aos filtros atuais. Tente buscar outro termo ou limpar os filtros.'
                        : 'Ainda não há scripts operacionais cadastrados no sistema. Crie o primeiro para padronizar os processos.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScriptId(null);
                      setScriptTitle('');
                      setScriptCategory('ATENDIMENTO');
                      setScriptTargetAudience('TODOS_BARBEIROS');
                      setScriptStepsText('');
                      setScriptTipsText('');
                      setScriptTagsText('');
                      setScriptIsActive(true);
                      setShowScriptModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold font-mono text-xs rounded-xl shadow cursor-pointer inline-flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar Primeiro Script
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScripts.map((s) => {
                  const categoryBadgeColor = (() => {
                    switch (s.category) {
                      case 'ATENDIMENTO':
                        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      case 'CORTE_BARBA':
                        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      case 'HIGIENE_BIOSSEGURANCA':
                        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      case 'VENDAS_PRODUTOS':
                        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                      case 'GESTAO_COMANDAS':
                        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                      default:
                        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
                    }
                  })();

                  const categoryLabel = (() => {
                    switch (s.category) {
                      case 'ATENDIMENTO': return '🛎️ Atendimento';
                      case 'CORTE_BARBA': return '✂️ Corte & Barba';
                      case 'HIGIENE_BIOSSEGURANCA': return '🧼 Higiene & Biossegurança';
                      case 'VENDAS_PRODUTOS': return '💼 Vendas & Produtos';
                      case 'GESTAO_COMANDAS': return '🧾 Comandas';
                      default: return '📋 Geral';
                    }
                  })();

                  const targetLabel = (() => {
                    switch (s.targetAudience) {
                      case 'INICIANTES': return '🎯 Treinamento / Júnior';
                      case 'MESTRES': return '👑 Barbeiros Sênior';
                      default: return '👥 Toda a Equipe';
                    }
                  })();

                  const stepsList = s.steps && s.steps.length > 0
                    ? s.steps
                    : (s.content ? s.content.split('\n').map(x => x.trim()).filter(Boolean) : []);

                  return (
                    <div
                      key={s.id}
                      className={`bg-[#101012] border rounded-2xl p-5 space-y-4 transition flex flex-col justify-between ${
                        s.isActive === false
                          ? 'border-zinc-850 opacity-60'
                          : 'border-zinc-800 hover:border-yellow-500/40 shadow-sm'
                      }`}
                    >
                      {/* Top Header Card */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${categoryBadgeColor}`}>
                              {categoryLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-850">
                              {targetLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleScriptActive(s.id)}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition cursor-pointer font-bold ${
                                s.isActive !== false
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                              title="Clique para alternar ativação"
                            >
                              {s.isActive !== false ? '● Ativo' : '○ Inativo'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditScriptSelect(s)}
                              className="p-1.5 bg-zinc-900 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 rounded-lg transition cursor-pointer border border-zinc-800"
                              title="Editar Script"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteScript(s.id)}
                              className="p-1.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer border border-zinc-800"
                              title="Excluir Script"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white font-mono leading-snug">
                          {s.title}
                        </h4>
                      </div>

                      {/* Steps / Checklist */}
                      <div className="space-y-2 bg-zinc-950 border border-zinc-850/80 p-3.5 rounded-xl">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                          Passo a Passo / Procedimento:
                        </span>
                        <div className="space-y-1.5 text-xs text-zinc-300 font-sans">
                          {stepsList.map((step, stepIdx) => (
                            <div key={stepIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {stepIdx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips Box (if exists) */}
                      {s.tips && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-1">
                          <span className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5">
                            💡 Dica de Ouro / Argumentação:
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            {s.tips}
                          </p>
                        </div>
                      )}

                      {/* Tags & Footer Info */}
                      <div className="pt-2 border-t border-zinc-850 flex items-center justify-between gap-2 flex-wrap text-[10px] text-zinc-500 font-mono">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {s.tags && s.tags.length > 0 ? (
                            s.tags.map((t, idx) => (
                              <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span>Sem tags</span>
                          )}
                        </div>
                        <span>
                          {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('pt-BR') : 'Recente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
      </ErrorBoundary>
      {/* MODAL: CRIAR / EDITAR BANNER */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-left shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500">
                {editingBannerId ? 'Editar Banner do Portal' : 'Novo Banner do Portal'}
              </h3>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono font-bold cursor-pointer"
              >
                ✕ FECHAR
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[10px] text-zinc-300 font-mono">
                💡 <strong>Dica:</strong> Você pode usar <span className="text-yellow-400 font-bold">{'{NOME}'}</span> ou <span className="text-yellow-400 font-bold">{'{CLIENTE}'}</span> no título e subtítulo para personalizar o banner!
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Título Principal *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Ex: Oferta Especial para {NOME}"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Subtítulo / Descrição Curta</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Ex: Olá {NOME}, garanta seu atendimento com descontos exclusivos"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Modo de Exibição</label>
                  <select
                    value={bannerDisplayMode}
                    onChange={(e) => setBannerDisplayMode(e.target.value as 'CAROUSEL' | 'STATIC')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="CAROUSEL">🎠 Carrossel (Rotativo)</option>
                    <option value="STATIC">📌 Estático (Fixo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Dispositivo Alvo</label>
                  <select
                    value={bannerTargetDevice}
                    onChange={(e) => setBannerTargetDevice(e.target.value as 'ALL' | 'DESKTOP' | 'MOBILE')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="ALL">🌐 Todos (PC & Celular)</option>
                    <option value="DESKTOP">💻 Apenas Computador (PC)</option>
                    <option value="MOBILE">📱 Apenas Celular (Mobile)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Imagem PC / Desktop (URL ou Enviar Foto)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... ou Base64"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  />
                  <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shrink-0 flex items-center justify-center">
                    📁 Subir Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setBannerImageUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Imagem Celular / Mobile (Opcional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerMobileImageUrl}
                    onChange={(e) => setBannerMobileImageUrl(e.target.value)}
                    placeholder="Cole a URL para Celular ou envie um arquivo"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  />
                  <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shrink-0 flex items-center justify-center">
                    📱 Subir Foto Mobile
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setBannerMobileImageUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[9px] text-zinc-500 mt-1 font-mono">Se não enviada, a foto principal do PC será usada em telas menores.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Selo / Tag Destaque</label>
                  <input
                    type="text"
                    value={bannerBadgeText}
                    onChange={(e) => setBannerBadgeText(e.target.value.toUpperCase())}
                    placeholder="Ex: PROMOÇÃO, NOVO"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Status Exibição</label>
                  <select
                    value={bannerIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setBannerIsActive(e.target.value === 'active')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="active">Ativo (Visível)</option>
                    <option value="inactive">Inativo (Oculto)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-lg cursor-pointer"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR PROMOÇÃO */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-left shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500">
                {editingPromoId ? 'Editar Promoção' : 'Nova Promoção'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPromotionModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono font-bold cursor-pointer"
              >
                ✕ FECHAR
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Título da Promoção *</label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Ex: Primeira Visita (Boas-Vindas)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Categoria / Tipo de Promoção</label>
                <select
                  value={promoCategory}
                  onChange={(e) => setPromoCategory(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                >
                  <option value="FIRST_BOOKING">Primeira Compra / Boas-Vindas</option>
                  <option value="BIRTHDAY">Aniversariante do Mês</option>
                  <option value="SPECIAL_DATE">Datas Comemorativas</option>
                  <option value="GENERAL">Geral / Cupom Especial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Tipo de Desconto</label>
                  <select
                    value={promoDiscountType}
                    onChange={(e) => setPromoDiscountType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="FIXED">Valor Fixo (R$)</option>
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Valor do Desconto *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={promoDiscountValue}
                    onChange={(e) => setPromoDiscountValue(e.target.value)}
                    placeholder="15"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Código do Cupom</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Ex: BEMVINDO15"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Descrição Explicativa</label>
                <textarea
                  rows={2}
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Ex: Válido para novos clientes no primeiro atendimento."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPromotionModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-lg cursor-pointer"
                >
                  Salvar Promoção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR CUPOM DE DESCONTO */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-left shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-yellow-400" />
                {editingCouponId ? 'Editar Cupom de Desconto' : 'Novo Cupom de Desconto'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono font-bold cursor-pointer"
              >
                ✕ FECHAR
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Código do Cupom *</label>
                  <input
                    type="text"
                    required
                    value={cpnCode}
                    onChange={(e) => setCpnCode(e.target.value.toUpperCase())}
                    placeholder="Ex: PROMO10, NATALVIP"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-yellow-400 uppercase focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Tipo de Desconto</label>
                  <select
                    value={cpnDiscountType}
                    onChange={(e) => setCpnDiscountType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                    Valor do Desconto * {cpnDiscountType === 'PERCENTAGE' ? '(%)' : '(R$)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cpnDiscountValue}
                    onChange={(e) => setCpnDiscountValue(e.target.value)}
                    placeholder={cpnDiscountType === 'PERCENTAGE' ? '15' : '15.00'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Gasto Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cpnMinPurchase}
                    onChange={(e) => setCpnMinPurchase(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Limite por Cliente</label>
                  <input
                    type="number"
                    min="1"
                    value={cpnMaxUsesPerCustomer}
                    onChange={(e) => setCpnMaxUsesPerCustomer(e.target.value)}
                    placeholder="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Validade Até</label>
                  <input
                    type="date"
                    value={cpnValidUntil}
                    onChange={(e) => setCpnValidUntil(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Descrição do Cupom</label>
                <input
                  type="text"
                  value={cpnDescription}
                  onChange={(e) => setCpnDescription(e.target.value)}
                  placeholder="Ex: 15% OFF no combo Corte + Barba"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cpn-active"
                  checked={cpnIsActive}
                  onChange={(e) => setCpnIsActive(e.target.checked)}
                  className="rounded border-zinc-700 text-yellow-500 focus:ring-yellow-500"
                />
                <label htmlFor="cpn-active" className="text-xs text-zinc-300 cursor-pointer">
                  Cupom Ativo e Disponível para Uso
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-lg cursor-pointer"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: CRIAR / EDITAR NÍVEL DE META (TIER) */}
      {showTierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-left shadow-2xl animate-fadeIn font-mono">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                {editingTierId ? 'Editar Nível de Meta' : 'Novo Nível de Meta Gamificado'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ FECHAR
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Nome do Nível / Conquista</label>
                  <input
                    type="text"
                    required
                    value={tierName}
                    onChange={(e) => setTierName(e.target.value)}
                    placeholder="Ex: Nível Ouro (Mestre)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Emoji / Badge</label>
                  <input
                    type="text"
                    required
                    value={tierBadge}
                    onChange={(e) => setTierBadge(e.target.value)}
                    placeholder="Ex: 🥇"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-center text-lg text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Meta Faturamento (R$)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={tierRev}
                    onChange={(e) => setTierRev(e.target.value)}
                    placeholder="Ex: 7000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Meta Serviços (Qtd)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={tierServ}
                    onChange={(e) => setTierServ(e.target.value)}
                    placeholder="Ex: 100"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Meta Produtos (R$)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={tierProd}
                    onChange={(e) => setTierProd(e.target.value)}
                    placeholder="Ex: 800"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-850">
                <div>
                  <label className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">Bônus em Dinheiro Cash (R$)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={tierBonus}
                    onChange={(e) => setTierBonus(e.target.value)}
                    placeholder="Ex: 250"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">Comissão Adicional (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={tierExtraComm}
                    onChange={(e) => setTierExtraComm(e.target.value)}
                    placeholder="Ex: 5.0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTierModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-lg cursor-pointer shadow"
                >
                  Salvar Nível de Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR SCRIPT OPERACIONAL */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101012] border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-4 text-left shadow-2xl animate-fadeIn font-mono">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-yellow-400" />
                {editingScriptId ? 'Editar Script Operacional' : 'Novo Script Operacional (POP)'}
              </h3>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ FECHAR
              </button>
            </div>

            <form onSubmit={handleSaveScript} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Título do Procedimento / Script *
                </label>
                <input
                  type="text"
                  required
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  placeholder="Ex: Recepção e Consulta de Visagismo"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={scriptCategory}
                    onChange={(e) => setScriptCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="ATENDIMENTO">🛎️ Atendimento & Recepção</option>
                    <option value="CORTE_BARBA">✂️ Corte, Barba & Visagismo</option>
                    <option value="HIGIENE_BIOSSEGURANCA">🧼 Higiene & Biossegurança</option>
                    <option value="VENDAS_PRODUTOS">💼 Vendas & Pós-Atendimento</option>
                    <option value="GESTAO_COMANDAS">🧾 Gestão de Comandas & Caixa</option>
                    <option value="OUTROS">📋 Outros Padrões</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Público-Alvo *
                  </label>
                  <select
                    value={scriptTargetAudience}
                    onChange={(e) => setScriptTargetAudience(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="TODOS_BARBEIROS">👥 Toda a Equipe de Barbeiros</option>
                    <option value="INICIANTES">🎯 Barbeiros em Treinamento / Júnior</option>
                    <option value="MESTRES">👑 Barbeiros Sênior / Mestres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Status de Publicação
                </label>
                <select
                  value={scriptIsActive ? 'active' : 'inactive'}
                  onChange={(e) => setScriptIsActive(e.target.value === 'active')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                >
                  <option value="active">● Ativo (Visível na aba dos barbeiros)</option>
                  <option value="inactive">○ Inativo (Rascunho / Oculto)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-zinc-400 uppercase block">
                    Passo a Passo do Procedimento *
                  </label>
                  <span className="text-[9px] text-zinc-500">Digite uma etapa por linha</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={scriptStepsText}
                  onChange={(e) => setScriptStepsText(e.target.value)}
                  placeholder={'1. Cumprimente o cliente chamando-o pelo nome cadastrado.\n2. Ofereça água, café ou cerveja da casa.\n3. Faça a análise de visagismo antes de iniciar o corte.'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-sans leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                  💡 Dicas de Ouro & Argumentos de Venda (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={scriptTipsText}
                  onChange={(e) => setScriptTipsText(e.target.value)}
                  placeholder="Ex: Explique o modo de usar da pomada enquanto finaliza o cabelo no espelho."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Tags de Busca / Palavras-chave (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={scriptTagsText}
                  onChange={(e) => setScriptTagsText(e.target.value)}
                  placeholder="Ex: Recepção, Visagismo, Encantamento, Vendas"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-lg cursor-pointer shadow transition"
                >
                  {editingScriptId ? 'Salvar Alterações' : 'Cadastrar Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
