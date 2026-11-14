
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  workOrderSchema,
  type WorkOrderFormValues,
} from '../schemas/work-order-schema'

import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder'

function WorkOrderForm() {
  const createWorkOrderMutation = useCreateWorkOrder()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  })

  const onSubmit = async (formData: WorkOrderFormValues) => {
    try {
      await createWorkOrderMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        priority: formData.priority.toUpperCase() as
          'LOW' | 'MEDIUM' | 'HIGH',
      })

      reset()
    } catch (error) {
      console.error('Failed to create work order:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Work Order Title</label>

        <input
          id="title"
          type="text"
          placeholder="Enter work order title"
          {...register('title')}
        />

        {errors.title && (
          <p>{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          placeholder="Enter description"
          {...register('description')}
        />

        {errors.description && (
          <p>{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="priority">Priority</label>

        <select id="priority" {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {errors.priority && (
          <p>{errors.priority.message}</p>
        )}
      </div>

      {createWorkOrderMutation.isError && (
        <p>Unable to create work order. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={createWorkOrderMutation.isPending}
      >
        {createWorkOrderMutation.isPending
          ? 'Creating...'
          : 'Create Work Order'}
      </button>
    </form>
  )
}

export default WorkOrderForm
