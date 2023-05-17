import { ReactElement, ClipboardEvent, useState } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/ListItemButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { gql, useMutation } from '@apollo/client'
import { useFormik } from 'formik'
import { noop } from 'lodash'
import { CreateCloudflareVideoUploadByUrl } from '../../../../../../__generated__/CreateCloudflareVideoUploadByUrl'

export const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL = gql`
  mutation CreateCloudflareVideoUploadByUrl($url: String!) {
    createCloudflareVideoUploadByUrl(url: $url) {
      id
    }
  }
`

interface CustomUrlProps {
  onChange: (id: string) => void
}

export function CustomUrl({ onChange }: CustomUrlProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [createCloudflareUploadByUrl] =
    useMutation<CreateCloudflareVideoUploadByUrl>(
      CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL
    )

  const handleChange = async (url: string): Promise<void> => {
    const { data } = await createCloudflareUploadByUrl({
      variables: {
        url
      }
    })

    if (data?.createCloudflareVideoUploadByUrl != null) {
      onChange(data.createCloudflareVideoUploadByUrl.id)
      formik.resetForm({ values: { src: '' } })
    }
  }

  const handlePaste = async (
    e: ClipboardEvent<HTMLDivElement>
  ): Promise<void> => {
    await handleChange(e.clipboardData.getData('text'))
  }

  const formik = useFormik({
    initialValues: {
      src: ''
    },
    onSubmit: noop
  })

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        sx={{
          px: 6,
          display: 'flex',
          alignItem: 'center',
          width: 'inherit',
          '&:hover': {
            backgroundColor: 'transparent'
          }
        }}
      >
        <LinkIcon />
        <Typography variant="subtitle2" sx={{ pl: 2, pr: 1 }}>
          Add video by URL
        </Typography>
        {open ? (
          <ExpandLess sx={{ ml: 'auto' }} />
        ) : (
          <ExpandMore sx={{ ml: 'auto' }} />
        )}
      </Button>
      <Collapse in={open}>
        <Fade in={open}>
          <Stack sx={{ pt: 3, px: 6 }}>
            <form>
              <TextField
                id="src"
                name="src"
                variant="filled"
                label="Paste URL of video..."
                fullWidth
                value={formik.values.src}
                onChange={formik.handleChange}
                onPaste={async (e) => {
                  await handlePaste(e)
                }}
                onBlur={async (e) => {
                  formik.handleBlur(e)
                  await handleChange(e.target.value)
                }}
                helperText={
                  formik.errors.src != null
                    ? formik.errors.src
                    : 'Works with mp4 files [Youtube, etc. will not work]'
                }
                error={
                  formik.touched.src === true && Boolean(formik.errors.src)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Stack>
        </Fade>
      </Collapse>
    </>
  )
}
