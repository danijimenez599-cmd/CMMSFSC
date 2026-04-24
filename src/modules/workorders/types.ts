export type WoType = 'preventive' | 'corrective' | 'predictive' | 'inspection';
export type WoStatus = 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type WoPriority = 'critical' | 'high' | 'medium' | 'low';

export interface WorkOrder {
  id: string;
  assetId: string;
  assetPlanId: string | null;
  woNumber: string;
  title: string;
  description: string | null;
  woType: WoType;
  status: WoStatus;
  priority: WoPriority;
  assignedTo: string | null;
  scheduledDate: string | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  failureCode: string | null;
  rootCause: string | null;
  resolution: string | null;
  generatedFromPlanId: string | null;
  pmPlanNameSnapshot: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WoTask {
  id: string;
  workOrderId: string;
  sortOrder: number;
  description: string;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
  notes: string | null;
}

export interface WoComment {
  id: string;
  workOrderId: string;
  authorId: string;
  body: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface PartUsage {
  id: string;
  workOrderId: string;
  inventoryItemId: string;
  quantity: number;
  unitCost: number | null;
  addedBy: string | null;
  addedAt: string;
}

export interface WoInput {
  assetId: string;
  title: string;
  description?: string | null;
  woType: WoType;
  priority: WoPriority;
  assignedTo?: string | null;
  scheduledDate?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
}

export interface StatusMeta {
  startedAt?: string;
  completedAt?: string;
}

export interface CompletePayload {
  actualHours: number | null;
  failureCode?: string | null;
  rootCause?: string | null;
  resolution: string;
}
