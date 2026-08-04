import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  INITIAL_SYSTEM_PARAMETERS,
  INITIAL_USERS,
  INITIAL_BARBER_DETAILS,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_COMANDAS,
  getSavedState
} from './data';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test Connection (Critical requirement)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Recursively clean objects before sending to Firestore (removes undefined fields which break setDoc)
export function sanitizeData(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = sanitizeData(obj[key]);
    }
  }
  return cleaned;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// DB State Sync Functions
// ----------------------------------------------------

export async function loadStateFromFirestore() {
  try {
    const savedLocal = getSavedState();

    // 1. Fetch Users
    const usersSnap = await getDocs(collection(db, 'users')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      return { docs: [] };
    });
    let usersList = usersSnap.docs.map(d => d.data());

    // 2. Fetch Barber Details
    const bSnap = await getDocs(collection(db, 'barberDetails')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'barberDetails');
      return { docs: [] };
    });
    let barberDetailsList = bSnap.docs.map(d => d.data());

    // 3. Fetch Services
    const sSnap = await getDocs(collection(db, 'services')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'services');
      return { docs: [] };
    });
    let servicesList = sSnap.docs.map(d => d.data());

    // 4. Fetch Products
    const pSnap = await getDocs(collection(db, 'products')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'products');
      return { docs: [] };
    });
    let productsList = pSnap.docs.map(d => d.data());

    // 5. Fetch Plans
    const plSnap = await getDocs(collection(db, 'plans')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'plans');
      return { docs: [] };
    });
    let plansList = plSnap.docs.map(d => d.data());

    // 6. Fetch Subscriptions
    const subSnap = await getDocs(collection(db, 'subscriptions')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'subscriptions');
      return { docs: [] };
    });
    let subscriptionsList = subSnap.docs.map(d => d.data());

    // 7. Fetch Appointments
    const aptSnap = await getDocs(collection(db, 'appointments')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'appointments');
      return { docs: [] };
    });
    let appointmentsList = aptSnap.docs.map(d => d.data());

    // 8. Fetch Comandas
    const cmdSnap = await getDocs(collection(db, 'comandas')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'comandas');
      return { docs: [] };
    });
    let comandasList = cmdSnap.docs.map(d => d.data());

    // 9. Fetch Supply Transactions
    const supSnap = await getDocs(collection(db, 'supplyTransactions')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'supplyTransactions');
      return { docs: [] };
    });
    let supplyTransactionsList = supSnap.docs.map(d => d.data());

    // 10. Fetch parameters
    const paramDoc = await getDoc(doc(db, 'parameters', 'system')).catch(err => {
      handleFirestoreError(err, OperationType.GET, 'parameters/system');
    });
    let parametersData = paramDoc && paramDoc.exists() ? paramDoc.data() : null;

    // 11. Fetch categories
    const catDoc = await getDoc(doc(db, 'categories', 'list')).catch(err => {
      handleFirestoreError(err, OperationType.GET, 'categories/list');
    });
    let categoriesList = catDoc && catDoc.exists() ? catDoc.data().values : null;

    // 12. Fetch NPS Feedbacks
    const npsSnap = await getDocs(collection(db, 'npsFeedbacks')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'npsFeedbacks');
      return { docs: [] };
    });
    let npsFeedbacksList = npsSnap.docs.map(d => d.data());

    // Merge with localStorage if Firestore was empty for certain collections
    const finalUsers = usersList.length > 0 ? usersList : (savedLocal.users || []);
    const finalBarberDetails = barberDetailsList.length > 0 ? barberDetailsList : (savedLocal.barberDetails || []);
    const finalServices = servicesList.length > 0 ? servicesList : (savedLocal.services || []);
    const finalProducts = productsList.length > 0 ? productsList : (savedLocal.products || []);
    const finalPlans = plansList.length > 0 ? plansList : (savedLocal.plans || []);
    const finalSubscriptions = subscriptionsList.length > 0 ? subscriptionsList : (savedLocal.subscriptions || []);
    const finalAppointments = appointmentsList.length > 0 ? appointmentsList : (savedLocal.appointments || []);
    const finalComandas = comandasList.length > 0 ? comandasList : (savedLocal.comandas || []);
    const finalSupplyTransactions = supplyTransactionsList.length > 0 ? supplyTransactionsList : (savedLocal.supplyTransactions || []);
    const finalNpsFeedbacks = npsFeedbacksList.length > 0 ? npsFeedbacksList : (savedLocal.npsFeedbacks || []);

    // FORCE ENSURE MAIN ADMIN IS ALWAYS PRESENT
    const adminObj = {
      id: 'usr-admin',
      name: 'Wagner Barrera Moreno',
      email: 'wagnerbmoreno@gmail.com',
      role: 'ADMIN',
      phone: '(11) 99999-9999',
      isActive: true,
      avatar: '👑',
      login: 'wagnerbmoreno@gmail.com',
      password: 'Wag01121201!',
      permissions: ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL', 'DAILY_FACILITATOR']
    };
    const hasAdmin = finalUsers.some((u: any) => u.id === 'usr-admin' || u.login === 'wagnerbmoreno@gmail.com');
    if (!hasAdmin) {
      finalUsers.unshift(adminObj);
    }
    await saveDocumentToFirestore('users', 'usr-admin', adminObj);

    // Sync records to Firestore if Firestore had 0 items but local storage had data
    if (usersList.length === 0 && finalUsers.length > 0) {
      for (const u of finalUsers) {
        if (u.id) await saveDocumentToFirestore('users', u.id, u);
      }
    }
    if (servicesList.length === 0 && finalServices.length > 0) {
      for (const s of finalServices) {
        if (s.id) await saveDocumentToFirestore('services', s.id, s);
      }
    }
    if (productsList.length === 0 && finalProducts.length > 0) {
      for (const p of finalProducts) {
        if (p.id) await saveDocumentToFirestore('products', p.id, p);
      }
    }
    if (barberDetailsList.length === 0 && finalBarberDetails.length > 0) {
      for (const b of finalBarberDetails) {
        if (b.userId) await saveDocumentToFirestore('barberDetails', b.userId, b);
      }
    }

    return {
      users: finalUsers,
      barberDetails: finalBarberDetails,
      services: finalServices,
      products: finalProducts,
      plans: finalPlans,
      subscriptions: finalSubscriptions,
      appointments: finalAppointments,
      comandas: finalComandas,
      supplyTransactions: finalSupplyTransactions,
      npsFeedbacks: finalNpsFeedbacks,
      parameters: parametersData || savedLocal.parameters || INITIAL_SYSTEM_PARAMETERS,
      categories: categoriesList || savedLocal.categories || ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']
    };
  } catch (error) {
    console.error("Error loading Firestore state:", error);
    return getSavedState();
  }
}

