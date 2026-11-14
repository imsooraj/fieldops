
import { useQuery } from '@tanstack/react-query'

import { getWorkOrders } from '../api/work-orders-api'
import type { WorkOrderFilters } from '../types/work-order'

export function useWorkOrders(filters: WorkOrderFilters) {
  return useQuery({
    queryKey: ['work-orders', filters],

    queryFn: () => getWorkOrders(filters),

    placeholderData: (previousData) => previousData,
  })
}
