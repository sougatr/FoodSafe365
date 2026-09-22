export type RoleCode='platform_admin'|'org_admin'|'outlet_manager'|'food_safety_supervisor'|'food_handler'|'auditor'|'vendor';
export type RiskLevel='low'|'moderate'|'high'|'critical';
export type ResponseType='yes_no'|'pass_fail'|'number'|'temperature'|'text'|'photo'|'date'|'select'|'multiselect'|'na';
export interface Rule{ id:string; rule_code:string; title:string; description:string; domain:string; risk_level:RiskLevel; frequency:string; version:number; effective_from:string; }
export interface CheckItem{ id:string; rule_id:string; question:string; response_type:ResponseType; sequence_no:number; required:boolean; evidence_required:boolean; }
export interface Check{ id:string; template_code:string; name:string; status:string; completion_percentage:number; }
export interface Dashboard{outlet:{id:string;name:string};status:{value:number|null;label:string};checks:{total:number;completed:number;pending:number};issues:{open:number;high_priority:number};documents:{expiring_soon:number};insight?:string;}
