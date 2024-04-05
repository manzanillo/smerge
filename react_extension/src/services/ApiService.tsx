import {
  useMutation,
  useQuery,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import httpService from "./HttpService";

async function getFiles(projectId: string) {
  const url = "api/project/" + projectId + "/files";
  const data = await httpService.getAsync<File[]>(url);
  return data;
}

/*  const url = '/api/project/' + projectId + '/files';
    console.log(url);
  const { data } = await axios.get(url, {baseURL: "http://127.0.0.1:8000"});
  return data;*/

async function updateNodePosition(positionUpdate: PositionUpdate) {
  // console.log("update now");
  // return 200;
  const url =
    httpService.baseURL + "api/file/" + positionUpdate.id + "/position";
  if (positionUpdate.position == null) {
    const { status } = await axios.put(
      url,
      { x: null, y: null },
      {
        headers: {
          "X-CSRFToken": httpService.csrftoken,
        },
      }
    );
    return status;
  } else {
    const { status } = await axios.put(url, positionUpdate.position, {
      headers: {
        "X-CSRFToken": httpService.csrftoken,
      },
    });
    return status;
  }
}

async function updateNodePositions(positionUpdates: PositionUpdate[]) {
  // console.log("update now");
  // return 200;
  const url =
    httpService.baseURL + "api/file/" + positionUpdates[0].id + "/positions";
  const { status } = await axios.put(url, positionUpdates, {
    headers: {
      "X-CSRFToken": httpService.csrftoken,
    },
  });
  return status;
}

export function useUpdateNodePosition(
  projectId: string,
  queryClient: QueryClient
) {
  return useMutation<number, Error, PositionUpdate>({
    mutationKey: ["update_node_position"],
    mutationFn: updateNodePosition,
    onMutate: (variable) => {
      onMutateFile(variable, projectId, queryClient);
    },
  });
}

// const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         staleTime: Infinity,
//       },
//     },
//   })

const onMutateFile = async (
  variables: PositionUpdate,
  projectId: string,
  queryClient: QueryClient
) => {
  const { successCb, errorCb } = variables;

  // // get the cached values of 'get-planets'
  const previousValue: File[] | undefined = queryClient.getQueryData([
    "files",
    projectId,
  ]);
  // console.log(previousValue);

  // // set the cached data with an added object
  // // i.e the new planet posted
  if (previousValue) {
    queryClient.setQueryData(
      ["files", projectId],
      previousValue.map((file) => {
        if (file.id == variables.id) {
          file.xPosition = variables?.position?.x ?? 0;
          file.yPosition = variables?.position?.y ?? 0;
          return file;
        }
        return file;
      })
    );
  }

  // return previousValue here
  // we will use it in the next section
  return { successCb, errorCb, previousValue };
};

export function useUpdateNodePositions() {
  return useMutation<number, Error, PositionUpdate[]>({
    mutationKey: ["update_node_positions"],
    mutationFn: (positionUpdates: PositionUpdate[]) =>
      updateNodePositions(positionUpdates),
  });
}

// export function useFiles(projectId : string) {
//     //console.log(projectId);
//     return useQuery<File[], Error>({queryKey: ['files' , projectId], queryFn: () => getFiles(projectId)});
// }

export function useFiles(projectId: string) {
  const queryInfo = useQuery<File[], Error>({
    queryKey: ["files", projectId],
    queryFn: () => getFiles(projectId),
  });

  const refresh = () => {
    queryInfo.refetch();
  };

  return { ...queryInfo, refresh };
}

export type PositionUpdate = {
  id: number;
  position: cytoscape.Position | null;
};

//{"id": 159, "description": "", "ancestors": [142, 143], "file_url": "/media/159.xml", "timestamp": "2023-12-05 17:38:19.389135+00:00", "number_scripts": 6, "number_sprites": 1, "color": "#076AAB"}
export type File = {
  id: number;
  file_url: string;
  description: string;
  project: string;
  ancestors: number[];
  timestamp: string;
  number_scripts: number;
  number_sprites: number;
  color: string;
  xPosition: number | null;
  yPosition: number | null;
  collapsed: boolean;
  hidden: boolean;
  type: string;
};
