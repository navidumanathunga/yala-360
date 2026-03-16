import {
  MOCK_DRIVERS,
  MOCK_GUIDES,
  MOCK_DENSITY_DATA,
  MOCK_SUCCESS_DATA,
  MOCK_REVIEWS,
} from '../mockData';
import {
  getAllBookings,
  getTodayBookings,
  getBookingsCount,
  cancelBooking as firestoreCancelBooking,
  updateBookingStatus,
} from '../../../services/firebaseBooking';

/**
 * Admin API Service — uses Firestore for bookings, mock data for everything else
 */

export const api = {
  // ── Dashboard ──────────────────────────────────────────────
  getDashboardMetrics: async (range: string = 'today') => {
    try {
      const todayBookings = await getTodayBookings();
      const totalCount   = await getBookingsCount();

      const totalVisitors   = todayBookings.reduce((acc, b) => acc + (b.visitors || 0), 0);
      const activeSafaris   = todayBookings.filter(b => b.status === 'Confirmed').length;
      const revenue         = todayBookings
        .filter(b => b.paymentStatus === 'Paid')
        .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

      return {
        totalBookingsToday: todayBookings.length,
        totalVisitorsToday: totalVisitors,
        activeSafaris,
        driversOnSafari: MOCK_DRIVERS.filter(d => d.status === 'On Safari').length,
        driversAvailable: MOCK_DRIVERS.filter(d => d.status === 'Available').length,
        averageParkDensity: Math.min(Math.round((activeSafaris / 50) * 100), 100),
        revenue,
        totalBookings: totalCount,
      };
    } catch (err) {
      console.error('getDashboardMetrics error:', err);
      return {
        totalBookingsToday: 0,
        totalVisitorsToday: 0,
        activeSafaris: 0,
        driversOnSafari: 0,
        driversAvailable: 0,
        averageParkDensity: 0,
        revenue: 0,
        totalBookings: 0,
      };
    }
  },

  // ── Analytics ──────────────────────────────────────────────
  getCrowdDensity: async () => {
    return {
      densityData: MOCK_DENSITY_DATA.map(d => ({
        date: d.day,
        totalJeeps: d.jeeps,
        totalTourists: d.tourists
      }))
    };
  },

  getBookingComparison: async () => {
    return {
      comparisonData: MOCK_SUCCESS_DATA.map(s => ({
        date: s.day,
        bookedThroughPlatform: s.yala360,
        nonPlatformSafaris: s.external
      }))
    };
  },

  // ── Bookings ───────────────────────────────────────────────
  getBookings: async (params: { page?: number; limit?: number; search?: string; safariType?: string; date?: string }) => {
    try {
      const all = await getAllBookings();
      let filtered = all;

      // Search filter
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(b =>
          b.bookingId?.toLowerCase().includes(s) ||
          b.touristName?.toLowerCase().includes(s) ||
          b.email?.toLowerCase().includes(s)
        );
      }

      // Safari type filter
      if (params.safariType && params.safariType !== 'All') {
        filtered = filtered.filter(b => b.safariType === params.safariType || b.safariTitle === params.safariType);
      }

      // Date filter
      if (params.date) {
        filtered = filtered.filter(b => b.date === params.date);
      }

      // Map to Admin Portal expected shape
      const bookings = filtered.map(b => ({
        id: b.bookingId,
        docId: b.id,              // Firestore document ID (for updates)
        touristName: b.touristName,
        safariType: b.safariTitle || b.safariType,
        date: b.date,
        visitors: b.visitors,
        driverId: b.driverIds?.[0] || '',
        paymentStatus: b.paymentStatus,
        status: b.status,
        email: b.email,
        phone: b.phone,
        totalPrice: b.totalPrice,
        driverName: b.driverName,
        vehicleType: b.vehicleType,
      }));

      const page  = params.page || 1;
      const limit = params.limit || 50;
      const start = (page - 1) * limit;
      const paged = bookings.slice(start, start + limit);

      return {
        bookings: paged,
        totalPages: Math.ceil(bookings.length / limit),
        total: bookings.length
      };
    } catch (err) {
      console.error('getBookings error:', err);
      return { bookings: [], totalPages: 1, total: 0 };
    }
  },

  reassignDriver: async (bookingId: string, driverId: string) => {
    return { success: true };
  },

  cancelBooking: async (bookingId: string) => {
    try {
      // bookingId here is the Firestore doc ID (docId)
      await firestoreCancelBooking(bookingId);
      return { success: true };
    } catch (err) {
      console.error('cancelBooking error:', err);
      throw err;
    }
  },

  autoReassignDriver: async (bookingId: string) => {
    return { success: true, message: 'Driver auto-reassigned', newDriverId: MOCK_DRIVERS[0].id };
  },

  // ── Drivers ────────────────────────────────────────────────
  getDrivers: async () => {
    return { drivers: MOCK_DRIVERS };
  },

  removeDriver: async (id: string) => {
    return { success: true };
  },

  approveDriver: async (id: string) => {
    return { success: true };
  },

  suspendDriver: async (id: string) => {
    return { success: true };
  },

  // ── Guides ─────────────────────────────────────────────────
  getGuides: async () => {
    return { guides: MOCK_GUIDES };
  },

  removeGuide: async (id: string) => {
    return { success: true };
  },

  // ── Rankings ───────────────────────────────────────────────
  getRankings: async () => {
    return {
      rankings: MOCK_DRIVERS.map(d => ({ ...d, rankingScore: d.score }))
        .sort((a, b) => b.rankingScore - a.rankingScore)
    };
  },

  // ── QR Verification ────────────────────────────────────────
  verifyBooking: async (bookingId: string) => {
    try {
      const all     = await getAllBookings();
      const booking = all.find(b => b.bookingId === bookingId);
      if (!booking) throw new Error('Booking not found');
      return { success: true, booking };
    } catch (err) {
      throw err;
    }
  },

  // ── Reviews ────────────────────────────────────────────────
  getReviews: async () => {
    return { reviews: MOCK_REVIEWS };
  },

  approveReview: async (id: string) => {
    return { success: true };
  },

  deleteReview: async (id: string) => {
    return { success: true };
  },

  flagReview: async (id: string) => {
    return { success: true };
  },

  // ── Notifications ──────────────────────────────────────────
  getTourists: async (search?: string) => {
    try {
      const all = await getAllBookings();
      const tourists = all
        .filter(b => !search || b.touristName?.toLowerCase().includes(search.toLowerCase()))
        .map(b => ({ id: b.bookingId, name: b.touristName, phone: b.phone || '' }));
      return { tourists };
    } catch {
      return { tourists: [] };
    }
  },

  sendNotification: async (data: unknown) => {
    return { success: true };
  },

  // ── System ─────────────────────────────────────────────────
  clearCache: async () => {
    return { success: true, message: 'System cache cleared successfully' };
  },

  // ── Settings ───────────────────────────────────────────────
  getSettings: async () => {
    return {
      settings: {
        maxJeepsPerSlot: 50,
        platformFee: 15,
        openingTime: '06:00',
        closingTime: '18:00',
        maintenanceMode: false
      }
    };
  },

  updateSettings: async (settings: unknown) => {
    return { success: true, message: 'Settings saved', settings };
  },

  // ── Gallery ────────────────────────────────────────────────
  getGallery: async () => {
    return { images: [] };
  },

  addGalleryImage: async (data: { url: string; title?: string }) => {
    return { success: true, image: { id: Date.now().toString(), ...data } };
  },

  removeGalleryImage: async (id: string) => {
    return { success: true };
  },

  // ── Map Management ─────────────────────────────────────────
  getMapLocations: async (_params: { type?: string; search?: string; status?: string } = {}) => {
    return { locations: [] };
  },

  addMapLocation: async (data: unknown) => {
    return { success: true, location: { id: Date.now().toString(), ...(data as object) } };
  },

  updateMapLocation: async (id: string, data: unknown) => {
    return { success: true };
  },

  deleteMapLocation: async (id: string) => {
    return { success: true };
  },

  // ── Animal Sightings ───────────────────────────────────────
  getAnimalSightings: async () => {
    return { sightings: [] };
  },

  updateAnimalSighting: async (id: string, data: unknown) => {
    return { success: true };
  },

  deleteAnimalSighting: async (id: string) => {
    return { success: true };
  }
};
