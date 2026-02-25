export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
            {/* Background elements to match the premium theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Auth Content */}
            <div className="relative z-10 w-full max-w-md p-6">
                {children}
            </div>
        </div>
    );
}
