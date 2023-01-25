import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import { DropzoneArea } from 'mui-file-dropzone'
import Button from '@mui/material/Button'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import { ImageBlockEditor } from '../../../../../ImageBlockEditor'
import { ImageBlockUpdate } from '../../../../../../../../__generated__/ImageBlockUpdate'

export const IMAGE_BLOCK_UPDATE = gql`
  mutation ImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      src
      alt
      width
      height
      parentOrder
      blurhash
    }
  }
`

export function ImageOptions(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [imageBlockUpdate, { loading }] =
    useMutation<ImageBlockUpdate>(IMAGE_BLOCK_UPDATE)

  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  const updateImageBlock = async (block: ImageBlock): Promise<void> => {
    if (journey == null) return

    try {
      await imageBlockUpdate({
        variables: {
          id: imageBlock.id,
          journeyId: journey.id,
          input: {
            src: block.src,
            alt: block.alt
          }
        }
      })
      enqueueSnackbar('Image Updated', {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (e) {
      enqueueSnackbar(e.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <Box sx={{ pt: 4, pb: 3, px: 6 }}>
      <Box
        sx={{
          justifyContent: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          '& .MuiBox-root': {
            minHeight: 172,
            maxHeight: 172,
            minWidth: 280,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column-reverse',
            justifyContent: 'flex-end',
            pt: 1.5
          }
        }}
      >
        <DropzoneArea
          acceptedFiles={['image/*']}
          filesLimit={1}
          dropzoneText="Drop Image Here"
          showPreviewsInDropzone={false}
          fileObjects
        />

        <Button
          variant="outlined"
          color="inherit"
          component="label"
          startIcon={<InsertPhotoIcon />}
          sx={{
            position: 'absolute',
            zIndex: 1,
            mt: 20,
            height: 32
          }}
        >
          Choose a file
          <input hidden accept="image/*" multiple type="file" />
        </Button>
      </Box>
      <ImageBlockEditor
        selectedBlock={imageBlock}
        onChange={updateImageBlock}
        showDelete={false}
        loading={loading}
      />
    </Box>
  )
}
