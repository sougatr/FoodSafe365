/**
 * FoodSafe365 — AI Checklist Trend Analysis & Predictive Risk Engine
 */

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'critical';

export type CategoryTrend = {
  category: string;
  currentRate: number; // 0-100
  baselineRate: number; // 0-100
  delta: number; // percentage points
  status: 'improving' | 'declining' | 'stable';
  inspectionsCount: number;
  highlight: string;
};

export type HotspotAnomaly = {
  day: string;
  shift: string;
  riskFactor: string;
  frequency: string;
  severity: 'critical' | 'attention';
  mitigation: string;
};

export type EquipmentPredictiveInsight = {
  equipment: string;
  location: string;
  riskProbability: number; // percentage
  issue: string;
  leadTime: string;
  suggestedAction: string;
  providerCategory?: string;
};

export type TrendPeriod = '7d' | '30d' | '90d';

export type AiTrendReport = {
  period: TrendPeriod;
  predictiveScore: number;
  riskLevel: RiskLevel;
  summaryExplanation: string;
  categories: CategoryTrend[];
  hotspots: HotspotAnomaly[];
  equipmentInsights: EquipmentPredictiveInsight[];
  aiRecommendations: {
    id: string;
    title: string;
    reason: string;
    confidence: 'High' | 'Medium';
    actionLabel: string;
    actionHref: string;
  }[];
};

