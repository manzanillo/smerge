import { Backdrop, Button, CircularProgress, FormControlLabel, Grid, Input, List, ListItemText, Stack, Switch } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { SettingDto, UserDto, getActivateUserSwitch, getAllUser, getLastStart, getRunCommand, getSetAdminState, getSettings, getUserToActivate, postUpdateSetting } from "../services/AdminService";
import "./AdminPanel.css"
import { toast } from "react-toastify";
import { debounce } from "lodash";

interface AdminPanelProps {
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
    const [settings, setSettings] = useState<SettingDto[]>([]);
    const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);

    const [toActivate, setToActivate] = useState<UserDto[]>([]);
    const [isLoadingToActivate, setIsLoadingToActivate] = useState<boolean>(true);

    const [allUser, setAllUser] = useState<UserDto[]>([]);
    const [isLoadingAllUser, setIsLoadingAllUser] = useState<boolean>(true);

    const [lastStart, setLastStart] = useState<Date>(new Date());
    const [isLoadingLastStart, setIsLoadingLastStart] = useState<boolean>(true);

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
        const gatherLastStart = async () => {
            const res = await getLastStart();
            if (res) {
                setIsLoadingLastStart(false);
                setLastStart(res)
            }
        }
        gatherSettings();
        gatherToActivate();
        gatherAllUser();
        gatherLastStart();
    }, [])


    const handleActivateUserSwitch = async (username: string, ignoreList: boolean = false) => {
        const ret = await getActivateUserSwitch(username);

        if (ret.status) {
            toast.success(`${username}'s activation switched.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
            if (!ignoreList)
                setToActivate(toActivate.filter((user) => user.username != username));
        } else {
            toast.error(`${username}'s activation failed.\n${ret.text}`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
        }
    }

    const handleAdminSwitch = async (username: string, state: boolean) => {
        const ret = await getSetAdminState(username, state);

        if (ret.status) {
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
    const getListBase = (list: any[], generator: (elem: any, index: number) => any) => {
        return (
            <List>
                {list.map(generator)}
            </List>
        )
    }


    const debouncedUpdateSetting = useRef(
        debounce(async (setting: SettingDto) => {
            updateSetting(setting);
        }, 300)
    ).current;

    useEffect(() => {
        return () => {
            debouncedUpdateSetting.cancel();
        };
    }, [debouncedUpdateSetting]);

    const updateSetting = async (setting: SettingDto) => {
        const ret = await postUpdateSetting(setting);
        if (ret.status) {
            toast.success(`'${setting.name}' ${ret.text}`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
        } else {
            toast.error(`'${setting.name}' ${ret.text}`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
        }
    }


    const getSettingsList = () => {
        return getListBase(settings, (set: SettingDto, index: number) => {
            return (
                <Stack className={"settingsListItem" + (index == (settings.length - 1) ? "Last" : "")} key={set.name} direction={"row"}>
                    <ListItemText primary={"Name: " + set.name} secondary={"Description: " + set.desc ?? ""} />
                    {
                        (set.objectType == "int" || set.objectType == "string") ?
                            <Input defaultValue={set.value} onChange={(val) => {
                                set.value = val.target.value;
                                debouncedUpdateSetting(set);
                            }}></Input>
                            :
                            <Switch defaultChecked={set.value == "1"} color={"success"} onChange={(_, val) => {
                                set.value = val ? "1" : "0";
                                updateSetting(set);
                            }} />
                    }

                </Stack>)
        });
    }

    const controlsList = [
        { name: "Restart Docker Container", commandName: "restart" },
        { name: "NPX Install (Access Portal)", commandName: "npx_i_a" },
        { name: "NPX Install (React Extension)", commandName: "npx_i_r" },
        { name: "NPX Install (Snapmerge)", commandName: "npx_i_s" },
        { name: "PIP Install (Access Portal)", commandName: "pip_i_a" },
        { name: "PIP Install (Snapmerge)", commandName: "pip_i_s" },
        { name: "Migrate DB (Snapmerge)", commandName: "migrate_s" }
    ]
    const [lockPage, setLockPage] = useState(false);

    const getControlsList = () => {
        return getListBase(controlsList, (set: { name: string, commandName: string }, index: number) => {
            return (
                <Stack className={"settingsListItem" + (index == (controlsList.length - 1) ? "Last" : "")} key={set.name} direction={"row"}>
                    <ListItemText primary={set.name} />
                    <Button sx={{ mr: "20px" }} onClick={async () => {
                        setLockPage(true);
                        const ret = await getRunCommand(set.commandName);
                        if (ret.status) {
                            toast.success(`${ret.text}`, {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                            });
                        } else {
                            toast.error(`${ret.text} (Check console...)`, {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                            });
                        }

                        setLockPage(false);
                    }}
                        color="warning" variant='outlined'>Run</Button>
                </Stack>)
        });
    }


    const [lastStartDelta, setLastStartDelta] = useState<number>(0);
    useEffect(() => {
        const timer = setInterval(() => {
            if(!isLoadingLastStart){
                const diffInMilliseconds = Math.abs(dateToUTC(new Date()) - dateToUTC(lastStart));
                setLastStartDelta(diffInMilliseconds);
            }
        }, 1000);
    
        return () => clearInterval(timer);
      }, [isLoadingLastStart, lastStart]);

    const dateToUTC = (date: Date) => {
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    }

    const getTimeLabel = useCallback(() => {
        // Calculate time difference in different units
        const seconds = Math.floor((lastStartDelta / 1000) % 60);
        const minutes = Math.floor((lastStartDelta / 1000 / 60) % 60);
        const hours = Math.floor((lastStartDelta / (1000 * 60 * 60)) % 24);
        const days = Math.floor(lastStartDelta / (1000 * 60 * 60 * 24));
    
        return `${days} day${days!=1?"s":""}, ${hours} hour${hours!=1?"s":""}, ${minutes} minutes, ${seconds} seconds`;
    }, [lastStartDelta]);

    const getLastRestartPaper = () => {
        return (
            <div style={{ fontSize: "30px" }} className={"settingsListItemLast"}>{getTimeLabel()}</div>
        );
    }

    const getAllUserList = () => {
        return getListBase(allUser, (user: UserDto, index: number) => {
            return (
                <Grid justifyContent={"space-between"} alignItems={"center"} className={"settingsListItem" + (index == (allUser.length - 1) ? "Last" : "")} key={user.username} container>
                    <Grid>
                        <div style={{ marginLeft: "20px", fontSize: "30px" }}>{user.username}</div>
                    </Grid>
                    <Grid >
                        <FormControlLabel control={<Switch defaultChecked={user.isAdmin} color={"info"} />} onChange={(_, val) => { handleAdminSwitch(user.username, val) }} label="IsAdmin" />
                        <FormControlLabel control={<Switch defaultChecked={user.activated} color={"success"} onChange={(_, val) => { handleActivateUserSwitch(user.username, !val) }} />} label="IsActive" />
                    </Grid>
                </Grid>)
        });
    }

    const getToActivateList = () => {
        return getListBase(toActivate, (user: UserDto, index: number) => {
            return (
                <Grid justifyContent={"space-between"} alignItems={"center"} className={"settingsListItem" + (index == (toActivate.length - 1) ? "Last" : "")} key={user.username} container>
                    <Grid >
                        <div style={{ marginLeft: "20px", fontSize: "30px" }}>{user.username}</div>
                    </Grid>
                    <Grid >
                        <Button sx={{ mr: "20px" }} onClick={() => { handleActivateUserSwitch(user.username) }} color="error" variant='outlined'>Activate</Button>
                    </Grid>
                </Grid>)
        });
    }

    return (
        <>
            <Stack>
                <Stack style={{ padding: "20px" }}>
                    <h2 style={{ fontSize: "35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>Settings:</h2>
                    <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                        {isLoadingSettings ? <CircularProgress /> : getSettingsList()}
                    </Grid>
                </Stack>
                <Stack style={{ padding: "20px" }}>
                    <h2 style={{ fontSize: "35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>Server Controls:</h2>
                    <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                        {getControlsList()}
                    </Grid>
                </Stack>
                <Stack style={{ padding: "20px" }}>
                    <h2 style={{ fontSize: "35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>Time since last restart:</h2>
                    <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                        {isLoadingLastStart ? <CircularProgress /> : getLastRestartPaper()}
                    </Grid>
                </Stack>
                {toActivate?.length > 0 ?
                    <Stack style={{ padding: "20px" }}>
                        <h2 style={{ fontSize: "35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>User to activate:</h2>
                        <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                            {isLoadingToActivate ? <CircularProgress /> : getToActivateList()}
                        </Grid>
                    </Stack> : <></>}
                <Stack style={{ padding: "20px" }}>
                    <h2 style={{ fontSize: "35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>User:</h2>
                    <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                        {isLoadingAllUser ? <CircularProgress /> : getAllUserList()}
                    </Grid>
                </Stack>
            </Stack>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={lockPage}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}

export default AdminPanel;