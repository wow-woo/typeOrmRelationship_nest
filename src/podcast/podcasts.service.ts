import { Injectable } from '@nestjs/common';
import { CreateEpisodeDto } from './dtos/create-episode.dto';
import { CreatePodcastDto } from './dtos/create-podcast.dto';
import { UpdateEpisodeDto } from './dtos/update-episode.dto';
import { UpdatePodcastDto } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';
import { CoreOutput } from './dtos/output.dto';
import {
  PodcastOutput,
  PodcastSearchInput,
  EpisodesOutput,
  EpisodesSearchInput,
} from './dtos/podcast.dto';
import { In, Raw, Repository  } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PodcastsService {
  constructor(
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,

    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
  ) {}

  getAllPodcasts(): Promise<Podcast[]> {
    return this.podcastRepository.find({relations:['episodes']});
  }

  async createPodcast({
    title,
    category,
  }: CreatePodcastDto): Promise<CoreOutput> {
    const podcast = await this.podcastRepository.create({
      title,
      category,
      rating: 0,
      episodes: [],
    });
    await this.podcastRepository.save(podcast);
    return { ok: true, error: null };
  }

  async getPodcast(id: number): Promise<PodcastOutput> {
    const podcast = await this.podcastRepository.findOne(id);
    // const podcast = this.podcasts.find((podcast) => podcast.id === id);
    if (!podcast) {
      return {
        ok: false,
        error: `${id} id podcast doesn't exist!`,
      };
    }
    return {
      ok: true,
      podcast,
    };
  }

  async deletePodcast(id: number): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOneOrFail(id);

      await this.podcastRepository.remove(podcast);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'error haha',
      };
    }
  }

  async updatePodcast({ id, ...rest }: UpdatePodcastDto): Promise<CoreOutput> {
    try {
      await this.podcastRepository.findOneOrFail(id);
      await this.podcastRepository.update(id, rest);

      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async getEpisodes(podcastId: number): Promise<EpisodesOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId, { relations : ["episodes"]});
      if (!podcast) {
        return { ok: false, error: 'No episodes' };
      }
      return { ok: true, episodes:podcast.episodes };
    } catch (error) {
      return {
        ok: false,
        error: 'Failed to retrieve any episodes',
      };
    }
  }

  async createEpisode( {id:podcastId, title, category}: CreateEpisodeDto): Promise<EpisodesOutput> {
    try {
      const podcast = await this.podcastRepository.findOne({id:podcastId}, { relations : ['episodes']})
      const episode = await this.episodeRepository.create({
        title,category
      })
      console.log(podcast)
      const savedEpisode = await this.episodeRepository.save(episode)
      console.log(savedEpisode)

      podcast.episodes = [savedEpisode, ...podcast.episodes]

      console.log(podcast)
      await this.podcastRepository.save(podcast)

      return {
        ok:true,
        episodes:podcast.episodes
      }
    } catch (error) {
      return {
        ok:false,
        error
      } 
    }
  }

  async updateEpisode({
    podcastId,
    episodeId,
    ...rest
  }: UpdateEpisodeDto): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId, {relations:['episodes']});
      if (!podcast) {
        return { ok: false, error: "This podcast doesn't exist" };
      }

      const episode = podcast.episodes.find(item=>item.id === episodeId)
      if (!episode) {
        return { ok: false, error: "This episode doesn't exist" };
      }

      await this.episodeRepository.update(episode.id, rest);
      return { ok: true };
    } catch (error) {
      return { ok: false, error};
    }
  }

  async deleteEpisode({
    podcastId,
    episodeId,
  }: EpisodesSearchInput): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId, { relations : ['episodes']});
      if (!podcast) {
        return { ok: false, error: "This podcast doesn't exist" };
      }

      const episode = podcast.episodes.filter(item=>item.id == episodeId)
      if(!episode){
        return {ok:false, error:"This episode doesn't exist"}
      }

      await this.episodeRepository.remove(episode);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Failed to deleting a episode' };
    }
  }

}
