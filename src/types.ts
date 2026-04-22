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
  price4h: number;
  price1d: number;
  price2d: number;
  price3d: number;
  desc: string;
  image: string;
}

export interface Rental {
  id: string;
  equipmentName: string;
  userName: string;
  phone: string;
  package: string;
  totalPrice: number;
  startDate: string;
  status: string;
}
