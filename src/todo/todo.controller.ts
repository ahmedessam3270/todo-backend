import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { UpdateTodoDTO } from './dto/update-todo.dto';
import { Todo } from './schema/todo.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateTodoDTO } from './dto/create-todo.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schema/user.schema';

@Controller('todo')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post()
  async addTodo(
    @Body() createTodoDTO: CreateTodoDTO,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.addTodo(createTodoDTO, user);
  }

  @Get()
  async getAllTodos(@CurrentUser() user: User): Promise<Todo[]> {
    return this.todoService.getAllTodo(user);
  }

  @Get(':id')
  async getTodoById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.getTodoById(id, user);
  }

  @Get('/category/:cat')
  async getTodoByCategory(
    @Param('cat') cat: string,
    @CurrentUser() user: User,
  ): Promise<Todo[]> {
    return this.todoService.getTodoByCategory(cat, user);
  }

  @Patch(':id')
  async updateTodo(
    @Param('id') id,
    @Body() updateTodoDTO: UpdateTodoDTO,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.updateTodo(id, updateTodoDTO, user);
  }

  @Delete(':id')
  async deleteTodo(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.deleteTodo(id, user);
  }
}
