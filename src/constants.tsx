
import type { Personnel, Sighting, Review, GalleryImage } from './types';
import {SafariType} from './types';

export const DRIVERS: Personnel[] = [
  { id: 'd1', name: 'Aruna Perera', role: 'driver', rating: 4.9, experience: '12 Years', image: 'https://picsum.photos/seed/driver1/400/500' },
  { id: 'd2', name: 'Sunil Silva', role: 'driver', rating: 4.7, experience: '8 Years', image: 'https://picsum.photos/seed/driver2/400/500' },
  { id: 'd3', name: 'Kamal Bandara', role: 'driver', rating: 4.5, experience: '5 Years', image: 'https://picsum.photos/seed/driver3/400/500' },
];

export const GUIDES: Personnel[] = [
  { id: 'g1', name: 'Nalin Gamage', role: 'guide', rating: 5.0, experience: '15 Years', image: 'https://picsum.photos/seed/guide1/400/500' },
  { id: 'g2', name: 'Sajith Kumara', role: 'guide', rating: 4.8, experience: '10 Years', image: 'https://picsum.photos/seed/guide2/400/500' },
];

export const MOCK_SIGHTINGS: Sighting[] = [
  { id: 's1', animal: 'Leopard', location: 'Zone 1 - Block A', time: '06:30 AM', coordinates: { x: 25, y: 30 } },
  { id: 's2', animal: 'Elephant Herd', location: 'Zone 2 - Lake', time: '08:15 AM', coordinates: { x: 60, y: 45 } },
  { id: 's3', animal: 'Sloth Bear', location: 'Zone 1 - Rocky Path', time: '05:45 PM', coordinates: { x: 40, y: 70 } },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', bookingId: 'BK101', userName: 'Julian M.', rating: 5, comment: 'Exquisite experience. The crowd management was noticeably better than our last visit.', type: SafariType.MORNING, date: '2024-05-10' },
  { id: 'r2', bookingId: 'BK102', userName: 'Sarah L.', rating: 4, comment: 'Beautiful sightings. Our guide was incredibly knowledgeable.', type: SafariType.EVENING, date: '2024-05-12' },
];

export const MOCK_GALLERY: GalleryImage[] = [
  { id: 'i1', bookingId: 'BK101', url: '/gallery/leopard1.jpg', category: 'Leopards', caption: 'Dawn patrol in Zone 1. A majestic leopard spots its prey.' },
  { id: 'i2', bookingId: 'BK105', url: '/gallery/leopard2.jpg', category: 'Leopards', caption: 'Resting on a Palu tree in the afternoon heat.' },
  { id: 'i3', bookingId: 'BK112', url: '/gallery/leopard3.jpg', category: 'Leopards', caption: 'Close-up of the Sri Lankan Leopard.' },
  
  { id: 'i4', bookingId: 'BK102', url: '/gallery/elephant1.jpg', category: 'Elephants', caption: 'Gentle giants roaming freely.' },
  { id: 'i5', bookingId: 'BK109', url: '/gallery/elephant2.jpg', category: 'Elephants', caption: 'A solitary tusker cooling off in the mud.' },
  { id: 'i6', bookingId: 'BK115', url: '/gallery/elephant3.jpg', category: 'Elephants', caption: 'A family herd migrating through the dry zone.' },
  
  { id: 'i7', bookingId: 'BK103', url: '/gallery/peacock1.jpg', category: 'Birds', caption: 'A vivid peacock displaying its full feathers.' },
  { id: 'i8', bookingId: 'BK121', url: '/gallery/peacock2.jpg', category: 'Birds', caption: 'Graceful bird taking flight over the wetlands.' },
  { id: 'i9', bookingId: 'BK125', url: '/gallery/peacock3.jpg', category: 'Birds', caption: 'Colorful plumage captured beautifully in the morning sun.' },
  
  { id: 'i10', bookingId: 'BK104', url: '/gallery/landscape1.jpg', category: 'Landscape', caption: 'Stunning rocky outcrops unique to Yala.' },
  { id: 'i11', bookingId: 'BK132', url: '/gallery/landscape2.jpg', category: 'Landscape', caption: 'The sprawling arid beauty of the national park plains.' },
  { id: 'i12', bookingId: 'BK140', url: '/gallery/landscape3.jpg', category: 'Landscape', caption: 'Golden twilight over the untouched sanctuary.' },
];

export const TIME_SLOTS = {
  [SafariType.MORNING]: ['06:00 AM', '06:30 AM', '07:00 AM'],
  [SafariType.EVENING]: ['02:30 PM', '03:00 PM', '03:30 PM'],
  [SafariType.FULL_DAY]: ['06:00 AM'],
};

export const CROWD_DENSITY_MOCK = (date: string, slot: string) => {
  // Simple deterministic density logic for demo
  const hash = (date + slot).length;
  if (hash % 3 === 0) return 'HIGH';
  if (hash % 3 === 1) return 'MEDIUM';
  return 'LOW';
};
