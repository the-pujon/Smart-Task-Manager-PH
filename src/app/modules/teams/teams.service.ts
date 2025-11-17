// teams.service.ts - teams module

import AppError from "../../errors/AppError";
import { ITeam } from "./teams.interface";
import { Team } from "./teams.model";
import httpStatus from "http-status";

const createTeamService = async (payload: ITeam) => {
   try{
     const newTeam = await Team.create(payload);
    return newTeam;
   }
    catch(error){
        throw new AppError( httpStatus.INTERNAL_SERVER_ERROR ,"Failed to create team");
    }
}



export const teamService = {
    createTeamService,
}