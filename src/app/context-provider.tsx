"use client"

import { User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const AppContext = createContext<AuthContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUser() {
          try {
            // const res = await fetch("/api/auth/me", {
            //   method: "GET",
            //   headers: { "Content-Type": "application/json" },
            // });
    
            // if (res.ok) {
            //   const data = await res.json();
            //   setUser(data.user);
            // }
            setUser({
                id: '123',
                email: '11lekhuong@gmail.com',
                username: 'khuongdev',
                name: 'Khuong',
                password: '',
                bio: null,
                image: null,
                location: null,
                website: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
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