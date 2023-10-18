import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  MEMBER_REPOSITORY,
  PROJECT_REPOSITORY,
  TASK_REPOSITORY,
  TEAM_REPOSITORY,
} from 'src/core/constants';
import { Task } from './task.entity';
import { TaskDto } from './task.dto';
import { Team } from '../team/team.entity';
import { Member } from '../member/member.entity';
import { Project } from '../project/project.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: typeof Task,
    @Inject(TEAM_REPOSITORY) private readonly teamRepository: typeof Team,
    @Inject(MEMBER_REPOSITORY) private readonly memberRepository: typeof Member,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: typeof Project,
  ) {}

  async create(
    taskDto: TaskDto,
    teamId: number,
    memberId: number,
    projectId: number,
    forUser: string,
  ): Promise<Task> {
    // Pastikan idTim, memberId, dan projectId yang diberikan valid
    const team = await this.teamRepository.findByPk(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const member = await this.memberRepository.findByPk(memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const project = await this.projectRepository.findByPk(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Buat tugas dengan data yang telah Anda tambahkan
    const taskData = { ...taskDto, teamId, memberId, projectId };
    const createdTask = await this.taskRepository.create<Task>(taskData);

    // Sekarang Anda dapat mengembalikan tugas yang telah dibuat
    return createdTask;
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.findAll<Task>({
      include: [{ all: true }],
    });
  } 

  async findById(id: number): Promise<Task> {
    const task = await this.taskRepository.findByPk(id, {
      include: [{ all: true }], // Mengambil semua data terkait
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: number, taskDto: TaskDto): Promise<Task> {
    const task = await this.findById(id);

    // Di sini, Anda bisa menambahkan logika validasi data jika diperlukan
    // Sebelum melakukan pembaruan pada entitas Task.
    return await task.update(taskDto);
  }

  async delete(id: number): Promise<void> {
    const task = await this.findById(id);

    await task.destroy();

    // Setelah tugas dihapus, log pesan informasi.
    this.logger.log(`Tugas dengan ID ${id} telah dihapus.`);
  }
}
