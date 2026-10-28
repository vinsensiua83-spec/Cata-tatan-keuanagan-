import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

const fallbackConfig = {
  projectId: "helpful-hill-p01dl",
  appId: "1:678112285952:web:a08e72c2674c03b6eb4fe5",
  apiKey: "AIzaSyCXcpH6FW5XUGpa3S2MlthDZuCVZCZ0NVQ",
  authDomain: "helpful-hill-p01dl.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-3b1b0996-38d4-4a6c-af2a-9e70508c8380",
  storageBucket: "helpful-hill-p01dl.firebasestorage.app",
  messagingSenderId: "678112285952",
};

const firebaseConfig = { ...fallbackConfig, ...(rawConfig || {}) };

let appInstance = null;
try {
  appInstance = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase initialization notice:', e);
  try {
    appInstance = getApps()[0] || initializeApp(fallbackConfig);
  } catch (err2) {
    console.error('Fallback Firebase initialization failed:', err2);
  }
}

let dbInstance: ReturnType<typeof getFirestore> | null = null;
if (appInstance) {
  try {
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
  } catch (e) {
    try {
      dbInstance = getFirestore(appInstance);
    } catch (e2) {
      console.warn('Firestore initialization notice:', e2);
    }
  }
}

let authInstance: ReturnType<typeof getAuth> | null = null;
if (appInstance) {
  try {
    authInstance = getAuth(appInstance);
  } catch (e) {
    console.warn('Auth initialization notice:', e);
  }
}

let googleProviderInstance: GoogleAuthProvider | null = null;
try {
  googleProviderInstance = new GoogleAuthProvider();
} catch (e) {
  console.warn('GoogleAuthProvider initialization notice:', e);
}

export const app = appInstance;
export const db = dbInstance as ReturnType<typeof getFirestore>;
export const auth = authInstance as ReturnType<typeof getAuth>;
export const googleProvider = googleProviderInstance as GoogleAuthProvider;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Optional connection health test with delayed non-blocking execution
export async function testConnection() {
  try {
    if (db) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
  }
}

setTimeout(() => {
  testConnection().catch(() => {});
}, 100);

export { signInWithPopup, fbSignOut };
