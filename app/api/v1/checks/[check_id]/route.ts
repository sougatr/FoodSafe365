import { getAuthContext } from '../../../../../lib/auth';
import { query } from '../../../../../lib/db';
import { fail, ok } from '../../../../../lib/response';
import { evaluateApplicability } from '../../../../../lib/rule-applicability';
import { requireOutletAccess } from '../../../../../lib/tenant';

export async function GET(req: Request, { params }: { params: { check_id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  if (!process.env.DATABASE_URL) return ok({
    id: params.check_id,
    templateCode: 'DAILY_FOOD_SAFETY',
    name: 'Daily Food Safety Check',
    status: 'in_progress',
    completionPercentage: 89,
    items: [
      { id: 'demo-item-1', ruleId: 'demo-rule-1', ruleCode: 'FS-DEMO-001', question: 'Are food-contact surfaces cleaned and ready for use?', responseType: 'yes_no', required: true, evidenceRequired: false },
      { id: 'demo-item-2', ruleId: 'demo-rule-2', ruleCode: 'FS-DEMO-002', question: 'Is there any visible evidence of pest activity?', responseType: 'yes_no', required: true, evidenceRequired: true },
      { id: 'demo-ccp-cooking', ruleId: 'demo-rule-ccp-cooking', ruleCode: 'HACCP-CCP-COOKING', question: 'Record the validated CCP monitoring value for the cooking process.', helpText: 'Use the approved HACCP/process limit for this outlet. FoodSafe365 will evaluate the measured value against the validated CCP range.', responseType: 'temperature', required: false, evidenceRequired: false, ccpId: 'ccp-1' }
    ],
    demo: true
  });

  try {
    const check = (await query<any>(`SELECT ci.id,ci.outlet_id,ci.status,ci.completion_percentage,ct.code template_code,ct.name FROM check_instances ci JOIN check_templates ct ON ct.id=ci.check_template_id WHERE ci.id=$1`, [params.check_id]))[0];
    if (!check) return fail('NOT_FOUND', 'Check not found', 404);
    const access = await requireOutletAccess(check.outlet_id, req);
    if (!access.ok) return fail((access as any).code || (access.status === 401 ? 'UNAUTHENTICATED' : access.status === 403 ? 'FORBIDDEN' : 'NOT_FOUND'), access.message, access.status);
    const profile = (await query<any>(`SELECT COALESCE((SELECT json_agg(fp.code) FROM outlet_processes op JOIN food_processes fp ON fp.id=op.process_id WHERE op.outlet_id=o.id AND op.active=true),'[]') processes,COALESCE((SELECT json_agg(et.code) FROM equipment e JOIN equipment_types et ON et.id=e.equipment_type_id WHERE e.outlet_id=o.id AND e.status='active'),'[]') equipment FROM outlets o WHERE o.id=$1`, [check.outlet_id]))[0] || {};
    const rows = await query<any>(`SELECT i.id,i.rule_id,r.rule_code,i.question,i.help_text,i.response_type,i.sequence_no,i.required,i.evidence_required,i.ccp_id,cr.response_value,cr.status response_status,COALESCE(string_agg(rc.value->>'text',' | '),'') applicability FROM check_template_items i JOIN rules r ON r.id=i.rule_id LEFT JOIN check_responses cr ON cr.check_template_item_id=i.id AND cr.check_instance_id=$1 LEFT JOIN rule_conditions rc ON rc.rule_id=i.rule_id WHERE i.check_template_id=(SELECT check_template_id FROM check_instances WHERE id=$1) AND i.active=true GROUP BY i.id,r.rule_code,cr.response_value,cr.status ORDER BY i.sequence_no`, [params.check_id]);
    const p = { processCodes: profile.processes || [], equipmentCodes: profile.equipment || [] };
    const items = rows.filter(x => evaluateApplicability([{ field_name: 'applicability', value: { text: x.applicability } }], p)).map(({ applicability, ...x }) => x);
    return ok({ ...check, items });
  } catch (err: any) {
    console.error('[API GET /checks/[check_id]] Error:', err);
    return fail('INTERNAL_ERROR', 'Unable to retrieve check details.', 500);
  }
}
