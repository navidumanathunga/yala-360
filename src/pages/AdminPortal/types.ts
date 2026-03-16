export type BookingStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';
export type SafariType = 'Morning' | 'Evening' | 'Full Day';
export type DriverStatus = 'Available' | 'On Safari' | 'Offline';
export type GuideStatus = 'Available' | 'On Safari' | 'Offline';

export interface Booking {
  id: string;
  touristName: string;
  safariType: SafariType;
  date: string;
  visitors: number;
  driverId: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  totalSafaris: number;
  vehicleType: string;
  vehicleCapacity: number;
  status: DriverStatus;
  rank?: number;
  experienceYears: number;
  score: number;
}

export interface Guide {
  id: string;
  name: string;
  rating: number;
  totalSafaris: number;
  specialSkills: string[];
  status: GuideStatus;
}

export interface Review {
  id: string;
  driverName: string;
  rating: number;
  text: string;
  date: string;
  status: 'Approved' | 'Flagged' | 'Pending';
}

export interface DensityData {
  day: string;
  jeeps: number;
  tourists: number;
  safaris: number;
}

export interface SuccessData {
  day: string;
  yala360: number;
  external: number;
}
