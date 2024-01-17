import { Label, Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PasswordField from "./shared/PasswordField";
import ProjectDto from "./models/ProjectDto";
import TextField from "./shared/TextField";
import Grid from '@mui/material/Unstable_Grid2';
import { useNavigate } from 'react-router-dom';

import "./OldSettingControls.css";
import httpService from "../services/HttpService";
import { postPasswordChange, postProjectSettingsChange , postDeleteProject } from "../services/ProjectService";
import ConfirmButton from "./ConfirmButton";

interface OldSettingControlsProps {
    projectData: ProjectDto;
    setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

const OldSettingControls: React.FC<OldSettingControlsProps> = ({ projectData, setProjectData }) => {
    const [values, setValues] = useState({ password: '', old_password: '', project_name: '', project_desc: '' });
    const [oldPasswordError, setOldPasswordError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setValues({
            ...values,
            project_name: projectData.name,
            project_desc: projectData.description,
        });
    }, [projectData]);


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: any) => {
        setValues({
            ...values,
            [event.target.name]: event.target.value,
        });
    };

    const handlePasswordClick = async () => {
        const res = await postPasswordChange(projectData.id, values.old_password, values.password);
        if (res) {
            setOldPasswordError(false);
        } else { 
            setOldPasswordError(true);
        }
    }

    const handleNameClick = async () => {
        const res = await postProjectSettingsChange(projectData.id, { ...projectData, "name": values.project_name }, values.old_password)
        if (res) { 
            setProjectData({ ...res });
            setOldPasswordError(false);
        } else { 
            setOldPasswordError(true);
        }
    }

    const handleDescClick = async () => {
        const res = await postProjectSettingsChange(projectData.id, { ...projectData, "description": values.project_desc }, values.old_password)
        if (res) { 
            setProjectData({ ...res });
            setOldPasswordError(false);
        } else { 
            setOldPasswordError(true);
        }
    }

    const handleDeleteClick = async () => {
        postDeleteProject(projectData.id, values.old_password, () => {window.location.href = "/";})
        setOldPasswordError(true);
    }

    return (
        <Paper elevation={6} style={{ background: "transparent", padding: "10px", borderRadius: "10px", overflow:"scroll" }}>
            <Stack spacing={3}>
                <div>
                    <div style={{ textDecoration: "underline", fontWeight: 900 }}>Project Pin:</div>
                    <div style={{ textAlign: "center", letterSpacing: "10px" }}>{projectData.pin ?? "000000"}</div>
                </div>
                <Divider></Divider>
                <div>
                    <div style={{ textDecoration: "underline", fontWeight: 900 }}>Change Password:</div>
                    <Grid container spacing={1} alignItems={"center"} justifyContent={"space-between"}>
                        <Grid xs={5}>
                            <PasswordField name="old_password" labelText="Old Password" handleChange={handleChange} error={oldPasswordError}></PasswordField>
                        </Grid>
                        <Grid xs={5}>
                            <PasswordField name="password" labelText="New Password" handleChange={handleChange}></PasswordField>
                        </Grid>
                        <Grid xs={2}>
                            <Button variant="contained" type="button" className={"oldSettingsButton"} onClick={handlePasswordClick}>CHANGE</Button>
                        </Grid>
                    </Grid>
                </div>
                <Divider></Divider>
                <div>
                    <div style={{ textDecoration: "underline", fontWeight: 900 }}>Change Project Name:</div>
                    <Grid container spacing={1} alignItems={"center"}>
                        <Grid xs={10}>
                            <TextField className="oldSettingsTextBox" name="project_name" defaultValue={projectData.name} handleChange={handleChange} />
                        </Grid>
                        <Grid xs={2}>
                            <Button variant="contained" type="button" className={"oldSettingsButton"} onClick={handleNameClick}>CHANGE</Button>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <div style={{ textDecoration: "underline", fontWeight: 900 }}>Change Project Description</div>
                    <Grid container spacing={1} alignItems={"center"}>
                        <Grid xs={10}>
                            <TextField className="oldSettingsTextBox" name="project_desc" defaultValue={projectData.description} handleChange={handleChange} />
                        </Grid>
                        <Grid xs={2}>
                            <Button variant="contained" type="button" className={"oldSettingsButton"} onClick={handleDescClick}>CHANGE</Button>
                        </Grid>
                    </Grid>
                </div>
                <Stack justifyContent={"space-around"}>
                    <ConfirmButton text={"Delete Project"} popoverText="Are you sure to delete this project?" handleConfirm={handleDeleteClick} confirmColor={"error"} cancelColor={"primary"}/>
                </Stack>
            </Stack>
        </Paper>
    )
}

export default OldSettingControls;