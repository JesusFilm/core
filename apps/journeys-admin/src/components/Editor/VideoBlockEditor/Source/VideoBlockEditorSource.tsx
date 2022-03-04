import { ChangeEvent, ReactElement } from 'react'
import { InputAdornment, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { TreeBlock } from '@core/journeys/ui'
import { Link as LinkIcon } from '@mui/icons-material'
import { noop } from 'lodash'
import { object, string } from 'yup'
import { useFormik } from 'formik'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'

interface VideoBlockEditorSourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  parentOrder: number
  parentBlockId: string
  onChange: (block: TreeBlock<VideoBlock>) => Promise<void>
}

export function VideoBlockEditorSource({
  selectedBlock,
  parentBlockId,
  parentOrder,
  onChange
}: VideoBlockEditorSourceProps): ReactElement {
  const handleVideoSrcChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const src = event.target.value

    if (
      !(await srcSchema.isValid({ src })) ||
      src === selectedBlock?.videoContent.src
    )
      return

    const title = src.replace(/(.*\/)*/, '').replace(/\?.*/, '')

    const block =
      selectedBlock == null
        ? {
            parentBlockId: parentBlockId,
            __typename: 'VideoBlock',
            title: title,
            autoplay: true,
            muted: parentOrder === 0,
            startAt: 0,
            endAt: null,
            posterBlockId: null,
            videoContent: {
              src: src
            }
          }
        : {
            ...selectedBlock,
            title: title,
            videoContent: { src: src }
          }
    await onChange(block as TreeBlock<VideoBlock>)
  }

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const formik = useFormik({
    initialValues: {
      src: (selectedBlock as VideoBlock)?.videoContent?.src ?? ''
    },
    validationSchema: srcSchema,
    onSubmit: noop
  })

  return (
    <Box sx={{ py: 3, px: 6, textAlign: 'center' }}>
      <form>
        <TextField
          id="src"
          name="src"
          variant="filled"
          label="Paste URL of video..."
          fullWidth
          value={formik.values.src}
          onChange={formik.handleChange}
          onBlur={async (e) => {
            formik.handleBlur(e)
            await handleVideoSrcChange(e as ChangeEvent<HTMLInputElement>)
          }}
          helperText={
            formik.touched.src === true
              ? formik.errors.src
              : 'Make sure video address is permanent'
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
    </Box>
  )
}
