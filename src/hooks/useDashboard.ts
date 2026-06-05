import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats } from '../services/dashboard.service'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
  })
}
