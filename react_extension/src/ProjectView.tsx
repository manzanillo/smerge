import { useCallback, useEffect, useState } from "react";

import "./components/NodeGraph/NodeGraph";
import NodeGraph from "./components/NodeGraph/NodeGraph";
import { getProjectData } from "./services/ProjectService";
import { useParams } from "react-router-dom";
import ProjectDto from "./components/models/ProjectDto";
import HelpDisplay from "./components/HelpMenu/HelpDisplay";
import UploadZone from "./components/UploadZone";
import useFileHover from "./shared/useFileHover";

const ProjectView: React.FC = () => {
  const { projectId } = useParams();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [projectData, setProjectData] = useState<ProjectDto>(null);

  const gatherProjectData = useCallback(async () => {
    const res = await getProjectData(projectId ?? "");
    if (res) {
      setProjectData(res);
    }
  }, [projectId]);

  useEffect(() => {
    gatherProjectData();
  }, [gatherProjectData, projectId]);

  const [modalOpen, setModalOpen] = useState(false);

  const isFileHovered = useFileHover();

  useEffect(() => {
    setModalOpen(isFileHovered);
    console.log("Changed file hover");
  }, [isFileHovered]);

  return (
    <>
      <NodeGraph
        projectData={projectData}
        setProjectData={setProjectData}
        gatherProjectData={gatherProjectData}
      />
      <UploadZone
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        projectId={projectId}
      />
      <HelpDisplay></HelpDisplay>
    </>
  );
};

export default ProjectView;
