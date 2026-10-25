import { DriverInfo, TripInfoData } from '../types/navigation';
import { storageService } from './storage';

export type RideStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface BookedRide {
  id: string;
  bookingId: string;
  driver: DriverInfo;
  tripInfo: TripInfoData;
  agreedFare: number;
  bookingToken?: number;
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
}

const RIDES_STORAGE_KEY = 'gaadimitra_booked_rides_list';

// Realistic sample rides across all status categories
export const DEFAULT_SAMPLE_RIDES: BookedRide[] = [
  {
    id: 'ride_active_1',
    bookingId: '#RIDE10245',
    driver: {
      id: 'drv_1',
      name: 'Rahul Kumar',
      phone: '+919876543210',
      rating: '4.8',
      totalRides: 286,
      experienceYears: 5,
      distance: '1.2 km away',
      isVerified: true,
      vehicleModel: 'Maruti Dzire',
      vehicleType: 'Car',
      vehiclePlate: 'BR01AB1234',
      hasAc: true,
      seatingCapacity: '4 Seats',
      pricePerKm: '₹14 / km',
    },
    tripInfo: {
      pickupLocation: 'Patna Junction',
      destination: 'Gaya',
      date: 'Today',
      pickupTime: '5:00 PM',
      passengers: '4 People',
      vehicleModel: 'Maruti Dzire',
    },
    agreedFare: 1500,
    bookingToken: 200,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ride_pending_1',
    bookingId: '#RIDE10219',
    driver: {
      id: 'drv_2',
      name: 'Amit Sharma',
      phone: '+919812345678',
      rating: '4.9',
      totalRides: 412,
      experienceYears: 7,
      distance: '2.5 km away',
      isVerified: true,
      vehicleModel: 'Hyundai Aura',
      vehicleType: 'Car',
      vehiclePlate: 'BR01CD5678',
      hasAc: true,
      seatingCapacity: '4 Seats',
      pricePerKm: '₹13 / km',
    },
    tripInfo: {
      pickupLocation: 'Bailey Road, Patna',
      destination: 'Muzaffarpur City',
      date: 'Tomorrow',
      pickupTime: '8:30 AM',
      passengers: '3 People',
      vehicleModel: 'Hyundai Aura',
    },
    agreedFare: 1800,
    bookingToken: 200,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ride_completed_1',
    bookingId: '#RIDE10182',
    driver: {
      id: 'drv_3',
      name: 'Vikram Singh',
      phone: '+919833445566',
      rating: '4.9',
      totalRides: 520,
      experienceYears: 8,
      distance: 'City Trip',
      isVerified: true,
      vehicleModel: 'Toyota Innova Crysta',
      vehicleType: 'SUV',
      vehiclePlate: 'BR01EF9012',
      hasAc: true,
      seatingCapacity: '7 Seats',
      pricePerKm: '₹22 / km',
    },
    tripInfo: {
      pickupLocation: 'Patna Airport (PAT)',
      destination: 'Rajendra Nagar, Patna',
      date: '18 Aug 2026',
      pickupTime: '2:15 PM',
      passengers: '5 People',
      vehicleModel: 'Toyota Innova Crysta',
    },
    agreedFare: 850,
    bookingToken: 150,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'ride_cancelled_1',
    bookingId: '#RIDE10094',
    driver: {
      id: 'drv_4',
      name: 'Suresh Yadav',
      phone: '+919877665544',
      rating: '4.7',
      totalRides: 198,
      experienceYears: 4,
      distance: '3.1 km away',
      isVerified: true,
      vehicleModel: 'Maruti Ertiga',
      vehicleType: '7-Seater',
      vehiclePlate: 'BR01GH3456',
      hasAc: true,
      seatingCapacity: '6 Seats',
      pricePerKm: '₹18 / km',
    },
    tripInfo: {
      pickupLocation: 'Kankarbagh, Patna',
      destination: 'Varanasi Cantt, Varanasi',
      date: '10 Aug 2026',
      pickupTime: '6:00 AM',
      passengers: '6 People',
      vehicleModel: 'Maruti Ertiga',
    },
    agreedFare: 3200,
    bookingToken: 300,
    status: 'cancelled',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

// In-memory rides state loaded from storage (no hardcoded/dummy default rides)
let inMemoryRides: BookedRide[] = storageService.getObject<BookedRide[]>(RIDES_STORAGE_KEY) || [];

const listeners = new Set<() => void>();
const notifyRideListeners = () => {
  listeners.forEach(fn => {
    try {
      fn();
    } catch {}
  });
};

export const ridesService = {
  /**
   * Get all booked rides
   */
  getAllRides: (): BookedRide[] => {
    return [...inMemoryRides];
  },

  /**
   * Get current active/pending ride (neither completed nor cancelled)
   */
  getActiveRide: (): BookedRide | undefined => {
    return inMemoryRides.find(r => r.status !== 'completed' && r.status !== 'cancelled');
  },

  /**
   * Subscribe to ride changes
   */
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Get rides filtered by status
   */
  getRidesByStatus: (status?: RideStatus): BookedRide[] => {
    if (!status) return inMemoryRides;
    return inMemoryRides.filter(r => r.status === status);
  },

  /**
   * Save a newly confirmed or pending ride
   */
  saveRide: (newRide: Omit<BookedRide, 'id' | 'createdAt' | 'updatedAt'>): BookedRide => {
    const existing = inMemoryRides.find(r => r.bookingId === newRide.bookingId);
    const ride: BookedRide = {
      ...newRide,
      id: existing?.id || `ride_${Date.now()}`,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Prepend to top of list
    inMemoryRides = [ride, ...inMemoryRides.filter(r => r.bookingId !== ride.bookingId)];
    storageService.setObject(RIDES_STORAGE_KEY, inMemoryRides);
    notifyRideListeners();
    return ride;
  },

  /**
   * Update ride status (e.g. active -> completed, or pending -> cancelled)
   */
  updateRideStatus: (bookingId: string, status: RideStatus): void => {
    inMemoryRides = inMemoryRides.map(ride => {
      if (ride.bookingId === bookingId) {
        return {
          ...ride,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return ride;
    });
    storageService.setObject(RIDES_STORAGE_KEY, inMemoryRides);
    notifyRideListeners();
  },

  /**
   * Get ride by booking ID
   */
  getRideByBookingId: (bookingId: string): BookedRide | undefined => {
    return inMemoryRides.find(r => r.bookingId === bookingId);
  },
};
