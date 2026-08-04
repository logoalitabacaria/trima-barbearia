/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Scissors, Calendar, Clock, MapPin, Phone, MessageCircle, Instagram, Facebook,
  Star, CheckCircle2, Award, Sparkles, HelpCircle, ChevronDown, ChevronRight,
  ShieldCheck, Heart, Tag, UserCheck, ArrowRight, Compass, Crown
} from 'lucide-react';
import { Service, LoyaltyPlan, SystemParameters } from '../types';

interface PublicSEOComponentProps {
  services: Service[];
  plans: LoyaltyPlan[];
  parameters: SystemParameters;
  onSelectServiceToBook?: (service: Service) => void;
  onOpenBookingWizard?: () => void;
  onOpenLoginModal?: () => void;
}

// Fallback services catalog matching Google search intent keywords
const DEFAULT_SEO_SERVICES = [
  {
    id: 'srv-corte-masculino',
    name: 'Corte Masculino',
    slug: 'corte-masculino',
    price: 50,
    durationMinutes: 45,
    category: 'HAIR',
    description: 'Corte de cabelo masculino tradicional ou moderno, ajustado ao formato do seu rosto com acabamento na tesoura, máquina e acerto do pezinho.',
    benefits: 'Estilo personalizado, contorno alinhado e finalização com produto profissional.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-corte-degrade',
    name: 'Corte Degradê (Fade)',
    slug: 'corte-degrade',
    price: 55,
    durationMinutes: 45,
    category: 'HAIR',
    description: 'Técnica de corte degradê (Low Fade, Mid Fade, High Fade, Taper Fade ou Navalhado) com transição suave, milimetricamente desenhada.',
    benefits: 'Degradê limpo, durabilidade estendida e caimento perfeito para qualquer ocasião.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-corte-premium',
    name: 'Corte Premium',
    slug: 'corte-premium',
    price: 70,
    durationMinutes: 60,
    category: 'HAIR',
    description: 'Experiência exclusiva com lavagem com xampu revitalizante, corte estilizado na tesoura e navalha, massagem no couro cabeludo e modelagem.',
    benefits: 'Tratamento de alto padrão, relaxamento profundo e penteado duradouro.',
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-corte-maquina',
    name: 'Corte na Máquina',
    slug: 'corte-maquina',
    price: 35,
    durationMinutes: 30,
    category: 'HAIR',
    description: 'Corte prático e rápido utilizando até duas lâminas/pentes de máquina de alta precisão com acabamento do pezinho e nuca.',
    benefits: 'Visual limpo, uniformidade perfeita e execução ágil.',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-barba-classica',
    name: 'Barba Clássica',
    slug: 'barba-classica',
    price: 40,
    durationMinutes: 30,
    category: 'BEARD',
    description: 'Modelagem da barba com alinhamento das linhas do rosto, maquina e tesoura, desenhando um contorno simétrico.',
    benefits: 'Desenho preciso da barba, eliminação de fios desalinhados e acabamento elegante.',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-barba-tesoura',
    name: 'Barba na Tesoura',
    slug: 'barba-tesoura',
    price: 45,
    durationMinutes: 35,
    category: 'BEARD',
    description: 'Aparo artesanal realizado exclusivamente com tesoura para barbas médias e longas, mantendo o volume correto sem perder o formato.',
    benefits: 'Preservação da densidade, controle do volume e textura suave.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-barboterapia',
    name: 'Barboterapia',
    slug: 'barboterapia',
    price: 60,
    durationMinutes: 45,
    category: 'BEARD',
    description: 'Ritual tradicional com aplicação de toalha quente, óleos essenciais pré-barba, barbear com navalha e massagem pós-barba acalmante.',
    benefits: 'Abertura dos poros, shaving sem irritação, hidratação profunda e pele macia.',
    imageUrl: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-barboterapia-ozonio',
    name: 'Barboterapia com Ozônio',
    slug: 'barboterapia-ozonio',
    price: 75,
    durationMinutes: 50,
    category: 'BEARD',
    description: 'Evolução da barboterapia com vaporizador de ozônio que esteriliza os poros, previne foliculite e tonifica a pele do rosto.',
    benefits: 'Ação bactericida, estimulação da circulação e prevenção total de foliculite.',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-combo-corte-barba',
    name: 'Combo Corte e Barba',
    slug: 'combo-corte-e-barba',
    price: 85,
    durationMinutes: 75,
    category: 'COMBO',
    description: 'União do corte masculino personalizado com a escultura de barba profissional, harmonizando todo o visual do cliente em uma só sessão.',
    benefits: 'Harmonização completa do rosto, economia financeira e comodidade.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-sobrancelha',
    name: 'Design de Sobrancelha',
    slug: 'design-de-sobrancelha',
    price: 25,
    durationMinutes: 20,
    category: 'TREATMENT',
    description: 'Limpeza e alinhamento de sobrancelhas masculinas na navalha ou tesoura com acabamento extremamente natural.',
    benefits: 'Realce do olhar sem alterar a expressão masculina natural.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-pezinho',
    name: 'Pezinho e Acabamento',
    slug: 'pezinho-e-acabamento',
    price: 20,
    durationMinutes: 15,
    category: 'HAIR',
    description: 'Ajuste e alinhamento do contorno do cabelo, costeletas e nuca para manter o visual limpo entre os cortes completos.',
    benefits: 'Aspecto de recém-cortado gastando menos tempo.',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-finalizacao',
    name: 'Finalização Capilar',
    slug: 'finalizacao-capilar',
    price: 20,
    durationMinutes: 15,
    category: 'HAIR',
    description: 'Estilização e fixação dos fios com pomadas de efeito fosco (matte), pomadas à base de água ou sprays de longa duração.',
    benefits: 'Fixação sem resíduos, brilho na medida certa e penteado intacto.',
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-luzes',
    name: 'Luzes Masculinas',
    slug: 'luzes-e-platinado',
    price: 90,
    durationMinutes: 90,
    category: 'TREATMENT',
    description: 'Técnica de reflexos e iluminação capilar na touca ou papel, criando mechas claras em contraste refinado com o tom natural do cabelo.',
    benefits: 'Luminosidade ao rosto, estilo moderno e preservação da saúde dos fios.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-platinado',
    name: 'Platinado Masculino',
    slug: 'luzes-e-platinado',
    price: 130,
    durationMinutes: 120,
    category: 'TREATMENT',
    description: 'Descoloração global profissional seguida de matização para tom platinado ou branco neve, utilizando plex de proteção.',
    benefits: 'Tom platinado homogêneo, impacto visual marcante e menor agressão à fibra capilar.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-selagem',
    name: 'Selagem Capilar',
    slug: 'selagem-capilar',
    price: 110,
    durationMinutes: 90,
    category: 'TREATMENT',
    description: 'Tratamento de alinhamento térmico que reduz o volume excessivo, elimina o frizz e alinha cabelos ondulados e rebeldes.',
    benefits: 'Cabelos alinhados, facilidade para pentear diariamente e toque sedoso.',
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'srv-tratamento-capilar',
    name: 'Tratamentos Capilares',
    slug: 'tratamentos-capilares',
    price: 60,
    durationMinutes: 40,
    category: 'TREATMENT',
    description: 'Cronograma capilar com hidratação, nutrição e reconstrução profunda para devolver a vitalidade e força aos cabelos danificados.',
    benefits: 'Reposição de massa capilar, brilho intenso e prevenção contra a queda por quebra.',
    imageUrl: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=600&q=80'
  }
];

