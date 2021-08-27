import { ReactElement } from 'react'
import {
  Typography,
  Container,
  Card,
  CardContent,
  ButtonGroup,
  makeStyles
} from '@material-ui/core'
import { RadioQuestionType, GoTo, BlockType } from '../../../types'
import { ConductorContext } from '../../Conductor'
import { BlockSwitcher } from '../../BlockRenderer'

const useStyles = makeStyles(() => ({
  highlightIcon: {
    color: '#54A055'
  },
  buttonLabels: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    textTransform: 'none',
    justifyContent: 'flex-start'
  },
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
            {(variant.length > 0) && (
              <Card className={variant === 'light' ? classes.light : classes.dark}>
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
                    {(children !== undefined) ? children.map((block: BlockType, index: number) => BlockSwitcher(block, index)) : null}
                  </ButtonGroup>
                </CardContent>
              </Card>
            )}
          </Container>
        )}
      }
    </ConductorContext.Consumer>
  )
}
