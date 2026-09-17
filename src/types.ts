/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'BARBER' | 'CUSTOMER' | 'CASHIER';

export interface CustomerBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;         // Desktop/Default image URL
  mobileImageUrl?: string;   // Image URL specifically for mobile screens
  linkUrl?: string;
  badgeText?: string;
  isActive: boolean;
  displayMode?: 'CAROUSEL' | 'STATIC'; // Carousel slider or static banner
  targetDevice?: 'ALL' | 'DESKTOP' | 'MOBILE'; // All devices, Desktop only, Mobile only
  sortOrder?: number;
}

export interface PromotionRule {
  id: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  code?: string;
  isActive: boolean;
  category?: 'FIRST_BOOKING' | 'BIRTHDAY' | 'SPECIAL_DATE' | 'GENERAL';
  validUntil?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  avatar?: string; // Can be an emoji or url
  bio?: string;    // Brief description about the barber
  login?: string;
  password?: string;
  permissions?: string[];
  photoUrl?: string; // Barber's actual photo URL
  birthday?: string; // YYYY-MM-DD or DD/MM
  barberNotes?: string; // Notes visible only to barbers and administrators
  loyaltyPoints?: number; // Loyalty points balance
  referralCode?: string; // User's unique referral code
  referredByCode?: string; // Code of the user who referred them
  referralRewardGranted?: boolean; // True if referral bonus was already granted upon first purchase
  creditBalance?: number; // Positive advance/prepaid balance in R$
  debtBalance?: number; // Pending fiado/debt balance in R$
  requiresPasswordChange?: boolean; // True if mandatory password change is required on next login
  createdBy?: string; // Name or login of the user who registered this account
  createdAt?: string; // ISO timestamp
  lastPasswordChangeAt?: string; // ISO timestamp of last password update
}

export interface OperationalScript {
  id: string;
  title: string;
  category: 'ATENDIMENTO' | 'HIGIENE' | 'POSTURA' | 'ORGANIZACAO' | 'VENDAS' | 'GERAL' | 'CORTE_BARBA' | 'HIGIENE_BIOSSEGURANCA' | 'VENDAS_PRODUTOS' | 'FIDELIZACAO' | 'GESTAO_COMANDAS' | 'OUTROS' | string;
  content: string;
  steps?: string[];
  tips?: string;
  targetAudience?: 'BARBERS' | 'CASHIERS' | 'ALL' | string;
  isActive?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface DiscountCoupon {
  id: string;
  code: string; // e.g. "PRIMEIRA10", "TRIMA20"
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number; // e.g. 10 (%) or 15 (R$)
  minPurchaseAmount?: number; // optional minimum purchase value
  maxUsesTotal?: number; // max times coupon can be used across all customers
  maxUsesPerCustomer?: number; // max times 1 customer can use
  timesUsed: number;
  usedBy?: Array<{ customerId: string; customerName?: string; date: string; comandaId?: string; appointmentId?: string }>;
  validUntil?: string; // YYYY-MM-DD
  isActive: boolean;
  rulesText?: string;
  createdAt: string;
}

export interface CustomerCreditTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'CREDIT_ADD' | 'CREDIT_USE' | 'DEBT_ADD' | 'DEBT_PAY'; // Adiantamento/Crédito adicionado, Usado na compra, Fiado gerado, Fiado quitado
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  createdBy: string; // Nome do operador do Caixa
  paymentMethod?: string;
  comandaId?: string;
}

export interface BarberGoalTier {
  id: string;
  name: string; // e.g. "Bronze", "Prata", "Ouro", "Diamante"
  badge: string; // e.g. "🥉", "🥈", "🥇", "💎"
  targetRevenue: number; // Monthly gross revenue target in R$
  targetServicesCount: number; // Monthly completed services target
  targetProductSales: number; // Monthly product sales target in R$
  rewardBonusFixed: number; // Cash bonus award in R$
  rewardExtraCommissionPercent: number; // Extra commission bonus percentage (e.g. 2.5 = +2.5%)
  color: string; // Hex color code or Tailwind color name
}

export interface BarberCustomGoal {
  userId: string;
  monthlyRevenueTarget?: number;
  monthlyServicesTarget?: number;
  monthlyProductSalesTarget?: number;
}

export interface BarberDetail {
  userId: string;
  commissionRateStandard: number; // e.g. 0.50 (50%)
  commissionRateSubscription: number; // e.g. 0.35 (35%)
  commissionRateProduct?: number;    // e.g. 0.15 (15%) for product sales
  vipServicesMonthlyQuota?: number;   // Custom monthly VIP quota for this barber (if unset, uses global default)
  customMonthlyRevenueTarget?: number; // Custom monthly revenue target override
  customMonthlyServicesTarget?: number; // Custom monthly services target override
  customMonthlyProductSalesTarget?: number; // Custom monthly product sales target override
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: string;
  categories?: string[]; // Multiple categories support
  isActive?: boolean;
  benefits?: string;
  imageUrl?: string;
  slug?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category?: string;
  categories?: string[]; // Multiple categories support
  minStock?: number; // Minimum stock threshold for critical alert
  costPrice?: number; // Purchase cost price for margin & ABC analysis
}

