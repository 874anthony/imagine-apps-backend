/* eslint-disable prettier/prettier */
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  @IsNotEmpty()
  @MaxLength(280)
  message: string;
}
