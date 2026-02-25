export default function Marquee({ text }: { text: string }) {
    return (
        <div className="relative w-full overflow-hidden bg-[#050505] py-8 flex border-y border-white/5 z-20">
            <div className="flex w-fit animate-marquee whitespace-nowrap">
                {/* Repeat enough times to fill screen + overflow */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center">
                        <span
                            className="text-[8vw] font-bold uppercase tracking-tight leading-none"
                            style={{
                                fontFamily: "'Clash Display', sans-serif",
                                WebkitTextStroke: i % 2 === 0 ? "2px rgba(0, 240, 255, 0.4)" : "0px",
                                color: i % 2 === 0 ? "transparent" : "#00F0FF",
                                textShadow: i % 2 !== 0 ? "0 0 40px rgba(0, 240, 255, 0.4)" : "none"
                            }}
                        >
                            {text}
                        </span>
                        <span className="text-[4vw] px-12 text-[#00E676] opacity-60">•</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
