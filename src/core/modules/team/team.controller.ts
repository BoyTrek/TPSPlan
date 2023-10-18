import {
  Controller,
  Get,
  Delete,
  Param,
  Post,
  Request,
  Body,
  UseGuards,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { Team as TeamEntity } from './team.entity';
import { Member as MemberEntity } from '../member/member.entity';
import { AuthGuard } from '@nestjs/passport';
import { TeamDto } from './team.dto';
import { MemberDTO } from '../member/member.dto';
import { hasRoles } from '../auth/decorators/roles.decorators';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UserRole } from '../users/user.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async findAll() {
    // Dapatkan semua tim dalam database
    return await this.teamService.findAll();
  }

  @hasRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/:userNip')
  async findByUserId(@Param('userNip') userId: number): Promise<TeamEntity[]> {
    try {
      const teams = await this.teamService.findByUserId(userId);
      return teams;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({ name: 'namaTim', type: 'string' }, )
  @Post()
  async create(@Body() team: TeamDto, @Request() req): Promise<TeamEntity> {
    // Buat tim baru dan kembalikan tim yang baru dibuat
    return await this.teamService.create(team, req.user.nip);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':idTim/add-member')
  async addMemberToTeam(
    @Param('idTim') idTim: number,
    @Body() memberDTO: MemberDTO,
  ): Promise<MemberEntity> {
    try {
      const updatedTeam = await this.teamService.addMember(
        idTim,
        memberDTO.memberId,
      );
      return updatedTeam;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // @Get(':idTim/members')
  // async findMembersByTeamId(
  //   @Param('idTim') idTim: number,
  // ): Promise<MemberEntity[]> {
  //   try {
  //     const members = await this.teamService.findMembersByTeamId(idTim);
  //     return members;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(error.message);
  //     }
  //     throw error;
  //   }
  // }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':idTim/members/:nip')
  async deleteMember(
    @Param('idTim') idTim: number,
    @Param('nip') nip: number,
  ): Promise<void> {
    try {
      await this.teamService.deleteMember(idTim, nip);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':idTim')
  async deleteTeam(@Param('idTim') idTim: number): Promise<void> {
    try {
      await this.teamService.deleteTeam(idTim);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
