import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GoldCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function GoldCard({ children, className, ...props }: GoldCardProps) {
    return (
        <div
            className={twMerge(
                clsx(
                    'relative overflow-hidden rounded-xl bg-gradient-to-br from-midnight-900 to-midnight-950 p-6 shadow-2xl border border-trisula-500/30',
                    'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.1),transparent)]', // Gold glow
                    className
                )
            )}
            {...props}
        >
            <div className="relative z-10 text-white">
                {children}
            </div>
        </div>
    );
}
