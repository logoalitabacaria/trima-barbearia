/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Check, Sparkles, Instagram, MessageSquare, RefreshCw, Star,
  FileText, Plus, Trash2, Smartphone, Share2, Send, PenTool, Image, BookOpen
} from 'lucide-react';
import { User } from '../types';

interface FacilitadorPanelProps {
  currentUser: User;
  users: User[];
  onUpdateState: (key: string, val: any) => void;
}

interface PodItem {
  id: string;
  model: string;
  flavor: string;
  quantity: number;
}

interface ParsedSupplierModel {
  model: string;
  flavors: string[];
}

export default function FacilitadorPanel({
  currentUser,
  users,
  onUpdateState
}: FacilitadorPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pods' | 'post' | 'reviews'>('pods');

  // Utility Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const showCopyFeedback = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    showCopyFeedback(key);
  };

  // ==========================================
  // TOOL 1: COMPRA DE PODS STATE & HANDLENS WITH LOCAL PARSER FALLBACK
  // ==========================================
  const [supplierText, setSupplierText] = useState('');
  const [isParsingPods, setIsParsingPods] = useState(false);
  const [parsedSupplierModels, setParsedSupplierModels] = useState<ParsedSupplierModel[]>([]);
  const [selectedPodCart, setSelectedPodCart] = useState<PodItem[]>([]);
  
  // Custom manual option states
  const [manualModel, setManualModel] = useState('');
  const [manualFlavor, setManualFlavor] = useState('');

  // Robust Regex-based local parser to offer instant results or fallback on any error
  const parseSupplierTextLocally = (text: string): ParsedSupplierModel[] => {
    const result: ParsedSupplierModel[] = [];
    if (!text.trim()) return [];

    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Filter out obvious noise or promotional lines
    const isNoiseLine = (line: string): boolean => {
      const lower = line.toLowerCase();
      return (
        lower.includes('frete') ||
        lower.includes('pagamento') ||
        lower.includes('entregas') ||
        lower.includes('enviamos') ||
        lower.includes('pedido mínimo') ||
        lower.includes('pedido minimo') ||
        lower.includes('valores') ||
        lower.includes('tabela de preço') ||
        lower.includes('tabela de preco') ||
        lower.includes('chama no') ||
        lower.includes('whatsapp') ||
        lower.includes('contato') ||
        lower.includes('correios') ||
        lower.includes('jadlog') ||
        lower.includes('responsabilidade') ||
        lower.includes('chegada') ||
        lower.includes('postagem') ||
        lower.includes('pedido ônibus') ||
        lower.includes('pedido onibus') ||
        lower.includes('comprovante') ||
        lower.includes('total do grupo') ||
        lower.includes('total geral') ||
        lower.includes('totais') ||
        lower.startsWith('http') ||
        /^[=\*#_~•\-]{3,}$/.test(line)
      );
    };

    let currentModel: string | null = null;
    let currentFlavors: string[] = [];

    const addCurrent = () => {
      if (currentModel && currentFlavors.length > 0) {
        // Dedup flavors
        const uniqueFlavors = Array.from(new Set(currentFlavors.map(f => f.trim()))).filter(f => f.length > 1);
        if (uniqueFlavors.length > 0) {
          result.push({
            model: currentModel,
            flavors: uniqueFlavors
          });
        }
      }
      currentFlavors = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      if (isNoiseLine(rawLine)) continue;

      // Clean line from markdown bold asterisks and punctuation
      const cleanLine = rawLine.replace(/[\*_~`#]/g, '').trim();
      if (!cleanLine) continue;

      const upper = cleanLine.toUpperCase();

      // Check if raw line starts with standard bullet characters:
      // A cleanLine starts with a bullet if it has -, *, •, + prefix or is numeric
      const hasBulletPrefix = /^[-\*•\+\s]/.test(cleanLine) || /^\d+[\.\)\s\-\/]+\s+/.test(cleanLine);
      
      const brands = [
        'IGNITE', 'ELFBAR', 'ELF BAR', 'OXBAR', 'OX BAR', 'TORNADO', 
        'BLACKSHEP', 'BLACK SHEEP', 'BLACKSHEEP', 'WAKA', 'NIKBAR', 
        'SAMS', 'ROTO', 'GEEK', 'LOST MARY', 'LOSTMARY', 'VAPORESSO', 
        'SMOK', 'BLVK', 'JUST JUICE', 'DINNER LADY', 'DINNERLADY', 
        'UNPLUG', 'LIFE POD', 'LIFEPOD', 'SEX ADDICT'
      ];

      const containsModelKeyword = 
        brands.some(b => upper.includes(b)) ||
        /\bV\d+\b/.test(upper) ||
        /\b\d+K\b/.test(upper) ||
        /\b\d+\s*PUFF\b/.test(upper) ||
        /\bREFIL\b/.test(upper) ||
        /\bKIT\b/.test(upper) ||
        /\bBATERIA\b/.test(upper) ||
        /\bSWITCH\b/.test(upper);

      // Check inline split like "BLACKSHEEP 15K - Menta, Melancia, Grape"
      const inlineSplitIndex = cleanLine.indexOf(':') !== -1 ? cleanLine.indexOf(':') : (cleanLine.indexOf(' - ') !== -1 ? cleanLine.indexOf(' - ') : -1);
      
      if (inlineSplitIndex > 3 && inlineSplitIndex < 40 && !hasBulletPrefix) {
        const modelPart = cleanLine.substring(0, inlineSplitIndex).trim();
        const flavorsPart = cleanLine.substring(inlineSplitIndex + 1).trim();

        const isDecorative = /^(sabores|disponiveis|disponíveis|essências|essencias)/i.test(flavorsPart.toLowerCase().trim());

        if (!isDecorative && flavorsPart.length > 4) {
          addCurrent();
          let cleanModel = modelPart.replace(/^[\uD800-\uDFFF\u2600-\u27BF⚡🔥💨👑✨📍]+|[\uD800-\uDFFF\u2600-\u27BF⚡🔥💨👑✨📍]+$/g, '').trim();
          cleanModel = cleanModel.replace(/\b(sabores|disponíveis|disponiveis|sabor|essencias|essência|essências|novos|unidades|atacado)\b/gi, '').trim();
          currentModel = cleanModel || "Modelo de Pod";

          const potentialFlavors = flavorsPart.split(/[,/;|\t\+]+/).map(f => f.trim()).filter(f => f.length > 2);
          currentFlavors = potentialFlavors;
          addCurrent();
          currentModel = null;
          continue;
        }
      }

      // Context check for model header styles
      const nextLine = lines[i + 1] || "";
      const cleanNextLine = nextLine.replace(/[\*_~`#]/g, '').trim();
      const isNextLineBullet = /^[-\*•\+\s]/.test(cleanNextLine) || /^\d+[\.\)\s\-\/]+\s+/.test(cleanNextLine);
      
      // If a raw line specifically starts and ends with markdown bold makers, e.g. **BLACKSHEP 30K**
      const isBoldHeader = (rawLine.startsWith('**') && rawLine.endsWith('**')) || (rawLine.startsWith('*') && rawLine.endsWith('*'));

      const isHeaderStyle = 
        isBoldHeader ||
        (!hasBulletPrefix && cleanLine.length < 50 && (isNextLineBullet || containsModelKeyword)) ||
        (cleanLine.endsWith(':') && !hasBulletPrefix && cleanLine.length < 40);

      if (isHeaderStyle) {
        addCurrent();
        let cleanModel = cleanLine.replace(/[:\-*•+=]/g, '').trim();
        cleanModel = cleanModel.replace(/\b(sabores|disponíveis|disponiveis|sabor|essencias|essência|essências|novos|unidades|atacado)\b/gi, '').trim();
        cleanModel = cleanModel.replace(/^[\uD800-\uDFFF\u2600-\u27BF⚡🔥💨👑✨📍]+|[\uD800-\uDFFF\u2600-\u27BF⚡🔥💨👑✨📍]+$/g, '').trim();
        
        currentModel = cleanModel || "Modelo de Pod";
      } else {
        // Flavor details
        if (currentModel) {
          let cleanFlavorStr = cleanLine.replace(/^([-\*•\+\d\)\.\-\/]\s*)+/, '').trim();
          cleanFlavorStr = cleanFlavorStr.replace(/[-–—]*\s*r\$\s*\d+([,.]\d+)?/gi, '').trim();
          cleanFlavorStr = cleanFlavorStr.split('R$')[0].trim();
          cleanFlavorStr = cleanFlavorStr.replace(/^[\uD800-\uDFFF\u2600-\u27BF⚡🔥💨👑✨📍]+|[\uD800-\uDFFF\u2600-\u27BF⚡🔥💨👑✨📍]+$/g, '').trim();

          const splitFlavors = cleanFlavorStr.split(/[,/;|\t]+/).map(f => f.trim()).filter(f => f.length > 2 && !/^\d+$/.test(f));
          currentFlavors.push(...splitFlavors);
        }
      }
    }

    addCurrent();
    return result;
  };

  const parseSupplierTextWithAI = async () => {
    if (!supplierText.trim()) return;
    setIsParsingPods(true);
    try {
      const res = await fetch('/api/gemini/parse-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierText })
      });
      const data = await res.json();
      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        setParsedSupplierModels(data.result);
      } else {
        const localParsed = parseSupplierTextLocally(supplierText);
        if (localParsed.length > 0) {
          setParsedSupplierModels(localParsed);
        } else {
          alert('Tivemos dificuldade em extrair sabores/modelos desse texto. Certifique-se de que a mensagem contém nomes de modelos (ex: Blacksheep, Ignite) e uma lista de sabores.');
        }
      }
    } catch (err) {
      console.error('Error parsing pods with AI (Gemini), executing local parser fallback:', err);
      const localParsed = parseSupplierTextLocally(supplierText);
      if (localParsed.length > 0) {
        setParsedSupplierModels(localParsed);
      } else {
        alert('Erro ao carregar os dados. Verifique a lista enviada pelo fornecedor.');
      }
    } finally {
      setIsParsingPods(false);
    }
  };

  const handleUpdateQuantityInCart = (model: string, flavor: string, amount: number) => {
    setSelectedPodCart(prev => {
      const exists = prev.find(item => item.model === model && item.flavor === flavor);
      if (exists) {
        const newQty = Math.max(0, exists.quantity + amount);
        if (newQty === 0) {
          return prev.filter(item => item.id !== exists.id);
        }
        return prev.map(item => item.id === exists.id ? { ...item, quantity: newQty } : item);
      } else if (amount > 0) {
        return [...prev, { id: `cart-${Date.now()}-${Math.random()}`, model, flavor, quantity: amount }];
      }
      return prev;
    });
  };

  const clearPodCart = () => {
    setSelectedPodCart([]);
  };

  const getGeneratedPurchaseText = () => {
    if (selectedPodCart.length === 0) return '';
    
    // Group cart by model
    const grouped: { [model: string]: PodItem[] } = {};
    selectedPodCart.forEach(item => {
      if (!grouped[item.model]) {
        grouped[item.model] = [];
      }
      grouped[item.model].push(item);
    });

    let message = `*Pedido Logo Ali Tabacaria*\n\n`;

    let totalItems = 0;
    Object.keys(grouped).forEach(model => {
      message += `*${model}*\n`;
      grouped[model].forEach(item => {
        message += `- ${item.flavor}: ${item.quantity} un\n`;
        totalItems += item.quantity;
      });
      message += `\n`;
    });

    message += `*Total:* ${totalItems} unidades`;
    return message;
  };

  // ==========================================
  // TOOL 2: GERADOR DE POST EXCLUSIVE STATE & REFACTOR
  // ==========================================
  const [postType, setPostType] = useState('Lançamento de Pod');
  const [postBriefing, setPostBriefing] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Custom design parameters
  const [postTitle, setPostTitle] = useState('LOGOS DISPONÍVEIS');
  const [postSubtitle, setPostSubtitle] = useState('LANÇAMENTO PREMIUM');
  const [postBodyText, setPostBodyText] = useState('Os melhores modelos de Pod Reabastecidos com os sabores mais pedidos da estação.');
  const [postCaption, setPostCaption] = useState('As novidades não param! 💈 Acabamos de reabastecer nosso estoque com os PODs mais procurados do mercado. Venha dar um trato no cabelo e garantir o seu aroma favorito na tabacaria anexa.\n\n📍 Rua Logo Ali, 777\n#LogoAliBarbearia #Tabacaria #Vape');
  
  const [postFormat, setPostFormat] = useState<'feed' | 'story'>('feed');
  const [designPreset, setDesignPreset] = useState<'gold' | 'neon' | 'light' | 'swiss'>('gold');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Saved templates state
  const [savedTemplates, setSavedTemplates] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('logo_ali_saved_templates_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep saved templates synced to localStorage
  useEffect(() => {
    localStorage.setItem('logo_ali_saved_templates_v2', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  const generatePostTextsWithAI = async (mode: 'both' | 'text' | 'image' = 'both') => {
    if (!postBriefing.trim()) {
      alert('Por favor, explique o que você quer no post no campo de texto para orientar a IA.');
      return;
    }
    setIsGeneratingPost(true);
    try {
      // Modify supplementary prompt info to specify what needs to be filled based on active mode
      let targetDirective = "";
      if (mode === 'text') {
        targetDirective = "Foque primariamente em criar uma legenda sensacional para o feed/story ('caption'). Você pode retornar títulos fictícios de preenchimento nos outros campos.";
      } else if (mode === 'image') {
        targetDirective = "Foque primariamente em criar textos de altíssimo impacto visual para colocar no canvas da imagem ('title', 'subtitle', 'bodyText'). Mantenha a legenda básica.";
      } else {
        targetDirective = "Desenvolva com extrema criatividade tanto a legenda do Instagram quanto o título/subtítulo/corpo da imagem.";
      }

      const res = await fetch('/api/gemini/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postType: `Modo ${mode} no formato ${postFormat}`, 
          additionalInfo: `${targetDirective} Explicação do post desejado pelo usuário: ${postBriefing}. Formato planejado: ${postFormat}. Estilo temático escolhido no canvas: ${designPreset}.`
        })
      });
      const data = await res.json();
      if (data.result) {
        if (mode === 'both' || mode === 'image') {
          if (data.result.title) setPostTitle(data.result.title.toUpperCase());
          if (data.result.subtitle) setPostSubtitle(data.result.subtitle.toUpperCase());
          if (data.result.bodyText) setPostBodyText(data.result.bodyText);
        }
        if (mode === 'both' || mode === 'text') {
          if (data.result.caption) setPostCaption(data.result.caption);
        }
      }
    } catch (err) {
      console.error('Error generating post:', err);
      alert('Erro ao se conectar com a IA para estruturar esse post.');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Handle uploaded image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setUploadedBase64(base64);
          
          const img = new window.Image();
          img.src = base64;
          img.onload = () => {
            setImageElement(img);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = () => {
    setUploadedBase64(null);
    setImageElement(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Templates manipulation methods
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Por favor, informe um nome para o modelo primeiro.');
      return;
    }
    const newTemplate = {
      id: `tmpl-${Date.now()}`,
      name: templateName.trim(),
      format: postFormat,
      preset: designPreset,
      briefing: postBriefing,
      title: postTitle,
      subtitle: postSubtitle,
      bodyText: postBodyText,
      caption: postCaption,
      image: uploadedBase64 || null,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    setSavedTemplates(prev => [newTemplate, ...prev]);
    setTemplateName('');
    alert(`Modelo "${newTemplate.name}" salvo com sucesso!`);
  };

  const handleLoadTemplate = (tmpl: any) => {
    setPostFormat(tmpl.format);
    setDesignPreset(tmpl.preset);
    setPostBriefing(tmpl.briefing);
    setPostTitle(tmpl.title);
    setPostSubtitle(tmpl.subtitle);
    setPostBodyText(tmpl.bodyText);
    setPostCaption(tmpl.caption);
    if (tmpl.image) {
      setUploadedBase64(tmpl.image);
      const img = new window.Image();
      img.src = tmpl.image;
      img.onload = () => {
        setImageElement(img);
      };
    } else {
      setUploadedBase64(null);
      setImageElement(null);
    }
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja excluir este modelo de post do sistema?')) {
      setSavedTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // Repaint canvas on changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res dimensions
    const width = 1080;
    const height = postFormat === 'feed' ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    // Fill Background based on Preset
    if (designPreset === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#101012');
      grad.addColorStop(0.5, '#1E1B10');
      grad.addColorStop(1, '#080809');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gold Decorative Accents
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.lineWidth = 40;
      ctx.strokeRect(50, 50, width - 100, height - 100);
      
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
    } else if (designPreset === 'neon') {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      // Cyber Vapor Wave grids or circles
      const grad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 700);
      grad.addColorStop(0, 'rgba(162, 28, 175, 0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#a21caf'; // dark purple border
      ctx.lineWidth = 15;
      ctx.strokeRect(30, 30, width - 60, height - 60);
    } else if (designPreset === 'light') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      
      // Clean borders
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 20;
      ctx.strokeRect(30, 30, width - 60, height - 60);
    } else { // Swiss Minimal Style
      ctx.fillStyle = '#0E0E10';
      ctx.fillRect(0, 0, width, height);

      // Thick red details
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(80, 80, 40, height - 160);
    }

    // Draw Watermark logo header
    ctx.textAlign = 'center';
    ctx.fillStyle = designPreset === 'light' ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('💈 LOGO ALI BARBEARIA • TABACARIA', width / 2, height - 90);

    // Draw Uploaded Mockup/Photo in central position
    if (imageElement) {
      const maxImgW = width * 0.7;
      const maxImgH = height * 0.45;
      
      let imgW = imageElement.width;
      let imgH = imageElement.height;
      
      const ratio = Math.min(maxImgW / imgW, maxImgH / imgH);
      imgW = imgW * ratio;
      imgH = imgH * ratio;

      const imgX = (width - imgW) / 2;
      const imgY = height * 0.26;

      // Draw background shield or shadows
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      
      ctx.fillRect(imgX - 10, imgY - 10, imgW + 20, imgH + 20);
      
      // Draw image
      ctx.shadowBlur = 0; // reset shadow
      ctx?.drawImage(imageElement, imgX, imgY, imgW, imgH);

      // Accent border around image
      ctx.strokeStyle = designPreset === 'gold' ? '#eab308' : designPreset === 'neon' ? '#f43f5e' : '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.strokeRect(imgX, imgY, imgW, imgH);
    } else {
      // Draw a default decorative Vape/Comb SVG substitute on Canvas if no image uploaded
      const x = width / 2;
      const y = height * 0.45;
      ctx.fillStyle = designPreset === 'gold' ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.arc(x, y, 160, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = '100px sans-serif';
      ctx.fillText('👑', x, y + 25);
    }

    // Typography setup
    // 1. Tag Subtitle (Superior Badge)
    if (postSubtitle) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px sans-serif';
      const textWidth = ctx.measureText(postSubtitle).width;
      const badgeY = height * 0.10;

      ctx.fillStyle = designPreset === 'gold' ? '#eab308' : designPreset === 'neon' ? '#d946ef' : '#ef4444';
      ctx.fillRect((width - textWidth - 50) / 2, badgeY, textWidth + 50, 48);

      ctx.fillStyle = designPreset === 'gold' || designPreset === 'neon' || designPreset === 'swiss' ? '#000000' : '#ffffff';
      ctx.fillText(postSubtitle, width / 2, badgeY + 33);
    }

    // 2. Main Title (Impact Display Typography)
    ctx.textAlign = 'center';
    ctx.font = 'extrabold 64px system-ui';
    ctx.fillStyle = designPreset === 'light' ? '#0f172a' : designPreset === 'gold' ? '#eab308' : '#ffffff';
    
    // Draw text wrap if needed, simple slice for title
    const titleY = height * 0.17;
    ctx.fillText(postTitle || 'LOGO ALI', width / 2, titleY);

    // 3. Body/Intro Text (underneath image)
    if (postBodyText) {
      ctx.textAlign = 'center';
      ctx.fillStyle = designPreset === 'light' ? '#475569' : '#d4d4d8';
      ctx.font = 'bold 30px system-ui';
      
      // Simple custom canvas word wrapper
      const wrapText = (text: string, xPos: number, yPos: number, maxW: number, lineH: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = yPos;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxW && n > 0) {
            ctx.fillText(line, xPos, currentY);
            line = words[n] + ' ';
            currentY += lineH;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, xPos, currentY);
      };

      const bodyY = height * 0.76;
      wrapText(postBodyText, width / 2, bodyY, width * 0.85, 38);
    }
  }, [postTitle, postSubtitle, postBodyText, postFormat, designPreset, imageElement]);


  const downloadInstagramImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `logo-ali-${postType.toLowerCase().replace(/ /g, '-')}-${postFormat}.png`;
    link.href = url;
    link.click();
  };


  // Tool 3 WhatsApp Recados removed as requested

  // ==========================================
  // TOOL 4: RESPOSTAS GOOGLE STATE & REFACTOR
  // ==========================================
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState('5');
  const [revText, setRevText] = useState('');
  const [revDirectives, setRevDirectives] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [generatedReplyResult, setGeneratedReplyResult] = useState('');

  const generateGoogleReviewReplyWithAI = async () => {
    if (!revName.trim()) {
      alert('Preencha ao menos o nome do avaliador para contextualizar o agradecimento.');
      return;
    }
    setIsGeneratingReply(true);
    setGeneratedReplyResult('');
    try {
      const res = await fetch('/api/gemini/google-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: revName,
          starRating: parseInt(revRating),
          reviewText: revText,
          ownerDirectives: revDirectives
        })
      });
      const data = await res.json();
      if (data.text) {
        setGeneratedReplyResult(data.text);
      }
    } catch (err) {
      console.error('Error generating google reply:', err);
      alert('Erro ao gerar a resposta otimizada SEO no momento.');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Apoio Operacional & Facilitador Diário
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Aba equipada com multiplicadores de produtividade alimentados por IA para simplificar o pedido de novos insumos, otimizar fotos/posts, e impulsionar o relacionamento com os clientes da barbearia e tabacaria.
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex bg-zinc-950 p-1 border border-zinc-850 rounded-xl max-w-md w-full md:w-auto font-mono text-[10px] uppercase font-bold">
          <button
            onClick={() => setActiveSubTab('pods')}
            className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'pods' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📦 COMPRA POD
          </button>
          <button
            onClick={() => setActiveSubTab('post')}
            className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'post' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🎨 POST INSTA
          </button>
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'reviews' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⭐ RESPOSTA LOCAL GOOGLE
          </button>
        </div>
      </div>

      {/* ====================================================
          TAB 1: COMPRA DE PODS / PEDIDO FORNECEDOR
         ==================================================== */}
      {activeSubTab === 'pods' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fadeIn">
          {/* Form and Input Text Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-yellow-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-850">
                <span>💬</span> Importar Lista do Fornecedor
              </h3>
              <p className="text-[11px] text-zinc-400">
                Cole a mensagem crua contendo os modelos e sabores de pods enviados pelo fornecedor. Nossa IA de IA do Gemini selecionará as opções e montará um painel de cliques rápido para você.
              </p>

              <div className="space-y-3">
                <textarea
                  value={supplierText}
                  onChange={(e) => setSupplierText(e.target.value)}
                  placeholder={`Cole o texto do fornecedor aqui...\nExemplo:\nIG V50 Sabores:\n- Morango Ice\n- Banana Gelada\nIGNITE V80:\n- Blueberry\n- Hortelã Pró`}
                  rows={8}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-650 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                />

                <button
                  onClick={parseSupplierTextWithAI}
                  disabled={isParsingPods || !supplierText.trim()}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-650 text-black font-bold text-xs uppercase font-mono rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isParsingPods ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analisando Catálogo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analisar Texto Catalogo
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Como Funciona Card */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-3 text-xs text-zinc-400">
              <h4 className="font-bold text-xs text-yellow-500 font-mono uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-850">
                <span>📋</span> Como Funciona?
              </h4>
              <ol className="list-decimal pl-4 space-y-2 text-[11px] text-zinc-300">
                <li>Cole a mensagem que o seu fornecedor de pods/vapes enviou no campo de texto acima.</li>
                <li>Clique em <strong className="text-yellow-500">Analisar Texto Catálogo</strong> para segmentar os produtos de forma estruturada.</li>
                <li>O sistema vai separar automaticamente os pods por modelo e listar todos os de sabores disponíveis em botões interativos de clique.</li>
                <li>Clique nos botões de sabores e use os controles <span className="text-emerald-550 font-bold font-mono">+</span> e <span className="text-red-500 font-bold font-mono">-</span> para ajustar as quantidades que deseja repor.</li>
                <li>A lista formatada com os modelos, sabores e quantidades será montada instantaneamente no painel WhatsApp. Copie e mande diretamente para seu distribuidor!</li>
              </ol>
            </div>
          </div>

          {/* Interactive Catalog and Cart Builder */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Catalog Grid View */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-850">
                  🧬 Seleção de Modelos e Aromas Importados
                </h3>

                {parsedSupplierModels.length === 0 && selectedPodCart.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500 font-mono text-xs space-y-2">
                    <p>📦 Nenhuma importação de fornecedor ativa.</p>
                    <p className="text-[10px] text-zinc-650 max-w-xs mx-auto">Coloque a lista do seu distribuidor à esquerda para que a Inteligência e IA do Gemini possa criar os botões.</p>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1 mt-3">
                    {parsedSupplierModels.length > 0 && (
                      <div className="space-y-4">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded px-2 py-0.5 font-bold font-mono uppercase tracking-widest">IA PARSADA COM SUCESSO</span>
                        {parsedSupplierModels.map((supplier, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl space-y-2">
                            <span className="font-extrabold font-mono text-xs text-yellow-500 block">
                              📟 {supplier.model}
                            </span>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {supplier.flavors.map((flavor, fIdx) => {
                                const matched = selectedPodCart.find(item => item.model === supplier.model && item.flavor === flavor);
                                const qty = matched ? matched.quantity : 0;

                                return (
                                  <div
                                    key={fIdx}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition duration-150 ${
                                      qty > 0
                                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    <span>{flavor}</span>
                                    {qty > 0 && <span className="font-extrabold bg-yellow-500 text-black px-1.5 py-0.2 rounded font-mono text-[9px]">{qty}</span>}
                                    
                                    <div className="flex items-center gap-0.5 ml-1 border-s border-zinc-850 pl-1.5">
                                      <button
                                        onClick={() => handleUpdateQuantityInCart(supplier.model, flavor, -1)}
                                        className="hover:bg-zinc-800 text-zinc-400 hover:text-red-400 p-0.5 rounded cursor-pointer font-bold font-sans"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={() => handleUpdateQuantityInCart(supplier.model, flavor, 1)}
                                        className="hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 p-0.5 rounded cursor-pointer font-bold font-sans"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {parsedSupplierModels.length > 0 && (
                <button
                  onClick={() => setParsedSupplierModels([])}
                  className="mt-4 text-[10px] text-zinc-500 hover:text-zinc-400 font-mono text-left underline cursor-pointer"
                >
                  Limpar Importação Atual
                </button>
              )}
            </div>

            {/* Generated Whatsapp Cart output */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-850 flex justify-between items-center">
                  <span>📝 Formato de Pedido WhatsApp</span>
                  {selectedPodCart.length > 0 && (
                    <button
                      onClick={clearPodCart}
                      className="text-[9px] text-red-500 hover:text-red-400 tracking-wider font-extrabold uppercase border border-red-500/10 px-1.5 py-0.5 rounded"
                    >
                      Limpar Tudo
                    </button>
                  )}
                </h3>

                {selectedPodCart.length === 0 ? (
                  <div className="text-center py-20 text-zinc-650 font-mono text-xs">
                    Adicione quantidades na lista acima para ver o carrinho gerado automaticamente aqui.
                  </div>
                ) : (
                  <div className="space-y-4 mt-3">
                    <pre className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-lg text-left text-[11px] font-mono text-zinc-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-1">
                      {getGeneratedPurchaseText()}
                    </pre>

                    <button
                      onClick={() => handleCopyToClipboard(getGeneratedPurchaseText(), 'whatsapp-pods')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase font-mono rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      {copiedKey === 'whatsapp-pods' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-250 animate-pulse" />
                          Pedido Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Texto do Whatsapp
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-zinc-500 font-mono bg-zinc-950 p-2.5 border border-zinc-850 rounded-lg mt-3">
                🎯 <strong>Dica de uso:</strong> Após copiar, basta mandar uma mensagem para o fornecedor e colar para fazer seu pedido esteticamente limpo e contundente.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: GERADOR DE POSTS INSTAGRAM (CANVA CANVAS)
         ==================================================== */}
      {activeSubTab === 'post' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fadeIn">
          {/* LEFT COLUMN: Simplified Input Controls & Saved Templates */}
          <div className="lg:col-span-5 space-y-5">
            {/* Main Generation Options Form */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-xl">
              <h3 className="text-xs font-bold font-mono text-yellow-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-850">
                <span>🪄</span> Gerador Inteligente de Posts
              </h3>

              <div className="space-y-4 text-xs">
                {/* Format selection */}
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1.5 font-bold">1. Formato da Postagem</label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPostFormat('feed')}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${postFormat === 'feed' ? 'bg-yellow-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                    >
                      📺 Feed Quadrado (1:1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostFormat('story')}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${postFormat === 'story' ? 'bg-yellow-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                    >
                      📱 Story / Reels (9:16)
                    </button>
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1.5 font-bold">2. Estilo Temático da Arte</label>
                  <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg text-[9px] font-extrabold uppercase text-center font-mono">
                    <button
                      type="button"
                      onClick={() => setDesignPreset('gold')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${designPreset === 'gold' ? 'bg-zinc-805 text-amber-400 shadow font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Ouro
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignPreset('neon')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${designPreset === 'neon' ? 'bg-zinc-805 text-purple-400 shadow font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Neon
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignPreset('light')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${designPreset === 'light' ? 'bg-zinc-805 text-blue-400 shadow font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignPreset('swiss')}
                      className={`p-1.5 rounded transition-all cursor-pointer ${designPreset === 'swiss' ? 'bg-zinc-805 text-red-400 shadow font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Suiço
                    </button>
                  </div>
                </div>

                {/* Prompt/Description input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] text-zinc-400 font-mono uppercase block font-bold">3. O que você quer no seu Post?</label>
                    <span className="text-[9px] text-zinc-550 font-mono">Ideia, preços, avisos...</span>
                  </div>
                  <textarea
                    value={postBriefing}
                    onChange={(e) => setPostBriefing(e.target.value)}
                    placeholder="Ex: Chegou estoque de Blacksheep 30K de Menta e Melancia. Quero avisar que dividimos no Pix ou cartão e convidar a galera para vir buscar."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-yellow-500 font-sans leading-relaxed text-left"
                  />
                </div>

                {/* Optional product/reference image upload */}
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1.5 font-bold">4. Foto do Produto / Barba (Obriga realçar na Imagem)</label>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Image className="w-3.5 h-3.5 text-zinc-400" />
                      {uploadedBase64 ? 'Alterar Foto' : 'Carregar Imagem'}
                    </button>
                    {uploadedBase64 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">✔ Anexada</span>
                        <button
                          type="button"
                          onClick={removeUploadedImage}
                          className="text-red-500 hover:text-red-400 text-[10px] font-mono cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-650 font-mono">Nenhuma imagem carregada</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* AI Generation Mode Choice */}
                <div className="pt-2">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-2 uppercase font-bold text-center">QUAL PARTE DA POSTAGEM DESEJA GERAR?</span>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => generatePostTextsWithAI('both')}
                      disabled={isGeneratingPost || !postBriefing.trim()}
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold uppercase font-mono text-[10px] rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {isGeneratingPost ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Gerando Post com IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Gerar Ambos (Texto + Imagem)
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => generatePostTextsWithAI('text')}
                        disabled={isGeneratingPost || !postBriefing.trim()}
                        className="py-1.5 bg-zinc-900 hover:bg-zinc-850 hover:text-yellow-500 border border-zinc-800 text-zinc-300 font-bold uppercase font-mono text-[9px] rounded-lg transition-all cursor-pointer disabled:opacity-45"
                      >
                        📝 Gerar Só Legenda
                      </button>
                      <button
                        type="button"
                        onClick={() => generatePostTextsWithAI('image')}
                        disabled={isGeneratingPost || !postBriefing.trim()}
                        className="py-1.5 bg-zinc-900 hover:bg-zinc-850 hover:text-yellow-500 border border-zinc-800 text-zinc-300 font-bold uppercase font-mono text-[9px] rounded-lg transition-all cursor-pointer disabled:opacity-45"
                      >
                        🖼️ Gerar Só Imagem
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Current Layout Configuration as a reusable Template */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-3 shadow-xl">
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-850">
                <span>📦</span> Salvar Modelo de Post (Templates)
              </h3>
              
              <div className="space-y-3 text-xs">
                <span className="text-[10px] text-zinc-500 font-sans block leading-relaxed">
                  Salve a configuração atual de formato, texto, imagem de base e legenda como um modelo pré-definido para solicitar modificações rápidas depois!
                </span>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Lançamento de Pod, Aviso Importante..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-300 transition cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>

                {/* Saved Templates listing shelf */}
                {savedTemplates.length > 0 ? (
                  <div className="pt-2 space-y-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-550 block uppercase tracking-wide">Meus Modelos Salvos ({savedTemplates.length})</span>
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {savedTemplates.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => handleLoadTemplate(tmpl)}
                          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-yellow-500/50 p-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition select-none"
                        >
                          <div className="text-left">
                            <span className="text-zinc-200 text-xs font-bold font-mono block leading-tight">{tmpl.name}</span>
                            <div className="flex gap-1.5 items-center mt-1 text-[9px] text-zinc-500 font-mono">
                              <span className="bg-zinc-900 px-1 py-0.5 rounded text-amber-500 uppercase">{tmpl.format}</span>
                              <span className="bg-zinc-900 px-1 py-0.5 rounded uppercase">{tmpl.preset}</span>
                              <span>{tmpl.createdAt}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTemplate(tmpl.id, e)}
                            className="text-zinc-600 hover:text-red-400 p-1.5 rounded hover:bg-zinc-900 transition-colors cursor-pointer animate-none"
                            title="Deletar Modelo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 bg-zinc-950/50 border border-dashed border-zinc-850 rounded-lg text-zinc-750">
                    <span className="text-[10px] font-mono block">Nenhum modelo salvo ainda</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Real-time Live Canvas & Text Tuning Panel */}
          <div className="lg:col-span-7 space-y-5 flex flex-col">
            {/* Visual Previewer split in Grid side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Real-time Canvas Display */}
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 text-center shadow-xl">
                <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-850 text-left">
                  🖼️ Visualizador em Tempo Real
                </h3>

                {/* Real-time Rendered Target Canvas container */}
                <div className="relative border border-zinc-850 bg-zinc-950 rounded-xl p-1 shadow-inner max-w-xs mx-auto overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto aspect-square rounded-lg border border-zinc-900 object-contain shadow-md mx-auto"
                    style={{
                      maxHeight: postFormat === 'feed' ? '280px' : '400px',
                      aspectRatio: postFormat === 'feed' ? '1/1' : '9/16'
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={downloadInstagramImage}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold uppercase font-mono text-xs rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  📥 Baixar Imagem PNG para Instagram
                </button>
              </div>

              {/* Box 2: Visual Instagram Caption text field */}
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-850 text-left">
                    ✍️ Legenda Sugerida para Instagram
                  </h3>

                  <textarea
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    rows={10}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-650 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-yellow-500 text-left"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(postCaption, 'post-caption')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-bold text-xs uppercase font-mono rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'post-caption' ? (
                      <>
                        <Check className="w-4 h-4 text-yellow-500 animate-pulse" />
                        Legenda Copiada com Sucesso!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Legenda do Instagram
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Fine-Tuning adjustment overrides (Manual edit of elements, immediate canvas repaint) */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-xl text-left">
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-850">
                🔧 Ajuste Manual / Edição Direta no Canvas (Visualizador Atualiza na Hora)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[9px] text-zinc-400 uppercase block mb-1 font-bold">Badge Superior (Subtitle)</label>
                  <input
                    type="text"
                    value={postSubtitle}
                    onChange={(e) => setPostSubtitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    placeholder="Ex: NOVIDADE"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 uppercase block mb-1 font-bold">Título da Arte (Impact Title)</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    placeholder="Ex: REABASTECIDO"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[9px] text-zinc-400 uppercase block mb-1 font-bold">Texto Curto Informativo na Imagem</label>
                  <textarea
                    value={postBodyText}
                    onChange={(e) => setPostBodyText(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-sans leading-relaxed"
                    placeholder="Ex: Os melhores vapes e essências importadas agora disponíveis para retirada na nossa sede."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 4: RESPOSTAS GOOGLE (LOCAL SEO RATING COORD)
         ==================================================== */}
      {activeSubTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left animate-fadeIn">
          {/* Review input parameters panel */}
          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-yellow-500 uppercase tracking-wider pb-2 border-b border-zinc-850 flex items-center gap-1.5">
                <span>⭐</span> Responder Avaliações do Google Meu Negócio
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Insira as avaliações que sua barbearia recebe no Google. Nossa IA criará respostas otimizadas para ranqueamento local que aumentam a relevância e atraem visualizações organicamente.
              </p>

              <div className="space-y-4 mt-4 text-xs">
                {/* Reviewer name and stars */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">Nome do Avaliador (Reviewer)</label>
                    <input
                      type="text"
                      placeholder="Ex: Alan Kardec"
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">Estrelas Recebidas</label>
                    <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg items-center justify-around h-[38px]">
                      {['1', '2', '3', '4', '5'].map(star => (
                        <button
                          key={star}
                          onClick={() => setRevRating(star)}
                          className={`text-xs px-2 py-0.5 rounded transition font-mono ${
                            revRating === star ? 'bg-yellow-500 text-black font-extrabold' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {star}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actual review feedback text */}
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">O que o cliente escreveu no Comentário?</label>
                  <textarea
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    placeholder="Ex: Melhor corte de cabelo e barba que já fiz. Além do mais, a tabacaria anexa tem pods excelentes com entrega rápida."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                {/* Directives from owner */}
                <div>
                  <label className="text-[9px] text-zinc-400 font-mono uppercase block mb-1">Gostaria de focar em algo na resposta?</label>
                  <input
                    type="text"
                    value={revDirectives}
                    onChange={(e) => setRevDirectives(e.target.value)}
                    placeholder="Ex: Convidar para fumar um charuto ou citar que aceitamos cartão e fechamos mais tarde"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-650"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={generateGoogleReviewReplyWithAI}
              disabled={isGeneratingReply || !revName.trim()}
              className="mt-4 w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-xs uppercase font-mono rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isGeneratingReply ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processando Resposta Otimizada...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Resposta Premium (SEO Google)
                </>
              )}
            </button>
          </div>

          {/* Generated view output with copy and regenerate options */}
          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-850 flex justify-between items-center">
                <span>📋 Resposta Otimizada pelo Gemini</span>
                {generatedReplyResult && (
                  <button
                    onClick={generateGoogleReviewReplyWithAI}
                    disabled={isGeneratingReply}
                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white font-mono cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                    Gerar Novamente
                  </button>
                )}
              </h3>

              {!generatedReplyResult ? (
                <div className="text-center py-28 text-zinc-650 font-mono text-xs">
                  Preencha o formulário e clique em gerar para ver a resposta que ajuda a posicionar sua empresa entre as melhores buscas locais.
                </div>
              ) : (
                <div className="mt-4 space-y-4 text-left">
                  <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-2 relative shadow-inner">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold tracking-wider uppercase block border-b border-zinc-900 pb-1.5 flex justify-between">
                      <span>Proposta de Resposta</span>
                      <span className="text-yellow-500 italic">SEO OTM</span>
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-1">
                      {generatedReplyResult}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard(generatedReplyResult, 'google-reply')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase font-mono rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {copiedKey === 'google-reply' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        Resposta Copiada com Sucesso!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Resposta Google
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="text-[10px] text-zinc-500 font-mono bg-zinc-950 p-3 border border-zinc-850 rounded-lg">
              🚀 <strong>Por que otimizar?</strong> Responder avaliações citando serviços e marcas de produtos (como pods específicos) diz ao algoritmo do Google que você é ativo nesses segmentos, ranqueando você melhor quando novos clientes buscarem esses produtos na região.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
