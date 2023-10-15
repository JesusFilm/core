import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface TagItemProps {
  name: string
  icon: ReactNode
  showDivider?: boolean
}

export function TagItem({
  name,
  icon,
  showDivider
}: TagItemProps): ReactElement {
  return (
    <Stack direction="row" alignItems="center" sx={{ width: 'max-content' }}>
      <Stack gap={2} alignItems="center" sx={{ minWidth: '77px' }}>
        {icon}
        <Typography variant="body2" align="center" sx={{ px: 2 }}>
          {name}
        </Typography>
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
