import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostDocument } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: mongoose.Model<Post>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async findAll(): Promise<PostDocument[]> {
    return this.postModel.find().exec();
  }

  async findAllUserPosts(id: string, date?): Promise<PostDocument[]> {
    let query = this.postModel.find({ user: id });

    if (date) query = query.where('createdAt').gte(date);
    return await query.exec();
  }

  async findPostsBetweenDates(
    startDate: string,
    endDate: string,
  ): Promise<PostDocument[]> {
    return await this.postModel
      .find({ createdAt: { $gte: startDate, $lte: endDate } })
      .exec();
  }

  async findPostsByWordInTitleAndDate(
    word: string,
    date?,
  ): Promise<PostDocument[]> {
    let query = this.postModel.find({ title: { $regex: word, $options: 'i' } });

    if (date) query = query.where('createdAt').gte(date);
    return await query.exec();
  }

  async delete(userId: string, id: string): Promise<void> {
    const post = await this.postModel.findById(id).exec();
    const isOwner = post.user.toString() === userId;

    if (!isOwner) throw new UnauthorizedException('You are not the owner');

    await post.deleteOne().exec();
  }
}
