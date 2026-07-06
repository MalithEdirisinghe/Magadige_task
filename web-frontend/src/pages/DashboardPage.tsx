import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus, Sparkles, LogOut, CheckCircle2, Circle, Trash2,
  ChevronDown, ChevronUp, Loader2, Brain, ListTodo,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import {
  subscribeToTasks, addTask, toggleTask, deleteTask, updateSubTasks,
  type Task,
} from "../services/tasks";
import { breakdownTask, type SubTask } from "../services/gemini";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTasks(user.uid, setTasks);
    return unsub;
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;
    setAdding(true);
    try {
      await addTask(user.uid, newTitle.trim());
      setNewTitle("");
      toast.success("Task added!");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const handleAiMagic = async () => {
    if (!newTitle.trim() || !user) {
      toast.error("Enter a task first to use AI Magic ✦");
      return;
    }
    setAiLoading(true);
    const toastId = toast.loading("✦ AI is breaking down your task…");
    try {
      const subTasks = await breakdownTask(newTitle.trim());
      await addTask(user.uid, newTitle.trim(), subTasks);
      setNewTitle("");
      toast.success(`✦ Created ${subTasks.length} sub-tasks!`, { id: toastId });
    } catch (err) {
      toast.error("AI breakdown failed. Check your Gemini API key.", { id: toastId });
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleSubTask = async (task: Task, subIdx: number) => {
    const updated: SubTask[] = task.subTasks.map((st, i) =>
      i === subIdx ? { ...st, completed: !st.completed } : st
    );
    await updateSubTasks(task.id, updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="MagaDige Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-white">Magadige</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs text-white font-medium">
                {user?.email?.[0].toUpperCase() ?? "U"}
              </div>
              <span className="text-slate-300 text-sm">{user?.email}</span>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">My Tasks</h1>
          <p className="text-slate-400 text-sm">
            {completedCount} of {tasks.length} tasks completed
          </p>
          {tasks.length > 0 && (
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
            <div className="flex gap-3">
              <input
                id="task-input"
                type="text"
                placeholder="Add a new task… or describe something big for AI Magic ✦"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition min-w-0"
              />
              <button
                id="add-task-btn"
                type="submit"
                disabled={adding || !newTitle.trim()}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition disabled:opacity-40 shrink-0"
                title="Add task"
              >
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>

            {/* AI Magic Button */}
            <button
              id="ai-magic-btn"
              type="button"
              onClick={handleAiMagic}
              disabled={aiLoading || !newTitle.trim()}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/80 to-violet-600/80 hover:from-indigo-500/80 hover:to-violet-500/80 border border-indigo-500/30 text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {aiLoading ? "AI is thinking…" : "✦ AI Magic — Break it down"}
            </button>
          </div>
        </form>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">No tasks yet</p>
            <p className="text-slate-600 text-sm mt-1">Add your first task or use AI Magic ✦</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const expanded = expandedIds.has(task.id);
              const hasSubTasks = task.subTasks && task.subTasks.length > 0;
              const subDone = task.subTasks?.filter((s) => s.completed).length ?? 0;

              return (
                <div
                  key={task.id}
                  className={`backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 ${
                    task.completed
                      ? "bg-white/3 border-white/5 opacity-60"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Task row */}
                  <div className="flex items-center gap-3 p-4">
                    <button
                      id={`toggle-task-${task.id}`}
                      onClick={() => toggleTask(task.id, !task.completed)}
                      className="shrink-0 text-slate-400 hover:text-indigo-400 transition"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <span
                      className={`flex-1 font-medium text-sm sm:text-base ${
                        task.completed ? "line-through text-slate-500" : "text-white"
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Sub-task badge */}
                    {hasSubTasks && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 shrink-0">
                        {subDone}/{task.subTasks.length}
                      </span>
                    )}

                    {/* Expand sub-tasks */}
                    {hasSubTasks && (
                      <button
                        id={`expand-task-${task.id}`}
                        onClick={() => toggleExpand(task.id)}
                        className="shrink-0 text-slate-500 hover:text-slate-300 transition"
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      id={`delete-task-${task.id}`}
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 text-slate-600 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sub-tasks */}
                  {hasSubTasks && expanded && (
                    <div className="border-t border-white/5 px-4 pb-3 pt-2 space-y-2">
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-400" /> AI-generated sub-tasks
                      </p>
                      {task.subTasks.map((st, idx) => (
                        <div
                          key={st.id}
                          className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-white/3 hover:bg-white/5 transition group"
                        >
                          <button
                            id={`subtask-toggle-${task.id}-${idx}`}
                            onClick={() => handleToggleSubTask(task, idx)}
                            className="shrink-0 text-slate-500 hover:text-indigo-400 transition"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`text-sm flex-1 ${
                              st.completed ? "line-through text-slate-600" : "text-slate-300"
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
