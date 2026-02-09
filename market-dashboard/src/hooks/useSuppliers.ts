import { useState, useCallback } from 'react';
import type { Supplier } from '@/types';

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
        const saved = localStorage.getItem('suppliers');
        return saved ? JSON.parse(saved) : [];
    });

    const addSupplier = useCallback((supplier: Supplier) => {
        setSuppliers(prev => {
            const updated = [...prev, supplier];
            localStorage.setItem('suppliers', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
        setSuppliers(prev => {
            const updated = prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
            localStorage.setItem('suppliers', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeSupplier = useCallback((id: string) => {
        setSuppliers(prev => {
            const updated = prev.filter(s => s.id !== id);
            localStorage.setItem('suppliers', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return { suppliers, addSupplier, updateSupplier, removeSupplier };
}
