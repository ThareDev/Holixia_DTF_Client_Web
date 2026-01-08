'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage, logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';

const publicRoutes = ['/login', '/register', '/'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(true);

    console.log('AuthProvider - isAuthenticated:', isAuthenticated, 'token:', token);

    // Load user from localStorage on mount
    useEffect(() => {
        dispatch(loadUserFromStorage());
        setIsLoading(false);
    }, [dispatch]);

    // Check authentication for protected routes
    useEffect(() => {
        // Don't redirect while still loading
        if (isLoading) return;

        const isPublicRoute = publicRoutes.includes(pathname);
        
        if (!isPublicRoute && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, pathname, router, isLoading]);

    // Setup global fetch interceptor for 401 responses
    useEffect(() => {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            
            if (response.status === 401) {
                // Unauthorized - logout and redirect to login
                dispatch(logout());
                router.push('/login');
            }
            
            return response;
        };

        // Cleanup
        return () => {
            window.fetch = originalFetch;
        };
    }, [dispatch, router]);

    // Show loading state while checking authentication
    if (isLoading) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}