import { Booking, Equipment, Rental } from '../types';

const GAS_URL = "https://script.google.com/macros/s/AKfycbyTnTdLKWZ959kXmowDnDSvC9_ssMWDJm9sannFSjRcsGfbi27u3EW4F9tP7qsnhbmgXg/exec";

// 👉 cache in-memory (nhanh hơn sessionStorage)
const memoryCache: Record<string, any> = {};

/**
 * JSONP FETCH
 */
async function fetchGAS(params: Record<string, string>): Promise<any> {
  const query = new URLSearchParams(params).toString();

  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_' + Math.round(100000 * Math.random());

    (window as any)[callbackName] = (data: any) => {
      delete (window as any)[callbackName];
      const script = document.getElementById(callbackName);
      if (script) script.remove();
      resolve(data);
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `${GAS_URL}?${query}&callback=${callbackName}`;

    script.onerror = () => {
      delete (window as any)[callbackName];
      script.remove();
      reject(new Error('JSONP failed'));
    };

    document.body.appendChild(script);
  });
}

/**
 * CACHE HELPER
 */
function getCache(key: string) {
  if (memoryCache[key]) return memoryCache[key];

  const session = sessionStorage.getItem(key);
  if (session) {
    const parsed = JSON.parse(session);
    memoryCache[key] = parsed;
    return parsed;
  }

  return null;
}

function setCache(key: string, data: any) {
  memoryCache[key] = data;
  sessionStorage.setItem(key, JSON.stringify(data));
}

function clearCache(key: string) {
  delete memoryCache[key];
  sessionStorage.removeItem(key);
}

/**
 * API
 */
export const api = {

  // 🔥 LOAD 1 LẦN DUY NHẤT
  async getEquipment(): Promise<Equipment[]> {
    const cacheKey = 'equipment';

    const cached = getCache(cacheKey);
    if (cached) return cached;

    const data = await fetchGAS({ sheet: 'equipment' });
    setCache(cacheKey, data);

    return data;
  },

  // 🔥 LOAD 1 LẦN DUY NHẤT CHO BOOKING OPTIONS
  async getPackages(): Promise<any[]> {
    const cacheKey = 'options';

    const cached = getCache(cacheKey);
    if (cached) return cached;

    const data = await fetchGAS({ sheet: 'options' });
    setCache(cacheKey, data);

    return data;
  },

  // 🔥 cache theo từng equipment
  async getRentals(equipmentName: string): Promise<Rental[]> {
    const cacheKey = `rentals_${equipmentName}`;

    const cached = getCache(cacheKey);
    if (cached) return cached;

    const data = await fetchGAS({ sheet: 'rentals', equipmentName });
    setCache(cacheKey, data);

    return data;
  },

  async addBooking(booking: any) {
    const res = await fetchGAS({ 
      action: 'add', 
      sheet: 'bookings', 
      values: JSON.stringify([
        booking.name,
        booking.phone,
        booking.service,
        booking.price, // Thêm giá vào đây
        booking.date,
        booking.time
      ]) 
    });

    // ❗ clear cache liên quan
    clearCache('search_' + booking.phone);

    return res;
  },

  async addRental(rental: any) {
    const res = await fetchGAS({ 
      action: 'add', 
      sheet: 'rentals', 
      values: JSON.stringify([
        rental.equipmentName,
        rental.userName,
        rental.phone,
        rental.package,
        rental.totalPrice,
        rental.startDate
      ]) 
    });

    // ❗ clear cache rentals của máy đó
    clearCache(`rentals_${rental.equipmentName}`);

    return res;
  },

  // 🔥 cache search
  async searchByPhone(phone: string) {
    const cacheKey = `search_${phone}`;

    const cached = getCache(cacheKey);
    if (cached) return cached;

    const data = await fetchGAS({ phone });
    setCache(cacheKey, data);

    return data;
  }
};