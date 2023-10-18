import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MEMBER_REPOSITORY, TEAM_REPOSITORY } from 'src/core/constants';
import { Team } from './team.entity';
import { TeamDto } from './team.dto';
import { User } from '../users/User.entity';
import { Member } from '../member/member.entity';

@Injectable()
export class TeamService {
  constructor(
    @Inject(TEAM_REPOSITORY) private readonly teamRepository: typeof Team,
    @Inject(MEMBER_REPOSITORY) private readonly memberRepository: typeof Member,
  ) {}

  async create(team: TeamDto, userId: any): Promise<Team> {
    return await this.teamRepository.create<Team>({ ...team, userId });
  }

  async findAll(): Promise<Team[]> {
    return await this.teamRepository.findAll<Team>({
      include: [{ model: User, attributes: { exclude: ['password'] } }],
    });
  }

  async addMember(idTim: number, nip: string): Promise<Member> {
    // Cari tim berdasarkan idTim
    const team = await this.teamRepository.findByPk(idTim);

    // Jika tim tidak ditemukan, lempar NotFoundException
    if (!team) {
      throw new NotFoundException(`Tim dengan ID ${idTim} tidak ditemukan`);
    }

    // Cari anggota (user) berdasarkan nip
    const user = await User.findByPk(nip);

    // Jika anggota (user) tidak ditemukan, lempar NotFoundException
    if (!user) {
      throw new NotFoundException(`Anggota dengan ID ${nip} tidak ditemukan`);
    }
    // Tambahkan anggota ke dalam tim dengan menggunakan model Member
    const member = await this.memberRepository.create({
      teamId: team.idTim,
      userId: user.nip
      // Anda juga dapat menambahkan data tambahan ke dalam tabel Member sesuai kebutuhan.
    });

    // Mengambil tim yang diperbarui (opsional, tergantung pada kebutuhan Anda)
    const updatedTeam = await this.teamRepository.findByPk(idTim);

    return member;
  }

  async findall(): Promise<Member[]> {
    return await this.memberRepository.findAll({
      include: [{ all: true }],
    });
  }

  async findByUserId(userId: string): Promise<Team[]> {
    return await this.teamRepository.findAll<Team>({
      where: { userId }, // Filter by user ID
      include: [{ model: User, attributes: { exclude: ['password'] } }],
    });
  }

  async findMembersByTeamId(idTim: number): Promise<Member[]> {
    const members = await this.memberRepository.findAll({
      where: { teamId: idTim },
      include: [{ all: true }],
    });
  
    return members;
  }

  async deleteMember(idTim: number, nip: string): Promise<void> {
    // Cari tim berdasarkan idTim
    const team = await this.teamRepository.findByPk(idTim);
  
    // Jika tim tidak ditemukan, lempar NotFoundException
    if (!team) {
      throw new NotFoundException(`Tim dengan ID ${idTim} tidak ditemukan`);
    }
  
    // Cari anggota (user) berdasarkan nip
    const user = await User.findByPk(nip);
  
    // Jika anggota (user) tidak ditemukan, lempar NotFoundException
    if (!user) {
      throw new NotFoundException(`Anggota dengan ID ${nip} tidak ditemukan`);
    }
  
    // Cari entri anggota dalam tabel Member berdasarkan timId dan userId
    const member = await this.memberRepository.findOne({
      where: {
        teamId: team.idTim,
        userId: user.nip,
      },
    });
  
    // Jika entri anggota tidak ditemukan, lempar NotFoundException
    if (!member) {
      throw new NotFoundException(
        `Anggota dengan ID ${nip} tidak terkait dengan tim ID ${idTim}`
      );
    }
  
    // Hapus entri anggota dari tabel Member
    await member.destroy();
  }  
  
  async deleteTeam(idTim: number): Promise<void> {
    // Cari tim berdasarkan idTim
    const team = await this.teamRepository.findByPk(idTim);
  
    // Jika tim tidak ditemukan, lempar NotFoundException
    if (!team) {
      throw new NotFoundException(`Tim dengan ID ${idTim} tidak ditemukan`);
    }
  
    // Hapus tim dari tabel Team
    await team.destroy();
  }
  
  
}
