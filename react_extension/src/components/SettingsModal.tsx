import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Stack, SxProps } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import httpService from "../services/HttpService";
import { useState } from "react";

interface SettingsModalProps {
    projectId: string;
    changeLayout: (layoutName: string)=>void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({projectId, changeLayout}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const handleModalClose = () => {
        console.log("close Modal");
        setModalOpen(false);
    }

    const modalStyle = {

        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    } as SxProps;

    const hamburgerStyle = {
        position: 'absolute',
        top: 30,
        right: 30,
        zIndex: 9999,
        width: 50,
        height: 50,
        color: 'black',
    } as SxProps;


    // const centerRoot = () => {
    //     //get root nodes cytoscape
    //     cyRef?.current?.nodes().roots().forEach((root) => positionMutate({id: toNumber(root.id()), position: null}));
    // }

    

    const handleChange = (event: SelectChangeEvent) => {
        setLay(event.target.value as string);
        changeLayout(event.target.value as string);
        console.log(event.target.value)
    };

    const [lay, setLay] = useState("preset");

    const layoutNames = ["null", "dagre", "preset", "random", "grid", "circle", "concentric", "breadthfirst", "cose"]

    return (<>
        <Modal open={modalOpen} onClose={handleModalClose}>
            <Box sx={modalStyle}>
                <Stack spacing={2}>
                    <Button variant="contained" onClick={() => {
                        window.open(`${httpService.baseURL}${projectId}`, "_self");
                    }}>Old ProjectView</Button>

                    {/* <Button variant="contained" onClick={resetLayout}>Reset Project Layout</Button> */}

                    {/* <Button variant="contained" onClick={centerRoot}>Center Root</Button> */}
                    <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth>
                        <InputLabel id="layout-select-label">Layout</InputLabel>
                        <Select
                        labelId="layout-select-label"
                        id="layout-select"
                        value={lay}
                        label="Layout"
                        onChange={handleChange}
                        >
                        {layoutNames.map((name) => (<MenuItem key={name} value={name}>{name}</MenuItem>))}
                        {/* <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem> */}
                        </Select>
                    </FormControl>
                    </Box>
                </Stack>
            </Box>
        </Modal>
        <MenuIcon onClick={() => {
            setModalOpen(true);
        }
        } sx={hamburgerStyle} />
    </>
    )
}

export default SettingsModal;