import React from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TextDisplay from "../shared/TextDisplay";

interface HelpDisplayItemContentProps {
  header?: string;
  footer: string;
  src: string;
  parentHeight: number;
}

/** This is a simple example of how the component works **/
export const HelpDisplayItemContent: React.FC<HelpDisplayItemContentProps> = ({
  header,
  footer,
  src,
  parentHeight,
}) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  const imageMaxHeight =
    (!isSm
      ? Math.round((parentHeight - 25) * 0.6)
      : Math.round((parentHeight - 15) * 0.6)) + "dvh";
  const textMaxHeight =
    (!isSm
      ? Math.round((parentHeight - 34) * 0.4)
      : Math.round((parentHeight - 34) * 0.4)) + "dvh";

  return (
    <Stack
      display={"flex"}
      style={{ height: "100%", width: "100%" }}
      justifyContent={"start"}
      alignItems={"center"}
    >
      {header && isSm && (
        <Typography variant="h5" gutterBottom>
          {header}
        </Typography>
      )}

      <img
        style={{
          borderColor: "rgba(132, 132, 132, 0.5)",
          borderWidth: "2px",
          borderStyle: "groove",
          borderRadius: "10px",
          maxHeight: imageMaxHeight,
          maxWidth: "500px",
          boxShadow: "8px 8px 10px rgba(2, 2, 2, 0.226)",
        }}
        src={src}
        alt="Help image"
      />
      <Paper
        elevation={4}
        sx={{
          mt: "20px",
          p: "10px",
          borderRadius: "10px",
          background: "transparent",
        }}
        style={{
          width: "calc(100% - 20px)",
          maxHeight: textMaxHeight,
          overflow: "auto",
        }}
      >
        <TextDisplay text={footer}></TextDisplay>
      </Paper>
    </Stack>
  );
};
export default HelpDisplayItemContent;
