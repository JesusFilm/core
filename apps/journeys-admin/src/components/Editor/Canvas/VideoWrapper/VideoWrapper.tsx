import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { ReactElement, MouseEvent } from 'react'
import NextImage from 'next/image'
import { ActiveTab, TreeBlock, useEditor } from '@core/journeys/ui'
import { VideoFields } from '../../../../../__generated__/VideoFields'
import { ImageFields } from '../../../../../__generated__/ImageFields'

export function VideoWrapper({
  block: {
    id: blockId,
    videoContent,
    autoplay,
    startAt,
    muted,
    posterBlockId,
    children,
    title,
    fullsize,
    ...props
  }
}: {
  block: TreeBlock<VideoFields>
}): ReactElement {
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    if (props.parentBlockId !== selectedStep?.id) {
      const block: TreeBlock<VideoFields> = {
        id: blockId,
        videoContent,
        autoplay,
        startAt,
        muted,
        posterBlockId,
        children,
        title,
        fullsize,
        ...props
      }

      dispatch({ type: 'SetSelectedBlockAction', block })
    }

    dispatch({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Properties
    })
    dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        borderRadius: 4,
        overflow: 'hidden',
        m: 0,
        position: fullsize === true ? 'absolute' : null,
        top: fullsize === true ? 0 : null,
        right: fullsize === true ? 0 : null,
        bottom: fullsize === true ? 0 : null,
        left: fullsize === true ? 0 : null,
        outline: selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px',
        '> div': {
          width: '100%'
        }
      }}
      onClick={selectedBlock === undefined ? undefined : handleSelectBlock}
    >
      {posterBlock?.src != null ? (
        <NextImage
          src={posterBlock?.src}
          alt={title}
          height="inherit"
          width="inherit"
        />
      ) : (
        <Paper
          sx={{
            borderRadius: (theme) => theme.spacing(4),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'inherit',
            width: 'inherit',
            fontSize: 100
          }}
          elevation={0}
          variant="outlined"
        >
          <VideocamRounded fontSize="inherit" />
        </Paper>
      )}
    </Box>
  )
}
