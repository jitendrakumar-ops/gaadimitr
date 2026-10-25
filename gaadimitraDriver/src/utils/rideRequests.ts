export interface ActiveRideRequest {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  rating: string;
  pickupLocation: string;
  destinationLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleName: string;
  totalFare: string;
  totalFareNum: number;
  tokenFare: string;
  tokenFareNum: number;
  remainingFare: string;
  remainingFareNum: number;
  distanceKm: string;
  durationMins: string;
  status: 'Active' | 'Incoming';
  isLive: boolean;
}

export const ACTIVE_WORKING_RIDES: ActiveRideRequest[] = [
  {
    id: 'req_1',
    bookingId: '#RIDE10245',
    customerName: 'Aman Kumar',
    customerPhone: '+91 98765 43210',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    rating: '4.8',
    pickupLocation: 'Patna Junction',
    destinationLocation: 'Gaya',
    pickupDate: '15 Aug 2026',
    pickupTime: '5:00 PM',
    passengers: '4 People',
    vehicleType: 'Sedan',
    vehiclePlate: 'BR01AB1234',
    vehicleName: 'Maruti Dzire',
    totalFare: '₹1,500',
    totalFareNum: 1500,
    tokenFare: '₹150*',
    tokenFareNum: 150,
    remainingFare: '₹1,350*',
    remainingFareNum: 1350,
    distanceKm: '108 km',
    durationMins: '2h 45m',
    status: 'Active',
    isLive: true,
  },
  {
    id: 'req_2',
    bookingId: '#RIDE10248',
    customerName: 'Vikram Mehta',
    customerPhone: '+91 98112 34567',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    rating: '4.9',
    pickupLocation: 'Patna Airport',
    destinationLocation: 'Muzaffarpur',
    pickupDate: '16 Aug 2026',
    pickupTime: '11:00 AM',
    passengers: '3 People',
    vehicleType: 'Sedan',
    vehiclePlate: 'BR01AB1234',
    vehicleName: 'Maruti Dzire',
    totalFare: '₹2,200',
    totalFareNum: 2200,
    tokenFare: '₹220*',
    tokenFareNum: 220,
    remainingFare: '₹1,980*',
    remainingFareNum: 1980,
    distanceKm: '75 km',
    durationMins: '1h 50m',
    status: 'Active',
    isLive: true,
  },
  {
    id: 'req_3',
    bookingId: '#RIDE10252',
    customerName: 'Sunita Devi',
    customerPhone: '+91 94310 98765',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    rating: '4.7',
    pickupLocation: 'Danapur Station',
    destinationLocation: 'Rajgir',
    pickupDate: '17 Aug 2026',
    pickupTime: '07:30 AM',
    passengers: '4 People',
    vehicleType: 'Sedan',
    vehiclePlate: 'BR01AB1234',
    vehicleName: 'Maruti Dzire',
    totalFare: '₹3,100',
    totalFareNum: 3100,
    tokenFare: '₹310*',
    tokenFareNum: 310,
    remainingFare: '₹2,790*',
    remainingFareNum: 2790,
    distanceKm: '105 km',
    durationMins: '2h 30m',
    status: 'Active',
    isLive: true,
  },
];

export const getRideById = (id?: string): ActiveRideRequest => {
  if (!id) return ACTIVE_WORKING_RIDES[0];
  const found = ACTIVE_WORKING_RIDES.find((r) => r.id === id);
  return found || ACTIVE_WORKING_RIDES[0];
};
