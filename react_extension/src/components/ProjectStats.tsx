import ProjectDto from "./models/ProjectDto";


interface ProjectStatsProps {
    projectData?: ProjectDto;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({projectData}) => {
    
    return (
        <div style={{position:"absolute", left:20, top:20, zIndex:1001, color:"gray"}}>
            <div style={{fontWeight:700, fontSize:"50px"}}>{projectData?.name}</div>
            <div>{projectData?.description}</div>
        </div>
    )
}

export default ProjectStats;