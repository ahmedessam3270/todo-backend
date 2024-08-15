import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;
}
