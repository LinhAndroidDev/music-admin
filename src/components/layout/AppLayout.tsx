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
  '/advertisements': 'Quản lý banner',
}

function resolveTitle(pathname: string): string {
  if (pathname.startsWith('/singers/') && pathname !== '/singers') {
    return 'Chi tiết ca sĩ'
  }
  return pageTitles[pathname] ?? 'Music Admin'
}

export function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = resolveTitle(location.pathname)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100%' }}>
      {isMobile ? (
        <Sidebar
          variant="temporary"
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      ) : (
        <Sidebar
          variant="permanent"
          mobileOpen={false}
          onClose={() => {}}
        />
      )}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 1.5, md: 3 },
            bgcolor: 'background.default',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
