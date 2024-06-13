import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TemplateListItem } from '../TemplateListItem'

interface LoadingTemplateListProps {
  hideHelperText?: boolean
}

export function LoadingTemplateList({
  hideHelperText = false
}: LoadingTemplateListProps): ReactElement {
  return (
    <>
      <Box>
        {[0, 1, 2].map((index) => (
          <TemplateListItem key={`templateCard${index}`} />
        ))}
      </Box>
      {!hideHelperText && (
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
      )}
    </>
  )
}
