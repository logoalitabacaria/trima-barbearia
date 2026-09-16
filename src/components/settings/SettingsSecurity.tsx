/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Download, Upload, Trash2, AlertTriangle, Key } from 'lucide-react';

interface SettingsSecurityProps {
  handleBackupExport: () => void;
  handleBackupImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRestoringBackup: boolean;
  onClearSalesHistory?: () => Promise<void>;
  showClearSalesConfirm?: boolean;
  setShowClearSalesConfirm?: (val: boolean) => void;
  clearSalesPassword?: string;
  setClearSalesPassword?: (val: string) => void;
  clearSalesStatus?: string;
  clearSalesErrorMessage?: string;
  handleClearSalesHistory?: (e: React.FormEvent) => Promise<void>;
  onResetDatabase?: () => Promise<void>;
  showResetConfirm: boolean;
  setShowResetConfirm: (val: boolean) => void;
  resetConfirmPassword: string;
  setResetConfirmPassword: (val: string) => void;
  resetStatus: string;
  resetErrorMessage: string;
  handleResetDatabase: (e: React.FormEvent) => Promise<void>;
}

export default function SettingsSecurity({
  handleBackupExport,
  handleBackupImport,
  isRestoringBackup,
  onClearSalesHistory,
  showClearSalesConfirm,
  setShowClearSalesConfirm,
  clearSalesPassword,
  setClearSalesPassword,
  clearSalesStatus,
  clearSalesErrorMessage,
  handleClearSalesHistory,
  onResetDatabase,
  showResetConfirm,
  setShowResetConfirm,
  resetConfirmPassword,
  setResetConfirmPassword,
  resetStatus,
  resetErrorMessage,
  handleResetDatabase
}: SettingsSecurityProps) {
  return (
    <div className="space-y-6 text-left">
      {/* 1. BACKUP & RESTAURAÇÃO */}
      <div className="bg-[#101012] border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-yellow-500 border-b border-zinc-850 pb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-yellow-400" />
          Backup & Restauração Completa do Sistema
        </h4>
        <p className="text-xs text-zinc-400">
          Exporte uma cópia completa de segurança contendo todos os clientes, produtos, serviços, comandas e configurações em arquivo .json, ou restaure um backup anterior.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleBackupExport}
            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs font-mono rounded-xl transition cursor-pointer flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Backup Completo (.json)</span>
          </button>

          <div>
            <input
              id="backup-import-input"
              type="file"
              accept=".json"
              onChange={handleBackupImport}
              className="hidden"
            />
            <button
              type="button"
              disabled={isRestoringBackup}
              onClick={() => document.getElementById('backup-import-input')?.click()}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-xs font-mono font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-yellow-500" />
              <span>{isRestoringBackup ? 'Restaurando Arquivo...' : 'Restaurar do Arquivo (.json)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXCLUIR HISTÓRICO DE SERVIÇOS E PRODUTOS VENDIDOS (TESTES) */}
      {onClearSalesHistory && (
        <div className="bg-[#101012] border border-amber-950/60 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="border-b border-zinc-850 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-amber-400" />
              Excluir Histórico de Serviços & Produtos Vendidos (Zerar Relatórios)
            </h4>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
              Mantém Cadastros
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Exclui com segurança todo o histórico de <strong>comandas geradas, agendamentos, avaliações e movimentações financeiras de teste</strong>.
            <br />
            <span className="text-emerald-400 font-semibold font-mono text-[11px] block mt-1">
              ✓ Seus cadastros de serviços, produtos, barbeiros, clientes e configurações continuam 100% salvos e intocados!
            </span>
          </p>

          {!showClearSalesConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearSalesConfirm?.(true)}
              className="px-4 py-2.5 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800 text-amber-300 font-mono font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Excluir Histórico de Vendas de Teste</span>
            </button>
          ) : (
            <form onSubmit={handleClearSalesHistory} className="bg-zinc-950 border border-amber-900/70 p-4 rounded-xl space-y-3 max-w-md animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>CONFIRMAÇÃO COM SENHA DE ADMINISTRADOR</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Digite a senha de administrador (<strong>admin123</strong>) para confirmar a exclusão do histórico de vendas e comandas:
              </p>

              <input
                type="password"
                required
                value={clearSalesPassword || ''}
                onChange={(e) => setClearSalesPassword?.(e.target.value)}
                placeholder="Senha de confirmação..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
              />

              {clearSalesErrorMessage && (
                <p className="text-[11px] text-red-400 font-mono">{clearSalesErrorMessage}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={clearSalesStatus === 'clearing'}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-mono font-black text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  {clearSalesStatus === 'clearing' ? 'Excluindo Vendas...' : 'Confirmar e Limpar Vendas'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearSalesConfirm?.(false)}
                  className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-mono text-xs rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {clearSalesStatus === 'done' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono">
              ✓ Histórico de vendas, comandas e atendimentos de teste excluído com sucesso! Os relatórios estão zerados e seus cadastros preservados.
            </div>
          )}
        </div>
      )}

      {/* 3. RESET DO BANCO DE DADOS */}
      {onResetDatabase && (
        <div className="bg-[#101012] border border-red-950/50 p-5 sm:p-6 rounded-2xl space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-red-500 border-b border-zinc-850 pb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            Zerar Banco de Dados para Produção (Ação Irreversível)
          </h4>
          <p className="text-xs text-zinc-400">
            Limpa todas as comandas de teste, agendamentos, avaliações e movimentações do caixa no Firestore para iniciar a operação real da barbearia. Os cadastros de serviços, produtos e parâmetros do negócio serão preservados.
          </p>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 font-mono font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Zerar Dados de Teste</span>
            </button>
          ) : (
            <form onSubmit={handleResetDatabase} className="bg-zinc-950 border border-red-900/60 p-4 rounded-xl space-y-3 max-w-md animate-fadeIn">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>CONFIRMAÇÃO DE SEGURANÇA</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Digite a senha mestre de administrador (<strong>admin123</strong>) para confirmar a exclusão dos dados de teste:
              </p>

              <input
                type="password"
                required
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder="Senha de confirmação..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-red-500 outline-none"
              />

              {resetErrorMessage && (
                <p className="text-[11px] text-red-400 font-mono">{resetErrorMessage}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={resetStatus === 'resetting'}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  {resetStatus === 'resetting' ? 'Limpando...' : 'Confirmar e Zerar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-mono text-xs rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {resetStatus === 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono">
              ✓ Banco de dados limpo com sucesso para início de produção!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
