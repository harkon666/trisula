"use client";

import { Trash2, Key, Type } from "lucide-react";
import { Button, Input } from "@/src/components/atoms";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface MetadataRowProps {
    id: string;
    fieldKey: string;
    fieldValue: string;
    onUpdate: (id: string, key: string, value: string) => void;
    onDelete: (id: string) => void;
    isKeyError?: boolean;
}

export function MetadataRow({
    id,
    fieldKey,
    fieldValue,
    onUpdate,
    onDelete,
    isKeyError
}: MetadataRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Entry Animation
        gsap.fromTo(rowRef.current,
            { opacity: 0, x: -20, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
        );
    }, []);

    const handleDelete = () => {
        gsap.to(rowRef.current, {
            opacity: 0,
            x: 20,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => onDelete(id)
        });
    };

    return (
        <div
            ref={rowRef}
            className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
        >
            <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Key</label>
                <Input
                    value={fieldKey}
                    onChange={(e) => onUpdate(id, e.target.value.replace(/[^a-zA-Z0-9_]/g, ""), fieldValue)}
                    placeholder="e.g. hobi_favorit"
                    className={`h-12 bg-charcoal-800/50 border-white/5 rounded-xl text-sm ${isKeyError ? 'border-red-500/50 focus:border-red-500' : 'focus:border-gold-metallic/50'}`}
                    icon={<Key className={`w-4 h-4 ${isKeyError ? 'text-red-500' : 'text-zinc-500 group-focus-within:text-gold-metallic'}`} />}
                />
            </div>

            <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Value</label>
                <Input
                    value={fieldValue}
                    onChange={(e) => onUpdate(id, fieldKey, e.target.value)}
                    placeholder="e.g. Golf & Diving"
                    className="h-12 bg-charcoal-800/50 border-white/5 rounded-xl text-sm focus:border-gold-metallic/50"
                    icon={<Type className="w-4 h-4 text-zinc-500 group-focus-within:text-gold-metallic" />}
                />
            </div>

            <div className="md:pt-5 pt-0 w-full md:w-auto">
                <Button
                    variant="ghost"
                    size="md"
                    onClick={handleDelete}
                    className="w-full md:w-12 h-12 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 hover:border-red-500 p-0"
                >
                    <Trash2 className="w-5 h-5 text-current" />
                </Button>
            </div>
        </div>
    );
}
