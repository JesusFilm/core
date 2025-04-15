'use client'

import { useSuspenseQuery } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../constants'
import { VariantVideo } from '../_VariantVideo'

import { VideoEditionChip } from './_VideoEditionChip'
import { bytesToSize } from './download/_utils/bytesToSize'

interface VariantDialogProps {
  params: {
    variantId: string
    videoId: string
  }
}

const GET_ADMIN_VIDEO_VARIANT = graphql(`
  query GetAdminVideoVariant($id: ID!, $languageId: ID) {
    videoVariant(id: $id) {
      id
      hls
      downloads {
        id
        url
        quality
        size
        width
        height
      }
      language {
        id
        name(languageId: $languageId) {
          value
        }
      }
      videoEdition {
        name
      }
    }
  }
`)
// This mutation is kept for potential future use
const UPDATE_VARIANT_LANGUAGE = graphql(`
  mutation UpdateVariantLanguage($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
    }
  }
`)

export type UpdateVariantLanguageVariables = VariablesOf<
  typeof UPDATE_VARIANT_LANGUAGE
>
export type UpdateVariantLanguage = ResultOf<typeof UPDATE_VARIANT_LANGUAGE>

export default function VariantDialog({
  params: { variantId, videoId }
}: VariantDialogProps): ReactElement | null {
  const router = useRouter()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANT, {
    variables: { id: variantId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  return (
    <Dialog
      data-testid="VariantDialog"
      open={true}
      onClose={() => router.push(`/videos/${videoId}/audio`)}
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
        {data.videoVariant.videoEdition?.name != null && (
          <VideoEditionChip editionName={data.videoVariant.videoEdition.name} />
        )}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h2" data-testid="VariantLanguageDisplay">
            {data.videoVariant.language.name[0].value}
          </Typography>
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VariantVideo hlsSrc={data.videoVariant.hls} />
        </Box>
        <>
          <Typography variant="h4">Downloads</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(
                `/videos/${videoId}/audio/${variantId}/download/${data.videoVariant.language.id}/add`
              )
            }
            sx={{ my: 2 }}
          >
            Add Download
          </Button>

          {data.videoVariant.downloads.length === 0 ? (
            <Typography>No downloads available</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Quality</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Dimensions</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.videoVariant.downloads.map(
                    ({ id, quality, size, width, height, url }) => (
                      <TableRow key={id}>
                        <TableCell>{quality}</TableCell>
                        <TableCell>{bytesToSize(size)}</TableCell>
                        <TableCell>{`${width}x${height}`}</TableCell>
                        <TableCell>{url}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="Delete"
                            onClick={() =>
                              router.push(
                                `/videos/${videoId}/audio/${variantId}/download/${id}/delete`
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </Stack>
    </Dialog>
  )
}
