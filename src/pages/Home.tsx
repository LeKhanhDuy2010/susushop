import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Hero Card */}
        <div className="md:col-span-8 bento-card p-10 md:p-16 flex flex-col justify-center relative overflow-hidden bg-white">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-soft-pink text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 italic">Emotion in every frame</span>
            <h2 className="text-5xl md:text-7xl font-black leading-tight text-primary-text mb-8">
              Lưu giữ <br /> <span className="text-accent-pink italic text-6xl md:text-8xl">khoảnh khắc</span>
            </h2>
            <p className="text-rose-400 text-sm md:text-base mb-10 max-w-md font-medium leading-relaxed">
              Nâng tầm câu chuyện của bạn qua từng ống kính. Dịch vụ chuyên nghiệp & thiết bị cao cấp tại SuSu Shop.
            </p>
            <Link 
              to="/booking" 
              className="inline-block px-10 py-4 bg-accent-pink text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-200 hover:scale-105 transition-transform tracking-widest uppercase"
            >
              Bắt đầu ngay
            </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-soft-pink rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        </div>

        {/* Promo Card */}
        <div className="md:col-span-4 bg-accent-pink rounded-[32px] p-10 text-white flex flex-col justify-between shadow-2xl shadow-rose-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 text-3xl">✨</div>
            <h3 className="text-3xl font-black mb-4">Ưu đãi hôm nay</h3>
            <p className="text-rose-50 font-medium leading-relaxed">Giảm ngay 20% cho các gói chụp Studio trong tuần này.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Limited time offer</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white/40 backdrop-blur-sm rounded-[32px] p-8 border border-rose-100">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h3 className="text-xl font-black text-primary-text uppercase tracking-tight">Tra cứu thông tin đặt lịch</h3>
          <SearchBar />
        </div>
      </div>
    </motion.div>
  );
}

function SearchBar() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return alert('Số điện thoại phải đủ 10 số');
    setLoading(true);
    try {
      const data = await api.searchByPhone(phone);
      setResults(data);
      setShowModal(true);
    } catch (err) {
      alert('Tra cứu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="tel" 
          className="w-full pl-6 pr-16 py-4 rounded-3xl bg-white border-2 border-rose-100 focus:border-accent-pink outline-none transition-all font-bold text-primary-text shadow-xl shadow-rose-200/20" 
          placeholder="Nhập SĐT của bạn..." 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-pink text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-text/20 backdrop-blur-md" 
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[32px] p-8 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-black mb-8 text-primary-text uppercase tracking-tight">Kết quả cho: {phone}</h3>
              
              {results?.bookings?.length > 0 || results?.rentals?.length > 0 ? (
                <div className="space-y-6">
                  {results.bookings.map((b: any, i: number) => (
                    <div key={i} className="bg-soft-pink p-5 rounded-2xl border border-rose-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-accent-pink text-white text-[10px] px-2 py-1 rounded-lg font-black italic">CHỤP ẢNH</span>
                        <span className="text-xs font-bold text-rose-400">{b.date}</span>
                      </div>
                      <h4 className="font-black text-primary-text">{b.service}</h4>
                      <p className="text-xs font-medium text-rose-500 mt-1">Trạng thái: {b.status}</p>
                    </div>
                  ))}
                  {results.rentals.map((r: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-primary-text text-white text-[10px] px-2 py-1 rounded-lg font-black italic">THUÊ MÁY</span>
                        <span className="text-xs font-bold text-rose-400">{r.startDate}</span>
                      </div>
                      <h4 className="font-black text-primary-text">{r.equipmentName}</h4>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-rose-400 italic">Gói: {r.package}</span>
                        {r.totalPrice && (
                          <span className="text-xs font-black text-accent-pink">{Number(r.totalPrice).toLocaleString()}đ</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-rose-300 font-black italic uppercase tracking-widest">Không tìm thấy dữ liệu</div>
              )}
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full mt-10 py-4 bg-soft-pink text-accent-pink rounded-2xl font-black uppercase tracking-widest"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
