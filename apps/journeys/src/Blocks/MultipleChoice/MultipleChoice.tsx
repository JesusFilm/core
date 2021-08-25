import { useState } from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import customTheme from './MultipleChoice.theme';

const useStyles = makeStyles((theme) => ({
  highlight: {
    fontSize: 16,
    fontWeight: 700,
    justifyContent: 'flex-start',
  },
  highlightIcon: {
    color: customTheme.lightTheme.palette.success.main,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.14,
  },
  description: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  buttonLabels: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    justifyContent: 'flex-start',
  },
}));

type RadioOptions = {
  id?: string;
  parent?: string;
  option: string;
  image?: string;
};

type RadioQuestionProps = {
  id: string;
  parent?: string;
  question?: string;
  children?: RadioOptions[];
};

export const RadioQuestion = (props: RadioQuestionProps) => {
  const classes = useStyles();
  const [option, setOption] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number>();

  const handleButtonSelect = (selected: string, index: number) => {
    setOption(selected);
    setHighlight(index);
    console.log('option', selected);
  };

  return (
    <ThemeProvider theme={customTheme.lightTheme}>
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Typography
              variant="subtitle1"
              className={classes.title}
              gutterBottom
            ></Typography>
            <Typography variant="subtitle2" className={classes.description}>
              description
            </Typography>
          </CardContent>
          <CardContent>
            <ButtonGroup
              orientation="vertical"
              variant="contained"
              fullWidth={true}
            >
              {props.children?.map((options, i) => (
                <Button
                  variant="contained"
                  key={i}
                  onClick={() => handleButtonSelect(options.option, i)}
                  disabled={i !== highlight && !!option}
                  className={
                    i === highlight ? classes.highlight : classes.buttonLabels
                  }
                  startIcon={
                    i !== highlight ? (
                      <RadioButtonUncheckedIcon />
                    ) : (
                      <CheckCircleIcon className={classes.highlightIcon} />
                    )
                  }
                ></Button>
              ))}
            </ButtonGroup>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};
