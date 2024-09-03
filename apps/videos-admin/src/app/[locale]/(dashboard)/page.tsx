import Typography from '@mui/material/Typography'
import { PageContainer } from '@toolpad/core'
import { ReactElement } from 'react'

export default async function HomePage(): Promise<ReactElement> {
  return (
    <PageContainer>
      <Typography variant="h4" component="h1" sx={{ m: 2 }}>
        Welcome to JFP Media Management
      </Typography>
    </PageContainer>
  )
}
