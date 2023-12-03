import MuiAvatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

function LoadingJourneyCard(): ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <CardActionArea>
        <CardContent
          sx={{
            px: 6,
            py: 4
          }}
        >
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            gutterBottom
            sx={{ color: 'secondary.main' }}
          >
            <Skeleton variant="text" width={400} />
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: 'secondary.main'
            }}
          >
            <Skeleton variant="text" width={120} />
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions
        sx={{
          px: 6,
          pb: 4
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={4}
          flexGrow={1}
          sx={{ width: '95%' }}
        >
          <AvatarGroup
            max={3}
            sx={{
              zIndex: 1,
              '& .MuiAvatar-root': {
                width: 31,
                height: 31,
                fontSize: 12,
                borderWidth: 2,
                borderColor: 'primary.contrastText'
              },
              '> .MuiAvatarGroup-avatar': {
                backgroundColor: 'primary.main'
              }
            }}
          >
            {[0, 1, 2].map((i) => (
              <MuiAvatar key={i}>
                <Skeleton
                  variant="circular"
                  height={31}
                  width={31}
                  animation={false}
                  sx={{ bgcolor: 'divider' }}
                />
              </MuiAvatar>
            ))}
          </AvatarGroup>
          <Skeleton variant="text" width={40} />
        </Stack>
      </CardActions>
    </Card>
  )
}

export function LoadingJourneyList(): ReactElement {
  return (
    <>
      <Box>
        {[0, 1, 2].map((index) => (
          <>
            <LoadingJourneyCard key={`journeyCard${index}`} />
          </>
        ))}
      </Box>
      <Stack alignItems="center">
        <Typography
          variant="caption"
          align="center"
          component="div"
          sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
        >
          <Skeleton variant="text" width={255} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width={220} sx={{ mx: 'auto' }} />
        </Typography>
      </Stack>
    </>
  )
}