export default function PublicSEOComponent({
  services,
  plans,
  parameters,
  onSelectServiceToBook,
  onOpenBookingWizard,
  onOpenLoginModal
}: PublicSEOComponentProps) {
  // Combine custom registered services with SEO fallback catalog
  const displayServices = services && services.length > 0 ? services : DEFAULT_SEO_SERVICES;

  // Track active FAQ accordion items
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Address and contact details derived from system parameters or official defaults
  const shopAddress = parameters?.address || "Presidente Arthur da Costa e Silva, 379";
  const shopPhone = parameters?.phone || "+55 11 92598-0946";
  const shopName = parameters?.shopName || "Trima Studio";

  // Navigation URL routing sync
  useEffect(() => {
    const pathname = window.location.pathname;
    let title = "Trima Studio | Barbearia, Corte e Barba com Agendamento Online";
    let desc = "Trima Studio: barbearia especializada em corte masculino, barba, barboterapia, degradê, tratamentos e combos. Consulte os serviços e agende seu horário online.";

    if (pathname.includes('/servicos')) {
      title = "Serviços de Barbearia, Corte e Barba | Trima Studio";
      desc = "Conheça todos os serviços do Trima Studio: corte degradê, barba clássica, barboterapia, selagem, platinado e combos com agendamento online.";
    } else if (pathname.includes('/clube-de-assinatura')) {
      title = "Clube de Assinatura VIP | Cortes e Barba Ilimitados no Trima Studio";
      desc = "Economize com os planos de assinatura do Trima Studio. Cortes masculinos e barba ilimitados com atendimento preferencial.";
    } else if (pathname.includes('/contato')) {
      title = "Endereço, Telefone e Contato | Trima Studio Barbearia";
      desc = "Encontre o Trima Studio na Presidente Arthur da Costa e Silva, 379. Atendimento via WhatsApp +55 11 92598-0946 e agendamento online 24h.";
    }

    document.title = title;

    // Update meta description
    const metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl) {
      metaDescEl.setAttribute('content', desc);
    }
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => prev === idx ? null : idx);
  };

  // Structured FAQ Data for Schema.org FAQPage
  const faqData = [
    {
      q: "Como agendar um horário no Trima Studio?",
      a: "Você pode agendar diretamente aqui pelo nosso site no botão 'Agendar Horário Online'. Escolha o serviço desejado, selecione o seu barbeiro de preferência, defina o dia e horário que melhor funcionam para você e confirme o agendamento em instantes."
    },
    {
      q: "Quais serviços o Trima Studio oferece?",
      a: "Oferecemos corte masculino tradicional, corte degradê (fade), corte premium, corte na máquina, barba clássica, barba na tesoura, barboterapia, barboterapia com ozônio, combo corte e barba, design de sobrancelha, pezinho, luzes masculinas, platinado, selagem capilar e tratamentos profundos."
    },
    {
      q: "O Trima Studio atende por ordem de chegada?",
      a: "Sim! Atendemos tanto clientes com agendamento online prévio (que possuem horário reservado e garantido) quanto clientes por ordem de chegada diretamente no balcão da barbearia conforme disponibilidade da equipe."
    },
    {
      q: "Como entrar em contato pelo WhatsApp?",
      a: "Você pode entrar em contato enviando uma mensagem para o nosso WhatsApp oficial pelo número +55 11 92598-0946 ou clicando nos botões diretos de atendimento em nosso site."
    },
    {
      q: "Onde fica o Trima Studio?",
      a: "O Trima Studio está localizado na Presidente Arthur da Costa e Silva, 379. Possuímos um espaço moderno, climatizado e preparado para o seu conforto."
    },
    {
      q: "Como funciona o clube de assinatura?",
      a: "Com o Clube VIP de Assinatura do Trima Studio, você paga uma mensalidade fixa e garante cortes e cuidados de barba com frequência programada, economizando dinheiro e mantendo seu estilo impecável o mês inteiro com prioridade de agenda."
    },
    {
      q: "É possível escolher o profissional?",
      a: "Com certeza! Durante o processo de agendamento online, você visualiza a lista completa de barbeiros do estúdio e pode selecionar o profissional com quem prefere realizar seu atendimento."
    }
  ];

  return (
    <article className="w-full bg-[#050507] text-slate-100 font-sans leading-relaxed selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. PUBLIC SEMANTIC NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <span className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl font-black font-mono shadow-md group-hover:scale-105 transition-transform">
              TS
            </span>
            <div className="text-left">
              <span className="text-base font-black tracking-tight text-white uppercase block leading-none font-mono">
                Trima <span className="text-amber-500">Studio</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">
                Barbearia & Estética Masculina
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            <a href="#apresentacao" className="hover:text-amber-400 transition-colors">Apresentação</a>
            <a href="#servicos" className="hover:text-amber-400 transition-colors">Serviços</a>
            <a href="#diferenciais" className="hover:text-amber-400 transition-colors">Diferenciais</a>
            <a href="#clube-vip" className="hover:text-amber-400 transition-colors">Clube VIP</a>
            <a href="#localizacao" className="hover:text-amber-400 transition-colors">Localização</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">Dúvidas FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/5511925980946"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl text-xs font-mono font-bold transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            <button
              type="button"
              onClick={() => {
                if (onOpenBookingWizard) onOpenBookingWizard();
                else {
                  const bookingEl = document.getElementById('secao-agendamento');
                  if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider font-mono rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Agendar Online
            </button>
          </div>
        </div>
      </header>

      {/* MAIN INDEXABLE PUBLIC CONTENT AREA */}
      <main className="w-full">

        {/* 2. HERO PRESENTATION SECTION */}
        <section id="apresentacao" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left overflow-hidden border-b border-slate-800/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Agendamento 24h & Atendimento VIP
              </div>

              {/* Exact H1 requested by prompt */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] font-mono">
                Trima Studio: Barbearia, Corte Masculino e Barba com Agendamento Online
              </h1>

              {/* Exact opening text requested by prompt */}
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                O Trima Studio oferece uma experiência completa de cuidados masculinos, com cortes, barba, barboterapia, tratamentos capilares e atendimento personalizado. Consulte nossos serviços, escolha o profissional e agende seu horário online.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenBookingWizard) onOpenBookingWizard();
                    else {
                      const bookingEl = document.getElementById('secao-agendamento');
                      if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider font-mono rounded-2xl shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Horário Online
                </button>

                <a
                  href="#servicos"
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider font-mono rounded-2xl transition-all flex items-center gap-2"
                >
                  <Scissors className="w-4 h-4 text-amber-500" />
                  Ver Serviços e Preços
                </a>
              </div>

              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <span className="text-xl font-black text-amber-500 font-mono block">100%</span>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Online & Rápido</span>
                </div>
                <div>
                  <span className="text-xl font-black text-amber-500 font-mono block">Zero</span>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Fila Estressante</span>
                </div>
                <div>
                  <span className="text-xl font-black text-amber-500 font-mono block">VIP</span>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Toalha Quente</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 group">
                <img
                  src="/og-trima-studio.jpg"
                  alt="Trima Studio Barbearia Ambientes e Atendimento Premium"
                  className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-xs font-mono font-extrabold text-amber-400 uppercase tracking-widest">
                    Presidente Arthur da Costa e Silva, 379
                  </span>
                  <h3 className="text-xl font-extrabold text-white font-mono mt-1">
                    Trima Studio
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Corte degradê, barba esculpida, barboterapia relaxante e tratamentos capilares em ambiente sofisticado.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. PUBLIC SERVICES CATALOG GRID */}
        <section id="servicos" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left border-b border-slate-800/60">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold font-mono text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 inline-block">
              Catálogo de Atendimentos
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
              Serviços de Barbearia, Corte e Cuidados Masculinos
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Consulte nossos serviços especializados. Cada procedimento é executado por profissionais capacitados com equipamentos esterilizados e cosméticos masculinos de primeira linha.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, index) => {
              const fallback = DEFAULT_SEO_SERVICES[index % DEFAULT_SEO_SERVICES.length];
              const name = service.name;
              const price = service.price ? `R$ ${Number(service.price).toFixed(2).replace('.', ',')}` : 'Consulte';
              const duration = service.durationMinutes ? `${service.durationMinutes} min` : '45 min';
              const desc = service.description || fallback.description;
              const benefits = (service as any).benefits || fallback.benefits;
              const imgUrl = (service as any).imageUrl || fallback.imageUrl;

              return (
                <article
                  key={service.id || `srv-${index}`}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-amber-500/5"
                >
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={imgUrl}
                        alt={`${name} no Trima Studio Barbearia`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-extrabold text-amber-400 border border-slate-800">
                        {price}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px] font-mono text-slate-300 flex items-center gap-1 border border-slate-800">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {duration}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white font-mono group-hover:text-amber-400 transition-colors">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    {benefits && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Benefício:</strong> {benefits}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectServiceToBook) {
                          onSelectServiceToBook(service);
                        } else if (onOpenBookingWizard) {
                          onOpenBookingWizard();
                        } else {
                          const bookingEl = document.getElementById('secao-agendamento');
                          if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Agendar Este Serviço
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 4. BARBERSHOP DIFFERENTIALS */}
        <section id="diferenciais" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left border-b border-slate-800/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold font-mono text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 inline-block">
              Exclusividade & Excelência
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
              Diferenciais da Nossa Barbearia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Agendamento Online 24h</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Marque seu atendimento a qualquer hora do dia ou da noite, direto pelo celular ou computador, escolhendo o horário e barbeiro ideais.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Barboterapia com Vapor de Ozônio</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ritual completo com toalha quente, óleos emolientes e vapor de ozônio para higienização profunda, evitando foliculite e irritação.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Clube VIP de Assinatura</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Planos mensais para manter seu corte de cabelo e barba sempre em dia com descontos expressivos e prioridade na agenda.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Profissionais Especialistas</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Barbeiros treinados nas mais recentes tendências de visagismo masculino, cortes degradê e químicas como platinado e selagem.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Produtos de Alta Performance</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos exclusivamente cosméticos, pomadas e balms masculinos testados e aprovados para cuidados com a pele e cabelo.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Ambiente Confortável & Amigável</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Espaço climatizado com boa música, café expresso e bebida gelada para tornar sua visita um momento agradável de descontração.
              </p>
            </div>
          </div>
        </section>

        {/* 5. HOW SCHEDULING WORKS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left border-b border-slate-800/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold font-mono text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 inline-block">
              Passo a Passo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
              Como Funciona o Agendamento Online
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-left space-y-3 relative">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black font-mono text-base flex items-center justify-center">
                1
              </span>
              <h3 className="text-lg font-bold text-white font-mono">Escolha o Serviço</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Selecione se prefere corte de cabelo, barba, barboterapia, combo ou tratamento químico no nosso catálogo interativo.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-left space-y-3 relative">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black font-mono text-base flex items-center justify-center">
                2
              </span>
              <h3 className="text-lg font-bold text-white font-mono">Escolha o Profissional</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Escolha o seu barbeiro favorito para realizar o atendimento ou selecione a opção de primeiro horário disponível.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-left space-y-3 relative">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black font-mono text-base flex items-center justify-center">
                3
              </span>
              <h3 className="text-lg font-bold text-white font-mono">Defina Data & Horário</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Escolha o dia e o horário de sua preferência no calendário em tempo real e receba a confirmação instantânea no WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* 6. VIP SUBSCRIPTION CLUB SECTION */}
        <section id="clube-vip" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left border-b border-slate-800/60">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 inline-block">
                  Clube de Assinatura VIP
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
                  Cabelo e Barba Sempre Impecáveis por um Valor Fixo Mensal
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Faça parte do Clube Trima Studio e desfrute da liberdade de manter o visual alinhado durante todo o mês com descontos exclusivos, facilidade no pagamento e prioridade de horário.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Atendimentos frequentes sem pagar por visita</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Prioridade na reserva da agenda</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Desconto extra para acompanhantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Cancelamento transparente sem fidelidade</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-center lg:text-right space-y-4">
                <div className="p-6 bg-slate-950 border border-amber-500/40 rounded-2xl text-center space-y-2 shadow-inner">
                  <span className="text-xs text-slate-400 font-mono uppercase block">A partir de</span>
                  <span className="text-3xl font-black text-amber-500 font-mono block">R$ 89,90 <span className="text-xs text-slate-400 font-normal">/mês</span></span>
                  <p className="text-[11px] text-slate-400">Consulte os planos de corte, barba ou combo integrados.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const vipEl = document.getElementById('secao-clube-vip');
                    if (vipEl) vipEl.scrollIntoView({ behavior: 'smooth' });
                    else if (onOpenBookingWizard) onOpenBookingWizard();
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-mono rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Conhecer Planos de Assinatura
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. LOCAL SEO & ADDRESS SECTION */}
        <section id="localizacao" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left border-b border-slate-800/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5" />
                Localização & Atendimento Local
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
                Onde Fica o Trima Studio
              </h2>

              {/* Exact text requested by prompt */}
              <p className="text-sm text-slate-300 leading-relaxed">
                Visite o Trima Studio na Presidente Arthur da Costa e Silva, 379. Entre em contato pelo WhatsApp, consulte os horários disponíveis e faça seu agendamento online.
              </p>

              <div className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono">Endereço Completo:</strong>
                    <span>{shopAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono">Telefone & WhatsApp:</strong>
                    <span>{shopPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono">Horário de Funcionamento:</strong>
                    <span>Segunda a Sábado: {parameters?.openTime || "09:00"} às {parameters?.closeTime || "20:00"}</span>
                  </div>
                </div>
              </div>

              {/* Exact links requested by prompt with exact texts */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="tel:+5511925980946"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Ligar para o Trima Studio
                </a>

                <a
                  href="https://wa.me/5511925980946"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Agendar pelo WhatsApp
                </a>

                <a
                  href="https://share.google/65wzVbzEbkPHqLavN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Ver localização no Google Maps
                </a>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase">Redes Sociais:</span>
                <a
                  href="https://instagram.com/trimastudiobr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-amber-400 flex items-center gap-1 text-xs font-mono transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </a>
                <a
                  href="https://facebook.com/trimastudiobr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-amber-400 flex items-center gap-1 text-xs font-mono transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  Facebook
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-xl space-y-3">
                <div className="h-72 rounded-2xl overflow-hidden bg-slate-950 relative flex items-center justify-center">
                  <iframe
                    title="Mapa do Trima Studio no Google Maps"
                    src="https://maps.google.com/maps?q=Presidente%20Arthur%20da%20Costa%20e%20Silva,%20379&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0 grayscale opacity-90 contrast-125 hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-2 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Trima Studio - Presidente Arthur da Costa e Silva, 379</span>
                  <a
                    href="https://share.google/65wzVbzEbkPHqLavN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 underline hover:text-amber-300"
                  >
                    Abrir no Maps ↗
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 8. VISIBLE FAQ SECTION WITH SCHEMA.ORG FAQPAGE */}
        <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-left">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold font-mono text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 inline-block">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-xs text-slate-300">
              Respostas claras e transparentes sobre nossos atendimentos, agendamento online e serviços.
            </p>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-mono font-bold text-sm text-white hover:text-amber-400 transition-colors cursor-pointer gap-4"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                      openFaqIndex === idx ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>

                {openFaqIndex === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* JSON-LD FAQPage Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqData.map(item => ({
                  "@type": "Question",
                  "name": item.q,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.a
                  }
                }))
              })
            }}
          />
        </section>

      </main>

      {/* 9. PUBLIC SEMANTIC FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <a href="/" className="flex items-center gap-2 font-mono font-extrabold text-base text-white">
              <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs">TS</span>
              Trima Studio
            </a>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Barbearia especializada em corte masculino, barba, barboterapia, degradê, tratamentos capilares e agendamento online.
            </p>
          </div>

          <div>
            <h4 className="font-mono font-bold text-white uppercase text-xs mb-3">Links Rápidos</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#apresentacao" className="hover:text-amber-400">Início</a></li>
              <li><a href="#servicos" className="hover:text-amber-400">Serviços e Preços</a></li>
              <li><a href="#clube-vip" className="hover:text-amber-400">Clube de Assinatura</a></li>
              <li><a href="#localizacao" className="hover:text-amber-400">Localização e Mapa</a></li>
              <li><a href="#faq" className="hover:text-amber-400">Perguntas Frequentes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold text-white uppercase text-xs mb-3">Contato Local</h4>
            <p className="text-[11px] text-slate-300 mb-1">
              <strong>Endereço:</strong> {shopAddress}
            </p>
            <p className="text-[11px] text-slate-300 mb-1">
              <strong>Telefone:</strong> {shopPhone}
            </p>
            <p className="text-[11px] text-slate-300">
              <strong>WhatsApp:</strong> +55 11 92598-0946
            </p>
          </div>

          <div>
            <h4 className="font-mono font-bold text-white uppercase text-xs mb-3">Redes & Agendamento</h4>
            <div className="flex flex-col gap-2">
              <a href="https://instagram.com/trimastudiobr" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">
                @trimastudiobr (Instagram)
              </a>
              <a href="https://facebook.com/trimastudiobr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                trimastudiobr (Facebook)
              </a>
              <a href="https://www.trimastudio.com.br/" className="text-amber-400 hover:underline font-mono">
                www.trimastudio.com.br
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-300">
          <p>© {new Date().getFullYear()} Trima Studio. Todos os direitos reservados.</p>
          <p className="font-mono text-slate-300">Domínio Canônico: <a href="https://www.trimastudio.com.br/" className="text-amber-500 hover:underline">https://www.trimastudio.com.br/</a></p>
        </div>
      </footer>

    </article>
  );
}
