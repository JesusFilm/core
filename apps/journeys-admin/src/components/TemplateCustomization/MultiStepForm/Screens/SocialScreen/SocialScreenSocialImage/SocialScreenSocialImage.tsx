import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import type FormDataType from 'form-data'
import fetch from 'node-fetch'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import { useCloudflareUploadByFileMutation } from '../../../../../../libs/useCloudflareUploadByFileMutation'

import { useJourneyImageBlockUpdateMutation } from '../../../../../../libs/useJourneyImageBlockUpdateMutation'
import { useJourneyImageBlockCreateMutation } from '../../../../../../libs/useJourneyImageBlockCreateMutation'
import { useJourneyImageBlockAssociationUpdateMutation } from '../../../../../../libs/useJourneyImageBlockAssociationUpdateMutation'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'next-i18next'

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

export function SocialScreenSocialImage({
  hasCreatorDescription = false
}: SocialScreenSocialImage): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const [loading, setLoading] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()

  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()
  const [journeyImageBlockAssociationUpdate] =
    useJourneyImageBlockAssociationUpdateMutation()
  const [journeyImageBlockUpdate] = useJourneyImageBlockUpdateMutation()
  const [journeyImageBlockCreate] = useJourneyImageBlockCreateMutation()

  async function handleImageChange(
    file: File | null | undefined
  ): Promise<void> {
    if (journey == null || file == null) return
    setLoading(true)

    const { data } = await createCloudflareUploadByFile({})
    if (data?.createCloudflareUploadByFile?.uploadUrl != null) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await (
          await fetch(data?.createCloudflareUploadByFile?.uploadUrl, {
            method: 'POST',
            body: formData as unknown as FormDataType
          })
        ).json()
        const src = `https://imagedelivery.net/${
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
        }/${response.result.id as string}/public`

        if (journey?.primaryImageBlock != null) {
          await journeyImageBlockUpdate({
            variables: {
              id: journey.primaryImageBlock.id,
              journeyId: journey.id,
              input: { src, alt: 'journey image' }
            }
          })
        } else {
          const { data: imageData } = await journeyImageBlockCreate({
            variables: {
              input: { journeyId: journey.id, src, alt: 'journey image' }
            }
          })
          if (imageData?.imageBlockCreate != null) {
            await journeyImageBlockAssociationUpdate({
              variables: {
                id: journey.id,
                input: { primaryImageBlockId: imageData.imageBlockCreate.id }
              }
            })
          }
        }
      } catch (error) {
        enqueueSnackbar(
          t('Failed to update social image, please try again later'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
      } finally {
        setLoading(false)
        enqueueSnackbar(t('Social image updated'), {
          variant: 'success',
          preventDuplicate: true
        })
      }
    }
  }

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
              onChange={(event) =>
                handleImageChange(event.target.files?.item(0))
              }
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
