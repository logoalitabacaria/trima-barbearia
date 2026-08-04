/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Scissors, Calendar, Settings, Coins, LogOut, Wallet, UserCheck, Shield, HelpCircle, ArrowRight
} from 'lucide-react';
import { getSavedState, saveState } from './data';
import { User, UserRole, Service, Product, LoyaltyPlan, CustomerSubscription, Appointment, Comanda, SystemParameters } from './types';
import { loadStateFromFirestore, saveDocumentToFirestore, deleteDocumentFromFirestore, clearDatabaseToProduction, subscribeToFirestoreState } from './firebase';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import BarberPanel from './components/BarberPanel';
import CustomerPanel from './components/CustomerPanel';
import CashierPanel from './components/CashierPanel';
import ManualModal from './components/ManualModal';

export default function App() {
  // Global State (persisted inside localStorage)
  const [state, setState] = useState(() => getSavedState());

  // Firestore DB connection state - start false if local cache exists for instant mobile/desktop access
  const [isLoadingDb, setIsLoadingDb] = useState(() => !getSavedState().users || getSavedState().users.length === 0);

  // Authenticated Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('logo_ali_b2_logged_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sync with freshest user record
        const freshState = getSavedState();
        const freshUser = freshState.users?.find((u: any) => u.id === parsed.id);
        if (freshUser) {
          return freshUser;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  // Login modal toggle state for Guest mode
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Navigation tab route state
  const [activeTab, setActiveTab] = useState<string>('');
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Guest dummy user profile for unauthenticated visitors
  const guestUser: User = {
    id: 'guest-user',
    name: 'Visitante',
    email: 'visitante@logoalibarber.com',
    role: 'CUSTOMER',
    isActive: true,
    avatar: '👋',
    login: 'guest',
    password: ''
  };

  // Load from Firestore on mount & attach real-time multi-device listeners
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function syncFromDb() {
      try {
        const dbState = await loadStateFromFirestore();
        if (dbState) {
          setState(dbState);
          // Sync current logged-in user profile, if any
          if (currentUser) {
            const freshUser = dbState.users.find((u: any) => u.id === currentUser.id);
            if (freshUser) {
              setCurrentUser(freshUser);
            } else {
              setCurrentUser(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load state from Firestore:", err);
      } finally {
        setIsLoadingDb(false);
      }

      // Attach real-time snapshot listener (synchronizes mobile phone, computer, and cashier live)
      unsubscribe = subscribeToFirestoreState((updatedChunk) => {
        setState(prev => {
          const nextState = { ...prev, ...updatedChunk };
          saveState(nextState);
          return nextState;
        });
      });
    }

    syncFromDb();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Save changes automatically as a local backup
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync logged user profile details safely back to storage when edited
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('logo_ali_b2_logged_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('logo_ali_b2_logged_user');
    }
  }, [currentUser]);

  // Adjust routing tabs automatically according to logged permissions
  useEffect(() => {
    if (currentUser) {
      const perms = currentUser.permissions || [];
      const canAccessAdmin = currentUser.role === 'ADMIN' || perms.some(p => [
        'MANAGE_SUPPLIES', 'VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_CATALOG', 'MANAGE_PLANS', 'MANAGE_PARAMETERS'
      ].includes(p));
      const canAccessBarber = currentUser.role === 'ADMIN' || currentUser.role === 'BARBER' || perms.includes('MANAGE_APPOINTMENTS') || perms.includes('EDIT_COMANDAS');
      const canAccessCaixa = currentUser.role === 'ADMIN' || currentUser.role === 'CASHIER' || perms.includes('CHECKOUT_COMANDAS');

      if (currentUser.role === 'ADMIN') {
        setActiveTab('admin');
      } else if (currentUser.role === 'BARBER') {
        setActiveTab('barbeiro');
      } else if (currentUser.role === 'CASHIER') {
        setActiveTab('caixa');
      } else if (canAccessAdmin) {
        setActiveTab('admin');
      } else if (canAccessBarber) {
        setActiveTab('barbeiro');
      } else if (canAccessCaixa) {
        setActiveTab('caixa');
      } else {
        setActiveTab('cliente');
      }
    } else {
      setActiveTab('');
    }
  }, [currentUser]);

  // Helper trigger to update state chunks easily and sync to Firestore
  const handleUpdateState = async (key: string, val: any) => {
    let previousList: any[] = [];

    // 1. Update React state immediately and backup to localStorage
    setState(prev => {
      previousList = (prev[key as keyof typeof prev] as any[]) || [];
      const nextState = {
        ...prev,
        [key]: val
      };
      saveState(nextState);
      return nextState;
    });

    // 2. Perform background write to Cloud Firestore
    try {
      if (key === 'parameters') {
        await saveDocumentToFirestore('parameters', 'system', val);
      } else if (key === 'categories') {
        await saveDocumentToFirestore('categories', 'list', { values: val });
      } else {
        const newList = val as any[];

        // Save new or updated items
        if (newList && Array.isArray(newList)) {
          for (const item of newList) {
            if (item) {
              const docId = item.id || (key === 'barberDetails' ? item.userId : '');
              if (docId) {
                await saveDocumentToFirestore(key, docId, item);
              }
            }
          }
        }

        // Delete removed items
        const newIds = new Set(newList.map(item => item.id || (key === 'barberDetails' ? item.userId : '')));
        if (previousList && Array.isArray(previousList)) {
          for (const oldItem of previousList) {
            const oldId = oldItem.id || (key === 'barberDetails' ? oldItem.userId : '');
            if (oldId && !newIds.has(oldId)) {
              await deleteDocumentFromFirestore(key, oldId);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error updating Firestore collection:", err, key);
    }
  };

  // HANDLERS
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Client Registration with referral code & instant auto-login!
  const handleRegisterClient = (name: string, phone: string, login_user: string, secret_pass: string, referredByCode?: string) => {
    const newId = `cli-${Date.now()}`;
    const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'CLI';
    const myReferralCode = `TRIMA-${cleanName}${Math.floor(1000 + Math.random() * 9000)}`;

    const newCustomerUser: User = {
      id: newId,
      name: name,
      email: `${login_user.replace(/[^\d]+/g, '')}@logoalibarber.com`,
      role: 'CUSTOMER',
      phone: phone,
      isActive: true,
      avatar: '👨',
      login: login_user.toLowerCase().trim(),
      password: secret_pass,
      permissions: ['CUSTOMER_PORTAL'],
      referralCode: myReferralCode,
      referredByCode: referredByCode ? referredByCode.trim().toUpperCase() : undefined
    };

    // Update global user array
    const updatedUsersList = [...state.users, newCustomerUser];
    handleUpdateState('users', updatedUsersList);

    // Auto-login!
    setTimeout(() => {
      setCurrentUser(newCustomerUser);
    }, 300);
  };

  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center font-sans">
        <div className="text-center space-y-4">
          {state.parameters?.logoUrl ? (
            <img src={state.parameters.logoUrl} alt="Logo" className="h-16 w-16 mx-auto object-contain rounded-xl animate-pulse" referrerPolicy="no-referrer" />
          ) : (
            <div className="text-3xl bg-yellow-500 text-black p-3.5 rounded-xl font-black font-mono inline-block animate-pulse">
              LA
            </div>
          )}
          <h2 className="text-lg font-extrabold uppercase tracking-widest text-yellow-500">
            {state.parameters?.shopName || 'Trima Studio'}
          </h2>
          <p className="text-xs text-zinc-400 uppercase font-mono tracking-wider">
            Conectando ao Banco de Dados Firestore...
          </p>
          <div className="flex justify-center items-center pt-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-black">
      {/* Enforce custom administrator theme accent colors */}
      <style>{`
        :root {
          --primary-color: ${state.parameters?.primaryColor || '#eab308'};
        }
        body, html, .min-h-screen, .bg-black {
          background-color: ${state.parameters?.backgroundColor || '#000000'} !important;
        }
        .bg-yellow-500 {
          background-color: var(--primary-color) !important;
        }
        .hover\\:bg-yellow-600:hover {
          background-color: var(--primary-color) !important;
          filter: brightness(0.9);
        }
        .text-yellow-500 {
          color: var(--primary-color) !important;
        }
        .border-yellow-500 {
          border-color: var(--primary-color) !important;
        }
        .bg-yellow-500\\/10 {
          background-color: ${state.parameters?.primaryColor || '#eab308'}1a !important;
        }
        .bg-yellow-500\\/5 {
          background-color: ${state.parameters?.primaryColor || '#eab308'}0d !important;
        }
        .border-yellow-500\\/40 {
          border-color: ${state.parameters?.primaryColor || '#eab308'}66 !important;
        }
        .border-yellow-500\\/30 {
          border-color: ${state.parameters?.primaryColor || '#eab308'}4d !important;
        }
        .shadow-yellow-500\\/5 {
          --tw-shadow-color: ${state.parameters?.primaryColor || '#eab308'}0d !important;
        }
        .shadow-yellow-500\\/10 {
          --tw-shadow-color: ${state.parameters?.primaryColor || '#eab308'}1a !important;
        }
      `}</style>
      
      {/* 1. AUTH SWITCH OR GUEST PORTAL MODE */}
      {!currentUser && showLoginModal ? (
        <LoginScreen
          users={state.users}
          parameters={state.parameters || undefined}
          onLogin={(user) => {
            handleLogin(user);
            setShowLoginModal(false);
          }}
          onRegisterClient={(name, phone, login, password, referralCode) => {
            handleRegisterClient(name, phone, login, password, referralCode);
            setShowLoginModal(false);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      ) : (
        /* MAIN BODY WRAPPER (LOGGED OR GUEST MODE) */
        <div className="flex-1 flex flex-col">
          
          {/* HEADER MAIN BRANDING */}
          <header className="bg-black border-b border-zinc-850 px-4 py-3.5 sm:px-6 lg:px-8 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5 text-left">
              {state.parameters?.logoUrl ? (
                <img src={state.parameters.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-lg border border-zinc-805" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl bg-yellow-500 text-black p-1.5 rounded-lg font-black font-mono">LA</span>
              )}
              <div>
                <h1 className="text-sm font-extrabold tracking-tight uppercase text-yellow-500">
                  {state.parameters?.shopName ? (
                    <span>{state.parameters.shopName}</span>
                  ) : (
                    <>Trima <span className="text-white">Studio</span></>
                  )}
                </h1>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">
                  Sempre em Boa Companhia
                </p>
              </div>
            </div>

            {/* Profile widget / Login Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white">{currentUser.name}</span>
                  <span className="text-[10px] text-yellow-500 font-mono uppercase font-semibold">
                    Perfil: {currentUser.role}
                  </span>
                </div>
                <span className="text-xl bg-zinc-900 border border-zinc-800 p-1 px-2 rounded-lg">
                  {currentUser.avatar || '👤'}
                </span>
                <button
                  onClick={() => setIsManualOpen(true)}
                  className="px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg transition cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5"
                  title="Abrir Manual do Sistema"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Manual</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-[11px] uppercase font-mono rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Entrar / Cadastrar
                </button>
              </div>
            )}
          </header>

          {/* DYNAMIC PERMISSIONS TAB SELECTOR (TAB RAIL) */}
          {currentUser && (() => {
            const perms = currentUser.permissions || [];
            const canAccessAdmin = currentUser.role === 'ADMIN' || perms.some(p => [
              'MANAGE_SUPPLIES', 'VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_CATALOG', 'MANAGE_PLANS', 'MANAGE_PARAMETERS'
            ].includes(p));
            const canAccessBarber = currentUser.role === 'ADMIN' || currentUser.role === 'BARBER' || perms.includes('MANAGE_APPOINTMENTS') || perms.includes('EDIT_COMANDAS');
            const canAccessCaixa = currentUser.role === 'ADMIN' || currentUser.role === 'CASHIER' || perms.includes('CHECKOUT_COMANDAS');
            const canAccessCustomer = currentUser.role === 'ADMIN' || currentUser.role === 'CUSTOMER' || perms.includes('CUSTOMER_PORTAL');

            return (
              <nav className="bg-[#0A0A0C] border-b border-zinc-850/80 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap gap-2 text-xs font-medium">
                {canAccessAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition cursor-pointer ${
                      activeTab === 'admin' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {currentUser.role === 'ADMIN' ? '👑 Configuração & Administração' : '📦 Gestão & Suprimentos'}
                  </button>
                )}

                {canAccessBarber && (
                  <button
                    onClick={() => setActiveTab('barbeiro')}
                    className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition cursor-pointer ${
                      activeTab === 'barbeiro' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    🧔 Minha Agenda & Comandas
                  </button>
                )}

                {canAccessCaixa && (
                  <button
                    onClick={() => setActiveTab('caixa')}
                    className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition cursor-pointer ${
                      activeTab === 'caixa' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    💼 Balcão do Caixa
                  </button>
                )}

                {canAccessCustomer && (
                  <button
                    onClick={() => setActiveTab('cliente')}
                    className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition cursor-pointer ${
                      activeTab === 'cliente' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    👤 Visão Cliente
                  </button>
                )}
              </nav>
            );
          })()}

          {/* MAIN MODULE LOADER VIEWS */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full pb-20">
            {!currentUser ? (
              <CustomerPanel
                currentCustomer={guestUser}
                users={state.users}
                services={state.services}
                plans={state.plans}
                appointments={state.appointments}
                subscriptions={state.subscriptions}
                parameters={state.parameters}
                npsFeedbacks={state.npsFeedbacks || []}
                onUpdateState={handleUpdateState}
                isGuestMode={true}
                onOpenLoginModal={() => setShowLoginModal(true)}
              />
            ) : (() => {
              const perms = currentUser.permissions || [];
              const canAccessAdmin = currentUser.role === 'ADMIN' || perms.some(p => [
                'MANAGE_SUPPLIES', 'VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_CATALOG', 'MANAGE_PLANS', 'MANAGE_PARAMETERS'
              ].includes(p));
              const canAccessBarber = currentUser.role === 'ADMIN' || currentUser.role === 'BARBER' || perms.includes('MANAGE_APPOINTMENTS') || perms.includes('EDIT_COMANDAS');
              const canAccessCaixa = currentUser.role === 'ADMIN' || currentUser.role === 'CASHIER' || perms.includes('CHECKOUT_COMANDAS');
              const canAccessCustomer = currentUser.role === 'ADMIN' || currentUser.role === 'CUSTOMER' || perms.includes('CUSTOMER_PORTAL');

              return (
                <>
                  {activeTab === 'admin' && canAccessAdmin && (
                    <AdminPanel
                      currentUser={currentUser}
                      users={state.users}
                      services={state.services}
                      products={state.products}
                      plans={state.plans}
                      barberDetails={state.barberDetails}
                      comandas={state.comandas}
                      appointments={state.appointments}
                      parameters={state.parameters}
                      categories={state.categories || ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']}
                      supplyTransactions={state.supplyTransactions || []}
                      npsFeedbacks={state.npsFeedbacks || []}
                      onUpdateState={handleUpdateState}
                      onResetDatabase={async () => {
                        setIsLoadingDb(true);
                        await clearDatabaseToProduction();
                        const dbState = await loadStateFromFirestore();
                        if (dbState) {
                          setState(dbState);
                        }
                        setCurrentUser(null);
                        localStorage.removeItem('logo_ali_b2_logged_user');
                        setIsLoadingDb(false);
                      }}
                    />
                  )}

                  {activeTab === 'barbeiro' && canAccessBarber && (
                    <BarberPanel
                      currentBarber={currentUser}
                      users={state.users}
                      services={state.services}
                      products={state.products}
                      appointments={state.appointments}
                      comandas={state.comandas}
                      subscriptions={state.subscriptions || []}
                      barberDetails={state.barberDetails || []}
                      parameters={state.parameters}
                      onUpdateState={handleUpdateState}
                    />
                  )}

                  {activeTab === 'caixa' && canAccessCaixa && (
                    <CashierPanel
                      currentUser={currentUser}
                      comandas={state.comandas}
                      users={state.users}
                      barberDetails={state.barberDetails}
                      subscriptions={state.subscriptions}
                      appointments={state.appointments}
                      parameters={state.parameters}
                      onUpdateState={handleUpdateState}
                    />
                  )}

                  {activeTab === 'cliente' && canAccessCustomer && (
                    <CustomerPanel
                      currentCustomer={currentUser}
                      users={state.users}
                      services={state.services}
                      plans={state.plans}
                      appointments={state.appointments}
                      subscriptions={state.subscriptions}
                      parameters={state.parameters}
                      npsFeedbacks={state.npsFeedbacks || []}
                      onUpdateState={handleUpdateState}
                    />
                  )}
                </>
              );
            })()}
          </main>

          <ManualModal
            isOpen={isManualOpen}
            onClose={() => setIsManualOpen(false)}
            defaultRole={currentUser?.role || 'ADMIN'}
          />

        </div>
      )}

    </div>
  );
}
