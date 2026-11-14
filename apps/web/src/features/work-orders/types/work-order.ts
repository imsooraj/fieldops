
export type WorkOrderStatus =
  | 'DRAFT'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REWORK'
  | 'CANCELLED'

export type WorkOrderPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export type WorkOrderDTO = {
  id: string
  title: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
}

export type CreateWorkOrderDTO = {
  title: string
  description: string
  priority: WorkOrderPriority
}

export type WorkOrderFilters = {
  page: number
  limit: number
  search: string
  status: WorkOrderStatus | ''
  priority: WorkOrderPriority | ''
}

export type PaginationDTO = {
  page: number
  limit: number
  total: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: PaginationDTO
}

export type WorkOrdersResponse =
  PaginatedResponse<WorkOrderDTO>