// Write the INITIAL values to clean databases
async function bootstrapEmptyDb() {
  try {
    for (const u of INITIAL_USERS) {
      await saveDocumentToFirestore('users', u.id, u);
    }
    for (const b of INITIAL_BARBER_DETAILS) {
      await saveDocumentToFirestore('barberDetails', b.userId, b);
    }
    for (const s of INITIAL_SERVICES) {
      await saveDocumentToFirestore('services', s.id, s);
    }
    for (const p of INITIAL_PRODUCTS) {
      await saveDocumentToFirestore('products', p.id, p);
    }
    for (const pl of INITIAL_PLANS) {
      await saveDocumentToFirestore('plans', pl.id, pl);
    }
    for (const sub of INITIAL_SUBSCRIPTIONS) {
      await saveDocumentToFirestore('subscriptions', sub.id, sub);
    }
    for (const apt of INITIAL_APPOINTMENTS) {
      await saveDocumentToFirestore('appointments', apt.id, apt);
    }
    for (const cmd of INITIAL_COMANDAS) {
      await saveDocumentToFirestore('comandas', cmd.id, cmd);
    }
    await saveDocumentToFirestore('parameters', 'system', INITIAL_SYSTEM_PARAMETERS);
    await saveDocumentToFirestore('categories', 'list', { values: ['HAIR', 'BEARD', 'COMBO', 'TREATMENT'] });
    console.log("Bootstrapped successfully to Firestore!");
  } catch (error) {
    console.error("Bootstrap error:", error);
  }
}

