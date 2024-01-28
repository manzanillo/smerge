import "./MergeConflictView.css";
import Split from "react-split";
import Paper from "@mui/material/Paper";
// import Grid from '@mui/material/Grid';
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import httpService from "./services/HttpService";
import { Box, CircularProgress, Stack } from "@mui/material";

interface ImageDivProps {
  text1: string;
  text2: string;
}

const styleLeft: React.CSSProperties = {
  textAlign: "center",
  borderTopLeftRadius: "20px",
  borderBottomLeftRadius: "20px",
  width: "100%",
};
const styleRight: React.CSSProperties = {
  textAlign: "center",
  borderTopRightRadius: "20px",
  borderBottomRightRadius: "20px",
  width: "100%",
};

const ImageDiv: React.FC<ImageDivProps> = ({ text1, text2 }) => {
  const getImagePane = (text: string, isLeft: boolean) => {
    return (
      <Grid
        container
        justifyContent="center"
        justifyItems={"center"}
        style={{ width: "100%", height: "100%" }}
      >
        <Paper style={isLeft ? styleLeft : styleRight} elevation={1}>
          <img src={text} alt={text} style={{ height: "100%" }} />
        </Paper>
      </Grid>
    );
  };

  const [text1Loading, setText1Loading] = useState(true);
  const [text2Loading, setText2Loading] = useState(true);
  const [text1Data, setText1Data] = useState("");
  const [text2Data, setText2Data] = useState("");

  useEffect(() => {
    httpService.get(
      text1,
      (req) => {
        setText1Data(req.response);
        setText1Loading(false);
      },
      (req) => {
        console.log(req);
      },
      () => {},
      true,
      false
    );
    httpService.get(
      text2,
      (req) => {
        setText2Data(req.response);
        setText2Loading(false);
      },
      (req) => {
        console.log(req);
      },
      () => {},
      true,
      false
    );
  }, []);

  return (
    <>
      {!text1Loading && !text2Loading ? (
        <Split
          className="split"
          gutterAlign="center"
          snapOffset={200}
          sizes={[49.5, 50.5]}
          style={{ height: "600px" }}
        >
          <div>{getImagePane(text1Data, true)}</div>
          <div>{getImagePane(text2Data, false)}</div>
        </Split>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack alignItems={"center"}>
            <CircularProgress size="64px" />
            <h1>Loading conflicts...</h1>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default ImageDiv;

// pointerEvents:"none"
// <div className='merge_main_space' >
//     <div ref={pane} className='merge_main_pane'>
