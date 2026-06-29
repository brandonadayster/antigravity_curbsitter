export interface PropertyStop {
  id: string;
  address: string;
  gateCode: string;
  binLocation: string;
  specialNotes?: string;
  isFirstVisit: boolean;
  status?: string;
  serviceStatus?: string;
}


export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface ServiceLog {
  id: string;
  propertyId: string;
  runnerId: string;
  timestamp: string;
  preciseGpsCoordinates: GpsCoordinates;
  proofPhotoUrl?: string;
}
