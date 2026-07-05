import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../contexts/AuthContext';
import {subscribeToTasks, addTask, toggleTask, deleteTask, updateSubTasks, type Task} from '../services/tasks';
import {breakdownTask, type SubTask} from '../services/gemini';

function SwipeableTaskCard({
  task,
  onToggle,
  onDelete,
  onToggleSubTask,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onToggleSubTask: (idx: number) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      translateX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -100) {
        // Swipe left → delete
        Animated.timing(translateX, {toValue: -400, duration: 200, useNativeDriver: true}).start(() => {
          onDelete();
        });
      } else if (g.dx > 100) {
        // Swipe right → complete
        onToggle();
        Animated.spring(translateX, {toValue: 0, useNativeDriver: true}).start();
      } else {
        Animated.spring(translateX, {toValue: 0, useNativeDriver: true}).start();
      }
    },
  });

  const subDone = task.subTasks?.filter(s => s.completed).length ?? 0;
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  const completeOpacity = translateX.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const deleteOpacity = translateX.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.cardWrapper}>
      {/* Complete hint (appears on swipe right) */}
      <Animated.View style={[styles.completeHint, {opacity: completeOpacity}]}>
        <Text style={styles.completeHintText}>✓ Complete</Text>
      </Animated.View>

      {/* Delete hint (appears on swipe left) */}
      <Animated.View style={[styles.deleteHint, {opacity: deleteOpacity}]}>
        <Text style={styles.deleteHintText}>🗑 Delete</Text>
      </Animated.View>

      <Animated.View
        style={[styles.card, task.completed && styles.cardDone, {transform: [{translateX}]}]}
        {...panResponder.panHandlers}>
        <View style={styles.cardRow}>
          <TouchableOpacity onPress={onToggle} style={styles.checkBtn}>
            <Text style={[styles.checkIcon, task.completed && styles.checkDone]}>
              {task.completed ? '●' : '○'}
            </Text>
          </TouchableOpacity>

          <Text
            style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
            numberOfLines={2}>
            {task.title}
          </Text>

          {hasSubTasks && (
            <View style={styles.subBadge}>
              <Text style={styles.subBadgeText}>{subDone}/{task.subTasks.length}</Text>
            </View>
          )}

          {hasSubTasks && (
            <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
              <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {hasSubTasks && expanded && (
          <View style={styles.subList}>
            <Text style={styles.subListLabel}>✦ AI sub-tasks</Text>
            {task.subTasks.map((st, idx) => (
              <TouchableOpacity
                key={st.id}
                style={styles.subItem}
                onPress={() => onToggleSubTask(idx)}>
                <Text style={[styles.subCheck, st.completed && styles.subCheckDone]}>
                  {st.completed ? '●' : '○'}
                </Text>
                <Text style={[styles.subTitle, st.completed && styles.subTitleDone]}>
                  {st.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

export default function DashboardScreen() {
  const {user, logout} = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user) {return;}
    const unsub = subscribeToTasks(user.uid, setTasks);
    return unsub;
  }, [user]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !user) {return;}
    setAdding(true);
    try {
      await addTask(user.uid, newTitle.trim());
      setNewTitle('');
    } catch {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setAdding(false);
    }
  };

  const handleAiMagic = async () => {
    if (!newTitle.trim() || !user) {
      return Alert.alert('Tip', 'Enter a task description first to use AI Magic ✦');
    }
    setAiLoading(true);
    try {
      const subTasks = await breakdownTask(newTitle.trim());
      await addTask(user.uid, newTitle.trim(), subTasks);
      setNewTitle('');
      Alert.alert('✦ AI Magic', `Created ${subTasks.length} sub-tasks!`);
    } catch (err) {
      Alert.alert('AI Error', 'AI breakdown failed. Check your Gemini API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleSubTask = async (task: Task, idx: number) => {
    const updated: SubTask[] = task.subTasks.map((st, i) =>
      i === idx ? {...st, completed: !st.completed} : st,
    );
    await updateSubTasks(task.id, updated);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e2a" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogo}><Text style={styles.navLogoIcon}>✦</Text></View>
          <Text style={styles.navTitle}>Magadige</Text>
        </View>
        <TouchableOpacity testID="logout-btn" onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsTitle}>My Tasks</Text>
        <Text style={styles.statsCount}>{completedCount}/{tasks.length} done</Text>
      </View>
      {tasks.length > 0 && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {width: `${(completedCount / tasks.length) * 100}%`},
            ]}
          />
        </View>
      )}

      {/* Task list */}
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubText}>Add one below or use AI Magic ✦</Text>
          </View>
        }
        renderItem={({item}) => (
          <SwipeableTaskCard
            task={item}
            onToggle={() => toggleTask(item.id, !item.completed)}
            onDelete={() => deleteTask(item.id)}
            onToggleSubTask={idx => handleToggleSubTask(item, idx)}
          />
        )}
      />

      {/* Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <TextInput
            testID="task-input"
            style={styles.input}
            placeholder="Add a task…"
            placeholderTextColor="#475569"
            value={newTitle}
            onChangeText={setNewTitle}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity
            testID="add-task-btn"
            style={[styles.addBtn, (!newTitle.trim() || adding) && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={adding || !newTitle.trim()}>
            {adding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addBtnText}>+</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          testID="ai-magic-btn"
          style={[styles.aiBtn, (!newTitle.trim() || aiLoading) && styles.aiBtnDisabled]}
          onPress={handleAiMagic}
          disabled={aiLoading || !newTitle.trim()}>
          {aiLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.aiBtnText}>✦ AI Magic — Break it down</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0e2a'},
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  navBrand: {flexDirection: 'row', alignItems: 'center', gap: 8},
  navLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoIcon: {fontSize: 14, color: '#fff'},
  navTitle: {fontSize: 18, fontWeight: '700', color: '#fff'},
  logoutBtn: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)'},
  logoutText: {color: '#94a3b8', fontSize: 13},
  statsRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8},
  statsTitle: {fontSize: 22, fontWeight: '700', color: '#fff'},
  statsCount: {fontSize: 13, color: '#64748b'},
  progressBar: {height: 4, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20, borderRadius: 2, marginBottom: 12},
  progressFill: {height: 4, backgroundColor: '#6366f1', borderRadius: 2},
  list: {paddingHorizontal: 16, paddingTop: 8, paddingBottom: 180},
  emptyState: {alignItems: 'center', paddingTop: 80},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {color: '#64748b', fontSize: 16, fontWeight: '600'},
  emptySubText: {color: '#334155', fontSize: 13, marginTop: 4},
  cardWrapper: {position: 'relative', marginBottom: 12},
  deleteHint: {
    position: 'absolute',
    right: 12,
    top: 2,
    bottom: 2,
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  deleteHintText: {color: '#f87171', fontWeight: '700', fontSize: 13},
  completeHint: {
    position: 'absolute',
    left: 12,
    top: 2,
    bottom: 2,
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  completeHintText: {color: '#34d399', fontWeight: '700', fontSize: 13},
  card: {
    backgroundColor: '#151433',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardDone: {opacity: 0.6},
  cardRow: {flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10},
  checkBtn: {padding: 4},
  checkIcon: {fontSize: 20, color: '#475569'},
  checkDone: {color: '#6366f1'},
  taskTitle: {flex: 1, color: '#f1f5f9', fontSize: 15, fontWeight: '500'},
  taskTitleDone: {textDecorationLine: 'line-through', color: '#475569'},
  subBadge: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  subBadgeText: {color: '#818cf8', fontSize: 11, fontWeight: '600'},
  expandBtn: {padding: 4},
  expandIcon: {color: '#64748b', fontSize: 12},
  subList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
  subListLabel: {color: '#6366f1', fontSize: 11, fontWeight: '600', marginBottom: 8},
  subItem: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6},
  subCheck: {fontSize: 14, color: '#475569'},
  subCheckDone: {color: '#6366f1'},
  subTitle: {flex: 1, color: '#94a3b8', fontSize: 14},
  subTitleDone: {textDecorationLine: 'line-through', color: '#334155'},
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(15,14,42,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  inputRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addBtnDisabled: {opacity: 0.4},
  addBtnText: {color: '#fff', fontSize: 24, fontWeight: '300'},
  aiBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  aiBtnDisabled: {opacity: 0.4},
  aiBtnText: {color: '#fff', fontWeight: '600', fontSize: 15},
});
