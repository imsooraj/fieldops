
import WorkOrderFileUpload from '../components/WorkOrderFileUpload'

function WorkOrderDetailsPage() {
  const workOrderId = 'wo_1001'

  return (
    <main>
      <h1>Work Order Details</h1>

      <p>Work Order ID: {workOrderId}</p>

      <WorkOrderFileUpload
        workOrderId={workOrderId}
      />
    </main>
  )
}

export default WorkOrderDetailsPage
