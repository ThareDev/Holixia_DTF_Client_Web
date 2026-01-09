'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage, logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';

const publicRoutes = ['/login', '/register', '/'];
const adminOnlyRoutes = ['/admin-panel'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(true);

    console.log('AuthProvider - isAuthenticated:', isAuthenticated, 'token:', token, 'userType:', user?.userType);

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
        const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));
        
        // Check if user is trying to access admin route
        if (isAdminRoute) {
            if (!isAuthenticated) {
                // Not logged in - redirect to login
                router.push('/login');
                return;
            }
            
            if (user?.userType !== 'admin') {
                // Logged in but not admin - redirect to home or dashboard
                router.push('/');
                return;
            }
        }
        
        // Check authentication for other protected routes
        if (!isPublicRoute && !isAdminRoute && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, pathname, router, isLoading, user]);

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015]">
                <div className="w-16 h-16 border-4 border-[#a60054] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}