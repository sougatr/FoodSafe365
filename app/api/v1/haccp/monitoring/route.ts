import { getAuthContext } from '../../../../../lib/auth';
import { can } from '../../../../../lib/permissions';
import { ok, fail } from '../../../../../lib/response';
import { query, transaction } from '../../../../../lib/db';
import { getDemoPlan } from '../../../../../lib/demo-haccp';
import { addDemoMonitoring, listDemoMonitoring } from '../../../../../lib/demo-monitoring';
import { createDemoAction } from '../../../../../lib/demo-store';

export async function GET(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) {
    return fail('UNAUTHENTICATED', 'Authentication required', 401);
  }
  if (!can(auth.role, 'haccp:read')) {
    return fail('FORBIDDEN', 'You do not have permission to view HACCP monitoring', 403);
  }
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant HACCP monitoring', 403);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  const url = new URL(req.url);
  const ccpId = url.searchParams.get('ccp_id') || url.searchParams.get('ccpId') || undefined;
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : 50;

  // In-memory demo fallback when DATABASE_URL is not set
  if (!process.env.DATABASE_URL) {
    return ok({ records: listDemoMonitoring(ccpId), demo: true });
  }

  // Production PostgreSQL query with strict tenant isolation
  try {
    const isPlatformAdmin = ['platform_admin', 'superadmin', 'admin'].includes(auth.role);
    const isOrgAdmin = ['org_admin', 'owner'].includes(auth.role);

    let queryText: string;
    let queryParams: any[];

    if (isPlatformAdmin) {
      if (ccpId) {
        queryText = `
          SELECT mr.id, mr.ccp_id "ccpId", mr.outlet_id "outletId", mr.recorded_by "recordedBy",
                 mr.observed_value "observedValue", mr.unit, mr.within_limit "withinLimit",
                 mr.observation_time "observationTime", mr.action_required "actionRequired",
                 mr.corrective_action_id "correctiveActionId",
                 c.process_step "processStep", c.critical_limit "criticalLimit"
          FROM monitoring_records mr
          LEFT JOIN ccps c ON c.id = mr.ccp_id
          WHERE mr.ccp_id = $1
          ORDER BY mr.observation_time DESC
          LIMIT $2
        `;
        queryParams = [ccpId, limit];
      } else {
        queryText = `
          SELECT mr.id, mr.ccp_id "ccpId", mr.outlet_id "outletId", mr.recorded_by "recordedBy",
                 mr.observed_value "observedValue", mr.unit, mr.within_limit "withinLimit",
                 mr.observation_time "observationTime", mr.action_required "actionRequired",
                 mr.corrective_action_id "correctiveActionId",
                 c.process_step "processStep", c.critical_limit "criticalLimit"
          FROM monitoring_records mr
          LEFT JOIN ccps c ON c.id = mr.ccp_id
          ORDER BY mr.observation_time DESC
          LIMIT $1
        `;
        queryParams = [limit];
      }
    } else if (isOrgAdmin) {
      if (ccpId) {
        queryText = `
          SELECT mr.id, mr.ccp_id "ccpId", mr.outlet_id "outletId", mr.recorded_by "recordedBy",
                 mr.observed_value "observedValue", mr.unit, mr.within_limit "withinLimit",
                 mr.observation_time "observationTime", mr.action_required "actionRequired",
                 mr.corrective_action_id "correctiveActionId",
                 c.process_step "processStep", c.critical_limit "criticalLimit"
          FROM monitoring_records mr
          JOIN outlets o ON o.id = mr.outlet_id
          LEFT JOIN ccps c ON c.id = mr.ccp_id
          WHERE o.organisation_id = $1 AND mr.ccp_id = $2
          ORDER BY mr.observation_time DESC
          LIMIT $3
        `;
        queryParams = [auth.organisationId, ccpId, limit];
      } else {
        queryText = `
          SELECT mr.id, mr.ccp_id "ccpId", mr.outlet_id "outletId", mr.recorded_by "recordedBy",
                 mr.observed_value "observedValue", mr.unit, mr.within_limit "withinLimit",
                 mr.observation_time "observationTime", mr.action_required "actionRequired",
                 mr.corrective_action_id "correctiveActionId",
                 c.process_step "processStep", c.critical_limit "criticalLimit"
          FROM monitoring_records mr
          JOIN outlets o ON o.id = mr.outlet_id
          LEFT JOIN ccps c ON c.id = mr.ccp_id
          WHERE o.organisation_id = $1
          ORDER BY mr.observation_time DESC
          LIMIT $2
        `;
        queryParams = [auth.organisationId, limit];
      }
    } else {
      // Scoped strictly to caller's outlet and organisation
      if (ccpId) {
        queryText = `
          SELECT mr.id, mr.ccp_id "ccpId", mr.outlet_id "outletId", mr.recorded_by "recordedBy",
                 mr.observed_value "observedValue", mr.unit, mr.within_limit "withinLimit",
                 mr.observation_time "observationTime", mr.action_required "actionRequired",
                 mr.corrective_action_id "correctiveActionId",
                 c.process_step "processStep", c.critical_limit "criticalLimit"
          FROM monitoring_records mr
          JOIN outlets o ON o.id = mr.outlet_id
          LEFT JOIN ccps c ON c.id = mr.ccp_id
          WHERE mr.outlet_id = $1 AND o.organisation_id = $2 AND mr.ccp_id = $3
          ORDER BY mr.observation_time DESC
          LIMIT $4
        `;
        queryParams = [auth.outletId, auth.organisationId, ccpId, limit];
      } else {
        queryText = `
          SELECT mr.id, mr.ccp_id "ccpId", mr.outlet_id "outletId", mr.recorded_by "recordedBy",
                 mr.observed_value "observedValue", mr.unit, mr.within_limit "withinLimit",
                 mr.observation_time "observationTime", mr.action_required "actionRequired",
                 mr.corrective_action_id "correctiveActionId",
                 c.process_step "processStep", c.critical_limit "criticalLimit"
          FROM monitoring_records mr
          JOIN outlets o ON o.id = mr.outlet_id
          LEFT JOIN ccps c ON c.id = mr.ccp_id
          WHERE mr.outlet_id = $1 AND o.organisation_id = $2
          ORDER BY mr.observation_time DESC
          LIMIT $3
        `;
        queryParams = [auth.outletId, auth.organisationId, limit];
      }
    }

    const rows = await query<any>(queryText, queryParams);
    const records = rows.map(r => ({
      ...r,
      observedValue: Number(r.observedValue)
    }));
    return ok({ records, demo: false });
  } catch (err: any) {
    console.error('[HACCP monitoring GET error]', err);
    return fail('DATABASE_ERROR', 'Failed to retrieve HACCP monitoring records', 500);
  }
}

