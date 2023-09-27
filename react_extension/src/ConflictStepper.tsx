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
import { useEffect, useState } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { toast } from "react-toastify";

interface ConflictVM{
  hunks: ConflictDto[]
}

interface ConflictDto{
  id: number;
  left: FileDto;
  right: FileDto;
  choice: string;
}

interface FileDto{
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

const steps = [
  {
    label: 'Select campaign settings',
    description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: 'Create an ad group',
    description:
      'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    label: 'Create an ad',
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
];

function getCookie(key:string) {
  const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}


const ConflictStepper: React.FC<ConflictStepperProps> = () => {
  const { code } = useParams();

  const [loadingConflict, setLoadingConflict] = useState(true);
  const [conflictData, setConflictData] = useState<ConflictDto[]>();

  useEffect(()=>{
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/tmp/${code}`, true);
    const csrftoken = getCookie('csrftoken');
    xhttp.setRequestHeader("X-CSRFToken", csrftoken??"");
    xhttp.send();

    xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      setLoadingConflict(false);
      const resJson = JSON.parse(xhttp.responseText) as ConflictVM;
      setConflictData(resJson.hunks);
      console.log(conflictData);
    } else {
      console.log(`Conflict ${code} not found.`);
      // toast.warning(`Conflict ${code} not found.`, {
      //   position: 'top-right',
      //   autoClose: 2000,
      //   hideProgressBar: false,
      // });
    }
}},[])

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (<>{loadingConflict?
    <Box sx={{ width:"100%", height:"100%", display:"flex", justifyContent:"center", alignItems: "center" }}><Stack alignItems={"center"}><CircularProgress size="64px" /><h1>Loading conflicts...</h1></Stack></Box>:
    <Box sx={{ p:"20px" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {conflictData?.map((step, index) => (
          <Step key={step.id}>
            <StepLabel
              
              optional={
                index === 2 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {`Conflict ${index} of ${conflictData?.length}`}
            </StepLabel>
            <StepContent>
              <div className="stepCard">
              <MergeConflictView code={`LeftID: ${step.left.id} <-> RightID: ${step.right.id}`} leftLink={step.left.file_url} rightLink={step.right.file_url} isActive={index==activeStep} isText={step.left.file_url.includes(".txt")}/>
              </div>
           
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
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
      {activeStep === steps.length && (
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