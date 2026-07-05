import firestore from '@react-native-firebase/firestore';
import type {SubTask} from './gemini';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  subTasks: SubTask[];
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
}

import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
): () => void {
  const unsubscribe = firestore()
    .collection('tasks')
    .where('userId', '==', userId)
    .onSnapshot(
      snapshot => {
        if (!snapshot) return;
        const tasks: Task[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, 'id'>),
        }));
        
        // Sort client-side by createdAt (descending)
        tasks.sort((a, b) => {
          const timeA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : ((a.createdAt.seconds || 0) * 1000)) : 0;
          const timeB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : ((b.createdAt.seconds || 0) * 1000)) : 0;
          return timeB - timeA;
        });

        callback(tasks);
      },
      error => {
        console.error('Firestore subscribeToTasks error:', error);
      }
    );
  return unsubscribe;
}

export async function addTask(
  userId: string,
  title: string,
  subTasks: SubTask[] = [],
): Promise<void> {
  await firestore().collection('tasks').add({
    title,
    completed: false,
    userId,
    subTasks,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function toggleTask(
  taskId: string,
  completed: boolean,
): Promise<void> {
  await firestore().collection('tasks').doc(taskId).update({completed});
}

export async function deleteTask(taskId: string): Promise<void> {
  await firestore().collection('tasks').doc(taskId).delete();
}

export async function updateSubTasks(
  taskId: string,
  subTasks: SubTask[],
): Promise<void> {
  await firestore().collection('tasks').doc(taskId).update({subTasks});
}
