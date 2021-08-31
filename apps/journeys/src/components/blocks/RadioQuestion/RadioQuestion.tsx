import { ReactElement } from 'react'
import {
  Typography,
  Container,
  Card,
  CardContent,
  ButtonGroup,
  makeStyles
} from '@material-ui/core'
import { RadioQuestionType, GoTo } from '../../../types'
import { ConductorContext } from '../../Conductor'
import { RadioOption } from '../RadioOption'

const useStyles = makeStyles(() => ({
  light: {
    background: '#ffffff'
  },
  dark: {
    background: '#3b3b3b',
    color: '#ffffff'
  }
}))

export const RadioQuestion = ({
  label,
  description,
  children,
  variant = 'light',
  action
}: RadioQuestionType): ReactElement => {
  const classes = useStyles()

  return (
    <ConductorContext.Consumer>
      {({ goTo }: GoTo) => {
        return (
          <Container maxWidth="sm">
            {variant.length > 0 && (
              <Card
                className={variant === 'light' ? classes.light : classes.dark}
              >
                <CardContent onClick={() => goTo(action)}>
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
                    {children !== undefined
                      ? children?.map(
                        (option, index) =>
                          option.__typename === 'RadioOption' && (
                              <RadioOption {...option} key={index} />
                          )
                      )
                      : null}
                  </ButtonGroup>
                </CardContent>
              </Card>
            )}
          </Container>
        )
      }}
    </ConductorContext.Consumer>
  )
}
