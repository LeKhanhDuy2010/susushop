import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { Equipment as EquipmentType, Rental } from '../types';
import ReceiptCard from '../components/shared/ReceiptCard';

export default function Equipment() {
  const [items, setItems] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EquipmentType | null>(null);

  useEffect(() => {
    api.getEquipment().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto w-full"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-primary-text mb-4">Catalog thiết bị</h2>
        <p className="text-rose-400 text-xs font-bold uppercase tracking-[0.4em] italic">Professional gear for your creativity</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-accent-pink" size={48} />
          <p className="text-rose-300 font-black tracking-widest animate-pulse">ĐANG TẢI DỮ LIỆU...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(item => (
            <motion.div 
              key={item.id} 
              className="bento-card p-5 group flex flex-col h-full"
              whileHover={{ y: -5 }}
            >
              <div className="h-56 overflow-hidden rounded-[20px] mb-5 relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-black text-primary-text shadow-sm italic">PRO GEAR</div>
              </div>
              <div className="px-1 flex-grow flex flex-col">
                <h3 className="text-xl font-black text-primary-text mb-2 tracking-tight group-hover:text-accent-pink transition-colors">{item.name}</h3>
                <p className="text-rose-400 text-xs font-medium mb-8 line-clamp-2 leading-relaxed">{item.desc}</p>
                <div className="mt-auto flex justify-between items-center bg-soft-pink/50 p-4 rounded-2xl border border-rose-50">
                  <div>
                    <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest leading-none mb-1">Giá thuê</p>
                    <p className="text-rose-600 font-black text-lg">{item.price.toLocaleString()}đ<span className="text-[10px] font-bold text-rose-400 ml-1">/ ngày</span></p>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(item)} 
                    className="w-12 h-12 bg-accent-pink text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Package size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <RentalModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RentalModal({ item, onClose }: { item: EquipmentType; onClose: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ userName: '', phone: '', startDate: today, endDate: today });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rentals, setRentals] = useState<Rental[]>([]);

  useEffect(() => {
    api.getRentals(item.name).then(setRentals);
  }, [item.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.length !== 10) return alert('SĐT phải đủ 10 số');
    setSubmitting(true);
    try {
      const res = await api.addRental({ equipmentName: item.name, ...form });
      if (res.status === 'success') {
        setSuccess(true);
      } else {
        alert(res.message || 'Lỗi hệ thống');
      }
    } catch (err) {
      alert('Gửi yêu cầu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-primary-text/30 backdrop-blur-md" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-xl rounded-[40px] p-8 md:p-10 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {success ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
              <Package size={40} />
            </div>
            <h3 className="text-3xl font-black text-primary-text mb-4">ĐÃ GỬI YÊU CẦU</h3>
            <p className="text-rose-400 font-medium mb-10 max-w-xs mx-auto">SuSu Shop sẽ liên hệ với bạn sớm nhất để xác nhận tình trạng máy.</p>
            <button 
              onClick={onClose} 
              className="w-full py-5 bg-accent-pink text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-rose-200"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-black text-primary-text uppercase tracking-tight mb-2">Thuê {item.name}</h3>
            
            {rentals.length > 0 && (
              <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Lịch bận gần đây:
                </p>
                <div className="flex flex-wrap gap-2">
                  {rentals.slice(-3).map((r, i) => (
                    <span key={i} className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-bold text-rose-600 border border-rose-100 italic">
                      {r.startDate} → {r.endDate}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Tên khách hàng</label>
                <input required className="w-full px-6 py-4 rounded-3xl bg-soft-pink/50 border border-rose-50 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text shadow-sm" placeholder="Nhập tên của bạn" value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Số điện thoại</label>
                <input required className="w-full px-6 py-4 rounded-3xl bg-soft-pink/50 border border-rose-50 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text shadow-sm" placeholder="Nhập số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Từ ngày</label>
                  <input required type="date" className="w-full px-6 py-4 rounded-3xl bg-soft-pink/50 border border-rose-50 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text text-sm" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Đến ngày</label>
                  <input required type="date" className="w-full px-6 py-4 rounded-3xl bg-soft-pink/50 border border-rose-50 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text text-sm" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
            </div>

            <button 
              disabled={submitting} 
              className="w-full py-5 bg-accent-pink text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Đang xử lý...
                </>
              ) : 'Xác nhận thuê máy'}
            </button>
            <button type="button" onClick={onClose} className="w-full py-2 text-rose-300 font-bold text-[10px] uppercase tracking-widest hover:text-rose-400 transition-colors">Bỏ qua</button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
