import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { CardTemplateDrawer } from '../../CardTemplateDrawer'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep, smUp },
    dispatch
  } = useEditor()
  const openCardTemplateDrawer = (e: MouseEvent): void => {
    e.stopPropagation()
    dispatch({
      type: 'SetSelectedBlockAction',
      block: selectedStep
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: t('Card Templates'),
      children: <CardTemplateDrawer />
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
          {blocks.length === 0 && smUp === false && (
            <Stack
              sx={{
                position: 'absolute',
                top: 60,
                bottom: 130,
                right: 20,
                left: 20
              }}
              alignItems="center"
              justifyContent="center"
              spacing={5}
            >
              <Typography>{t('Fill this card with content')}</Typography>
              <Button
                variant="contained"
                size="large"
                onClick={openCardTemplateDrawer}
                fullWidth
              >
                {t('Select Card Template')}
              </Button>
              <Typography variant="body2">
                {t('or add blocks from the list below ⤵')}
              </Typography>
            </Stack>
          )}
        </Box>
      </>
    )
  }
  return <></>
}
