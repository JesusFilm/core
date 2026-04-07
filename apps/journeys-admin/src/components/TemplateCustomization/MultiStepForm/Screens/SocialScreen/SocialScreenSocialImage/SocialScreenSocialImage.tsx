import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import { useTranslation } from 'next-i18next'
import fetch from 'node-fetch'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { useCloudflareUploadByFileMutation } from '../../../../../../libs/useCloudflareUploadByFileMutation'
import { useJourneyImageBlockAssociationUpdateMutation } from '../../../../../../libs/useJourneyImageBlockAssociationUpdateMutation'
import { useJourneyImageBlockCreateMutation } from '../../../../../../libs/useJourneyImageBlockCreateMutation'
import { useJourneyImageBlockUpdateMutation } from '../../../../../../libs/useJourneyImageBlockUpdateMutation'

interface SocialScreenSocialImage {
  hasCreatorDescription?: boolean
}

const MEDIA_MOBILE_WIDTH = 215
const MEDIA_MOBILE_HEIGHT = 147
const MEDIA_DESKTOP_WIDTH = 215
const MEDIA_DESKTOP_HEIGHT = 147
const CARD_SPACING = 12

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
    <Card
      variant="outlined"
      elevation={0}
      sx={{
        borderRadius: 3,
        borderColor: 'divider',
        p: `${CARD_SPACING}px`,
        width: {
          xs: `calc(${MEDIA_MOBILE_WIDTH}px + calc(${CARD_SPACING}px*2))`,
          sm: `calc(${MEDIA_DESKTOP_WIDTH}px + calc(${CARD_SPACING}px*2))`
        }
      }}
    >
      <CardMedia
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            journey != null ? 'background.default' : 'transparent',
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
          width: {
            xs: `${MEDIA_MOBILE_WIDTH}px`,
            sm: `${MEDIA_DESKTOP_WIDTH}px`
          },
          height: {
            xs: `${MEDIA_MOBILE_HEIGHT}px`,
            sm: `${MEDIA_DESKTOP_HEIGHT}px`
          }
        }}
        data-testid="SocialScreenSocialImage"
      >
        {journey != null && !loading && (
          <>
            {journey?.primaryImageBlock?.src != null && (
              <NextImage
                src={journey.primaryImageBlock.src}
                alt={journey?.primaryImageBlock.alt}
                placeholder="blur"
                blurDataURL={journey?.primaryImageBlock.blurhash}
                layout="fill"
                objectFit="cover"
                priority
              />
            )}
            {journey?.primaryImageBlock?.src == null && !loading && (
              <GridEmptyIcon fontSize="large" />
            )}
            <IconButton
              component="label"
              aria-label="Edit social image"
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
                onChange={(event) => handleImageChange(event.target.files?.[0])}
                data-testid="SocialScreenSocialImageInput"
                type="file"
                accept="image/*"
              />
            </IconButton>
          </>
        )}
        {loading && (
          <>
            <Skeleton
              data-testid="SocialScreenSocialImageSkeleton"
              variant="rectangular"
              sx={{
                width: '100%',
                height: '100%'
              }}
            />
            {loading && (
              <CircularProgress
                data-testid="SocialScreenSocialImageCircularProgress"
                size={30}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  margin: 'auto'
                }}
              />
            )}
          </>
        )}
      </CardMedia>

      <CardContent sx={{ px: 0, pb: 1, pt: `${CARD_SPACING}px` }}>
        <Typography
          variant="body2"
          color="secondary"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {journey?.seoTitle ?? ''}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {journey?.seoDescription ?? ''}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {t('your.nextstep.is')}
        </Typography>
      </CardContent>

    </Card>
  )
}
