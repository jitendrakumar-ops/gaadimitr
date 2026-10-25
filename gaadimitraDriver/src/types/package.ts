export interface BackendPackageItem {
  _id: string;
  id?: string;
  serviceId?: string | null;
  dayType: string;
  price: number;
  off?: number;
  badgeName?: string | null;
  bedgeName?: string | null;
  name?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPurchasedPackage {
  _id: string;
  id?: string;
  userId: string;
  driverId?: string;
  packageId: string | BackendPackageItem;
  serviceId?: string;
  vehicleId?: string;
  dayType: string;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  status: string;
  startDate: string;
  expiryDate: string;
}

export interface BuyPackagePayload {
  vehicleId?: string;
  paymentMethod?: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';
  transactionId?: string;
}

export interface PackagesResponse {
  success: boolean;
  message: string;
  data: BackendPackageItem[];
}

export interface SinglePackageResponse {
  success: boolean;
  message: string;
  data: BackendPackageItem;
}

export interface BuyPackageResponse {
  success: boolean;
  message: string;
  data: UserPurchasedPackage;
}

export interface MyPurchasesResponse {
  success: boolean;
  message: string;
  data: UserPurchasedPackage[];
}
