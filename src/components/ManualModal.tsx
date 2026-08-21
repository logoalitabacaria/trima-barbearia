import React, { useState } from 'react';
import { BookOpen, Scissors, Shield, Wallet, Star, CheckCircle, X, UserCheck, PhoneCall, Calendar, Percent, Globe, Server } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

export default function ManualModal({ isOpen, onClose, defaultRole = 'ADMIN' }: ManualModalProps) {
  const isBarber = defaultRole === 'BARBER';
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'BARBER' | 'HOSTINGER'>(
    isBarber ? 'BARBER' : 'GENERAL'
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
                {isBarber ? 'Manual & Guia Operacional do Barbeiro' : 'Central de Ajuda & Manual de Operação Trima Studio'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isBarber
                  ? 'Instruções de atendimento, rotina de comandas, comissões e boas práticas.'
                  : 'Guia completo de gestão, balcão de caixa, RBAC, cupons, indicações e parâmetros.'}
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

        {/* Tab Selection (Admins get all tabs, Barbers only get Barber guide) */}
        {!isBarber && (
          <div className="bg-zinc-950/80 border-b border-zinc-850 px-4 pt-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('GENERAL')}
              className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'GENERAL'
                  ? 'bg-[#101012] text-yellow-500 border-t border-x border-yellow-500/30'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/40'
              }`}
            >
              <Shield className="w-4 h-4 text-yellow-500" /> 1. Manual do Administrador
            </button>
            <button
              onClick={() => setActiveTab('BARBER')}
              className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'BARBER'
                  ? 'bg-[#101012] text-yellow-500 border-t border-x border-yellow-500/30'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/40'
              }`}
            >
              <Scissors className="w-4 h-4 text-yellow-500" /> 2. Guia do Barbeiro
            </button>
            <button
              onClick={() => setActiveTab('HOSTINGER')}
              className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'HOSTINGER'
                  ? 'bg-[#101012] text-yellow-500 border-t border-x border-yellow-500/30'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/40'
              }`}
            >
              <Globe className="w-4 h-4 text-yellow-500" /> 3. Domínio & Publicação
            </button>
          </div>
        )}

        {/* Modal Body Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
          
          {/* TAB 1: GENERAL SYSTEM MANUAL (ADMIN ONLY) */}
          {!isBarber && activeTab === 'GENERAL' && (
            <div className="space-y-6">
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 space-y-1">
                <h3 className="font-mono font-bold text-yellow-400 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Visão Geral do Trima Studio ERP (Painel Administrativo)
                </h3>
                <p className="text-xs text-yellow-200/80">
                  O Trima Studio é um ecossistema completo para barbearias de alto padrão. Ele unifica controle financeiro (DRE/DSR), balcão de caixa com controle de saldos/fiados e cupons de desconto, clube de assinaturas com validação no caixa, programa de indicação por link (MGM) e scripts operacionais de atendimento.
                </p>
              </div>

              {/* Module 1: RBAC */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Shield className="w-4 h-4 text-yellow-500" /> 1. Perfis de Acesso & Segurança (RBAC)
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li><strong className="text-white font-mono">👑 Administrador:</strong> Acesso total às configurações globais, cadastro de barbeiros/serviços/produtos, DRE, conciliação DSR, redefinição de banco e parâmetros de comissão.</li>
                  <li><strong className="text-white font-mono">🧔 Barbeiro:</strong> Acesso à sua agenda do dia, criação de comandas para seus clientes, consulta de comissões acumuladas, acompanhamento de Metas Gamificadas e scripts operacionais.</li>
                  <li><strong className="text-white font-mono">💼 Balcão de Caixa:</strong> Acesso ao fluxo financeiro para receber comandas pendentes, controle de saldos antecipados e fiados, aplicação de cupons e emissão de cupom térmico.</li>
                  <li><strong className="text-white font-mono">👤 Cliente:</strong> Agendamento de horários online via smartphone, histórico de cortes, link de indicação de amigos e Clube VIP de Assinaturas.</li>
                  <li><strong>Troca Obrigatória de Senha:</strong> Novos usuários criados pelo administrador ou caixa recebem a flag de troca obrigatória de senha no primeiro login.</li>
                  <li><strong>Privacidade Administrativa:</strong> As credenciais administrativas não são exibidas para outros operadores.</li>
                </ul>
              </section>

              {/* Module 2: Caixa, Assinaturas & Fiados */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Wallet className="w-4 h-4 text-yellow-500" /> 2. Balcão do Caixa, Assinaturas, Saldos & Fiados
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p><strong>Adesão de Assinatura via Caixa:</strong> Quando o cliente solicita uma assinatura pelo aplicativo, uma comanda de adesão é gerada e encaminhada ao Caixa como <em>Pendente de Pagamento</em>. O plano e os créditos de cortes só são ativados no aplicativo do cliente após a finalização do pagamento no caixa.</p>
                  <p><strong>Gestão de Saldo em Crédito:</strong> O operador de caixa pode receber valores antecipados do cliente (PIX, Cartão, Dinheiro) e creditar em sua conta. O saldo pode ser abatido automaticamente nas compras seguintes.</p>
                  <p><strong>Controle de Fiados (A Prazo):</strong> Comandas podem ser finalizadas na modalidade "FIADO", registrando o débito na conta do cliente com extrato histórico e opção de quitação parcial ou total.</p>
                  <p><strong>Cupons de Desconto:</strong> Aplique códigos promocionais no fechamento da comanda com cálculo instantâneo e validação de regras de uso.</p>
                </div>
              </section>

              {/* Module 3: Referral Program & Coupons */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Star className="w-4 h-4 text-yellow-500" /> 3. Programa de Indicação (MGM) & Cupons Promocionais
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p><strong>Links de Indicação:</strong> Cada cliente possui um link único (ex: <code>/?ref=TRIMA-XXXX</code>). Ao cadastrar-se e realizar o primeiro atendimento pago, o indicador recebe crédito automático e o amigo ganha bônus de boas-vindas.</p>
                  <p><strong>Módulo de Cupons:</strong> No painel <em>Parâmetros &gt; Cupons de Desconto</em>, o administrador cria cupons com regras de valor fixo ou percentual, valor mínimo de compra, limites de uso total e por cliente, e data de validade.</p>
                </div>
              </section>

              {/* Module 4: Scripts de Atendimento */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <BookOpen className="w-4 h-4 text-yellow-500" /> 4. Scripts Operacionais & Instruções de Atendimento
                </h4>
                <p className="text-xs text-zinc-300">
                  Acesse a aba <strong>Scripts de Atendimento</strong> para cadastrar procedimentos padronizados de recepção, esterilização, técnica de visagismo, abordagem de vendas de produtos e agendamento de retorno. Esses scripts ficam visíveis para todos os barbeiros em seus respectivos painéis.
                </p>
              </section>

            </div>
          )}

          {/* TAB 2: EXCLUSIVE BARBER GUIDE (ACCESSIBLE TO BARBERS AND ADMINS) */}
          {(isBarber || activeTab === 'BARBER') && (
            <div className="space-y-6">

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-200 space-y-1">
                <h3 className="font-mono font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> Guia do Barbeiro & Atendimento de Excelência
                </h3>
                <p className="text-xs text-emerald-200/80">
                  Instruções essenciais para gerenciar sua cadeira, abrir comandas com rapidez, acompanhar suas comissões em tempo real e consultar os scripts de atendimento da barbearia.
                </p>
              </div>

              {/* Section A: Daily Operations */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <UserCheck className="w-4 h-4 text-yellow-500" /> Parte 1: Sua Rotina na Cadeira
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p><strong className="text-white font-mono">1. Abrir/Lançar Comanda:</strong> Ao receber o cliente, vá em <em>"Minha Agenda & Comandas" &gt; "Lançar Comanda"</em>, selecione o cliente e adicione os serviços prestados e produtos consumidos.</p>
                  <p><strong className="text-white font-mono">2. Encaminhar para o Caixa:</strong> Ao concluir o corte/barba, clique em <em>"Finalizar & Enviar p/ Caixa"</em>. A comanda ficará disponível imediatamente para recebimento no caixa.</p>
                  <p><strong className="text-white font-mono">3. Acompanhar Comissões & Repasses:</strong> Na sub-aba <em>"Extrato & Comissões"</em>, visualize seus ganhos por serviço e produto nos períodos <strong>Hoje, 7 dias, 30 dias ou Personalizado</strong>.</p>
                  <p><strong className="text-white font-mono">4. Consultar Scripts Operacionais:</strong> Acesse a aba <em>"Scripts de Atendimento"</em> para seguir os padrões de recepção, higiene, visagismo e pós-venda definidos pela barbearia.</p>
                </div>
              </section>

              {/* Section B: How to Instruct Customers */}
              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-4">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <PhoneCall className="w-4 h-4 text-yellow-500" /> Parte 2: Como Ensinar o Cliente a Usar o Sistema
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Card 1: Scheduling */}
                  <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-yellow-500" /> 1. Agendamento Online
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Cliente, para evitar espera na próxima vez, acesse nosso aplicativo, escolha meu nome, selecione o dia e horário e reserve na hora!"
                    </p>
                  </div>

                  {/* Card 2: Club Subscription */}
                  <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-yellow-500" /> 2. Clube VIP de Assinaturas
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Assine nosso Clube VIP pelo app! A comanda é gerada e assim que você passa no caixa os seus cortes mensais com desconto ficam liberados."
                    </p>
                  </div>

                  {/* Card 3: Referral Link */}
                  <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-500" /> 3. Indicação de Amigos (Link)
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "No menu do app, copie seu link de indicação e envie no WhatsApp dos seus amigos. Quando eles cortarem aqui, você ganha crédito na hora!"
                    </p>
                  </div>

                  {/* Card 4: NPS Survey */}
                  <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <h5 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-500" /> 4. Avaliação de Experiência
                    </h5>
                    <p className="text-xs text-zinc-400">
                      <strong>Como instruir:</strong> "Deixe sua avaliação e nota no aplicativo após o corte. Seu feedback nos ajuda a manter a excelência no atendimento!"
                    </p>
                  </div>

                </div>
              </section>

            </div>
          )}

          {/* TAB 3: HOSTINGER DOMAIN CONFIGURATION (ADMIN ONLY) */}
          {!isBarber && activeTab === 'HOSTINGER' && (
            <div className="space-y-6">
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl text-cyan-200 space-y-1">
                <h3 className="font-mono font-bold text-cyan-400 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Configuração de Domínio Personalizado & Publicação
                </h3>
                <p className="text-xs text-cyan-200/80">
                  Instruções para conectar seu domínio próprio (ex: <code>trimastudio.com.br</code>) na plataforma de hospedagem ou VPS.
                </p>
              </div>

              <section className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-xl space-y-3">
                <h4 className="font-mono font-bold text-yellow-400 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <Server className="w-4 h-4 text-yellow-500" /> Apontamento de DNS na Hostinger / Registro.br
                </h4>
                <div className="space-y-2 text-xs text-zinc-300">
                  <p>1. Acesse o painel da <strong>Hostinger &gt; Domínios &gt; Zona DNS</strong>.</p>
                  <p>2. Crie ou edite o registro <strong>Tipo A</strong> apontando <code>@</code> para o IP do servidor em nuvem.</p>
                  <p>3. Crie o registro <strong>CNAME</strong> com nome <code>www</code> apontando para o seu domínio principal.</p>
                  <p>4. Certificado SSL: Instale o SSL gratuito Let's Encrypt para garantir conexão segura HTTPS.</p>
                </div>
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
