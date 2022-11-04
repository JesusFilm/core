import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

interface ReportButtonProps {
  pageName: string
}

export function ReportButtons({ pageName }: ReportButtonProps): ReactElement {
  const router = useRouter()
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        borderTop: 1, 
        borderBottom: 1
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 6, sm: 8 }, marginLeft: 0}}>
        {
          pageName === "journeys" ?
            <Stack direction="row" spacing={16} sx={{ py: 2 }}>
              <Button id="journeys" onClick={
                async () => await router.push(`/journeys-admin/journeys`, undefined, {
                    shallow: true
                  }
                )}
              >                
                <Typography color="red">
                  <strong>Journeys</strong>
                </Typography></Button> 
              <Button onClick={
                async () => await router.push(`/journeys-admin/visitors`, undefined, {
                  shallow: true
                })}>
                <Typography color="secondary.main">
                  <strong>Visitors</strong>
                </Typography></Button>             
            </Stack>
          :
            <Stack direction="row" spacing={16} sx={{ py: 2 }}>
              <Button onClick={
                async () => await router.push(`/journeys-admin/journeys`, undefined, {
                  shallow: true
                })}
              >                
                <Typography color="secondary.main">
                  <strong>Journeys</strong>
                </Typography></Button> 
              <Button onClick={
                async () => await router.push(`/journeys-admin/visitors`, undefined, {
                  shallow: true
                })}>
                <Typography color="red">
                  <strong>Visitors</strong>
                </Typography></Button> 
            </Stack>
        }
      </Container>
    </Box>
  )
}
