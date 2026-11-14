
import type { WorkOrderDTO } from '../types/work-order'

type WorkOrdersTableProps = {
  workOrders: WorkOrderDTO[]
}

function WorkOrdersTable({
  workOrders,
}: WorkOrdersTableProps) {
  if (workOrders.length === 0) {
    return (
      <div>
        <h3>No work orders found</h3>
        <p>Try changing your search or filters.</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            <th align="left">Work Order ID</th>
            <th align="left">Title</th>
            <th align="left">Status</th>
            <th align="left">Priority</th>
          </tr>
        </thead>

        <tbody>
          {workOrders.map((workOrder) => (
            <tr key={workOrder.id}>
              <td>{workOrder.id}</td>

              <td>{workOrder.title}</td>

              <td>
                {workOrder.status.replaceAll('_', ' ')}
              </td>

              <td>{workOrder.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WorkOrdersTable
