import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { createWorkOrder } from '../api/work-orders-api'

export function useCreateWorkOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorkOrder,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      })
    },
  })
}