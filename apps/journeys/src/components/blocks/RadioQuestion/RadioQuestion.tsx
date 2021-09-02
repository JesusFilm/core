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
import { RadioQuestionType } from '../../../types'
import { RadioOption } from '../RadioOption'

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
  variant = 'light'
}: RadioQuestionType): ReactElement {
  const classes = useStyles()

  return (
    <Container maxWidth="sm">
      <Card
        data-testid="RadioQuestionCard"
        className={variant === 'dark' ? classes.dark : classes.light}
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
                option.__typename === 'RadioOption' && (
                  <RadioOption {...option} key={option.id} />
                )
            )}
          </ButtonGroup>
        </CardContent>
      </Card>
    </Container>
  )
}
