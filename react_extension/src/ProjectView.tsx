import {useParams} from "react-router-dom";
import "./ProjectView.css"

import React from 'react';
import ReactDOM from 'react-dom';
import CytoscapeComponent from 'react-cytoscapejs';

interface ProjectViewProps {
    projectId: string;
}

const ProjectView: React.FC<ProjectViewProps> = () => {
    const {projectId} = useParams();
    const projectName: string = "";
    const projectDescription: string = "";

    const elements = [
       { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
       { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];
    return (
        <>

            <CytoscapeComponent elements={elements} style={ { width: '600px', height: '600px' } } />

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