import { Button, CircularProgress, Grid, List, ListItemText, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { getActives, getLockIp, getLockUsername, UnlockedIpDto} from "../services/AdminService";
import "./AdminPanel.css"
// import { toast } from "react-toastify";
// import { debounce } from "lodash";

interface ActiveIpsPanelProps {
}

const ActiveIpsPanel: React.FC<ActiveIpsPanelProps> = () => {
    const [actives, setActives] = useState<UnlockedIpDto[]>([]);
    const [isLoadingActives, setIsLoadingActives] = useState<boolean>(true);

    const gatherActives = async () => {
        const res = await getActives();
        if (res) {
            setIsLoadingActives(false);
            setActives(res)
        }
    }

    useEffect(() => {
        gatherActives();
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getListBase = (list: any[], generator: (elem: any, index: number) => any) => {
        return (
            <List>
                {list.map(generator)}
            </List>
        )
    }


    // const debouncedUpdateSetting = useRef(
    //     debounce(async (setting: UnlockedIpDto) => {
    //         updateSetting(setting);
    //     }, 300)
    // ).current;

    // useEffect(() => {
    //     return () => {
    //         debouncedUpdateSetting.cancel();
    //     };
    // }, [debouncedUpdateSetting]);

    // const updateSetting = async (setting: UnlockedIpDto) => {
    //     const ret = await postUpdateSetting(setting);
    //     if (ret.status) {
    //         toast.success(`'${setting.name}' ${ret.text}`, {
    //             position: 'top-right',
    //             autoClose: 2000,
    //             hideProgressBar: false,
    //         });
    //     } else {
    //         toast.error(`'${setting.name}' ${ret.text}`, {
    //             position: 'top-right',
    //             autoClose: 2000,
    //             hideProgressBar: false,
    //         });
    //     }
    // }

    const handleLockIp = async (act: UnlockedIpDto, lockIp: boolean) => {
        if(lockIp){
            await getLockIp(act.ip_address);
        } else {
            await getLockUsername(act.username);
        }
        setIsLoadingActives(true);
        gatherActives();
    }


    const getSettingsList = () => {
        return getListBase(actives, (act: UnlockedIpDto, index: number) => {
            return (
                <Stack className={"settingsListItem" + (index == (actives.length - 1) ? "Last" : "")} key={act.username} direction={"row"}>
                    <ListItemText primary={"IP: " + act.ip_address + ` | Username: ${act.username}`} secondary={"Expires on: " + new Date(act.expire_date).toString().split(' ').slice(0, 6).join(' ') ?? ""} />

                    <Button sx={{ mr: "20px" }} onClick={() => { handleLockIp(act, true);}} color="error" variant='outlined'>Lock IP</Button>
                    <Button sx={{ mr: "20px" }} onClick={() => { handleLockIp(act, false);}} color="error" variant='outlined'>Lock User</Button>
                </Stack>)
        });
    }

    return (
        <>
            <Stack>
                <Stack style={{ padding: "20px" }}>
                    <h2 style={{ fontSize: "35px", paddingLeft: "10px", marginBottom: "5px", textDecorationLine: "underline" }}>Active ips:</h2>
                    <Grid className="settingGridName" justifyContent={"center"} justifyItems={"center"}>
                    {(actives.length == 0 && !isLoadingActives)?<h1>Wow such empty!</h1>:
                        (isLoadingActives ? <CircularProgress /> : getSettingsList())
                    }
                    </Grid>
                </Stack>
            </Stack>
        </>
    )
}

export default ActiveIpsPanel;