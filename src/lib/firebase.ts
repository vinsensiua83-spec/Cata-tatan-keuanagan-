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

let appInstance;
try {
  appInstance = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase initialization notice:', e);
  appInstance = getApps()[0] || initializeApp(fallbackConfig);
}

export const app = appInstance;
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
