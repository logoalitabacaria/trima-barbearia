/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, UserPlus, Shield, UserCheck, HelpCircle } from 'lucide-react';
import { User, UserRole, SystemParameters } from '../types';

function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/[^\d]+/g, '');
  if (clean.length !== 11) return false;
  
  // Exclude known repetitive digit CPFs
  if (/^(\d)\1{10}$/.test(clean)) return false;
  
  // 1st digit validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;
  
  // 2nd digit validation
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;
  
  return true;
}

const formatCPF = (value: string): string => {
  const clean = value.replace(/[^\d]+/g, '');
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
};

interface LoginScreenProps {
  users: User[];
  parameters?: SystemParameters;
  onLogin: (user: User) => void;
  onRegisterClient: (name: string, phone: string, login: string, password: string, referralCode?: string) => void;
  onClose?: () => void;
}

export default function LoginScreen({ users, parameters, onLogin, onRegisterClient, onClose }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLogin, setRegLogin] = useState(''); // Stores CPF
  const [regPassword, setRegPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!login || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const cleanInput = login.trim();
    const cleanDigits = cleanInput.replace(/[^\d]+/g, '');

    // 1. Match exact (for admin/barbers by login or email)
    let foundUser = users.find(
      u => (u.login?.toLowerCase() === cleanInput.toLowerCase() || u.email?.toLowerCase() === cleanInput.toLowerCase()) && u.password === password
    );

    // 2. If not found, match by clean CPF digits (for customers)
    if (!foundUser && cleanDigits.length === 11) {
      foundUser = users.find(u => {
        const uClean = u.login?.replace(/[^\d]+/g, '') || '';
        return uClean === cleanDigits && u.password === password;
      });
    }

    if (!foundUser) {
      setError('CPF, Usuário ou senha incorretos.');
      return;
    }

    if (!foundUser.isActive) {
      setError('Esta conta está bloqueada pelo administrador.');
      return;
    }

    onLogin(foundUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegSuccess('');

    if (!regName || !regPhone || !regLogin || !regPassword) {
      setError('Preencha os campos obrigatórios para o cadastro.');
      return;
    }

    const cleanCPF = regLogin.replace(/[^\d]+/g, '');
    if (!validateCPF(cleanCPF)) {
      setError('CPF inválido! O CPF fornecido não é válido segundo o algoritmo oficial.');
      return;
    }

    if (regPassword.length < 6) {
      setError('A senha criada precisa conter pelo menos 6 dígitos/caracteres.');
      return;
    }

    // Check collision on clean digits
    const collision = users.find(u => {
      const uClean = u.login?.replace(/[^\d]+/g, '') || '';
      return uClean === cleanCPF;
    });

    if (collision) {
      setError('Este CPF já está registrado no sistema.');
      return;
    }

    // Register with formatted CPF and referral code
    onRegisterClient(regName, regPhone, formatCPF(cleanCPF), regPassword, regReferralCode.trim().toUpperCase());
    setRegSuccess('Sua conta foi criada com sucesso! Carregando estúdio...');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setRegLogin(formatted);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-yellow-500 hover:bg-zinc-800 text-xs font-mono font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition"
        >
          ← Continuar Navegando (Modo Visitante)
        </button>
      )}

      {/* Branded Title Section */}
      <div className="text-center mb-8 max-w-md flex flex-col items-center gap-3">
        {parameters?.logoUrl && (
          <img src={parameters.logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded-2xl mb-2 border border-zinc-800" referrerPolicy="no-referrer" />
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-yellow-500 font-sans uppercase">
          {parameters?.shopName ? (
            <span>{parameters.shopName}</span>
          ) : (
            <>Trima <span className="text-white">Studio</span></>
          )}
        </h1>
        <p className="mt-2 text-xs text-zinc-400 uppercase tracking-widest font-mono">
          Estilo, Cerveja Gelada & Tabacaria
        </p>
      </div>

      <div className="w-full max-w-md bg-[#0F0F11] border-2 border-yellow-500/35 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-500/5">
        <div className="px-6 py-8">
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase font-mono ${
                !isRegisterMode ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase font-mono ${
                isRegisterMode ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500'
              }`}
            >
              Agendar Online (Cadastrar)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {regSuccess && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <span className="text-sm">✓</span>
              <p>{regSuccess}</p>
            </div>
          )}

          {!isRegisterMode ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  CPF ou Usuário de Login
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Ex: 123.456.789-00 ou seu e-mail"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Senha Secreta
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm tracking-wider uppercase py-3 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-yellow-500/10"
              >
                Acessar Sistema
              </button>
            </form>
          ) : (
            /* SIMPLE SIGN-UP FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  WhatsApp / Celular com DDD *
                </label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                    CPF (Documento) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regLogin}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                    Senha (mínimo 6 dígitos) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-wider font-mono text-amber-400 block uppercase mb-1 flex items-center justify-between">
                  <span>Código de Indicação (Opcional) 🎁</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Receba Desconto</span>
                </label>
                <input
                  type="text"
                  value={regReferralCode}
                  onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                  placeholder="Ex: TRIMA-1234 ou código do seu amigo"
                  className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition uppercase"
                />
              </div>

              <p className="text-[10px] text-zinc-500 italic text-center">
                * Cadastro super simplificado e imediato para começar a agendar.
              </p>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm tracking-wider uppercase py-3 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-yellow-500/10"
              >
                Cadastrar & Acessar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