export interface LoyaltyPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  servicesIncludedCount: number; // number of uses allowed per month (or 999 for unlimited)
  currentCommissionRate: number; // barber payout for these customer visits (in %)
  rules: string[];
  isUnlimited?: boolean; // Unlimited use of specific services
  includedServiceIds?: string[]; // Specific service IDs with unlimited use
  barberPayoutRate?: number; // Editable barber payout percentage (e.g. 35%)
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  startDate: string;
  endDate: string;
  servicesRemaining: number;
  isActive: boolean;
  status?: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  comandaId?: string;
  paidAt?: string;
  paymentMethod?: string;
  selectedServiceIds?: string[];
  totalPriceMonthly?: number;
  discountPercentage?: number;
  isUnlimited?: boolean;
  includedServiceIds?: string[];
  barberPayoutRate?: number;
}

export interface BarberPayout {
  id: string;
  barberId: string;
  barberName: string;
  amount: number;
  type: 'COMMISSION_SETTLEMENT' | 'ADVANCE_VALE' | 'BONUS_REWARD' | 'OTHER_ADJUSTMENT';
  date: string; // YYYY-MM-DD
  paymentMethod: string; // e.g. "PIX", "DINHEIRO", "TRANSFERÊNCIA"
  notes?: string;
  receiptNumber?: string;
  registeredBy: string; // Admin user who registered the payment
  createdAt: string;
  periodStart?: string;
  periodEnd?: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AdditionalServiceItem {
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  additionalServices?: AdditionalServiceItem[];
  totalPrice?: number;
  totalDurationMinutes?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime?: string; // HH:MM for encaixe or custom duration
  status: AppointmentStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  isEncaixe?: boolean;
  isSubscriptionUse?: boolean;
  subscriptionId?: string;
  notes?: string;
  createdBy?: string; // Logged-in user who scheduled/created this appointment
  appliedCouponCode?: string;
  discountAmount?: number;
  finalPrice?: number;
}

export type ComandaStatus = 'OPEN' | 'PAID' | 'CANCELLED' | 'CLOSED' | 'COMPLETED';

export interface ComandaItem {
  id: string;
  description?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  isProduct?: boolean; // distinguish service from product
  isVipService?: boolean; // VIP client service (100% to barber, 0% to shop, custom price)
  serviceId?: string;
  productId?: string;
}

export interface Comanda {
  id: string;
  appointmentId?: string; // optional association
  customerId: string;
  customerName: string;
  barberId: string;
  barberName: string;
  status: ComandaStatus;
  items: ComandaItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  commissionAmount?: number; // total payout to barber
  paymentMethod?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  isEncaixe?: boolean;
  isSubscriptionUse?: boolean;
  subscriptionId?: string;
  notes?: string;
  readyForPayment?: boolean;
  dispatchedAt?: string;
  closedBy?: string;
  createdBy?: string; // Logged-in user who opened/created this comanda
  appliedCouponCode?: string; // Code of coupon applied
  couponDiscount?: number; // Discount amount from coupon
  creditAmountUsed?: number; // Positive credit deducted from client's balance
  debtAmountCharged?: number; // Fiado debt registered to customer account
}

export interface SupplyTransaction {
  id: string;
  type: 'INFLOW' | 'OUTFLOW'; // INFLOW = funding/deposit, OUTFLOW = expense
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  buyerName: string; // name of barber admin who registered the transaction
  registeredBy?: string; // name of logged in user who registered the transaction
  receiptUrl?: string; // data URL or mock URL
  notes?: string;
  isValidated?: boolean; // true = approved/validated by admin, false/undefined = pending
  validatedBy?: string; // name of admin who validated
  validatedAt?: string; // ISO date string when validated
}

export interface SystemParameters {
  shopName: string;
  openTime: string; // "09:00"
  closeTime: string; // "19:00"
  defaultCommissionService: number; // e.g. 50%
  defaultCommissionProduct: number; // e.g. 10%
  defaultClientPassword?: string; // Default password for new clients registered by barbers
  address: string;
  phone: string;
  primaryColor?: string; // e.g. "#eab308" (yellow)
  backgroundColor?: string; // e.g. "#000000" (black)
  logoUrl?: string; // customizable image URL
  systemName?: string; // Nome do sistema/barbearia que aparece no canto superior ao lado da logotipo
  systemNameColor?: string; // Cor personalizada do nome do sistema no canto superior (ex: #eab308, #ffffff)
  systemSubtitle?: string; // Subtítulo ou slogan no cabeçalho abaixo do nome do sistema
  // Subscription Quantity Discount Config
  enableQuantitySubscriptionDiscount?: boolean; // When false, the automatic discount based on service quantity is disabled
  subDiscount2?: number; // e.g. 0.05
  subDiscount3to4?: number; // e.g. 0.12
  subDiscount5to6?: number; // e.g. 0.20
  subDiscount7Plus?: number; // e.g. 0.28
  paymentMethods?: string[]; // user customizable list of payment methods
  // WhatsApp Reminder Config
  whatsappTemplate?: string; // Custom reminder text template
  // Loyalty Program Config
  enableLoyalty?: boolean; // Enable or disable loyalty points program
  loyaltyPointsPerReal?: number; // Points awarded per R$ spent (e.g., 1 point per R$1)
  loyaltyMinPointsRedeem?: number; // Minimum points required to redeem a reward (e.g., 100 points)
  loyaltyRewardValue?: number; // Discount value in R$ when redeeming minimum points (e.g., R$10 discount)
  // Digital Receipt Config
  enableReceipts?: boolean; // Enable digital receipt / thermal print option
  receiptFooterText?: string; // Footer note on receipts
  // NPS Survey Config
  enableNPS?: boolean; // Enable satisfaction survey
  npsTitle?: string; // Custom NPS survey section title
  npsQuestion?: string; // Custom question prompt

