import {Grid, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Box, IconButton, Chip, Tooltip} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ProjectCard from "./components/ProjectCard";
import {
    getProjectsForSchoolclasses,
    getSchoolclassesOfCurrentUser,
    updateSchoolclassName
} from "./services/SchoolclassService";
import {
    getCommitCountForProject,
    getLastCommitDateForProject,
    getKanbanCardCountForProject,
} from "./services/ProjectService";
import SchoolclassDto from "./components/models/SchoolclassDto";
import ProjectDto from "./components/models/ProjectDto";
import AddProjectDialog from "./components/AddProjectDialog";
import ImportProjectDialog from "./components/ImportProjectDialog";
import DeleteSchoolclassDialog from "./components/DeleteSchoolclassDialog";
import React, {useEffect, useState} from "react";
import AddSchoolclassDialog from "./components/AddSchoolclassDialog";
import {toast} from "react-toastify";
import { createPortal } from "react-dom";
import TutorialOverlay from "./components/Tutorial/TutorialOverlay";
import { TUTORIAL_SEQUENCES } from "./components/Tutorial/tutorialSequences";
import { getTeacherTutorialStatus, setTeacherTutorialCompleted } from "./services/TeacherAuthService";
import {useTranslation} from "react-i18next";


const TeacherView: React.FC = () => {
    const TEACHER_TUTORIAL_SEQUENCE_ID = "teacher-view-tutorial";
    const tutorialSequence = TUTORIAL_SEQUENCES[TEACHER_TUTORIAL_SEQUENCE_ID];

    const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

    const [projectsOfSchoolclasses, setProjectsOfSchoolclasses] = useState<{
        schoolclass: SchoolclassDto,
        projects: ProjectDto[]
    }[]>([]);
    const [projectCommitCounts, setProjectCommitCounts] = useState<Record<string, number>>({});
    const [projectLastCommitDates, setProjectLastCommitDates] = useState<Record<string, Date | null>>({});
    const [projectOpenCardCounts, setProjectOpenCardCounts] = useState<Record<string, number>>({});
    const [projectClosedCardCounts, setProjectClosedCardCounts] = useState<Record<string, number>>({});

    const [isLoading, setLoading] = useState<boolean>(true)

    // Class name editing state
    const [editingSchoolclassId, setEditingSchoolclassId] = useState<string | null>(null);
    const [editingSchoolclassName, setEditingSchoolclassName] = useState<string>("");
    const [isSavingSchoolclass, setIsSavingSchoolclass] = useState<boolean>(false);

    // Teacher-Tutorial
    const currentStep = isTutorialActive
        ? tutorialSequence?.steps[currentStepIndex] ?? null
        : null;
    const isLastStep = isTutorialActive && !!tutorialSequence && currentStepIndex >= tutorialSequence.steps.length - 1;
    const progress = {
        current: isTutorialActive && tutorialSequence ? currentStepIndex + 1 : 0,
        total: tutorialSequence?.steps.length ?? 0,
    };

    const { t } = useTranslation();

    async function loadCommitCounts(state: { schoolclass: SchoolclassDto, projects: ProjectDto[] }[]) {
        const allProjects = state.flatMap((entry) => entry.projects);

        // Fetch both counts and dates in parallel
        const statsEntries = await Promise.all(
            allProjects.map(async (project) => {
                const count = await getCommitCountForProject(project.id);
                const lastCommitDate = await getLastCommitDateForProject(project.id);
                return { projectId: project.id, count, lastCommitDate };
            })
        );

        // Separate counts and dates into their respective records
        const counts = Object.fromEntries(
            statsEntries.map(s => [s.projectId, s.count])
        );
        const dates = Object.fromEntries(
            statsEntries.map(s => [s.projectId, s.lastCommitDate])
        );

        setProjectCommitCounts(counts);
        setProjectLastCommitDates(dates);

        // Compute kanban card counts from already-loaded project data (no API call needed)
        const openCounts = Object.fromEntries(
            allProjects.map(project => [
                project.id,
                getKanbanCardCountForProject(project.kanban_board, 'first')
            ])
        );
        setProjectOpenCardCounts(openCounts);

        const closedCounts = Object.fromEntries(
            allProjects.map(project => [
                project.id,
                getKanbanCardCountForProject(project.kanban_board, 'last')
            ])
        );
        setProjectClosedCardCounts(closedCounts);
    }

    useEffect(() => {
        (async () => {
            try {
                const schoolclassesOfUser = await getSchoolclassesOfCurrentUser();
                const state = await getProjectsForSchoolclasses(schoolclassesOfUser);
                setProjectsOfSchoolclasses(state);
                await loadCommitCounts(state);
                setLoading(false);
                console.log(projectsOfSchoolclasses);
            } catch (error) {
                toast.error(t('TeacherView.loadError'), {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                });
                setProjectsOfSchoolclasses([]);
            }
        })();
    }, []);

    async function loadTutorialState() {
        try {
            const tutorialStatus = await getTeacherTutorialStatus();
            if (!tutorialStatus.completed_tutorial) {
                setCurrentStepIndex(0);
                setIsTutorialActive(true);
            }
        } catch (error) {
            console.error("Could not load teacher tutorial status", error);
        }
    }

    useEffect(() => {
        if (isLoading || !tutorialSequence) {
            return;
        }
        loadTutorialState();
    }, [isLoading, tutorialSequence]);


    function addProjectToState(project: ProjectDto) {
        // Tutorial
        if (isTutorialActive && currentStep?.id === 'add_project_details') {
            nextTutorialStep();
        }
        // Fügt das Projekt dem korrekten Array hinzu.
        // Die Syntax ist so komplex, damit so zuverlässig die React Change-Detection getriggerd wird.
        setProjectsOfSchoolclasses((prev) =>
            prev.map((entry) =>
                entry.schoolclass.id === project.schoolclass
                    ? { ...entry, projects: [...entry.projects, project] }
                    : entry
            )
        );
        // New projects start with no nodes/files yet.
        setProjectCommitCounts((prev) => ({ ...prev, [project.id]: 0 }));
        setProjectLastCommitDates((prev) => ({ ...prev, [project.id]: null }));
        setProjectOpenCardCounts((prev) => ({ ...prev, [project.id]: getKanbanCardCountForProject(project.kanban_board, 'first') }));
        setProjectClosedCardCounts((prev) => ({ ...prev, [project.id]: getKanbanCardCountForProject(project.kanban_board, 'last') }));
    }

    function deleteProjectFromState(project: ProjectDto) {
        setProjectsOfSchoolclasses((prev) =>
            prev.map((entry) =>
                entry.schoolclass.id === project.schoolclass
                    ? { ...entry, projects: entry.projects.filter((p) => p.id !== project.id) }
                    : entry
            )
        );
        setProjectCommitCounts((prev) => {
            const next = { ...prev };
            delete next[project.id];
            return next;
        });
        setProjectLastCommitDates((prev) => {
            const next = { ...prev };
            delete next[project.id];
            return next;
        });
        setProjectOpenCardCounts((prev) => {
            const next = { ...prev };
            delete next[project.id];
            return next;
        });
        setProjectClosedCardCounts((prev) => {
            const next = { ...prev };
            delete next[project.id];
            return next;
        });
    }

    function renameProjectInState(projectId: string, name: string) {
        setProjectsOfSchoolclasses((prev) =>
            prev.map((entry) => ({
                ...entry,
                projects: entry.projects.map((project) => {
                        if (project.id === projectId) {
                            return {...project, name: name};
                        }
                        return project;
                    }
                ),
            }))
        );
    }

    const startEditingSchoolclass = (schoolclass: SchoolclassDto) => {
        setEditingSchoolclassId(schoolclass.id);
        setEditingSchoolclassName(schoolclass.name);
    };

    const cancelEditingSchoolclass = () => {
        setEditingSchoolclassId(null);
        setEditingSchoolclassName("");
    };

    const saveSchoolclassName = async () => {
        const nextName = editingSchoolclassName.trim();
        if (!nextName) {
            cancelEditingSchoolclass();
            return;
        }

        setIsSavingSchoolclass(true);
        const res = await updateSchoolclassName(editingSchoolclassId!, nextName);
        setIsSavingSchoolclass(false);

        if (!res) {
            toast.error(t('TeacherView.renameFailed'), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return;
        }

        // Update state
        setProjectsOfSchoolclasses((prev) =>
            prev.map((entry) =>
                entry.schoolclass.id === editingSchoolclassId
                    ? { ...entry, schoolclass: { ...entry.schoolclass, name: nextName } }
                    : entry
            )
        );

        toast.success(t('TeacherView.renameSuccess'), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });

        cancelEditingSchoolclass();
    };

    // Schoolclass delete functions
    const handleSchoolclassDeleted = (schoolclassId: string) => {
        // Update state
        setProjectsOfSchoolclasses((prev) =>
            prev.filter((entry) => entry.schoolclass.id !== schoolclassId)
        );
    };

    async function closeTutorial() {
        setIsTutorialActive(false);
        setCurrentStepIndex(0);

        try {
            await setTeacherTutorialCompleted(true);
        } catch (error) {
            console.error("Could not persist teacher tutorial status", error);
        }
    }

    function nextTutorialStep() {
        if (!tutorialSequence) {
            return;
        }

        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex >= tutorialSequence.steps.length) {
            closeTutorial();
            return;
        }

        setCurrentStepIndex(nextStepIndex);
    }

    function restartTeacherTutorial() {
        setCurrentStepIndex(0);
        setIsTutorialActive(true);
    }

    // Schoolclass creation interceptor für Tutorial
    function onSchoolclassCreated() {
        if (currentStep?.id === "explain_add_class_button") {
            nextTutorialStep();
        }
    }

    function onAddButtonClick() {
        if (currentStep?.id === "add_project") {
            nextTutorialStep();
        }
    }

    const tutorialRoot = document.getElementById("tutorial-root");

    const restartTutorialButton = (
        <Box sx={{ position: "fixed", left: 16, bottom: 16, zIndex: 1300 }}>
            <Button
                variant="contained"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={restartTeacherTutorial}
            >
                {t('TeacherView.restartTutorial')}
            </Button>
        </Box>
    );

    if (isLoading) {
        return <div>{t('TeacherView.loading')}</div>;
    }

    if (!projectsOfSchoolclasses?.length) {
        return <>
            {tutorialRoot && isTutorialActive && currentStep && createPortal(
                <TutorialOverlay
                    step={currentStep}
                    progress={progress}
                    isLastStep={isLastStep}
                    onNext={nextTutorialStep}
                    onClose={closeTutorial}
                />,
                tutorialRoot
            )}
            {!isTutorialActive && restartTutorialButton}
            <div>
                {t('TeacherView.noSchoolclasses')}
                <AddSchoolclassDialog state={projectsOfSchoolclasses}
                                      setState={setProjectsOfSchoolclasses}></AddSchoolclassDialog>
            </div>
        </>;
    }
    return <>
        {tutorialRoot && isTutorialActive && currentStep && createPortal(
            <TutorialOverlay
                step={currentStep}
                progress={progress}
                isLastStep={isLastStep}
                onNext={nextTutorialStep}
                onClose={closeTutorial}
            />,
            tutorialRoot
        )}
        {!isTutorialActive && restartTutorialButton}
        <div>
        {projectsOfSchoolclasses.map((item: {
            schoolclass: SchoolclassDto,
            projects: ProjectDto[]
        }) => {
            const isEditingThisClass = editingSchoolclassId === item.schoolclass.id;

            // Class-level stats (computed from already-loaded per-project data)
            const totalProjects = item.projects.length;

            const classCommitDates = item.projects
                .map((p) => projectLastCommitDates[p.id])
                .filter((d): d is Date => d != null);
            const lastClassActivity = classCommitDates.length > 0
                ? new Date(Math.max(...classCommitDates.map((d) => d.getTime())))
                : null;


            return <Accordion key={item.schoolclass.id} className="schoolclass-accordion" defaultExpanded={true}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel2-content"
                    id="panel2-header"
                >
                    {/* Editable Class name */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flex: 1}}>
                        {isEditingThisClass ? (
                            <TextField
                                value={editingSchoolclassName}
                                size="small"
                                autoFocus
                                disabled={isSavingSchoolclass}
                                onChange={(e) => setEditingSchoolclassName(e.target.value)}
                                onBlur={saveSchoolclassName}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveSchoolclassName();
                                    }
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        cancelEditingSchoolclass();
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                sx={{flex: 1}}
                            />
                        ) : (
                            <>
                                <span>{item.schoolclass.name}</span>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 2 }} onClick={(e) => e.stopPropagation()}>
                                    <Tooltip title={t('TeacherView.classStats.totalProjects')}>
                                        <Chip label={`${totalProjects} ${t('TeacherView.classStats.projects')}`} size="small" variant="outlined" />
                                    </Tooltip>
                                    <Tooltip title={t('TeacherView.classStats.lastActivityTooltip')}>
                                        <Chip
                                            label={lastClassActivity
                                                ? `${t('TeacherView.classStats.lastActivity')}: ${lastClassActivity.toLocaleDateString('de-DE')}`
                                                : t('TeacherView.classStats.noActivity')
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Tooltip>
                                </Box>
                            </>
                        )}
                    </Box>
                    {!isEditingThisClass && (
                        <Box sx={{display: 'flex', gap: 0.5, ml: 2}}>
                            <IconButton
                                size="small"
                                onClick={() => startEditingSchoolclass(item.schoolclass)}
                            >
                                <EditIcon fontSize="small"/>
                            </IconButton>
                            <DeleteSchoolclassDialog
                                schoolclass={item.schoolclass}
                                projects={item.projects}
                                onSchoolclassDeleted={handleSchoolclassDeleted}
                            />
                        </Box>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    {/* All projects of this class */}
                    <Grid container spacing="10" alignItems="center" key={item.schoolclass.id}>
                        {
                            item.projects.map((projectsItem: ProjectDto) => {
                                return <Grid item key={projectsItem.id}>
                                    <ProjectCard
                                        addProjectToState={addProjectToState}
                                        deleteProjectFromState={deleteProjectFromState}
                                        renameProjectInState={renameProjectInState}
                                        projectData={projectsItem}
                                        commitCount={projectCommitCounts[projectsItem.id]}
                                        lastCommitDate={projectLastCommitDates[projectsItem.id]}
                                        openCardCount={projectOpenCardCounts[projectsItem.id]}
                                        closedCardCount={projectClosedCardCounts[projectsItem.id]}
                                    ></ProjectCard>
                                </Grid>
                            })
                        }
                        <Grid item key={'addButton'}>
                            <AddProjectDialog addProjectToState={addProjectToState}
                                              schoolClass={item.schoolclass}
                                              onButtonClick={onAddButtonClick}
                            ></AddProjectDialog>
                        </Grid>
                        <Grid item key={'importButton'}>
                            <ImportProjectDialog addProjectToState={addProjectToState}
                                                 schoolClass={item.schoolclass}></ImportProjectDialog>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        })
        }


        <AddSchoolclassDialog state={projectsOfSchoolclasses}
                              setState={setProjectsOfSchoolclasses}
                              onSchoolClassCreated={onSchoolclassCreated}
        ></AddSchoolclassDialog>
    </div>
    </>
}

export default TeacherView;
