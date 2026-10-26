import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getAuthContext } from '../../../../lib/auth';
import { can } from '../../../../lib/permissions';
import { ok, fail } from '../../../../lib/response';
import { query } from '../../../../lib/db';
import { getDemoPlan, updateDemoPlan } from '../../../../lib/demo-haccp';
import {
  normalizeRole,
  loadPlanWithDetails,
  checkPlanTenantAccess
} from '../../../../lib/haccp-service';

export async function GET(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'haccp:read')) return fail('FORBIDDEN', 'You do not have permission to view HACCP plans', 403);
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant HACCP operations', 403);
  }

  if (!process.env.DATABASE_URL) {
    return ok({ demo: true, plan: getDemoPlan() });
  }

  try {
    const url = new URL(req.url);
    const planIdParam = url.searchParams.get('plan_id') || url.searchParams.get('planId');
    const outletIdParam = url.searchParams.get('outlet_id') || url.searchParams.get('outletId');

    if (planIdParam) {
      const plan = await loadPlanWithDetails(planIdParam);
      if (!plan) return fail('NOT_FOUND', 'HACCP plan not found', 404);
      if (!checkPlanTenantAccess(auth, plan)) {
        return fail('FORBIDDEN', 'Access denied to HACCP plan for this tenant', 403);
      }
      return ok({ demo: false, plan });
    }

    // Determine target outlet
    const targetOutletId = outletIdParam || auth.outletId;
    if (!targetOutletId) {
      return fail('VALIDATION_ERROR', 'outletId is required', 400);
    }

    // Verify tenant access to requested outlet
    if (!['platform_admin', 'superadmin', 'admin'].includes(auth.role)) {
      if (['org_admin', 'owner'].includes(auth.role)) {
        const outletRows = await query<any>(`SELECT id FROM outlets WHERE id = $1 AND organisation_id = $2`, [targetOutletId, auth.organisationId]);
        if (!outletRows[0]) return fail('FORBIDDEN', 'Access denied: Outlet does not belong to your organisation', 403);
      } else {
        if (targetOutletId !== auth.outletId) return fail('FORBIDDEN', 'Access denied to other outlet', 403);
      }
    }

    const planRows = await query<any>(`
      SELECT id FROM haccp_plans
      WHERE outlet_id = $1
      ORDER BY (status = 'active') DESC, review_date DESC
      LIMIT 1
    `, [targetOutletId]);

    if (!planRows[0]) {
      return ok({ demo: false, plan: null, message: 'No HACCP plan found for outlet' });
    }

    const plan = await loadPlanWithDetails(planRows[0].id);
    return ok({ demo: false, plan });
  } catch (err: any) {
    console.error('[HACCP GET error]', err);
    return fail('DATABASE_ERROR', 'Failed to retrieve HACCP plan.', 500);
  }
}

