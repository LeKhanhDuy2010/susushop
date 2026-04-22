import { useRef } from 'react';
import html2canvas from 'html2canvas';

interface ReceiptCardProps {
  data: any;
  onClose: () => void;
}

export default function ReceiptCard({ data, onClose }: ReceiptCardProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const takeScreenshot = () => {
    if (receiptRef.current) {
      const btn = document.activeElement as HTMLButtonElement;
      if (btn) btn.disabled = true;
      
      html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `susu-shop-receipt-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(err => {
        console.error('Lỗi khi lưu ảnh:', err);
        alert('Không thể lưu ảnh. Vui lòng thử chụp màn hình thủ công.');
      }).finally(() => {
        if (btn) btn.disabled = false;
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={receiptRef}
        className="bg-white p-8 rounded-3xl border-2 border-dashed border-rose-200 w-full mb-6"
      >
        <div className="text-center mb-6 border-b pb-4 border-rose-50">
          <h2 className="text-2xl font-black text-primary-text">SUSU SHOP</h2>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Biên nhận dịch vụ</p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Khách hàng</span>
            <span className="font-black">{data.name || data.userName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Số điện thoại</span>
            <span className="font-medium">{data.phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Dịch vụ</span>
            <span className="font-black text-accent-pink">{data.service || data.equipmentName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Thời gian</span>
            <span className="font-medium">
              {data.date ? `${data.date} ${data.time ? `| ${data.time}` : ''}` : `${data.startDate} → ${data.endDate}`}
            </span>
          </div>
          {data.totalPrice && (
            <div className="flex justify-between text-sm pt-2 border-t border-rose-50 mt-2">
              <span className="font-bold">Tổng thanh toán</span>
              <span className="font-black text-accent-pink">{data.totalPrice.toLocaleString()}đ</span>
            </div>
          )}
        </div>
        <div className="mt-8 pt-4 border-t border-rose-50 text-center">
          <p className="text-[8px] font-bold text-rose-300 uppercase tracking-widest">Cảm ơn bạn đã tin tưởng SuSu Shop</p>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={takeScreenshot}
          className="px-6 py-2 bg-white border border-rose-200 rounded-xl text-accent-pink font-bold text-xs hover:bg-soft-pink transition-colors"
        >
          Lưu ảnh
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-accent-pink text-white rounded-xl font-bold text-xs hover:scale-105 transition-transform"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
