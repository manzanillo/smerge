import { Grid, Accordion, AccordionSummary, AccordionDetails, Fab } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProjectCard from "./components/ProjectCard";
import { getProjectsOfSchoolclass, getSchoolclassesOfCurrentUser } from "./services/SchoolclassService";
import SchoolclassDto from "./components/models/SchoolclassDto";
import ProjectDto from "./components/models/ProjectDto";
import AddProjectDialog from "./components/AddProjectDialog";
import ImportProjectDialog from "./components/ImportProjectDialog";
import { useEffect, useState } from "react";
import AddSchoolclassDialog from "./components/AddSchoolclassDialog";


const TeacherView: React.FC = () => {

    const [projectsOfSchoolclasses, setProjectsOfSchoolclasses] = useState<{
        schoolclass: SchoolclassDto,
        projects: ProjectDto[]
    }[]> ([]);

    useEffect(() => {
        console.log(projectsOfSchoolclasses)
    }, [projectsOfSchoolclasses])


    useEffect(() => {
        const getSchoolclassesAndProjects = async () => {
            var temp: { schoolclass: SchoolclassDto; projects: ProjectDto[]; }[]= [];
            getSchoolclassesOfCurrentUser().then((res) => {
                res.map(async (item:SchoolclassDto) => {
                    try{
                        const projectsOfSchoolclass = await getProjectsOfSchoolclass(item).then((res) => {
                            temp.push({
                                schoolclass: item,
                                projects: res ?? []
                            });
                        }).then(() => {
                            setProjectsOfSchoolclasses(temp);
                        });
                    }
                    catch(error){
                        temp.push({
                            schoolclass: item,
                            projects: []
                        });
                    }
                });
            })
            //setProjectsOfSchoolclasses(temp);
        };
        getSchoolclassesAndProjects();
    }, []);

    return <div>
        {projectsOfSchoolclasses.map((item:{schoolclass:SchoolclassDto, projects:ProjectDto[]}) => (
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel2-content"
                    id="panel2-header"
                >
                    {item.schoolclass.name}
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing="10" alignItems="center"> 
                        {item.projects.map((projectsItem:ProjectDto) => (
                            <Grid item>
                                <ProjectCard {...projectsItem}></ProjectCard>
                            </Grid>
                        ))
                       }
                        <Grid item>
                            <AddProjectDialog></AddProjectDialog>
                        </Grid>
                        <Grid item>
                            <ImportProjectDialog></ImportProjectDialog>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        ))}
        <AddSchoolclassDialog></AddSchoolclassDialog>
    </div>
}

export default TeacherView;