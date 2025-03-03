import { Stack } from "@mui/material";
import ProjectDto from "./models/ProjectDto";
import CColorPicker from "./shared/CColorPicker";
import { useCallback, useRef, useState } from "react";
import { debounce } from "lodash";
import { putColorChange } from "../services/ProjectService";
import { useTranslation } from "react-i18next";

interface ProjectColorMenuProps {
  projectDto: ProjectDto;
  reloadData: () => void;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDto>>;
}

const ProjectColorMenu: React.FC<ProjectColorMenuProps> = ({
  projectDto,
  reloadData,
  setProjectData,
}) => {
  const [nodeColor, setNodeColor] = useState(projectDto.default_color);
  const nodeRef = useRef(nodeColor);
  const [favorColor, setFavorColor] = useState(projectDto.favor_color);
  const nodeFavorRef = useRef(favorColor);
  const [conflictColor, setConflictColor] = useState(projectDto.conflict_color);
  const nodeConflictRef = useRef(conflictColor);

  const { t } = useTranslation();

  const debounceColorChange = useCallback(
    debounce(() => {
      putColorChange(
        projectDto.id,
        nodeRef.current,
        nodeFavorRef.current,
        nodeConflictRef.current
      );
      setProjectData({
        ...projectDto,
        default_color: nodeRef.current,
        favor_color: nodeFavorRef.current,
        conflict_color: nodeConflictRef.current,
      });
      setTimeout(() => reloadData(), 500);
    }, 1500),
    []
  );

  return (
    <Stack direction={"row"} spacing={2}>
      <CColorPicker
        color={nodeColor}
        onChange={(color) => {
          debounceColorChange();
          nodeRef.current = color;
          setNodeColor(color);
        }}
        label={t("NewSettingControls.colorPicker.primary")}
      />
      <CColorPicker
        color={favorColor}
        onChange={(color) => {
          debounceColorChange();
          nodeFavorRef.current = color;
          setFavorColor(color);
        }}
        label={t("NewSettingControls.colorPicker.favor")}
      />
      <CColorPicker
        color={conflictColor}
        onChange={(color) => {
          debounceColorChange();
          nodeConflictRef.current = color;
          setConflictColor(color);
        }}
        label={t("NewSettingControls.colorPicker.conflict")}
      />
    </Stack>
  );
};

export default ProjectColorMenu;
