import {useParams} from "react-router-dom";
import "./ProjectView.css"
import type {File} from "./Api.tsx"
import {useFiles} from "./Api.tsx"


import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';
import Cytoscape from "cytoscape";
import {EdgeDefinition, NodeDefinition} from "cytoscape";

interface ProjectViewProps {
    projectId: string;
}

Cytoscape.use(dagre);

const ProjectView: React.FC<ProjectViewProps> = () => {
    const {projectId} = useParams();
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
    

    const {error, data} = useFiles(String(projectId));
    if (error) console.log(error);
    console.log(data?.toString());

    const nodes: NodeDefinition[] | undefined = data?.map((file: File) => {
        const nodeDefinition: NodeDefinition = {data: {id: file.id.toString(), label: file.description, file_url: file.file_url}};
        return nodeDefinition;
    });

    const edges: EdgeDefinition[] | undefined = data?.flatMap((file: File) => {
        return file.ancestors.map((ancestor: number) => {
            const edgeDefinition: EdgeDefinition = {data: {source: ancestor.toString(), target: file.id.toString()}};
            return edgeDefinition;
        });
    });


    const nodeStyle = {
        content: 'data(description)',
        textMarginX: 2,
        textOpacity: 0.5,
        textValign: 'center',
        textHalign: 'right',
        backgroundColor: 'data(color)',
    };

    const edgeStyle = {
        curveStyle: 'bezier',
        width: 4,
        targetArrowShape: 'triangle',
        lineColor: '#808080',
        targetArrowColor: '#808080',
    };

    const selectedStyle = {
        backgroundColor: '#C39EC1',
    };

    const styles = {
        node: nodeStyle,
        edge: edgeStyle,
        selected: selectedStyle,

    }

    /*const elements = [
       { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
       { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];*/

    const cyRef = React.useRef<Cytoscape.Core>();

    React.useEffect(() => {
        if (cyRef.current) {
            const layout = cyRef.current.layout({name: 'dagre'});
            layout.run();

            cyRef.current.on('dblclick', 'node', function(evt){
                const node = evt.target;
                // console.log('dblclick', node.id());
                // console.log(node.data("file_url"));
    
                // Open a new tab with a set link
                const currentBaseUrl = window.location.href.split("ext")[0]
                window.open(`https://snap.berkeley.edu/snap/snap.html#open:${currentBaseUrl}blockerXML/` + node.data("file_url").replace("/media/", ""), '_blank');
            });
        }
    }, [cyRef, nodes]);


    return (
        <>
            <CytoscapeComponent elements={CytoscapeComponent.normalizeElements({nodes: nodes || [], edges: edges || []})}
                                layout={layout}
                                style={{
                                    width: '100%', height: '100%', position: 'absolute',
                                    background: 'white',
                                    left: '0',
                                    top: '0',
                                    zIndex: '999'
                                }}
                                cy={(cy) => { cyRef.current = cy; }}/>

            <h1 className="project-heading" data-proj-id={projectId}>
                {projectName}
                <br/>
                <div className="project-description"> {projectDescription}</div>
            </h1>
            <div id="drop-zone">
                <div id="drop-info">
                    <p className="info-message">{"Drop here!"}</p> {/*todo translate "Drop here!"*/}
                </div>
                <div id="cy" style={{zIndex: '400'}}></div>
            </div>
            <div className="fixed-action-btn" style={{zIndex: '9999'}}>
                <a id="cancel-merge" title="cancel merge"
                   className="btn-floating waves-effect waves-light btn-large red hide"> {/*todo translate "cancel merge"*/}
                    <i className="large material-icons">close</i>
                </a>

                <a id="merge" title="merge"
                   className="btn-floating waves-effect waves-light btn-large"> {/*todo translate "merge"*/}
                    <i className="large material-icons">call_merge</i>
                </a>
                <ul>
                    <li><a id="new-merge" className="btn-floating blue"><i className="material-icons">fiber_new</i></a>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default ProjectView