'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function TrustSection() {
    return (
        <section className="py-16 border-y-2 border-foreground bg-background overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 text-center mb-12">
                <p className="font-bold uppercase tracking-widest text-muted-foreground mb-4">Trusted by Industry Leaders</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {['Google', 'AdCash', 'Propeller', 'ClickDealer', 'Mobidea', 'Zeydoo'].map((brand) => (
                        <div key={brand} className="text-2xl md:text-4xl font-black text-foreground uppercase select-none">
                            {brand}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-3 border-t-2 border-foreground divide-y md:divide-y-0 md:divide-x border-b-2">
                {[
                    { title: "Clean Ads", desc: "No malware. 24/7 scanning." },
                    { title: "Anti-Fraud", desc: "Bot filtration system included." },
                    { title: "Fast Support", desc: "Response time under 1 hour." }
                ].map((item, i) => (
                    <div key={i} className="p-8 text-center hover:bg-secondary transition-colors group">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                        <h3 className="font-black uppercase text-xl mb-1">{item.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
