import { AxiosResponse } from 'axios';
import httpService from '../shared/HttpService';
import Commit from '../models/Commit';

interface CommitDto{
    commit: Commit[];
}

export const getCommits = async (branch: string) => {
    if (branch == "") return [];
    const res = await httpService.post(`/git/commits`,{
        "path": "origin/master"
    }) as AxiosResponse;

    if(res.status == 200) {
        const commits = await res.data as CommitDto;
        return commits.commit;
    }
    return [];
}