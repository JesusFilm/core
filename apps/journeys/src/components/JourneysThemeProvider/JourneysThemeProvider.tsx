import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from './Theme';

export interface JourneysThemeProviderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const JourneysThemeProvider = ({
  children,
  ...rest
}: JourneysThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme.lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
