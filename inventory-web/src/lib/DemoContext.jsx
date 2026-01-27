import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './hooks';

const DemoContext = createContext(null);

export const LICENSE_FEATURES = {
    basic: {
        label: 'Inventory Basic',
        features: ['dashboard', 'products', 'alerts'],
        description: 'Essential stock tracking for startups'
    },
    sales: {
        label: 'Inventory + Sales',
        features: ['dashboard', 'products', 'alerts', 'customers', 'sales', 'reports'],
        description: 'Complete sales cycle management'
    },
    enterprise: {
        label: 'Enterprise Suite',
        features: ['dashboard', 'products', 'alerts', 'customers', 'sales', 'reports', 'suppliers', 'purchases'],
        description: 'Full operational control'
    }
};

export function DemoProvider({ children }) {
    const { user } = useAuth();

    // Automatically determine if we are in demo mode and what license based on authenticated email
    const { isDemoMode, licenseType } = useMemo(() => {
        if (!user?.email) return { isDemoMode: false, licenseType: null };

        const email = user.email.toLowerCase();
        if (email === 'basic@demo.com') return { isDemoMode: true, licenseType: 'basic' };
        if (email === 'sales@demo.com') return { isDemoMode: true, licenseType: 'sales' };
        if (email === 'enterprise@demo.com') return { isDemoMode: true, licenseType: 'enterprise' };

        return { isDemoMode: false, licenseType: null };
    }, [user]);

    const hasFeature = (featureName) => {
        // If not in demo mode (real user), access is controlled by RLS/Roles, so we return true for feature gates
        if (!isDemoMode || !licenseType) return true;
        return LICENSE_FEATURES[licenseType].features.includes(featureName);
    };

    return (
        <DemoContext.Provider value={{
            isDemoMode,
            licenseType,
            licenseDetails: licenseType ? LICENSE_FEATURES[licenseType] : null,
            hasFeature,
            // Kept for backward compatibility but technically handled by supabase logout now
            exitDemo: () => { }
        }}>
            {children}
        </DemoContext.Provider>
    );
}

export function useDemo() {
    const context = useContext(DemoContext);
    if (!context) {
        throw new Error('useDemo must be used within a DemoProvider');
    }
    return context;
}
