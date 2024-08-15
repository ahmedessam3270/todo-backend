import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDTO } from './create-todo.dto';
import { IsBoolean } from 'class-validator';

export class UpdateTodoDTO extends PartialType(CreateTodoDTO) {
  @IsBoolean()
  complete: boolean;
}
