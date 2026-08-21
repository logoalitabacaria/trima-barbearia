/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, Eye, EyeOff, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface PasswordChangeModalProps {
  currentUser: User;
  isOpen: boolean;
  isMandatory: boolean;
  onSavePassword: (newPassword: string) => void;
  onClose: () => void;
}

export function PasswordChangeModal({
  currentUser,
  isOpen,
  isMandatory,
  onSavePassword,
  onClose
}: PasswordChangeModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedNew) {
      setErrorMsg('Por favor, informe a nova senha.');
      return;
    }

    if (trimmedNew.length < 4) {
      setErrorMsg('A senha deve conter no mínimo 4 caracteres para sua segurança.');
      return;
    }

    if (trimmedNew === currentUser.password && isMandatory) {
      setErrorMsg('A nova senha deve ser diferente da senha padrão inicial.');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setErrorMsg('As senhas digitadas não coincidem. Verifique a confirmação.');
      return;
    }

    setSuccessMsg('Senha atualizada com sucesso!');
    setTimeout(() => {
      onSavePassword(trimmedNew);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="password-change-modal"
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-left relative"
      >
        {/* Close button only available if NOT mandatory */}
        {!isMandatory && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-start gap-3.5 border-b border-zinc-850 pb-4">
          <div className={`p-3 rounded-xl ${isMandatory ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-zinc-900 text-yellow-400 border border-zinc-800'}`}>
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              {isMandatory ? 'Primeiro Acesso: Definição de Senha' : 'Alterar Senha de Acesso'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {isMandatory
                ? `Olá, ${currentUser.name}! Como este é o seu primeiro acesso ao sistema com senha padrão, cadastre sua senha pessoal e confidencial para continuar.`
                : `Olá, ${currentUser.name}! Defina sua nova senha de acesso.`}
            </p>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">Usuário / Login:</span>
          <span className="text-yellow-400 font-bold">{currentUser.login || currentUser.name} ({currentUser.role})</span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide block mb-1.5">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide block mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition"
            />
          </div>

          {/* Security Recommendations */}
          <div className="space-y-1.5 pt-1 text-[11px] text-zinc-500 font-sans">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Sua senha é protegida e criptografada com segurança.</span>
            </div>
            {isMandatory && (
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                <span>Outros administradores não têm visibilidade da sua nova senha.</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-mono font-extrabold uppercase rounded-xl transition cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Salvar Nova Senha</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
