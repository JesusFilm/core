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
  ...props
}: TypographyProps): ReactElement {
  return (
    <MuiTypography
      variant={variant ?? undefined}
      color={color ?? undefined}
      align={align ?? undefined}
      sx={{
        mb: variant === TypographyVariant.overline ? 0.5 : 2,
      }}
      {...props}
    >
      {props.content}
    </MuiTypography>
  );
}

export default Typography;
