import { AxiosResponse } from 'axios';
import httpService from '../shared/HttpService';
import Commit from '../models/Commit';

interface CommitDto{
    commit: Commit[];
}

interface BranchesDto{
    current_branch: string;
    remote_branches: string[];
}

export const getCommits = async (branch: string) => {
    if (branch == "") return [];
    const res = await httpService.post(`/git/commits`,{
        "path": branch
    }) as AxiosResponse;

    if(res.status == 200) {
        const commits = await res.data as CommitDto;
        return commits.commit;
    }
    return [];
}

export const getBranches = async () => {
    const res = await httpService.get(`/git/branches`) as AxiosResponse;

    if(res.status == 200) {
        const branches = await res.data as BranchesDto;
        return branches;
    }
    return {current_branch:"", remote_branches:[]};
}

export const switchToBranchAndCommit = async (branch: string, commit: Commit) => {
    const res = await httpService.post(`/acapi/git/switch`, {
        "branch":branch, 
        "commit_hash":commit.hash
    }) as AxiosResponse;

    if(res.status == 200) {
        return await res.request.response;
    }
    return "";
}