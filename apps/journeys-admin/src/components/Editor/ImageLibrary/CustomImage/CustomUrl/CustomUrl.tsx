import { ReactElement, ClipboardEvent } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { noop } from 'lodash'
import fetch from 'node-fetch'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'

interface CustomUrlProps {
  selectedBlock: ImageBlock | null
  onChange: (src: string) => void
  cloudflareUploadUrl?: string
}

export function CustomUrl({
  selectedBlock,
  onChange,
  cloudflareUploadUrl
}: CustomUrlProps): ReactElement {
  // TODO: manage delete state
  // Add tests

  const handleChange = async (src: string): Promise<void> => {
    if (cloudflareUploadUrl == null) return

    await (
      await fetch(cloudflareUploadUrl, {
        method: 'POST',
        body: JSON.stringify({
          src
        })
      })
    ).json()

    onChange(src)
  }

  const handlePaste = async (
    e: ClipboardEvent<HTMLDivElement>
  ): Promise<void> => {
    await handleChange(e.clipboardData.getData('text'))
  }

  const formik = useFormik({
    initialValues: {
      src: selectedBlock?.src ?? ''
    },
    onSubmit: noop
  })

  return (
    <Stack direction="column" sx={{ pt: 3, px: 6 }}>
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
          error={formik.touched.src === true && Boolean(formik.errors.src)}
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
  )
}
