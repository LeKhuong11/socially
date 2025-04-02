"use client"

import { getUserFromToken } from "@/actions/user.action";
import { User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: Omit<User, "password"> | null;
    setUser: (user: Omit<User, "password"> | null) => void;
}

const AppContext = createContext<AuthContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Omit<User, "password"> | null>(null);

    useEffect(() => {
        async function fetchUser() {
          try {
            const user = await getUserFromToken();
            
            if (user) {
              setUser(user as Omit<User, "password">);
            } else {
              setUser(null);
            }
            
          } catch (error) {
            console.error("Failed to fetch user", error);
          }
        }
    
        fetchUser();
      }, []);

    return <AppContext.Provider value={{ user, setUser }}>
        {children}
    </AppContext.Provider>
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
  }