/**
 * CSV / Excel Export Utilities for Trima Studio / Barbearia ERP
 * Uses ';' separator and UTF-8 BOM (\uFEFF) for native Excel compatibility in Portuguese locale.
 */

export function downloadCSV(filename: string, rows: (string | number | boolean | undefined | null)[][]) {
  const sanitizeField = (field: any): string => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + rows.map(row => row.map(sanitizeField).join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatBRL(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export interface DREReportData {
  shopName: string;
  periodLabel: string;
  startDate?: string;
  endDate?: string;
  totalRevenue: number;
  totalCommissions: number;
  netProfit: number;
  totalTickets: number;
  averageTicket: number;
  servicesVolume: number;
  productsVolume: number;
  tabacariaVolume?: number;
  barberPerformance: {
    name: string;
    count: number;
    billing: number;
    commission: number;
    net: number;
  }[];
  paymentsBreakdown: Record<string, { count: number; value: number }>;
}

export function exportDREReportCSV(data: DREReportData) {
  const dateNow = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
  const rows: (string | number)[][] = [
    ['DEMONSTRATIVO DE RESULTADOS DO EXERCÍCIO (DRE)'],
    ['Barbearia / Estabelecimento', data.shopName],
    ['Período de Análise', data.periodLabel],
    ['Data do Relatório', dateNow],
    [],
    ['RESUMO FINANCEIRO EXECUTIVO'],
    ['Métrica', 'Valor (R$)'],
    ['Faturamento Bruto Total', formatBRL(data.totalRevenue)],
    ['Comissões Devidas aos Profissionais', formatBRL(data.totalCommissions)],
    ['Lucro Líquido Retido pela Barbearia', formatBRL(data.netProfit)],
    ['Total de Atendimentos (Comandas)', data.totalTickets],
    ['Ticket Médio por Atendimento', formatBRL(data.averageTicket)],
    [],
    ['DIVISÃO DE VENDAS'],
    ['Canal', 'Valor Faturado (R$)'],
    ['Serviços Prestados', formatBRL(data.servicesVolume)],
    ['Venda de Produtos (Estoque)', formatBRL(data.productsVolume)],
    [],
    ['PERFORMANCE FINANCEIRA POR PROFISSIONAL'],
    ['Profissional', 'Atendimentos', 'Faturamento Bruto', 'Comissão Devida', 'Net Barbearia'],
    ...data.barberPerformance.map(b => [
      b.name,
      b.count,
      formatBRL(b.billing),
      formatBRL(b.commission),
      formatBRL(b.net)
    ]),
    [],
    ['FATURAMENTO POR MEIO DE PAGAMENTO'],
    ['Forma de Pagamento', 'Qtd Comandas', 'Valor Total (R$)'],
    ...Object.entries(data.paymentsBreakdown).map(([method, val]) => [
      method === 'MONEY' ? 'Dinheiro' : method === 'CARD' ? 'Cartão' : method === 'PIX' ? 'PIX' : method === 'SUBSCRIPTION' ? 'Assinatura Club' : method,
      val.count,
      formatBRL(val.value)
    ])
  ];

  downloadCSV(`DRE_Relatorio_${data.periodLabel.replace(/\s+/g, '_')}_${Date.now()}.csv`, rows);
}

export interface DetailedComandaExportItem {
  id: string;
  completedAt: string;
  customerName: string;
  barberName: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  commissionAmount: number;
  netProfit: number;
  itemsSummary: string;
}

export function exportComandasDetailedCSV(comandas: DetailedComandaExportItem[], periodLabel: string) {
  const rows: (string | number)[][] = [
    ['RELATÓRIO DETALHADO DE COMANDAS E VENDAS'],
    ['Período', periodLabel],
    ['Data do Relatório', new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')],
    [],
    ['Ref Comanda', 'Data/Hora', 'Cliente', 'Barbeiro / Atendente', 'Forma de Pagamento', 'Subtotal', 'Desconto', 'Total Pago', 'Comissão', 'Lucro Barbearia', 'Itens da Comanda'],
    ...comandas.map(c => [
      c.id,
      c.completedAt,
      c.customerName,
      c.barberName,
      c.paymentMethod,
      formatBRL(c.subtotal),
      formatBRL(c.discount),
      formatBRL(c.total),
      formatBRL(c.commissionAmount),
      formatBRL(c.netProfit),
      c.itemsSummary
    ])
  ];

  downloadCSV(`Comandas_Detalhadas_${periodLabel.replace(/\s+/g, '_')}_${Date.now()}.csv`, rows);
}

export interface DSRClosingExportData {
  shopName: string;
  periodLabel: string;
  totalRevenue: number;
  totalCommissions: number;
  expenses: number;
  netProfit: number;
  finalNetProfit: number;
  totalTickets: number;
  notes?: string;
  barbers: {
    name: string;
    count: number;
    billing: number;
    commission: number;
    net: number;
    isLiquidated: boolean;
  }[];
}

export function exportDSRClosingCSV(data: DSRClosingExportData) {
  const rows: (string | number)[][] = [
    ['CONCILIAÇÃO E FECHAMENTO DE CAIXA (DSR / DEMONSTRATIVO DE CAIXA)'],
    ['Estabelecimento', data.shopName],
    ['Período de Análise', data.periodLabel],
    ['Data da Exportação', new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')],
    [],
    ['Métrica do Fechamento', 'Valor (R$)'],
    ['Faturamento Bruto Total', formatBRL(data.totalRevenue)],
    ['Comissões Devidas aos Parceiros (-)', formatBRL(data.totalCommissions)],
    ['Gastos Operacionais e Insumos (-)', formatBRL(data.expenses)],
    ['Lucro da Barbearia (Bruto - Comissões)', formatBRL(data.netProfit)],
    ['LUCRO FINAL LÍQUIDO (Pós-Gastos)', formatBRL(data.finalNetProfit)],
    ['Comandas Processadas no Caixa', data.totalTickets],
    ['Observações do Fechamento', data.notes || 'Nenhuma observação informada.'],
    [],
    ['DEMONSTRATIVO DE REPASSES E ACERTO POR BARBEIRO'],
    ['Profissional', 'Atendimentos', 'Faturado Bruto', 'Comissão Devida', 'Net Barbearia', 'Status Liquidação'],
    ...data.barbers.map(b => [
      b.name,
      b.count,
      formatBRL(b.billing),
      formatBRL(b.commission),
      formatBRL(b.net),
      b.isLiquidated ? 'PAGO / LIQUIDADO' : 'PENDENTE DE ACERTO'
    ])
  ];

  downloadCSV(`Fechamento_Caixa_${data.periodLabel.replace(/\s+/g, '_')}_${Date.now()}.csv`, rows);
}

