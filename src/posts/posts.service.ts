import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostDocument } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async findAll(): Promise<PostDocument[]> {
    return this.postModel.find().exec();
  }

  async findAllUserPosts(id: string): Promise<PostDocument[]> {
    return await this.postModel.find({ user: id }).exec();
  }

  async findPostsBetweenDates(
    startDate: string,
    endDate: string,
  ): Promise<PostDocument[]> {
    return await this.postModel
      .find({ createdAt: { $gte: startDate, $lte: endDate } })
      .exec();
  }

  async findPostsByWordInTitle(word: string): Promise<PostDocument[]> {
    return await this.postModel
      .find({ title: { $regex: word, $options: 'i' } })
      .exec();
  }

  // TODO: Delete post and logout user
}
