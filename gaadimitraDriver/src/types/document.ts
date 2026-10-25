export type DocType = 'drivingLicense' | 'rc' | 'insurance' | 'permit' | 'aadharCard' | 'aadhar';

export interface DrivingLicenseDoc {
  dlNo?: string | null;
  dlType?: string | null;
  frontPhoto?: string | null;
  backPhoto?: string | null;
  isVerified?: boolean;
}

export interface RcDoc {
  rcNo?: string | null;
  frontPhoto?: string | null;
  backPhoto?: string | null;
  isVerified?: boolean;
}

export interface InsuranceDoc {
  insuranceNo?: string | null;
  photo?: string | null;
  isVerified?: boolean;
}

export interface PermitDoc {
  permitNo?: string | null;
  type?: string | null;
  photo?: string | null;
  isVerified?: boolean;
}

export interface AadharDoc {
  cardNo?: string | null;
  frontPhoto?: string | null;
  backPhoto?: string | null;
  isVerified?: boolean;
}

export interface DriverDocumentsData {
  id?: string;
  driverId?: string;
  userId?: string;
  drivingLicense?: DrivingLicenseDoc;
  rc?: RcDoc;
  insurance?: InsuranceDoc;
  permit?: PermitDoc;
  aadharCard?: AadharDoc;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
}

export interface GetDocumentsResponse {
  success: boolean;
  message: string;
  data?: DriverDocumentsData;
}

export interface UpdateSpecificDocResponse {
  success: boolean;
  message: string;
  data?: DriverDocumentsData;
}
