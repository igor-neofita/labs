import "./scss/style.scss";
import type { Todo } from "./models/Todo";
import type { TodoRepository } from "./repositories/TodoRepository";
import { ApiTodoRepository } from "./repositories/ApiTodoRepository";

const USER_ID = 21;

document.addEventListener("DOMContentLoaded", () => {
  const repository: TodoRepository = new ApiTodoRepository();
  const header = document.getElementById("mainHeader") as HTMLHeadingElement;
  const form = document.getElementById("todoForm") as HTMLFormElement;
  const list = document.getElementById("todoList") as HTMLElement;
  const template = document.getElementById("task-template") as HTMLTemplateElement;
  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  const loadingIndicator = document.getElementById("loadingIndicator") as HTMLElement;

  header.textContent += ` — Студент #${USER_ID}`;
  let currentEditId: string | null = null;
  let currentTasks: Todo[] = [];

  function input(name: string): HTMLInputElement {
    return form.elements.namedItem(name) as HTMLInputElement;
  }

  // MockAPI може повертати дату ISO, Unix-час у секундах або Unix-час у мілісекундах.
  function dateValue(value: string | number | undefined): string {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const n = Number(value);
    const parsed = Number.isFinite(n)
      ? new Date(n < 1e12 ? n * 1000 : n)
      : new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
  }

  function displayDate(value: string | number | undefined): string {
    const iso = dateValue(value);
    if (!iso) return "Без дати";
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  }

  function resetFormState(): void {
    currentEditId = null;
    form.reset();
  }

  form.addEventListener("reset", () => {
    currentEditId = null;
    submitBtn.classList.remove("btn--edit");
    submitBtn.classList.add("btn--primary");
    submitBtn.querySelector(".btn__text")!.textContent = "Додати задачу";
  });

  function addTaskToDOM(task: Todo, append = false): void {
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const card = fragment.querySelector(".task-card") as HTMLElement;
    card.dataset.id = task.id;
    if (task.isDone) card.classList.add("task-card--done");

    (card.querySelector(".task-card__id") as HTMLElement).textContent = String(task.id ?? "");
    (card.querySelector(".task-card__userid") as HTMLElement).textContent = String(task.userId);
    (card.querySelector(".task-card__title") as HTMLElement).textContent = task.title;
    (card.querySelector(".task-card__tag") as HTMLElement).textContent = task.tag;
    (card.querySelector(".task-card__desc") as HTMLElement).textContent = task.description;
    (card.querySelector(".task-card__deadline") as HTMLElement).textContent = displayDate(task.deadline);
    (card.querySelector(".task-card__created") as HTMLElement).textContent = displayDate(task.createdAt);
    if (task.isDone) {
      (card.querySelector(".task-card__status") as HTMLElement).textContent = "✓ Виконано";
      (card.querySelector(".btn--complete") as HTMLElement).style.opacity = "0.5";
    }
    append ? list.appendChild(fragment) : list.prepend(fragment);
  }

  async function fetchTodos(): Promise<void> {
    loadingIndicator.hidden = false;
    try {
      const data = await repository.getAll();
      currentTasks = data.filter((todo) => Number(todo.userId) === USER_ID);
      list.replaceChildren();
      currentTasks.forEach((task) => addTaskToDOM(task, true));
    } catch (error) {
      console.error(error);
      alert("Не вдалося завантажити завдання.");
    } finally {
      loadingIndicator.hidden = true;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const fields = {
      title: String(data.get("title") ?? "").trim(),
      description: String(data.get("description") ?? ""),
      tag: String(data.get("tag") ?? ""),
      deadline: String(data.get("deadline") ?? ""),
    };
    if (!fields.title) return;
    submitBtn.disabled = true;
    try {
      if (currentEditId) {
        await repository.update(currentEditId, fields);
        await fetchTodos();
      } else {
        const created = await repository.add({
          ...fields,
          userId: USER_ID,
          createdAt: Math.floor(Date.now() / 1000),
          isDone: false,
        });
        currentTasks.unshift(created);
        addTaskToDOM(created);
      }
      resetFormState();
    } catch (error) {
      console.error(error);
      alert(currentEditId ? "Помилка збереження змін." : "Помилка створення завдання.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  list.addEventListener("click", async (event) => {
    const btn = (event.target as HTMLElement).closest(".btn") as HTMLButtonElement | null;
    if (!btn) return;
    const card = btn.closest(".task-card") as HTMLElement | null;
    const taskId = card?.dataset.id;
    if (!card || !taskId) return;

    if (btn.classList.contains("btn--delete")) {
      if (!confirm("Видалити цю задачу з сервера?")) return;
      btn.disabled = true;
      try {
        await repository.remove(taskId);
        card.remove();
        currentTasks = currentTasks.filter((task) => task.id !== taskId);
        if (currentEditId === taskId) resetFormState();
      } catch (error) {
        console.error(error);
        alert("Помилка видалення.");
        btn.disabled = false;
      }
    }

    if (btn.classList.contains("btn--complete")) {
      const isCurrentlyDone = card.classList.contains("task-card--done");
      btn.disabled = true;
      try {
        await repository.update(taskId, { isDone: !isCurrentlyDone });
        card.classList.toggle("task-card--done");
        (card.querySelector(".task-card__status") as HTMLElement).textContent = isCurrentlyDone
          ? "Статус: В роботі" : "✓ Виконано";
        btn.style.opacity = isCurrentlyDone ? "1" : "0.5";
        const task = currentTasks.find((task) => task.id === taskId);
        if (task) task.isDone = !isCurrentlyDone;
      } catch (error) {
        console.error(error);
        alert("Помилка зміни статусу.");
      } finally {
        btn.disabled = false;
      }
    }

    if (btn.classList.contains("btn--edit-action")) {
      const task = currentTasks.find((task) => task.id === taskId);
      if (!task) return;
      currentEditId = taskId;
      input("title").value = task.title;
      (form.elements.namedItem("description") as HTMLTextAreaElement).value = task.description;
      (form.elements.namedItem("tag") as HTMLSelectElement).value = task.tag;
      input("deadline").value = dateValue(task.deadline);
      submitBtn.querySelector(".btn__text")!.textContent = "Зберегти зміни";
      submitBtn.classList.remove("btn--primary");
      submitBtn.classList.add("btn--edit");
      form.scrollIntoView({ behavior: "smooth" });
    }
  });

  fetchTodos();
});
