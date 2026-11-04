import type { Todo } from "../models/Todo";
import type { TodoRepository } from "./TodoRepository";

export class ApiTodoRepository implements TodoRepository {
  private apiUrl = "https://69b11abdadac80b427c3fff2.mockapi.io/api/v1/todoItem";

  async getAll(): Promise<Todo[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error(`GET: HTTP ${response.status}`);
    return (await response.json()) as Todo[];
  }

  async add(todo: Todo): Promise<Todo> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error(`POST: HTTP ${response.status}`);
    return (await response.json()) as Todo;
  }

  async update(id: string, data: Partial<Todo>): Promise<Todo> {
    const response = await fetch(`${this.apiUrl}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT: HTTP ${response.status}`);
    return (await response.json()) as Todo;
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`DELETE: HTTP ${response.status}`);
  }
}
