import { ReactElement, useState } from 'react'
import { Typography, Container, Card, CardContent, ButtonGroup } from '@mui/material'
import { makeStyles, createStyles } from '@mui/styles'
import { RadioOption } from '../RadioOption'
import { GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { RadioQuestionVariant } from '../../../../__generated__/globalTypes'

const useStyles = makeStyles(
  () =>
    createStyles({
      light: {
        background: '#ffffff'
      },
      dark: {
        background: '#3b3b3b',
        color: '#ffffff'
      }
    }),
  { name: 'MuiRadioQuestionComponent' }
)

export function RadioQuestion ({
  label,
  description,
  children,
  variant = RadioQuestionVariant.LIGHT
}: TreeBlock<RadioQuestionBlock>): ReactElement {
  const classes = useStyles()
  const [selectedId, setSelectedId] = useState<string>('')

  const handleClick = (id: string): void => {
    setSelectedId(id)
  }

  return (
    <Container maxWidth="sm">
      <Card
          data-testid="RadioQuestionCard"
          className={variant === RadioQuestionVariant.DARK ? classes.dark : classes.light}
        >
        <CardContent>
          <Typography variant="h1" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h6">{description}</Typography>
        </CardContent>
        <CardContent>
          <ButtonGroup
            orientation="vertical"
            variant="contained"
            fullWidth={true}
          >
            {children?.map(
              (option) =>
                option.__typename === 'RadioOptionBlock' && (
                  <RadioOption
                    {...option}
                    key={option.id}
                    selected={selectedId === option.id}
                    disabled={selectedId !== '' && selectedId !== option.id}
                    onClick={handleClick}
                  />
                )
            )}
          </ButtonGroup>
        </CardContent>
      </Card>
    </Container>
  )
}
