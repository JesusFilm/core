import { ReactElement } from "react";
import { Story, Meta } from "@storybook/react";
import { Box } from "@mui/system";
import {
  ThemeProvider,
  useTheme,
  PaletteColor,
  PaletteMode,
  PaletteOptions,
} from "@mui/material";

import { Typography, TypographyProps } from "../../components/Typography";
import { sharedUiConfig } from "../../libs/storybook/decorators";
import { darkTheme, lightTheme } from "../theme/theme";
import { TypographyVariant } from "../../../__generated__/globalTypes";

const TypographyDemo = {
  ...sharedUiConfig,
  component: Typography,
  title: "Default Theme",
};

interface ColorPaletteProps extends TypographyProps {
  variants: Array<keyof PaletteOptions>;
}

interface TypographyStoryProps extends TypographyProps {
  variants: Array<keyof PaletteOptions>;
  mode: PaletteMode;
}

const ColorPalettes = ({
  variants,
  ...props
}: ColorPaletteProps): ReactElement => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          bgcolor: `${theme.palette.background.default}`,
          color: `${theme.palette.text.primary}`,
          mb: 2,
          p: 2,
          boxShadow: 1,
        }}
      >
        <Typography
          {...props}
          variant={TypographyVariant.overline}
          content={"Background"}
        />
      </Box>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {variants.map((variant: keyof PaletteOptions) => {
          const paletteColor = theme.palette[variant] as PaletteColor;
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <Box
                sx={{
                  bgcolor: `${paletteColor.light}`,
                  color: `${paletteColor.contrastText}`,
                  width: "100%",
                  p: 2,
                }}
              >
                <Typography
                  {...props}
                  variant={TypographyVariant.overline}
                  content={`${variant} light`}
                />
              </Box>

              <Box
                sx={{
                  bgcolor: `${paletteColor.main}`,
                  color: `${paletteColor.contrastText}`,
                  width: "100%",
                  p: 2,
                }}
              >
                <Typography
                  {...props}
                  variant={TypographyVariant.overline}
                  content={`${variant} main`}
                />
              </Box>

              <Box
                sx={{
                  bgcolor: `${paletteColor.dark}`,
                  color: `${paletteColor.contrastText}`,
                  width: "100%",
                  p: 2,
                }}
              >
                <Typography
                  {...props}
                  variant={TypographyVariant.overline}
                  content={`${variant} dark`}
                />
              </Box>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ColorTemplate: Story<TypographyStoryProps> = (args) => (
  // TODO: Update when adding Storybook theme toggle
  <ThemeProvider theme={args.mode === "dark" ? darkTheme : lightTheme}>
    <ColorPalettes {...args} variants={args.variants} />
  </ThemeProvider>
);

export const Colors = ColorTemplate.bind({});
Colors.args = {
  mode: "light",
  variants: ["surface", "surfaceAlt", "primary", "secondary", "error"],
};

export default TypographyDemo as Meta;
