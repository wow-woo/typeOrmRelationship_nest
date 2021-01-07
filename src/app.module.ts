import { Episode } from './podcast/entities/episode.entity';
import { Podcast } from './podcast/entities/podcast.entity';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PodcastsModule } from './podcast/podcasts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:process.env.NODE_ENV === 'dev' ? '.env.dev' :'.env.prod',
      validationSchema:Joi.object({
        NODE_ENV:Joi.string().valid('prod', 'dev'),
        DB_DATABASE:Joi.string()
      })
    }),
    GraphQLModule.forRoot({ autoSchemaFile: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      logging: true,
      database: process.env.DB_DATABASE,
      synchronize: true,
      entities:[Podcast, Episode]
    }),
    PodcastsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
