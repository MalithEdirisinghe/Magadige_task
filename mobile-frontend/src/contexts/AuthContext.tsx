import React, {createContext, useContext, useEffect, useState} from 'react';
import auth, {type FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID} from '../config/firebase';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Configure Google Sign-In once
GoogleSignin.configure({webClientId: GOOGLE_WEB_CLIENT_ID});

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const registerWithEmail = async (email: string, password: string) => {
    await auth().createUserWithEmailAndPassword(email, password);
  };

  const loginWithGoogle = async () => {
    await GoogleSignin.hasPlayServices();
    const signInResult = await GoogleSignin.signIn();
    if (signInResult.type !== 'success') {
      throw new Error('Google Sign-In was cancelled or failed');
    }
    const idToken = signInResult.data.idToken;
    if (!idToken) throw new Error('Google Sign-In: No ID token received');
    
    // Get the real accessToken to bypass the react-native-firebase v25.1.0 empty token bug
    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens.accessToken;
    
    const credential = auth.GoogleAuthProvider.credential(idToken, accessToken);
    await auth().signInWithCredential(credential);
  };

  const logout = async () => {
    await auth().signOut();
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      console.log('Google Sign-In: Error signing out:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {throw new Error('useAuth must be used within AuthProvider');}
  return ctx;
}
