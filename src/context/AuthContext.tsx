import { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import User from '../../interface/User';

export interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const userCookie = Cookies.get('user');
        const parsedUser = userCookie ? JSON.parse(userCookie) : null;
        setUser(parsedUser);
    }, []);

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ user, setUser, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
