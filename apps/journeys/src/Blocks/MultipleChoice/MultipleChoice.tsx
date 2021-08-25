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
import { RadioOptionType, RadioQuestionType } from '../../types';

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

type RadioQuestionProps = {
  block: RadioQuestionType
}


export const RadioQuestion = ({ block }: RadioQuestionProps) => {
  const classes = useStyles();
  const [selectedOption, setSelectedOption] = useState<RadioOptionType | undefined>();

  const handleButtonSelect = (selected: RadioOptionType) => {
    setSelectedOption(selected);
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
              {block.children?.map((option) => (
                option.__typename === 'RadioOption' && <Button
                  variant="contained"
                  key={option.id}
                  onClick={() => handleButtonSelect(option)}
                  disabled={selectedOption?.id === option.id}
                  className={
                    selectedOption?.id === option.id ? classes.highlight : classes.buttonLabels
                  }
                  startIcon={
                    selectedOption?.id === option.id ? (
                      <CheckCircleIcon className={classes.highlightIcon} />
                      ) : (
                      <RadioButtonUncheckedIcon />
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
