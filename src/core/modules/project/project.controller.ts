import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectDto } from './project.dto';
import { Project as ProjectEntity } from './project.entity';
// Add Roles //
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UserRole } from '../users/user.dto';
import { hasRoles } from '../auth/decorators/roles.decorators';
import { AuthGuard } from '@nestjs/passport';


@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @hasRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':idTim/projects')
  async addProjectToTeam(
    @Param('idTim') idTim: number,
    @Body() projectDto: ProjectDto,
  ): Promise<ProjectEntity> {
    try {
      const addedProject = await this.projectService.addProject(idTim, projectDto);
      return addedProject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @hasRoles(UserRole.SUPERADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/AllProject')
  async findAll(): Promise<ProjectEntity[]> {
    // Di sini, pastikan Anda mengambil data tim yang terkait dengan proyek
    return await this.projectService.findAll();
  }

  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Get('/projectProp')
  // async findFull(): Promise<ProjectEntity[]> {
  //   return await this.projectService.findFull();
  // }

  @Get('by-team/:idTim')
    async getProjectsByTeamId(@Param('idTim', new ParseIntPipe()) idTim: number) {
        try {
            const projects = await this.projectService.getProjectByIdTim(idTim);
            if (projects.length === 0) {
                throw new NotFoundException(`Tidak ada proyek ditemukan untuk tim dengan ID ${idTim}`);
            }
            return projects;
        } catch (error) {
            if (error instanceof NotFoundException) {
                // Tangani NotFoundException dengan mengirimkan respons dengan kode status 404
                return { message: error.message };
            }
            // Tangani kesalahan lain dengan mengirimkan respons dengan kode status 500
            return { message: 'Terjadi kesalahan saat memproses permintaan' };
        }
    }

  // @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() projectDto: ProjectDto,
  ): Promise<ProjectEntity> {
    // Di sini, pastikan Anda mengirimkan objek projectDto yang sesuai dengan perubahan Anda
    return await this.projectService.update(id, projectDto);
  }

  @hasRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    // Di sini, pastikan Anda menghapus proyek sesuai kebutuhan Anda
    await this.projectService.delete(id);
  }
}