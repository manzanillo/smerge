import { Card, CardActions, CardContent, Button } from "@mui/material";
import ProjectDto from "./models/ProjectDto";
import ProjectCardContextMenu from "./ProjectCardContextMenu";

export default function ProjectCard(projectData: ProjectDto) {
  
  const handleButtonClick = () => {
    location.href = location.href.replace('ext/teacher_view', `ext/project_view/${projectData.id}`);
  }

  return (
    <Card variant="outlined" sx={{borderRadius:'10px'}}>
      <CardContent>
          {projectData?.name}
      </CardContent>
      <CardActions>
        <ProjectCardContextMenu></ProjectCardContextMenu>
        <Button size="small" onClick={handleButtonClick}>Open Project</Button>
      </CardActions>
    </Card>
  );
}