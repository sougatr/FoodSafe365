import assert from 'assert';
import { NextRequest } from 'next/server';

import { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME, SessionJourney } from '../lib/session';
import { setPoolForTesting, resetPool } from '../lib/db';
import { resetMockRateLimits } from '../lib/rate-limiter';
import { getDemoPlan, updateDemoPlan } from '../lib/demo-haccp';
import {
  getRestaurantEntryAsync,
  updateRestaurantStatusAsync,
  generateClaimTokenAsync,
  verifyClaimTokenAsync,
  markClaimTokenUsedAsync,
  processCustomerFeedbackForUnclaimedRestaurantAsync,
  getOutboxNotificationsAsync,
  clearOutboxAsync
} from '../lib/unclaimed-restaurant-store';

import { GET as getHaccpHandler, POST as postHaccpHandler, PATCH as patchHaccpHandler } from '../app/api/v1/haccp/route';
import { GET as getHaccpPlanByIdHandler, PATCH as patchHaccpPlanByIdHandler } from '../app/api/v1/haccp/[plan_id]/route';
import { POST as postHaccpMonitoringHandler } from '../app/api/v1/haccp/monitoring/route';
import { GET as getRestaurantHandler } from '../app/api/v1/restaurants/[restaurant_id]/route';
import { POST as claimRestaurantHandler } from '../app/api/v1/restaurants/[restaurant_id]/claim/route';
import { GET as getOutboxHandler } from '../app/api/v1/notifications/outbox/route';

