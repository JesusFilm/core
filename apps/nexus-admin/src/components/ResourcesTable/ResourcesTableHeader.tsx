import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Button, Stack, Typography } from '@mui/material'
import { FC } from 'react'

interface ResourcesTableHeaderProps {
  onTableView: () => void
}

export const ResourcesTableHeader: FC<ResourcesTableHeaderProps> = ({
  onTableView
}) => {
  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">Resources</Typography>
      <Typography variant="subtitle3">Additional description if required</Typography>
      <Stack alignItems="flex-end">
        <Button
            startIcon={<VisibilityOutlinedIcon />}
            color="secondary"
            onClick={onTableView}
          >
            Table View
        </Button>
      </Stack>
    </Stack>
  )
}
