import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/songs': 'Quản lý bài hát',
  '/singers': 'Quản lý ca sĩ',
  '/categories': 'Quản lý thể loại',
}

export function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Music Admin'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        variant="permanent"
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      {isMobile && (
        <Sidebar
          variant="temporary"
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      )}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <Box
          component="main"
          sx={{ flex: 1, p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
