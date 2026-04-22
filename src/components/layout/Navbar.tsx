import React from 'react';
import { Camera, Calendar, Package, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-2">
      <Link to="/" className="group">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 bg-accent-pink rounded-full flex items-center justify-center text-white text-lg shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
            <Camera size={20} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-primary-text leading-tight">SuSu Shop</h1>
            <p className="text-rose-400 text-[10px] font-bold uppercase tracking-[0.2em] -mt-1 ml-1">Photography Studio</p>
          </div>
        </div>
      </Link>

      <nav className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-bento-border shadow-sm">
        <NavButton to="/" icon={<Info size={16} />} label="Trang chủ" />
        <NavButton to="/booking" icon={<Calendar size={16} />} label="Đặt lịch" />
        <NavButton to="/equipment" icon={<Package size={16} />} label="Thuê máy" />
      </nav>
    </header>
  );
}

function NavButton({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-bold text-xs uppercase tracking-wider ${
        active
          ? 'bg-accent-pink text-white shadow-lg shadow-rose-200'
          : 'text-rose-400 hover:text-primary-text'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
