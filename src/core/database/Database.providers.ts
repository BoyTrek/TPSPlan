import { Sequelize } from "sequelize-typescript";
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants/index';
import { databaseConfig } from "./Database.config";
import { User } from "../modules/users/User.entity";
import { Team } from "../modules/team/team.entity";
import { Member } from "../modules/member/member.entity";
import { Task } from "../modules/task/task.entity";
import { Project } from "../modules/project/project.entity";
import { DatabaseFile } from "../upload/entities/upload.entity";

export const databaseProviders = [{
    provide: SEQUELIZE,
    useFactory: async () => {
        let config;
        switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
           config = databaseConfig.development;
           break;
        case TEST:
           config = databaseConfig.test;
           break;
        case PRODUCTION:
           config = databaseConfig.production;
           break;
        default:
           config = databaseConfig.development;
        }
        const sequelize = new Sequelize(config);
        sequelize.addModels([User, Team, Member, Task, Project, DatabaseFile]);
        await sequelize.sync();
        return sequelize;
    },
}];