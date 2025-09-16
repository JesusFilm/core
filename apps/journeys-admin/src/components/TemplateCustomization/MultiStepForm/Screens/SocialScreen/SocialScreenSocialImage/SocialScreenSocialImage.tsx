import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import { useCloudflareUploadByFileMutation } from '../../../../../../libs/useCloudflareUploadByFileMutation'
import { gql } from 'graphql-tag'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'

interface SocialScreenSocialImage {
  hasCreatorDescription?: boolean
}

const WIDE_ASPECT_RATIO = {
  width: { xs: 223, sm: 278 },
  height: { xs: 139, sm: 194 }
}

const StyledInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

export const JOURNEY_SOCIAL_IMAGE_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneySocialImageUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      primaryImageBlock {
        ...ImageFields
      }
    }
  }
`

export function SocialScreenSocialImage({
  hasCreatorDescription = false
}: SocialScreenSocialImage): ReactElement {
  const { journey } = useJourney()
  const [loading, setLoading] = useState(false)
  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()

  return (
    <Stack
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: journey != null ? 'background.default' : 'transparent',
        overflow: 'hidden',
        borderRadius: 3,
        borderBottomRightRadius: {
          xs: 12,
          sm: hasCreatorDescription ? 0 : 12
        },
        borderBottomLeftRadius: {
          xs: 12,
          sm: hasCreatorDescription ? 0 : 12
        },
        ...WIDE_ASPECT_RATIO
      }}
      data-testid="SocialScreenSocialImage"
    >
      {journey?.primaryImageBlock?.src != null ? (
        <>
          <NextImage
            src={journey.primaryImageBlock.src}
            alt={journey?.primaryImageBlock.alt}
            placeholder="blur"
            blurDataURL={journey?.primaryImageBlock.blurhash}
            layout="fill"
            objectFit="cover"
            priority
          />
          <IconButton
            component="label"
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              color: 'secondary.dark',
              backgroundColor: 'background.default',
              borderRadius: 999,
              '&:hover': {
                backgroundColor: 'divider'
              }
            }}
          >
            <Edit2Icon />
            <StyledInput
              onChange={(event) => console.log(event.target.files)}
              data-testid="SocialScreenSocialImageInput"
              type="file"
              accept="image/*"
            />
          </IconButton>
        </>
      ) : journey != null ? (
        <GridEmptyIcon fontSize="large" />
      ) : (
        <Skeleton
          data-testid="SocialScreenSocialImageSkeleton"
          variant="rectangular"
          sx={{
            width: '100%',
            height: '100%'
          }}
        />
      )}
    </Stack>
  )
}
