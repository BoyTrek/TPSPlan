import { MEMBER_REPOSITORY } from "src/core/constants";
import { Member } from "./member.entity";

export const memberProviders = [{
    provide: MEMBER_REPOSITORY,
    useValue: Member
}]