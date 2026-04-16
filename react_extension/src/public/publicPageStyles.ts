import { SxProps } from "@mui/material";

/**
 * Style-Definition für die öffentlichen React-Seiten.
 * Diese ist eine TS-Datei um die mui material design imports und types nutzen zu können.
 */

export const lightPageContainer: SxProps = {
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
  color: "black",
};

export const lightPageContent: SxProps = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  py: 3,
};

export const lightTextFieldSx: SxProps = {
  "& .MuiInputBase-input": { color: "#111" },
  "& .MuiInputLabel-root": { color: "#444" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#076AAB" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#888" },
    "&:hover fieldset": { borderColor: "#555" },
    "&.Mui-focused fieldset": { borderColor: "#076AAB" },
  },
};

export const primaryButtonSx: SxProps = {
  backgroundColor: "rgb(15, 3, 3)",
  "&:hover": { backgroundColor: "rgb(7, 106, 171)" },
  color: "white",
};

export const lightAccordionSx: SxProps = {
  backgroundColor: "#fff",
  color: "#111",
  border: "1px solid #888",
  boxShadow: "none",
  "&:before": { display: "none" },
};

export const lightAccordionSummarySx: SxProps = {
  backgroundColor: "#fff",
  color: "#111",
  borderBottom: "1px solid #ddd",
  "& .MuiTypography-root": { color: "#111" },
};

export const lightAccordionDetailsSx: SxProps = {
  backgroundColor: "#fff",
  color: "#111",
};

