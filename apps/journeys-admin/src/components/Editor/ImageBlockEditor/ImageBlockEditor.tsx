import { Link as LinkIcon } from '@mui/icons-material'
import { Box, InputAdornment, Stack, TextField } from '@mui/material'
import { ChangeEvent, ReactElement } from 'react'
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
}

export function ImageBlockEditor({
  selectedBlock,
  showDelete = true,
  onChange,
  onDelete
}: ImageBlockEditorProps): ReactElement {
  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const src = event.target.value

    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    const block = {
      ...selectedBlock,
      src: src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await onChange(block as ImageBlock)
  }

  const handleImageDelete = async (): Promise<void> => {
    if (onDelete != null) await onDelete()
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
        header={selectedBlock == null ? 'Select Image File' : selectedBlock.alt}
        caption={
          selectedBlock == null
            ? 'Min width 1024px'
            : `${selectedBlock.width} x ${selectedBlock.height}px`
        }
        showDelete={showDelete && selectedBlock != null}
        onDelete={handleImageDelete}
      />
      <Box sx={{ py: 3, px: 6 }}>
        <Box sx={{ px: 'auto' }}>
          <Stack direction="column">
            <form>
              <TextField
                id="src"
                name="src"
                variant="filled"
                label="Paste URL of image..."
                fullWidth
                value={formik.values.src}
                onChange={formik.handleChange}
                onBlur={async (e) => {
                  formik.handleBlur(e)
                  await handleSrcChange(e as ChangeEvent<HTMLInputElement>)
                }}
                helperText={
                  formik.touched.src === true
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
        </Box>
      </Box>
    </>
  )
}