  // VIP Client Services Config
  enableVipServices?: boolean;
  vipServicesPerBarberMonthly?: number; // Max monthly VIP services quota per barber (e.g. 5)

  // Referral Program Config (MGM)
  enableReferralProgram?: boolean;
  referralTitle?: string;
  referralDescription?: string;
  referralDiscountReferrer?: number; // Discount/reward credit value for the person who referred
  referralDiscountReferred?: number; // Welcome discount/credit value for the referred friend on 1st purchase
  referralRewardReferredFirstPurchase?: number; // Welcome bonus credit for referred friend
  referralRulesText?: string;

  // Discount Coupons Config
  enableCoupons?: boolean; // Enable or disable discount coupons module

  // Customer Credit & Fiado Config
  enableCustomerCredit?: boolean; // Enable prepaid / advance balance
  enableCustomerDebt?: boolean; // Enable fiado / debt management

  // Customer Portal Banners & Editable Texts
  customerPortalHeaderTitle?: string;
  customerPortalWelcomeTitle?: string;
  customerPortalWelcomeText?: string;
  customerPortalSchedulingInfoText?: string;
  customerPortalAnnouncementText?: string;
  customerPortalClubBannerText?: string;
  customerPortalAgendarTitle?: string;
  customerPortalAgendarSubtitle?: string;
  customerPortalSubscriptionsTitle?: string;
  customerPortalSubscriptionsSubtitle?: string;
  customerPortalPackageTitle?: string;
  customerPortalPackageSubtitle?: string;
  customerPortalAppointmentsTitle?: string;
  customerPortalAppointmentsSubtitle?: string;
  customerPortalFooterText?: string;
  customerPortalBanners?: CustomerBanner[];

  // Customer Portal Section Visibility Controls (Allows admin to hide/show any section)
  portalShowGuestBanner?: boolean;
  portalShowWelcomeHeader?: boolean;
  portalShowBannersCarousel?: boolean;
  portalShowAdvantagesCollapsible?: boolean;
  portalShowReferralProgram?: boolean;
  portalShowPromotions?: boolean;
  portalShowLoyaltyCard?: boolean;
  portalShowSubscriptionsSection?: boolean;
  portalShowPackageBuilder?: boolean;
  portalShowSchedulingFlow?: boolean;
  portalShowServiceSearch?: boolean;
  portalShowServiceCategories?: boolean;
  portalShowAppointmentsHistory?: boolean;
  portalShowNpsSurvey?: boolean;
  portalShowContactFooter?: boolean;

  // Customer Portal Block Order customization (e.g. ['banners', 'promos', 'scheduling', 'subscriptions', 'appointments', 'nps', 'contact'])
  customerPortalBlockOrder?: string[];

  // Social Networks, Maps & Google Reviews Links
  instagramUrl?: string;
  facebookUrl?: string;
  whatsappUrl?: string;
  tiktokUrl?: string;
  googleMapsUrl?: string;
  googleReviewUrl?: string; // Direct link or Place ID for Google 5-Star Reviews
  portalShowGoogleReviews?: boolean; // Show Google Reviews banner/card in customer portal
  googleReviewCalloutTitle?: string; // Custom title for Google Review callout
  googleReviewCalloutText?: string; // Custom text for Google Review callout

  // Promotions System Config
  enablePromotions?: boolean;
  promotions?: PromotionRule[];

  // Gamified Barber Goals System Config
  enableBarberGoals?: boolean;
  barberGoalTiers?: BarberGoalTier[];
  barberGoalsRulesText?: string;
  barberCustomGoals?: Record<string, BarberCustomGoal>;
}

export interface NPSFeedback {
  id: string;
  customerId: string;
  customerName: string;
  barberId?: string;
  barberName?: string;
  score: number; // 0 to 10
  comment?: string;
  date: string; // YYYY-MM-DD HH:mm
}
