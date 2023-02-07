import LinkIcon from '@mui/icons-material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { ReactElement, ClipboardEvent } from 'react'
import { object, string } from 'yup'
import { useFormik } from 'formik'
import { noop } from 'lodash'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'

interface ImageBlockEditorProps {
  selectedBlock: ImageBlock | null
  showDelete?: boolean
  onChange: (block: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  loading?: boolean
}

export function ImageBlockEditor({
  selectedBlock,
  showDelete = true,
  onChange,
  onDelete,
  loading
}: ImageBlockEditorProps): ReactElement {
  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (src: string): Promise<void> => {
    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    const block = {
      ...selectedBlock,
      src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await onChange(block as ImageBlock)
  }

  const handleImageDelete = async (): Promise<void> => {
    if (onDelete != null) {
      await onDelete()
      formik.resetForm({ values: { src: '' } })
    }
  }

  const handlePaste = async (
    e: ClipboardEvent<HTMLDivElement>
  ): Promise<void> => {
    await handleSrcChange(e.clipboardData.getData('text'))
  }

  const formik = useFormik({
    initialValues: {
      src: selectedBlock?.src ?? ''
    },
    validationSchema: srcSchema,
    onSubmit: noop
  })

  return (
    <>
      <ImageBlockHeader
        selectedBlock={selectedBlock}
        onDelete={handleImageDelete}
        loading={loading}
      />
      <Stack direction="column" sx={{ pt: 3 }}>
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
              await handleSrcChange(e.target.value)
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
    </>
  )
}
