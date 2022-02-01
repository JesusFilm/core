import { TreeBlock, useEditor } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import MuiTypography from '@mui/material/Typography'
import { ReactElement, useEffect } from 'react'
import { SocialShareAppearance } from '../../Drawer/SocialShareAppearance'
import { Card, Step, Typography, Button, SignUp, RadioOption } from './blocks'
import { MoveBlockButtons } from './MoveBlockButtons'

function AttributesContent({ selected, step }: AttributesProps): ReactElement {
  const withMoveButtons = (block: ReactElement): ReactElement => {
    return (
      <>
        <MoveBlockButtons selectedBlock={selected} selectedStep={step} />
        <Divider orientation="vertical" variant="middle" flexItem />
        {block}
      </>
    )
  }

  switch (selected.__typename) {
    case 'CardBlock':
      return <Card {...selected} />

    case 'StepBlock': {
      const block = selected.children.find(
        (block) =>
          block.__typename === 'CardBlock' || block.__typename === 'VideoBlock'
      )
      return (
        <>
          <Step {...selected} />
          <Divider orientation="vertical" variant="middle" flexItem />
          {block != null && <AttributesContent selected={block} step={step} />}
        </>
      )
    }

    case 'TypographyBlock': {
      return withMoveButtons(<Typography {...selected} />)
    }

    case 'ButtonBlock': {
      return withMoveButtons(<Button {...selected} />)
    }

    case 'SignUpBlock': {
      return withMoveButtons(<SignUp {...selected} />)
    }

    case 'RadioQuestionBlock': {
      return withMoveButtons(<></>)
    }

    case 'RadioOptionBlock': {
      return withMoveButtons(<RadioOption {...selected} />)
    }

    case 'VideoBlock': {
      return step.id === selected.parentBlockId ? (
        <p>Video Attributes</p>
      ) : (
        withMoveButtons(<p>Video Attributes</p>)
      )
    }

    default:
      return <></>
  }
}

interface AttributesProps {
  selected: TreeBlock
  step: TreeBlock
}

export function Attributes({ selected, step }: AttributesProps): ReactElement {
  const { dispatch } = useEditor()
  useEffect(() => {
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Social Share Appearance',
      mobileOpen: false,
      children: <SocialShareAppearance id={selected.id} />
    })
  }, [selected.id, dispatch])
  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <AttributesContent selected={selected} step={step} />
      </Stack>
      <Box
        sx={{
          py: 4.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <MuiTypography align="center">{`Editing ${
          // Properly map typename to labels when doing translations
          selected.__typename === 'StepBlock'
            ? 'Card'
            : selected.__typename.replace('Block', '')
        } Properties`}</MuiTypography>
      </Box>
    </>
  )
}
