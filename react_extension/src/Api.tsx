import {useQuery} from '@tanstack/react-query';
import axios from "axios";

async function getFiles(projectId : string) {
    const url = 'http://127.0.0.1:8000/api/project/' + projectId + '/files';
    const { data } = await axios.get(url);
    return data;
}

  /*  const url = '/api/project/' + projectId + '/files';
    console.log(url);
  const { data } = await axios.get(url, {baseURL: "http://127.0.0.1:8000"});
  return data;*/


// export function useFiles(projectId : string) {
//     //console.log(projectId);
//     return useQuery<File[], Error>({queryKey: ['files' , projectId], queryFn: () => getFiles(projectId)});
// }

export function useFiles(projectId : string) {
  const queryInfo = useQuery<File[], Error>({queryKey: ['files' , projectId], queryFn: () => getFiles(projectId)});

  const refresh = () => {
      queryInfo.refetch();
  };

  return {...queryInfo, refresh};
}

//{"id": 159, "description": "", "ancestors": [142, 143], "file_url": "/media/159.xml", "timestamp": "2023-12-05 17:38:19.389135+00:00", "number_scripts": 6, "number_sprites": 1, "color": "#076AAB"}
export type File = {
    id: number,
    file_url: string,
    description: string,
    project: string,
    ancestors: number[],
    timestamp: string,
    number_scripts: number,
    number_sprites: number,
    color: string,
}