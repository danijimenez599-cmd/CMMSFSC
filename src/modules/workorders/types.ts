export interface Vendor {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  isActive: boolean;
  createdAt: string;
}

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
  pmCycleIndex: number | null;
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
  sourcePointId: string | null;
  vendorId: string | null;
  externalServiceCost: number | null;
  externalInvoiceRef: string | null;
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
  vendorId?: string | null;
  externalServiceCost?: number | null;
  externalInvoiceRef?: string | null;
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
  externalServiceCost?: number | null;
  externalInvoiceRef?: string | null;
  vendorId?: string | null;
}