// Sync updates to Firestore
export async function saveDocumentToFirestore(collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, collectionName, id);
    const cleanData = sanitizeData(data);
    await setDoc(docRef, cleanData);
  } catch (err) {
    console.error(`Error saving to Firestore [${collectionName}/${id}]:`, err);
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${id}`);
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting from Firestore [${collectionName}/${id}]:`, err);
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// Clear all simulation records and reset Firestore + local state to clean production defaults
export async function clearDatabaseToProduction() {
  const collectionsToClear = ['users', 'barberDetails', 'services', 'products', 'plans', 'subscriptions', 'appointments', 'comandas', 'supplyTransactions'];
  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        if (colName === 'users' && d.id === 'usr-admin') {
          continue;
        }
        await deleteDoc(doc(db, colName, d.id));
      }
    } catch (e) {
      console.error(`Error clearing collection ${colName}:`, e);
    }
  }

  // Restore main admin to users
  const adminObj = INITIAL_USERS.find(u => u.id === 'usr-admin') || {
    id: 'usr-admin',
    name: 'Wagner Barrera Moreno',
    email: 'wagnerbmoreno@gmail.com',
    role: 'ADMIN',
    phone: '(11) 99999-9999',
    isActive: true,
    avatar: '👑',
    login: 'wagnerbmoreno@gmail.com',
    password: 'Wag01121201!',
    permissions: ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL', 'DAILY_FACILITATOR']
  };
  await saveDocumentToFirestore('users', 'usr-admin', adminObj);

  // Set parameters and categories to standard default
  await saveDocumentToFirestore('parameters', 'system', INITIAL_SYSTEM_PARAMETERS);
  await saveDocumentToFirestore('categories', 'list', { values: ['HAIR', 'BEARD', 'COMBO', 'TREATMENT'] });

  // Clear localStorage backups
  try {
    localStorage.clear();
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------------------------------
// Real-time Multi-Device Sync Engine (onSnapshot)
// ----------------------------------------------------
export function subscribeToFirestoreState(onStateChange: (updatedData: Partial<any>) => void) {
  const unsubs: (() => void)[] = [];

  const collections = [
    { name: 'users', key: 'users' },
    { name: 'barberDetails', key: 'barberDetails' },
    { name: 'services', key: 'services' },
    { name: 'products', key: 'products' },
    { name: 'plans', key: 'plans' },
    { name: 'subscriptions', key: 'subscriptions' },
    { name: 'appointments', key: 'appointments' },
    { name: 'comandas', key: 'comandas' },
    { name: 'supplyTransactions', key: 'supplyTransactions' },
    { name: 'npsFeedbacks', key: 'npsFeedbacks' }
  ];

  collections.forEach(({ name, key }) => {
    try {
      const unsub = onSnapshot(collection(db, name), (snap) => {
        // Return latest Firestore snapshot docs
        const list = snap.docs.map(d => ({ ...d.data() }));
        if (list.length > 0 || snap.metadata.hasPendingWrites === false) {
          onStateChange({ [key]: list });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, name);
      });
      unsubs.push(unsub);
    } catch (e) {
      console.error(`Failed to attach snapshot listener for ${name}:`, e);
    }
  });

  try {
    const unsubParam = onSnapshot(doc(db, 'parameters', 'system'), (snap) => {
      if (snap.exists()) {
        onStateChange({ parameters: snap.data() });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'parameters/system');
    });
    unsubs.push(unsubParam);
  } catch (e) {
    console.error('Error listening to parameters:', e);
  }

  try {
    const unsubCat = onSnapshot(doc(db, 'categories', 'list'), (snap) => {
      if (snap.exists() && snap.data()?.values) {
        onStateChange({ categories: snap.data().values });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'categories/list');
    });
    unsubs.push(unsubCat);
  } catch (e) {
    console.error('Error listening to categories:', e);
  }

  return () => {
    unsubs.forEach(fn => fn());
  };
}
