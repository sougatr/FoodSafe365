export type DemoAction = {
  id:string; title:string; description:string; severity:string; priority:string; assignedTo?:string;
  dueDate?:string; status:string; rootCause?:string|null; immediateAction?:string|null;
  correctiveAction?:string|null; preventiveAction?:string|null; createdAt:string; closedAt?:string|null;
  sourceType?:string; sourceId?:string; observationId?:string;
};

const store = new Map<string, DemoAction>();

function seed(userId:string) {
  if (store.size > 0) return;
  const today = new Date().toISOString().slice(0,10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  const seedActions: DemoAction[] = [
    {
      id:'demo-action-refrigeration',
      title:'Corrective action: Refrigeration control',
      description:'Review Refrigerator 2 after repeated temperature deviations. Protect affected food as appropriate, record the correction and submit it for independent verification.',
      severity:'high', priority:'high', assignedTo:userId, dueDate:today, status:'open',
      rootCause:null, immediateAction:null, correctiveAction:null, preventiveAction:null,
      createdAt:new Date().toISOString(), closedAt:null, sourceType:'check_response', sourceId:'demo-response-refrigeration', observationId:'demo-observation-refrigeration'
    },
    {
      id:'demo-action-drain',
      title:'Cold-room drain cleaning',
      description:'Complete the overdue cold-room drain cleaning and record the corrective action for verification.',
      severity:'medium', priority:'medium', assignedTo:userId, dueDate:yesterday, status:'overdue',
      rootCause:null, immediateAction:null, correctiveAction:null, preventiveAction:null,
      createdAt:new Date().toISOString(), closedAt:null, sourceType:'manual', sourceId:'demo-drain', observationId:'demo-observation-drain'
    },
    {
      id:'demo-action-opening-hygiene',
      title:'Opening hygiene checks',
      description:'Review two missed opening-shift hygiene checks and confirm that the opening checklist is understood and assigned.',
      severity:'medium', priority:'medium', assignedTo:userId, dueDate:today, status:'open',
      rootCause:null, immediateAction:null, correctiveAction:null, preventiveAction:null,
      createdAt:new Date().toISOString(), closedAt:null, sourceType:'manual', sourceId:'demo-opening-hygiene', observationId:'demo-observation-hygiene'
    }
  ];
  seedActions.forEach(a=>store.set(a.id,a));
}

export function getDemoAction(id:string,userId:string): DemoAction | null {
  seed(userId);
  return store.get(id) || null;
}

export function createDemoAction(input: Partial<DemoAction>, userId:string): DemoAction {
  seed(userId);
  const id = input.id || `demo-action-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const now = new Date().toISOString();
  const action: DemoAction = {
    id,
    title: input.title || 'Corrective action',
    description: input.description || 'Correct the condition and record the corrective action.',
    severity: input.severity || 'high',
    priority: input.priority || 'high',
    assignedTo: input.assignedTo || userId,
    dueDate: input.dueDate || now.slice(0,10),
    status: input.status || 'open',
    rootCause: input.rootCause ?? null,
    immediateAction: input.immediateAction ?? null,
    correctiveAction: input.correctiveAction ?? null,
    preventiveAction: input.preventiveAction ?? null,
    createdAt: input.createdAt || now,
    closedAt: input.closedAt ?? null,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    observationId: input.observationId
  };
  store.set(id, action);
  return action;
}

export function updateDemoAction(id:string, patch:Partial<DemoAction>, userId:string): DemoAction | null {
  seed(userId);
  const current = store.get(id);
  if (!current) return null;
  const next = {...current,...patch};
  if (next.status === 'closed' && !next.closedAt) next.closedAt = new Date().toISOString();
  if (next.status !== 'closed') next.closedAt = null;
  store.set(id,next);
  return next;
}

export function listDemoActions(userId:string): DemoAction[] {
  seed(userId);
  return Array.from(store.values());
}
