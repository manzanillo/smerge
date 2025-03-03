//  /api/project/46926613-3cca-439d-a4f3-9897753b9940
import { toast } from "react-toastify";
import ProjectDto from "../components/models/ProjectDto";
import httpService from "./HttpService";

export const getProjectData = async (projectId: string) => {
  const res = await httpService.getAsync<Promise<ProjectDto>>(
    `api/project/${projectId}`
  );

  if (res) {
    return res;
  }
};

export const duplicateProject = async (projectId: string, ) => {
  const res = await httpService.postAsync<Promise<ProjectDto>>(
    `api/project/${projectId}/duplicate`, null
  );
  if (res) {
    return res;
  }
};

export const getProjectDataWithPin = async (projectPin: string) => {
  const res = await httpService.getAsync<Promise<ProjectDto>>(
    `api/projects/with_pin/${projectPin}`
  );
  if (res) {
    return res;
  }
};

export const getProjectUnhideAll = async (projectId: string) => {
  const res = await httpService.getAsync<Promise<unknown>>(
    `api/project/${projectId}/unhide_all`
  );

  if (res) {
    toast.success(`Unhide successful.`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
    });
    return res;
  }
};

export const createProject = async (name: string, schoolclassId: string | null) => {
  const res = await httpService.postAsync<ProjectDto>(
    `api/projects`, {name: name, schoolclass: schoolclassId}
  );
  if (res) {
    toast.success(`Creation successful.`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
    });
    return res;
  }
  else {
    toast.error('Creation failed', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
    })
  }
};

export const importProjectToSchoolclass = async (projectId: string, project: ProjectDto) => {
  const res = await httpService.postAsync<ProjectDto>(
    `api/update/project/${projectId}/import`,
    { ...project},
    "PUT",
    true,
    true
  );
  if (res) {
    toast.success(`Import successful.`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
    });
    return res;
  }
  else {
    toast.error('Import failed', {
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
      `api/delete/project/${projectId}`,
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
      toast.success(`Project Deleted.`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      return res;
    }
  } catch (err) {
    if (err.status < 400) {
      onRedirect();
      toast.success(`Project Deleted!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
    } else {
      toast.error(`Wrong Password.`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
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
      `api/update/password/${projectId}`,
      passObj,
      "PUT",
      true,
      true
    );

    if (res) {
      toast.success(`Password Changed.`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      return res;
    }
  } catch (err) {
    toast.error(`Wrong Password.`, {
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
      `api/update/project/${projectId}`,
      { ...project, password: password },
      "PUT",
      true,
      true
    );

    // console.log("In project settings:");
    // console.log(res);
    if (res) {
      toast.success(`Project updated.`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      return res;
    }
  } catch (err) {
    toast.error(`Wrong Password.`, {
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
      `api/update/kanban/${projectId}`,
      { kanban_board: JSON.stringify(board) },
      "PUT",
      true,
      true
    );

    if (res) {
      return res;
    }
  } catch (err) {
    toast.error(`Failed to update Kanbanboard`, {
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
      `api/update/project_colors/${projectId}`,
      colorObject,
      "PUT",
      true,
      true
    );

    if (res) {
      toast.success(`Colors Changed.`, {
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
      `api/update/node_desc/${fileId}`,
      labelObject,
      "PUT",
      true,
      true
    );

    if (res) {
      toast.success(`Label Changed.`, {
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

export const getToggleCollapse = async (nodeId: string) => {
  try {
    const res = await httpService.getAsyncText<string>(
      `collapse_node/${nodeId}`
    );

    if (res) {
      return res;
    }
  } catch (err) {
    // console.log("Collapsing node failed.");
    // console.log(err);
  }
};
