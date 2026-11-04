import type { Todo } from "../models/Todo";

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  add(todo: Todo): Promise<Todo>;
  update(id: string, data: Partial<Todo>): Promise<Todo>;
  remove(id: string): Promise<void>;
}
