import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';
import ReceiptCard from '../components/shared/ReceiptCard';

export default function Booking() {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ name: '', phone: '', service: 'Gói cá nhân', date: today, time: '08:00' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) return alert('SĐT phải đủ 10 số');
    setSubmitting(true);
    try {
      const res = await api.addBooking(formData);
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-xl mx-auto w-full"
    >
      <div className="bento-card overflow-hidden">
        <div className="bg-soft-pink p-6 border-b border-rose-100">
          <h2 className="text-2xl font-black text-primary-text uppercase tracking-tight">Thông tin đặt lịch</h2>
          <p className="text-rose-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Vui lòng điền đầy đủ thông tin</p>
        </div>
        <div className="p-8">
          {success ? (
            <ReceiptCard data={formData} onClose={() => setSuccess(false)} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                <input 
                  required 
                  className="w-full px-5 py-3 rounded-2xl bg-soft-pink/50 border border-rose-100 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text" 
                  placeholder="Nhập tên của bạn" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Số điện thoại</label>
                <input 
                  required 
                  type="tel" 
                  className="w-full px-5 py-3 rounded-2xl bg-soft-pink/50 border border-rose-100 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text" 
                  placeholder="Ví dụ: 0912345678" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Dịch vụ</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl bg-soft-pink/50 border border-rose-100 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text appearance-none" 
                  value={formData.service} 
                  onChange={e => setFormData({...formData, service: e.target.value})}
                >
                  <option>Gói cá nhân</option>
                  <option>Gói couple</option>
                  <option>Gói studio</option>
                  <option>Gói ngoại cảnh</option>
                  <option>Gói sự kiện</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Ngày chụp</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-5 py-3 rounded-2xl bg-soft-pink/50 border border-rose-100 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text text-sm" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5 ml-1">Giờ chụp</label>
                  <input 
                    required 
                    type="time" 
                    className="w-full px-5 py-3 rounded-2xl bg-soft-pink/50 border border-rose-100 outline-none focus:border-accent-pink focus:bg-white transition-all font-bold text-primary-text text-sm" 
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                disabled={submitting} 
                className="w-full py-4 bg-accent-pink text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-200 mt-4 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang xử lý...
                  </>
                ) : 'Xác nhận đặt lịch'}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
