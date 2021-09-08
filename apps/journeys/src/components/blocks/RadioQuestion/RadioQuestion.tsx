import { ReactElement } from 'react'
import {
  Typography,
  Container,
  Card,
  CardContent,
  ButtonGroup,
  makeStyles,
  createStyles
} from '@material-ui/core'
import { RadioOption } from '../RadioOption'
import { GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { RadioQuestionVariant } from '../../../../__generated__/globalTypes'

const useStyles = makeStyles(() => createStyles({
  light: {
    background: '#ffffff'
  },
  dark: {
    background: '#3b3b3b',
    color: '#ffffff'
  }
}), { name: 'MuiRadioQuestionComponent' })

export function RadioQuestion ({
  label,
  description,
  children,
  variant = RadioQuestionVariant.LIGHT
}: TreeBlock<RadioQuestionBlock>): ReactElement {
  const classes = useStyles()

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
          <Typography variant="subtitle1">{description}</Typography>
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
                  <RadioOption {...option} key={option.id} />
                )
            )}
          </ButtonGroup>
        </CardContent>
      </Card>
    </Container>
  )
}
