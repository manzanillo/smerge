// import { useParams } from "react-router-dom";
import { Component, useEffect, useState } from "react";
// import CytoscapeComponent from 'react-cytoscapejs'

import "./components/NodeGraph/NodeGraph";
import NodeGraph from "./components/NodeGraph/NodeGraph";
import { getProjectData } from "./services/ProjectService";
import { useParams } from "react-router-dom";
import ProjectDto from "./components/models/ProjectDto";
import HelpDisplay from "./components/HelpMenu/HelpDisplay";

const ProjectView: React.FC = () => {
  const { projectId } = useParams();

  const [projectData, setProjectData] = useState<ProjectDto>(null);

  useEffect(() => {
    console.log("Project data changed");
  }, [projectData]);

  useEffect(() => {
    const gatherData = async () => {
      const res = await getProjectData(projectId ?? "");
      if (res) {
        setProjectData(res);
      }
    };

    gatherData();
  }, [projectId]);

  return (
    // const elements = [
    //    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    //    { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
    //    { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    // ];

    // return <CytoscapeComponent elements={elements} style={ { width: '100%', height: '100%' } } />;
    <>
      <NodeGraph projectData={projectData} setProjectData={setProjectData} />
      <HelpDisplay></HelpDisplay>
    </>
  );
};

export default ProjectView;
