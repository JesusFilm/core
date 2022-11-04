import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

interface ReportButtonProps {
  pageName: string
}

export function ReportButtons({ pageName }: ReportButtonProps): ReactElement {
  const router = useRouter()
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'background.paper'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 6, sm: 8 } }}>
        {
          pageName === "reports" ?
            <Stack direction="row" spacing={4} sx={{ py: 2 }}>
              <Button onClick={
                async () => await router.push(`/journeys-admin/visitors`, undefined, {
                  shallow: true
                })}
              > Visitors </Button>
              <Button onClick={
                async () => await router.push(`/journeys-admin/reports`, undefined, {
                  shallow: true
                })}> Reports </Button>              
            </Stack>
          :
            <Stack direction="row" spacing={4} sx={{ py: 2 }}>
              <Button onClick={
                async () => await router.push(`/journeys-admin/visitors`, undefined, {
                  shallow: true
                })}
              > Visitors </Button>
              <Button onClick={
                async () => await router.push(`/journeys-admin/reports`, undefined, {
                  shallow: true
                })}> Reports </Button> 
            </Stack>
        }  
        <div/>
      </Container>
    </Box>
  )
}
