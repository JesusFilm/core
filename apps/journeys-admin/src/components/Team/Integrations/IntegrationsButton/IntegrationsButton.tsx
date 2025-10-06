import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image, { StaticImageData } from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Plus1Icon from '@core/shared/ui/icons/Plus1'

import { IntegrationType } from '../../../../../__generated__/globalTypes'
import growthSpacesLogo from '../../../../../public/growth-spaces-logo.png'

interface IntegrationContentProps {
  title: string
  src?: StaticImageData
}

interface IntegrationsButtonProps {
  url: string
  type?: IntegrationType
  showAddButton?: boolean
}

export function IntegrationsButton({
  url,
  type,
  showAddButton = false
}: IntegrationsButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const IntegrationContent = {
    [IntegrationType.growthSpaces]: {
      title: t('Growth Spaces'),
      src: growthSpacesLogo
    }
  }

  function getIntegrationContent(): IntegrationContentProps {
    const defaultContent = { title: '', src: undefined }
    if (type == null) return defaultContent
    return IntegrationContent[type]
  }

  const { title, src } = getIntegrationContent()

  return (
    <Stack
      component={NextLink}
      href={url}
      justifyContent="center"
      alignItems="center"
      sx={{
        p: 4,
        width: 150,
        height: 180,
        borderRadius: 2,
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: (theme) => theme.palette.grey[100]
        }
      }}
      data-testid={`${type != null ? type : 'Add'}-IntegrationsButton`}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 110,
          width: 110,
          border: (theme) => `1px solid ${theme.palette.grey[300]}`,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          mb: 3
        }}
      >
        {showAddButton ? (
          <Plus1Icon />
        ) : src != null ? (
          <Image src={src} alt={title ?? ''} height={65} width={65} />
        ) : (
          <InsertPhotoRoundedIcon />
        )}
      </Box>
      {title != null || showAddButton ? (
        <Typography
          variant="body1"
          sx={{
            width: '100%',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textAlign: 'center'
          }}
        >
          {showAddButton ? t('Add Integration') : title}
        </Typography>
      ) : (
        <Skeleton variant="text" width="80%" />
      )}
    </Stack>
  )
}
