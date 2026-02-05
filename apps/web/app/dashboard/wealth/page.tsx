import WealthDashboard from "../../../components/WealthDashboard";

export default function WealthPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-200 to-amber-600 bg-clip-text text-transparent">
                    Wealth Overview
                </h1>
                <p className="text-white/50 mt-2">
                    Your consolidated Net Worth across Trisula Banking & On-chain Assets.
                </p>
            </header>

            <WealthDashboard />
        </div>
    );
}
