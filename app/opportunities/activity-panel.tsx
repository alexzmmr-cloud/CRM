"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { addNote, addTask, setTaskDone } from "@/app/actions/activity";

type ActivityItem = {
  id: string;
  type: string;
  content: string;
  dueDate: Date | null;
  done: boolean | null;
};

export function ActivityPanel({
  opportunityId,
  activities,
}: {
  opportunityId: string;
  activities: ActivityItem[];
}) {
  const router = useRouter();
  const noteFormRef = useRef<HTMLFormElement>(null);
  const taskFormRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAddNote(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addNote(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      noteFormRef.current?.reset();
      router.refresh();
    });
  }

  function handleAddTask(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addTask(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      taskFormRef.current?.reset();
      router.refresh();
    });
  }

  function handleToggleDone(id: string, done: boolean) {
    startTransition(async () => {
      const result = await setTaskDone(id, done);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="activity-panel">
      {error && <p className="form-error">{error}</p>}

      <ul>
        {activities.length === 0 && (
          <li className="muted">Пока нет заметок и задач.</li>
        )}
        {activities.map((activity) => (
          <li key={activity.id}>
            {activity.type === "task" ? (
              <label className="task-item">
                <input
                  type="checkbox"
                  checked={activity.done ?? false}
                  disabled={isPending}
                  onChange={(e) =>
                    handleToggleDone(activity.id, e.target.checked)
                  }
                />
                <span className={activity.done ? "done" : ""}>
                  {activity.content}
                </span>
                {activity.dueDate && (
                  <span className="muted">
                    {" "}
                    (до {activity.dueDate.toLocaleDateString("ru-RU")})
                  </span>
                )}
              </label>
            ) : (
              <span>Заметка: {activity.content}</span>
            )}
          </li>
        ))}
      </ul>

      <form ref={noteFormRef} action={handleAddNote} className="lead-form">
        <input type="hidden" name="opportunityId" value={opportunityId} />
        <label>
          Новая заметка
          <textarea name="content" required />
        </label>
        <button type="submit" disabled={isPending}>
          Добавить заметку
        </button>
      </form>

      <form ref={taskFormRef} action={handleAddTask} className="lead-form">
        <input type="hidden" name="opportunityId" value={opportunityId} />
        <label>
          Новая задача
          <input name="content" required />
        </label>
        <label>
          Срок
          <input name="dueDate" type="date" required />
        </label>
        <button type="submit" disabled={isPending}>
          Добавить задачу
        </button>
      </form>
    </div>
  );
}
