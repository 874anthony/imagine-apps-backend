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

  async create(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    const createPostDtoWithUser = {
      ...createPostDto,
      user: userId,
    };

    const createdPost = new this.postModel(createPostDtoWithUser);
    return createdPost.save();
  }

  async findAll(): Promise<PostDocument[]> {
    return this.postModel.find().populate('user').exec();
  }

  async findAllUserPosts(id: string, date?): Promise<PostDocument[]> {
    let query = this.postModel.find({ user: id });

    if (date) {
      const day = new Date(date);
      const startOfDay = new Date(day).setHours(0, 0, 0, 0);
      const endOfDay = new Date(day).setHours(23, 59, 59, 999);

      query = query.where('createdAt').gte(startOfDay).lt(endOfDay);
    }

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

  async findPostsByWordInTitleOrDate(
    word: string,
    date?,
  ): Promise<PostDocument[]> {
    let query = this.postModel.find();

    if (date) {
      const day = new Date(date);
      const startOfDay = new Date(day).setHours(0, 0, 0, 0);
      const endOfDay = new Date(day).setHours(23, 59, 59, 999);

      query = query.where('createdAt').gte(startOfDay).lt(endOfDay);
    }

    if (word) {
      // Sanitize input
      word = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query = query.where('title').regex(new RegExp(word, 'i'));
    }

    return await query.populate('user').exec();
  }

  async delete(userId: string, id: string): Promise<void> {
    const post = await this.postModel.findById(id).exec();
    const isOwner = post.user.toString() === userId;

    if (!isOwner) throw new UnauthorizedException('You are not the owner');

    await post.deleteOne().exec();
  }
}
