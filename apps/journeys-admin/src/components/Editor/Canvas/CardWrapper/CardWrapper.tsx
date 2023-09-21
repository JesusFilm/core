import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { CardLibrary } from '../../CardLibrary'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep, drawerTitle },
    dispatch
  } = useEditor()
  const openCardLibrary = (e: MouseEvent): void => {
    e.stopPropagation()
    dispatch({
      type: 'SetSelectedBlockAction',
      block: selectedStep
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: t('Card Templates'),
      children: <CardLibrary />
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: undefined
    })
  }

  if (block.__typename === 'CardBlock') {
    const blocks = block.children.map((child) => {
      if (
        child.id === block.coverBlockId &&
        child.__typename === 'VideoBlock'
      ) {
        if (child?.videoId == null) {
          return child
        }
        return {
          ...child,
          videoId: null
        }
      }
      return child
    })
    return (
      <>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: 5
          }}
        >
          <Card
            {...{ ...block, children: blocks }}
            wrappers={children.props.wrappers}
          />
          {blocks.length === 0 && (
            <Box
              onClick={openCardLibrary}
              sx={{
                position: 'absolute',
                top: 60,
                bottom: 130,
                right: 20,
                left: 20,
                border: () =>
                  drawerTitle === t('Card Templates')
                    ? `2px dashed #C52D3A`
                    : '2px dashed #CCC',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Typography>add content from template library</Typography>
            </Box>
          )}
        </Box>
      </>
    )
  }
  return <></>
}
