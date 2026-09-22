export type DemoMonitoringRecord = {
  id:string; ccpId:string; outletId:string; recordedBy:string; observedValue:number; unit:string;
  withinLimit:boolean; observationTime:string; actionRequired:boolean; correctiveActionId?:string|null;
};
const records:DemoMonitoringRecord[]=[];
export function listDemoMonitoring(ccpId?:string){ return ccpId ? records.filter(r=>r.ccpId===ccpId) : [...records]; }
export function addDemoMonitoring(input:Omit<DemoMonitoringRecord,'id'|'observationTime'>){
  const r={...input,id:`demo-monitor-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,observationTime:new Date().toISOString()};
  records.unshift(r); return r;
}
