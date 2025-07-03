'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
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
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, ReactNode, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { CancelButton } from '../../../../../../components/CancelButton'
import { FormSelectField } from '../../../../../../components/FormSelectField'
import { videoStatuses } from '../../../../../../constants'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../constants'
import { VariantVideo } from '../_VariantVideo'

import { VideoEditionChip } from './_VideoEditionChip'
import { bytesToSize } from './download/_bytesToSize/bytesToSize'

interface VariantDialogProps {
  children: ReactNode
  params: {
    variantId: string
    videoId: string
  }
}

const GET_ADMIN_VIDEO_VARIANT = graphql(`
  query GetAdminVideoVariant($id: ID!, $languageId: ID) {
    videoVariant(id: $id) {
      id
      published
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

const UPDATE_ADMIN_VIDEO_VARIANT = graphql(`
  mutation UpdateAdminVideoVariant($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
    }
  }
`)

const validationSchema = object({
  published: string().required()
})

export default function VariantDialog({
  children,
  params: { variantId, videoId }
}: VariantDialogProps): ReactElement | null {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const pathname = usePathname()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { data, refetch } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANT, {
    variables: { id: variantId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const [updateAdminVideoVariant] = useMutation(UPDATE_ADMIN_VIDEO_VARIANT)

  const handleSubmit = async (
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ) => {
    await updateAdminVideoVariant({
      variables: {
        input: { id: variantId, published: values.published === 'published' }
      },
      onCompleted: () => {
        enqueueSnackbar('Variant updated', { variant: 'success' })
        resetForm({ values })
      },
      onError: () => {
        enqueueSnackbar('Error updating variant', { variant: 'error' })
      }
    })
  }
  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(pathname?.includes('download') ?? false)
  }, [pathname])
  return (
    <>
      <Dialog
        data-testid="VariantDialog"
        open={true}
        onClose={() =>
          router.push(`/videos/${videoId}/audio`, {
            scroll: false
          })
        }
        fullscreen={!smUp}
        dialogTitle={{ title: 'Audio Language', closeButton: true }}
        divider
        sx={{
          '& .MuiIconButton-root': {
            border: 'none'
          }
        }}
      >
        <Formik
          initialValues={{
            published: data.videoVariant.published ? 'published' : 'unpublished'
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, dirty, resetForm }) => (
            <Form>
              <Stack gap={4}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Stack direction="column" alignItems="start" gap={1}>
                    <Typography
                      variant="h2"
                      data-testid="VariantLanguageDisplay"
                    >
                      {data.videoVariant.language.name[0].value}
                    </Typography>
                    {data.videoVariant.videoEdition?.name != null && (
                      <VideoEditionChip
                        editionName={data.videoVariant.videoEdition.name}
                      />
                    )}
                  </Stack>
                  <Stack direction="column" spacing={1} alignItems="end">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        Status
                      </Typography>
                      <FormControl
                        variant="filled"
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <FormSelectField
                          label="Status"
                          name="published"
                          options={videoStatuses}
                          onChange={handleChange}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1.2
                            },
                            '& .MuiInputBase-root': {
                              height: 40
                            }
                          }}
                        />
                      </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CancelButton show={dirty} handleCancel={resetForm} />
                      <Button
                        variant="contained"
                        size="small"
                        color="info"
                        type="submit"
                        disabled={!dirty}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Stack>
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
                  <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        router.push(
                          `/videos/${videoId}/audio/${variantId}/download/${data.videoVariant.language.id}/add`,
                          {
                            scroll: false
                          }
                        )
                      }
                    >
                      Add Download
                    </Button>
                  </Stack>

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
                                        `/videos/${videoId}/audio/${variantId}/download/${id}/delete`,
                                        {
                                          scroll: false
                                        }
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
            </Form>
          )}
        </Formik>
      </Dialog>
      {children}
    </>
  )
}
