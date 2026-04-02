import { createContext, useContext, useMemo, useState } from "react";
import { AppUser } from "../types/models";

type AuthContextType = {
  user: AppUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);

  const value = useMemo(
    () => ({
      user,
      async login(username: string, password: string) {
        await new Promise((resolve) => setTimeout(resolve, 350));

        if (!username.trim() || password.trim().length < 4) {
          throw new Error("Invalid username or password");
        }

        setUser({ username: username.trim() });
      },
      logout() {
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
