import { Button, CircularProgress, FormControlLabel, Grid, Input, List, ListItemText, Stack, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { SettingDto, UserDto, getActivateUserSwitch, getAllUser, getSetAdminState, getSettings, getUserToActivate } from "../services/AdminService";
import "./AdminPanel.css"
import { toast } from "react-toastify";

interface AdminPanelProps {
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
    const [settings, setSettings] = useState<SettingDto[]>([]);
    const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

    const [toActivate, setToActivate] = useState<UserDto[]>([]);
    const [isLoadingToActivate, setIsLoadingToActivate] = useState<boolean>(true);

    const [allUser, setAllUser] = useState<UserDto[]>([]);
    const [isLoadingAllUser, setIsLoadingAllUser] = useState<boolean>(true);

    useEffect(() => {
        const gatherSettings = async () => {
            const res = await getSettings();
            if (res) {
                setIsLoadingSettings(false);
                setSettings(res)
            }
        }
        const gatherToActivate = async () => {
            const res = await getUserToActivate();
            if (res) {
                setIsLoadingToActivate(false);
                setToActivate(res)
            }
        }
        const gatherAllUser = async () => {
            const res = await getAllUser();
            if (res) {
                setIsLoadingAllUser(false);
                setAllUser(res)
            }
        }
        gatherSettings();
        gatherToActivate();
        gatherAllUser();
    }, [])


    const handleActivateUserSwitch = async (username: string, ignoreList:boolean = false) => {
        const ret = await getActivateUserSwitch(username);

        if (ret.status){
            toast.success(`${username}'s activation switched.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
              });
            if(!ignoreList)
                setToActivate(toActivate.filter((user) => user.username!=username));
        } else {
            toast.error(`${username}'s activation failed.\n${ret.text}`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
              });
        }
    }

    const handleAdminSwitch = async (username: string, state:boolean) => {
        const ret = await getSetAdminState(username, state);

        if (ret.status){
            toast.success(`${ret.text}`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
              });
        } else {
            toast.error(`${ret.text}`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
              });
        }
    }



    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getListBase = (list:any[], generator:(elem: any, index:number)=>any) => {
        return (
            <List>
                {list.map(generator)}
            </List>
        )
    }


    const getSettingsList = () => {
        return getListBase(settings,(set:SettingDto, index:number) => {
            return (
                <Stack className={"settingsListItem"+(index==(settings.length-1)?"Last":"")} key={set.name} direction={"row"}>
                    <ListItemText primary={"Name: " + set.name} secondary={"Description: " + set.desc ?? ""} />
                    <Input value={set.value}></Input>
                </Stack>)
        });
    }

    const getAllUserList = () => {
        return getListBase(allUser,(user:UserDto, index:number) => {
            return (
                <Grid justifyContent={"space-between"} alignItems={"center"} className={"settingsListItem"+(index==(allUser.length-1)?"Last":"")} key={user.username} container>
                    <Grid>
                        <div style={{marginLeft:"20px",fontSize:"30px"}}>{user.username}</div>
                    </Grid>
                    <Grid >
                        <FormControlLabel control={<Switch defaultChecked={user.isAdmin} color={"info"} />} onChange={(_, val)=> {handleAdminSwitch(user.username, val)}} label="IsAdmin" />
                        <FormControlLabel control={<Switch defaultChecked={user.activated} color={"success"} onChange={(_, val) => {handleActivateUserSwitch(user.username, !val)}} />} label="IsActive" />
                    </Grid>
                </Grid>)
        });
    }

    const getToActivateList = () => {
        return getListBase(toActivate,(user:UserDto, index:number) => {
            return (
                <Grid justifyContent={"space-between"} alignItems={"center"} className={"settingsListItem"+(index==(toActivate.length-1)?"Last":"")} key={user.username} container>
                    <Grid >
                        <div style={{ marginLeft:"20px", fontSize:"30px"}}>{user.username}</div>
                    </Grid>
                    <Grid >
                        <Button sx={{mr:"20px"}} onClick={()=>{handleActivateUserSwitch(user.username)}} color="error" variant='outlined'>Activate</Button>
                    </Grid>
                </Grid>)
        });
    }

    return (
        <Stack>
            <Stack style={{ padding: "20px" }}>
                <h2 style={{ fontSize:"35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>Settings:</h2>
                <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                    {isLoadingSettings ? <CircularProgress /> : getSettingsList()}
                </Grid>
            </Stack>
            {toActivate?.length > 0?
            <Stack style={{ padding: "20px" }}>
                <h2 style={{ fontSize:"35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>User to activate:</h2>
                <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                    {isLoadingToActivate ? <CircularProgress /> : getToActivateList()}
                </Grid>
            </Stack>:<></>
            }
            <Stack style={{ padding: "20px" }}>
                <h2 style={{ fontSize:"35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>User:</h2>
                <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                    {isLoadingAllUser ? <CircularProgress /> : getAllUserList()}
                </Grid>
            </Stack>
        </Stack>
    )
}

export default AdminPanel;