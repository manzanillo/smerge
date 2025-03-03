import { Card, CardActions, CardContent, Button } from "@mui/material";
import ProjectDto from "./models/ProjectDto";
import ProjectCardContextMenu from "./ProjectCardContextMenu";

const ProjectCard = (props: {projectData: ProjectDto, addProjectToState: (arg0: ProjectDto) => void;}) => {
  
  const handleButtonClick = () => {
    location.href = location.href.replace('ext/teacher_view', `ext/project_view/${props.projectData.id}`);
  }

  return (
    <Card variant="outlined" sx={{borderRadius:'10px'}}>
      <CardContent>
          {props.projectData.name}
      </CardContent>
      <CardActions>
        <ProjectCardContextMenu addProjectToState={props.addProjectToState} projectData={props.projectData}></ProjectCardContextMenu>
        <Button size="small" onClick={handleButtonClick}>Open Project</Button>
      </CardActions>
    </Card>
  );
}

export default ProjectCard;