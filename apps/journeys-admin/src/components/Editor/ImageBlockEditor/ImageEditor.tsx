import { DeleteOutline, Link as LinkIcon } from '@mui/icons-material'
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { ChangeEvent, ReactElement } from 'react'
import { object, string } from 'yup'
import { useFormik } from 'formik'
import { noop } from 'lodash'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../ImageBlockThumbnail/ImageBlockThumbnail'

interface ImageEditorProps {
  selectedBlock: ImageBlock | null
  onChange: (block: ImageBlock) => Promise<void>
  onDelete: () => Promise<void>
}

export function ImageEditor({
  selectedBlock,
  onChange,
  onDelete
}: ImageEditorProps): ReactElement {
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
    await onDelete()
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
      <Box sx={{ px: 6, py: 4 }}>
        <Stack direction="row" spacing="16px" data-testid="imageSrcStack">
          <ImageBlockThumbnail selectedBlock={selectedBlock} />
          <Stack direction="column" justifyContent="center">
            {selectedBlock == null && (
              <Typography variant="subtitle2">Select Image File</Typography>
            )}
            {selectedBlock != null && (
              <Typography
                variant="subtitle2"
                sx={{
                  maxWidth: 130,
                  width: 130,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {selectedBlock.alt}
              </Typography>
            )}
            <Typography variant="caption">
              {selectedBlock == null
                ? 'Min width 1024px'
                : `${selectedBlock.width}px x ${selectedBlock.height}px`}
              &nbsp;
            </Typography>
          </Stack>
          <Stack direction="column" justifyContent="center">
            <IconButton onClick={handleImageDelete} data-testid="deleteImage">
              <DeleteOutline color="primary"></DeleteOutline>
            </IconButton>
          </Stack>
        </Stack>
      </Box>
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
                      <LinkIcon></LinkIcon>
                    </InputAdornment>
                  )
                }}
              ></TextField>
            </form>
          </Stack>
        </Box>
      </Box>
    </>
  )
}
