-- FoodSafe365 ERD v1 PostgreSQL schema generated from approved ERD workbook
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE organisation_type AS ENUM ('single_outlet', 'chain', 'hotel', 'institutional', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE org_status AS ENUM ('active', 'inactive', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE outlet_status AS ENUM ('active', 'inactive', 'onboarding'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE role_code AS ENUM ('platform_admin', 'org_admin', 'outlet_manager', 'food_safety_supervisor', 'food_handler', 'auditor', 'vendor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'invited'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE equipment_status AS ENUM ('active', 'inactive', 'maintenance', 'retired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE rule_domain AS ENUM ('general', 'premises', 'water', 'equipment', 'receiving', 'storage', 'preparation', 'cooking', 'holding', 'cooling', 'reheating', 'cleaning', 'pest', 'waste', 'personal_hygiene', 'employee_health', 'training', 'documentation', 'verification', 'complaints', 'haccp'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE rule_frequency AS ENUM ('once', 'daily', 'weekly', 'monthly', 'periodic', 'event_driven'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE condition_type AS ENUM ('equipment_exists', 'process_exists', 'restaurant_type', 'outlet_attribute', 'rule_dependency'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE condition_operator AS ENUM ('eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'exists'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE response_type AS ENUM ('yes_no', 'pass_fail', 'number', 'temperature', 'text', 'photo', 'date', 'select', 'multiselect', 'na'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE check_status AS ENUM ('not_started', 'in_progress', 'completed', 'verified', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE response_status AS ENUM ('pass', 'fail', 'warning', 'na', 'not_done', 'not_verified'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE observation_status AS ENUM ('open', 'linked', 'resolved', 'dismissed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE evidence_entity AS ENUM ('check_response', 'observation', 'corrective_action', 'document', 'service', 'haccp_monitoring'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE action_source AS ENUM ('check_response', 'observation', 'haccp_monitoring', 'manual', 'system_event'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE action_priority AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE action_status AS ENUM ('open', 'in_progress', 'awaiting_verification', 'closed', 'overdue', 'escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE verification_result AS ENUM ('pass', 'fail', 'conditional'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_status AS ENUM ('valid', 'expiring', 'expired', 'pending_verification', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE haccp_status AS ENUM ('draft', 'active', 'superseded', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE hazard_type AS ENUM ('biological', 'chemical', 'physical', 'allergen'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE vendor_verification AS ENUM ('unverified', 'submitted', 'verified', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE service_category AS ENUM ('pest_control', 'waste_management', 'used_cooking_oil', 'cleaning', 'deep_cleaning', 'drain_grease_exhaust', 'cold_chain', 'refrigeration', 'equipment', 'training', 'haccp_consulting', 'water_testing', 'food_testing', 'calibration', 'occupational_health', 'fire_safety', 'supplies'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE vendor_service_status AS ENUM ('active', 'inactive'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE service_request_status AS ENUM ('open', 'quotes_received', 'vendor_selected', 'scheduled', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE quote_status AS ENUM ('submitted', 'accepted', 'rejected', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'disputed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('check_due', 'check_missed', 'temperature_deviation', 'action_due', 'action_overdue', 'document_expiring', 'training_due', 'calibration_due', 'water_test_due', 'service_update', 'system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'whatsapp', 'push', 'sms'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed', 'opted_out'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_source AS ENUM ('whatsapp', 'email', 'google', 'website', 'qr', 'referral', 'partner', 'training_provider', 'vendor', 'consultant', 'direct'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('new', 'registration_started', 'registered', 'onboarding_incomplete', 'onboarding_complete', 'first_check', 'active', 'pro', 'service_customer', 'lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE consent_status AS ENUM ('granted', 'withdrawn', 'not_granted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE activity_event AS ENUM ('login', 'check_started', 'check_completed', 'action_created', 'action_closed', 'document_uploaded', 'service_requested', 'report_viewed', 'training_completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text,
  mobile text,
  email text,
  status user_status,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS organisations (
  id uuid PRIMARY KEY,
  name text,
  organisation_type organisation_type,
  owner_user_id uuid,
  subscription_plan subscription_plan,
  status org_status,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS outlets (
  id uuid PRIMARY KEY,
  organisation_id uuid,
  name text,
  address text,
  city text,
  state text,
  pincode text,
  restaurant_type_id uuid,
  fssai_number text,
  operating_hours jsonb,
  status outlet_status,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY,
  code role_code UNIQUE,
  name text,
  description text
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY,
  user_id uuid,
  organisation_id uuid,
  outlet_id uuid NULL,
  role_id uuid,
  status membership_status,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurant_types (
  id uuid PRIMARY KEY,
  code text,
  name text,
  active boolean
);

CREATE TABLE IF NOT EXISTS food_processes (
  id uuid PRIMARY KEY,
  code text,
  name text,
  description text,
  active boolean
);

CREATE TABLE IF NOT EXISTS outlet_processes (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  process_id uuid,
  active boolean
);

CREATE TABLE IF NOT EXISTS equipment_types (
  id uuid PRIMARY KEY,
  code text,
  name text,
  category text,
  calibration_required boolean,
  active boolean
);

CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  equipment_type_id uuid,
  name text,
  manufacturer text,
  model text,
  serial_number text,
  location text,
  installation_date date,
  calibration_required boolean,
  last_calibration_date date,
  next_calibration_date date,
  status equipment_status
);

CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY,
  rule_code text,
  title text,
  description text,
  domain rule_domain,
  source_id uuid,
  source_clause text,
  source_version text,
  risk_level risk_level,
  frequency rule_frequency,
  active boolean,
  version integer,
  effective_from date,
  effective_to date NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  evaluation_config jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS rule_conditions (
  id uuid PRIMARY KEY,
  rule_id uuid,
  condition_type condition_type,
  field_name text,
  operator condition_operator,
  value jsonb
);

CREATE TABLE IF NOT EXISTS check_templates (
  id uuid PRIMARY KEY,
  code text,
  name text,
  description text,
  frequency rule_frequency,
  role_code role_code,
  active boolean,
  version integer
);

CREATE TABLE IF NOT EXISTS check_template_items (
  id uuid PRIMARY KEY,
  check_template_id uuid,
  rule_id uuid,
  question text,
  help_text text,
  response_type response_type,
  sequence_no integer,
  required boolean,
  evidence_required boolean,
  active boolean
);

CREATE TABLE IF NOT EXISTS check_instances (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  check_template_id uuid,
  assigned_to uuid,
  started_at timestamptz,
  completed_at timestamptz NULL,
  status check_status,
  completion_percentage numeric(5,2),
  risk_status risk_level,
  verified_by uuid NULL,
  verified_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS check_responses (
  id uuid PRIMARY KEY,
  check_instance_id uuid,
  check_template_item_id uuid,
  response_value jsonb,
  numeric_value numeric NULL,
  temperature_value numeric NULL,
  status response_status,
  observation text,
  responded_at timestamptz,
  responded_by uuid
);

CREATE TABLE IF NOT EXISTS observations (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  rule_id uuid,
  check_response_id uuid NULL,
  severity risk_level,
  description text,
  observed_at timestamptz,
  observed_by uuid,
  status observation_status
);

CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  entity_type evidence_entity,
  entity_id uuid,
  file_url text,
  file_type text,
  file_size bigint,
  hash text,
  captured_by uuid,
  captured_at timestamptz,
  description text
);

CREATE TABLE IF NOT EXISTS corrective_actions (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  source_type action_source,
  source_id uuid,
  title text,
  description text,
  severity risk_level,
  priority action_priority,
  assigned_to uuid,
  due_date date,
  status action_status,
  root_cause text,
  immediate_action text,
  corrective_action text,
  preventive_action text,
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS action_verifications (
  id uuid PRIMARY KEY,
  corrective_action_id uuid,
  verified_by uuid,
  verification_method text,
  result verification_result,
  notes text,
  verified_at timestamptz
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  document_type_id uuid,
  title text,
  file_url text,
  issue_date date,
  expiry_date date,
  uploaded_by uuid,
  verified boolean,
  verified_by uuid NULL,
  verified_at timestamptz NULL,
  reminder_date date NULL,
  status document_status
);

CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY,
  code text,
  name text,
  default_retention_days integer NULL,
  expiry_applicable boolean,
  active boolean
);

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY,
  source_name text,
  publisher text,
  source_url text,
  version text,
  publication_date date,
  effective_date date NULL,
  retrieved_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS haccp_plans (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  name text,
  version text,
  status haccp_status,
  approved_by uuid NULL,
  approved_at timestamptz NULL,
  effective_from date,
  review_date date
);

CREATE TABLE IF NOT EXISTS hazards (
  id uuid PRIMARY KEY,
  haccp_plan_id uuid,
  process_step text,
  hazard_type hazard_type,
  hazard_description text,
  likelihood integer,
  severity integer,
  risk_score numeric(8,2),
  control_measure text,
  significant boolean
);

CREATE TABLE IF NOT EXISTS ccps (
  id uuid PRIMARY KEY,
  haccp_plan_id uuid,
  hazard_id uuid,
  process_step text,
  justification text,
  critical_limit text,
  unit text,
  monitoring_method text,
  monitoring_frequency text,
  responsible_person_role role_code,
  corrective_action text,
  verification_method text
);

CREATE TABLE IF NOT EXISTS monitoring_records (
  id uuid PRIMARY KEY,
  ccp_id uuid,
  outlet_id uuid,
  recorded_by uuid,
  observed_value numeric NULL,
  unit text,
  within_limit boolean,
  observation_time timestamptz,
  action_required boolean,
  corrective_action_id uuid NULL
);

CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  user_id uuid,
  training_type text,
  provider text,
  certificate_no text,
  training_date date,
  expiry_date date NULL,
  document_id uuid NULL,
  status document_status
);

CREATE TABLE IF NOT EXISTS calibration_records (
  id uuid PRIMARY KEY,
  equipment_id uuid,
  performed_by text,
  certificate_no text,
  calibration_date date,
  next_due_date date,
  result text,
  document_id uuid NULL
);

CREATE TABLE IF NOT EXISTS test_reports (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  test_type text,
  laboratory text,
  report_no text,
  sample_date date,
  report_date date,
  result_summary text,
  pass boolean,
  expiry_date date NULL,
  document_id uuid NULL
);

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY,
  business_name text,
  contact_name text,
  mobile text,
  email text,
  address text,
  city text,
  state text,
  verification_status vendor_verification,
  status vendor_status,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_services (
  id uuid PRIMARY KEY,
  vendor_id uuid,
  service_category service_category,
  service_name text,
  description text,
  price_model text,
  coverage_area jsonb,
  credentials jsonb,
  status vendor_service_status
);

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY,
  outlet_id uuid,
  source_type action_source,
  source_id uuid,
  service_category service_category,
  problem_description text,
  priority action_priority,
  requested_at timestamptz,
  status service_request_status
);

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY,
  service_request_id uuid,
  vendor_id uuid,
  quoted_amount numeric(12,2),
  description text,
  valid_until date,
  status quote_status
);

CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY,
  service_request_id uuid,
  vendor_id uuid,
  scheduled_date timestamptz,
  status booking_status,
  completion_date timestamptz NULL,
  service_report text,
  certificate_document_id uuid NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY,
  user_id uuid,
  outlet_id uuid NULL,
  notification_type notification_type,
  title text,
  message text,
  channel notification_channel,
  status notification_status,
  sent_at timestamptz NULL,
  read_at timestamptz NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY,
  business_name text,
  contact_name text,
  mobile text,
  email text,
  source lead_source,
  campaign_id uuid NULL,
  city text,
  status lead_status,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY,
  name text,
  channel notification_channel,
  purpose text,
  status campaign_status,
  starts_at timestamptz,
  ends_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS communication_consents (
  id uuid PRIMARY KEY,
  user_id uuid,
  channel notification_channel,
  purpose text,
  consent_status consent_status,
  consented_at timestamptz NULL,
  withdrawn_at timestamptz NULL,
  source text
);

CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY,
  user_id uuid NULL,
  lead_id uuid NULL,
  campaign_id uuid NULL,
  channel notification_channel,
  purpose text,
  template_name text,
  status notification_status,
  sent_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS restaurant_activity (
  id uuid PRIMARY KEY,
  organisation_id uuid,
  outlet_id uuid NULL,
  user_id uuid NULL,
  event_type activity_event,
  entity_type text,
  entity_id uuid NULL,
  occurred_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY,
  organisation_id uuid NULL,
  user_id uuid NULL,
  entity_type text,
  entity_id uuid,
  action text,
  old_value jsonb NULL,
  new_value jsonb NULL,
  ip_address inet NULL,
  occurred_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_events (
  id uuid PRIMARY KEY,
  organisation_id uuid NULL,
  outlet_id uuid NULL,
  event_type text,
  entity_type text,
  entity_id uuid NULL,
  payload jsonb,
  processed boolean,
  occurred_at timestamptz DEFAULT now(),
  processed_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS rule_versions (
  id uuid PRIMARY KEY,
  rule_id uuid,
  version integer,
  change_summary text,
  changed_by uuid,
  changed_at timestamptz,
  previous_version_id uuid NULL
);

ALTER TABLE organisations ADD CONSTRAINT fk_organisations_owner_user_id FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE outlets ADD CONSTRAINT fk_outlets_organisation_id FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE;
ALTER TABLE memberships ADD CONSTRAINT fk_memberships_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE memberships ADD CONSTRAINT fk_memberships_organisation_id FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE;
ALTER TABLE memberships ADD CONSTRAINT fk_memberships_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE memberships ADD CONSTRAINT fk_memberships_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;
ALTER TABLE outlets ADD CONSTRAINT fk_outlets_restaurant_type_id FOREIGN KEY (restaurant_type_id) REFERENCES restaurant_types(id) ON DELETE RESTRICT;
ALTER TABLE outlet_processes ADD CONSTRAINT fk_outlet_processes_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE outlet_processes ADD CONSTRAINT fk_outlet_processes_process_id FOREIGN KEY (process_id) REFERENCES food_processes(id) ON DELETE RESTRICT;
ALTER TABLE equipment ADD CONSTRAINT fk_equipment_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE equipment ADD CONSTRAINT fk_equipment_equipment_type_id FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id) ON DELETE RESTRICT;
ALTER TABLE rules ADD CONSTRAINT fk_rules_source_id FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE RESTRICT;
ALTER TABLE rule_conditions ADD CONSTRAINT fk_rule_conditions_rule_id FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE;
ALTER TABLE check_template_items ADD CONSTRAINT fk_check_template_items_check_template_id FOREIGN KEY (check_template_id) REFERENCES check_templates(id) ON DELETE CASCADE;
ALTER TABLE check_template_items ADD CONSTRAINT fk_check_template_items_rule_id FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE RESTRICT;
ALTER TABLE check_instances ADD CONSTRAINT fk_check_instances_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE check_instances ADD CONSTRAINT fk_check_instances_check_template_id FOREIGN KEY (check_template_id) REFERENCES check_templates(id) ON DELETE RESTRICT;
ALTER TABLE check_instances ADD CONSTRAINT fk_check_instances_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE check_responses ADD CONSTRAINT fk_check_responses_check_instance_id FOREIGN KEY (check_instance_id) REFERENCES check_instances(id) ON DELETE CASCADE;
ALTER TABLE check_responses ADD CONSTRAINT fk_check_responses_check_template_item_id FOREIGN KEY (check_template_item_id) REFERENCES check_template_items(id) ON DELETE RESTRICT;
ALTER TABLE check_responses ADD CONSTRAINT fk_check_responses_responded_by FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE observations ADD CONSTRAINT fk_observations_rule_id FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE RESTRICT;
ALTER TABLE observations ADD CONSTRAINT fk_observations_check_response_id FOREIGN KEY (check_response_id) REFERENCES check_responses(id) ON DELETE SET NULL;
ALTER TABLE observations ADD CONSTRAINT fk_observations_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE corrective_actions ADD CONSTRAINT fk_corrective_actions_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE action_verifications ADD CONSTRAINT fk_action_verifications_corrective_action_id FOREIGN KEY (corrective_action_id) REFERENCES corrective_actions(id) ON DELETE CASCADE;
ALTER TABLE documents ADD CONSTRAINT fk_documents_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE documents ADD CONSTRAINT fk_documents_document_type_id FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT;
ALTER TABLE hazards ADD CONSTRAINT fk_hazards_haccp_plan_id FOREIGN KEY (haccp_plan_id) REFERENCES haccp_plans(id) ON DELETE CASCADE;
ALTER TABLE ccps ADD CONSTRAINT fk_ccps_hazard_id FOREIGN KEY (hazard_id) REFERENCES hazards(id) ON DELETE CASCADE;
ALTER TABLE ccps ADD CONSTRAINT fk_ccps_haccp_plan_id FOREIGN KEY (haccp_plan_id) REFERENCES haccp_plans(id) ON DELETE CASCADE;
ALTER TABLE monitoring_records ADD CONSTRAINT fk_monitoring_records_ccp_id FOREIGN KEY (ccp_id) REFERENCES ccps(id) ON DELETE CASCADE;
ALTER TABLE monitoring_records ADD CONSTRAINT fk_monitoring_records_corrective_action_id FOREIGN KEY (corrective_action_id) REFERENCES corrective_actions(id) ON DELETE SET NULL;
ALTER TABLE training_records ADD CONSTRAINT fk_training_records_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE training_records ADD CONSTRAINT fk_training_records_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE calibration_records ADD CONSTRAINT fk_calibration_records_equipment_id FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE vendor_services ADD CONSTRAINT fk_vendor_services_vendor_id FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;
ALTER TABLE service_requests ADD CONSTRAINT fk_service_requests_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_service_request_id FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_vendor_id FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;
ALTER TABLE service_bookings ADD CONSTRAINT fk_service_bookings_service_request_id FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE;
ALTER TABLE service_bookings ADD CONSTRAINT fk_service_bookings_vendor_id FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE communication_consents ADD CONSTRAINT fk_communication_consents_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE communications ADD CONSTRAINT fk_communications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE communications ADD CONSTRAINT fk_communications_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE communications ADD CONSTRAINT fk_communications_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE restaurant_activity ADD CONSTRAINT fk_restaurant_activity_organisation_id FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE;
ALTER TABLE restaurant_activity ADD CONSTRAINT fk_restaurant_activity_outlet_id FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_organisation_id FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE rule_versions ADD CONSTRAINT fk_rule_versions_rule_id FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_outlet_org_name ON outlets(organisation_id,name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_membership ON memberships(user_id,organisation_id,outlet_id,role_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_outlet_process ON outlet_processes(outlet_id,process_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_equipment_serial ON equipment(outlet_id,serial_number);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cti_sequence ON check_template_items(check_template_id,sequence_no);
CREATE UNIQUE INDEX IF NOT EXISTS uq_response_item ON check_responses(check_instance_id,check_template_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rule_version ON rule_versions(rule_id,version);
CREATE UNIQUE INDEX IF NOT EXISTS uq_check_response_item ON check_responses(check_instance_id, check_template_item_id);
CREATE INDEX IF NOT EXISTS idx_check_instances_outlet_date ON check_instances(outlet_id, started_at);
CREATE INDEX IF NOT EXISTS idx_observations_outlet_status ON observations(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_actions_outlet_status ON corrective_actions(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_system_events_processed ON system_events(processed, occurred_at);
