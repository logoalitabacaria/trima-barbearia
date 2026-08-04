import { SystemParameters, Appointment, Product, Comanda } from '../types';

/**
 * Formats a phone number to standard international WhatsApp format without characters
 */
export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Builds the WhatsApp reminder link for a given appointment
 */
export function buildWhatsAppReminderUrl(appointment: Appointment, parameters: SystemParameters): string {
  const phone = formatWhatsAppPhone(appointment.customerPhone);
  if (!phone) return '#';

  const defaultTpl = "Olá {NOME}! Confirmamos o seu agendamento no {LOJA} em {DATA} às {HORA} com o profissional {BARBEIRO} ({SERVICO}). Te esperamos!";
  let tpl = parameters.whatsappTemplate || defaultTpl;

  // Format date DD/MM/YYYY
  let formattedDate = appointment.date;
  if (appointment.date && appointment.date.includes('-')) {
    const [y, m, d] = appointment.date.split('-');
    formattedDate = `${d}/${m}/${y}`;
  }

  const text = tpl
    .replace('{NOME}', appointment.customerName || 'Cliente')
    .replace('{LOJA}', parameters.shopName || 'Nossa Barbearia')
    .replace('{DATA}', formattedDate || '')
    .replace('{HORA}', appointment.time || '')
    .replace('{BARBEIRO}', appointment.barberName || 'Profissional')
    .replace('{SERVICO}', appointment.serviceName || 'Serviço');

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Dynamic text formatter for Customer Portal
 * Replaces placeholders like {NOME}, {CLIENTE}, {BARBEARIA}, {TELEFONE}, {ENDERECO}
 */
export function formatPortalText(
  text: string | undefined,
  customerName: string = '',
  shopName: string = '',
  phone: string = '',
  address: string = ''
): string {
  if (!text) return '';
  return text
    .replace(/\{NOME\}/gi, customerName || 'Cliente')
    .replace(/\{CLIENTE\}/gi, customerName || 'Cliente')
    .replace(/\{NOME_CLIENTE\}/gi, customerName || 'Cliente')
    .replace(/\{BARBEARIA\}/gi, shopName || 'Barbearia')
    .replace(/\{LOJA\}/gi, shopName || 'Barbearia')
    .replace(/\{TELEFONE\}/gi, phone || '')
    .replace(/\{ENDERECO\}/gi, address || '');
}

/**
 * Calculates Product ABC Curve Classification
 * A: Top 80% of revenue
 * B: Next 15% of revenue
 * C: Bottom 5% of revenue or zero sales
 */
export interface ProductABCItem extends Product {
  totalQtySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  revenueShare: number; // e.g. 0.45 = 45%
  cumulativeRevenueShare: number;
  abcCategory: 'A' | 'B' | 'C';
}

export function calculateProductABC(products: Product[] = [], comandas: Comanda[] = []): ProductABCItem[] {
  // Aggregate product sales from paid comandas
  const salesMap: Record<string, { qty: number; revenue: number }> = {};

  (comandas || [])
    .filter(c => c && (c.status === 'PAID' || c.status === 'CLOSED' || c.status === 'COMPLETED'))
    .forEach(c => {
      (c.items || []).forEach(item => {
        if (!item) return;
        if (item.productId || item.isProduct) {
          const pid = item.productId || item.id;
          if (!pid) return;
          if (!salesMap[pid]) {
            salesMap[pid] = { qty: 0, revenue: 0 };
          }
          const qty = item.quantity || 1;
          const unitPrice = item.unitPrice || 0;
          salesMap[pid].qty += qty;
          salesMap[pid].revenue += (unitPrice * qty);
        }
      });
    });

  // Calculate product metrics
  const productMetrics = (products || []).map(p => {
    if (!p) return null;
    const sale = salesMap[p.id] || { qty: 0, revenue: 0 };
    const cost = (p.costPrice || 0) * sale.qty;
    const profit = sale.revenue - cost;
    return {
      ...p,
      totalQtySold: sale.qty,
      totalRevenue: sale.revenue,
      totalCost: cost,
      totalProfit: profit,
      revenueShare: 0,
      cumulativeRevenueShare: 0,
      abcCategory: 'C' as 'A' | 'B' | 'C'
    };
  }).filter(Boolean) as ProductABCItem[];

  // Total revenue across all products
  const grandTotalRevenue = productMetrics.reduce((sum, item) => sum + item.totalRevenue, 0);

  // Sort by revenue descending
  productMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);

  let runningCumulative = 0;
  return productMetrics.map(item => {
    const share = grandTotalRevenue > 0 ? item.totalRevenue / grandTotalRevenue : 0;
    runningCumulative += share;

    let category: 'A' | 'B' | 'C' = 'C';
    if (grandTotalRevenue === 0 || item.totalRevenue === 0) {
      category = 'C';
    } else if (runningCumulative <= 0.80 || (runningCumulative - share < 0.80)) {
      category = 'A';
    } else if (runningCumulative <= 0.95) {
      category = 'B';
    } else {
      category = 'C';
    }

    return {
      ...item,
      revenueShare: share,
      cumulativeRevenueShare: runningCumulative,
      abcCategory: category
    };
  });
}
