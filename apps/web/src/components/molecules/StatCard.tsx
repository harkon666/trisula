import { Card, Badge, AnimatedCounter } from "@/src/components/atoms";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        positive?: boolean;
    };
    status?: string;
    className?: string;
    onClick?: () => void;
}

export function StatCard({ label, value, icon, trend, status, className, onClick }: StatCardProps) {
    return (
        <Card
            variant="glass"
            className={`flex flex-col justify-between group ${onClick ? 'cursor-pointer hover:border-amber-500/30' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold">{label}</h3>
                {icon && <div className="text-amber-500">{icon}</div>}
            </div>

            <div>
                <div className="text-3xl font-bold text-white mb-2">
                    {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                </div>

                <div className="flex items-center gap-2">
                    {status && (
                        <Badge variant={status === 'active' ? 'success' : 'default'}>
                            {status}
                        </Badge>
                    )}
                    {trend && (
                        <span className={`text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                            {trend.value}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
