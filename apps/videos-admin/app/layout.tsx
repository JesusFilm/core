import { ThemeProvider } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { ReactElement } from 'react'

import { serverJourneysAdminTheme } from '@core/shared/ui/themes/journeysAdmin/serverJourneysAdminTheme'

export const metadata = {
  title: 'Welcome to Videos Admin',
  description:
    'A platform for easy management of videos in core. Our hope is that this tool will greatly enable us to take the story of Jesus to every tribe and touchscreen'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}): ReactElement {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={serverJourneysAdminTheme}>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
