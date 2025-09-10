'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useParams, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { VideoCreateForm } from '../../../_VideoCreateForm'

import { ExistingVideoByIdSelector } from './_ExistingVideoByIdSelector'
import { ExistingVideoSelector } from './_ExistingVideoSelector'

const GET_VIDEO_CHILDREN = graphql(`
  query GetVideoChildren($id: ID!) {
    adminVideo(id: $id) {
      id
      children {
        id
      }
    }
  }
`)

const UPDATE_VIDEO_CHILDREN_ORDER = graphql(`
  mutation UpdateVideoChildrenOrder($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      children {
        id
      }
    }
  }
`)

type AddMethod = 'new' | 'existing' | 'existingById'

interface AddChildrenProps {}

export default function AddChildren({}: AddChildrenProps): ReactElement {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  const { enqueueSnackbar } = useSnackbar()
  const [addMethod, setAddMethod] = useState<AddMethod>('new')

  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN, {
    variables: { id: videoId }
  })

  const returnUrl = `/videos/${videoId}/children`

  const [updateVideoChildrenOrder] = useMutation(UPDATE_VIDEO_CHILDREN_ORDER, {
    onCompleted: () => {
      enqueueSnackbar('Successfully added video as child.', {
        variant: 'success'
      })
      router.push(returnUrl, {
        scroll: false
      })
    },
    onError: () => {
      enqueueSnackbar('Failed to add video as child.', {
        variant: 'error'
      })
    }
  })

  const handleCreateSuccess = async (newVideoId: string): Promise<void> => {
    // After child video is created, update the parent's childIds
    await updateVideoChildrenOrder({
      variables: {
        input: {
          id: videoId,
          childIds: [
            ...data.adminVideo.children.map(({ id }) => id),
            newVideoId
          ]
        }
      }
    })
  }

  const handleExistingVideoSelect = async (
    existingVideoId: string
  ): Promise<void> => {
    // Add existing video as child
    await updateVideoChildrenOrder({
      variables: {
        input: {
          id: videoId,
          childIds: [
            ...data.adminVideo.children.map(({ id }) => id),
            existingVideoId
          ]
        }
      }
    })
  }

  const handleCancel = (): void => {
    router.push(returnUrl, {
      scroll: false
    })
  }

  return (
    <Dialog
      open={true}
      onClose={handleCancel}
      dialogTitle={{
        title: 'Add Child Video',
        closeButton: true
      }}
      divider
      sx={{ '& .MuiDialog-paperFullWidth': { maxWidth: 480 } }}
    >
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="add-method-select-label">Select method</InputLabel>
          <Select
            labelId="add-method-select-label"
            id="add-method-select"
            value={addMethod}
            label="Select method"
            onChange={(e) => setAddMethod(e.target.value as AddMethod)}
          >
            <MenuItem value="new">Create new video</MenuItem>
            <MenuItem value="existing">Find existing video by title</MenuItem>
            <MenuItem value="existingById">Add existing video by ID</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {addMethod === 'new' ? (
        <VideoCreateForm
          parentId={videoId}
          onCreateSuccess={handleCreateSuccess}
        />
      ) : addMethod === 'existing' ? (
        <ExistingVideoSelector
          onSelect={handleExistingVideoSelect}
          onCancel={handleCancel}
        />
      ) : (
        <ExistingVideoByIdSelector
          onSelect={handleExistingVideoSelect}
          onCancel={handleCancel}
        />
      )}
    </Dialog>
  )
}
