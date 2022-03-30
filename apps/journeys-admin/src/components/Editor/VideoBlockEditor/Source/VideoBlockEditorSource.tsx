import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { Box } from '@mui/system'
import { TreeBlock } from '@core/journeys/ui'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import { Link as LinkIcon } from '@mui/icons-material'
import { noop } from 'lodash'
import { useFormik } from 'formik'
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { VideoLibrary } from '../../VideoLibrary'

interface VideoBlockEditorSourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  parentOrder?: number | null
  parentBlockId?: string | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function VideoBlockEditorSource({
  selectedBlock,
  onChange
}: VideoBlockEditorSourceProps): ReactElement {
  const { values, handleChange, handleBlur, setFieldValue } = useFormik({
    initialValues: {
      videoId: selectedBlock?.videoId,
      videoVariantLanguageId: selectedBlock?.videoVariantLanguageId
    },
    validate: async (values) => {
      await onChange(values)
    },
    onSubmit: noop
  })

  const [openVideoLibrary, setOpenVideoLibrary] = useState(false)

  const onSelect = async (
    videoId: string,
    videoVariantLanguageId?: string
  ): Promise<void> => {
    await setFieldValue('videoId', videoId, false)
    await setFieldValue('videoVariantLanguageId', videoVariantLanguageId, true)
  }

  const onClick = (): void => {
    setOpenVideoLibrary(true)
  }

  const handleClose = (): void => {
    setOpenVideoLibrary(false)
  }

  return (
    <form>
      <Box sx={{ py: 3, px: 6, textAlign: 'center' }}>
        <TextField
          name="videoId"
          variant="filled"
          fullWidth
          value={values.videoId}
          onChange={handleChange}
          label="Video ID"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            )
          }}
          sx={{ pb: 2 }}
        />
        <TextField
          name="videoVariantLanguageId"
          variant="filled"
          fullWidth
          value={values.videoVariantLanguageId}
          onChange={handleChange}
          onBlur={handleBlur}
          label="Video Variant Language ID"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>
      <Button
        variant="text"
        size="small"
        startIcon={<SubscriptionsRounded />}
        onClick={onClick}
        sx={{
          px: 2
        }}
      >
        Select a Video
      </Button>
      <VideoLibrary
        open={openVideoLibrary}
        onClose={handleClose}
        onSelect={onSelect}
      />
    </form>
  )
}
