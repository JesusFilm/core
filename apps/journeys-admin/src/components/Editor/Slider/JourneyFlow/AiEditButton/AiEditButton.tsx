import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { AiChat } from '../../../../AiChat/AiChat'
import { Item } from '../../../Toolbar/Items/Item'

interface AiEditButtonProps {
  disabled?: boolean
}

export function AiEditButton({ disabled }: AiEditButtonProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const { t } = useTranslation('apps-journeys-admin')

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <>
      <Box
        sx={{
          borderRadius: 4,
          background:
            'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
          p: 1
        }}
      >
        <Item
          variant="button"
          label={t('A.I Edit')}
          icon={<AutoAwesomeIcon />}
          onClick={handleClick}
          ButtonProps={{
            disabled,
            sx: {
              backgroundColor: 'background.paper',
              ':hover': {
                backgroundColor: 'background.paper'
              }
            }
          }}
        />
      </Box>
      <AiChat open={open} />
    </>
  )
}
