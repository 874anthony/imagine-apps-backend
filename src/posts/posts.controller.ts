import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDocument } from './schemas/post.schema';

@Controller('posts')
export class PostsController {
  constructor(private postService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<PostDocument> {
    return await this.postService.create(createPostDto);
  }

  @Get()
  async findAll(): Promise<PostDocument[]> {
    return await this.postService.findAll();
  }

  @Get('my-posts')
  async findAllUserPosts(@Request() request): Promise<PostDocument[]> {
    return await this.postService.findAllUserPosts(request.user.id);
  }

  @Get('between-dates')
  async findPostsBetweenDates(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PostDocument[]> {
    return await this.postService.findPostsBetweenDates(startDate, endDate);
  }

  @Get('word-in-title')
  async findPostsByWordInTitle(
    @Query('word') word: string,
  ): Promise<PostDocument[]> {
    return await this.postService.findPostsByWordInTitle(word);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Request() request, @Param('id') id: string): Promise<void> {
    await this.postService.delete(request.user.id, id);
  }
}
