import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { CategoriesPage } from '../pages/CategoriesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AdvertisementsPage } from '../pages/AdvertisementsPage'
import { SingersPage } from '../pages/SingersPage'
import { SongsPage } from '../pages/SongsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'songs', element: <SongsPage /> },
      { path: 'singers', element: <SingersPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'advertisements', element: <AdvertisementsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