export async function POST(req: Request) {
  const auth = await getAuthContext(req);
  if (!auth) {
    return fail('UNAUTHENTICATED', 'Authentication required', 401);
  }
  if (!can(auth.role, 'haccp:write')) {
    return fail('FORBIDDEN', 'You do not have permission to record HACCP monitoring', 403);
  }
  if (auth.journey && auth.journey !== 'restaurant' && auth.journey !== 'platform' && !['platform_admin', 'admin', 'superadmin'].includes(auth.role)) {
    return fail('FORBIDDEN', 'Account is not authorized for restaurant HACCP monitoring', 403);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
  }

  let b: any;
  try {
    b = await req.json();
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body', 400);
  }

  const ccpId = b?.ccpId || b?.ccp_id;
  if (!ccpId || typeof ccpId !== 'string' || !ccpId.trim()) {
    return fail('VALIDATION_ERROR', 'ccpId is required', 400);
  }

  const rawValue = b?.observedValue !== undefined ? b?.observedValue : b?.value;
  const value = Number(rawValue);
  if (rawValue === undefined || rawValue === null || !Number.isFinite(value)) {
    return fail('VALIDATION_ERROR', 'Observed value must be numeric', 400);
  }

  // In-memory demo fallback when DATABASE_URL is not set
  if (!process.env.DATABASE_URL) {
    const plan = getDemoPlan();
    const ccp = plan.ccps.find(c => c.id === ccpId);
    if (!ccp) {
      return fail('NOT_FOUND', 'CCP not found', 404);
    }
    if (!ccp.validationStatus) {
      return fail('INVALID_STATE', 'Validate the CCP critical limit before recording monitoring data.', 409);
    }

    const min = ccp.criticalLimitMin;
    const max = ccp.criticalLimitMax;
    const within = (min !== undefined ? value >= min : true) && (max !== undefined ? value <= max : true);
    let actionId: null | string = null;

    if (!within) {
      const action = createDemoAction({
        title: `Corrective action: ${ccp.processStep} CCP deviation`,
        description: `CCP monitoring value ${value} ${b.unit || ccp.unit} is outside the validated critical limit. Protect affected food and follow the approved corrective-action procedure.`,
        severity: 'high',
        priority: 'high',
        sourceType: 'haccp_monitoring'
      }, auth.userId);
      actionId = action.id;
    }

    const record = addDemoMonitoring({
      ccpId: ccp.id,
      outletId: auth.outletId,
      recordedBy: auth.userId,
      observedValue: value,
      unit: b.unit || ccp.unit,
      withinLimit: within,
      actionRequired: !within,
      correctiveActionId: actionId
    });

    return ok({ record, withinLimit: within, actionRequired: !within, correctiveActionId: actionId, demo: true });
  }

  // Production PostgreSQL path
  try {
    // 1. Fetch CCP and enforce tenant isolation
    const ccpRows = await query<any>(`
      SELECT c.id, c.haccp_plan_id, c.process_step, c.critical_limit, c.unit,
             c.critical_limit_min, c.critical_limit_max, c.validation_status,
             hp.outlet_id, o.organisation_id
      FROM ccps c
      JOIN haccp_plans hp ON c.haccp_plan_id = hp.id
      JOIN outlets o ON o.id = hp.outlet_id
      WHERE c.id = $1
    `, [ccpId]);

    if (ccpRows.length === 0) {
      return fail('NOT_FOUND', 'CCP not found', 404);
    }

    const ccp = ccpRows[0];
    const isPlatformAdmin = ['platform_admin', 'superadmin', 'admin'].includes(auth.role);
    const isOrgAdmin = ['org_admin', 'owner'].includes(auth.role);

    if (!isPlatformAdmin && auth.organisationId && ccp.organisation_id !== auth.organisationId) {
      return fail('FORBIDDEN', 'Cross-tenant access forbidden: organisation mismatch', 403);
    }
    if (!isPlatformAdmin && !isOrgAdmin && auth.outletId && ccp.outlet_id !== auth.outletId) {
      return fail('FORBIDDEN', 'Cross-tenant access forbidden: outlet mismatch', 403);
    }

    // 2. Validate CCP critical limit validation status
    if (ccp.validation_status !== 'validated') {
      return fail('INVALID_STATE', 'Validate the CCP critical limit before recording monitoring data.', 409);
    }

    // 3. Evaluate critical limit bounds
    const min = ccp.critical_limit_min !== null && ccp.critical_limit_min !== undefined ? Number(ccp.critical_limit_min) : undefined;
    const max = ccp.critical_limit_max !== null && ccp.critical_limit_max !== undefined ? Number(ccp.critical_limit_max) : undefined;
    const within = (min !== undefined ? value >= min : true) && (max !== undefined ? value <= max : true);
    const actionRequired = !within;
    const unit = b?.unit || ccp.unit || '';
    const targetOutletId = ccp.outlet_id || auth.outletId;

    // 4. Atomically record monitoring and corrective action (if required)
    const result = await transaction(async (client) => {
      let actionId: string | null = null;

      if (actionRequired) {
        const title = `Corrective action: ${ccp.process_step} CCP deviation`;
        const description = `CCP monitoring value ${value} ${unit} is outside the validated critical limit. Protect affected food and follow the approved corrective-action procedure.`;
        const immediateAction = 'Hold affected food, assess disposition, and restore control according to approved procedure.';
        const correctiveAction = 'Follow approved CCP corrective action procedure and verify product disposition.';
        const rootCause = 'Critical limit deviation observed during routine HACCP monitoring.';

        const actionRes = await client.query(`
          INSERT INTO corrective_actions(
            id, outlet_id, source_type, source_id, title, description,
            severity, priority, assigned_to, due_date, status,
            immediate_action, corrective_action, root_cause,
            source_check_code, created_at
          )
          VALUES(
            gen_random_uuid(), $1, 'haccp_monitoring', $2, $3, $4,
            'high', 'high', $5, current_date, 'open',
            $6, $7, $8,
            $9, now()
          )
          RETURNING id
        `, [
          targetOutletId, ccp.id, title, description,
          auth.userId, immediateAction, correctiveAction, rootCause,
          ccp.id
        ]);
        actionId = actionRes.rows[0].id;

        await client.query(`
          INSERT INTO audit_logs(id, organisation_id, user_id, entity_type, entity_id, action, new_value)
          VALUES(gen_random_uuid(), $1, $2, 'corrective_action', $3, 'created', $4)
        `, [
          auth.organisationId, auth.userId, actionId,
          JSON.stringify({ title, source: 'haccp_monitoring', ccpId: ccp.id, value, unit })
        ]);
      }

      const monRes = await client.query(`
        INSERT INTO monitoring_records(
          id, ccp_id, outlet_id, recorded_by, observed_value, unit,
          within_limit, observation_time, action_required, corrective_action_id
        )
        VALUES(
          gen_random_uuid(), $1, $2, $3, $4, $5,
          $6, now(), $7, $8
        )
        RETURNING
          id, ccp_id "ccpId", outlet_id "outletId", recorded_by "recordedBy",
          observed_value "observedValue", unit, within_limit "withinLimit",
          observation_time "observationTime", action_required "actionRequired",
          corrective_action_id "correctiveActionId"
      `, [
        ccp.id, targetOutletId, auth.userId, value, unit,
        within, actionRequired, actionId
      ]);

      const record = monRes.rows[0];
      record.observedValue = Number(record.observedValue);

      await client.query(`
        INSERT INTO audit_logs(id, organisation_id, user_id, entity_type, entity_id, action, new_value)
        VALUES(gen_random_uuid(), $1, $2, 'monitoring_record', $3, 'recorded', $4)
      `, [
        auth.organisationId, auth.userId, record.id,
        JSON.stringify({ ccpId: ccp.id, observedValue: value, unit, withinLimit: within, actionRequired, correctiveActionId: actionId })
      ]);

      return {
        record,
        withinLimit: within,
        actionRequired,
        correctiveActionId: actionId,
        demo: false
      };
    });

    return ok(result, 201);
  } catch (err: any) {
    console.error('[HACCP monitoring POST error]', err);
    return fail('DATABASE_ERROR', 'Failed to record HACCP monitoring entry', 500);
  }
}
