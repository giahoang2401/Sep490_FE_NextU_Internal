"use client"

import type { DashboardCardProps } from "../types"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function DashboardCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  onClick,
}: DashboardCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600"
      case "decrease":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const CardContent = () => (
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{Icon && <Icon className="h-6 w-6 text-gray-400" />}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span className="ml-1">{change}</span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow w-full text-left"
      >
        <CardContent />
      </button>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent />
    </div>
  )
}
