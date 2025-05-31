
'use client';

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// TODO: Import Firebase SDKs when implementing real Firebase Auth
// import { auth } from '@/lib/firebase'; // Assuming firebase is initialized in lib/firebase.ts
// import { 
//   onAuthStateChanged, 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword, 
//   signOut,
//   sendPasswordResetEmail,
//   updatePassword as firebaseUpdatePassword // Alias to avoid conflict
//   // Add other Firebase Auth methods as needed (e.g., for OTP, MFA)
// } from 'firebase/auth';


export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'principal' | 'librarian';

export interface User {
  id: string; // Corresponds to Firebase UID
  name: string | null; // Firebase display name
  email: string | null; // Firebase email
  role: UserRole;
  // Add other fields like photoURL, emailVerified, etc., as needed from Firebase
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // login: (email: string, role: UserRole) => void; // Old mock signature
  login: (email: string, password?: string /* for mock */, role?: UserRole /* for mock */) => void; // Updated for conceptual Firebase
  logout: () => void;
  // signUp: (email: string, password string) => Promise<any>; // Example for Firebase
  // resetPassword: (email: string) => Promise<void>; // Example for Firebase
  // updateUserPassword: (newPassword: string) => Promise<void>; // Example for Firebase
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'campusHubUser'; // For mock user persistence

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // TODO: Replace useEffect with Firebase onAuthStateChanged listener
  useEffect(() => {
    // This is for the MOCK auth system.
    // For Firebase, you would use onAuthStateChanged here.
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Basic validation for mock user structure
        if (parsedUser && parsedUser.id && parsedUser.role) {
            setUser(parsedUser);
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);

    // --- Example Firebase onAuthStateChanged listener ---
    // setIsLoading(true);
    // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    //   if (firebaseUser) {
    //     // User is signed in
    //     // TODO: Fetch user role from Firestore or custom claims
    //     // const userRole = await fetchUserRole(firebaseUser.uid); // Placeholder
    //     const userRole: UserRole = 'student'; // Default or fetched role
    //     setUser({ 
    //       id: firebaseUser.uid, 
    //       name: firebaseUser.displayName, 
    //       email: firebaseUser.email,
    //       role: userRole 
    //     });
    //     // Optionally redirect if on login page
    //     // if (router.pathname === '/login') router.push('/dashboard');
    //   } else {
    //     // User is signed out
    //     setUser(null);
    //   }
    //   setIsLoading(false);
    // });
    // return () => unsubscribe(); // Cleanup subscription on unmount
    // --- End Example ---

  }, []);

  // MOCK LOGIN - to be replaced with Firebase signInWithEmailAndPassword
  const login = (email: string, password?: string, role?: UserRole) => {
    // Password is not used in mock, but included for signature consistency
    // Role is used for mock
    const determinedRole = role || 'student'; // Default role for mock if not provided
    const userName = email.split('@')[0]; // Simple name from email for mock
    const newUser: User = { 
        id: Date.now().toString(), // Mock ID
        name: userName, 
        email: email,
        role: determinedRole
    };
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser)); // Persist mock user
    router.push('/dashboard');
  };

  // TODO: Implement Firebase signInWithEmailAndPassword
  // const firebaseLogin = async (email, password) => {
  //   setIsLoading(true);
  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //     // onAuthStateChanged will handle setting user and redirecting
  //   } catch (error) {
  //     console.error("Firebase login error:", error);
  //     // TODO: Show error to user
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  // MOCK LOGOUT - to be replaced with Firebase signOut
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY); // Clear mock user
    router.push('/login');
    // TODO: Call Firebase signOut()
    // signOut(auth).catch(error => console.error("Firebase logout error:", error));
  };

  // TODO: Implement other Firebase Auth functions (signUp, resetPassword, updateUserPassword, etc.)
  // const signUp = async (email, password) => { /* ... */ };
  // const resetPassword = async (email) => { /* ... */ };
  // const updateUserPassword = async (newPassword) => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
