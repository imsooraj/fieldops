import StatCard from '../components/StatCard'
import './DashboardPage.css'

const dashboardStats = [
  {
    id: 'total',
    title: 'Total Work Orders',
    value: 128,
    description: 'All registered jobs',
  },
  {
    id: 'open',
    title: 'Open Work Orders',
    value: 32,
    description: 'Awaiting action',
  },
  {
    id: 'progress',
    title: 'In Progress',
    value: 18,
    description: 'Currently being serviced',
  },
  {
    id: 'completed',
    title: 'Completed',
    value: 78,
    description: 'Successfully completed',
  },
]

function DashboardPage() {
  return (
    <div>
      <div className="dashboard-heading">
        <h1>Dashboard</h1>
        <p>Overview of your field operations.</p>
      </div>

      <div className="dashboard-stats">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>
    </div>
  )
}

export default DashboardPage