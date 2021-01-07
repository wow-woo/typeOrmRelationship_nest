import { InputType, ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Podcast } from './podcast.entity';

@InputType('EpisodeInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Episode {
  @Field((_) => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field((_) => String)
  @Column()
  title: string;

  @Field((_) => String)
  @Column()
  category: string;
  
  @ManyToOne(() => Podcast, (podcast) => podcast.episodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  podcast: Podcast;
}
