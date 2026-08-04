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
  minStock?: number; // Minimum stock threshold for critical alert
  costPrice?: number; // Purchase cost price for margin & ABC analysis
}

export interface LoyaltyPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  servicesIncludedCount: number; // number of uses allowed per month
  currentCommissionRate: number; // barber payout for these customer visits (in %)
  rules: string[];
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  startDate: string;
  endDate: string;
  servicesRemaining: number;
  isActive: boolean;
  selectedServiceIds?: string[];
  totalPriceMonthly?: number;
  discountPercentage?: number;
}

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
  address: string;
  phone: string;
  primaryColor?: string; // e.g. "#eab308" (yellow)
  backgroundColor?: string; // e.g. "#000000" (black)
  logoUrl?: string; // customizable image URL
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

  // Referral Program Config
  enableReferralProgram?: boolean;
  referralTitle?: string;
  referralDescription?: string;
  referralDiscountReferrer?: number; // Discount/reward value for the person who referred
  referralDiscountReferred?: number; // Discount value for the referred friend
  referralRulesText?: string;

  // Customer Portal Banners & Editable Texts
  customerPortalHeaderTitle?: string;
  customerPortalWelcomeTitle?: string;
  customerPortalWelcomeText?: string;
  customerPortalSchedulingInfoText?: string;
  customerPortalAnnouncementText?: string;
  customerPortalClubBannerText?: string;
  customerPortalAgendarSubtitle?: string;
  customerPortalFooterText?: string;
  customerPortalBanners?: CustomerBanner[];

  // Social Networks & Maps Links
  instagramUrl?: string;
  facebookUrl?: string;
  whatsappUrl?: string;
  tiktokUrl?: string;
  googleMapsUrl?: string;

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
