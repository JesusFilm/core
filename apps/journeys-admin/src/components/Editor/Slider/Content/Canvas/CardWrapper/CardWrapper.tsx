import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Trans, useTranslation } from 'next-i18next'
import type { MouseEvent, ReactElement } from 'react'

import type {
  WrapperProps,
  WrappersProps
} from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  // overriding base theme to match default mui breakpoint
  const lgUp = useMediaQuery('@media (min-width: 900px)')
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const openCardTemplates = (e: MouseEvent): void => {
    e.stopPropagation()
    dispatch({
      type: 'SetSelectedBlockAction',
      selectedBlock: selectedStep
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: undefined
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Drawer
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
            borderRadius: 6
          }}
          data-testid="CardWrapper"
        >
          <Card
            {...{ ...block, children: blocks }}
            wrappers={
              (children as ReactElement<{ wrappers?: WrappersProps }>)?.props
                ?.wrappers
            }
          />
          {blocks.length === 0 && !lgUp && (
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
              <Trans t={t}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={openCardTemplates}
                  fullWidth
                >
                  Select Card Template
                </Button>
                <Typography
                  variant="body2"
                  display="flex"
                  flex-direction="column"
                  justifyContent="top"
                  height="24px"
                >
                  or add blocks using the
                  <Plus2Icon
                    fontSize="small"
                    sx={{
                      backgroundColor: '#C52D3A',
                      borderRadius: 100,
                      ml: 1,
                      mr: 1
                    }}
                  />
                  button below
                </Typography>
              </Trans>
            </Stack>
          )}
        </Box>
      </>
    )
  }
  return <></>
}
