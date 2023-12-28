import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';
import Cytoscape, { EdgeDefinition, NodeDefinition } from "cytoscape";
import { useParams } from 'react-router-dom';
import { File, useFiles, useUpdateNodePosition } from '../services/ApiService';
import useEffectInit from '../shared/useEffectInit';
import pushService from '../services/PushService';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircularProgress, Fab } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import { debounce, toNumber } from "lodash";
import { useQueryClient } from '@tanstack/react-query';
import SettingsModal from './SettingsModal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// interface NodeGraphProps {
//     projectId: string;
// }

Cytoscape.use(dagre);

const NodeGraph: React.FC = () => {
    const { projectId } = useParams();
    const queryClient = useQueryClient();

    const cy = useRef<Cytoscape.Core>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mutate: positionMutate } = useUpdateNodePosition(projectId ?? "", queryClient);

    const lastPositionUpdate = useRef(Date.now());

    const [layout, setLayout] = useState({
        // name: 'dagre',
        name: 'preset',
        animate: true,
        // fit: true, // Whether to fit to viewport
        padding: 30, // Padding on fit
        spacingFactor: 1.2, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: true, // Whether labels should be included in determining the space used by a node
    });



    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error, isLoading, refresh } = useFiles(String(projectId));
    if (error) console.log(error);
    // console.log(data?.toString());

    const nodes: NodeDefinition[] | undefined = data?.map((file: File) => {
        const nodeDefinition: NodeDefinition = {
            data: {
                id: file.id.toString(),
                label: file.description,
                file_url: file.file_url,
                color: file.color,
                position: !file.xPosition || !file.yPosition ? undefined : { x: file.xPosition, y: file.yPosition }
            },
            position: !file.xPosition || !file.yPosition ? undefined : { x: file.xPosition, y: file.yPosition }
        };
        return nodeDefinition;
    });

    const edges: EdgeDefinition[] | undefined = data?.flatMap((file: File) => {
        return file.ancestors.map((ancestor: number) => {
            const edgeDefinition: EdgeDefinition = { data: { source: ancestor.toString(), target: file.id.toString() } };
            return edgeDefinition;
        });
    });

    const [elements, setElements] = useState([...nodes??[], ...edges??[]]);

    

    const firstSet = useRef<boolean>(false);
    const rerender = useCallback(() => {
        if (cy.current) {
            const oldZoom = cy.current.zoom();
            const oldPan = cy.current.pan();
            console.log("Current Layout is: ", layout)
            const lay = cy.current.layout(layout);
            lay.run();
            if (firstSet.current) {
                console.log("resetting zoom and pan")
                cy.current.zoom(oldZoom);
                cy.current.pan(oldPan);
            } else {
                // with timeout to enable init loading...
                setTimeout(() => {
                    console.log("timeout");
                    cy.current?.fit();
                    cy.current?.center();

                    setTimeout(() => {
                        firstSet.current = true;
                    }, 50);
                }, 50);
            }
        }
    }, [layout]);

    
    const ranFirstAgain = useRef(false)
    useEffect(() => {
        if (cy.current && !isLoading) {
            // rerender();

            // if (layout.name == 'null') {
            //     nodes?.forEach((node) => {
            //         if (node.data.id && node.data.position) {
            //             cy.current?.getElementById(node.data.id)?.position(node.data.position);
            //         }
            //     });
            // }
            setElements([...nodes??[], ...edges??[]]);

            console.log("hallo")


            cy.current?.on('dblclick', 'node', function (evt) {
                const node = evt.target;
                console.log(node.position());

                // Open a new tab with a set link
                // openSnap(`https://snap.berkeley.edu/snap/snap.html#open:${httpService.baseURL}blockerXML/` + node.data("file_url").replace("/media/", ""));
            });

            cy.current?.on("dragfree", "node", (evt) => {
                console.log("mutate");
                positionMutate({ id: toNumber(evt.target.data().id), position: evt.target.position() });
                lastPositionUpdate.current = Date.now();
            });
            
            if(!ranFirstAgain.current) {
                setTimeout(() => {
                    console.log("center oder so")
    
                    cy.current?.fit();
                    cy.current?.center();
                }, 1);

                ranFirstAgain.current = true;
            }

            return () => {
                console.log("removeListener")
                cy.current?.removeListener('dblclick', 'node');
                cy.current?.removeListener("dragfree", "node");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        // rerender();
        // setTimeout(() => {
        //     cy.current?.fit();
        //     cy.current?.center();
        // }, 10);
        
        
        // console.log("Rerender done!")
    }, [layout, rerender]);


    // compares if two position objects are the same to some degree of error
    // const comparePosition = (origPos: cytoscape.Position, newPos: cytoscape.Position, error: number = 0.0) => {
    //     const diff = Math.abs(origPos.x - newPos.x) + Math.abs(origPos.y - newPos.y)
    //     console.log(diff);
    //     return diff <= error;
    // }

    // // debounce position update and cancel on double click
    // const debouncedPositionMutate = debounce((evt) => {
    //     positionMutate({ id: toNumber(evt.target.data().id), position: evt.target.position() });
    // }, 200);

    // useEffect(() => {
    //     if (cy.current) {
    //         // cy.current.on("mouseup", "node", (evt) => {
    //         //     if (evt.target.data() && evt.target.position) {
    //         //         console.log(evt.target.data())
    //         //         console.log(evt.target.position())
    //         //         console.log(evt.target)

    //         //         const previousValue: File[] | undefined = queryClient.getQueryData(['files' , projectId]);
    //         //         console.log("prev:");
    //         //         console.log(previousValue);


    //         //         // if(comparePosition(evt.target.data().position, evt.target.position())){
    //         //             debouncedPositionMutate(evt);
    //         //             //positionMutate({id: toNumber(evt.target.data().id), position: evt.target.position()});

    //         //             lastPositionUpdate.current = Date.now();
    //         //         // } else {
    //         //         //     console.log("same")
    //         //         // }

    //         //     }
    //         // });
            
    //         cy.current.on("dragfree", "node", (evt) => {
    //             console.log("mutate");
    //             positionMutate({ id: toNumber(evt.target.data().id), position: evt.target.position() });
    //             lastPositionUpdate.current = Date.now();
    //         });
    //     }

    //     return () => {
    //         if (cy.current) cy.current.removeListener("dragfree", "node");
    //     }
    // }, [positionMutate]);


    const getSelectedNodes = () => {
        const selectedNodes = cy.current?.$('node:selected');
        const selectedNodeData = selectedNodes?.map((node: { data: () => unknown; }) => node.data());
        return selectedNodeData;
    };


    useEffectInit(() => {
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            pushService.open(projectId ?? "empty", (_) => {
                // prevent refresh for own position change within 300ms
                if (Date.now() - lastPositionUpdate.current > 300) {
                    // rerender();
                    refresh();
                }
            });

        }, 100);

        // setTimeout(() => {
        //     console.log("center oder so")
        //     cy.current?.fit();
        //     cy.current?.center();
        // }, 500);

        return () => {
            pushService.close(projectId ?? "empty")
        }
    }, [])

    // function getRandomInt(max: number, min: number = 0) {
    //     return Math.floor(Math.random() * (max - Math.floor(min))) + Math.floor(min);
    // }

    const pushLayoutClick = () => {
        console.log(getSelectedNodes());


        // const previousValue: File[] | undefined = queryClient.getQueryData(['files' , projectId]);
        // // console.log(previousValue);

        // // // set the cached data with an added object
        // // // i.e the new planet posted
        // if (previousValue){
        //     queryClient.setQueryData(
        //         ['files' , projectId],
        //         previousValue.map((file) => {
        //             file.xPosition = getRandomInt(100, -100);
        //             file.yPosition = getRandomInt(100, -100);
        //             return file;
        //         })
        //     );
        // }

        // cy.current?.center();
    }

    // const [layoutName, setLayoutName] = useState("null");
    // const layoutName = useRef<string>("null");

    const changeLayout = (layoutName: string) => {
        console.log("Changing name to: ", layoutName)
        setLayout((l) => { return { ...l, name: layoutName } });
        if(layoutName == "preset") {
            window.location.reload();
            // console.log("Refresh")
            // refresh();
        } 
        

        // setTimeout(() => {
        //     cy.current?.fit();
        //     cy.current?.center();
        //     rerender();
        // }, 100)
    }

    return (
        <>
            <CytoscapeComponent
                elements={elements}
                minZoom={0.5}
                maxZoom={10}
                layout={layout}
                autounselectify={false}
                boxSelectionEnabled={true}
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
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    background: 'white',
                    zIndex: '800'
                }}

                cy={(inp) => {
                    cy.current = inp;
                }} />
            

            <Fab sx={{ p: "5px" }} size="large" color="success" aria-label="add" onClick={pushLayoutClick}>
                <PublishIcon />
            </Fab>
            <SettingsModal projectId={projectId ?? ""} changeLayout={changeLayout} />
        </>
    )
}

export default NodeGraph