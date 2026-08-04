import React, { useState } from 'react';
import { BookOpen, Scissors, Shield, Wallet, Star, CheckCircle, X, Download, HelpCircle, UserCheck, PhoneCall, Calendar, Percent, Printer, FileSpreadsheet, Globe, Server } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

export default function ManualModal({ isOpen, onClose, defaultRole = 'ADMIN' }: ManualModalProps) {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'BARBER' | 'HOSTINGER'>(
    defaultRole === 'BARBER' ? 'BARBER' : 'GENERAL'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#101012] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col text-left shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Central de Ajuda & Manual de Operação
              </h2>
              <p className="text-xs text-zinc-400">
                Guia completo de utilização da plataforma e instruções de atendimento.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-zinc-950/80 border-b border-zinc-850 px-4 pt-3 flex gap-2">
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'GENERAL'
                ? 'bg-[#101012] text-yellow-500 border-t border-x border-yellow-500/30'
                : 'text-zinc-400 hover:text-white bg-zinc-900/40'
            }`}
          >
            <Shield className="w-4 h-4 text-yellow-500" /> 1. Manual Geral do Sistema
          </button>
          <button
            onClick={() => setActiveTab('BARBER')}
            className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'BARBER'
                ? 'bg-[#101012] text-yellow-500 border-t border-x border-yellow-500/30'
                : 'text-zinc-400 hover:text-white bg-zinc-900/40'
            }`}
          >
            <Scissors className="w-4 h-4 text-yellow-500" /> 2. Guia Exclusivo do Barbeiro
          </button>
          <button
            onClick={() => setActiveTab('HOSTINGER')}
            className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'HOSTINGER'
                ? 'bg-[#101012] text-yellow-500 border-t border-x border-yellow-500/30'
                : 'text-zinc-400 hover:text-white bg-zinc-900/40'
            }`}
          >
            <Globe className="w-4 h-4 text-yellow-500" /> 3. Domínio Hostinger & Publicação
          </button>
        </div>

        {/* Modal Body Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
          
          {/* TAB 1: GENERAL SYSTEM MANUAL */}
          {activeTab === 'GENERAL' && (
            <div className="space-y-6">
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 space-y-1">
                <h3 className="font-mono font-bold text-yellow-400 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Visão Geral do Trima Studio ERP
                </h3>
                <p className="text-xs text-yellow-200/80">
                  O Trima Studio é um ecossistema completo de gestão para barbearias, com controle financeiro (DRE/DSR), balcão de caixa com impressão de cupom térmico, clube de assinaturas, agendamento online e controle de estoque com curva ABC.
                </p>
              </div>

              {/* Module 1 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Shield className="w-4 h-4 text-yellow-500" /> 1. Perfis de Acesso & Segurança
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li><strong className="text-white font-mono">👑 Administrador:</strong> Acesso total às configurações globais, cadastro de barbeiros/serviços/produtos, DRE, conciliação DSR, redefinição de banco e parâmetros de comissão.</li>
                  <li><strong className="text-white font-mono">🧔 Barbeiro:</strong> Acesso à sua agenda do dia, criação de comandas para seus clientes, consulta de comissões acumuladas, acompanhamento de Metas Gamificadas e histórico de atendimentos.</li>
                  <li><strong className="text-white font-mono">💼 Balcão de Caixa:</strong> Acesso ao fluxo financeiro para receber comandas pendentes, aplicar descontos/acréscimos, selecionar meios de pagamento, consultar comandas faturadas no dia e emitir cupom térmico.</li>
                  <li><strong className="text-white font-mono">👤 Cliente:</strong> Agendamento de horários online via smartphone exclusivamente com barbeiros da equipe (com administradores ocultados da lista), consulta de histórico de serviços, adesão ao Club de Assinaturas e avaliação NPS.</li>
                </ul>
              </section>

              {/* Module 2 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Wallet className="w-4 h-4 text-yellow-500" /> 2. Operação do Balcão de Caixa & Visualização "Faturadas Hoje"
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300">
                  <li>Acesse a aba <strong>Balcão do Caixa</strong> na navegação superior.</li>
                  <li>Selecione a comanda pendente pelo nome do cliente ou número de referência na aba <strong>Aguardando</strong>.</li>
                  <li>Verifique os itens lançados (serviços, bebidas, cosméticos, tabacaria).</li>
                  <li>Se necessário, informe taxa de serviço/acréscimo ou desconto em reais.</li>
                  <li>Escolha o meio de pagamento (<strong>PIX, Cartão, Dinheiro ou Assinatura Club</strong>) e clique em <strong>Concluir Checkout & Faturar</strong>. O sistema registra automaticamente o operador logado que realizou o fechamento.</li>
                  <li><strong>Aba Faturadas Hoje:</strong> Exibe exclusivamente as comandas cujo fechamento/faturamento ocorreu na <strong>data de hoje (dia atual)</strong>, garantindo total precisão no fechamento diário do caixa sem misturar comandas de dias anteriores.</li>
                  <li>Ao concluir, clique em <strong>Cupom Térmico</strong> para imprimir na impressora não fiscal (80mm) ou clique em <strong>Copiar Texto p/ WhatsApp</strong> para enviar ao cliente.</li>
                </ol>
              </section>

              {/* Module 3 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <FileSpreadsheet className="w-4 h-4 text-yellow-500" /> 3. Demonstrativo DRE, DSR & Exportação CSV
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>
                    Na aba <strong>Configuração & Administração &gt; Relatórios & DRE</strong>, você conta com relatórios dinâmicos e filtros de atalho (Hoje, Ontem, Esta Semana, Mês Anterior, Ano Vigente, etc.):
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>DRE Executivo:</strong> Mostra faturamento bruto, comissões devidas, lucro retido e ticket médio.</li>
                    <li><strong>Filtros Avançados:</strong> Permite filtrar especificamente por profissional e forma de pagamento.</li>
                    <li><strong>Exportação para Excel/CSV:</strong> Clique nos botões <em>"Exportar DRE"</em> ou <em>"Exportar Comandas"</em> para baixar planilhas nativas em formato compatível com Excel.</li>
                    <li><strong>Fechamento de Caixa (DSR):</strong> Lance custos operacionais do dia e faça a liquidação de repasses para os barbeiros.</li>
                  </ul>
                </div>
              </section>

              {/* Module 4 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Star className="w-4 h-4 text-yellow-500" /> 4. Pesquisa de Satisfação NPS
                </h4>
                <p className="text-xs text-zinc-300">
                  Ative o parâmetro de NPS na guia de Parâmetros do Sistema para permitir que os clientes deixem avaliações de 0 a 10 no seu painel. O Administrador tem acesso ao <strong>NPS Score</strong> em tempo real no painel administrativo, identificando promotores (9-10), neutros (7-8) e detratores (0-6).
                </p>
              </section>

              {/* Module 5 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <HelpCircle className="w-4 h-4 text-yellow-500" /> 5. Personalização de Textos, Banners & Avisos do Portal
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>
                    Acesse a guia <strong>Aparência & Portal Cliente &gt; Visão do Cliente (Textos & Banners do Portal)</strong> para editar os textos do aplicativo exibidos para os clientes.
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Campos Editáveis:</strong> Título principal, subtítulo, aviso topo do portal, títulos das seções de agendamento, planos e promoções.</li>
                    <li><strong>Variáveis Dinâmicas Aceitas:</strong> Você pode incluir tags no texto para personalizar com dados do cliente e da barbearia:
                      <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[10px]">
                        <span className="bg-zinc-900 border border-zinc-800 text-yellow-400 px-1.5 py-0.5 rounded">{"{NOME}"}</span>
                        <span className="bg-zinc-900 border border-zinc-800 text-yellow-400 px-1.5 py-0.5 rounded">{"{CLIENTE}"}</span>
                        <span className="bg-zinc-900 border border-zinc-800 text-yellow-400 px-1.5 py-0.5 rounded">{"{BARBEARIA}"}</span>
                        <span className="bg-zinc-900 border border-zinc-800 text-yellow-400 px-1.5 py-0.5 rounded">{"{TELEFONE}"}</span>
                        <span className="bg-zinc-900 border border-zinc-800 text-yellow-400 px-1.5 py-0.5 rounded">{"{ENDERECO}"}</span>
                      </div>
                    </li>
                    <li><strong>Exemplo:</strong> <em>"Seja bem-vindo, {"{CLIENTE}"}! Agende seu corte na {"{BARBEARIA}"}."</em></li>
                  </ul>
                </div>
              </section>

              {/* Module 6 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Wallet className="w-4 h-4 text-yellow-500" /> 6. Controle de Suprimentos & Rastreabilidade de Alterações
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>
                    O módulo <strong>Controle de Caixa & Suprimentos</strong> permite registrar entradas/aportes e despesas com materiais operacionais (toalhas, lâminas, espumas, produtos).
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Registro do Responsável & Operador:</strong> Ao efetuar um lançamento, é possível selecionar o comprador/responsável e o sistema vincula automaticamente o nome do usuário logado que efetuou a alteração.</li>
                    <li><strong>Transparência & Auditoria:</strong> A tabela de movimentações exibe o responsável selecionado e o operador registrador no campo <em>"Lançado por"</em>.</li>
                    <li><strong>Validação Obrigatória:</strong> Todo novo lançamento entra com status <span className="text-amber-400 font-mono font-bold">⏳ Pendente de Validação</span> até que um Administrador homologue no botão <span className="text-emerald-400 font-mono font-bold">✅ Validar</span>.</li>
                  </ul>
                </div>
              </section>

              {/* Module 7 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Star className="w-4 h-4 text-yellow-500" /> 7. Sistema de Metas Gamificado & Níveis de Conquista
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>
                    Acesse <strong>Configurações e Parâmetros &gt; Metas & Gamificação</strong> para gerenciar os níveis de recompensa dos barbeiros (Bronze, Prata, Ouro, Diamante, Lenda):
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>3 Pilares de Desempenho:</strong> Cada nível avalia <strong>Faturamento Bruto (R$)</strong>, <strong>Meta Serviços (Qtd)</strong> e <strong>Vendas de Produtos (R$)</strong>.</li>
                    <li><strong>Bonificações & Premiações:</strong> Ao atingir os alvos do nível, o barbeiro desbloqueia prêmios em dinheiro (Bônus Fixo) e incremento na comissão percentual extra.</li>
                    <li><strong>Metas Individuais Personalizadas:</strong> Administradores podem definir alvos específicos por barbeiro ou utilizar os níveis globais padrão.</li>
                  </ul>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: EXCLUSIVE BARBER GUIDE */}
          {activeTab === 'BARBER' && (
            <div className="space-y-6">

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-200 space-y-1">
                <h3 className="font-mono font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> Guia do Barbeiro & Atendimento de Excelência
                </h3>
                <p className="text-xs text-emerald-200/80">
                  Este manual foi desenvolvido para ajudar o profissional a gerenciar sua cadeira, abrir comandas de forma rápida, acompanhar suas comissões e orientar os clientes a utilizar as facilidades do aplicativo.
                </p>
              </div>

              {/* Section A: Daily Operations */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <UserCheck className="w-4 h-4 text-yellow-500" /> Parte 1: Sua Rotina na Cadeira
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p><strong className="text-white font-mono">1. Abrir/Lançar Comanda:</strong> Ao receber o cliente, vá em <em>"Cadeira Barbeiro" &gt; "Lançar Comanda"</em>, selecione o cliente ou digite o nome dele, e adicione os serviços prestados (Corte, Barba, Combo) e consumo (Bebidas, Pomadas, Tabacaria).</p>
                  <p><strong className="text-white font-mono">2. Encaminhar para o Caixa:</strong> Após finalizar o atendimento, clique em <em>"Finalizar & Enviar p/ Caixa"</em>. A comanda ficará disponível imediatamente na tela do operador de caixa.</p>
                  <p><strong className="text-white font-mono">3. Acompanhar Repasses e Comissões:</strong> Na sub-aba <em>"Repasse e Comissões"</em>, alterne entre os filtros de período (<strong>Hoje, 7 dias, 30 dias</strong>) ou selecione <strong className="text-yellow-400">Personalizado</strong> para definir uma <strong>Data Inicial</strong> e <strong>Data Final</strong> específicas. O sistema calcula em tempo real o volume bruto e a comissão total acumulada no período.</p>
                </div>
              </section>

              {/* Section B: How to Instruct Customers */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-4">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <PhoneCall className="w-4 h-4 text-yellow-500" /> Parte 2: Como Ensinar o Cliente a Usar o Sistema
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Card 1: Scheduling */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-yellow-500" /> 1. Agendamento Online
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Cliente, para você não pegar fila na próxima vez, acesse nosso aplicativo pelo celular, selecione meu nome, escolha a data/horário e confirme em 2 cliques!"
                    </p>
                  </div>

                  {/* Card 2: Club Subscription */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-yellow-500" /> 2. Clube de Assinaturas
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Você sabia que se cortar o cabelo 2x por mês já vale a pena assinar nosso Club? Você ganha cortes ilimitados, prioridade na agenda e desconto em produtos."
                    </p>
                  </div>

                  {/* Card 3: NPS Survey */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-500" /> 3. Avaliação de Satisfação
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Ao finalizar o serviço, deixe sua nota de 0 a 10 e seu comentário no aplicativo. Seu feedback é fundamental para avaliarmos nosso atendimento!"
                    </p>
                  </div>

                  {/* Card 4: WhatsApp Reminders */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-500" /> 4. Lembrete no WhatsApp
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Você receberá uma mensagem automática no WhatsApp antes do seu horário. Basta clicar no link da mensagem para confirmar sua presença."
                    </p>
                  </div>

                </div>
              </section>

              {/* Section C: Gamified Goals for Barbers */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Star className="w-4 h-4 text-yellow-500" /> Parte 3: Acompanhamento de Metas & Gamificação
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>Acesse a sub-aba <strong className="text-yellow-400">🏆 Minhas Metas & Gamificação</strong> no painel do barbeiro para acompanhar seu progresso mensal:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-400">
                    <li><strong>3 Progressores em Tempo Real:</strong> Faturamento Bruto (R$), Meta Serviços (Qtd) e Vendas de Produtos (R$).</li>
                    <li><strong>Conquistas & Badges:</strong> Desbloqueie insígnias exclusivas como <em>Primeiro Passo</em>, <em>Mestre da Barbearia</em> e <em>Tríplice Coroa</em> ao atingir 100% de todas as metas.</li>
                    <li><strong>Ranking da Equipe:</strong> Compare seu desempenho no ranking de comissões e metas com os colegas da barbearia.</li>
                  </ul>
                </div>
              </section>

              {/* Script Checklist */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2 text-xs">
                <h5 className="font-mono font-bold text-yellow-400 uppercase">
                  💬 Roteiro de Fala Sugerido para o Barbeiro
                </h5>
                <p className="italic text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                  "Fala [Nome do Cliente]! Baixa nosso app ou acesse nosso link no Instagram. Lá você escolhe seu horário comigo sem precisar mandar mensagem, pode entrar pro nosso Club com desconto exclusivo e ainda ganha pontos de fidelidade a cada corte. É super rápido!"
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: HOSTINGER DOMAIN & PUBLICATION GUIDE */}
          {activeTab === 'HOSTINGER' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 space-y-1">
                <h3 className="font-mono font-bold text-yellow-400 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Passo a Passo: Apontar Domínio da Hostinger
                </h3>
                <p className="text-xs text-yellow-200/80">
                  Guia de configuração para conectar o seu novo domínio comprado na Hostinger ao seu sistema de barbearia.
                </p>
              </div>

              {/* Step 1 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2">
                <h4 className="font-mono font-bold text-yellow-400 text-xs uppercase flex items-center gap-2">
                  <Download className="w-4 h-4 text-yellow-500" /> 1. Exportar os Arquivos do AI Studio
                </h4>
                <p className="text-xs text-zinc-300">
                  No menu superior do Google AI Studio, clique em <strong>Export &gt; Export to GitHub</strong> (para sincronização automática) ou <strong>Export ZIP</strong> para baixar os arquivos no seu computador.
                </p>
              </section>

              {/* Step 2 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2">
                <h4 className="font-mono font-bold text-yellow-400 text-xs uppercase flex items-center gap-2">
                  <Server className="w-4 h-4 text-yellow-500" /> 2. Hospedar a Aplicação (Vercel - Recomendado 100% Grátis)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-300">
                  <li>Acesse <strong>vercel.com</strong> e faça login com seu perfil do GitHub.</li>
                  <li>Clique em <strong>Add New Project &gt; Import</strong> e selecione o repositório da barbearia.</li>
                  <li>A Vercel identificará automaticamente a estrutura React + Vite. Clique em <strong>Deploy</strong>.</li>
                </ol>
              </section>

              {/* Step 3 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs uppercase flex items-center gap-2">
                  <Globe className="w-4 h-4 text-yellow-500" /> 3. Configurar Apontamento de DNS na Hostinger
                </h4>
                <p className="text-xs text-zinc-300">
                  Acesse o painel da Hostinger (<strong>hPanel</strong>) &gt; <strong>Domínios</strong> &gt; Selecione seu Domínio &gt; <strong>Editor de Zona DNS</strong>:
                </p>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="text-white flex justify-between border-b border-zinc-800 pb-1">
                    <span>Registro A (@):</span>
                    <strong className="text-yellow-400">76.76.21.21</strong>
                  </div>
                  <div className="text-white flex justify-between">
                    <span>Registro CNAME (www):</span>
                    <strong className="text-yellow-400">cname.vercel-dns.com</strong>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">
                  No painel da Vercel, acesse <strong>Settings &gt; Domains</strong> e adicione o seu domínio Hostinger (ex: <em>suabarbearia.com.br</em>).
                </p>
              </section>

              {/* Step 4 */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2">
                <h4 className="font-mono font-bold text-yellow-400 text-xs uppercase flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> 4. Certificado SSL (HTTPS Grátis)
                </h4>
                <p className="text-xs text-zinc-300">
                  O certificado de segurança com o cadeado (HTTPS) é emitido automaticamente sem custos adicionais após a propagação dos registros DNS.
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-950 flex justify-between items-center text-xs font-mono">
          <span className="text-zinc-500">Trima Studio ERP v2.5 - Documentação Oficial</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl font-bold uppercase transition cursor-pointer"
          >
            Entendido / Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
