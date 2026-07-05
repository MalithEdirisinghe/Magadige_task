import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { SubTask } from "./gemini";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  subTasks: SubTask[];
  createdAt: Date | null;
}

export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void
): () => void {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot) return;
    const tasks: Task[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Task, "id">),
      createdAt: d.data().createdAt?.toDate() ?? null,
    }));
    
    // Sort client-side by createdAt (descending)
    tasks.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.getTime() : 0;
      const timeB = b.createdAt ? b.createdAt.getTime() : 0;
      return timeB - timeA;
    });

    callback(tasks);
  }, (error) => {
    console.error("Firestore subscribeToTasks error:", error);
  });
}

export async function addTask(
  userId: string,
  title: string,
  subTasks: SubTask[] = []
): Promise<void> {
  await addDoc(collection(db, "tasks"), {
    title,
    completed: false,
    userId,
    subTasks,
    createdAt: serverTimestamp(),
  });
}

export async function toggleTask(taskId: string, completed: boolean): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), { completed });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", taskId));
}

export async function updateSubTasks(
  taskId: string,
  subTasks: SubTask[]
): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), { subTasks });
}
