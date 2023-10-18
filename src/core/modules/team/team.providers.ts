import { TEAM_REPOSITORY } from "src/core/constants";
import { Team } from "./team.entity";

export const teamsProviders = [{
    provide: TEAM_REPOSITORY,
    useValue: Team
}]