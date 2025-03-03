import { Grid, Accordion, AccordionSummary, AccordionDetails, Fab } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProjectCard from "./components/ProjectCard";
import { getProjectsForSchoolclasses, getProjectsOfSchoolclass, getSchoolclassesOfCurrentUser } from "./services/SchoolclassService";
import SchoolclassDto from "./components/models/SchoolclassDto";
import ProjectDto from "./components/models/ProjectDto";
import AddProjectDialog from "./components/AddProjectDialog";
import ImportProjectDialog from "./components/ImportProjectDialog";
import { useEffect, useState } from "react";
import AddSchoolclassDialog from "./components/AddSchoolclassDialog";
import { toast } from "react-toastify";


const TeacherView: React.FC = () => {

    const [projectsOfSchoolclasses, setProjectsOfSchoolclasses] = useState<{
        schoolclass: SchoolclassDto,
        projects: ProjectDto[]
    }[]> ([]);
    
    const [updateCounter, setUpdateCounter] = useState<number>(0)

    const [isLoading, setLoading] = useState<boolean>(true)

    
    useEffect(() => {
        (async () => {
            try {
                const schoolclassesOfUser = await getSchoolclassesOfCurrentUser();
                const state = await getProjectsForSchoolclasses(schoolclassesOfUser);
                setProjectsOfSchoolclasses(state);
                setLoading(false);
                console.log(projectsOfSchoolclasses);
            }
            catch (error) {
                toast.error('Could not load data!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                });
                setProjectsOfSchoolclasses([]);
            }
        }) ();
    }, []);


    function addProjectToState(project: ProjectDto) { //macht state update einfacher, siehe hier: https://react.dev/learn/updating-objects-in-state#updating-a-nested-object bzw https://react.dev/reference/react/useState
        const stateCopy = projectsOfSchoolclasses;
        const schoolClassIndex = projectsOfSchoolclasses.findIndex(item => item.schoolclass.id == project.schoolclass);
        stateCopy[schoolClassIndex].projects = stateCopy[schoolClassIndex].projects.concat([project]);
        setProjectsOfSchoolclasses(stateCopy);
        setUpdateCounter(updateCounter => updateCounter +1); //state change in update counter triggert einen re-render, der dann auch den anderen State updatet
    }

    return <div>
        {  
            isLoading ? (<div>Loading...</div>) : (
                projectsOfSchoolclasses.length <= 0 ? (<div>You do not have any Schoolclasses yet, create one on the bottom right!</div>) : (
                    projectsOfSchoolclasses.map((item: { schoolclass: SchoolclassDto, projects: ProjectDto[] }) => {
                        return <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                            >
                                {item.schoolclass.name}
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing="10" alignItems="center" key={item.schoolclass.id}>
                                    {
                                        item.projects.map((projectsItem: ProjectDto) => {
                                            return <Grid item key={projectsItem.id}>
                                                <ProjectCard addProjectToState={addProjectToState} projectData={projectsItem}></ProjectCard>
                                            </Grid>
                                        })
                                    }
                                    <Grid item key={'importButton'}>
                                        <AddProjectDialog addProjectToState={addProjectToState} schoolClass={item.schoolclass}></AddProjectDialog>
                                    </Grid>
                                    <Grid item key={'addButton'}>
                                        <ImportProjectDialog addProjectToState={addProjectToState} schoolClass={item.schoolclass}></ImportProjectDialog>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    })
                )
            )
        }
        <AddSchoolclassDialog state={projectsOfSchoolclasses} setState={setProjectsOfSchoolclasses}></AddSchoolclassDialog>
    </div>
}

export default TeacherView;