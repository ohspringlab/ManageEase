import React, { createContext, useState, useEffect, type ReactNode } from "react";

// Define user type (you can extend this with more fields as needed)
interface User {
  id: string;
  name: string;
  email: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateProfile: (userData: User) => void;
}

// Create context with default undefined
export const AuthContext = createContext<AuthContextType | null>(null);

// Props for provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔹 API call to update profile
  const updateProfile = async (userData: User) => {
    setUser(userData); // update context + localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