function extractCookieToken(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Stateful Mock PostgreSQL Database for Stage 5D Testing
 */
class Stage5DMockDatabase {
  public tables: Map<string, any[]> = new Map();
  public executedQueries: { sql: string; params: any[] }[] = [];

  constructor() {
    this.tables.set('organisations', [
      { id: 'org-bandra', name: 'Bandra Bites Hospitality' },
      { id: 'org-competitor', name: 'Competitor Dining Group' }
    ]);
    this.tables.set('outlets', [
      { id: 'outlet-bandra', organisation_id: 'org-bandra', name: 'Bandra Bites Flagship', status: 'active' },
      { id: 'outlet-competitor', organisation_id: 'org-competitor', name: 'Competitor Bistro', status: 'active' }
    ]);
    this.tables.set('users', [
      { id: 'usr-fss-1', name: 'Farhan Supervisor', email: 'fss@bandrabites.example.com' },
      { id: 'usr-mgr-1', name: 'Meera Manager', email: 'manager@bandrabites.example.com' },
      { id: 'usr-admin-1', name: 'Aakash Admin', email: 'admin@bandrabites.example.com' }
    ]);
    this.tables.set('haccp_plans', []);
    this.tables.set('hazards', []);
    this.tables.set('ccps', []);
    this.tables.set('monitoring_records', []);
    this.tables.set('unclaimed_directory_entries', [
      {
        id: 'leopold-cafe-colaba',
        name: 'Leopold Cafe & Bar',
        business_type: 'RESTAURANT',
        city: 'Mumbai',
        location: 'Colaba Causeway, Colaba, Mumbai',
        status: 'UNCLAIMED',
        claimed_at: null,
        claimed_by_user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'freshmart-supermarket-bandra',
        name: 'FreshMart Supermarket Bandra',
        business_type: 'SUPERMARKET',
        city: 'Mumbai',
        location: 'Hill Road, Bandra West, Mumbai',
        status: 'DISCOVERED',
        claimed_at: null,
        claimed_by_user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    this.tables.set('unclaimed_business_contacts', [
      {
        id: 'contact-leopold-1',
        restaurant_id: 'leopold-cafe-colaba',
        contact_type: 'EMAIL',
        contact_value: 'management@leopoldcafe.example.com',
        source_type: 'OFFICIAL_WEBSITE',
        source_reference: 'https://leopoldcafe.example.com/contact',
        is_business_contact: true,
        permitted_for_feedback_notification: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    this.tables.set('claim_tokens', []);
    this.tables.set('outbox_notifications', []);
    this.tables.set('corrective_actions', []);
    this.tables.set('audit_logs', []);
  }

  public async connect() {
    return {
      query: async (sqlText: string, params: any[] = []) => this.query(sqlText, params),
      release: () => {}
    };
  }

  public async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    const trimmed = sql.trim().replace(/\s+/g, ' ');
    this.executedQueries.push({ sql: trimmed, params });

    if (trimmed === 'BEGIN' || trimmed === 'COMMIT' || trimmed === 'ROLLBACK') {
      return { rows: [], rowCount: 0 };
    }

    if (trimmed.includes('INSERT INTO corrective_actions')) {
      const act = { id: `act-${Date.now()}` };
      this.tables.get('corrective_actions')!.push(act);
      return { rows: [{ id: act.id }], rowCount: 1 };
    }

    if (trimmed.includes('INSERT INTO audit_logs')) {
      const log = { id: `audit-${Date.now()}` };
      this.tables.get('audit_logs')!.push(log);
      return { rows: [{ id: log.id }], rowCount: 1 };
    }

    // Outlets lookup
    if (trimmed.includes('FROM outlets WHERE id = $1 AND organisation_id = $2')) {
      const [id, orgId] = params;
      const match = (this.tables.get('outlets') || []).filter(o => o.id === id && o.organisation_id === orgId);
      return { rows: match, rowCount: match.length };
    }

    // HACCP Plans - load with details JOIN outlets
    if (trimmed.includes('FROM haccp_plans hp JOIN outlets o ON o.id = hp.outlet_id WHERE hp.id = $1')) {
      const planId = params[0];
      const plan = (this.tables.get('haccp_plans') || []).find(p => p.id === planId);
      if (!plan) return { rows: [], rowCount: 0 };
      const outlet = (this.tables.get('outlets') || []).find(o => o.id === plan.outlet_id);
      return {
        rows: [{
          id: plan.id,
          outletId: plan.outlet_id,
          name: plan.name,
          version: plan.version,
          status: plan.status,
          approvedBy: plan.approved_by,
          approvedAt: plan.approved_at,
          effectiveFrom: plan.effective_from,
          reviewDate: plan.review_date,
          organisationId: outlet ? outlet.organisation_id : null
        }],
        rowCount: 1
      };
    }

    // HACCP Plans - find by outlet
    if (trimmed.includes('FROM haccp_plans WHERE outlet_id = $1')) {
      const outletId = params[0];
      const plans = (this.tables.get('haccp_plans') || []).filter(p => p.outlet_id === outletId);
      plans.sort((a, b) => (b.status === 'active' ? 1 : 0) - (a.status === 'active' ? 1 : 0));
      return { rows: plans.slice(0, 1), rowCount: plans.length > 0 ? 1 : 0 };
    }

    // HACCP Plans - INSERT
    if (trimmed.startsWith('INSERT INTO haccp_plans')) {
      const [id, outlet_id, name, version, status, effective_from, review_date] = params;
      const rec = { id, outlet_id, name, version, status, effective_from, review_date, approved_by: null, approved_at: null };
      this.tables.get('haccp_plans')!.push(rec);
      return { rows: [rec], rowCount: 1 };
    }

    // HACCP Plans - UPDATE status (activate)
    if (trimmed.startsWith('UPDATE haccp_plans SET status =')) {
      const [planId, approvedBy] = params;
      const plan = (this.tables.get('haccp_plans') || []).find(p => p.id === planId);
      if (plan) {
        plan.status = 'active';
        plan.approved_by = approvedBy;
        plan.approved_at = new Date().toISOString();
        plan.effective_from = new Date().toISOString().slice(0, 10);
      }
      return { rows: plan ? [plan] : [], rowCount: plan ? 1 : 0 };
    }

    // Hazards - COUNT for plan
    if (trimmed.includes('SELECT count(*) as c FROM hazards WHERE haccp_plan_id = $1')) {
      const planId = params[0];
      const count = (this.tables.get('hazards') || []).filter(h => h.haccp_plan_id === planId).length;
      return { rows: [{ c: String(count) }], rowCount: 1 };
    }

    // Hazards - SELECT for plan
    if (trimmed.includes('FROM hazards WHERE haccp_plan_id = $1') && !trimmed.includes('SELECT count')) {
      const planId = params[0];
      const hazards = (this.tables.get('hazards') || []).filter(h => h.haccp_plan_id === planId);
      return {
        rows: hazards.map(h => ({
          id: h.id,
          processStep: h.process_step,
          hazardType: h.hazard_type,
          description: h.hazard_description,
          likelihood: h.likelihood,
          severity: h.severity,
          riskScore: h.risk_score,
          controlMeasure: h.control_measure,
          significant: h.significant
        })),
        rowCount: hazards.length
      };
    }

    // Hazards - SELECT by id
    if (trimmed.includes('SELECT id, likelihood, severity FROM hazards WHERE id = $1 AND haccp_plan_id = $2') ||
        trimmed.includes('SELECT id FROM hazards WHERE id = $1 AND haccp_plan_id = $2')) {
      const [id, planId] = params;
      const h = (this.tables.get('hazards') || []).find(haz => haz.id === id && haz.haccp_plan_id === planId);
      return { rows: h ? [h] : [], rowCount: h ? 1 : 0 };
    }

    // Hazards - INSERT
    if (trimmed.startsWith('INSERT INTO hazards')) {
      const [id, haccp_plan_id, process_step, hazard_type, hazard_description, likelihood, severity, risk_score, control_measure, significant] = params;
      const h = { id, haccp_plan_id, process_step, hazard_type, hazard_description, likelihood, severity, risk_score, control_measure, significant };
      this.tables.get('hazards')!.push(h);
      return { rows: [h], rowCount: 1 };
    }

    // Hazards - UPDATE
    if (trimmed.startsWith('UPDATE hazards')) {
      const [id, planId, processStep, hazardType, description, likelihood, severity, riskScore, controlMeasure, significant] = params;
      const h = (this.tables.get('hazards') || []).find(haz => haz.id === id && haz.haccp_plan_id === planId);
      if (h) {
        if (processStep) h.process_step = processStep;
        if (hazardType) h.hazard_type = hazardType;
        if (description) h.hazard_description = description;
        if (likelihood !== null && likelihood !== undefined) h.likelihood = likelihood;
        if (severity !== null && severity !== undefined) h.severity = severity;
        if (riskScore !== null && riskScore !== undefined) h.risk_score = riskScore;
        if (controlMeasure) h.control_measure = controlMeasure;
        if (significant !== null && significant !== undefined) h.significant = significant;
      }
      return { rows: h ? [h] : [], rowCount: h ? 1 : 0 };
    }

    // Hazards - DELETE
    if (trimmed.startsWith('DELETE FROM hazards WHERE id = $1 AND haccp_plan_id = $2')) {
      const [id, planId] = params;
      const idx = (this.tables.get('hazards') || []).findIndex(h => h.id === id && h.haccp_plan_id === planId);
      if (idx >= 0) {
        const removed = this.tables.get('hazards')!.splice(idx, 1);
        return { rows: removed, rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // CCPs - DELETE by hazard
    if (trimmed.startsWith('DELETE FROM ccps WHERE hazard_id = $1 AND haccp_plan_id = $2')) {
      const [hazardId, planId] = params;
      const list = this.tables.get('ccps') || [];
      const remaining = list.filter(c => !(c.hazard_id === hazardId && c.haccp_plan_id === planId));
      this.tables.set('ccps', remaining);
      return { rows: [], rowCount: list.length - remaining.length };
    }

    // CCPs - SELECT for plan
    if (trimmed.includes('FROM ccps WHERE haccp_plan_id = $1') && !trimmed.includes('SELECT count')) {
      const planId = params[0];
      const ccps = (this.tables.get('ccps') || []).filter(c => c.haccp_plan_id === planId);
      return {
        rows: ccps.map(c => ({
          id: c.id,
          hazardId: c.hazard_id,
          processStep: c.process_step,
          justification: c.justification,
          criticalLimit: c.critical_limit,
          critical_limit: c.critical_limit,
          unit: c.unit,
          monitoringMethod: c.monitoring_method,
          monitoringFrequency: c.monitoring_frequency,
          responsibleRole: c.responsible_person_role,
          correctiveAction: c.corrective_action,
          verificationMethod: c.verification_method,
          criticalLimitMin: c.critical_limit_min,
          criticalLimitMax: c.critical_limit_max,
          validationStatus: c.validation_status,
          validation_status: c.validation_status,
          validatedBy: c.validated_by,
          validatedAt: c.validated_at
        })),
        rowCount: ccps.length
      };
    }

    // CCPs - SELECT by id
    if (trimmed.includes('SELECT id FROM ccps WHERE id = $1 AND haccp_plan_id = $2')) {
      const [id, planId] = params;
      const c = (this.tables.get('ccps') || []).find(ccp => ccp.id === id && ccp.haccp_plan_id === planId);
      return { rows: c ? [c] : [], rowCount: c ? 1 : 0 };
    }

    // CCPs - INSERT
    if (trimmed.startsWith('INSERT INTO ccps')) {
      const [
        id, haccp_plan_id, hazard_id, process_step, justification, critical_limit, unit,
        monitoring_method, monitoring_frequency, responsible_person_role, corrective_action,
        verification_method, critical_limit_min, critical_limit_max, validation_status,
        validated_by, validated_at
      ] = params;
      const c = {
        id, haccp_plan_id, hazard_id, process_step, justification, critical_limit, unit,
        monitoring_method, monitoring_frequency, responsible_person_role, corrective_action,
        verification_method, critical_limit_min, critical_limit_max, validation_status,
        validated_by, validated_at
      };
      this.tables.get('ccps')!.push(c);
      return { rows: [c], rowCount: 1 };
    }

    // CCPs - UPDATE
    if (trimmed.startsWith('UPDATE ccps')) {
      const [
        id, planId, processStep, justification, criticalLimit, unit,
        monitoringMethod, monitoringFrequency, respRole, correctiveAction, verificationMethod,
        hasMin, minVal, hasMax, maxVal, validationStatus, isValidated, validatedBy
      ] = params;
      const c = (this.tables.get('ccps') || []).find(ccp => ccp.id === id && ccp.haccp_plan_id === planId);
      if (c) {
        if (processStep) c.process_step = processStep;
        if (justification) c.justification = justification;
        if (criticalLimit) c.critical_limit = criticalLimit;
        if (unit) c.unit = unit;
        if (monitoringMethod) c.monitoring_method = monitoringMethod;
        if (monitoringFrequency) c.monitoring_frequency = monitoringFrequency;
        if (respRole) c.responsible_person_role = respRole;
        if (correctiveAction) c.corrective_action = correctiveAction;
        if (verificationMethod) c.verification_method = verificationMethod;
        if (hasMin) c.critical_limit_min = minVal;
        if (hasMax) c.critical_limit_max = maxVal;
        if (validationStatus) c.validation_status = validationStatus;
        if (isValidated) {
          c.validated_by = validatedBy;
          c.validated_at = new Date().toISOString();
        }
      }
      return { rows: c ? [c] : [], rowCount: c ? 1 : 0 };
    }

    // CCP JOIN haccp_plans JOIN outlets (for monitoring route)
    if (trimmed.includes('FROM ccps c JOIN haccp_plans hp ON c.haccp_plan_id = hp.id JOIN outlets o ON o.id = hp.outlet_id WHERE c.id = $1')) {
      const ccpId = params[0];
      const c = (this.tables.get('ccps') || []).find(ccp => ccp.id === ccpId);
      if (!c) return { rows: [], rowCount: 0 };
      const plan = (this.tables.get('haccp_plans') || []).find(p => p.id === c.haccp_plan_id);
      const outlet = plan ? (this.tables.get('outlets') || []).find(o => o.id === plan.outlet_id) : null;
      return {
        rows: [{
          id: c.id,
          haccp_plan_id: c.haccp_plan_id,
          process_step: c.process_step,
          critical_limit: c.critical_limit,
          unit: c.unit,
          critical_limit_min: c.critical_limit_min,
          critical_limit_max: c.critical_limit_max,
          validation_status: c.validation_status,
          outlet_id: outlet ? outlet.id : null,
          organisation_id: outlet ? outlet.organisation_id : null
        }],
        rowCount: 1
      };
    }

    // Monitoring records - INSERT
    if (trimmed.includes('INSERT INTO monitoring_records')) {
      const ccp_id = params[0];
      const outlet_id = params[1];
      const recorded_by = params[2];
      const observed_value = params[3];
      const unit = params[4];
      const within_limit = params[5];
      const action_required = params[6];
      const corrective_action_id = params[7];
      const rec = {
        id: `mon-${Date.now()}`,
        ccpId: ccp_id,
        outletId: outlet_id,
        recordedBy: recorded_by,
        observedValue: observed_value,
        unit,
        withinLimit: within_limit,
        observationTime: new Date().toISOString(),
        actionRequired: action_required,
        correctiveActionId: corrective_action_id
      };
      this.tables.get('monitoring_records')!.push(rec);
      return { rows: [rec], rowCount: 1 };
    }

    // Unclaimed Directory - SELECT by id
    if (trimmed.includes('FROM unclaimed_directory_entries WHERE id = $1')) {
      const id = params[0];
      const match = (this.tables.get('unclaimed_directory_entries') || []).filter(e => e.id === id);
      return {
        rows: match.map(e => ({
          id: e.id,
          name: e.name,
          businessType: e.business_type,
          city: e.city,
          location: e.location,
          status: e.status,
          claimedAt: e.claimed_at,
          claimedByUserId: e.claimed_by_user_id,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        })),
        rowCount: match.length
      };
    }

    // Unclaimed Directory - SELECT all
    if (trimmed.includes('FROM unclaimed_directory_entries ORDER BY name ASC')) {
      const list = this.tables.get('unclaimed_directory_entries') || [];
      return {
        rows: list.map(e => ({
          id: e.id,
          name: e.name,
          businessType: e.business_type,
          city: e.city,
          location: e.location,
          status: e.status,
          claimedAt: e.claimed_at,
          claimedByUserId: e.claimed_by_user_id,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        })),
        rowCount: list.length
      };
    }

    // Unclaimed Directory - UPSERT
    if (trimmed.startsWith('INSERT INTO unclaimed_directory_entries')) {
      const [id, status, claimedBy] = params;
      let existing = (this.tables.get('unclaimed_directory_entries') || []).find(e => e.id === id);
      if (existing) {
        existing.status = status;
        if (status === 'CLAIMED') {
          existing.claimed_at = new Date().toISOString();
        }
        if (claimedBy) {
          existing.claimed_by_user_id = claimedBy;
        }
        existing.updated_at = new Date().toISOString();
      } else {
        existing = {
          id,
          name: id,
          business_type: 'RESTAURANT',
          city: 'Mumbai',
          location: 'Mumbai',
          status,
          claimed_at: status === 'CLAIMED' ? new Date().toISOString() : null,
          claimed_by_user_id: claimedBy || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.tables.get('unclaimed_directory_entries')!.push(existing);
      }
      return {
        rows: [{
          id: existing.id,
          name: existing.name,
          businessType: existing.business_type,
          city: existing.city,
          location: existing.location,
          status: existing.status,
          claimedAt: existing.claimed_at,
          claimedByUserId: existing.claimed_by_user_id,
          createdAt: existing.created_at,
          updatedAt: existing.updated_at
        }],
        rowCount: 1
      };
    }

    // Unclaimed business contacts - SELECT
    if (trimmed.includes('FROM unclaimed_business_contacts WHERE restaurant_id = $1')) {
      const restId = params[0];
      const match = (this.tables.get('unclaimed_business_contacts') || []).filter(c => c.restaurant_id === restId);
      return {
        rows: match.map(c => ({
          id: c.id,
          restaurantId: c.restaurant_id,
          contactType: c.contact_type,
          contactValue: c.contact_value,
          sourceType: c.source_type,
          sourceReference: c.source_reference,
          isBusinessContact: c.is_business_contact,
          permittedForFeedbackNotification: c.permitted_for_feedback_notification,
          verifiedAt: c.verified_at,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        })),
        rowCount: match.length
      };
    }

    // Claim tokens - INSERT
    if (trimmed.startsWith('INSERT INTO claim_tokens')) {
      const [token, restaurant_id, expiresInHours] = params;
      const expires_at = new Date(Date.now() + (Number(expiresInHours) || 72) * 3600 * 1000).toISOString();
      const rec = {
        token,
        restaurant_id,
        restaurantId: restaurant_id,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        expires_at,
        expiresAt: expires_at,
        used: false,
        used_at: null,
        claimed_by: null
      };
      this.tables.get('claim_tokens')!.push(rec);
      return { rows: [rec], rowCount: 1 };
    }

    // Claim tokens - SELECT by token
    if (trimmed.includes('FROM claim_tokens WHERE token = $1')) {
      const token = params[0];
      const match = (this.tables.get('claim_tokens') || []).filter(t => t.token === token);
      return {
        rows: match.map(t => ({
          token: t.token,
          restaurantId: t.restaurant_id,
          createdAt: t.created_at,
          expiresAt: t.expires_at,
          used: t.used,
          usedAt: t.used_at,
          claimedBy: t.claimed_by
        })),
        rowCount: match.length
      };
    }

    // Claim tokens - UPDATE (mark used)
    if (trimmed.startsWith('UPDATE claim_tokens SET used = true')) {
      const [token, claimedBy] = params;
      const rec = (this.tables.get('claim_tokens') || []).find(t => t.token === token && !t.used);
      if (rec) {
        rec.used = true;
        rec.used_at = new Date().toISOString();
        rec.claimed_by = claimedBy;
        return { rows: [{ token: rec.token }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Outbox notifications - INSERT
    if (trimmed.startsWith('INSERT INTO outbox_notifications')) {
      const [
        id, restaurant_id, restaurant_name, business_type, feedback_id,
        recipient_email, contact_source, subject, body, claim_token,
        claim_url, customer_response_requested, customer_contact_shared
      ] = params;
      const rec = {
        id,
        restaurant_id,
        restaurant_name,
        business_type,
        feedback_id,
        notification_type: 'CUSTOMER_FEEDBACK_PROFILE_INVITATION',
        recipient_email,
        recipient_type: 'BUSINESS_CONTACT',
        contact_source,
        subject,
        body,
        claim_token,
        claim_url,
        status: 'SENT',
        customer_response_requested,
        customer_contact_shared,
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString()
      };
      this.tables.get('outbox_notifications')!.push(rec);
      return { rows: [rec], rowCount: 1 };
    }

    // Outbox notifications - DELETE
    if (trimmed.startsWith('DELETE FROM outbox_notifications')) {
      this.tables.set('outbox_notifications', []);
      return { rows: [], rowCount: 1 };
    }

    // Outbox notifications - SELECT
    if (trimmed.includes('FROM outbox_notifications')) {
      let list = [...(this.tables.get('outbox_notifications') || [])];
      if (trimmed.includes('WHERE restaurant_id = $1') && params[0]) {
        list = list.filter(n => n.restaurant_id === params[0]);
      }
      return {
        rows: list.map(n => ({
          id: n.id,
          restaurantId: n.restaurant_id,
          restaurantName: n.restaurant_name,
          businessType: n.business_type,
          feedbackId: n.feedback_id,
          notificationType: n.notification_type,
          recipientEmail: n.recipient_email,
          recipientType: n.recipient_type,
          contactSource: n.contact_source,
          subject: n.subject,
          body: n.body,
          claimToken: n.claim_token,
          claimUrl: n.claim_url,
          status: n.status,
          customerResponseRequested: n.customer_response_requested,
          customerContactShared: n.customer_contact_shared,
          createdAt: n.created_at,
          sentAt: n.sent_at
        })),
        rowCount: list.length
      };
    }

    return { rows: [], rowCount: 0 };
  }
}

async function runStage5DTests() {
  console.log('\n========================================================================');
  console.log('FOODSAFE365 — STAGE 5D: HACCP & UNCLAIMED PERSISTENCE TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  const mockDb = new Stage5DMockDatabase();

  // Helper to make authenticated Request
  function makeAuthReq(
    url: string,
    method: string,
    session: { userId: string; organisationId: string; outletId: string; role: string; journey?: SessionJourney },
    body?: any
  ): Request {
    const token = createSessionToken(session);
    const headers: Record<string, string> = {
      cookie: `${SESSION_COOKIE_NAME}=${token}`,
      'content-type': 'application/json'
    };
    return new Request(url, {
      method,
      headers,
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
    });
  }

  // -------------------------------------------------------------------------
  // TEST 1: Unauthenticated request to /api/v1/haccp returns 401
  // -------------------------------------------------------------------------
  {
    const req = new Request('http://localhost:3000/api/v1/haccp', { method: 'GET' });
    const res = await getHaccpHandler(req);
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'UNAUTHENTICATED');
    console.log('  ✓ 1. Unauthenticated request to /api/v1/haccp returns 401');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 2: Unauthorized roles return 403
  // -------------------------------------------------------------------------
  {
    const handlerSession = { userId: 'usr-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_handler' };
    const req = makeAuthReq('http://localhost:3000/api/v1/haccp', 'GET', handlerSession);
    const res = await getHaccpHandler(req);
    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error.code, 'FORBIDDEN');

    // Provider / grocery journey cannot access restaurant HACCP operations
    const providerSession: { userId: string; organisationId: string; outletId: string; role: string; journey: SessionJourney } = { userId: 'usr-provider', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor', journey: 'provider' };
    const resProvider = await getHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'GET', providerSession));
    assert.strictEqual(resProvider.status, 403);
    console.log('  ✓ 2. Unauthorized roles (food_handler, diner journey) return 403 FORBIDDEN');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 3: In-memory demo fallback when DATABASE_URL is unset
  // -------------------------------------------------------------------------
  {
    delete process.env.DATABASE_URL;
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };
    const res = await getHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'GET', supervisorSession));
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.demo, true);
    assert(json.data.plan !== null);
    assert.strictEqual(json.data.plan.id, 'demo-haccp');
    console.log('  ✓ 3. In-memory demo fallback when DATABASE_URL is unset (returns demo: true)');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 4: PostgreSQL HACCP Plan Creation (POST /api/v1/haccp)
  // -------------------------------------------------------------------------
  {
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';
    setPoolForTesting(mockDb as any);

    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };

    // Manager from org-competitor cannot create plan for outlet-bandra (403)
    const competitorManager = { userId: 'usr-comp-1', organisationId: 'org-competitor', outletId: 'outlet-competitor', role: 'outlet_manager' };
    const resComp = await postHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'POST', competitorManager, {
      outletId: 'outlet-bandra',
      name: 'Unauthorized Plan'
    }));
    assert.strictEqual(resComp.status, 403);

    // Authorized supervisor creates plan for outlet-bandra
    const res = await postHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'POST', supervisorSession, {
      id: 'plan-bandra-001',
      name: 'Bandra Bites HACCP Master Plan',
      version: '1.0'
    }));
    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.data.plan.id, 'plan-bandra-001');
    assert.strictEqual(json.data.plan.status, 'draft');
    assert.strictEqual(json.data.plan.outletId, 'outlet-bandra');
    console.log('  ✓ 4. PostgreSQL HACCP plan creation succeeds with 201 and blocks cross-tenant creation');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 5: Hazard Analysis Persistence (PATCH add_hazard)
  // -------------------------------------------------------------------------
  {
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };

    // Missing field fails validation
    const badReq = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'add_hazard',
      processStep: 'Cooking'
    }));
    assert.strictEqual(badReq.status, 400);

    // Valid hazard addition
    const res = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'add_hazard',
      id: 'haz-cook-001',
      processStep: 'Cooking',
      hazardType: 'biological',
      description: 'Survival of Salmonella and pathogenic bacteria',
      likelihood: 3,
      severity: 5,
      controlMeasure: 'Cook core food to 75°C for 2 minutes',
      significant: true
    }));
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.plan.hazards.length, 1);
    const haz = json.data.plan.hazards[0];
    assert.strictEqual(haz.id, 'haz-cook-001');
    assert.strictEqual(haz.riskScore, 15);
    assert.strictEqual(haz.significant, true);
    console.log('  ✓ 5. Hazard analysis persistence calculates riskScore (15) and validates hazard fields');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 6: Hazard Update and Cascade Deletion
  // -------------------------------------------------------------------------
  {
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };

    // Update hazard
    const updateRes = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'update_hazard',
      id: 'haz-cook-001',
      likelihood: 4,
      severity: 5
    }));
    assert.strictEqual(updateRes.status, 200);
    const updatedPlan = (await updateRes.json()).data.plan;
    assert.strictEqual(updatedPlan.hazards[0].riskScore, 20);

    // Add secondary hazard for delete testing
    await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'add_hazard',
      id: 'haz-temp-del',
      processStep: 'Packaging',
      hazardType: 'physical',
      description: 'Plastic packaging foreign particles',
      likelihood: 2,
      severity: 3,
      controlMeasure: 'Visual inspection',
      significant: false
    }));

    // Delete secondary hazard
    const delRes = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'delete_hazard',
      id: 'haz-temp-del'
    }));
    assert.strictEqual(delRes.status, 200);
    const delPlan = (await delRes.json()).data.plan;
    assert.strictEqual(delPlan.hazards.length, 1);
    console.log('  ✓ 6. Hazard update recalculates riskScore (20) and delete_hazard removes hazard');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 7: CCP Creation, Validation Status, and Limit Bounds
  // -------------------------------------------------------------------------
  {
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };

    // Create CCP with pending validation status
    const ccpRes = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'save_ccp',
      id: 'ccp-cook-001',
      hazardId: 'haz-cook-001',
      processStep: 'Cooking',
      criticalLimit: 'Core temperature must reach 75°C',
      unit: '°C',
      criticalLimitMin: 75.0,
      validationStatus: 'pending',
      monitoringMethod: 'Digital probe thermometer inserted into thermal centre',
      monitoringFrequency: 'Each batch / joint cooked',
      responsibleRole: 'food_safety_supervisor',
      correctiveAction: 'Continue cooking until core temp >= 75°C',
      verificationMethod: 'Review cooking log daily and calibrate probe monthly'
    }));
    assert.strictEqual(ccpRes.status, 200);
    const plan = (await ccpRes.json()).data.plan;
    assert.strictEqual(plan.ccps.length, 1);
    const ccp = plan.ccps[0];
    assert.strictEqual(ccp.id, 'ccp-cook-001');
    assert.strictEqual(ccp.validationStatus, 'pending');
    assert.strictEqual(ccp.criticalLimitMin, 75.0);

    // Try to activate plan while CCP is still pending validation -> MUST FAIL (400)
    const activateFail = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'activate'
    }));
    assert.strictEqual(activateFail.status, 400);
    const actFailJson = await activateFail.json();
    assert.strictEqual(actFailJson.error.code, 'VALIDATION_ERROR');
    assert(actFailJson.error.message.includes('Validate all CCP critical limits'));

    // Validate the CCP
    const validateRes = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'save_ccp',
      id: 'ccp-cook-001',
      patch: {
        validationStatus: 'validated'
      }
    }));
    assert.strictEqual(validateRes.status, 200);
    const validatedPlan = (await validateRes.json()).data.plan;
    assert.strictEqual(validatedPlan.ccps[0].validationStatus, 'validated');
    console.log('  ✓ 7. CCP persists with critical limits and blocks activation when validationStatus is pending');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 8: Plan Activation Preconditions and Execution
  // -------------------------------------------------------------------------
  {
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };

    // Activate the plan now that hazard exists and CCP is validated
    const activateRes = await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'activate'
    }));
    assert.strictEqual(activateRes.status, 200);
    const activePlan = (await activateRes.json()).data.plan;
    assert.strictEqual(activePlan.status, 'active');
    assert.strictEqual(activePlan.approvedBy, 'usr-fss-1');
    console.log('  ✓ 8. Plan activation transitions status to active and records approvedBy / approvedAt');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 9: Plan Retrieval by ID and Cross-Tenant Protection
  // -------------------------------------------------------------------------
  {
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };
    const competitorSession = { userId: 'usr-comp-1', organisationId: 'org-competitor', outletId: 'outlet-competitor', role: 'food_safety_supervisor' };

    // GET /api/v1/haccp?plan_id=plan-bandra-001
    const getRes = await getHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp?plan_id=plan-bandra-001', 'GET', supervisorSession));
    assert.strictEqual(getRes.status, 200);
    const plan = (await getRes.json()).data.plan;
    assert.strictEqual(plan.id, 'plan-bandra-001');
    assert.strictEqual(plan.hazards.length, 1);
    assert.strictEqual(plan.ccps.length, 1);

    // Cross-tenant access rejected (403)
    const crossRes = await getHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp?plan_id=plan-bandra-001', 'GET', competitorSession));
    assert.strictEqual(crossRes.status, 403);

    // GET /api/v1/haccp/[plan_id] route directly
    const routeRes = await getHaccpPlanByIdHandler(makeAuthReq('http://localhost:3000/api/v1/haccp/plan-bandra-001', 'GET', supervisorSession), {
      params: { plan_id: 'plan-bandra-001' }
    });
    assert.strictEqual(routeRes.status, 200);

    // Non-existent plan returns 404
    const notFoundRes = await getHaccpPlanByIdHandler(makeAuthReq('http://localhost:3000/api/v1/haccp/non-existent-plan', 'GET', supervisorSession), {
      params: { plan_id: 'non-existent-plan' }
    });
    assert.strictEqual(notFoundRes.status, 404);
    console.log('  ✓ 9. Plan retrieval joins hazards/CCPs, enforces tenant isolation (403), and returns 404 for missing plans');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 10: Relational Integrity with HACCP Monitoring Persistence
  // -------------------------------------------------------------------------
  {
    const supervisorSession = { userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor' };

    // Recording monitoring value (80°C >= 75°C) for validated CCP
    const monRes = await postHaccpMonitoringHandler(makeAuthReq('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, {
      ccpId: 'ccp-cook-001',
      observedValue: 82.5,
      unit: '°C'
    }));
    assert.strictEqual(monRes.status, 201);
    const monJson = await monRes.json();
    assert.strictEqual(monJson.data.withinLimit, true);
    assert.strictEqual(monJson.data.record.observedValue, 82.5);

    // Add unvalidated CCP to verify monitoring rejects it
    await patchHaccpHandler(makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', supervisorSession, {
      planId: 'plan-bandra-001',
      action: 'save_ccp',
      id: 'ccp-unvalidated-002',
      hazardId: 'haz-cook-001',
      processStep: 'Cooling',
      criticalLimit: 'Cool to 5°C',
      validationStatus: 'pending'
    }));

    const monReject = await postHaccpMonitoringHandler(makeAuthReq('http://localhost:3000/api/v1/haccp/monitoring', 'POST', supervisorSession, {
      ccpId: 'ccp-unvalidated-002',
      observedValue: 12.0
    }));
    assert.strictEqual(monReject.status, 409);
    const monRejectJson = await monReject.json();
    assert.strictEqual(monRejectJson.error.code, 'INVALID_STATE');
    console.log('  ✓ 10. Relational integrity with monitoring: validated CCP accepts logs, unvalidated CCP returns 409');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 11: Unclaimed Directory Persistence & Status Lifecycle
  // -------------------------------------------------------------------------
  {
    const entry = await getRestaurantEntryAsync('leopold-cafe-colaba');
    assert(entry !== null);
    assert.strictEqual(entry.id, 'leopold-cafe-colaba');
    assert.strictEqual(entry.status, 'UNCLAIMED');

    // Update status to INVITED
    const updated = await updateRestaurantStatusAsync('leopold-cafe-colaba', 'INVITED');
    assert.strictEqual(updated.status, 'INVITED');

    const retrieved = await getRestaurantEntryAsync('leopold-cafe-colaba');
    assert.strictEqual(retrieved?.status, 'INVITED');
    console.log('  ✓ 11. Unclaimed directory persistence reads and transitions status (UNCLAIMED -> INVITED)');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 12: Customer Feedback on Unclaimed Store & DB Outbox Persistence
  // -------------------------------------------------------------------------
  {
    const rating: any = {
      id: 'fb-leopold-001',
      outletId: 'leopold-cafe-colaba',
      outletName: 'Leopold Cafe & Bar',
      overallScore: 4.5,
      feedback: 'Great heritage ambiance, food fresh and hot',
      responseRequested: true,
      customerEmail: 'diner@example.com'
    };

    const result = await processCustomerFeedbackForUnclaimedRestaurantAsync(rating, { baseUrl: 'http://localhost:3000' });
    assert(result.generated === true);
    assert(result.notification !== undefined);
    assert.strictEqual(result.notification.recipientEmail, 'management@leopoldcafe.example.com');
    assert(result.notification.claimToken.length >= 32);

    // Check that notification is persisted in PostgreSQL mockDb
    const outboxRows = await getOutboxNotificationsAsync('leopold-cafe-colaba');
    assert.strictEqual(outboxRows.length, 1);
    assert.strictEqual(outboxRows[0].feedbackId, 'fb-leopold-001');
    console.log('  ✓ 12. Diner feedback triggers token generation and persists notification to outbox');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 13: Outbox Notification Redaction & Administrative API
  // -------------------------------------------------------------------------
  {
    const adminSession = { userId: 'usr-admin-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'platform_admin' };
    const managerSession = { userId: 'usr-mgr-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'outlet_manager' };

    // Regular manager cannot access outbox (403)
    const deniedReq = new NextRequest('http://localhost:3000/api/v1/notifications/outbox');
    const deniedRes = await getOutboxHandler(makeAuthReq('http://localhost:3000/api/v1/notifications/outbox', 'GET', managerSession) as any);
    assert.strictEqual(deniedRes.status, 403);

    // Platform admin accesses outbox -> tokens must be redacted
    const adminRes = await getOutboxHandler(makeAuthReq('http://localhost:3000/api/v1/notifications/outbox', 'GET', adminSession) as any);
    assert.strictEqual(adminRes.status, 200);
    const adminJson = await adminRes.json();
    assert.strictEqual(adminJson.data.count, 1);
    const notif = adminJson.data.notifications[0];
    assert.strictEqual(notif.claimToken, '***REDACTED***');
    assert(notif.claimUrl.includes('token=***REDACTED***'));
    assert(!notif.body.includes(mockDb.tables.get('claim_tokens')![0].token));
    assert.strictEqual(notif.customerContactShared, 'di***@example.com');

    // Clear outbox action
    const clearRes = await getOutboxHandler(makeAuthReq('http://localhost:3000/api/v1/notifications/outbox?clear=true', 'GET', adminSession) as any);
    assert.strictEqual(clearRes.status, 200);
    const clearedList = await getOutboxNotificationsAsync('leopold-cafe-colaba');
    assert.strictEqual(clearedList.length, 0);
    console.log('  ✓ 13. Outbox API restricts to admin (403), redacts tokens/PII, and clears records');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 14: Cryptographic Claim Token Security & Single-Use Enforcement
  // -------------------------------------------------------------------------
  {
    const tokenRecord = await generateClaimTokenAsync('leopold-cafe-colaba');
    assert(tokenRecord.token.length >= 48);

    // Verification for correct restaurant succeeds
    const verifyValid = await verifyClaimTokenAsync(tokenRecord.token, 'leopold-cafe-colaba');
    assert.strictEqual(verifyValid.valid, true);

    // Verification for wrong restaurant fails
    const verifyWrong = await verifyClaimTokenAsync(tokenRecord.token, 'freshmart-supermarket-bandra');
    assert.strictEqual(verifyWrong.valid, false);
    assert.strictEqual(verifyWrong.reason, 'TOKEN_RESTAURANT_MISMATCH');

    // Mark token as used
    const marked = await markClaimTokenUsedAsync(tokenRecord.token, 'manager@leopoldcafe.example.com');
    assert.strictEqual(marked, true);

    // Re-verify token -> already used (fails)
    const verifyUsed = await verifyClaimTokenAsync(tokenRecord.token, 'leopold-cafe-colaba');
    assert.strictEqual(verifyUsed.valid, false);
    assert.strictEqual(verifyUsed.reason, 'TOKEN_ALREADY_USED');

    // Cannot mark used a second time
    const reMark = await markClaimTokenUsedAsync(tokenRecord.token, 'manager@leopoldcafe.example.com');
    assert.strictEqual(reMark, false);
    console.log('  ✓ 14. Claim token enforces cryptographic validation, mismatch rejection, and single-use guarantee');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 15: Store Claim Route Execution & Duplicate Claim Guard
  // -------------------------------------------------------------------------
  {
    resetMockRateLimits();
    const freshToken = await generateClaimTokenAsync('leopold-cafe-colaba');

    const claimReq = new NextRequest('http://localhost:3000/api/v1/restaurants/leopold-cafe-colaba/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: freshToken.token,
        managerName: 'Farooq Manager',
        managerEmail: 'farooq@leopoldcafe.example.com'
      })
    });

    const claimRes = await claimRestaurantHandler(claimReq, { params: { restaurant_id: 'leopold-cafe-colaba' } });
    assert.strictEqual(claimRes.status, 200);
    const claimJson = await claimRes.json();
    assert.strictEqual(claimJson.data.restaurant.status, 'CLAIMED');

    // Cookie session issued
    const setCookie = claimRes.headers.get('set-cookie');
    assert(setCookie !== null);
    const sessionToken = extractCookieToken(setCookie);
    assert(sessionToken !== null);
    const verifiedSession = verifySessionToken(sessionToken);
    assert.strictEqual(verifiedSession.valid, true);
    if (verifiedSession.valid && verifiedSession.data) {
      assert.strictEqual(verifiedSession.data.outletId, 'leopold-cafe-colaba');
      assert.strictEqual(verifiedSession.data.role, 'outlet_manager');
    }

    // Duplicate claim attempt on already claimed store must return 409 INVALID_STATE
    const dupToken = await generateClaimTokenAsync('leopold-cafe-colaba');
    const dupReq = new NextRequest('http://localhost:3000/api/v1/restaurants/leopold-cafe-colaba/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: dupToken.token,
        managerName: 'Imposter Manager',
        managerEmail: 'imposter@example.com'
      })
    });
    const dupRes = await claimRestaurantHandler(dupReq, { params: { restaurant_id: 'leopold-cafe-colaba' } });
    assert.strictEqual(dupRes.status, 409);
    const dupJson = await dupRes.json();
    assert.strictEqual(dupJson.error.code, 'INVALID_STATE');
    console.log('  ✓ 15. Store claim succeeds, issues signed manager session, and rejects duplicate claim with 409');
    passed++;
  }

  // -------------------------------------------------------------------------
  // TEST 16: Production Fail-Closed Safety without DATABASE_URL
  // -------------------------------------------------------------------------
  {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.SESSION_SECRET;
    (process.env as any).NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'c8f1e2d3b4a567890abcdef1234567890abcdef1234567890abcdef123456789';
    delete process.env.DATABASE_URL;

    // Claim endpoint fails closed with 500
    const claimReq = new NextRequest('http://localhost:3000/api/v1/restaurants/leopold-cafe-colaba/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'dummy-token-12345678', managerName: 'Test' })
    });
    const claimRes = await claimRestaurantHandler(claimReq, { params: { restaurant_id: 'leopold-cafe-colaba' } });
    assert.strictEqual(claimRes.status, 500);
    assert.strictEqual((await claimRes.json()).error.code, 'CONFIGURATION_ERROR');

    // Restaurant details endpoint fails closed with 500
    const restReq = new NextRequest('http://localhost:3000/api/v1/restaurants/leopold-cafe-colaba');
    const restRes = await getRestaurantHandler(restReq, { params: { restaurant_id: 'leopold-cafe-colaba' } });
    assert.strictEqual(restRes.status, 500);
    assert.strictEqual((await restRes.json()).error.code, 'CONFIGURATION_ERROR');

    // Outbox endpoint fails closed with 500
    const outboxReq = makeAuthReq('http://localhost:3000/api/v1/notifications/outbox', 'GET', {
      userId: 'usr-admin-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'platform_admin'
    });
    const outboxRes = await getOutboxHandler(outboxReq as any);
    assert.strictEqual(outboxRes.status, 500);
    assert.strictEqual((await outboxRes.json()).error.code, 'CONFIGURATION_ERROR');

    // HACCP GET endpoint fails closed with 500
    const haccpReq = makeAuthReq('http://localhost:3000/api/v1/haccp', 'GET', {
      userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor'
    });
    const haccpRes = await getHaccpHandler(haccpReq);
    assert.strictEqual(haccpRes.status, 500);
    assert.strictEqual((await haccpRes.json()).error.code, 'CONFIGURATION_ERROR');

    // HACCP PATCH endpoint fails closed with 500
    const haccpPatch = makeAuthReq('http://localhost:3000/api/v1/haccp', 'PATCH', {
      userId: 'usr-fss-1', organisationId: 'org-bandra', outletId: 'outlet-bandra', role: 'food_safety_supervisor'
    }, { action: 'activate' });
    const patchRes = await patchHaccpHandler(haccpPatch);
    assert.strictEqual(patchRes.status, 500);
    assert.strictEqual((await patchRes.json()).error.code, 'CONFIGURATION_ERROR');

    (process.env as any).NODE_ENV = originalEnv;
    if (originalSecret !== undefined) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
    console.log('  ✓ 16. Production fail-closed safety returns 500 CONFIGURATION_ERROR across all endpoints');
    passed++;
  }

  resetPool();
  delete process.env.DATABASE_URL;

  console.log(`\nStage 5D Results: ${passed}/16 passed.\n`);
  assert.strictEqual(passed, 16, 'All 16 Stage 5D tests must pass');
}

runStage5DTests().catch(err => {
  console.error('\n❌ Stage 5D Suite Failed:', err);
  process.exit(1);
});
