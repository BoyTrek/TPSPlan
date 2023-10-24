import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProjectDto } from './project.dto';
import { Project } from './project.entity';
import { PROJECT_REPOSITORY, TEAM_REPOSITORY } from 'src/core/constants';
import { Team } from '../team/team.entity';
import { Task } from '../task/task.entity';


@Injectable()
export class ProjectService {
    projects: any;
    constructor(
        @Inject(PROJECT_REPOSITORY) private readonly projectRepository: typeof Project,
        @Inject(TEAM_REPOSITORY) private readonly teamRepository: typeof Team

      ){}

      async addProject(idTim: number, projectDto: ProjectDto): Promise<Project> {
        // Cari tim berdasarkan idTim
        const team = await this.teamRepository.findByPk(idTim);
    
        // Jika tim tidak ditemukan, lempar NotFoundException
        if (!team) {
          throw new NotFoundException(`Tim dengan ID ${idTim} tidak ditemukan`);
        }
    
        // Buat proyek baru dengan nilai dari projectDto
        const project = await this.projectRepository.create({
          ...projectDto, // Menggunakan seluruh nilai dari projectDto
          idTim: team.idTim, // Set idTim dengan idTim dari tim yang ditemukan
        });
    
        // Mengambil proyek yang diperbarui (opsional, tergantung pada kebutuhan Anda)
        const updatedTeam = await this.teamRepository.findByPk(idTim);
    
        return project;
    }
    
  async findAll(): Promise<Project[]> {
    return await this.projectRepository.findAll({
        include: [{all: true}]
    })
  }

  // async findFull(): Promise<Project[]> {
  //   const projects = await this.projectRepository.findAll({
  //     include: [
  //       { model: Team, include: [{ association: Team.associations.user }] }, // Mengambil informasi tim yang terkait dengan proyek
  //       { model: Task }, // Mengambil informasi tugas yang terkait dengan proyek
  //     ],
  //   });

  //   return projects;
  // }

  findById(id: number): Project {
    const project = this.projects.find((p) => p.idProject === id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async getProjectByIdTim(idTim: number): Promise<Project[]> {
    const projects = await this.projectRepository.findAll({
        where: {
            idTim: idTim,
        },
        include: [{ all: true }], // Jika Anda ingin mengambil data terkait dengan proyek, termasuk data tim
    });
    if (!projects || projects.length === 0) {
        throw new NotFoundException(`Tidak ada proyek ditemukan untuk tim dengan ID ${idTim}`);
    }
  
    return projects;
  }

  update(id: number, projectDto: ProjectDto): Promise<Project> {
    return this.projectRepository.findByPk(id)
      .then(async (project) => {
        if (!project) {
          throw new NotFoundException(`Project with ID ${id} not found`);
        }
        await project.update({
          ...projectDto,
        });
        return project;
      });
}

async delete(id: number): Promise<void> {
    // Temukan proyek berdasarkan id
    const project = await this.projectRepository.findByPk(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    // Hapus proyek
    await project.destroy();
}

}