export async function POST(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'haccp:write')) return fail('FORBIDDEN', 'You do not have permission to edit HACCP plans', 403);
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant HACCP operations', 403);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  if (!process.env.DATABASE_URL) {
    const updated = updateDemoPlan(body);
    return ok({ demo: true, plan: updated });
  }

  try {
    const targetOutletId = body.outletId || body.outlet_id || auth.outletId;
    if (!targetOutletId) {
      return fail('VALIDATION_ERROR', 'outletId is required', 400);
    }

    // Verify tenant authorization to target outlet
    if (!['platform_admin', 'superadmin', 'admin'].includes(auth.role)) {
      if (['org_admin', 'owner'].includes(auth.role)) {
        const outletRows = await query<any>(`SELECT id FROM outlets WHERE id = $1 AND organisation_id = $2`, [targetOutletId, auth.organisationId]);
        if (!outletRows[0]) return fail('FORBIDDEN', 'Outlet does not belong to your organisation', 403);
      } else {
        if (targetOutletId !== auth.outletId) return fail('FORBIDDEN', 'Access denied to other outlet', 403);
      }
    }

    const planId = body.id || `plan-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const name = body.name || 'Food Safety HACCP Plan';
    const version = body.version || '1.0';
    const status = body.status || 'draft';
    const effectiveFrom = body.effectiveFrom || new Date().toISOString().slice(0, 10);
    const reviewDate = body.reviewDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

    await query(`
      INSERT INTO haccp_plans(id, outlet_id, name, version, status, effective_from, review_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `, [planId, targetOutletId, name, version, status, effectiveFrom, reviewDate]);

    // Insert initial hazards if provided
    if (Array.isArray(body.hazards)) {
      for (const h of body.hazards) {
        const hid = h.id || `haz-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const l = Number(h.likelihood) || 1;
        const s = Number(h.severity) || 1;
        await query(`
          INSERT INTO hazards(id, haccp_plan_id, process_step, hazard_type, hazard_description, likelihood, severity, risk_score, control_measure, significant)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [hid, planId, h.processStep || 'Process', h.hazardType || 'biological', h.description || '', l, s, l * s, h.controlMeasure || '', Boolean(h.significant)]);
      }
    }

    // Insert initial CCPs if provided
    if (Array.isArray(body.ccps)) {
      for (const c of body.ccps) {
        const cid = c.id || `ccp-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const respRole = normalizeRole(c.responsibleRole || c.responsiblePersonRole);
        await query(`
          INSERT INTO ccps(id, haccp_plan_id, hazard_id, process_step, justification, critical_limit, unit, monitoring_method, monitoring_frequency, responsible_person_role, corrective_action, verification_method, critical_limit_min, critical_limit_max, validation_status, validated_by, validated_at)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          cid, planId, c.hazardId || null, c.processStep || 'Process', c.justification || '', c.criticalLimit || '',
          c.unit || '', c.monitoringMethod || '', c.monitoringFrequency || '', respRole,
          c.correctiveAction || '', c.verificationMethod || '',
          c.criticalLimitMin !== undefined ? Number(c.criticalLimitMin) : null,
          c.criticalLimitMax !== undefined ? Number(c.criticalLimitMax) : null,
          c.validationStatus || null,
          c.validationStatus === 'validated' ? auth.userId : null,
          c.validationStatus === 'validated' ? new Date() : null
        ]);
      }
    }

    const createdPlan = await loadPlanWithDetails(planId);
    return ok({ demo: false, plan: createdPlan }, 201);
  } catch (err: any) {
    console.error('[HACCP POST error]', err);
    return fail('DATABASE_ERROR', 'Failed to create HACCP plan.', 500);
  }
}

export async function PATCH(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  if (!can(auth.role, 'haccp:write')) return fail('FORBIDDEN', 'You do not have permission to edit HACCP plans', 403);
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant HACCP operations', 403);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  // Demo fallback when DATABASE_URL is not set
  if (!process.env.DATABASE_URL) {
    const plan = getDemoPlan();
    if (body.action === 'add_hazard') {
      const required = ['processStep', 'hazardType', 'description', 'likelihood', 'severity', 'controlMeasure', 'significant'];
      if (required.some(k => body[k] === undefined || body[k] === '')) return fail('VALIDATION_ERROR', 'Complete all hazard fields', 400);
      const h = {
        id: `haz-${Date.now()}`,
        processStep: body.processStep,
        hazardType: body.hazardType,
        description: body.description,
        likelihood: Number(body.likelihood),
        severity: Number(body.severity),
        riskScore: Number(body.likelihood) * Number(body.severity),
        controlMeasure: body.controlMeasure,
        significant: Boolean(body.significant)
      };
      return ok({ demo: true, plan: updateDemoPlan({ hazards: [...plan.hazards, h] }) });
    }
    if (body.action === 'update_hazard') {
      const hazardId = body.hazardId || body.id;
      const idx = plan.hazards.findIndex(h => h.id === hazardId);
      if (idx < 0) return fail('NOT_FOUND', 'Hazard not found', 404);
      const hazards = [...plan.hazards];
      const likelihood = body.likelihood !== undefined ? Number(body.likelihood) : hazards[idx].likelihood;
      const severity = body.severity !== undefined ? Number(body.severity) : hazards[idx].severity;
      hazards[idx] = {
        ...hazards[idx],
        ...body,
        likelihood,
        severity,
        riskScore: likelihood * severity
      };
      return ok({ demo: true, plan: updateDemoPlan({ hazards }) });
    }
    if (body.action === 'delete_hazard') {
      const hazardId = body.hazardId || body.id;
      const hazards = plan.hazards.filter(h => h.id !== hazardId);
      const ccps = plan.ccps.filter(c => c.hazardId !== hazardId);
      return ok({ demo: true, plan: updateDemoPlan({ hazards, ccps }) });
    }
    if (body.action === 'save_ccp') {
      const idx = plan.ccps.findIndex(c => c.id === body.id);
      if (idx < 0) {
        if (body.hazardId && body.processStep) {
          const newCcp = { ...body, id: body.id || `ccp-${Date.now()}` };
          return ok({ demo: true, plan: updateDemoPlan({ ccps: [...plan.ccps, newCcp] }) });
        }
        return fail('NOT_FOUND', 'CCP not found', 404);
      }
      const patch = body.patch || body;
      const ccps = [...plan.ccps];
      ccps[idx] = { ...ccps[idx], ...patch };
      return ok({ demo: true, plan: updateDemoPlan({ ccps }) });
    }
    if (body.action === 'activate') {
      if (plan.hazards.length === 0) return fail('VALIDATION_ERROR', 'Add hazard analysis before activating the plan', 400);
      if (plan.ccps.some(c => (c.criticalLimit || '').toLowerCase().includes('define and validate') || !c.validationStatus || c.validationStatus !== 'validated')) {
        return fail('VALIDATION_ERROR', 'Validate all CCP critical limits before activating the plan', 400);
      }
      return ok({ demo: true, plan: updateDemoPlan({ status: 'active', effectiveFrom: new Date().toISOString().slice(0, 10) }) });
    }
    return fail('VALIDATION_ERROR', 'Unsupported HACCP action', 400);
  }

  // Production PostgreSQL-backed execution
  try {
    let planId = body.planId || body.plan_id;
    if (!planId) {
      const targetOutlet = body.outletId || body.outlet_id || auth.outletId;
      const planRows = await query<any>(`
        SELECT id FROM haccp_plans
        WHERE outlet_id = $1
        ORDER BY (status = 'draft') DESC, (status = 'active') DESC
        LIMIT 1
      `, [targetOutlet]);
      if (!planRows[0]) {
        return fail('NOT_FOUND', 'HACCP plan not found for outlet', 404);
      }
      planId = planRows[0].id;
    }

    const plan = await loadPlanWithDetails(planId);
    if (!plan) return fail('NOT_FOUND', 'HACCP plan not found', 404);
    if (!checkPlanTenantAccess(auth, plan)) {
      return fail('FORBIDDEN', 'Access denied to HACCP plan for this tenant', 403);
    }

    if (body.action === 'add_hazard') {
      const required = ['processStep', 'hazardType', 'description', 'likelihood', 'severity', 'controlMeasure', 'significant'];
      if (required.some(k => body[k] === undefined || body[k] === '')) {
        return fail('VALIDATION_ERROR', 'Complete all hazard fields', 400);
      }
      const likelihood = Number(body.likelihood);
      const severity = Number(body.severity);
      if (!Number.isFinite(likelihood) || likelihood < 1 || likelihood > 5 || !Number.isFinite(severity) || severity < 1 || severity > 5) {
        return fail('VALIDATION_ERROR', 'Likelihood and severity must be between 1 and 5', 400);
      }
      const validTypes = ['biological', 'chemical', 'physical', 'allergen'];
      if (!validTypes.includes(body.hazardType)) {
        return fail('VALIDATION_ERROR', `Invalid hazard type: ${body.hazardType}`, 400);
      }
      const riskScore = likelihood * severity;
      const hazardId = body.id || `haz-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      await query(`
        INSERT INTO hazards(id, haccp_plan_id, process_step, hazard_type, hazard_description, likelihood, severity, risk_score, control_measure, significant)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [hazardId, planId, body.processStep, body.hazardType, body.description, likelihood, severity, riskScore, body.controlMeasure, Boolean(body.significant)]);

      const updated = await loadPlanWithDetails(planId);
      return ok({ demo: false, plan: updated });
    }

    if (body.action === 'update_hazard') {
      const hazardId = body.hazardId || body.id;
      if (!hazardId) return fail('VALIDATION_ERROR', 'Hazard ID is required', 400);
      const existingHazard = await query<any>(`SELECT id, likelihood, severity FROM hazards WHERE id = $1 AND haccp_plan_id = $2`, [hazardId, planId]);
      if (!existingHazard[0]) return fail('NOT_FOUND', 'Hazard not found', 404);

      const l = body.likelihood !== undefined ? Number(body.likelihood) : existingHazard[0].likelihood;
      const s = body.severity !== undefined ? Number(body.severity) : existingHazard[0].severity;
      const riskScore = l * s;

      await query(`
        UPDATE hazards
        SET process_step = COALESCE($3, process_step),
            hazard_type = COALESCE($4, hazard_type),
            hazard_description = COALESCE($5, hazard_description),
            likelihood = COALESCE($6, likelihood),
            severity = COALESCE($7, severity),
            risk_score = COALESCE($8, risk_score),
            control_measure = COALESCE($9, control_measure),
            significant = COALESCE($10, significant)
        WHERE id = $1 AND haccp_plan_id = $2
      `, [
        hazardId, planId,
        body.processStep || null, body.hazardType || null, body.description || null,
        body.likelihood !== undefined ? l : null,
        body.severity !== undefined ? s : null,
        riskScore,
        body.controlMeasure || null,
        body.significant !== undefined ? Boolean(body.significant) : null
      ]);

      const updated = await loadPlanWithDetails(planId);
      return ok({ demo: false, plan: updated });
    }

    if (body.action === 'delete_hazard') {
      const hazardId = body.hazardId || body.id;
      if (!hazardId) return fail('VALIDATION_ERROR', 'Hazard ID is required', 400);
      await query(`DELETE FROM ccps WHERE hazard_id = $1 AND haccp_plan_id = $2`, [hazardId, planId]);
      const delResult = await query(`DELETE FROM hazards WHERE id = $1 AND haccp_plan_id = $2 RETURNING id`, [hazardId, planId]);
      if (delResult.length === 0) return fail('NOT_FOUND', 'Hazard not found', 404);

      const updated = await loadPlanWithDetails(planId);
      return ok({ demo: false, plan: updated });
    }

    if (body.action === 'save_ccp') {
      const ccpId = body.id || body.ccpId;
      const patch = body.patch || body;

      if (ccpId) {
        const existingCcp = await query<any>(`SELECT id FROM ccps WHERE id = $1 AND haccp_plan_id = $2`, [ccpId, planId]);
        if (!existingCcp[0]) {
          if (patch.hazardId && patch.processStep) {
            const respRole = normalizeRole(patch.responsibleRole || patch.responsiblePersonRole);
            await query(`
              INSERT INTO ccps(id, haccp_plan_id, hazard_id, process_step, justification, critical_limit, unit, monitoring_method, monitoring_frequency, responsible_person_role, corrective_action, verification_method, critical_limit_min, critical_limit_max, validation_status, validated_by, validated_at)
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `, [
              ccpId, planId, patch.hazardId, patch.processStep, patch.justification || '', patch.criticalLimit || '',
              patch.unit || '', patch.monitoringMethod || '', patch.monitoringFrequency || '', respRole,
              patch.correctiveAction || '', patch.verificationMethod || '',
              patch.criticalLimitMin !== undefined ? Number(patch.criticalLimitMin) : null,
              patch.criticalLimitMax !== undefined ? Number(patch.criticalLimitMax) : null,
              patch.validationStatus || null,
              patch.validationStatus === 'validated' ? auth.userId : null,
              patch.validationStatus === 'validated' ? new Date() : null
            ]);
          } else {
            return fail('NOT_FOUND', 'CCP not found', 404);
          }
        } else {
          const respRole = patch.responsibleRole || patch.responsiblePersonRole ? normalizeRole(patch.responsibleRole || patch.responsiblePersonRole) : null;
          const isValidated = patch.validationStatus === 'validated';
          await query(`
            UPDATE ccps
            SET process_step = COALESCE($3, process_step),
                justification = COALESCE($4, justification),
                critical_limit = COALESCE($5, critical_limit),
                unit = COALESCE($6, unit),
                monitoring_method = COALESCE($7, monitoring_method),
                monitoring_frequency = COALESCE($8, monitoring_frequency),
                responsible_person_role = COALESCE($9, responsible_person_role),
                corrective_action = COALESCE($10, corrective_action),
                verification_method = COALESCE($11, verification_method),
                critical_limit_min = CASE WHEN $12::boolean THEN $13::numeric ELSE critical_limit_min END,
                critical_limit_max = CASE WHEN $14::boolean THEN $15::numeric ELSE critical_limit_max END,
                validation_status = COALESCE($16, validation_status),
                validated_by = CASE WHEN $17::boolean THEN $18::uuid ELSE validated_by END,
                validated_at = CASE WHEN $17::boolean THEN now() ELSE validated_at END
            WHERE id = $1 AND haccp_plan_id = $2
          `, [
            ccpId, planId,
            patch.processStep || null, patch.justification || null, patch.criticalLimit || null,
            patch.unit || null, patch.monitoringMethod || null, patch.monitoringFrequency || null,
            respRole, patch.correctiveAction || null, patch.verificationMethod || null,
            patch.criticalLimitMin !== undefined, patch.criticalLimitMin !== undefined ? Number(patch.criticalLimitMin) : null,
            patch.criticalLimitMax !== undefined, patch.criticalLimitMax !== undefined ? Number(patch.criticalLimitMax) : null,
            patch.validationStatus || null,
            isValidated, isValidated ? auth.userId : null
          ]);
        }
      } else {
        if (!patch.hazardId || !patch.processStep) {
          return fail('VALIDATION_ERROR', 'hazardId and processStep are required for new CCP', 400);
        }
        const newCcpId = `ccp-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const respRole = normalizeRole(patch.responsibleRole || patch.responsiblePersonRole);
        await query(`
          INSERT INTO ccps(id, haccp_plan_id, hazard_id, process_step, justification, critical_limit, unit, monitoring_method, monitoring_frequency, responsible_person_role, corrective_action, verification_method, critical_limit_min, critical_limit_max, validation_status, validated_by, validated_at)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          newCcpId, planId, patch.hazardId, patch.processStep, patch.justification || '', patch.criticalLimit || '',
          patch.unit || '', patch.monitoringMethod || '', patch.monitoringFrequency || '', respRole,
          patch.correctiveAction || '', patch.verificationMethod || '',
          patch.criticalLimitMin !== undefined ? Number(patch.criticalLimitMin) : null,
          patch.criticalLimitMax !== undefined ? Number(patch.criticalLimitMax) : null,
          patch.validationStatus || null,
          patch.validationStatus === 'validated' ? auth.userId : null,
          patch.validationStatus === 'validated' ? new Date() : null
        ]);
      }

      const updated = await loadPlanWithDetails(planId);
      return ok({ demo: false, plan: updated });
    }

    if (body.action === 'activate') {
      const hazCount = await query<any>(`SELECT count(*) as c FROM hazards WHERE haccp_plan_id = $1`, [planId]);
      if (parseInt(hazCount[0]?.c || '0', 10) === 0) {
        return fail('VALIDATION_ERROR', 'Add hazard analysis before activating the plan', 400);
      }

      const ccpList = await query<any>(`SELECT id, critical_limit, validation_status FROM ccps WHERE haccp_plan_id = $1`, [planId]);
      if (ccpList.some(c => (c.critical_limit || '').toLowerCase().includes('define and validate') || !c.validation_status || c.validation_status !== 'validated')) {
        return fail('VALIDATION_ERROR', 'Validate all CCP critical limits before activating the plan', 400);
      }

      await query(`
        UPDATE haccp_plans
        SET status = 'active',
            approved_by = $2,
            approved_at = now(),
            effective_from = CURRENT_DATE
        WHERE id = $1
      `, [planId, auth.userId]);

      const updated = await loadPlanWithDetails(planId);
      return ok({ demo: false, plan: updated });
    }

    return fail('VALIDATION_ERROR', 'Unsupported HACCP action', 400);
  } catch (err: any) {
    console.error('[HACCP PATCH error]', err);
    return fail('DATABASE_ERROR', 'Failed to update HACCP plan.', 500);
  }
}
