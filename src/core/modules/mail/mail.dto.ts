import {
    Table,
    Column,
    Model,
    DataType,
    BelongsTo,
    ForeignKey,
  } from 'sequelize-typescript';
  import { User } from '../users/user.entity';
  
  @Table
  export class PasswordResetToken extends Model<PasswordResetToken> {
    @Column({
      type: DataType.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataType.UUIDV4,
    })
    token: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    userId: number;
  
    @Column({
      type: DataType.DATE,
      allowNull: false,
    })
    expirationDate: Date;
  
    @BelongsTo(() => User)
    user: User;
  }
  