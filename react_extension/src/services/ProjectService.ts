//  /api/project/46926613-3cca-439d-a4f3-9897753b9940
import { toast } from "react-toastify";
import i18next from "i18next";
import ProjectDto from "../components/models/ProjectDto";
import httpService from "./HttpService";

const API_URL = "/api/";

export const getCommitCountForProject = async (projectId: string) => {
    const result = await httpService.getAsync<any[]>(API_URL + `project/${projectId}/files`);
    return result?.length ?? 0;
}

export const getSpriteCountForProject = async (projectId: string): Promise<number> => {
    const files = await httpService.getAsync<any[]>(API_URL + `project/${projectId}/files`);
    if (!files || files.length === 0) return 0;

    // Find the most recent file by timestamp and return its number_sprites
    const sorted = [...files].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted[0].number_sprites ?? 0;
}

export const getCommitDatesForProject = async (projectId: string): Promise<Date[]> => {
    const files = await httpService.getAsync<any[]>(API_URL + `project/${projectId}/files`);
    if (!files || files.length === 0) return [];

    return files
        .map((file: any) => new Date(file.timestamp))
        .filter((d: Date) => !isNaN(d.getTime()));
}

export const getLastCommitDateForProject = async (projectId: string) => {
    const result = await httpService.getAsync<any[]>(API_URL + `project/${projectId}/files`);
    if (!result || result.length === 0) return null;

    // Extract the most recent date from files
    // Try to get timestamp first (Unix timestamp in ms or s), then other date fields
    const dates = result
        .map((file: any) => {
            // Try timestamp field first
            if (file.timestamp) {
                // If timestamp is in seconds (10 digits), convert to ms
                const ts = file.timestamp.toString().length === 10 ? file.timestamp * 1000 : file.timestamp;
                return new Date(ts);
            }
            // Fall back to other date fields
            return file.updated_at || file.created_at || file.date ? new Date(file.updated_at || file.created_at || file.date) : null;
        })
        .filter((date: any) => date != null && !isNaN(date.getTime()));

    if (dates.length === 0) return null;
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return latestDate;
}

export const getKanbanCardCountForProject = (kanbanBoardJson: string, column: 'first' | 'last'): number => {
    try {
        const board = JSON.parse(kanbanBoardJson);
        if (!board?.columns || board.columns.length === 0) return 0;
        const targetColumn = column === 'first' ? board.columns[0] : board.columns[board.columns.length - 1];
        return targetColumn.cards?.length ?? 0;
    } catch {
        return 0;
    }
};

export const getKanbanStatsPerAuthor = (kanbanBoardJson: string): { columns: string[], authors: { author: string; icon: string; [col: string]: string | number }[] } => {
    try {
        const board = JSON.parse(kanbanBoardJson);
        if (!board?.columns || board.columns.length === 0) return { columns: [], authors: [] };

        const columnTitles: string[] = board.columns.map((col: any) => col.title ?? '');
        const authorMap: Record<string, { icon: string; counts: Record<string, number> }> = {};

        for (const column of board.columns) {
            const colTitle = column.title ?? '';
            for (const card of column.cards ?? []) {
                const author = card.author || 'Unknown';
                if (!authorMap[author]) {
                    authorMap[author] = {
                        icon: card.icon ?? '',
                        counts: Object.fromEntries(columnTitles.map(t => [t, 0])),
                    };
                }
                if (card.icon) {
                    authorMap[author].icon = card.icon;
                }
                authorMap[author].counts[colTitle] = (authorMap[author].counts[colTitle] ?? 0) + 1;
            }
        }

        const authors = Object.entries(authorMap).map(([author, data]) => ({
            author,
            icon: data.icon,
            ...data.counts,
        }));

        return { columns: columnTitles, authors };
    } catch {
        return { columns: [], authors: [] };
    }
};

export const getProjectData = async (projectId: string) => {
    const res = await httpService.getAsync<Promise<ProjectDto>>(
        `/api/project/${projectId}`
    );

    if (res) {
        return res;
    }
};

export const duplicateProject = async (projectId: string, ) => {
    const res = await httpService.postAsync<Promise<ProjectDto>>(
        `/api/project/${projectId}/duplicate`, null
    );
    if (res) {
        return res;
    }
};

export const getProjectDataWithPin = async (projectPin: string) => {
    const res = await httpService.getAsync<Promise<ProjectDto>>(
        `/api/projects/with_pin/${projectPin}`
    );
    if (res) {
        return res;
    }
};

