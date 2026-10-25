export interface UpdateDriverPayload {
  serviceId?: string | null;
  vehicleId?: string | null;
  vehicleModel?: string | null;
  vehicleNo?: string | null;
  manufacturingYear?: number | null;
  seating?: number | null;
  type?: string | null;
  color?: string | null;
  experienceYears?: number | null;
  vehicleImages?: string[] | null;
}

export interface DriverProfileData {
  _id?: string;
  id?: string;
  partnerId?: string;
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  status?: string;
  onlineStatus?: string;
  serviceId?: string;
  vehicleId?: string;
  vehicleModel?: string;
  vehicleNo?: string;
  manufacturingYear?: number | string;
  seating?: number;
  type?: string;
  color?: string;
  experienceYears?: number;
  vehicleImages?: string[];
  totalRides?: number | string;
  rating?: number | string;
  acceptanceRate?: number | string;
  user?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    [key: string]: any;
  };
  vehicle?: {
    model?: string;
    vehicleNo?: string;
    type?: string;
    color?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface GetDriverProfileResponse {
  success?: boolean;
  message?: string;
  data?: DriverProfileData;
  driver?: DriverProfileData;
  [key: string]: any;
}

export interface UpdateDriverResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateDriverStatusPayload {
  status: 'online' | 'offline';
}

export interface UpdateDriverStatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateDriverLocationPayload {
  latitude: number;
  longitude: number;
  heading?: number;
}

export interface UpdateDriverLocationResponse {
  success: boolean;
  message: string;
  data?: any;
}

