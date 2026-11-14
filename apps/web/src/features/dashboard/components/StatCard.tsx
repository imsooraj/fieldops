import Card from '../../../components/ui/Card'
import './StatCard.css'

type StatCardProps = {
  title: string
  value: number
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <div className="stat-card">
        <p className="stat-title">{title}</p>

        <h2 className="stat-value">{value}</h2>

        <p className="stat-description">{description}</p>
      </div>
    </Card>
  )
}

export default StatCard