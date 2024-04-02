import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'

interface ResourcesTableHeaderProps {
  onTableView: () => void
}

export const ResourcesTableHeader: FC<ResourcesTableHeaderProps> = ({
  onTableView
}) => {
  const { t } = useTranslation()

  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">{t('Resources')}</Typography>
      <Typography variant="subtitle3">
        {t('Additional description if required')}
      </Typography>
      <Stack alignItems="flex-end">
        <Button
          startIcon={<VisibilityOutlinedIcon />}
          color="secondary"
          onClick={onTableView}
        >
          {t('Table View')}
        </Button>
      </Stack>
    </Stack>
  )
}
