'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

export default function ContactPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';

                // Theme-adaptive classes
                const cardBg = isBrutalist ? 'bg-card border-2 border-foreground shadow-[10px_10px_0px_0px_var(--color-primary)]'
                    : isEditorial ? 'bg-white border border-gray-300 shadow-sm'
                        : 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur';
                const inputCls = isBrutalist ? 'w-full bg-transparent border-2 border-border p-4 font-bold focus:border-foreground focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all rounded-none'
                    : isEditorial ? 'w-full bg-[#FBF9F6] border border-gray-300 p-4 text-sm focus:outline-none focus:border-red-700 transition-all'
                        : 'w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-all';
                const labelCls = isBrutalist ? 'font-bold uppercase text-sm'
                    : isEditorial ? 'text-xs font-black uppercase tracking-widest text-gray-500'
                        : 'text-sm font-medium text-gray-400';
                const accent = theme === 'theme-luminous' ? 'lime-400' : theme === 'theme-azure' ? 'sky-400' : isEditorial ? 'red-700' : isBrutalist ? 'primary' : 'white';
                const btnCls = isBrutalist ? 'w-full bg-foreground text-background font-black text-xl py-5 uppercase tracking-widest hover:bg-accent hover:text-foreground transition-all border-2 border-transparent hover:border-foreground'
                    : isEditorial ? 'w-full bg-[#1A1A1A] text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors'
                        : theme === 'theme-luminous' ? 'w-full py-4 bg-lime-400 text-slate-900 font-bold rounded-xl hover:bg-lime-300 shadow-[0_0_20px_rgba(163,255,51,0.3)] transition-all'
                            : theme === 'theme-azure' ? 'w-full py-4 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all'
                                : 'w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors';
                const iconBoxCls = isBrutalist ? 'p-4 border-2 border-foreground bg-secondary'
                    : isEditorial ? 'p-3 border border-gray-300 bg-white'
                        : theme === 'theme-luminous' ? 'p-3 bg-lime-400/10 rounded-xl'
                            : theme === 'theme-azure' ? 'p-3 bg-sky-500/10 rounded-xl'
                                : 'p-3 bg-white/5 rounded-xl';

                return (
                    <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-16 text-center md:text-left">
                            <h1 className={`text-5xl md:text-7xl font-black leading-none ${isBrutalist ? 'uppercase tracking-tighter' : isEditorial ? 'tracking-tight' : 'tracking-tight'}`}>
                                {isBrutalist ? <>Let's <span className="text-outline text-transparent">Talk</span></> : isEditorial ? 'Get in Touch' : 'Contact Us'}
                            </h1>
                            <p className={`text-xl max-w-2xl mt-6 ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : ''} ${isBrutalist ? 'font-medium border-l-4 border-primary pl-4' : ''}`}>
                                Have a question about payments, ad formats, or integration? Our team is ready to help you scale.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            {/* Form */}
                            <div className={`${cardBg} p-8 md:p-12 relative`}>
                                {isBrutalist && <div className="absolute top-0 right-0 bg-primary text-white font-bold px-4 py-2 text-sm uppercase">Get In Touch</div>}
                                <form className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className={labelCls}>First Name</label><input type="text" className={inputCls} placeholder={isBrutalist ? 'JOHN' : 'John'} /></div>
                                        <div className="space-y-2"><label className={labelCls}>Last Name</label><input type="text" className={inputCls} placeholder={isBrutalist ? 'DOE' : 'Doe'} /></div>
                                    </div>
                                    <div className="space-y-2"><label className={labelCls}>Email Address</label><input type="email" className={inputCls} placeholder={isBrutalist ? 'HELLO@EXAMPLE.COM' : 'hello@example.com'} /></div>
                                    <div className="space-y-2"><label className={labelCls}>Subject</label>
                                        <select className={inputCls + ' appearance-none'}><option>General Inquiry</option><option>Publisher Support</option><option>Advertiser Support</option><option>Partnership</option></select>
                                    </div>
                                    <div className="space-y-2"><label className={labelCls}>Message</label><textarea rows="4" className={inputCls} placeholder={isBrutalist ? 'HOW CAN WE HELP?' : 'How can we help?'}></textarea></div>
                                    <button className={btnCls}>Send Message</button>
                                </form>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-8">
                                {[
                                    { icon: Mail, title: 'Email Us', lines: ['support@mrpop.io', 'sales@mrpop.io'] },
                                    { icon: Phone, title: 'Call Us', lines: ['+1 (555) 123-4567', 'Mon-Fri, 9am - 6pm EST'] },
                                    { icon: MapPin, title: 'Visit HQ', lines: ['123 AdTech Blvd, Suite 404', 'San Francisco, CA 94107'] },
                                ].map(({ icon: Icon, title, lines }) => (
                                    <div key={title} className="flex items-start gap-4">
                                        <div className={iconBoxCls}><Icon className="w-6 h-6" /></div>
                                        <div>
                                            <h3 className={`text-xl font-bold mb-1 ${isBrutalist ? 'uppercase' : ''}`}>{title}</h3>
                                            {lines.map((l, i) => <p key={i} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{l}</p>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
