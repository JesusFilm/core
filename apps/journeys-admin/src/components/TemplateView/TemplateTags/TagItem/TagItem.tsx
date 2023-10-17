import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import TagIcon from '@core/shared/ui/icons/Tag'

interface TagItemProps {
  name?: string
  icon?: ReactNode
  showDivider?: boolean
  loading?: boolean
}

export function TagItem({
  name,
  icon,
  showDivider,
  loading
}: TagItemProps): ReactElement {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ width: 'max-content', height: '93px' }}
    >
      <Stack
        gap={2}
        alignItems="center"
        justifyContent="center"
        sx={{ minWidth: '77px', height: '93px' }}
      >
        {loading === true ? (
          <>
            <TagIcon />
            <Skeleton variant="text" width={90} />
          </>
        ) : (
          <>
            {icon}
            <Typography variant="body2" align="center" sx={{ px: 2 }}>
              {name}
            </Typography>
          </>
        )}
      </Stack>
      {showDivider === true && (
        <Divider
          orientation="vertical"
          sx={{ pl: { xs: '8px', sm: '37px' }, height: '48px' }}
        />
      )}
    </Stack>
  )
}
