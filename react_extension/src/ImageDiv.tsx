import "./MergeConflictView.css";
import Split from "react-split";
import Paper from "@mui/material/Paper";
// import Grid from '@mui/material/Grid';
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useRef, useState } from "react";
import httpService from "./services/HttpService";
import { Box, CircularProgress, Stack } from "@mui/material";
import "./ImageDiv.css";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import FilterTiltShiftIcon from "@mui/icons-material/FilterTiltShift";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import TargetIcon from "./TargetIcon";
import { FileDto } from "./ConflictStepper";

interface ImageDivProps {
  text1: string;
  text2: string;
  left?: FileDto;
  right?: FileDto;
}

function getPngDimensions(base64_uri: string) {
  const base64 = base64_uri.split(",")[1];
  const header = atob(base64.slice(0, 50)).slice(16, 24);
  const uint8 = Uint8Array.from(header, (c) => c.charCodeAt(0));
  const dataView = new DataView(uint8.buffer);

  return {
    width: dataView.getInt32(0),
    height: dataView.getInt32(4),
  };
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

const ImageDiv: React.FC<ImageDivProps> = ({ text1, text2, left, right }) => {
  const splitHeight = 600;

  const getImagePane = (
    text: string,
    isLeft: boolean,
    cxPercent: string,
    cyPercent: string,
    ratio: number
  ) => {
    return (
      <Grid
        container
        justifyContent="center"
        justifyItems={"center"}
        style={{ width: "100%", height: "100%" }}
      >
        <Paper
          className="checkered"
          style={isLeft ? styleLeft : styleRight}
          elevation={1}
        >
          <div
            style={{
              height: "100%",
              width: splitHeight * ratio,
              position: "absolute",
            }}
          >
            <img src={text} alt={text} style={{ height: "100%" }} />
            <div
              style={{
                position: "absolute",
                top: cyPercent,
                left: cxPercent,
                transform: "translate(-50%, -50%)",
                color: "red",
              }}
            >
              <TargetIcon
                style={{ fontSize: 50, fontWeight: 1 }}
                color="lightblue"
              />
            </div>
          </div>
        </Paper>
      </Grid>
    );
  };

  const [text1Loading, setText1Loading] = useState(true);
  const cx1Percent = useRef("50%");
  const cy1Percent = useRef("50%");
  const ration1 = useRef(1);
  const [text2Loading, setText2Loading] = useState(true);
  const cx2Percent = useRef("50%");
  const cy2Percent = useRef("50%");
  const ration2 = useRef(1);
  const [text1Data, setText1Data] = useState("");
  const [text2Data, setText2Data] = useState("");

  useEffect(() => {
    httpService.get(
      text1,
      (req) => {
        setText1Data(req.response);
        setText1Loading(false);

        const dimensions = getPngDimensions(req.response);
        cx1Percent.current = (100 * (left?.cx ?? 1)) / dimensions.width + "%";
        cy1Percent.current = (100 * (left?.cy ?? 1)) / dimensions.height + "%";
        ration1.current = dimensions.width / dimensions.height;
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

        const dimensions = getPngDimensions(req.response);
        cx2Percent.current = (100 * (right?.cx ?? 1)) / dimensions.width + "%";
        cy2Percent.current = (100 * (right?.cy ?? 1)) / dimensions.height + "%";
        ration2.current = dimensions.width / dimensions.height;
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
          style={{ height: splitHeight + "px" }}
        >
          <div>
            {getImagePane(
              text1Data,
              true,
              cx1Percent.current,
              cy1Percent.current,
              ration1.current
            )}
          </div>
          <div>
            {getImagePane(
              text2Data,
              false,
              cx2Percent.current,
              cy2Percent.current,
              ration2.current
            )}
          </div>
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
