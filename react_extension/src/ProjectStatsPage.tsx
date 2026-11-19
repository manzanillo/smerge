import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getProjectData, getCommitCountForProject, getLastCommitDateForProject, getKanbanCardCountForProject, getKanbanStatsPerAuthor, getSpriteCountForProject, getCommitDatesForProject } from "./services/ProjectService";
import ProjectDto from "./components/models/ProjectDto";
import ActivityHeatmap from "./components/ActivityHeatmap";
import "./ProjectStatsPage.css";

const getIconUrl = (iconName: string) => {
    if (!iconName || iconName === "unknown-person-icon.svg") return `/static/icons/unknown-person-icon.svg`;
    return `/static/icons/animal-icons/${iconName}`;
};

const ProjectStatsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [project, setProject] = useState<ProjectDto | null>(null);
    const [commitCount, setCommitCount] = useState<number>(0);
    const [lastCommitDate, setLastCommitDate] = useState<Date | null>(null);
    const [openCardCount, setOpenCardCount] = useState<number>(0);
    const [closedCardCount, setClosedCardCount] = useState<number>(0);
    const [spriteCount, setSpriteCount] = useState<number>(0);
    const [kanbanColumns, setKanbanColumns] = useState<string[]>([]);
    const [authorStats, setAuthorStats] = useState<any[]>([]);
    const [commitDates, setCommitDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;

        (async () => {
            try {
                const [projectData, commits, lastDate, sprites, dates] = await Promise.all([
                    getProjectData(projectId),
                    getCommitCountForProject(projectId),
                    getLastCommitDateForProject(projectId),
                    getSpriteCountForProject(projectId),
                    getCommitDatesForProject(projectId),
                ]);
                const proj = (projectData as ProjectDto) ?? null;
                setProject(proj);
                setCommitCount(commits);
                setLastCommitDate(lastDate);
                setSpriteCount(sprites);
                setCommitDates(dates);

                if (proj) {
                    setOpenCardCount(getKanbanCardCountForProject(proj.kanban_board, "first"));
                    setClosedCardCount(getKanbanCardCountForProject(proj.kanban_board, "last"));

                    const { columns, authors } = getKanbanStatsPerAuthor(proj.kanban_board);
                    setKanbanColumns(columns);
                    setAuthorStats(authors);
                }
            } catch (error) {
                toast.error(t("ProjectStatsPage.loadError"), {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                });
            } finally {
                setIsLoading(false);
            }
        })();
    }, [projectId]);

    if (isLoading) {
        return (
            <Box className="stats-page-loading">
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>{t("ProjectStatsPage.loading")}</Typography>
            </Box>
        );
    }

    if (!project) {
        return (
            <Box className="stats-page-container">
                <Typography>{t("ProjectStatsPage.notFound")}</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    {t("ProjectStatsPage.back")}
                </Button>
            </Box>
        );
    }

    return (
        <Box className="stats-page-container">
            {/* Header */}
            <Box className="stats-page-header">
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" size="small">
                    {t("ProjectStatsPage.back")}
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {t("ProjectStatsPage.title", { name: project.name })}
                </Typography>
            </Box>

            {project.description && (
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    {project.description}
                </Typography>
            )}

            {/* Summary cards */}
            <Box className="stats-summary-grid">
                <Card variant="outlined" className="stats-summary-card">
                    <CardContent>
                        <Typography variant="overline">{t("ProjectStatsPage.commits")}</Typography>
                        <Typography variant="h4">{commitCount}</Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined" className="stats-summary-card">
                    <CardContent>
                        <Typography variant="overline">{t("ProjectStatsPage.lastCommit")}</Typography>
                        <Typography variant="h6">
                            {lastCommitDate
                                ? lastCommitDate.toLocaleString("de-DE", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "—"}
                        </Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined" className="stats-summary-card">
                    <CardContent>
                        <Typography variant="overline">{t("ProjectStatsPage.openCards")}</Typography>
                        <Typography variant="h4">{openCardCount}</Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined" className="stats-summary-card">
                    <CardContent>
                        <Typography variant="overline">{t("ProjectStatsPage.closedCards")}</Typography>
                        <Typography variant="h4">{closedCardCount}</Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined" className="stats-summary-card">
                    <CardContent>
                        <Typography variant="overline">{t("ProjectStatsPage.sprites")}</Typography>
                        <Typography variant="h4">{spriteCount}</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Activity Heatmap */}
            <ActivityHeatmap dates={commitDates} />

            {/* Cards per Author */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                {t("ProjectStatsPage.cardsPerAuthor")}
            </Typography>

            {authorStats.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>{t("ProjectStatsPage.author")}</TableCell>
                                {kanbanColumns.map((col) => (
                                    <TableCell key={col} align="center" sx={{ fontWeight: 600 }}>{t(col)}</TableCell>
                                ))}
                                <TableCell align="center" sx={{ fontWeight: 600 }}>{t("ProjectStatsPage.total")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {authorStats.map((row) => {
                                const total = kanbanColumns.reduce((sum, col) => sum + (Number(row[col]) || 0), 0);
                                return (
                                    <TableRow key={row.author} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <img
                                                    src={getIconUrl(row.icon)}
                                                    alt={row.author}
                                                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'contain' }}
                                                />
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {row.author}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {kanbanColumns.map((col) => (
                                            <TableCell key={col} align="center">{Number(row[col]) || 0}</TableCell>
                                        ))}
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>{total}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {t("ProjectStatsPage.noKanbanData")}
                </Typography>
            )}
        </Box>
    );
};

export default ProjectStatsPage;

