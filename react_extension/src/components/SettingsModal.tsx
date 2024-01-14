import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Stack, SxProps, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import httpService from "../services/HttpService";
import { useState } from "react";
import "./SettingsModal.css";

interface SettingsModalProps {
    projectId: string;
    changeLayout: (layoutName: string)=>void;
    initLayout?: string;
    cy: React.MutableRefObject<cytoscape.Core | undefined>;
    saveGraphPositions: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({projectId, changeLayout, initLayout="preset", cy, saveGraphPositions}) => {
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
        p: 4
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

    const [lay, setLay] = useState(initLayout);

    const layoutNames = ["null", "dagre", "preset", "random", "grid", "circle", "concentric", "breadthfirst", "cose"]


    const handlePositionFileDownload = () => {
        const json = cy.current?.json();

        // Convert the JSON object to a string
        const jsonString = JSON.stringify(json);

        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], {type: "application/json"});

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a link element
        const a = document.createElement('a');

        // Set the href and download attributes of the link
        a.href = url;
        a.download = projectId + '_layout_saved.json';

        // Append the link to the body
        document.body.appendChild(a);

        // Simulate a click on the link
        a.click();

        // Remove the link from the body
        document.body.removeChild(a);
    }

    const handlePositionFileUpload = () => {
        // Create an input element
        const input = document.createElement('input');

        // Set the type attribute to 'file'
        input.type = 'file';
        input.accept = 'application/JSON';

        // Set the onchange attribute to read the file when it's selected
        input.onchange = function() {
            // Create a new FileReader
            const reader = new FileReader();

            // Set the onload attribute to parse the JSON and restore the graph when the file is read
            reader.onload = function() {
                // Parse the JSON
                const json = JSON.parse(reader.result);

                cy.current?.elements().remove();

                // Restore the graph
                cy.current?.json(json);
            };

            // Read the file as text
            reader.readAsText(input.files[0]);
        };

        // Simulate a click on the input
        input.click();
    }

    return (<>
        <Modal open={modalOpen} onClose={handleModalClose} style={{border:'none'}}>
            <Box sx={modalStyle} id={"settingsModal"}>
                <Stack spacing={2}>
                    <Tooltip enterDelay={500} title={"Save the current layout on the server (as preset layout)"}>
                        <Button variant="contained" onClick={saveGraphPositions}>Save Graph Position</Button>
                    </Tooltip>

                    <Divider></Divider>

                    <Tooltip enterDelay={500} title={"Download the current graph, as is into a json file"}>
                        <Button variant="contained" onClick={handlePositionFileDownload}>Save Current Layout {"(in file)"}</Button>
                    </Tooltip>
                    <Tooltip enterDelay={500} title={"Load previous saved graph (.json) into current panel (hit 'Save Graph Position' if the graph should be saved to the server)"}>
                        <Button variant="contained" onClick={handlePositionFileUpload}>Load Layout From File</Button>
                    </Tooltip>
                    
                    <Divider></Divider>

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
                        </Select>
                    </FormControl>
                    </Box>
                    
                    <Divider></Divider>

                    <Button variant="contained" onClick={() => {
                        window.open(`${httpService.baseURL}${projectId}`, "_self");
                    }}>Old ProjectView</Button>
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