import Plus1Icon from '@core/shared/ui/icons/Plus1'
import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'

import NextLink from 'next/link'
import { ReactElement } from 'react'

interface IntegrationItemProps {
  teamId: string
  src?: string
  title?: string
  integrationId?: string
  showAddButton?: boolean
}

export function IntegrationsListItem({
  teamId,
  src,
  title,
  integrationId,
  showAddButton = false
}: IntegrationItemProps): ReactElement {
  const href = `/teams/${teamId}/integrations/${integrationId != null ? integrationId : 'new/growth-spaces'}`
  return (
    <NextLink href={href} passHref legacyBehavior>
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{
          p: 4,
          width: 150,
          height: 180,
          borderRadius: 2,
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: (theme) => theme.palette.grey[200]
          }
        }}
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
            <Image
              src={src}
              alt={title ?? ''}
              layout="fill"
              objectFit="cover"
            />
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
            {showAddButton ? 'Add Integration' : title}
          </Typography>
        ) : (
          <Skeleton variant="text" width="80%" />
        )}
      </Stack>
    </NextLink>
  )
}
