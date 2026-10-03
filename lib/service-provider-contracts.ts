export interface ServiceCategoryDef {
  id: string;
  label: string;
  icon: string;
}

export const CONTROLLED_SERVICE_CATEGORIES: ServiceCategoryDef[] = [
  { id: 'pest_control', label: 'Pest Control', icon: '🪲' },
  { id: 'deep_cleaning', label: 'Deep Cleaning / Sanitation', icon: '🧼' },
  { id: 'waste_management', label: 'Waste Management', icon: '♻️' },
  { id: 'refrigeration', label: 'Refrigeration / Cold Storage Service', icon: '❄️' },
  { id: 'equipment', label: 'Equipment Maintenance', icon: '🔧' },
  { id: 'water_testing', label: 'Water / Hygiene Testing', icon: '💧' },
  { id: 'training', label: 'Food Safety Training', icon: '🎓' },
  { id: 'occupational_health', label: 'Occupational Health & Medical Camp', icon: '🩺' },
  { id: 'calibration', label: 'Thermometer & Equipment Calibration', icon: '⚖️' }
];

export type ProviderVerificationStatus = 'unverified' | 'submitted' | 'verified';

export interface ServiceProvider {
  id: string;
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  address?: string;
  city: string;
  state?: string;
  categories: string[];
  description: string;
  verificationStatus: ProviderVerificationStatus;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type ServiceRequestStatus =
  | 'requested'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'restaurant_confirmed'
  | 'declined'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  organisationId: string;
  outletId: string;
  outletName: string;
  outletCity?: string;
  correctiveActionId: string;
  correctiveActionTitle: string;
  providerId: string;
  providerName: string;
  serviceCategory: string;
  problemDescription: string;
  notes?: string;
  status: ServiceRequestStatus;
  requestedAt: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  confirmedAt?: string | null;
}
