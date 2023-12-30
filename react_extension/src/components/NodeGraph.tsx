import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';
import Cytoscape, {EdgeDefinition, NodeDefinition} from "cytoscape";
import {useParams} from 'react-router-dom';
import {File, useFiles, useUpdateNodePosition, useUpdateNodePositions} from '../services/ApiService';
import useEffectInit from '../shared/useEffectInit';
import pushService from '../services/PushService';
import React, {useEffect, useRef, useState} from 'react';
import {Fab} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import {toNumber} from "lodash";
import {useQueryClient} from '@tanstack/react-query';
import SettingsModal from './SettingsModal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NodeGraphProps {
    projectId: string;
}

Cytoscape.use(dagre);

const NodeGraph: React.FC<NodeGraphProps> = () => {
    const {projectId} = useParams();
    const queryClient = useQueryClient();

    const cy = useRef<Cytoscape.Core>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {mutate: positionMutate} = useUpdateNodePosition(projectId ?? "", queryClient);

    const {mutate: positionsMutate} = useUpdateNodePositions();

    const lastPositionUpdate = useRef(Date.now());

    const savedLayoutKey = "savedLayout";
    const savedLayout : string = (()=>{
        const ret = localStorage.getItem(savedLayoutKey)
        return ret ?? 'preset';
    })();

    const [layout, setLayout] = useState({
        // name: 'dagre',
        name: 'preset',
        animate: true,
        // fit: true, // Whether to fit to viewport
        padding: 30, // Padding on fit
        spacingFactor: 1.2, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: true, // Whether labels should be included in determining the space used by a node
    });


    const {data, error, isLoading, refresh} = useFiles(String(projectId));
    if (error) console.log(error);

    const nodes: NodeDefinition[] | undefined = data?.map((file: File) => {
        const nodeDefinition: NodeDefinition = {
            data: {
                id: file.id.toString(),
                label: file.description,
                file_url: file.file_url,
                color: file.color,
                position: !file.xPosition || !file.yPosition ? undefined : {x: file.xPosition, y: file.yPosition}
            },
            position: !file.xPosition || !file.yPosition ? undefined : {x: file.xPosition, y: file.yPosition}
        };
        return nodeDefinition;
    });

    const edges: EdgeDefinition[] | undefined = data?.flatMap((file: File) => {
        return file.ancestors.map((ancestor: number) => {
            const edgeDefinition: EdgeDefinition = {data: {source: ancestor.toString(), target: file.id.toString()}};
            return edgeDefinition;
        });
    });

    const [elements, setElements] = useState([...nodes ?? [], ...edges ?? []]);


    const ranFirstAgain = useRef(false)
    useEffect(() => {
        if (cy.current && !isLoading) {
            setElements([...nodes ?? [], ...edges ?? []]);

            cy.current?.on('dblclick', 'node', function (evt) {
                const node = evt.target;
                console.log(node.position());

                // Open a new tab with a set link
                // openSnap(`https://snap.berkeley.edu/snap/snap.html#open:${httpService.baseURL}blockerXML/` + node.data("file_url").replace("/media/", ""));
            });

            cy.current?.on("dragfree", "node", (evt) => {
                if(layout.name !== "preset") return;

                positionMutate({id: toNumber(evt.target.data().id), position: evt.target.position()});
                lastPositionUpdate.current = Date.now();
            });

            if (!ranFirstAgain.current) {
                setTimeout(() => {
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
    }, [data, layout]);


    const getSelectedNodes = () => {
        const selectedNodes = cy.current?.$('node:selected');
        const selectedNodeData = selectedNodes?.map((node: { data: () => unknown; }) => node.data());
        return selectedNodeData;
    };

    // const loadPreset = () => {
        
    //     console.log(savedLayout);
    //     if(savedLayout){
    //         setLayout((l) => {
    //             return {...l, name: savedLayout}
    //         });
    //     }
    // }

    useEffectInit(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pushService.open(projectId ?? "empty", (e) => {
            // prevent refresh for own position change within 300ms
            console.log(e.text);
            if (Date.now() - lastPositionUpdate.current > 300) {
                refresh();
            }
        });

        // change layout after loading to saved if available
        if(savedLayout != 'preset'){
            setTimeout(() => {
                console.log("change layout")
                changeLayout(savedLayout);
            }, 100);
        }
        // loadPreset();

        return () => {
            pushService.close(projectId ?? "empty")
        }
    }, [])


    const saveGraphPositions = () => {
        console.log(getSelectedNodes());
        if (nodes && cy.current) {
            positionsMutate(cy.current.nodes().map((node) => {
                return {id: toNumber(node.data().id), position: node?.position() ?? {x: 0, y: 0}};
            }));
        }
    }


    const changeLayout = (layoutName: string) => {
        // save selected layout in storage for next loading
        localStorage.setItem(savedLayoutKey, layoutName);

        if (layoutName == "preset") {
            refresh();
            setLayout((l) => {
                return {...l, name: "preset"}
            });
            if (cy.current) {
                nodes?.forEach((node) => {
                    if (node.data.id && node.data.position) {
                        cy.current?.getElementById(node.data.id)?.position(node.data.position);
                    }
                });
            }
        } else {
            setLayout((l) => {
                return {...l, name: layoutName};
            });
        }
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
                }}/>


            <Fab sx={{p: "5px"}} size="large" color="success" aria-label="add" onClick={saveGraphPositions}>
                <PublishIcon/>
            </Fab>
            <SettingsModal projectId={projectId ?? ""} changeLayout={changeLayout} initLayout={savedLayout}/>
        </>
    )
}

export default NodeGraph