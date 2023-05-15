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
import { CreateCloudflareUploadByUrl } from '../../../../../../__generated__/CreateCloudflareUploadByUrl'

export const CREATE_CLOUDFLARE_UPLOAD_BY_URL = gql`
  mutation CreateCloudflareUploadByUrl($url: String!) {
    createCloudflareUploadByUrl(url: $url) {
      id
    }
  }
`

interface CustomUrlProps {
  onChange: (src: string) => void
}

export function CustomUrl({ onChange }: CustomUrlProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [createCloudflareUploadByUrl] =
    useMutation<CreateCloudflareUploadByUrl>(CREATE_CLOUDFLARE_UPLOAD_BY_URL)

  const handleChange = async (url: string): Promise<void> => {
    const { data } = await createCloudflareUploadByUrl({
      variables: {
        url
      }
    })

    if (data?.createCloudflareUploadByUrl != null) {
      const src = `https://imagedelivery.net/${
        process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
      }/${data?.createCloudflareUploadByUrl.id}/public`
      onChange(src)
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
          Add image by URL
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
                label="Paste URL of image..."
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
                    : 'Make sure image address is permanent'
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
