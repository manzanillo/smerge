import { useParams } from "react-router-dom";
import MergeConflictView from "./MergeConflictView"
import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import "./ConflictStepper.css"
import { useEffect, useRef, useState } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { debounce } from "lodash";

interface ConflictVM {
  hunks: ConflictDto[];
  projectId: string;
  leftId: number;
  rightId: number;
}

interface ConflictDto {
  id: number;
  left: FileDto;
  right: FileDto;
  choice: string;
}

interface FileDto {
  id: number;
  description: string;
  ancestors: undefined;
  file_url: string;
  timestamp: Date;
  number_scripts: number;
  number_sprites: number;
  color: string;
}

interface ConflictStepperProps {
}

function getCookie(key: string) {
  const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

const ConflictStepper: React.FC<ConflictStepperProps> = () => {
  const { code } = useParams();

  const [loadingConflict, setLoadingConflict] = useState(true);
  const [loadingConfictText, setLoadingConflictText] = useState("Loading conflicts...")
  const [conflictData, setConflictData] = useState<ConflictDto[]>();

  const projectId = useRef<string>("")
  const leftId = useRef<number>(0)
  const rightId = useRef<number>(0)

  useEffect(() => {
    debouncedLoadData();
  }, []);

  const loadData = () => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/tmp/${code}`, true);
    const csrftoken = getCookie('csrftoken');
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
        
        console.log(conflictData);
      } else {
        if (xhttp.status >= 400){
          console.log(`Conflict ${code} not found.`);
          toast.warning(`Conflict ${code} not found.`, {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
          });
        }
      }
    }
  }

  const sendChoices = () => {
    const url = `/new_merge/${projectId.current}?file=${leftId.current}&file=${rightId.current}`;
    // return url;
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    const csrftoken = getCookie('csrftoken');
    xhttp.setRequestHeader("X-CSRFToken", csrftoken ?? "");
    const data = conflictData?.map(conflict => `{"choice":"${conflict.choice}", "data":""}`).join(',')??"";
    xhttp.send(`resolutions=${data}`);

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        setLoadingConflict(false);
        toast.success(xhttp.responseText, {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
          });
      } else {
        if (xhttp.status >= 400){
          console.log(`Conflict ${code} not found.`);
          toast.warning(`Merge ${code} failed.`, {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
          });
        }
      }
    }
  }

  const debouncedLoadData = debounce(loadData, 50);

  useEffect(() => {

  }, [conflictData])

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = (left?: boolean) => {
    if (conflictData != undefined) {
      conflictData[activeStep].choice = left ? "left" : "right";
    }

    if (activeStep >= conflictData.length - 1){
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
    handleNext(true)
  }

  const rightButtonAction = () => {
    handleNext(false)
  }

  const finish = () => {
    console.log("fin");
    console.log(conflictData);

    let c = 0;
    for (const conflict of conflictData as ConflictDto[]) {
      if (conflict.choice == undefined) {
        toast.error(`Conflict ${c} not set.`, {
          position: 'top-right',
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
    setLoadingConflictText("Awaiting merge result...");
    setLoadingConflict(true);
    toast.success(sendChoices(), {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
    });
    // setTimeout(()=>{window.location.reload();
    // }, 1000)
  }

  return (<>{loadingConflict ?
    <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><Stack alignItems={"center"}><CircularProgress size="64px" /><h1>{loadingConfictText}</h1></Stack></Box> :
    <Box sx={{ p: "20px" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {conflictData?.map((step, index) => (
          <Step key={step.id}>
            <StepLabel

              optional={
                index === conflictData.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {`Conflict ${index + 1} of ${conflictData?.length}`}
            </StepLabel>
            <StepContent>
              <div className="stepCard">
                <MergeConflictView leftButtonAction={leftButtonAction} rightButtonAction={rightButtonAction} code={`LeftID: ${step.left.id} <-> RightID: ${step.right.id}`} leftLink={step.left.file_url} rightLink={step.right.file_url} isActive={index == activeStep} isText={step.left.file_url.includes(".txt")} />
              </div>

              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={() => { handleNext(true) }}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === conflictData.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep > conflictData.length - 1 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>}</>
  )
  //<MergeConflictView code={code}/>
}

export default ConflictStepper