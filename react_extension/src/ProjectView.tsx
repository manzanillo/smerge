import React, { useCallback, useEffect, useState } from "react";

import "./components/NodeGraph/NodeGraph";
import NodeGraph from "./components/NodeGraph/NodeGraph";
import { getProjectData } from "./services/ProjectService";
import { useParams } from "react-router-dom";
import ProjectDto from "./components/models/ProjectDto";
import HelpDisplay from "./components/HelpMenu/HelpDisplay";
import UploadZone from "./components/UploadZone";
import useFileHover from "./shared/useFileHover";

interface ProjectViewProps {
  projectId?: string;
  fileId?: number;
  // Interceptors für Tutorial:
  embedded?: boolean;
  onNodeDoubleClick?: (nodeId: string) => void;
  onSelectedNodesChange?: (nodeIds: string[]) => void;
  onMergeConfirmed?: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({
  projectId: propProjectId,
  fileId: propFileId,
  embedded = false,
  onNodeDoubleClick,
  onSelectedNodesChange,
  onMergeConfirmed,
}) => {
  const { projectId: paramProjectId } = useParams();
  // Tutorial nutzt props statt param um die id zu übergeben.
  const resolvedProjectId = propProjectId || paramProjectId;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [projectData, setProjectData] = useState<ProjectDto>(null);

  const gatherProjectData = useCallback(async () => {
    if (!resolvedProjectId) {
      return;
    }
    const res = await getProjectData(resolvedProjectId);
    if (res) {
      setProjectData(res);
    }
  }, [resolvedProjectId]);

  useEffect(() => {
    gatherProjectData();
  }, [gatherProjectData, resolvedProjectId]);

  const [modalOpen, setModalOpen] = useState(false);

  const isFileHovered = useFileHover();

  useEffect(() => {
    setModalOpen(isFileHovered);
  }, [isFileHovered]);

  return (
    <>
      <NodeGraph
        projectData={projectData}
        setProjectData={setProjectData}
        gatherProjectData={gatherProjectData}
        projectId={resolvedProjectId}
        embedded={embedded}
        onNodeDoubleClick={onNodeDoubleClick}
        onSelectedNodesChange={onSelectedNodesChange}
        onMergeConfirmed={onMergeConfirmed}
      />
      {!embedded && (
        <>
          <UploadZone
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            projectId={resolvedProjectId}
          />
          <HelpDisplay></HelpDisplay>
        </>
      )}
    </>
  );
};

export default ProjectView;
