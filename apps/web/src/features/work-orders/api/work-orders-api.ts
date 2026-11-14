
import { apiRequest } from '../../../lib/api-client'

import type {
  CreateWorkOrderDTO,
  WorkOrderDTO,
  WorkOrderFilters,
  WorkOrdersResponse,
} from '../types/work-order'

export async function getWorkOrders(
  filters: WorkOrderFilters,
): Promise<WorkOrdersResponse> {
  try {
    const params = new URLSearchParams()

    params.set('page', String(filters.page))
    params.set('limit', String(filters.limit))

    if (filters.search.trim()) {
      params.set('search', filters.search.trim())
    }

    if (filters.status) {
      params.set('status', filters.status)
    }

    if (filters.priority) {
      params.set('priority', filters.priority)
    }

    return await apiRequest<WorkOrdersResponse>(
      `/api/v1/work-orders?${params.toString()}`,
    )
  } catch (error) {
    console.error('Failed to fetch work orders:', error)
    throw error
  }
}

export async function createWorkOrder(
  payload: CreateWorkOrderDTO,
): Promise<WorkOrderDTO> {
  try {
    return await apiRequest<WorkOrderDTO>(
      '/api/v1/work-orders',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  } catch (error) {
    console.error('Failed to create work order:', error)
    throw error
  }
}
