"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Loader2, AlertCircle, Info } from "lucide-react";
import { Button, Card } from "@/src/components/atoms";
import { MetadataRow } from "@/src/components/molecules/MetadataRow";
import { useAdminUserMetadata } from "@/src/hooks/useAdminUsers";
import { toast } from "sonner";

interface MetadataEditorProps {
    userId: string;
    initialMetadata: Record<string, any>;
    onSuccess?: () => void;
}

interface InternalRow {
    id: string;
    key: string;
    value: string;
}

export function MetadataEditor({ userId, initialMetadata, onSuccess }: MetadataEditorProps) {
    const { updateMetadata, isUpdating } = useAdminUserMetadata();
    const [rows, setRows] = useState<InternalRow[]>([]);
    const [errors, setErrors] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Map initial metadata object to internal array with unique IDs
        const initialRows = Object.entries(initialMetadata).map(([key, value]) => ({
            id: Math.random().toString(36).substr(2, 9),
            key,
            value: String(value)
        }));

        // If empty, start with one empty row for better UX
        if (initialRows.length === 0) {
            initialRows.push({ id: "init-row", key: "", value: "" });
        }

        setRows(initialRows);
    }, [initialMetadata]);

    const handleAddRow = () => {
        setRows([...rows, { id: Math.random().toString(36).substr(2, 9), key: "", value: "" }]);
    };

    const handleUpdateRow = (id: string, key: string, value: string) => {
        setRows(rows.map(row => (row.id === id ? { ...row, key, value } : row)));

        // Clear error if key is now valid
        if (key.trim() && errors.has(id)) {
            const newErrors = new Set(errors);
            newErrors.delete(id);
            setErrors(newErrors);
        }
    };

    const handleDeleteRow = (id: string) => {
        setRows(rows.filter(row => row.id !== id));
        const newErrors = new Set(errors);
        newErrors.delete(id);
        setErrors(newErrors);
    };

    const validate = () => {
        const newErrors = new Set<string>();
        const keys = new Set<string>();
        let hasDuplicate = false;

        rows.forEach(row => {
            if (!row.key.trim()) {
                newErrors.add(row.id);
            }
            if (keys.has(row.key)) {
                hasDuplicate = true;
                newErrors.add(row.id);
            }
            keys.add(row.key);
        });

        setErrors(newErrors);

        if (newErrors.size > 0) {
            if (hasDuplicate) toast.error("Key metadata tidak boleh duplikat");
            else toast.error("Semua key metadata wajib diisi");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;

        // Convert rows back to object
        const finalMetadata = rows.reduce((acc, row) => {
            if (row.key.trim()) {
                acc[row.key.trim()] = row.value;
            }
            return acc;
        }, {} as Record<string, any>);

        updateMetadata({ id: userId, metadata: finalMetadata }, {
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold-metallic/10 border border-gold-metallic/20 flex items-center justify-center">
                        <Info className="w-4 h-4 text-gold-metallic" />
                    </div>
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Metadata Editor</span>
                </div>
                <Button
                    onClick={handleAddRow}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gold-metallic hover:bg-gold-metallic/10 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Field
                </Button>
            </div>

            <Card variant="outline" className="bg-black/20 border-white/5 p-6 min-h-[200px] flex flex-col">
                <div className="space-y-4 flex-1">
                    {rows.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-zinc-600">
                            <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm italic">Belum ada metadata. Klik "Tambah Field" untuk memulai.</p>
                        </div>
                    ) : (
                        rows.map(row => (
                            <MetadataRow
                                key={row.id}
                                id={row.id}
                                fieldKey={row.key}
                                fieldValue={row.value}
                                onUpdate={handleUpdateRow}
                                onDelete={handleDeleteRow}
                                isKeyError={errors.has(row.id)}
                            />
                        ))
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <Button
                        onClick={handleSave}
                        isLoading={isUpdating}
                        className="px-8 bg-gold-metallic text-charcoal-950 font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gold-metallic/20 gap-2 border-transparent"
                    >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        SIMPAN PERUBAHAN
                    </Button>
                </div>
            </Card>
        </div>
    );
}
