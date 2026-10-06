export interface ServiceCategoryDef {
  id: string;
  label: string;
  icon: string;
}

export const CONTROLLED_SERVICE_CATEGORIES: ServiceCategoryDef[] = [
  { id: 'pest_control', label: 'Pest Control', icon: '🪲' },
  { id: 'deep_cleaning', label: 'Cleaning & Sanitation', icon: '🧼' },
  { id: 'refrigeration', label: 'Refrigeration / Cold Equipment', icon: '❄️' },
  { id: 'equipment', label: 'Equipment Maintenance', icon: '🔧' },
  { id: 'waste_management', label: 'Waste Management', icon: '♻️' },
  { id: 'training', label: 'Food Safety Training', icon: '🎓' },
  { id: 'water_testing', label: 'Water / Hygiene Testing', icon: '💧' },
  { id: 'calibration', label: 'Thermometer & Equipment Calibration', icon: '⚖️' },
  { id: 'other', label: 'Other Approved Service', icon: '🛠️' }
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

export interface ServiceRequestAuditEntry {
  timestamp: string;
  user: string;
  action: string;
  status: ServiceRequestStatus;
  notes?: string;
}

export interface ServiceRequest {
  id: string;
  organisationId: string;
  outletId: string;
  outletName: string;
  outletCity?: string;
  outletAddress?: string;
  correctiveActionId: string;
  correctiveActionTitle: string;
  providerId: string;
  providerName: string;
  serviceCategory: string;
  problemDescription: string;
  priority?: 'critical' | 'high' | 'medium' | 'low' | string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  completionNotes?: string;
  rejectionNotes?: string;
  status: ServiceRequestStatus;
  requestedAt: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  confirmedAt?: string | null;
  auditTrail?: ServiceRequestAuditEntry[];
}

export function isExternalServiceRequired(action: {
  requiresExternalService?: boolean;
  serviceCategory?: string | null;
  title?: string;
  description?: string;
  checkCode?: string;
  sourceCheckCode?: string;
}): boolean {
  if (action.requiresExternalService === true) return true;
  if (action.requiresExternalService === false) return false;

  const text = `${action.title || ''} ${action.description || ''}`.toLowerCase();
  const routinePatterns = [
    /wipe(\s+\w+)?\s+cutting\s+board/,
    /wipe\s+board/,
    /throw\s+away\s+expired(\s+milk)?/,
    /expired\s+milk/,
    /log\s+temperature/,
    /put\s+on\s+hairnet/,
    /wear\s+(a\s+)?hairnet/,
    /wash\s+hands/,
    /hand\s+wash/,
    /wear\s+gloves/,
    /wear\s+apron/,
    /clean\s+knife/,
    /sanitize\s+counter/
  ];

  for (const pattern of routinePatterns) {
    if (pattern.test(text)) return false;
  }

  const code = action.checkCode || action.sourceCheckCode || '';
  if (['FS28-26', 'FS28-27', 'GR22-06'].includes(code) || /pest|rodent|cockroach|infestation/i.test(text)) return true;
  if (['FS28-19', 'FS28-20', 'GR22-17'].includes(code) || /refrig|chiller|freezer|compressor/i.test(text)) return true;
  if (['FS28-01', 'FS28-02'].includes(code) || /grease\s+trap|exhaust\s+hood|deep\s+clean/i.test(text)) return true;
  if (['FS28-13', 'FS28-14'].includes(code) || /water\s+test|potability|coliform/i.test(text)) return true;
  if (['FS28-08'].includes(code) || /fostac|training/i.test(text)) return true;
  if (['FS28-21'].includes(code) || /calibrat/i.test(text)) return true;

  if (action.serviceCategory && action.serviceCategory !== 'other') {
    return true;
  }

  return false;
}

export function inferServiceCategory(action: {
  serviceCategory?: string | null;
  title?: string;
  description?: string;
  checkCode?: string;
  sourceCheckCode?: string;
}): string {
  if (action.serviceCategory) return action.serviceCategory;
  const text = `${action.title || ''} ${action.description || ''}`.toLowerCase();
  const code = action.checkCode || action.sourceCheckCode || '';

  if (['FS28-26', 'FS28-27', 'GR22-06'].includes(code) || /pest|rodent|cockroach|infestation/i.test(text)) return 'pest_control';
  if (['FS28-19', 'FS28-20', 'GR22-17'].includes(code) || /refrig|chiller|freezer|compressor|cold\s+chain/i.test(text)) return 'refrigeration';
  if (['FS28-01', 'FS28-02', 'FS28-03', 'FS28-04'].includes(code) || /grease|drain|exhaust|deep\s+clean/i.test(text)) return 'deep_cleaning';
  if (['FS28-13', 'FS28-14'].includes(code) || /water|potability|coliform/i.test(text)) return 'water_testing';
  if (['FS28-08'].includes(code) || /fostac|training/i.test(text)) return 'training';
  if (['FS28-21'].includes(code) || /calibrat/i.test(text)) return 'calibration';
  if (/waste|garbage|disposal/i.test(text)) return 'waste_management';
  return 'equipment';
}
