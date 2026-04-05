import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (userData: any) => Promise<void>; // Renamed from signIn
  logout: () => Promise<void>; // Renamed from signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user session on app boot
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("@user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load user session:", e);
      } finally {
        // Ensure splash screen/loading state ends
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (userData: any) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem("@user", JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("@user");
    } catch (e) {
      console.error("Failed to clear user session:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
