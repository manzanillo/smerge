/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import "./MergeConflictView.css";
import SnapDiv from "./SnapDiv";
import TurnSlightLeftIcon from "@mui/icons-material/TurnSlightLeft";
import TurnSlightRightIcon from "@mui/icons-material/TurnSlightRight";
// import Button from '@mui/material/Button';
import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import TextDiv from "./TextDiv";
import ImageDiv from "./ImageDiv";
import httpService from "./services/HttpService";
import { FileDto } from "./ConflictStepper";
import AudioDiv from "./AudioDiv";
import AttributeDiv from "./AttributeDiv";

interface MergeConflictViewProps {
  leftButtonAction: () => void;
  rightButtonAction: () => void;
  code?: string;
  isActive?: boolean;
  isText?: boolean;
  isImage?: boolean;
  isAudio?: boolean;
  isAttribute?: boolean;
  leftLink?: string;
  rightLink?: string;
  parentPath?: string;
  parentImage?: string;
  left?: FileDto;
  right?: FileDto;
}

const MergeConflictView: React.FC<MergeConflictViewProps> = ({
  leftButtonAction,
  rightButtonAction,
  code = "",
  leftLink = "",
  rightLink = "",
  isActive,
  isText = false,
  isImage = false,
  isAudio = false,
  isAttribute = false,
  parentPath = "",
  parentImage = "",
  left,
  right,
}) => {
  const serverEndpoint = "";

  const [xml1, _setXml1] = useState<string>(
    leftLink.includes(".xml")
      ? serverEndpoint + leftLink
      : leftLink.replace("/media", "media")
  );
  const [xml2, _setXml2] = useState<string>(
    rightLink.includes(".xml")
      ? serverEndpoint + rightLink
      : rightLink.replace("/media", "media")
  );

  const [isLoaded, _setIsLoaded] = useState<boolean>(false);

  const [iconLoading, setIconLoading] = useState(true);
  const [iconData, setIconData] = useState("");

  useEffect(() => {
    httpService.get(
      parentImage.substring(1),
      (req) => {
        setIconData(req.response);
        setIconLoading(false);
      },
      (req) => {
        console.log(req);
      },
      () => {},
      true,
      true
    );
  }, [parentImage]);

  return (
    <>
      {!isLoaded && isActive && xml1 != "" && xml2 != "" ? (
        <div className="merge_main_space">
          <Stack
            height={"40px"}
            paddingBottom={"10px"}
            alignItems="center"
            direction={"row"}
            spacing={3}
          >
            <Typography variant="h5" style={{ textDecoration: "underline" }}>
              Conflict inside:
            </Typography>
            <Typography variant="body1">{parentPath}</Typography>
            {iconLoading ? (
              <CircularProgress style={{ width: "24px", height: "24px" }} />
            ) : (
              <Paper style={{ width: "48px", height: "36px" }} elevation={8}>
                <img
                  style={{ borderRadius: "5px" }}
                  width="48px"
                  height="36px"
                  src={iconData}
                />
              </Paper>
            )}
          </Stack>
          <div className="merge_main_pane">
            {isText ? (
              <TextDiv text1={xml1} text2={xml2} />
            ) : isImage ? (
              <ImageDiv text1={xml1} text2={xml2} left={left} right={right} />
            ) : isAudio ? (
              <AudioDiv text1={xml1} text2={xml2} left={left} right={right} />
            ) : isAttribute ? (
              <AttributeDiv text1={xml1} text2={xml2} />
            ) : (
              <SnapDiv xml1={xml1} xml2={xml2}></SnapDiv>
            )}
          </div>
          <Stack
            direction="row"
            spacing={10}
            justifyContent={"center"}
            sx={{ pt: "20px" }}
          >
            <Button
              onClick={leftButtonAction}
              variant="contained"
              color={"success"}
              startIcon={<TurnSlightLeftIcon />}
            >
              Select Left
            </Button>
            <Button
              onClick={rightButtonAction}
              variant="contained"
              color={"warning"}
              endIcon={<TurnSlightRightIcon />}
            >
              Select Right
            </Button>
          </Stack>
        </div>
      ) : (
        <Box
          sx={{
            paddingTop: "20px",
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

export default MergeConflictView;
