import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Button, Stack, Typography } from '@mui/material'
import { FC } from 'react'

interface TableHeaderProps {
  title: string
  subtitle: string
  hasTableView: string
  onTableView: () => void
}

export const TableHeader: FC<TableHeaderProps> = ({
  title,
  subtitle,
  hasTableView = false,
  onTableView
}) => {
  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">{title}</Typography>
      <Typography variant="subtitle3">{subtitle}</Typography>
      {hasTableView && (
        <Stack alignItems="flex-end">
          <Button
            startIcon={<VisibilityOutlinedIcon />}
            color="secondary"
            onClick={onTableView}
          >
            Table View
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
