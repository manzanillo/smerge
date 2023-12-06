import { useParams } from "react-router-dom";
import "./ProjectView.css"
import type { File } from "./Api.tsx"
import { useFiles } from "./Api.tsx"


import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';
import Cytoscape from "cytoscape";
import { EdgeDefinition, NodeDefinition } from "cytoscape";
import Fab from "@mui/material/Fab";
import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    CircularProgress,
    Color,
    Grid,
    Popover,
    PropTypes,
    Stack,
    SxProps,
    ThemeProvider,
    Tooltip,
    Typography,
    createTheme,
    Button, Modal
} from "@mui/material";
import MergeIcon from '@mui/icons-material/Merge';
import MenuIcon from "@mui/icons-material/Menu";
import { toast } from "react-toastify";
import httpService from './HttpService';
import { debounce } from "lodash";
import { green } from "@mui/material/colors";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import cxtmenu from 'cytoscape-cxtmenu';

import downloadIcon from './assets/download.png'
import colorIcon from './assets/color.png'
import editIcon from './assets/edit.png'

interface ProjectViewProps {
    projectId: string;
}

Cytoscape.use(dagre);

const ProjectView: React.FC<ProjectViewProps> = () => {
    const { projectId } = useParams();
    const projectName: string = "";
    const projectDescription: string = "";

    // const layout = {name: 'dagre'};

    const layout = {
        name: 'dagre',
        fit: true, // Whether to fit to viewport
        padding: 30, // Padding on fit
        spacingFactor: 1.2, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: true, // Whether labels should be included in determining the space used by a node
    };


    const { data, error, isLoading, refresh } = useFiles(String(projectId));
    if (error) console.log(error);
    // console.log(data?.toString());

    const nodes: NodeDefinition[] | undefined = data?.map((file: File) => {
        const nodeDefinition: NodeDefinition = { data: { id: file.id.toString(), label: file.description, file_url: file.file_url, color: file.color } };
        return nodeDefinition;
    });

    const edges: EdgeDefinition[] | undefined = data?.flatMap((file: File) => {
        return file.ancestors.map((ancestor: number) => {
            const edgeDefinition: EdgeDefinition = { data: { source: ancestor.toString(), target: file.id.toString() } };
            return edgeDefinition;
        });
    });



    /*const elements = [
       { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
       { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];*/

    const cyRef = React.useRef<Cytoscape.Core>();

    // const openUrlRef = React.useRef<string>();

    const openLock = React.useRef<boolean>(false);
    const openSnap = (url: string) => {
        if (!openLock.current) {
            window.open(url, "_blank");
            openLock.current = true;
            setTimeout(() => {
                openLock.current = false;
            }, 500)
        }
    }
    // const debouncedOpenSnap = debounce(openSnap, 250, { leading: false, trailing: true });

    let [modalOpen, setModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (cyRef.current) {
            const layout = cyRef.current.layout({ name: 'dagre' });
            layout.run();

            cyRef.current.on('dblclick', 'node', function (evt) {
                const node = evt.target;
                // console.log('dblclick', node.id());
                // console.log(node.data("file_url"));

                // Open a new tab with a set link
                openSnap(`https://snap.berkeley.edu/snap/snap.html#open:${httpService.baseURL}blockerXML/` + node.data("file_url").replace("/media/", ""));
            });
        }
    }, [cyRef, nodes]);

    // temp, stop more than two nodes to be selected
    // bug when selecting node, then force unselect and select again without clear first... can be ignored for now...
    // React.useEffect(() => {
    //     const cy = cyRef.current;
    //     if (cy) {
    //       cy.on('select', 'node', function (evt) {
    //         const selectedNodes = cy.$('node:selected');
    //         if (selectedNodes.length > 2) {
    //           // Unselect the last selected node
    //           selectedNodes[selectedNodes.length - 1].unselect();
    //         }
    //       });
    //     }
    //   }, [cyRef]);


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
  } as SxProps ;

    const hamburgerStyle = {
        position: 'absolute',
        top: 30,
        right: 30,
        zIndex: 9999,
        width: 50,
        height: 50,
        color: 'black',
    } as SxProps;

    const fabStyle = {
        position: 'absolute',
        borderRadius: '32px',
        bottom: 16,
        right: 16,
    } as SxProps;

    const [mergeFabColor, setMergeFabColor] = useState<"success" | "error" | "info" | "warning" | PropTypes.Color>("primary");
    const [mergeTooltip, setMergeTooltip] = useState<string>("New Merge");

    const handleMergeRightClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (mergeFabColor == "primary") {
            setMergeFabColor("warning");
            setMergeTooltip("Original Merge")
        } else {
            setMergeFabColor("primary");
            setMergeTooltip("New Merge")
        }
    }

    const handleMergePreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
    }

    const handleMergeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const selected = getSelectedNodes();
        if (selected?.length != 2) {
            toast.warning(`Please select two nodes for a merge.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
            });
            handleClose();
            return;
        }

        if (mergeFabColor == "primary") {
            mergeNew(selected);
        } else {
            mergeOld(selected);
        }
        handleClose();
    }

    const mergeNew = (selected) => {
        const url = `new_merge/${projectId}?file=${selected[0].id}&file=${selected[1].id}`;
        httpService.get(url, (req) => {
            console.log(req.response);
            refresh();
        }, (req) => {
            console.log(req)
        }, (req) => {
            // window.open(req.responseText, '_blank');
            openNewTab(req.responseText);
        }, true, false);
    }

    const [isTabOpen, setIsTabOpen] = React.useState(false);

    const openNewTab = (url: string) => {
        const newTab = window.open(url, '_blank');

        // Check if the tab is closed every second
        const intervalId = setInterval(() => {
            if (newTab?.closed) {
                setIsTabOpen(false);
                clearInterval(intervalId);
                refresh();
            }
        }, 200);

        setIsTabOpen(true);
    };

    const mergeOld = (selected) => {
        const url = `merge/${projectId}?file=${selected[0].id}&file=${selected[1].id}`;
        httpService.get(url, (req) => {
            console.log(req.response);
            refresh();
        }, (req) => {
            console.log(req)
        }, (req) => {
            window.open(req.responseText, '_blank');
        }, true, false);
    }

    const getSelectedNodes = () => {
        const cy = cyRef.current;
        const selectedNodes = cy?.$('node:selected');
        const selectedNodeData = selectedNodes?.map((node) => node.data());
        console.log(selectedNodeData);
        return selectedNodeData;
    };



    const [progress, setProgress] = React.useState(0);
    let timerId: NodeJS.Timeout | null = null;

    const handleMouseDown = (e: any) => {
        setProgress(0);
        timerId = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    clearInterval(timerId!);
                    console.log('Button pressed for 1 second');
                    //   handleMergeClick(e);
                    return 0;
                }
                return Math.min(oldProgress + 10, 100);
            });
        }, 200); // Increase progress every 100ms
    };

    const handleMouseUp = () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        setProgress(0); // Reset progress
    };



    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const lightTheme = createTheme({
        palette: {
            mode: 'light',
        },
    });


    useEffect(()=>{
        Cytoscape.use(cxtmenu);

        const menu = cyRef.current?.cxtmenu({
            menuRadius: 75, // the radius of the circular menu in pixels
            selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
            commands: [
              {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${downloadIcon}" alt="Download" />`, // html/text content to be displayed in the menu
                select: function(ele){
                    const element = document.createElement('a');
                    element.setAttribute('href', ele.data('file_url'));
                    element.setAttribute('download', ele.data('description'));

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                }
              },
              {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${editIcon}" alt="Edit" />`, // html/text content to be displayed in the menu
                select: function(ele){
                    console.log(ele.data());
                }
              },
              {
                fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                content: `<img src="${colorIcon}" alt="Edit" />`, // html/text content to be displayed in the menu
                select: function(ele){
                    const toggle_color_url = 'toggle_color/' + projectId + '/' + ele.id();
                    console.log(httpService.baseURL);
                    httpService.get(toggle_color_url, ()=>{refresh();}, (req)=> {console.log(`Url: '${toggle_color_url}' failed. \n ${req}`)}, ()=>{}, true, false)
                }
              }
            ],
            fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
            activeFillColor: '#076aab', // the colour used to indicate the selected command
            activePadding: 20, // additional size in pixels for the active command
            indicatorSize: 24, // the size in pixels of the pointer to the active command
            separatorWidth: 5, // the empty spacing in pixels between successive commands
            spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
            minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
            maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
            openMenuEvents: 'cxttapstart', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
            itemColor: 'white', // the colour of text in the command's content
            itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
            zIndex: 9999, // the z-index of the ui div
            atMouse: false // draw menu at mouse position
          });
    }, [])


    const cytoscapeStyle = `
        node {
            content: 'data(label)',
            textMarginX: 2,
            textOpacity: 0.5,
            textValign: 'center',
            textHalign: 'right',
            background-Color: 'data(color)',
        }
        edge {
        /* Your custom styles for edges */
        }
        /* More custom styles as needed */
    `;


    return (
        <>
            <CytoscapeComponent elements={CytoscapeComponent.normalizeElements({ nodes: nodes || [], edges: edges || [] })}
                layout={layout}
                stylesheet={[
                    {
                      selector: 'node',
                      style: {
                        content: 'data(label)',
                        "text-margin-x": 2,
                        "text-opacity": 0.8,
                        "text-valign": 'center',
                        "text-halign": 'right',
                        "background-color": 'data(color)',
                      }
                    },
                    {
                      selector: 'edge',
                      style: {
                        "curve-style": 'bezier',
                        width: 4,
                        "target-arrow-shape": 'triangle',
                        "line-color": '#808080',
                        "target-arrow-color": '#808080',
                      }
                    },
                    {
                        selector: 'node:selected', // Define style for selected nodes
                        style: {
                          'background-color': '#C39EC1', // Change the background color to pink for selected nodes
                        },
                      },
                  ]}
                style={{
                    width: '100%', height: '100%', position: 'absolute',
                    background: 'white',
                    left: '0',
                    top: '0',
                    zIndex: '999'
                }}
                cy={(cy) => { cyRef.current = cy; }} />

            <h1 className="project-heading" data-proj-id={projectId}>
                {projectName}
                <br />
                <div className="project-description"> {projectDescription}</div>
            </h1>


            <ThemeProvider theme={lightTheme}>

                <Modal open={ modalOpen}  sx={ modalStyle}>
                    <Box>
                        <Button onClick={()=>{window.open( `${httpService.baseURL}${projectId}`,"_self");}} style={ {color: "black", backgroundColor: "white"}}>Old ProjectView</Button>
                    </Box>
                </Modal>
                <MenuIcon onClick={ ()=> {
                    setModalOpen(true);
                }
                } sx={hamburgerStyle}/>

                <Box sx={fabStyle}>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}

                        anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'left',
                        }}
                        elevation={8}
                        transformOrigin={{
                            vertical: 'center',
                            horizontal: 'right',
                        }}
                        slotProps={{
                            paper: { style: { backgroundColor: 'transparent', borderRadius:"32px" } },
                        }}
                    >
                        <Stack direction="row" spacing={1} padding={"5px"}>
                            <Tooltip title={"Cancel"}>
                                <Fab sx={{ p: "5px" }} size="large" color="error" aria-label="remove" onClick={handleClose}>
                                    <CloseIcon />
                                </Fab>
                            </Tooltip>
                            <Tooltip title={"Confirm"}>
                                <Fab sx={{ p: "5px" }} size="large" color="success" aria-label="add" onClick={handleMergeClick}>
                                    <CheckIcon />
                                </Fab>
                            </Tooltip>
                        </Stack>
                    </Popover>



                    <Tooltip title={mergeTooltip}>
                        <Fab sx={fabStyle} size="large" color={mergeFabColor} aria-label="add" onContextMenu={handleMergeRightClick} onClick={handleMergePreClick}>
                            <MergeIcon />
                        </Fab>
                    </Tooltip>
                </Box>
            </ThemeProvider>
        </>
    )
}

export default ProjectView


// <div id="drop-zone">
//     <div id="drop-info">
//         <p className="info-message">{"Drop here!"}</p> {/*todo translate "Drop here!"*/}
//     </div>
//     <div id="cy" style={{zIndex: '400'}}></div>
// </div>
// <div className="fixed-action-btn" style={{zIndex: '9999'}}>
//     <a id="cancel-merge" title="cancel merge"
//         className="btn-floating waves-effect waves-light btn-large red hide"> {/*todo translate "cancel merge"*/}
//         <i className="large material-icons">close</i>
//     </a>

//     <a id="merge" title="merge"
//         className="btn-floating waves-effect waves-light btn-large"> {/*todo translate "merge"*/}
//         <i className="large material-icons">call_merge</i>
//     </a>
//     <ul>
//         <li><a id="new-merge" className="btn-floating blue"><i className="material-icons">fiber_new</i></a>
//         </li>
//     </ul>
// </div>