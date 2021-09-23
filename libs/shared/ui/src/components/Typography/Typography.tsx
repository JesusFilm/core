import { ReactElement } from "react";
import {
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
} from "@mui/material";
import { TypographyBlockProps } from "./__generated__/TypographyBlockProps";
import { TypographyVariant } from "../../../__generated__/globalTypes";

export interface TypographyProps
  extends TypographyBlockProps,
    Pick<MuiTypographyProps, "sx"> {}

export function Typography({
  variant,
  color,
  align,
  content,
  ...props
}: TypographyProps): ReactElement {
  return (
    <MuiTypography
      {...props}
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={color ?? undefined}
      sx={{
        mb: variant === TypographyVariant.overline ? 0.5 : 2,
        textShadow:
          variant === TypographyVariant.h1
            ? "0px 1px 3px rgba(0, 0, 0, 0.25)"
            : undefined,
      }}
    >
      {variant === "h6" ? content.toUpperCase() : content}
    </MuiTypography>
  );
}

export default Typography;
