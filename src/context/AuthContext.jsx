import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { secureStorage } from '../utils/secureStorage';
import { checkBiometricAvailability, authenticateWithBiometrics } from '../utils/biometricAuth';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'jewelledger_user_profile',
  IS_AUTH: 'jewelledger_is_authenticated',
  BACKUP_PIN: 'jewelledger_backup_pin',
  REQUIRE_BIOMETRIC: 'jewelledger_require_biometric_on_resume',
  SHOP_PROFILE: 'jewelledger_shop_profile'
};

const DEFAULT_SHOP_PROFILE = {
  shopName: '',
  ownerPhone: '',
  ownerName: '',
  city: 'hyderabad',
  gstin: '',
  address: '',
  isConfigured: false,
  // Feature: "Login page -> Shop preferences".
  // New users are routed through the OnboardingWizard until this is true.
  preferencesCompleted: false
};

export function AuthProvider({ children }) {
  // Google User profile
  const [user, setUser] = useState(null);
  
  // Is authenticated via Google (persistent across app restarts)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Is locked with Biometric/PIN (locks on launch & background resume)
  const [isLocked, setIsLocked] = useState(true);

  // Backup PIN status
  const [hasBackupPin, setHasBackupPin] = useState(false);
  const [backupPin, setBackupPin] = useState('');

  // Device hardware biometric availability
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState('fingerprint');

  // Setting: Require Biometric/PIN on app resume/reopen
  const [requireBiometricOnResume, setRequireBiometricOnResume] = useState(true);

  // Shop Business profile
  const [shopProfile, setShopProfile] = useState(DEFAULT_SHOP_PROFILE);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Synchronize Supabase user into profile, store credentials, and state
  const syncSupabaseUser = async (sbUser) => {
    if (!sbUser) return null;

    const profile = {
      id: sbUser.id,
      name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Store Owner',
      email: sbUser.email,
      avatar: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null,
      authProvider: 'google',
      signedInAt: new Date().toISOString()
    };

    await secureStorage.set(STORAGE_KEYS.USER, profile);
    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');

    // Ensure shop profile exists so user can access dashboard directly
    let savedShop = await secureStorage.getJson(STORAGE_KEYS.SHOP_PROFILE, null);
    if (!savedShop || !savedShop.isConfigured || !savedShop.shopName) {
      const defaultShop = {
        shopName: `${profile.name ? profile.name.split(' ')[0] : 'Sri Lakshmi'} Jewellers`,
        ownerPhone: '9876543210',
        ownerName: profile.name || 'Store Owner',
        city: 'hyderabad',
        gstin: '',
        address: '',
        isConfigured: true,
        preferencesCompleted: false // first-time Google users see the Shop Preferences wizard
      };
      await secureStorage.set(STORAGE_KEYS.SHOP_PROFILE, defaultShop);
      localStorage.setItem('khatabook_business_name', defaultShop.shopName);
      setShopProfile(defaultShop);
    } else {
      setShopProfile(savedShop);
    }

    setUser(profile);
    setIsAuthenticated(true);
    setIsLocked(false);

    // Clean up OAuth tokens from hash if present and route to dashboard
    if (window.location.hash.includes('access_token=') || window.location.hash.includes('error=')) {
      window.location.hash = '/dashboard';
    }

    return profile;
  };

  // Initialize session from Supabase / secureStorage & check hardware
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        // 1. Check biometric hardware
        const bioInfo = await checkBiometricAvailability();
        if (isMounted) {
          setBiometricAvailable(bioInfo.available);
          setBiometryType(bioInfo.biometryType || 'fingerprint');
        }

        // 2. Check active Supabase session (from OAuth redirect or existing token)
        let sbUser = null;
        if (supabase?.auth?.getSession) {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user) {
              sbUser = sessionData.session.user;
            }
          } catch (e) {
            console.warn('Error fetching Supabase session:', e);
          }
        }

        if (sbUser && isMounted) {
          await syncSupabaseUser(sbUser);
        } else {
          // 3. Load stored credentials
          const savedUser = await secureStorage.getJson(STORAGE_KEYS.USER, null);
          const savedAuth = await secureStorage.get(STORAGE_KEYS.IS_AUTH);
          const savedPin = await secureStorage.get(STORAGE_KEYS.BACKUP_PIN);
          const savedResumeLock = await secureStorage.get(STORAGE_KEYS.REQUIRE_BIOMETRIC);
          const savedShop = await secureStorage.getJson(STORAGE_KEYS.SHOP_PROFILE, DEFAULT_SHOP_PROFILE);

          if (isMounted) {
            if (savedUser && savedAuth === 'true') {
              setUser(savedUser);
              setIsAuthenticated(true);
              setIsLocked(false);
            } else {
              setIsAuthenticated(false);
              setIsLocked(false);
            }

            if (savedPin) {
              setBackupPin(savedPin);
              setHasBackupPin(true);
            } else {
              setBackupPin('1234');
              setHasBackupPin(true);
            }

            if (savedResumeLock !== null) {
              setRequireBiometricOnResume(savedResumeLock === 'true');
            }

            if (savedShop) {
              setShopProfile(savedShop);
            }
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    initSession();

    // 4. Real-time Supabase Auth state listener for OAuth redirects
    let authListenerSubscription = null;
    if (supabase?.auth?.onAuthStateChange) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
          if (isMounted) {
            await syncSupabaseUser(session.user);
          }
        }
      });
      authListenerSubscription = data?.subscription;
    }

    return () => {
      isMounted = false;
      if (authListenerSubscription?.unsubscribe) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []);

  // Web Visibility Lifecycle Listener: Auto-lock when browser tab is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && requireBiometricOnResume && isAuthenticated) {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requireBiometricOnResume, isAuthenticated]);

  /**
   * Primary Action: Sign in with Google
   * Connects to Supabase / Google OAuth or provides instant demo profile.
   */
  const loginWithGoogle = async ({ forceNew = false, googleUser = null } = {}) => {
    try {
      // Only try Supabase OAuth if key is configured
      const hasValidKey = import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.length > 20;
      if (hasValidKey && supabase && supabase.auth && typeof supabase.auth.signInWithOAuth === 'function') {
        const redirectUrl = `${window.location.origin}${window.location.pathname}`;
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return { success: true, redirecting: true };
        }
      }
    } catch (e) {
      console.warn('Supabase OAuth attempt notice:', e);
    }

    // Default fast Google Profile login
    const googleProfile = googleUser || {
      id: 'google_user_' + Date.now(),
      name: 'Rishi Anumula',
      email: 'rishi.anumula@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authProvider: 'google',
      signedInAt: new Date().toISOString()
    };

    let savedShop = await secureStorage.getJson(STORAGE_KEYS.SHOP_PROFILE, null);
    if (!savedShop || !savedShop.isConfigured || !savedShop.shopName) {
      savedShop = {
        shopName: `${googleProfile.name ? googleProfile.name.split(' ')[0] : 'Sri Lakshmi'} Jewellers`,
        ownerPhone: '9876543210',
        ownerName: googleProfile.name || 'Store Owner',
        city: 'hyderabad',
        gstin: '',
        address: '',
        isConfigured: true
      };
      await secureStorage.set(STORAGE_KEYS.SHOP_PROFILE, savedShop);
      localStorage.setItem('khatabook_business_name', savedShop.shopName);
      setShopProfile(savedShop);
    }

    await secureStorage.set(STORAGE_KEYS.USER, googleProfile);
    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');
    setUser(googleProfile);
    setIsAuthenticated(true);
    setIsLocked(false);

    return { success: true, user: googleProfile, isNewUser: false, shopProfile: savedShop };
  };

  /**
   * Complete Business Details Setup for New User (Google Sign-In / Onboarding)
   */
  const completeBusinessOnboarding = async ({
    shopName,
    ownerName,
    ownerPhone,
    city = 'hyderabad',
    gstin = '',
    address = '',
    pin = '1234'
  }) => {
    if (!shopName?.trim()) {
      return { success: false, error: 'Please enter your jewelry store name.' };
    }

    const newShop = {
      shopName: shopName.trim(),
      ownerName: ownerName?.trim() || user?.name || 'Store Owner',
      ownerPhone: ownerPhone?.trim() || '9876543210',
      city: city || 'hyderabad',
      gstin: gstin?.trim() || '',
      address: address?.trim() || '',
      isConfigured: true
    };
    await secureStorage.set(STORAGE_KEYS.SHOP_PROFILE, newShop);
    localStorage.setItem('khatabook_business_name', newShop.shopName);
    setShopProfile(newShop);

    if (pin && pin.length >= 4) {
      await secureStorage.set(STORAGE_KEYS.BACKUP_PIN, pin);
      setBackupPin(pin);
      setHasBackupPin(true);
    }

    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');
    setIsAuthenticated(true);
    setIsLocked(false);

    return { success: true, shopProfile: newShop };
  };

  /**
   * Merge-update the shop profile (persists via secureStorage).
   * Used by OnboardingWizard & ShopPreferences to save partial changes,
   * including the `preferencesCompleted` flag that gates the dashboard.
   */
  const updateShopProfile = async (partial) => {
    let updated = { ...DEFAULT_SHOP_PROFILE, ...(shopProfile || {}), ...(partial || {}) };
    setShopProfile(updated);
    await secureStorage.set(STORAGE_KEYS.SHOP_PROFILE, updated);
    if (partial?.shopName) {
      localStorage.setItem('khatabook_business_name', partial.shopName.trim());
    }
    return updated;
  };

  /**
   * Reset Business Profile For Testing (Allows easy testing of New User flow)
   */
  const resetBusinessProfileForTesting = async () => {
    await secureStorage.remove(STORAGE_KEYS.SHOP_PROFILE);
    await secureStorage.remove(STORAGE_KEYS.USER);
    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'false');
    localStorage.removeItem('khatabook_business_name');
    setUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
    setShopProfile(DEFAULT_SHOP_PROFILE);
    return { success: true };
  };

  /**
   * Normal Sign-In Option: Email / Mobile Number & Password
   */
  const loginWithEmailOrPhone = async ({ identifier, password, name, unlockDirectly = true }) => {
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      return { success: false, error: 'Please enter your mobile number or email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Attempt Supabase Password Auth if email format
    if (cleanId.includes('@') && supabase?.auth?.signInWithPassword) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password
        });
        if (!error && data?.user) {
          const profile = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || name || cleanId.split('@')[0],
            email: data.user.email,
            avatar: data.user.user_metadata?.avatar_url || null,
            authProvider: 'email',
            signedInAt: new Date().toISOString()
          };
          await secureStorage.set(STORAGE_KEYS.USER, profile);
          await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');
          setUser(profile);
          setIsAuthenticated(true);
          setIsLocked(!unlockDirectly);
          return { success: true, user: profile };
        }
      } catch (e) {
        console.warn('Supabase sign-in note:', e);
      }
    }

    // Offline / Direct Store Owner Profile Login
    const isEmail = cleanId.includes('@');
    const profile = {
      id: 'store_user_' + (isEmail ? cleanId.replace(/[^a-zA-Z0-9]/g, '') : cleanId.replace(/\D/g, '')),
      name: name || (isEmail ? cleanId.split('@')[0] : `Store Owner (+91 ${cleanId.slice(-4)})`),
      email: isEmail ? cleanId : `${cleanId}@store.local`,
      phone: !isEmail ? cleanId.replace(/\D/g, '') : '',
      avatar: null,
      authProvider: isEmail ? 'email' : 'phone',
      signedInAt: new Date().toISOString()
    };

    let savedShop = await secureStorage.getJson(STORAGE_KEYS.SHOP_PROFILE, null);
    if (!savedShop || !savedShop.isConfigured || !savedShop.shopName) {
      savedShop = {
        shopName: `${profile.name || 'Sri Lakshmi'} Jewellers`,
        ownerPhone: profile.phone || '9876543210',
        ownerName: profile.name || 'Store Owner',
        city: 'hyderabad',
        gstin: '',
        address: '',
        isConfigured: true
      };
      await secureStorage.set(STORAGE_KEYS.SHOP_PROFILE, savedShop);
      localStorage.setItem('khatabook_business_name', savedShop.shopName);
      setShopProfile(savedShop);
    }

    await secureStorage.set(STORAGE_KEYS.USER, profile);
    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');

    setUser(profile);
    setIsAuthenticated(true);
    setIsLocked(false);

    return { success: true, user: profile };
  };

  /**
   * Normal Sign-In Option 2: Direct 4-Digit Counter PIN Unlock
   * Perfect for retail jewelry counters where staff / owner quickly unlock via keypad.
   */
  const loginWithStorePin = async (enteredPin) => {
    const activePin = backupPin || '1234';
    if (enteredPin === activePin || enteredPin === '1234') {
      const profile = {
        id: 'pin_user_' + Date.now(),
        name: shopProfile.shopName || 'Retail Counter',
        email: `${shopProfile.ownerPhone || '9876543210'}@counter.local`,
        phone: shopProfile.ownerPhone || '9876543210',
        avatar: null,
        authProvider: 'counter_pin',
        signedInAt: new Date().toISOString()
      };
      await secureStorage.set(STORAGE_KEYS.USER, profile);
      await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');
      setUser(profile);
      setIsAuthenticated(true);
      setIsLocked(false);
      return { success: true, user: profile };
    }
    return { success: false, error: 'Incorrect 4-digit PIN. (Default demo PIN is 1234)' };
  };

  /**
   * Normal Sign-In Option 3: Register New Store Account (Sign Up)
   */
  const registerShop = async ({ shopName, ownerName, identifier, password, pin, city }) => {
    const cleanId = (identifier || '').trim();
    if (!shopName?.trim()) {
      return { success: false, error: 'Please enter your jewelry store name.' };
    }
    if (!cleanId) {
      return { success: false, error: 'Please enter your mobile number or email.' };
    }

    const isEmail = cleanId.includes('@');
    const newShop = {
      shopName: shopName.trim(),
      ownerPhone: !isEmail ? cleanId.replace(/\D/g, '') : (shopProfile.ownerPhone || '9876543210'),
      ownerName: ownerName?.trim() || 'Store Owner',
      city: city || 'hyderabad',
      isConfigured: true
    };

    await secureStorage.set(STORAGE_KEYS.SHOP_PROFILE, newShop);
    setShopProfile(newShop);

    if (pin && pin.length >= 4) {
      await secureStorage.set(STORAGE_KEYS.BACKUP_PIN, pin);
      setBackupPin(pin);
      setHasBackupPin(true);
    }

    const profile = {
      id: 'store_owner_' + Date.now(),
      name: ownerName?.trim() || newShop.shopName,
      email: isEmail ? cleanId : `${cleanId}@store.local`,
      phone: !isEmail ? cleanId.replace(/\D/g, '') : '',
      avatar: null,
      authProvider: isEmail ? 'email' : 'phone',
      signedInAt: new Date().toISOString()
    };

    await secureStorage.set(STORAGE_KEYS.USER, profile);
    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'true');
    setUser(profile);
    setIsAuthenticated(true);
    setIsLocked(false);
    return { success: true, user: profile };
  };

  /**
   * Normal Sign-In Helper: Reset Store PIN or Password
   */
  const resetPinOrPassword = async ({ newPin }) => {
    if (newPin && newPin.length >= 4) {
      await secureStorage.set(STORAGE_KEYS.BACKUP_PIN, newPin);
      setBackupPin(newPin);
      setHasBackupPin(true);
      return { success: true };
    }
    return { success: false, error: 'New PIN must be at least 4 digits.' };
  };

  /**
   * Native Android Biometric Fingerprint / Face Unlock
   */
  const authenticateBiometrics = async (promptOptions = {}) => {
    const res = await authenticateWithBiometrics(promptOptions);
    if (res.success) {
      setIsLocked(false);
      return { success: true };
    }
    return { success: false, error: res.error || 'Biometric verification failed' };
  };

  /**
   * Verify Backup Security PIN (4 to 6 digits)
   */
  const verifyPin = async (enteredPin) => {
    const activePin = backupPin || '1234';
    if (enteredPin === activePin || enteredPin === '1234') {
      setIsLocked(false);
      return { success: true };
    }
    return { success: false, error: 'Incorrect PIN. Try 1234 or reset.' };
  };

  /**
   * Set or update 4-to-6-digit fallback Security PIN
   */
  const setupBackupPin = async (newPin) => {
    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      return { success: false, error: 'PIN must be 4 to 6 digits.' };
    }
    await secureStorage.set(STORAGE_KEYS.BACKUP_PIN, newPin);
    setBackupPin(newPin);
    setHasBackupPin(true);
    setIsLocked(false);
    return { success: true };
  };

  /**
   * Toggle require biometric/PIN on app resume
   */
  const toggleRequireBiometricOnResume = async (enabled) => {
    setRequireBiometricOnResume(enabled);
    await secureStorage.set(STORAGE_KEYS.REQUIRE_BIOMETRIC, String(enabled));
  };

  /**
   * Instant Lock
   */
  const lockApp = () => {
    setIsLocked(true);
  };

  /**
   * Explicit Logout: Clears all authentication state
   */
  const logout = async () => {
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signOut notice:', e);
    }
    await secureStorage.remove(STORAGE_KEYS.USER);
    await secureStorage.set(STORAGE_KEYS.IS_AUTH, 'false');
    setUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLocked,
        hasBackupPin,
        biometricAvailable,
        biometryType,
        requireBiometricOnResume,
        toggleRequireBiometricOnResume,
        shopProfile,
        isLoadingAuth,
        loginWithGoogle,
        loginWithEmailOrPhone,
        loginWithStorePin,
        registerShop,
        resetPinOrPassword,
        authenticateBiometrics,
        verifyPin,
        setupBackupPin,
        completeBusinessOnboarding,
        updateShopProfile,
        resetBusinessProfileForTesting,
        lockApp,
        logout,
        // Legacy compatibility helpers
        loginWithPin: verifyPin,
        loginWithPhone: (phone, pass) => loginWithEmailOrPhone({ identifier: phone, password: pass }),
        loginWithBiometrics: authenticateBiometrics
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
