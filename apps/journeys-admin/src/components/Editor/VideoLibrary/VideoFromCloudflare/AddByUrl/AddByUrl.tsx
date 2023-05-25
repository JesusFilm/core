import { ReactElement, useState } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/ListItemButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { gql, useMutation } from '@apollo/client'
import { isEmpty } from 'lodash'
import { CreateCloudflareVideoUploadByUrl } from '../../../../../../__generated__/CreateCloudflareVideoUploadByUrl'
import { TextFieldForm } from '../../../../TextFieldForm'

export const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL = gql`
  mutation CreateCloudflareVideoUploadByUrl($url: String!) {
    createCloudflareVideoUploadByUrl(url: $url) {
      id
    }
  }
`

interface AddByUrlProps {
  onChange: (id: string) => void
}

export function AddByUrl({ onChange }: AddByUrlProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [createCloudflareUploadByUrl] =
    useMutation<CreateCloudflareVideoUploadByUrl>(
      CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL
    )

  const handleChange = async (url?: string): Promise<void> => {
    if (isEmpty(url)) return
    const { data } = await createCloudflareUploadByUrl({
      variables: {
        url
      }
    })

    if (data?.createCloudflareVideoUploadByUrl != null) {
      onChange(data.createCloudflareVideoUploadByUrl.id)
    }
  }

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
            <TextFieldForm
              id="src"
              label="Paste URL of video..."
              handleSubmit={handleChange}
              helperText="Works with mp4 files [Youtube, etc. will not work]"
              startIcon={
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              }
              iconPosition="start"
            />
          </Stack>
        </Fade>
      </Collapse>
    </>
  )
}
