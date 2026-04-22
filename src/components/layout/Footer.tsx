import React from 'react';
import { Instagram, Facebook, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bento-card p-8 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 bg-white/40 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-pink rounded-full flex items-center justify-center text-white text-xs font-black">S</div>
        <span className="text-sm font-black text-primary-text uppercase tracking-widest">SuSu Shop © 2024</span>
      </div>
      
      <div className="flex gap-4">
        <SocialLink href="#" icon={<Instagram size={18} />} />
        <SocialLink href="#" icon={<Facebook size={18} />} />
        <SocialLink href="#" icon={<Phone size={18} />} />
      </div>
      
      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Ghi lại vẻ đẹp trong trẻo nhất</p>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-accent-pink hover:text-white transition-all transform hover:scale-110"
    >
      {icon}
    </a>
  );
}
