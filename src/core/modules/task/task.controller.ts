import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Put,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskDto } from './task.dto';
import { Task } from './task.entity';
import { hasRoles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UserRole } from '../users/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
export default class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @hasRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':teamId/:memberId/:projectId')
  async create(
    @Body() taskDto: TaskDto,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body('forUser') forUser: string,
  ): Promise<{ message: string; data?: Task } | { message: string }> {
    try {
      const createdTask = await this.taskService.create(
        taskDto,
        teamId,
        memberId,
        projectId,
        forUser,
      );
      return { message: 'Task created successfully', data: createdTask };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: error.message };
      }
    }
  }

  @hasRoles(UserRole.SUPERADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async findAll(): Promise<Task[]> {
    return await this.taskService.findAll();
  }

  @hasRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return await this.taskService.findById(id);
  }

  @hasRoles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() taskDto: TaskDto,
  ) {
    try {
      const updatedTask = await this.taskService.update(id, taskDto);
      return { message: 'Task updated successfully', data: updatedTask };
    } catch (error) {
      return { message: 'Failed to update task', error: error.message };
    }
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.taskService.delete(id);
      return { message: 'Task deleted successfully' };
    } catch (error) {
      return { message: 'Failed to delete task', error: error.message };
    }
  }
}
