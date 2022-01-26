import { TreeBlock, useEditor } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import MuiTypography from '@mui/material/Typography'
import { ReactElement, useEffect } from 'react'
import { SocialShareAppearance } from '../../Drawer/SocialShareAppearance'
import { Card, Step, Typography, Button, SignUp, RadioOption } from './blocks'

function AttributesContent({ selected }: AttributesProps): ReactElement {
  switch (selected?.__typename) {
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
          {block != null && <AttributesContent selected={block} />}
        </>
      )
    }
    // ask about radio question
    case 'TypographyBlock': {
      return <Typography {...selected} />
    }

    case 'ButtonBlock': {
      return <Button {...selected} />
    }

    case 'SignUpBlock': {
      return <SignUp {...selected} />
    }

    case 'RadioOptionBlock': {
      return <RadioOption {...selected} />
    }

    case 'VideoBlock': {
      return <p>Video Attributes</p>
    }

    default:
      return <></>
  }
}

interface AttributesProps {
  selected: TreeBlock
}

export function Attributes({ selected }: AttributesProps): ReactElement {
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
        <AttributesContent selected={selected} />
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
