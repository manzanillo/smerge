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
import httpService from "../../services/HttpService";
import { FileDto } from "./ConflictStepper";
import AudioDiv from "./AudioDiv";
import AttributeDiv from "./AttributeDiv";
import { useTranslation } from "react-i18next";

interface MergeConflictViewProps {
  leftButtonAction: () => void;
  bothButtonAction: () => void;
  rightButtonAction: () => void;
  code?: string;
  isActive?: boolean;
  isText?: boolean;
  isImage?: boolean;
  isAudio?: boolean;
  isAttribute?: boolean;
  leftLink?: string;
  rightLink?: string;
  leftDesc?: string;
  rightDesc?: string;
  parentPath?: string;
  parentImage?: string;
  left?: FileDto;
  right?: FileDto;
  allowBoth?: boolean;
  workCopy?: string;
  leftFile?: string;
  rightFile?: string;
  tagId?: string;
  rightTagId?: string;
}

const MergeConflictView: React.FC<MergeConflictViewProps> = ({
  leftButtonAction,
  bothButtonAction,
  rightButtonAction,
  code = "",
  leftLink = "",
  rightLink = "",
  leftDesc = "",
  rightDesc = "",
  isActive,
  isText = false,
  isImage = false,
  isAudio = false,
  isAttribute = false,
  parentPath = "",
  parentImage = "",
  left,
  right,
  allowBoth,
  workCopy = "",
  leftFile = "",
  rightFile = "",
  tagId = "",
}) => {
  const serverEndpoint = "";

  const { t } = useTranslation();
  const [xmlLeft, _setXmlLeft] = useState<string>(
    leftFile.includes(".xml")
      ? serverEndpoint + leftFile
      : leftFile.replace("/media", "media")
  );
  const [xmlRight, _setXmlRight] = useState<string>(
    rightFile.includes(".xml")
      ? serverEndpoint + rightFile
      : rightFile.replace("/media", "media")
  );
  const [xmlHunkLeft, _setXmlHunkLeft] = useState<string>(
    leftLink.includes(".xml")
      ? serverEndpoint + leftLink
      : leftLink.replace("/media", "media")
  );
  const [xmlHunkRight, _setXmlHunkRight] = useState<string>(
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
      {!isLoaded && isActive && xmlHunkLeft != "" && xmlHunkRight != "" ? (
        <div className="merge_main_space">
          <Stack
            height={"40px"}
            paddingBottom={"10px"}
            alignItems="center"
            direction={"row"}
            spacing={3}
          >
            <Typography variant="h5" style={{ textDecoration: "underline" }}>
              {t("MergeConflictView.confInside")}
            </Typography>
            <Typography variant="body1">{parentPath}</Typography>
            {iconLoading ? (
              <CircularProgress style={{ width: "24px", height: "24px" }} />
            ) : (
              <Paper
                style={{
                  width: "48px",
                  height: "36px",
                  position: "relative",
                  marginLeft: "10px",
                }}
                className={"checkeredSmal"}
                elevation={8}
              >
                <img
                  style={{
                    borderRadius: "5px",
                    position: "absolute",
                    top: "2px",
                    left: "2px",
                  }}
                  width="44px"
                  height="32px"
                  src={iconData}
                />
              </Paper>
            )}
          </Stack>
          <div className="merge_main_pane">
            {isText ? (
              <TextDiv text1={xmlHunkLeft} text2={xmlHunkRight} />
            ) : isImage ? (
              <ImageDiv text1={xmlHunkLeft} text2={xmlHunkRight} left={left} right={right} />
            ) : isAudio ? (
              <AudioDiv text1={xmlHunkLeft} text2={xmlHunkRight} left={left} right={right} />
            ) : isAttribute ? (
              <AttributeDiv text1={xmlHunkLeft} text2={xmlHunkRight} />
            ) : (
              <SnapDiv linkLeft={xmlLeft} linkRight={xmlRight} desc1={leftDesc} desc2={rightDesc} linkWorkCopy={workCopy}
                       tagId={tagId}></SnapDiv>
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
              {t("MergeConflictView.selectLeft")}
            </Button>
            {allowBoth && (
              <Button
                onClick={bothButtonAction}
                variant="contained"
                color={"warning"}
                startIcon={<TurnSlightRightIcon />}
                endIcon={<TurnSlightLeftIcon />}
              >
                {t("MergeConflictView.selectBoth")}
              </Button>
            )}
            <Button
              onClick={rightButtonAction}
              variant="contained"
              color={"success"}
              endIcon={<TurnSlightRightIcon />}
            >
              {t("MergeConflictView.selectRight")}
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
            <h1>{t("MergeConflictView.loadingText")}</h1>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default MergeConflictView;
