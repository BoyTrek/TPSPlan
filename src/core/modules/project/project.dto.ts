import { Status } from './project.enum';

export class ProjectDto {
  readonly idProject?: number; // Ubah agar opsional
  readonly projectName: string;
  dueDate?: string;
  taskDesc?: string;
  status?: Status; // Tambahkan tanda ? untuk opsional
}
