import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}