export function generateAiTrendReport(period: TrendPeriod): AiTrendReport {
  if (period === '7d') {
    return {
      period: '7d',
      predictiveScore: 89,
      riskLevel: 'low',
      summaryExplanation: 'Short-term checklist velocity is robust. Two minor temperature excursions were contained within 45 minutes.',
      categories: [
        {
          category: 'Cold Storage & Temperature',
          currentRate: 88,
          baselineRate: 84,
          delta: 4,
          status: 'improving',
          inspectionsCount: 42,
          highlight: 'Morning walk-in recovery improved after delivery door sweep replacement.'
        },
        {
          category: 'Personal Hygiene & Wash stations',
          currentRate: 95,
          baselineRate: 91,
          delta: 4,
          status: 'improving',
          inspectionsCount: 28,
          highlight: '100% soap and towel dispenser readiness maintained.'
        },
        {
          category: 'Thermal Cooking Core Temps',
          currentRate: 98,
          baselineRate: 98,
          delta: 0,
          status: 'stable',
          inspectionsCount: 35,
          highlight: 'All poultry batches measured ≥ 75°C core internal temperature.'
        },
        {
          category: 'Pest Exclusion & Barriers',
          currentRate: 82,
          baselineRate: 78,
          delta: 4,
          status: 'improving',
          inspectionsCount: 14,
          highlight: 'Air curtain operational; zero fly sightings logged in prep area.'
        }
      ],
      hotspots: [
        {
          day: 'Friday',
          shift: 'Dinner Rush (8:00 PM - 11:00 PM)',
          riskFactor: 'Delayed sanitiser bucket replenishment during peak table turnover.',
          frequency: '2 incidents recorded',
          severity: 'attention',
          mitigation: 'Assign secondary busser to check sanitiser PPM every 90 minutes.'
        },
        {
          day: 'Monday',
          shift: 'Raw Delivery (7:30 AM - 8:30 AM)',
          riskFactor: 'Chiller door propped open during crate receiving.',
          frequency: '1 temperature drift (+1.8°C)',
          severity: 'attention',
          mitigation: 'Enforce staged unloading into receiving vestibule rather than holding walk-in open.'
        }
      ],
      equipmentInsights: [
        {
          equipment: 'Refrigerator 2 (Salad & Dairy)',
          location: 'Prep Line',
          riskProbability: 38,
          issue: 'Thermostat recovery time extended by 14 minutes post lunch rush.',
          leadTime: 'Predictive alert: 10–14 days',
          suggestedAction: 'Clean condenser coil fins and verify door magnetic gasket seal.',
          providerCategory: 'hvac'
        }
      ],
      aiRecommendations: [
        {
          id: 'rec-1',
          title: 'Schedule Proactive Condenser Clean for Refrigerator 2',
          reason: 'Thermostat cycle data suggests mild dust accumulation on condenser coils slowing recovery.',
          confidence: 'High',
          actionLabel: 'Book HVAC Technician',
          actionHref: '/providers?category=hvac'
        },
        {
          id: 'rec-2',
          title: 'Verify FSSAI Form 1A Renewal Schedule',
          reason: '4 kitchen staff medical certificates are due for 6-monthly renewal in 18 days.',
          confidence: 'High',
          actionLabel: 'Schedule Staff Medical Camp',
          actionHref: '/providers?category=medical'
        }
      ]
    };
  }

  if (period === '90d') {
    return {
      period: '90d',
      predictiveScore: 82,
      riskLevel: 'moderate',
      summaryExplanation: 'Quarterly compliance trajectory indicates strong cooking discipline but seasonal humidity risks in dry storage.',
      categories: [
        {
          category: 'Cold Storage & Temperature',
          currentRate: 85,
          baselineRate: 90,
          delta: -5,
          status: 'declining',
          inspectionsCount: 540,
          highlight: 'Seasonal monsoon ambient heat increased compressor workload across May-June.'
        },
        {
          category: 'Personal Hygiene & Wash stations',
          currentRate: 93,
          baselineRate: 88,
          delta: 5,
          status: 'improving',
          inspectionsCount: 360,
          highlight: 'Consistent upward trajectory following supervisor FoSTaC refresher.'
        },
        {
          category: 'Thermal Cooking Core Temps',
          currentRate: 99,
          baselineRate: 97,
          delta: 2,
          status: 'improving',
          inspectionsCount: 450,
          highlight: 'Zero undercooked food incidents across 90-day window.'
        },
        {
          category: 'Pest Exclusion & Barriers',
          currentRate: 79,
          baselineRate: 82,
          delta: -3,
          status: 'declining',
          inspectionsCount: 180,
          highlight: 'Increased drain fly activity detected near kitchen grease traps.'
        }
      ],
      hotspots: [
        {
          day: 'Saturday',
          shift: 'Late Night Dinner (9:30 PM - 12:30 AM)',
          riskFactor: 'Grease trap cleaning postponed until following morning.',
          frequency: '6 occurrences across quarter',
          severity: 'critical',
          mitigation: 'Mandate end-of-shift grease trap scraping before kitchen lights-out.'
        },
        {
          day: 'Wednesday',
          shift: 'Fryer Line Operations (4:00 PM)',
          riskFactor: 'Deep fryer oil TPC reading exceeded 22% during bulk prep.',
          frequency: '3 oil changes required',
          severity: 'attention',
          mitigation: 'Implement daily oil filtration schedule with RUCO digital log.'
        }
      ],
      equipmentInsights: [
        {
          equipment: 'Walk-in Chiller Compressor',
          location: 'Main Kitchen Cold Room',
          riskProbability: 72,
          issue: 'Thermal hysteresis drift detected; power cycle frequency up by 28%.',
          leadTime: 'Action required within 5 days',
          suggestedAction: 'Schedule commercial refrigeration overhaul and gas pressure check.',
          providerCategory: 'hvac'
        },
        {
          equipment: 'Deep Grease Trap #1',
          location: 'Pot Wash Area',
          riskProbability: 64,
          issue: 'Recurring sludge backup and drain odours detected during night closing.',
          leadTime: 'Action required this week',
          suggestedAction: 'Book commercial biological enzyme drain treatment or vacuum jetting.',
          providerCategory: 'deep-cleaning'
        }
      ],
      aiRecommendations: [
        {
          id: 'rec-q1',
          title: 'Book Urgent Commercial Refrigeration Overhaul',
          reason: 'Walk-in Chiller power cycling anomaly indicates potential gas pressure drop or thermostat wear.',
          confidence: 'High',
          actionLabel: 'Book HVAC Specialist',
          actionHref: '/providers?category=hvac'
        },
        {
          id: 'rec-q2',
          title: 'Book Targeted Pest Control Drain Jetting',
          reason: 'Drain fly breeding detected in pot wash line; non-chemical drain line sanitization needed.',
          confidence: 'High',
          actionLabel: 'Book Pest Exterminator',
          actionHref: '/providers?category=pest-control'
        }
      ]
    };
  }

  // Default: 30 days
  return {
    period: '30d',
    predictiveScore: 86,
    riskLevel: 'low',
    summaryExplanation: 'Overall 30-day compliance is in the Good / Protected zone. Predictive AI models detect a mild temperature vulnerability in Refrigerator 2 and pest risks around grease traps.',
    categories: [
      {
        category: 'Cold Storage & Temperature',
        currentRate: 84,
        baselineRate: 91,
        delta: -7,
        status: 'declining',
        inspectionsCount: 180,
        highlight: '3 temperature deviations logged for Refrigerator 2; corrective actions opened.'
      },
      {
        category: 'Personal Hygiene & Wash stations',
        currentRate: 94,
        baselineRate: 89,
        delta: 5,
        status: 'improving',
        inspectionsCount: 120,
        highlight: 'Hand hygiene scores improved following installation of hands-free foot pedal basins.'
      },
      {
        category: 'Thermal Cooking Core Temps',
        currentRate: 98,
        baselineRate: 96,
        delta: 2,
        status: 'improving',
        inspectionsCount: 150,
        highlight: 'Digital probe calibration verified; all batches above 75°C standard.'
      },
      {
        category: 'Pest Exclusion & Barriers',
        currentRate: 78,
        baselineRate: 82,
        delta: -4,
        status: 'declining',
        inspectionsCount: 60,
        highlight: 'Door sweep wear detected at rear delivery entrance; replacement pending.'
      }
    ],
    hotspots: [
      {
        day: 'Friday',
        shift: 'Dinner Peak (8:30 PM - 10:30 PM)',
        riskFactor: 'Handwashing check compliance drops during rapid multi-order ticketing.',
        frequency: '4 incidents recorded this month',
        severity: 'critical',
        mitigation: 'Mandate supervisor 30-second station check between ticket waves.'
      },
      {
        day: 'Monday',
        shift: 'Morning Receiving (7:00 AM - 8:30 AM)',
        riskFactor: 'Dairy crate intake temperatures occasionally recorded between 6°C - 7°C upon truck arrival.',
        frequency: '2 delivery rejections',
        severity: 'attention',
        mitigation: 'Mandate dockside probe check before supplier invoice signoff.'
      },
      {
        day: 'Sunday',
        shift: 'Afternoon Prep (2:00 PM - 4:00 PM)',
        riskFactor: 'Bulk curry cooling curve slower than mandatory 2-hour drop from 60°C to 21°C.',
        frequency: '1 batch corrective action',
        severity: 'attention',
        mitigation: 'Use shallow pans and ice wand stirring to accelerate rapid blast cooling.'
      }
    ],
    equipmentInsights: [
      {
        equipment: 'Refrigerator 2 (Prep Line)',
        location: 'Main Kitchen Line',
        riskProbability: 68,
        issue: 'Thermostat recovery decay indicates worn door gasket seals or slow fan motor.',
        leadTime: 'Action recommended within 7 days',
        suggestedAction: 'Replace magnetic door seal and service evaporator blower motor.',
        providerCategory: 'hvac'
      },
      {
        equipment: 'Thermometer Probe #2',
        location: 'Hot Line Griddle',
        riskProbability: 52,
        issue: 'Bi-weekly ice bath calibration test showed a +1.4°C reading offset.',
        leadTime: 'Action required this week',
        suggestedAction: 'Recalibrate digital probe or replace with certified NABL test thermometer.',
        providerCategory: 'hvac'
      }
    ],
    aiRecommendations: [
      {
        id: 'rec-m1',
        title: 'Review Refrigerator 2 Thermostat & Seal Integrity',
        reason: 'Three temperature deviations in the last 7 days indicate door gasket leakage or compressor fatigue.',
        confidence: 'High',
        actionLabel: 'Dispatch HVAC Engineer',
        actionHref: '/providers?category=hvac'
      },
      {
        id: 'rec-m2',
        title: 'Reinforce Friday Night Peak Handwashing Protocol',
        reason: 'AI anomaly detection identifies a consistent 18% compliance dip between 8:30 PM and 10:30 PM on Fridays.',
        confidence: 'High',
        actionLabel: 'Create Supervisor Briefing Note',
        actionHref: '/checks'
      },
      {
        id: 'rec-m3',
        title: 'Renew Bi-Annual Commercial Pest Control Certificate',
        reason: 'Current pest certification expires in 12 days. FSSAI inspection requires uninterrupted valid coverage.',
        confidence: 'High',
        actionLabel: 'Book Pest Exterminator',
        actionHref: '/providers?category=pest-control'
      }
    ]
  };
}

