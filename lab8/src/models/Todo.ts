export interface Todo {
  id?: string;
  userId: number;
  title: string;
  description: string;
  tag: string;
  deadline: string;
  createdAt?: number | string;
  isDone: boolean;
}
