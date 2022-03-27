import { ReactElement } from 'react'
import { InputAdornment, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { TreeBlock } from '@core/journeys/ui'
import { Link as LinkIcon } from '@mui/icons-material'
import { noop } from 'lodash'
import { useFormik } from 'formik'
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'

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
  const { values, handleChange, handleBlur } = useFormik({
    initialValues: {
      videoId: selectedBlock?.videoId,
      videoVariantLanguageId: selectedBlock?.videoVariantLanguageId
    },
    validate: async (values) => {
      await onChange(values)
    },
    onSubmit: noop
  })

  return (
    <Box sx={{ py: 3, px: 6, textAlign: 'center' }}>
      <form>
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
      </form>
    </Box>
  )
}
