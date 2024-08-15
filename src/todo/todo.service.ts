import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './schema/todo.schema';
import { Model, Types } from 'mongoose';
import { CreateTodoDTO } from './dto/create-todo.dto';
import { UpdateTodoDTO } from './dto/update-todo.dto';
import { User } from 'src/users/schema/user.schema';
@Injectable()
export class TodoService {
  constructor(@InjectModel('Todo') private readonly todoModel: Model<Todo>) {}

  async getAllTodo(user: User): Promise<Todo[]> {
    return this.todoModel
      .find({
        user: user._id,
      })
      .select('-user')
      .exec();
  }

  async getTodoById(id: string, user: User): Promise<Todo> {
    const todo = await this.todoModel
      .findOne({
        _id: new Types.ObjectId(id),
        user: user._id,
      })
      .select('-user')
      .exec();
    return todo;
  }

  async getTodoByCategory(cat: string, user: User): Promise<Todo[]> {
    const todo = await this.todoModel
      .find({ category: cat, user: user._id })
      .select('-user')
      .exec();
    return todo;
  }

  async addTodo(createTodoDTO: CreateTodoDTO, user: User): Promise<Todo> {
    const newTodo = await this.todoModel.create({
      user: user._id,
      ...createTodoDTO,
    });
    return newTodo;
  }

  async updateTodo(
    id: string,
    updateTodoDTO: UpdateTodoDTO,
    user: User,
  ): Promise<Todo> {
    const updatedTodo = await this.todoModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), user: user._id },
        updateTodoDTO,
        { new: true },
      )
      .select('-user');
    return updatedTodo;
  }

  async deleteTodo(id: string, user: User): Promise<any> {
    const deletedTodo = await this.todoModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      user: user._id,
    });
    return deletedTodo;
  }
}
