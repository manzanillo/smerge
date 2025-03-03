import { useParams } from "react-router-dom";
import MergeConflictView from "./MergeConflictView";
import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import "./ConflictStepper.css";
import { useEffect, useRef, useState } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import useScriptLoader from "../shared/useScriptLoader";
import { useTranslation } from "react-i18next";

interface ConflictVM {
  hunks: ConflictDto[];
  projectId: string;
  leftId: number;
  rightId: number;
  leftFile: string;
  rightFile: string;
  workCopy: string;
}

export interface ConflictDto {
  id: number;
  left: FileDto;
  right: FileDto;
  choice: string;
  parentPath: string;
  parentImage: string;
  allowBoth: boolean;
}

export interface FileDto {
  id: number;
  description: string;
  ancestors: undefined;
  file_url: string;
  timestamp: Date;
  number_scripts: number;
  number_sprites: number;
  color: string;
  cx: number;
  cy: number;
  name: string;
  tag_id: string;
}

interface ConflictStepperProps {}

function getCookie(key: string) {
  const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

const ConflictStepper: React.FC<ConflictStepperProps> = () => {
  const { code } = useParams();

  const { t } = useTranslation();

  const [loadingConflict, setLoadingConflict] = useState(true);
  const [loadingConfictText, setLoadingConflictText] = useState(
    t("MergeConflictView.loadingText")
  );
  const [conflictData, setConflictData] = useState<ConflictDto[]>();

  const projectId = useRef<string>("");
  const leftId = useRef<number>(0);
  const rightId = useRef<number>(0);
  const leftFile = useRef<string>("");
  const rightFile = useRef<string>("");
  const workCopy = useRef<string>("");

  useEffect(() => {
    debouncedLoadData();
  }, []);

  const loadData = () => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/getConflict/${code}`, true);
    const csrftoken = getCookie("csrftoken");
    xhttp.setRequestHeader("X-CSRFToken", csrftoken ?? "");
    xhttp.send();

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        setLoadingConflict(false);
        const resJson = JSON.parse(xhttp.responseText) as ConflictVM;
        setConflictData(resJson.hunks);
        projectId.current = resJson.projectId;
        leftId.current = resJson.leftId;
        rightId.current = resJson.rightId;
        leftFile.current = resJson.leftFile;
        rightFile.current = resJson.rightFile;
        workCopy.current = resJson.workCopy;
      } else {
        if (xhttp.status >= 400) {
          console.log(`Conflict ${code} not found.`);
          toast.warning(`Conflict ${code} not found.`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
          });
        }
      }
    };
  };

  const sendChoices = () => {
    const url = `/new_merge/${projectId.current}?file=${leftId.current}&file=${rightId.current}`;
    // return url;
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    const csrftoken = getCookie("csrftoken");
    xhttp.setRequestHeader("X-CSRFToken", csrftoken ?? "");
    const data =
      conflictData
        ?.map((conflict) => `{"choice":"${conflict.choice}", "data":""}`)
        .join(",") ?? "";
    xhttp.send(`resolutions=${data}`);

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        setLoadingConflict(false);
        window.close();
        toast.success(xhttp.responseText, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      } else {
        if (xhttp.readyState === 4 && xhttp.status >= 400) {
          console.log(`Conflict ${code} not found.`);
          if (xhttp.status == 410) {
            toast.warning(t("ConflictStepper.alreadyResolvedToast"), {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
            });
            setLoadingConflictText(t("ConflictStepper.alreadyResolved"));
            setTimeout(() => {
              window.close();
            }, 10000);
          } else {
            toast.warning(`Merge ${code} failed.`, {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
            });
          }
        }
      }
    };
  };

  const debouncedLoadData = debounce(loadData, 50);

  useEffect(() => {}, [conflictData]);

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = (option?: string) => {
    if (conflictData != undefined) {
      conflictData[activeStep].choice = option ?? "left";
    }

    if (activeStep >= (conflictData?.length ?? 1) - 1) {
      finish();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    finish();
  };

  const leftButtonAction = () => {
    handleNext("left");
  };

  const bothButtonAction = () => {
    handleNext("both");
  };

  const rightButtonAction = () => {
    handleNext("right");
  };

  const finish = () => {
    // console.log("fin");
    // console.log(conflictData);

    let c = 0;
    for (const conflict of conflictData as ConflictDto[]) {
      if (conflict.choice == undefined) {
        toast.error(`Conflict ${c} not set.`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
        setActiveStep(c);
        return;
      }
      c += 1;
    }

    // if all choices are set, send to backend and switch to waiting
    setConflictData([]);
    setLoadingConflictText(t("ConflictStepper.waitingForMerge"));
    setLoadingConflict(true);
    sendChoices();
    // setTimeout(()=>{window.location.reload();
    // }, 1000)
  };

  const scripts = [
    "/ext/csnap/morphic.js",
    "/ext/csnap/symbols.js",
    "/ext/csnap/widgets.js",
    "/ext/csnap/blocks.js",
    "/ext/csnap/threads.js",
    "/ext/csnap/objects.js",
    "/ext/csnap/scenes.js",
    "/ext/csnap/gui.js",
    "/ext/csnap/paint.js",
    "/ext/csnap/lists.js",
    "/ext/csnap/byob.js",
    "/ext/csnap/tables.js",
    "/ext/csnap/sketch.js",
    "/ext/csnap/video.js",
    "/ext/csnap/maps.js",
    "/ext/csnap/extensions.js",
    "/ext/csnap/xml.js",
    "/ext/csnap/store.js",
    "/ext/csnap/locale.js",
    "/ext/csnap/cloud.js",
    "/ext/csnap/api.js",
    "/ext/csnap/sha512.js",
    "/ext/csnap/FileSaver.min.js",
  ];

  const [error, scriptsLoaded] = useScriptLoader(scripts);

  if (error) {
    console.error("Error loading scripts:", error);
  }

  return (
    <>
      {loadingConflict || !scriptsLoaded ? (
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
            <h1>{loadingConfictText}</h1>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p: "20px", background: "#2d2d2d" }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {conflictData?.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  optional={
                    index === conflictData.length - 1 ? (
                      <Typography variant="caption">
                        {t("ConflictStepper.lastStep")}
                      </Typography>
                    ) : null
                  }
                >
                  {`${t("ConflictStepper.conflict")} ${index + 1} ${t(
                    "ConflictStepper.of"
                  )} ${conflictData?.length}`}
                </StepLabel>
                <StepContent>
                  <div className="stepCard">
                    <MergeConflictView
                      leftButtonAction={leftButtonAction}
                      bothButtonAction={bothButtonAction}
                      rightButtonAction={rightButtonAction}
                      code={`LeftID: ${step.left.id} <-> RightID: ${step.right.id}`}
                      leftLink={step.left.file_url}
                      rightLink={step.right.file_url}
                      leftDesc={step.left.description}
                      rightDesc={step.right.description}
                      isActive={index == activeStep}
                      isText={step.left.file_url.includes(".txt")}
                      isImage={step.left.file_url.includes(".base64")}
                      isAudio={step.left.file_url.includes(".abase64")}
                      isAttribute={step.left.file_url.includes(".atxt")}
                      parentPath={step.parentPath}
                      parentImage={step.parentImage}
                      left={step.left}
                      right={step.right}
                      allowBoth={step.allowBoth}
                      workCopy={workCopy.current}
                      leftFile={leftFile.current}
                      rightFile={rightFile.current}
                      tagId={step.left.tag_id}
                    />
                  </div>

                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={() => {
                          handleNext("left");
                        }}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {index === conflictData.length - 1
                          ? t("ConflictStepper.finish")
                          : t("ConflictStepper.continue")}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {t("ConflictStepper.back")}
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep > (conflictData?.length ?? 9999) - 1 && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>{t("ConflictStepper.allStepsCompleted")}</Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                {t("ConflictStepper.reset")}
              </Button>
            </Paper>
          )}
        </Box>
      )}
      {/* </ScriptLoader> */}
    </>
  );
  //<MergeConflictView code={code}/>
};

export default ConflictStepper;
