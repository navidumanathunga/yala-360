import { Booking, Driver, Guide, DensityData, SuccessData, Review } from './types';

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'BK-1001', touristName: 'Alexander Wright', safariType: 'Morning', date: '2026-03-11', visitors: 4, driverId: 'DR-001', paymentStatus: 'Paid', status: 'Confirmed' },
  { id: 'BK-1002', touristName: 'Elena Rodriguez', safariType: 'Evening', date: '2026-03-11', visitors: 2, driverId: 'DR-005', paymentStatus: 'Paid', status: 'On Safari' as any },
  { id: 'BK-1003', touristName: 'Marcus Chen', safariType: 'Full Day', date: '2026-03-12', visitors: 6, driverId: 'DR-003', paymentStatus: 'Pending', status: 'Pending' },
  { id: 'BK-1004', touristName: 'Sophia Muller', safariType: 'Morning', date: '2026-03-10', visitors: 3, driverId: 'DR-002', paymentStatus: 'Paid', status: 'Completed' },
  { id: 'BK-1005', touristName: 'James Wilson', safariType: 'Evening', date: '2026-03-11', visitors: 5, driverId: 'DR-008', paymentStatus: 'Paid', status: 'Confirmed' },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 'DR-001', name: 'Sunil Perera', rating: 4.9, totalSafaris: 1240, vehicleType: 'Land Cruiser', vehicleCapacity: 6, status: 'Available', experienceYears: 12, score: 98 },
  { id: 'DR-002', name: 'Kamal Silva', rating: 4.7, totalSafaris: 850, vehicleType: 'Hilux', vehicleCapacity: 6, status: 'On Safari', experienceYears: 8, score: 85 },
  { id: 'DR-003', name: 'Nimal Jayasuriya', rating: 4.8, totalSafaris: 2100, vehicleType: 'Land Cruiser', vehicleCapacity: 8, status: 'Offline', experienceYears: 15, score: 92 },
  { id: 'DR-004', name: 'Aruna Kumara', rating: 4.6, totalSafaris: 420, vehicleType: 'Hilux', vehicleCapacity: 6, status: 'Available', experienceYears: 4, score: 78 },
  { id: 'DR-005', name: 'Dinesh Rathnayake', rating: 5.0, totalSafaris: 150, vehicleType: 'Land Cruiser', vehicleCapacity: 6, status: 'On Safari', experienceYears: 2, score: 95 },
];

export const MOCK_GUIDES: Guide[] = [
  { id: 'GD-001', name: 'Ravi Mendis', rating: 4.9, totalSafaris: 560, specialSkills: ['Bird Watching', 'Photography'], status: 'Available' },
  { id: 'GD-002', name: 'Saman Kumara', rating: 4.8, totalSafaris: 890, specialSkills: ['Leopard Tracking'], status: 'On Safari' },
];

export const MOCK_DENSITY_DATA: DensityData[] = [
  { day: 'Mon', jeeps: 45, tourists: 180, safaris: 42 },
  { day: 'Tue', jeeps: 38, tourists: 150, safaris: 35 },
  { day: 'Wed', jeeps: 52, tourists: 210, safaris: 48 },
  { day: 'Thu', jeeps: 48, tourists: 195, safaris: 45 },
  { day: 'Fri', jeeps: 65, tourists: 280, safaris: 60 },
  { day: 'Sat', jeeps: 85, tourists: 340, safaris: 78 },
  { day: 'Sun', jeeps: 75, tourists: 310, safaris: 70 },
];

export const MOCK_SUCCESS_DATA: SuccessData[] = [
  { day: 'Week 1', yala360: 120, external: 80 },
  { day: 'Week 2', yala360: 145, external: 75 },
  { day: 'Week 3', yala360: 180, external: 60 },
  { day: 'Week 4', yala360: 210, external: 55 },
  { day: 'Week 5', yala360: 250, external: 45 },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'RV-001', driverName: 'Sunil Perera', rating: 5, text: 'Amazing experience! Sunil was very knowledgeable about leopard spots.', date: '2026-03-10', status: 'Approved' },
  { id: 'RV-002', driverName: 'Kamal Silva', rating: 4, text: 'Great safari, saw many elephants. The vehicle was comfortable.', date: '2026-03-09', status: 'Approved' },
];
