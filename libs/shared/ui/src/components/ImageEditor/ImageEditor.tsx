import {
  DeleteOutline,
  Image as ImageIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import Image from 'next/image'
import { ChangeEvent, ReactElement, useState } from 'react'
import { object, string } from 'yup'

interface ImageEditorProps {
  selectedBlock: TreeBlock<ImageBlock>
  onChange: () => Promise<void>
  onDelete: () => Promise<void>
  debounceTime?: number
}

export function ImageEditor({
  selectedBlock,
  onChange,
  onDelete,
  debounceTime = 2000
}: ImageEditorProps): ReactElement {
  const [imageBlock, setImageBlock] = useState(
    selectedBlock?.__typename === 'ImageBlock' ? selectedBlock : null
  )
  const [imageSrc, setImageSrc] = useState(imageBlock?.src)
  const [srcValidationText, setSrcValidationText] = useState('')

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const src = event.target.value
    setImageSrc(src)

    await srcSchema
      .validate({ src: src })
      .then(async () => {
        setSrcValidationText('')
        const block = {
          ...imageBlock,
          src: src,
          alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
        }
        await handleChangeDebounced(block as ImageBlock)
      })
      .catch((err) => {
        setSrcValidationText(err.message)
      })
  }

  const handleImageDelete = async (): Promise<void> => {
    await onDelete()
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        {imageBlock?.src != null && (
          <Stack
            direction="row"
            spacing="3"
            justifyContent="space-between"
            data-testid="imageSrcStack"
          >
            <div
              style={{
                overflow: 'hidden',
                borderRadius: 8,
                height: 55,
                width: 55
              }}
            >
              <Image
                src={imageBlock.src}
                alt={imageBlock?.alt}
                width={55}
                height={55}
              ></Image>
            </div>
            <Stack direction="column" justifyContent="center">
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 180,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {imageBlock.src.replace(/(.*\/)*/, '').replace(/\?.*/, '')}
              </Typography>
            </Stack>
            <Stack direction="column" justifyContent="center">
              <DeleteOutline
                data-testid="deleteImage"
                color="primary"
                onClick={handleImageDelete}
                style={{ cursor: 'pointer' }}
              ></DeleteOutline>
            </Stack>
          </Stack>
        )}
        {imageBlock?.src == null && (
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

      <Box sx={{ p: 3 }}>
        <Box sx={{ px: 'auto' }}>
          <Stack direction="column">
            <TextField
              id="imageSrc"
              name="src"
              variant="filled"
              value={imageSrc}
              data-testid="imgSrcTextField"
              label="Paste URL of image..."
              fullWidth={true}
              onChange={handleSrcChange}
              helperText={srcValidationText}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon></LinkIcon>
                  </InputAdornment>
                )
              }}
            ></TextField>
            <Typography variant="caption">
              Make sure image address is permanent
            </Typography>
          </Stack>
        </Box>
      </Box>
    </>
  )
}
