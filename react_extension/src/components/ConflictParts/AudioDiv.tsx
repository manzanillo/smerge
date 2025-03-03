import "./MergeConflictView.css";
import Split from "react-split";
import Paper from "@mui/material/Paper";
// import Grid from '@mui/material/Grid';
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import httpService from "../../services/HttpService";
import { Box, CircularProgress, Divider, Stack } from "@mui/material";
import "./ImageDiv.css";
import { FileDto } from "./ConflictStepper";

interface AudioDivProps {
  text1: string;
  text2: string;
  left?: FileDto;
  right?: FileDto;
}

const styleLeft: React.CSSProperties = {
  position: "relative",
  textAlign: "center",
  borderTopLeftRadius: "20px",
  borderBottomLeftRadius: "20px",
  // background: "white",
  overflow: "auto",
  width: "100%",
};
const styleRight: React.CSSProperties = {
  position: "relative",
  textAlign: "center",
  borderTopRightRadius: "20px",
  borderBottomRightRadius: "20px",
  // background: "white",
  overflow: "auto",
  width: "100%",
};

const AudioDiv: React.FC<AudioDivProps> = ({ text1, text2, left, right }) => {
  const splitHeight = 600;

  const getAudioPane = (text: string, isLeft: boolean) => {
    return (
      <Grid
        container
        justifyContent="center"
        justifyItems={"center"}
        style={{ width: "100%", height: "100%" }}
      >
        <Paper style={isLeft ? styleLeft : styleRight} elevation={1}>
          <Stack
            style={{ height: "100%", justifyContent: "center" }}
            spacing={2}
          >
            <div>Audio name: "{isLeft ? left?.name : right?.name}"</div>
            <audio
              style={{ paddingLeft: "20px", paddingRight: "20px" }}
              controls
              src={text}
            />
          </Stack>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!text1Loading && !text2Loading ? (
        <Split
          className="split"
          gutterAlign="center"
          snapOffset={200}
          sizes={[49.5, 50.5]}
          style={{ height: splitHeight + "px" }}
        >
          <div>{getAudioPane(text1Data, true)}</div>
          <div>{getAudioPane(text2Data, false)}</div>
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

export default AudioDiv;

// pointerEvents:"none"
// <div className='merge_main_space' >
//     <div ref={pane} className='merge_main_pane'>
