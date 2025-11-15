import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from './api'; // This is your "smart messenger"

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    // This is the "keep me logged in" check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setCurrentUser(decoded.user);
                }
            } catch (err) {
                console.error("Invalid token on load", err);
                logout();
            }
        }
    }, []);

    // This is the REAL login function
    // It calls your app.js API server
    const login = async (username, password) => {
        setCurrentUser(null);

        try {
            // It calls your real API at /api/auth/login
            const response = await api.post('/api/auth/login', { username, password });
            const { token } = response.data;

            // Saves the real token
            localStorage.setItem('token', token);

            // Decodes the real token
            const decoded = jwtDecode(token);
            setCurrentUser(decoded.user);

            return { success: true };

        } catch (err) {
            console.error("Login failed", err);
            // It will return the REAL error from your server (e.g., "Invalid credentials")
            return { success: false, message: err.response?.data?.msg || "Login failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    // This register function is not used by your login form,
    // but it's here for completeness
    const register = async () => {
        console.error("Register function not implemented in this flow.");
        return { success: false, message: "Not implemented" };
    };

    return (
        <UserContext.Provider value={{ currentUser, login, logout, register }}>
            {children}
        </UserContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(UserContext);
};