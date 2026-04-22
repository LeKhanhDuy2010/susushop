import { Booking, Equipment, Rental } from '../types';

const GAS_URL = "https://script.google.com/macros/s/AKfycbw_ys9rBkYY2o4kz9AfDwxEEnrfBbXJn9g_mdhOniYHyz4JDhcOOPMDQQvy1_Ihtu8CIg/exec";

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

export const api = {
  async getEquipment(): Promise<Equipment[]> {
    return await fetchGAS({ sheet: 'equipment' });
  },

  async getRentals(equipmentName: string): Promise<Rental[]> {
    return await fetchGAS({ sheet: 'rentals', equipmentName });
  },

  async addBooking(booking: any) {
    return await fetchGAS({ 
      action: 'add', 
      sheet: 'bookings', 
      values: JSON.stringify([booking.name, booking.phone, booking.service, booking.date, booking.time]) 
    });
  },

  async addRental(rental: any) {
    return await fetchGAS({ 
      action: 'add', 
      sheet: 'rentals', 
      values: JSON.stringify([rental.equipmentName, rental.userName, rental.phone, rental.startDate, rental.endDate]) 
    });
  },

  async searchByPhone(phone: string) {
    return await fetchGAS({ phone });
  }
};
