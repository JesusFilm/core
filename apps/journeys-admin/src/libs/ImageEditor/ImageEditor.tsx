import {
  DeleteOutline,
  Image as ImageIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import Image from 'next/image'
import { ChangeEvent, ReactElement } from 'react'
import { object, string } from 'yup'
import { Form, Formik } from 'formik'
import { noop } from 'lodash'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../__generated__/GetJourney'

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

    const initialBlock =
      selectedBlock?.__typename === 'ImageBlock' ? selectedBlock : null

    const block = {
      ...initialBlock,
      src: src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await onChange(block as ImageBlock)
  }

  const handleImageDelete = async (): Promise<void> => {
    await onDelete()
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        {(selectedBlock as ImageBlock)?.src != null && (
          <Stack direction="row" spacing="16px" data-testid="imageSrcStack">
            <div
              style={{
                overflow: 'hidden',
                borderRadius: 8,
                height: 55,
                width: 55
              }}
            >
              <Image
                src={(selectedBlock as ImageBlock).src ?? ''}
                alt={(selectedBlock as ImageBlock).alt}
                width={55}
                height={55}
              ></Image>
            </div>
            <Stack direction="column" justifyContent="center">
              <Typography
                variant="subtitle2"
                sx={{
                  maxWidth: 150,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {(selectedBlock as ImageBlock).alt}
              </Typography>
              {(selectedBlock as ImageBlock)?.width != null &&
                (selectedBlock as ImageBlock)?.height != null && (
                  <Typography variant="caption">
                    {(selectedBlock as ImageBlock).width}x
                    {(selectedBlock as ImageBlock).height}
                  </Typography>
                )}
            </Stack>
            <Stack direction="column" justifyContent="center">
              <IconButton onClick={handleImageDelete} data-testid="deleteImage">
                <DeleteOutline color="primary"></DeleteOutline>
              </IconButton>
            </Stack>
          </Stack>
        )}
        {(selectedBlock as ImageBlock)?.src == null && (
          <Stack
            direction="row"
            spacing="16px"
            data-testid="imagePlaceholderStack"
          >
            <Box borderRadius={2} bgcolor="#EFEFEF" height={55} width={55}>
              <div
                style={{
                  height: 55,
                  width: 55,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  lineHeight: '55px',
                  padding: '5px'
                }}
              >
                <ImageIcon></ImageIcon>
              </div>
            </Box>
            <Stack direction="column" justifyContent="center">
              <Typography variant="subtitle2">Select Image File</Typography>
              <Typography variant="caption">Min width 1024px</Typography>
            </Stack>
          </Stack>
        )}
      </Box>

      <Box sx={{ py: 3, px: 6 }}>
        <Box sx={{ px: 'auto' }}>
          <Stack direction="column">
            <Formik
              initialValues={{
                src: (selectedBlock as ImageBlock)?.src ?? ''
              }}
              validationSchema={srcSchema}
              onSubmit={noop}
            >
              {({ values, touched, errors, handleChange, handleBlur }) => (
                <Form>
                  <TextField
                    id="src"
                    name="src"
                    variant="filled"
                    data-testid="imgSrcTextField"
                    label="Paste URL of image..."
                    fullWidth
                    value={values.src}
                    onChange={handleChange}
                    onBlur={(e) => {
                      handleBlur(e)
                      errors.src == null &&
                        handleSrcChange(e as ChangeEvent<HTMLInputElement>)
                    }}
                    helperText={
                      touched.src === true
                        ? errors.src
                        : 'Make sure image address is permanent'
                    }
                    error={touched.src === true && Boolean(errors.src)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon></LinkIcon>
                        </InputAdornment>
                      )
                    }}
                  ></TextField>
                </Form>
              )}
            </Formik>
          </Stack>
        </Box>
      </Box>
    </>
  )
}
