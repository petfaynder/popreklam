'use client';

import { useState } from 'react';

export default function RevenueCalculator() {
    const [visitors, setVisitors] = useState(50000);
    const [ctr, setCtr] = useState(2.5); // Click-Through Rate %

    const cpm = 5; // Average CPM in dollars

    // Simple calculation logic
    const dailyRevenue = (visitors / 1000) * cpm * (ctr / 2);
    const monthlyRevenue = dailyRevenue * 30;

    return (
        <section className="py-24 bg-foreground text-background border-t-2 border-background relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 text-background tracking-tighter">
                    Estimate Your <span className="text-primary text-outline-white">Earnings</span>
                </h2>

                <div className="bg-background text-foreground p-8 md:p-12 border-4 border-primary shadow-[12px_12px_0px_0px_#ffffff] max-w-4xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="space-y-12">

                        {/* Slider 1: Visitors */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label className="text-xl font-bold uppercase">Daily Visitors</label>
                                <span className="text-3xl font-black text-primary">{visitors.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="1000"
                                max="500000"
                                step="1000"
                                value={visitors}
                                onChange={(e) => setVisitors(Number(e.target.value))}
                                className="w-full h-6 bg-secondary rounded-none appearance-none cursor-pointer accent-primary border-2 border-foreground"
                            />
                            <div className="flex justify-between font-mono text-sm mt-2 text-muted-foreground font-bold">
                                <span>1K</span>
                                <span>500K</span>
                            </div>
                        </div>

                        {/* Slider 2: CTR (Engagement) */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label className="text-xl font-bold uppercase">Ad Engagement</label>
                                <span className="text-3xl font-black text-accent">{ctr}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="10"
                                step="0.1"
                                value={ctr}
                                onChange={(e) => setCtr(Number(e.target.value))}
                                className="w-full h-6 bg-secondary rounded-none appearance-none cursor-pointer accent-accent border-2 border-foreground"
                            />
                            <div className="flex justify-between font-mono text-sm mt-2 text-muted-foreground font-bold">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="grid md:grid-cols-2 gap-8 text-center border-t-4 border-dashed border-border pt-8">
                            <div className="p-4 border-2 border-transparent hover:border-primary transition-colors">
                                <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Daily Revenue</div>
                                <div className="text-5xl font-black text-primary leading-none">
                                    ${dailyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="p-4 border-2 border-transparent hover:border-accent transition-colors">
                                <div className="text-sm uppercase font-bold text-muted-foreground mb-2">Monthly Revenue</div>
                                <div className="text-5xl font-black text-accent leading-none">
                                    ${monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-foreground text-background font-black text-xl py-6 uppercase tracking-widest hover:bg-primary hover:text-white transition-all border-2 border-transparent hover:border-background shadow-[6px_6px_0px_0px_var(--color-secondary)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            Start Monetizing Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
