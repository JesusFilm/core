import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { VariantVideo } from '../VariantVideo'

import { Downloads } from './Downloads'
import { VideoEditionChip } from './VideoEditionChip'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
}

// This mutation is kept for potential future use
export const UPDATE_VARIANT_LANGUAGE = graphql(`
  mutation UpdateVariantLanguage($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      videoId
      slug
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

export const TRANSCODE_ASSET = graphql(`
  mutation TranscodeAsset($input: TranscodeVideoInput!) {
    transcodeAsset(input: $input)
  }
`)

export const GET_TRANSCODE_ASSET_PROGRESS = graphql(`
  mutation GetTranscodeAssetProgress($jobId: String!) {
    getTranscodeAssetProgress(jobId: $jobId)
  }
`)

export type UpdateVariantLanguageVariables = VariablesOf<
  typeof UPDATE_VARIANT_LANGUAGE
>
export type UpdateVariantLanguage = ResultOf<typeof UPDATE_VARIANT_LANGUAGE>

export function VariantDialog({
  variant,
  open,
  handleClose
}: VariantDialogProps): ReactElement | null {
  const params = useParams<{ videoId: string }>()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [transcodeJobId, setTranscodeJobId] = useState<string | null>(null)
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0)
  const [isTranscoding, setIsTranscoding] = useState<boolean>(false)
  const [transcodeError, setTranscodeError] = useState<string | null>(null)

  const languageName =
    variant.language.name.find(({ primary }) => !primary)?.value ??
    variant.language.name[0].value

  const nativeLanguageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

  const [transcodeAsset] = useMutation(TRANSCODE_ASSET)
  const [getTranscodeAssetProgress] = useMutation(GET_TRANSCODE_ASSET_PROGRESS)

  // Function to handle the transcode
  const handleTranscode = async (): Promise<void> => {
    if (!variant.asset?.id || !params?.videoId) return

    try {
      setIsTranscoding(true)
      setTranscodeError(null)

      // Generate a filename for the HQ version
      // Use uuid or timestamp if fileName is not available
      const timestamp = Date.now()
      const hqFilename = `hq-${variant.language.id}-${timestamp}.mp4`

      const { data } = await transcodeAsset({
        variables: {
          input: {
            r2AssetId: variant.asset.id,
            resolution: '720p',
            videoBitrate: '2500',
            outputFilename: hqFilename,
            outputPath: `/videos/${params.videoId}`
          }
        }
      })

      if (data?.transcodeAsset) {
        setTranscodeJobId(data.transcodeAsset)
      }
    } catch (error) {
      setTranscodeError(
        error instanceof Error ? error.message : 'Failed to start transcoding'
      )
      setIsTranscoding(false)
    }
  }

  // Poll for transcode progress
  useEffect(() => {
    if (!transcodeJobId) return

    const interval = setInterval(async () => {
      try {
        const { data } = await getTranscodeAssetProgress({
          variables: {
            jobId: transcodeJobId
          }
        })

        if (data?.getTranscodeAssetProgress != null) {
          setTranscodeProgress(data.getTranscodeAssetProgress)

          // If progress is 100%, stop polling
          if (data.getTranscodeAssetProgress === 100) {
            setIsTranscoding(false)
            clearInterval(interval)
          }
        }
      } catch (error) {
        setTranscodeError(
          error instanceof Error
            ? error.message
            : 'Failed to get transcoding progress'
        )
        setIsTranscoding(false)
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [transcodeJobId, getTranscodeAssetProgress])

  return (
    <Dialog
      data-testid="VariantDialog"
      open={open}
      onClose={handleClose}
      fullscreen={!smUp}
      dialogTitle={{ title: 'Audio Language', closeButton: true }}
      divider
      sx={{
        '& .MuiIconButton-root': {
          border: 'none'
        }
      }}
    >
      <Stack gap={4}>
        {variant.videoEdition?.name != null && (
          <VideoEditionChip editionName={variant.videoEdition.name} />
        )}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h2" data-testid="VariantLanguageDisplay">
            {languageName}
          </Typography>
          {nativeLanguageName != null && (
            <Typography variant="caption">{nativeLanguageName}</Typography>
          )}
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VariantVideo hlsSrc={variant.hls} />
        </Box>

        {/* Create HQ Transcode Button and Progress */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" gutterBottom>
            High Quality Transcode
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleTranscode}
            disabled={isTranscoding || !variant.asset?.id}
            sx={{ mb: 2 }}
          >
            Create HQ
          </Button>
          {!variant.asset?.id && (
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              Asset not available for transcoding
            </Typography>
          )}
          {isTranscoding && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Transcoding to 720p (2500kbps)...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={transcodeProgress}
                sx={{ height: 10, borderRadius: 1 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                align="right"
                sx={{ mt: 0.5 }}
              >
                {transcodeProgress}%
              </Typography>
            </Box>
          )}
          {transcodeError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {transcodeError}
            </Typography>
          )}
        </Box>

        <Downloads
          downloads={variant.downloads}
          videoVariantId={variant.id}
          languageId={variant.language.id}
        />
      </Stack>
    </Dialog>
  )
}