export const getProjectUnhideAll = async (projectId: string) => {
    const res = await httpService.getAsync<Promise<unknown>>(
        `/api/project/${projectId}/unhide_all`
    );

    if (res) {
        toast.success(i18next.t("toast.project.unhideSuccess"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
        return res;
    }
};

export interface CreateTeacherProjectPayload {
    name: string;
    schoolclassId: string | null;
    description?: string;
    startDescription?: string;
    file?: File | null;
}

export const createProject = async (payload: CreateTeacherProjectPayload) => {
    try {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description ?? "");
        formData.append("start_description", payload.startDescription ?? "");
        if (payload.schoolclassId) {
            formData.append("schoolclass", payload.schoolclassId);
        }
        if (payload.file) {
            formData.append("file", payload.file);
        }

        const res = await httpService.postFormAsync<ProjectDto>(
            `/api/projects`,
            formData,
            "POST"
        );

        toast.success(i18next.t("toast.project.creationSuccess"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
        return res;
    } catch {
        toast.error(i18next.t("toast.project.creationError"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
};

export const importProjectToSchoolclass = async (projectId: string, project: ProjectDto) => {
    const res = await httpService.postAsync<ProjectDto>(
        `/api/update/project/${projectId}/import`,
        { ...project},
        "PUT",
        true,
        true
    );
    if (res) {
        toast.success(i18next.t("toast.project.importSuccess"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
        return res;
    }
    else {
        toast.error(i18next.t("toast.project.importError"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        })
    }
};

export const postDeleteProject = async (
    projectId: string,
    password: string,
    onRedirect = () => {}
) => {
    try {
        const res = await httpService.postAsync<string>(
            `/api/delete/project/${projectId}`,
            { password: password },
            "DELETE",
            true,
            true,
            () => {
                // console.log("Redirect oder so...");
            }
        );
        // console.log(res);
        if (res) {
            toast.success(i18next.t("toast.project.deleteSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return true;
        }
    } catch (err) {
        if (err.status < 400) {
            // Redirect = Success
            onRedirect();
            toast.success(i18next.t("toast.project.deleteSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return true;
        } else {
            toast.error(i18next.t("toast.project.wrongPassword"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return false;
        }
    }
};

export const postPasswordChange = async (
    projectId: string,
    old_password: string,
    new_password: string
) => {
    const passObj = {
        "old-password": old_password,
        "new-password": new_password,
    };

    try {
        const res = await httpService.postAsync<string>(
            `/api/update/password/${projectId}`,
            passObj,
            "PUT",
            true,
            true
        );

        if (res) {
            toast.success(i18next.t("toast.project.passwordChangeSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err) {
        toast.error(i18next.t("toast.project.wrongPassword"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
};

export const postProjectSettingsChange = async (
    projectId: string,
    project: ProjectDto,
    password: string
) => {
    try {
        const res = await httpService.postAsync<ProjectDto>(
            `/api/update/project/${projectId}`,
            { ...project, password: password },
            "PUT",
            true,
            true
        );

        // console.log("In project settings:");
        // console.log(res);
        if (res) {
            toast.success(i18next.t("toast.project.projectUpdateSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err) {
        toast.error(i18next.t("toast.project.wrongPassword"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
};

export const putKanbanChange = async (
    projectId: string,
    board: any,
) => {
    try {
        const res = await httpService.postAsync<ProjectDto>(
            `/api/update/kanban/${projectId}`,
            { kanban_board: JSON.stringify(board) },
            "PUT",
            true,
            true
        );

        if (res) {
            return res;
        }
    } catch (err) {
        toast.error(i18next.t("toast.project.kanbanUpdateError"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
};


export const putColorChange = async (
    projectId: string,
    default_color?: string,
    favor_color?: string,
    conflict_color?: string
) => {
    const colorObject = {
        default_color: default_color,
        favor_color: favor_color,
        conflict_color: conflict_color,
    };

    try {
        const res = await httpService.postAsync<string>(
            `/api/update/project_colors/${projectId}`,
            colorObject,
            "PUT",
            true,
            true
        );

        if (res) {
            toast.success(i18next.t("toast.project.colorsChangeSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err) {
        // console.log("Changing color failed.");
        // console.log(err);
    }
};

export const putLabelChange = async (fileId: string, label: string) => {
    const labelObject = {
        label: label,
    };

    try {
        const res = await httpService.postAsync<string>(
            `/api/update/node_desc/${fileId}`,
            labelObject,
            "PUT",
            true,
            true
        );

        if (res) {
            toast.success(i18next.t("toast.project.labelChangeSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err) {
        // console.log("Changing label failed.");
        // console.log(err);
    }
};

export const putProjectNameChange = async (projectId: string, name: string) => {
    try {
        const res = await httpService.postAsync<ProjectDto>(
            `/api/update/project/${projectId}`,
            { name: name },
            "PUT",
            true,
            true
        );

        if (res) {
            toast.success(i18next.t("toast.project.projectNameUpdateSuccess"), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });
            return res;
        }
    } catch (err) {
        toast.error(i18next.t("toast.project.projectNameUpdateError"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
        });
    }
};

export const getToggleCollapse = async (nodeId: string) => {
    try {
        const res = await httpService.getAsyncText<string>(
            `/action/collapse_node/${nodeId}`
        );

        if (res) {
            return res;
        }
    } catch (err) {
        // console.log("Collapsing node failed.");
        // console.log(err);
    }
};