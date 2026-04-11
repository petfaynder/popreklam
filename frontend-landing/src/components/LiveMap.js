'use client';

export default function LiveMap() {
    // Abstract representation of a map using dots
    const points = [
        { top: '30%', left: '20%', size: 'w-4 h-4', color: 'bg-primary' }, // NA
        { top: '35%', left: '22%', size: 'w-2 h-2', color: 'bg-foreground' },
        { top: '28%', left: '50%', size: 'w-3 h-3', color: 'bg-accent' }, // EU
        { top: '32%', left: '52%', size: 'w-2 h-2', color: 'bg-foreground' },
        { top: '45%', left: '55%', size: 'w-2 h-2', color: 'bg-primary' }, // Middle East
        { top: '40%', left: '75%', size: 'w-4 h-4', color: 'bg-accent' }, // Asia
        { top: '60%', left: '25%', size: 'w-3 h-3', color: 'bg-primary' }, // SA
        { top: '70%', left: '80%', size: 'w-2 h-2', color: 'bg-foreground' }, // Aus
    ];

    return (
        <section className="py-24 px-4 bg-foreground text-background relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">

                <div className="md:w-1/3">
                    <div className="inline-block px-3 py-1 border border-background rounded-full text-xs font-bold uppercase mb-4 animate-pulse">
                        ● Live Activity
                    </div>
                    <h2 className="text-5xl font-black uppercase leading-none mb-6">
                        Global <br /> <span className="text-primary">Scale</span>
                    </h2>
                    <p className="font-medium text-gray-400 mb-8">
                        With 200+ GEOs and billions of daily impressions, we deliver your ads to the right audience, anywhere in the world.
                    </p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="font-bold uppercase">Active Campaigns</span>
                            <span className="font-mono text-primary">12,405</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="font-bold uppercase">Daily Impressions</span>
                            <span className="font-mono text-accent">2.5B+</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="font-bold uppercase">Publishers</span>
                            <span className="font-mono text-primary">45,000+</span>
                        </div>
                    </div>
                </div>

                <div className="md:w-2/3 relative h-[400px] w-full border-2 border-background bg-[#111] shadow-[8px_8px_0px_0px_var(--color-primary)]">
                    {/* Simplified Abstract Map Shape (CSS Only for visual impact) */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-contain bg-no-repeat bg-center filter invert"></div>

                    {/* Pulsing Dots */}
                    {points.map((p, i) => (
                        <div key={i} className={`absolute ${p.size} ${p.color} rounded-full animate-ping`} style={{ top: p.top, left: p.left, animationDuration: `${2 + i}s` }}></div>
                    ))}
                    {points.map((p, i) => (
                        <div key={'s' + i} className={`absolute ${p.size} ${p.color} rounded-full`} style={{ top: p.top, left: p.left }}></div>
                    ))}

                    <div className="absolute bottom-4 left-4 bg-background text-foreground px-4 py-2 font-mono text-xs border border-foreground">
                        SYSTEM STATUS: OPTIMAL
                    </div>
                </div>

            </div>
        </section>
    );
}
