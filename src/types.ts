export interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

export interface Equipment {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
}

export interface Rental {
  id: string;
  equipmentName: string;
  userName: string;
  phone: string;
  startDate: string;
  endDate: string;
  status: string;
}
