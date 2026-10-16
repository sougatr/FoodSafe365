import crypto from 'crypto';
import { query } from './db';
import { getDemoPlan, updateDemoPlan } from './demo-haccp';
import { ok, fail } from './response';

export function normalizeRole(roleStr?: string): string {
  if (!roleStr) return 'food_safety_supervisor';
  const clean = roleStr.toLowerCase().replace(/[\s-]+/g, '_');
  const validRoles = ['platform_admin', 'org_admin', 'outlet_manager', 'food_safety_supervisor', 'food_handler', 'auditor', 'vendor'];
  if (validRoles.includes(clean)) return clean;
  if (clean.includes('manager')) return 'outlet_manager';
  if (clean.includes('admin')) return 'org_admin';
  if (clean.includes('handler')) return 'food_handler';
  if (clean.includes('auditor')) return 'auditor';
  return 'food_safety_supervisor';
}

export async function loadPlanWithDetails(planId: string) {
  const planRows = await query<any>(`
    SELECT hp.id, hp.outlet_id "outletId", hp.name, hp.version, hp.status,
           hp.approved_by "approvedBy", hp.approved_at "approvedAt",
           hp.effective_from "effectiveFrom", hp.review_date "reviewDate",
           o.organisation_id "organisationId"
    FROM haccp_plans hp
    JOIN outlets o ON o.id = hp.outlet_id
    WHERE hp.id = $1
  `, [planId]);

  if (!planRows[0]) return null;
  const p = planRows[0];

  const hazardRows = await query<any>(`
    SELECT id, process_step "processStep", hazard_type "hazardType",
           hazard_description "description", likelihood, severity,
           risk_score "riskScore", control_measure "controlMeasure", significant
    FROM hazards
    WHERE haccp_plan_id = $1
    ORDER BY process_step ASC, id ASC
  `, [planId]);

  const ccpRows = await query<any>(`
    SELECT id, hazard_id "hazardId", process_step "processStep",
           justification, critical_limit "criticalLimit", unit,
           monitoring_method "monitoringMethod", monitoring_frequency "monitoringFrequency",
           responsible_person_role "responsibleRole", corrective_action "correctiveAction",
           verification_method "verificationMethod", critical_limit_min "criticalLimitMin",
           critical_limit_max "criticalLimitMax", validation_status "validationStatus",
           validated_by "validatedBy", validated_at "validatedAt"
    FROM ccps
    WHERE haccp_plan_id = $1
    ORDER BY process_step ASC, id ASC
  `, [planId]);

  return {
    id: p.id,
    outletId: p.outletId,
    organisationId: p.organisationId,
    name: p.name,
    version: p.version,
    status: p.status,
    effectiveFrom: p.effectiveFrom ? String(p.effectiveFrom).slice(0, 10) : undefined,
    reviewDate: p.reviewDate ? String(p.reviewDate).slice(0, 10) : undefined,
    approvedBy: p.approvedBy,
    approvedAt: p.approvedAt,
    hazards: hazardRows.map(h => ({
      ...h,
      likelihood: Number(h.likelihood),
      severity: Number(h.severity),
      riskScore: Number(h.riskScore),
      significant: Boolean(h.significant)
    })),
    ccps: ccpRows.map(c => ({
      ...c,
      criticalLimitMin: c.criticalLimitMin !== null && c.criticalLimitMin !== undefined ? Number(c.criticalLimitMin) : undefined,
      criticalLimitMax: c.criticalLimitMax !== null && c.criticalLimitMax !== undefined ? Number(c.criticalLimitMax) : undefined,
    }))
  };
}

export function checkPlanTenantAccess(auth: any, plan: any): boolean {
  if (['platform_admin', 'superadmin', 'admin'].includes(auth.role)) return true;
  if (['org_admin', 'owner'].includes(auth.role)) {
    return plan.organisationId === auth.organisationId;
  }
  return plan.outletId === auth.outletId && plan.organisationId === auth.organisationId;
}
