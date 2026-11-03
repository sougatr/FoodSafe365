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
  riskProbability: number; // percentage (DEMO DATA)
  issue: string;
  leadTime: string;
  suggestedAction: string;
  providerCategory?: string;
  predictionExplanation: string;
  underlyingDataPeriod: string;
  limitations: string;
  humanReviewRequirement: string;
};

export type OperationalPatternTracker = {
  id: string;
  patternType:
    | 'Repeated temperature deviations'
    | 'Frequently missed checklists'
    | 'Recurring hygiene deficiencies'
    | 'Delayed corrective actions'
    | 'Repeated diner complaints'
    | 'Equipment maintenance patterns';
  metricValue: string;
  severity: 'critical' | 'attention' | 'good';
  finding: string;
  recommendedManagerAction: string;
  actionHref: string;
  isDemoData: boolean;
};

export type TrendPeriod = '7d' | '30d' | '90d';

export type AiTrendReport = {
  period: TrendPeriod;
  isDemoData: boolean;
  predictiveScore: number;
  riskLevel: RiskLevel;
  summaryExplanation: string;
  predictiveGovernance: {
    predictionExplanation: string;
    underlyingDataPeriod: string;
    limitations: string;
    humanReviewRequirement: string;
  };
  operationalPatterns: OperationalPatternTracker[];
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
  const defaultPatterns: OperationalPatternTracker[] = [
    {
      id: 'pat-temp-dev',
      patternType: 'Repeated temperature deviations',
      metricValue: '[DEMO DATA] 3 excursions in 30d (Refrigerator #2 > 5°C)',
      severity: 'critical',
      finding: 'Simulated telemetry shows Refrigerator #2 (Prep Line) exceeded 5°C three times during peak lunch prep when doors were repeatedly opened.',
      recommendedManagerAction: 'Verify door magnetic gasket seal, enforce staged prep bowls, and log manual thermometer check.',
      actionHref: '/checks?code=FS28-19',
      isDemoData: true
    },
    {
      id: 'pat-missed-checks',
      patternType: 'Frequently missed checklists',
      metricValue: '[DEMO DATA] 4 late/missed Closing Shift logs (Fridays)',
      severity: 'attention',
      finding: 'Simulated shift logs indicate Closing Shift FIFO & pest-trap checks (FS28-13, FS28-27) were skipped or logged late on 4 consecutive Friday nights.',
      recommendedManagerAction: 'Require duty supervisor sign-off before kitchen lights-out on weekend shifts.',
      actionHref: '/checks?shift=closing',
      isDemoData: true
    },
    {
      id: 'pat-hygiene-def',
      patternType: 'Recurring hygiene deficiencies',
      metricValue: '[DEMO DATA] 3 flagged findings (Handwash & Drain Upkeep)',
      severity: 'attention',
      finding: 'Simulated inspection pattern shows recurring scores of 3/5 on Friday dinner handwash station restocking (FS28-06) and pot-wash drain strainer buildup (FS28-03).',
      recommendedManagerAction: 'Assign dedicated mid-shift utility steward to restock soap/towels and clear drain baskets.',
      actionHref: '/checks?code=FS28-06',
      isDemoData: true
    },
    {
      id: 'pat-delayed-ca',
      patternType: 'Delayed corrective actions',
      metricValue: '[DEMO DATA] 2 actions overdue > 48 hours',
      severity: 'critical',
      finding: 'Simulated action tracker shows rear delivery door sweep replacement (FS28-04) and probe recalibration remained open 48h past target due date.',
      recommendedManagerAction: 'Review open tickets in Action Centre and verify physical completion before closure.',
      actionHref: '/actions',
      isDemoData: true
    },
    {
      id: 'pat-diner-complaints',
      patternType: 'Repeated diner complaints',
      metricValue: '[DEMO DATA] 2 tabletop QR alerts (Table & Washroom Hygiene)',
      severity: 'attention',
      finding: 'Simulated diner QR feedback highlights recurring guest observations regarding washroom soap availability and outdoor table wiping during peak hours.',
      recommendedManagerAction: 'Cross-check diner QR observations against internal FS28-01 and FS28-06 floor checks.',
      actionHref: '/diner',
      isDemoData: true
    },
    {
      id: 'pat-equip-maint',
      patternType: 'Equipment maintenance patterns',
      metricValue: '[DEMO DATA] Chiller #2 recovery +14m · Fryer TPC 22%',
      severity: 'attention',
      finding: 'Simulated maintenance log tracks lengthening compressor recovery cycles on Prep Chiller #2 and bi-weekly probe calibration drift (+1.4°C).',
      recommendedManagerAction: 'Schedule preventive HVAC condenser cleaning and NABL probe calibration.',
      actionHref: '/providers?category=hvac',
      isDemoData: true
    }
  ];

  const baseGovernance = {
    predictionExplanation: 'Heuristic risk aggregation combining simulated temperature excursion frequency, shift checklist completion latency, overdue corrective actions, and equipment recovery drift.',
    underlyingDataPeriod: period === '7d' ? 'Simulated 7-day rolling window (42 shift logs)' : period === '90d' ? 'Simulated 90-day quarterly window (540 shift logs)' : 'Simulated 30-day rolling window (180 shift logs)',
    limitations: 'Simulated DEMO DATA only — not generated from live kitchen sensors. Cannot predict sudden utility power cuts, unrecorded manual bypasses, or acute mechanical failure.',
    humanReviewRequirement: 'AI must assist the food-safety manager, not replace professional judgement or statutory responsibilities. Every alert requires physical floor verification by the manager.'
  };

  if (period === '7d') {
    return {
      period: '7d',
      isDemoData: true,
      predictiveScore: 89,
      riskLevel: 'low',
      summaryExplanation: '[DEMO DATA — SIMULATED] Short-term checklist velocity is robust in this synthetic scenario. Two minor simulated temperature excursions were contained within 45 minutes.',
      predictiveGovernance: baseGovernance,
      operationalPatterns: defaultPatterns,
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
          issue: 'Thermostat recovery time extended by 14 minutes post lunch rush (DEMO DATA).',
          leadTime: 'Predictive alert: 10–14 days (Simulated)',
          suggestedAction: 'Clean condenser coil fins and verify door magnetic gasket seal.',
          providerCategory: 'hvac',
          predictionExplanation: 'Estimated from simulated post-rush compressor recovery time (+14 mins vs baseline).',
          underlyingDataPeriod: 'Simulated 7-day window (21 temperature logs)',
          limitations: 'DEMO DATA illustration; does not reflect live IoT compressor telemetry.',
          humanReviewRequirement: 'Food-safety manager must physically inspect chiller thermometer and door gasket before booking service.'
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
      isDemoData: true,
      predictiveScore: 82,
      riskLevel: 'moderate',
      summaryExplanation: '[DEMO DATA — SIMULATED] Quarterly compliance trajectory in this synthetic scenario indicates strong cooking discipline but simulated seasonal humidity risks in dry storage.',
      predictiveGovernance: baseGovernance,
      operationalPatterns: defaultPatterns,
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
          issue: 'Thermal hysteresis drift detected; power cycle frequency up by 28% (DEMO DATA).',
          leadTime: 'Action required within 5 days (Simulated)',
          suggestedAction: 'Schedule commercial refrigeration overhaul and gas pressure check.',
          providerCategory: 'hvac',
          predictionExplanation: 'Derived from simulated 90-day compressor duty-cycle frequency and +2.1°C afternoon drift.',
          underlyingDataPeriod: 'Simulated 90-day quarterly window (270 chiller logs)',
          limitations: 'Simulated DEMO DATA; cannot replace physical refrigerant pressure gauge testing.',
          humanReviewRequirement: 'Manager must verify cold-room temperature logs and authorize technician inspection.'
        },
        {
          equipment: 'Deep Grease Trap #1',
          location: 'Pot Wash Area',
          riskProbability: 64,
          issue: 'Recurring sludge backup and drain odours detected during night closing (DEMO DATA).',
          leadTime: 'Action required this week (Simulated)',
          suggestedAction: 'Book commercial biological enzyme drain treatment or vacuum jetting.',
          providerCategory: 'deep-cleaning',
          predictionExplanation: 'Projected from 6 simulated closing-shift drain slow-flow observations (FS28-03).',
          underlyingDataPeriod: 'Simulated 90-day quarterly window (90 closing logs)',
          limitations: 'Simulated DEMO DATA based on synthetic visual scores, not flow-rate sensors.',
          humanReviewRequirement: 'Manager must physically inspect grease trap baffle before scheduling external jetting.'
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
    isDemoData: true,
    predictiveScore: 86,
    riskLevel: 'low',
    summaryExplanation: '[DEMO DATA — SIMULATED] Synthetic 30-day scenario showing how predictive alerts flag repeated temperature deviations in Refrigerator 2 and recurring Friday night checklist gaps.',
    predictiveGovernance: baseGovernance,
    operationalPatterns: defaultPatterns,
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
        issue: 'Thermostat recovery decay indicates worn door gasket seals or slow fan motor (DEMO DATA).',
        leadTime: 'Action recommended within 7 days (Simulated)',
        suggestedAction: 'Replace magnetic door seal and service evaporator blower motor.',
        providerCategory: 'hvac',
        predictionExplanation: 'Calculated from 3 simulated temperature excursions (> 5°C) and slower post-lunch recovery over 30 days.',
        underlyingDataPeriod: 'Simulated 30-day rolling window (90 shift temperature logs)',
        limitations: 'Simulated DEMO DATA only; does not measure actual compressor amperage or refrigerant charge.',
        humanReviewRequirement: 'AI assists the food-safety manager — manager must physically verify chiller temperature and door seal before ordering repairs.'
      },
      {
        equipment: 'Thermometer Probe #2',
        location: 'Hot Line Griddle',
        riskProbability: 52,
        issue: 'Bi-weekly ice bath calibration test showed a +1.4°C reading offset (DEMO DATA).',
        leadTime: 'Action required this week (Simulated)',
        suggestedAction: 'Recalibrate digital probe or replace with certified NABL test thermometer.',
        providerCategory: 'hvac',
        predictionExplanation: 'Flagged by simulated bi-weekly ice-point (0°C) calibration drift log.',
        underlyingDataPeriod: 'Simulated 30-day calibration log (2 bi-weekly checks)',
        limitations: 'Simulated DEMO DATA example; physical ice-slush/boiling-water calibration is required.',
        humanReviewRequirement: 'Manager or supervisor must manually verify probe accuracy in an ice bath before relying on readings.'
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

