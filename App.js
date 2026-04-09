// Diced Fitness — React Native (migrated from dice_fitness_v5.jsx)
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  SafeAreaView, Animated, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from './firebase';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
} from 'firebase/auth';
import {
  collection, doc, addDoc, setDoc, deleteDoc,
  getDocs, orderBy, query, serverTimestamp, increment, updateDoc,
} from 'firebase/firestore';

// ============================================================
// BODY PART CONFIG
// ============================================================
const BODY_PART_CONFIG = [
  { id:"chest", label:"Chest", icon:"💪", color:"#E74C3C", subs:[
    { id:"upper_chest", label:"Upper Chest" }, { id:"mid_chest", label:"Mid Chest" },
    { id:"lower_chest", label:"Lower Chest" }, { id:"inner_chest", label:"Inner Chest" },
  ]},
  { id:"back", label:"Back", icon:"🔙", color:"#3498DB", subs:[
    { id:"lats", label:"Lats" }, { id:"rhomboids", label:"Rhomboids" }, { id:"lower_back", label:"Lower Back" },
  ]},
  { id:"shoulders", label:"Shoulders", icon:"🏔️", color:"#9B59B6", subs:[
    { id:"front_delts", label:"Front Delts" }, { id:"lateral_delts", label:"Lateral Delts" },
    { id:"rear_delts", label:"Rear Delts" }, { id:"traps", label:"Traps" },
  ]},
  { id:"arms", label:"Arms", icon:"💪", color:"#E67E22", subs:[
    { id:"biceps", label:"Biceps" }, { id:"triceps", label:"Triceps" }, { id:"forearms", label:"Forearms" },
  ]},
  { id:"legs", label:"Legs", icon:"🦵", color:"#2ECC71", subs:[
    { id:"quads", label:"Quads" }, { id:"hamstrings", label:"Hamstrings" },
    { id:"glutes", label:"Glutes" }, { id:"calves", label:"Calves" }, { id:"inner_thigh", label:"Inner Thigh" },
  ]},
  { id:"core", label:"Core", icon:"🔥", color:"#F39C12", subs:[
    { id:"upper_abs", label:"Upper Abs" }, { id:"lower_abs", label:"Lower Abs" },
    { id:"obliques", label:"Obliques" }, { id:"deep_core", label:"Deep Core" },
  ]},
];

const EQUIP = [
  { id:"dumbbells",          label:"Dumbbells",     icon:"🏋️" },
  { id:"barbell",            label:"Barbell",        icon:"🥇" },
  { id:"functional_trainer", label:"Cable Machine",  icon:"⚙️" },
  { id:"smith_machine",      label:"Smith Machine",  icon:"🔩" },
  { id:"kettlebell",         label:"Kettlebell",     icon:"🫙" },
  { id:"bands",              label:"Bands",          icon:"🎗️" },
  { id:"bodyweight",         label:"Bodyweight",     icon:"🤸" },
];

// ============================================================
// DICE FACE COMPONENT
// ============================================================
const DiceFace = ({ value, size = 66, rolling = false }) => {
  const dots = {
    1: [[50,50]],
    2: [[25,25],[75,75]],
    3: [[25,25],[50,50],[75,75]],
    4: [[25,25],[75,25],[25,75],[75,75]],
    5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
    6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
  }[value] || [];
  const dotSize = size * 0.19;
  return (
    <LinearGradient
      colors={rolling ? ['#FF4400', '#AA0000'] : ['#EE0000', '#880000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size, height: size,
        borderRadius: size * 0.17,
        borderWidth: 2.5,
        borderColor: '#600',
        flexShrink: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      {dots.map(([x, y], i) => (
        <View key={i} style={{
          position: 'absolute',
          left: (x / 100) * size - dotSize / 2,
          top: (y / 100) * size - dotSize / 2,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: '#FFF',
        }} />
      ))}
    </LinearGradient>
  );
};

// ============================================================
// SHARED COMPONENTS
// ============================================================
const SL = ({ children }) => (
  <Text style={{ fontSize: 11, letterSpacing: 2.5, color: '#FF6B35', marginBottom: 7, fontWeight: '800', textTransform: 'uppercase' }}>
    {children}
  </Text>
);

const Btn = ({ on, click, children }) => (
  <TouchableOpacity onPress={click} style={{
    flex: 1, minWidth: 90, padding: 10, borderRadius: 10,
    borderWidth: on ? 2 : 2,
    borderColor: on ? '#FF6B35' : 'rgba(255,255,255,0.08)',
    backgroundColor: on ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.03)',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  }}>
    <Text style={{ fontSize: 13, fontWeight: '600', color: on ? '#FF6B35' : '#666' }}>{children}</Text>
  </TouchableOpacity>
);

const SmBtn = ({ on, click, children }) => (
  <TouchableOpacity onPress={click} style={{
    flex: 1, paddingVertical: 10, borderRadius: 9,
    borderWidth: 2,
    borderColor: on ? '#FF6B35' : 'rgba(255,255,255,0.06)',
    backgroundColor: on ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.02)',
    alignItems: 'center',
  }}>
    <Text style={{ fontSize: 14, fontWeight: '700', color: on ? '#FF6B35' : '#666' }}>{children}</Text>
  </TouchableOpacity>
);

const BtnFull = ({ outline, click, children }) => {
  if (outline) {
    return (
      <TouchableOpacity onPress={click} style={{
        flex: 1, padding: 14, borderRadius: 12,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'transparent', alignItems: 'center',
      }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#999' }}>{children}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={click} style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
      <LinearGradient colors={['#FF6B35', '#FF2D2D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: 14, alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const RangePicker = ({ min, max, setMin, setMax, options }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
    <Text style={{ color: '#888', fontSize: 12 }}>Min</Text>
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {options.map(n => (
        <TouchableOpacity key={n} onPress={() => { setMin(n); if (n > max) setMax(n); }}
          style={{ width: 34, height: 34, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
            borderColor: min === n ? '#FF6B35' : 'rgba(255,255,255,0.06)',
            backgroundColor: min === n ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.02)' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: min === n ? '#FF6B35' : '#666' }}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={{ color: '#555' }}>—</Text>
    <Text style={{ color: '#888', fontSize: 12 }}>Max</Text>
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {options.map(n => (
        <TouchableOpacity key={n} onPress={() => { setMax(n); if (n < min) setMin(n); }}
          style={{ width: 34, height: 34, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
            borderColor: max === n ? '#FF6B35' : 'rgba(255,255,255,0.06)',
            backgroundColor: max === n ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.02)' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: max === n ? '#FF6B35' : '#666' }}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const HistoryLogExpander = ({ log, getSL, getGC }) => {
  const [open, setOpen] = useState(false);
  if (!log || log.length === 0) return null;
  const groups = [];
  log.forEach((entry) => {
    const last = groups[groups.length - 1];
    if (last && last.name === entry.name) {
      last.sets.push(entry);
    } else {
      groups.push({ name: entry.name, sub: entry.sub, group: entry.group, sets: [entry] });
    }
  });
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(!open)}
        style={{ paddingVertical: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        <Text style={{ fontSize: 10, color: '#888', letterSpacing: 1 }}>{open ? 'HIDE' : 'VIEW'} EXERCISE LOG</Text>
        <Text style={{ fontSize: 10, color: '#666' }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 6 }}>
          {groups.map((g, gi) => {
            const color = getGC(g.group);
            return (
              <View key={gi} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#DDD' }}>{g.name}</Text>
                  <Text style={{ fontSize: 9, color: '#555' }}>{getSL(g.sub)}</Text>
                </View>
                {g.sets.map((s, si) => (
                  <View key={si} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, marginBottom: 1 }}>
                    <Text style={{ fontSize: 9, color: '#555', minWidth: 12 }}>{si + 1}.</Text>
                    <Text style={{ fontSize: 11, color: '#AAA' }}>
                      {s.reps} reps{s.weight ? ` @ ${s.weight === 'BW' ? 'BW' : s.weight + ' lbs'}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ============================================================
// BODY HEATMAP
// ============================================================
const MONTH_MAP = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
const parseDate = (str) => {
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  const m = str.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
  if (m) return new Date(parseInt(m[3]), MONTH_MAP[m[1]] ?? 0, parseInt(m[2]));
  return null;
};
const formatDate = (str) => {
  const d = parseDate(str);
  if (!d) return str;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatTime = (str) => {
  const d = parseDate(str);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const SNARKY_COLD = [
  "it's been a while, stud",
  "collecting dust over here",
  "remember this one?",
  "lonely muscle alert",
  "on vacation apparently",
  "ghosting the gym",
  "needs some love",
];

const BodyHeatmap = ({ workoutHistory }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorked = {};
  workoutHistory.forEach((w) => {
    if (!w.muscles) return;
    const wDate = parseDate(w.date);
    if (!wDate) return;
    wDate.setHours(0, 0, 0, 0);
    w.muscles.forEach(m => {
      if (!lastWorked[m.id] || wDate > lastWorked[m.id]) lastWorked[m.id] = wDate;
    });
  });

  const getDays = (id) => {
    const last = lastWorked[id];
    if (!last) return null;
    return Math.round((today - last) / 86400000);
  };

  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 10, letterSpacing: 2, color: '#FF6B35', fontWeight: '800',
        textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>Muscle Status</Text>

      <View style={{ gap: 6 }}>
        {BODY_PART_CONFIG.map((g) => {
          const days = getDays(g.id);
          const color = g.color;
          const isHot = days !== null && days <= 3;
          const statusText = days === null ? null
            : days === 0 ? 'hit today'
            : days === 1 ? 'hit yesterday'
            : days <= 3 ? `hit ${days} days ago`
            : null;
          const snark = (!isHot)
            ? SNARKY_COLD[Math.abs(g.id.charCodeAt(0) + g.id.charCodeAt(g.id.length - 1)) % SNARKY_COLD.length]
            : null;

          return (
            <View key={g.id} style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
              backgroundColor: isHot ? color + '12' : 'rgba(255,255,255,0.02)',
              borderWidth: 1,
              borderColor: isHot ? color + '35' : 'rgba(255,255,255,0.05)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 18 }}>{g.icon}</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: isHot ? color : '#666' }}>{g.label}</Text>
                  {isHot && statusText && (
                    <Text style={{ fontSize: 11, color: color, fontWeight: '600', marginTop: 1 }}>{statusText}</Text>
                  )}
                  {!isHot && (
                    <Text style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginTop: 1 }}>{snark}</Text>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {isHot ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color,
                      shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 }} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: color }}>
                      {days === 0 ? 'FRESH' : days === 1 ? 'WARM' : days === 2 ? 'COOLING' : 'FADING'}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 11, color: '#444', fontWeight: '600' }}>
                    {days === null ? '—' : `${days}d ago`}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // App state
  const [screen, setScreen] = useState('landing');
  const [selEquip, setSelEquip] = useState(['dumbbells', 'functional_trainer', 'bodyweight']);
  const [selSubs, setSelSubs] = useState({});
  const [expanded, setExpanded] = useState({});
  const [numDice, setNumDice] = useState(2);
  const [diceMode, setDiceMode] = useState('fixed');
  const [diceMixMin, setDiceMixMin] = useState(1);
  const [diceMixMax, setDiceMixMax] = useState(3);
  const [goalRolls, setGoalRolls] = useState(30);
  const [rotMode, setRotMode] = useState('fixed');
  const [fixedRot, setFixedRot] = useState(1);
  const [mixRotMin, setMixRotMin] = useState(1);
  const [mixRotMax, setMixRotMax] = useState(4);
  const [diceVals, setDiceVals] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [options, setOptions] = useState(null);
  const [curEx, setCurEx] = useState(null);
  const [rollsLeft, setRollsLeft] = useState(0);
  const [rotTarget, setRotTarget] = useState(0);
  const [totalRolls, setTotalRolls] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [log, setLog] = useState([]);
  const [skipLog, setSkipLog] = useState([]);
  const [done, setDone] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentDiceCount, setCurrentDiceCount] = useState(2);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [customExercises, setCustomExercises] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [sharedExercises, setSharedExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(true);

  // Add exercise form state
  const [addGroup, setAddGroup] = useState('');
  const [addSub, setAddSub] = useState('');
  const [addEquip, setAddEquip] = useState('');
  const [addName, setAddName] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [addSuccess, setAddSuccess] = useState('');

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeRef = useRef(null);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    if (rolling) {
      shakeRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ])
      );
      shakeRef.current.start();
    } else {
      shakeRef.current?.stop();
      shakeAnim.setValue(0);
    }
  }, [rolling]);

  // Shared exercises are loaded inside loadUserData after auth

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        loadUserData(u.uid);
      } else {
        setExercisesLoading(false);
      }
    });
    return unsub;
  }, []);

  // Firestore loaders
  const loadUserData = async (uid) => {
    try {
      const sharedSnap = await getDocs(collection(db, 'exercises'));
      const exList = sharedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('[Diced] Shared exercises loaded:', exList.length);
      setSharedExercises(exList);
    } catch (e) {
      console.error('[Diced] Failed to load shared exercises:', e.code, e.message);
      Alert.alert('Exercise Load Error', `Could not load exercises from Firestore.\n\nError: ${e.code || e.message}\n\nFix: Update Firestore security rules to allow authenticated reads of the exercises collection.`);
    }
    try {
      const exSnap = await getDocs(collection(db, 'users', uid, 'exercises'));
      setCustomExercises(exSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('[Diced] Failed to load custom exercises:', e.code, e.message);
    }
    try {
      const wSnap = await getDocs(
        query(collection(db, 'users', uid, 'workouts'), orderBy('createdAt', 'desc'))
      );
      setWorkoutHistory(wSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('[Diced] Failed to load workout history:', e.code, e.message);
    }
    setExercisesLoading(false);
  };

  // Auth handlers
  const handleAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter email and password.'); return;
    }
    setAuthSubmitting(true); setAuthError('');
    try {
      if (authMode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        try { await updateDoc(doc(db, 'users', cred.user.uid), { email: authEmail.trim(), lastActive: new Date().toISOString().split('T')[0] }); } catch (_) {}
      } else {
        const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: authEmail.trim(),
          name: '',
          status: 'trial',
          role: 'user',
          joined: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          workouts: 0,
          gymId: null,
          expires: null,
        });
      }
      setAuthEmail(''); setAuthPassword('');
    } catch (e) {
      const msgs = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account with that email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account already exists with that email.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-credential': 'Incorrect email or password.',
      };
      setAuthError(msgs[e.code] || 'Something went wrong. Try again.');
    }
    setAuthSubmitting(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        signOut(auth);
        setCustomExercises([]);
        setWorkoutHistory([]);
        setScreen('landing');
      }},
    ]);
  };

  // Firestore writers
  const saveCustom = async (list) => {
    setCustomExercises(list);
  };

  const addExerciseToFirestore = async (ex) => {
    if (!user) return null;
    const ref = await addDoc(collection(db, 'users', user.uid, 'exercises'), ex);
    return ref.id;
  };

  const updateExerciseInFirestore = async (id, ex) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'exercises', id), ex);
  };

  const deleteExerciseFromFirestore = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'exercises', id));
  };

  const saveHistory = async (list) => {
    setWorkoutHistory(list);
  };

  const saveWorkoutToFirestore = async (workout) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'workouts'), {
      ...workout,
      createdAt: serverTimestamp(),
    });
    try { await updateDoc(doc(db, 'users', user.uid), { workouts: increment(1), lastActive: new Date().toISOString().split('T')[0] }); } catch (_) {}
  };

  const deleteWorkoutFromFirestore = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'workouts', id));
  };

  const toggleSub = (gid, sid) => setSelSubs(p => {
    const c = p[gid] || [];
    if (c.includes(sid)) {
      const u = c.filter(s => s !== sid);
      if (!u.length) { const n = { ...p }; delete n[gid]; return n; }
      return { ...p, [gid]: u };
    }
    return { ...p, [gid]: [...c, sid] };
  });

  const toggleGroup = (g) => setSelSubs(p => {
    const all = g.subs.map(s => s.id);
    const c = p[g.id] || [];
    if (c.length === all.length) { const n = { ...p }; delete n[g.id]; return n; }
    return { ...p, [g.id]: all };
  });

  const getExercises = useCallback(() => {
    const selectedSubIds = Object.values(selSubs).flat();
    const results = [];
    // Shared library
    sharedExercises.forEach(ex => {
      if (selectedSubIds.includes(ex.sub) && selEquip.includes(ex.equip)) {
        results.push(ex);
      }
    });
    // User custom exercises
    customExercises.forEach(ce => {
      if (selectedSubIds.includes(ce.sub) && selEquip.includes(ce.equip)) {
        results.push({ name: ce.name, desc: ce.desc, sub: ce.sub, group: ce.group, equip: ce.equip });
      }
    });
    return results;
  }, [selSubs, selEquip, sharedExercises, customExercises]);

  const pickOptions = useCallback((exclude) => {
    const all = getExercises();
    if (!all.length) return [];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const picks = [];
    for (const e of shuffled) {
      if (picks.length >= 3) break;
      if (exclude && e.name === exclude) continue;
      if (!picks.find(p => p.name === e.name)) picks.push(e);
    }
    return picks;
  }, [getExercises]);

  const getDiceCount = useCallback(() => {
    if (diceMode === 'fixed') return numDice;
    return Math.floor(Math.random() * (diceMixMax - diceMixMin + 1)) + diceMixMin;
  }, [diceMode, numDice, diceMixMin, diceMixMax]);

  const getRotCount = useCallback(() => {
    if (rotMode === 'fixed') return fixedRot;
    return Math.floor(Math.random() * (mixRotMax - mixRotMin + 1)) + mixRotMin;
  }, [rotMode, fixedRot, mixRotMin, mixRotMax]);

  const rollsLeftRef = useRef(0);
  const curExRef = useRef(null);
  const rotTargetRef = useRef(0);
  const totalRollsRef = useRef(0);
  const totalRepsRef = useRef(0);

  const rollDice = useCallback(() => {
    if (rolling || done) return;
    setRolling(true); setShowInfo(false); setOptions(null);
    const dc = getDiceCount();
    setCurrentDiceCount(dc);
    let count = 0;
    const iv = setInterval(() => {
      setDiceVals(Array.from({ length: dc }, () => Math.floor(Math.random() * 6) + 1));
      count++;
      if (count >= 14) {
        clearInterval(iv);
        const final = Array.from({ length: dc }, () => Math.floor(Math.random() * 6) + 1);
        setDiceVals(final);
        const reps = final.reduce((a, b) => a + b, 0);
        const currentRL = rollsLeftRef.current;
        const currentEx = curExRef.current;
        if (!currentEx || currentRL <= 0) {
          const opts = pickOptions(currentEx?.name);
          if (opts.length > 0) setOptions(opts.map(o => ({ ...o, reps })));
          const rc = getRotCount();
          rotTargetRef.current = rc;
          setRotTarget(rc);
          rollsLeftRef.current = rc;
          setRollsLeft(rc);
        } else {
          rollsLeftRef.current = currentRL - 1;
          setRollsLeft(currentRL - 1);
          const ex = { ...currentEx, reps, weight: null };
          curExRef.current = { ...currentEx, reps };
          setCurEx({ ...currentEx, reps });
          totalRepsRef.current += reps;
          setTotalReps(totalRepsRef.current);
          setLog(p => [...p, ex]);
          setSelectedWeight(null);
        }
        totalRollsRef.current += 1;
        setTotalRolls(totalRollsRef.current);
        if (totalRollsRef.current >= goalRolls) setDone(true);
        setRolling(false);
      }
    }, 70);
  }, [rolling, done, goalRolls, getDiceCount, getRotCount, pickOptions]);

  const applyWeight = (w) => {
    setSelectedWeight(w);
    setLog(p => {
      if (p.length === 0) return p;
      const copy = [...p];
      copy[copy.length - 1] = { ...copy[copy.length - 1], weight: w };
      return copy;
    });
  };

  const selectExercise = (ex) => {
    const exEntry = { ...ex, weight: null };
    curExRef.current = ex;
    setCurEx(ex);
    totalRepsRef.current += ex.reps;
    setTotalReps(totalRepsRef.current);
    setLog(p => [...p, exEntry]);
    if (options) options.forEach(o => { if (o.name !== ex.name) setSkipLog(p => [...p, { name: o.name, sub: o.sub, group: o.group, equip: o.equip }]); });
    setOptions(null);
    setSelectedWeight(null);
    rollsLeftRef.current -= 1;
    setRollsLeft(rollsLeftRef.current);
  };

  const reset = () => {
    setTotalRolls(0); setTotalReps(0); setLog([]); setSkipLog([]); setCurEx(null); setOptions(null);
    setRollsLeft(0); setRotTarget(0); setDone(false); setDiceVals(Array(numDice).fill(1));
    setShowInfo(false); setCurrentDiceCount(numDice); setSelectedWeight(null);
    rollsLeftRef.current = 0; curExRef.current = null; rotTargetRef.current = 0;
    totalRollsRef.current = 0; totalRepsRef.current = 0;
  };

  useEffect(() => {
    if (done && log.length > 0) {
      const workout = {
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        totalRolls, totalReps,
        uniqueExercises: [...new Set(log.map(e => e.name))].length,
        skipped: skipLog.length,
        muscles: BODY_PART_CONFIG.filter(g => log.some(e => e.group === g.id)).map(g => ({
          id: g.id, label: g.label, icon: g.icon, color: g.color,
          reps: log.filter(e => e.group === g.id).reduce((a, b) => a + b.reps, 0),
        })),
        log: log.map(e => ({ name: e.name, sub: e.sub, group: e.group, equip: e.equip || null, reps: e.reps, weight: e.weight || null })),
      };
      // Update local state immediately so heatmap reflects the workout right away
      setWorkoutHistory(prev => [workout, ...prev]);
      // Also persist to Firestore
      saveWorkoutToFirestore(workout).then(() => {
        loadUserData(user.uid); // refresh history from Firestore
      }).catch(() => {});
    }
  }, [done]);

  const hasSel = Object.keys(selSubs).length > 0 && selEquip.length > 0;
  const totalSubs = Object.values(selSubs).flat().length;
  const getSL = (id) => { for (const g of BODY_PART_CONFIG) for (const s of g.subs) if (s.id === id) return s.label; return id; };
  const getGC = (id) => BODY_PART_CONFIG.find(g => g.id === id)?.color || '#FF6B35';
  const diceRange = d => d === 1 ? '1-6' : d === 2 ? '2-12' : d === 3 ? '3-18' : d === 4 ? '4-24' : '5-30';

  const getCurrentExSets = () => {
    if (!curEx) return [];
    const sets = [];
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].name === curEx.name) sets.unshift(log[i]);
      else break;
    }
    return sets;
  };

  const getPR = (exerciseName) => {
    let best = null;
    workoutHistory.forEach(w => {
      if (w.log) w.log.forEach(e => {
        if (e.name === exerciseName && e.weight && e.weight !== 'BW') {
          if (best === null || e.weight > best) best = e.weight;
        }
      });
    });
    log.forEach(e => {
      if (e.name === exerciseName && e.weight && e.weight !== 'BW') {
        if (best === null || e.weight > best) best = e.weight;
      }
    });
    return best;
  };

  const resetAddForm = () => {
    setAddGroup(''); setAddSub(''); setAddEquip(''); setAddName(''); setAddDesc(''); setEditingId(null);
  };

  const handleSaveExercise = async () => {
    if (!addGroup || !addSub || !addEquip || !addName.trim()) return;
    const data = { group: addGroup, sub: addSub, equip: addEquip, name: addName.trim(), desc: addDesc.trim() };
    if (editingId) {
      await updateExerciseInFirestore(editingId, data);
      setCustomExercises(prev => prev.map(e => e.id === editingId ? { id: editingId, ...data } : e));
      setAddSuccess('Exercise updated!');
    } else {
      const newId = await addExerciseToFirestore(data);
      setCustomExercises(prev => [...prev, { id: newId, ...data }]);
      setAddSuccess('Exercise added!');
    }
    resetAddForm();
    setTimeout(() => setAddSuccess(''), 2000);
  };

  const handleDeleteExercise = (id) => {
    Alert.alert('Delete Exercise', 'Remove this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteExerciseFromFirestore(id);
        setCustomExercises(prev => prev.filter(e => e.id !== id));
      }},
    ]);
  };

  const handleEditExercise = (ex) => {
    setAddGroup(ex.group); setAddSub(ex.sub); setAddEquip(ex.equip);
    setAddName(ex.name); setAddDesc(ex.desc); setEditingId(ex.id);
  };

  const availableSubs = addGroup ? BODY_PART_CONFIG.find(g => g.id === addGroup)?.subs || [] : [];

  const shakeInterp = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-8deg', '0deg', '8deg'] });

  // ==================== RENDER ====================

  // Auth loading splash
  if (authLoading || exercisesLoading) {
    return (
      <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#16213e']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
        <Text style={{ fontSize: 48, fontWeight: '900', fontStyle: 'italic', color: '#FF6B35' }}>DICED</Text>
        <ActivityIndicator color="#FF6B35" style={{ marginTop: 24 }} />
      </LinearGradient>
    );
  }

  // Auth screen
  if (!user) {
    return (
      <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
        <StatusBar style="light" />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
              {/* Logo */}
              <Text style={{ fontSize: 64, fontWeight: '900', fontStyle: 'italic', color: '#FF6B35',
                textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 1 }}>
                DICED
              </Text>
              <Text style={{ color: '#FF6B35', fontSize: 11, letterSpacing: 6, fontWeight: '700', marginBottom: 40 }}>
                FITNESS
              </Text>

              {/* Card */}
              <View style={{ width: '100%', maxWidth: 380, backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                {/* Tab toggle */}
                <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 12, padding: 4, marginBottom: 24 }}>
                  {['login', 'signup'].map(mode => (
                    <TouchableOpacity key={mode} onPress={() => { setAuthMode(mode); setAuthError(''); }}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center',
                        backgroundColor: authMode === mode ? 'rgba(255,107,53,0.2)' : 'transparent' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700',
                        color: authMode === mode ? '#FF6B35' : '#666' }}>
                        {mode === 'login' ? 'Log In' : 'Sign Up'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Email */}
                <Text style={S.formLabel}>Email</Text>
                <TextInput
                  value={authEmail} onChangeText={setAuthEmail}
                  placeholder="you@example.com" placeholderTextColor="#444"
                  autoCapitalize="none" keyboardType="email-address"
                  style={[S.textInput, { marginBottom: 14 }]}
                />

                {/* Password */}
                <Text style={S.formLabel}>Password</Text>
                <TextInput
                  value={authPassword} onChangeText={setAuthPassword}
                  placeholder={authMode === 'signup' ? 'Min 6 characters' : 'Your password'}
                  placeholderTextColor="#444"
                  secureTextEntry
                  style={[S.textInput, { marginBottom: 6 }]}
                />

                {/* Error */}
                {authError ? (
                  <Text style={{ color: '#E74C3C', fontSize: 12, marginBottom: 12, marginTop: 6 }}>{authError}</Text>
                ) : <View style={{ height: 18 }} />}

                {/* Submit */}
                <TouchableOpacity onPress={handleAuth} disabled={authSubmitting}
                  style={{ borderRadius: 12, overflow: 'hidden', marginTop: 4 }}>
                  <LinearGradient colors={authSubmitting ? ['#555','#555'] : ['#FF6B35','#FF2D2D']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ padding: 15, alignItems: 'center' }}>
                    {authSubmitting
                      ? <ActivityIndicator color="#FFF" />
                      : <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 }}>
                          {authMode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
                        </Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* ==================== LANDING ==================== */}
        {screen === 'landing' && (
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {/* Floating dice */}
            <Animated.View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, transform: [{ translateY: floatAnim }] }}>
              {[5, 3, 6].map((v, i) => <DiceFace key={i} value={v} size={44} />)}
            </Animated.View>

            {/* Logo */}
            <Text style={{ fontSize: 72, fontWeight: '900', fontStyle: 'italic', color: '#FF6B35',
              textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 1 }}>
              DICED
            </Text>
            <Text style={{ color: '#FF6B35', fontSize: 11, letterSpacing: 6, fontWeight: '700', textTransform: 'uppercase' }}>FITNESS</Text>
            <Text style={{ color: '#555', fontSize: 10, letterSpacing: 3, marginTop: 4, marginBottom: 40 }}>ROLL · REP · REPEAT</Text>

            {/* Main Options */}
            <View style={{ width: '100%', maxWidth: 420, gap: 14 }}>
              <TouchableOpacity onPress={() => setScreen('setup')} style={S.landingCard}>
                <LinearGradient colors={['#FF6B35', '#FF2D2D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={S.landingIconBg}>
                  <Text style={{ fontSize: 24 }}>🎲</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={S.landingCardTitle}>START WORKOUT</Text>
                  <Text style={S.landingCardSub}>Roll the dice and get after it</Text>
                </View>
                <Text style={{ color: '#FF6B35', fontSize: 18 }}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setScreen('history')} style={[S.landingCard, { borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                <LinearGradient colors={['#3498DB', '#2980B9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={S.landingIconBg}>
                  <Text style={{ fontSize: 24 }}>📋</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={S.landingCardTitle}>PREVIOUS WORKOUTS</Text>
                  <Text style={S.landingCardSub}>
                    {workoutHistory.length > 0 ? `${workoutHistory.length} workout${workoutHistory.length !== 1 ? 's' : ''} logged` : 'No workouts yet'}
                  </Text>
                </View>
                <Text style={{ color: '#3498DB', fontSize: 18 }}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setScreen('addExercise')} style={[S.landingCard, { borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                <LinearGradient colors={['#2ECC71', '#27AE60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={S.landingIconBg}>
                  <Text style={{ fontSize: 24 }}>➕</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={S.landingCardTitle}>ADD EXERCISE</Text>
                  <Text style={S.landingCardSub}>
                    {customExercises.length > 0 ? `${customExercises.length} custom exercise${customExercises.length !== 1 ? 's' : ''}` : 'Create your own moves'}
                  </Text>
                </View>
                <Text style={{ color: '#2ECC71', fontSize: 18 }}>→</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 32 }}>
              <Text style={{ color: '#333', fontSize: 10, letterSpacing: 1 }}>v5.2</Text>
              <Text style={{ color: '#333', fontSize: 10 }}>·</Text>
              <Text style={{ color: '#444', fontSize: 10 }}>{user?.email}</Text>
              <Text style={{ color: '#333', fontSize: 10 }}>·</Text>
              <TouchableOpacity onPress={handleSignOut}>
                <Text style={{ color: '#555', fontSize: 10, textDecorationLine: 'underline' }}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ==================== SETUP ==================== */}
        {screen === 'setup' && (
          <ScrollView contentContainerStyle={{ padding: 16, maxWidth: 520, alignSelf: 'center', width: '100%' }}>
            <View style={S.screenHeader}>
              <TouchableOpacity onPress={() => setScreen('landing')} style={S.backBtn}>
                <Text style={S.backBtnText}>← Home</Text>
              </TouchableOpacity>
              <Text style={S.screenTitle}>WORKOUT SETUP</Text>
              <View style={{ width: 55 }} />
            </View>

            <SL>EQUIPMENT</SL>
            <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
              {EQUIP.map(eq => (
                <Btn key={eq.id} on={selEquip.includes(eq.id)}
                  click={() => setSelEquip(p => p.includes(eq.id) ? p.filter(e => e !== eq.id) : [...p, eq.id])}>
                  {eq.icon} {eq.label}
                </Btn>
              ))}
            </View>

            <SL>TARGET MUSCLES — {totalSubs} selected</SL>
            <View style={{ gap: 5, marginBottom: 18 }}>
              {BODY_PART_CONFIG.map(g => {
                const gs = selSubs[g.id] || [];
                const allSel = gs.length === g.subs.length;
                const some = gs.length > 0;
                const exp = expanded[g.id];
                return (
                  <View key={g.id} style={{
                    borderRadius: 11,
                    borderWidth: some ? 2 : 2,
                    borderColor: some ? g.color + '44' : 'rgba(255,255,255,0.06)',
                    backgroundColor: some ? g.color + '08' : 'rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 11 }}>
                      <TouchableOpacity onPress={() => toggleGroup(g)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Text style={{ fontSize: 18 }}>{g.icon}</Text>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: some ? g.color : '#777' }}>{g.label}</Text>
                        {some && (
                          <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, backgroundColor: g.color + '22' }}>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: g.color }}>{allSel ? 'ALL' : `${gs.length}/${g.subs.length}`}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setExpanded(p => ({ ...p, [g.id]: !p[g.id] }))}
                        style={{ padding: 8 }}>
                        <Text style={{ color: '#555', fontSize: 12 }}>{exp ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                    </View>
                    {exp && (
                      <View style={{ paddingHorizontal: 11, paddingBottom: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                        {g.subs.map(s => {
                          const on = gs.includes(s.id);
                          return (
                            <TouchableOpacity key={s.id} onPress={() => toggleSub(g.id, s.id)} style={{
                              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18,
                              borderWidth: 1.5, borderColor: on ? g.color : 'rgba(255,255,255,0.08)',
                              backgroundColor: on ? g.color + '20' : 'rgba(255,255,255,0.03)',
                            }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: on ? g.color : '#666' }}>{s.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <SL>DICE COUNT (reps per roll)</SL>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              <Btn on={diceMode === 'fixed'} click={() => setDiceMode('fixed')}>Fixed</Btn>
              <Btn on={diceMode === 'mix'} click={() => setDiceMode('mix')}>Mix 🔀</Btn>
            </View>
            {diceMode === 'fixed' ? (
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', gap: 5, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity key={n} onPress={() => { setNumDice(n); setDiceVals(Array(n).fill(1)); }}
                      style={{ flex: 1, paddingVertical: 8, borderRadius: 9, borderWidth: 2, alignItems: 'center', gap: 4,
                        borderColor: numDice === n ? '#FF6B35' : 'rgba(255,255,255,0.06)',
                        backgroundColor: numDice === n ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.02)' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: numDice === n ? '#FF6B35' : '#666' }}>{n}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                        {Array.from({ length: n }).map((_, i) => <DiceFace key={i} value={1} size={14} />)}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ color: '#555', fontSize: 11 }}>{diceRange(numDice)} reps per roll</Text>
              </View>
            ) : (
              <View style={{ marginBottom: 18 }}>
                <RangePicker label="dice" min={diceMixMin} max={diceMixMax} setMin={setDiceMixMin} setMax={setDiceMixMax} options={[1, 2, 3, 4, 5]} />
                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
                  Randomly {diceMixMin}-{diceMixMax} dice per roll ({diceRange(diceMixMin)} to {diceRange(diceMixMax)} reps)
                </Text>
              </View>
            )}

            <SL>EXERCISE ROTATION (sets per exercise)</SL>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              <Btn on={rotMode === 'fixed'} click={() => setRotMode('fixed')}>Fixed</Btn>
              <Btn on={rotMode === 'mix'} click={() => setRotMode('mix')}>Mix 🔀</Btn>
            </View>
            {rotMode === 'fixed' ? (
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <SmBtn key={n} on={fixedRot === n} click={() => setFixedRot(n)}>{n}</SmBtn>
                  ))}
                </View>
                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
                  {fixedRot === 1 ? 'New exercise every roll' : `${fixedRot} sets before switching`}
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 18 }}>
                <RangePicker label="rot" min={mixRotMin} max={mixRotMax} setMin={setMixRotMin} setMax={setMixRotMax} options={[1, 2, 3, 4, 5, 6, 7]} />
                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Randomly {mixRotMin}-{mixRotMax} sets per exercise</Text>
              </View>
            )}

            <SL>TOTAL ROLLS</SL>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 22 }}>
              {[15, 20, 30, 50, 100].map(g => (
                <SmBtn key={g} on={goalRolls === g} click={() => setGoalRolls(g)}>{g}</SmBtn>
              ))}
            </View>

            <TouchableOpacity onPress={() => { if (hasSel) { reset(); setScreen('workout'); } }} disabled={!hasSel}
              style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
              <LinearGradient
                colors={hasSel ? ['#FF6B35', '#FF2D2D'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ padding: 17, alignItems: 'center' }}>
                <Text style={{ color: hasSel ? '#FFF' : '#555', fontSize: 17, fontWeight: '800', letterSpacing: 2 }}>
                  {hasSel ? '🎲  LET\'S ROLL' : 'SELECT MUSCLES TO START'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ==================== WORKOUT ==================== */}
        {screen === 'workout' && (
          <View style={{ flex: 1, maxWidth: 520, alignSelf: 'center', width: '100%' }}>
            <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <TouchableOpacity onPress={() => setScreen('setup')} style={S.backBtn}>
                  <Text style={S.backBtnText}>← Setup</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FF6B35' }}>DICED FITNESS</Text>
                <View style={{ width: 55 }} />
              </View>

              {/* Progress bar */}
              <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 6, overflow: 'hidden' }}>
                <View style={{ width: `${Math.min((totalRolls / goalRolls) * 100, 100)}%`, height: '100%', borderRadius: 3, backgroundColor: '#FF6B35' }} />
              </View>

              {/* Stats row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, paddingVertical: 6 }}>
                {[
                  { l: 'ROLLS', v: `${totalRolls}/${goalRolls}` },
                  { l: 'REPS', v: totalReps },
                  { l: 'UNIQUE', v: [...new Set(log.map(e => e.name))].length },
                  { l: 'SKIPPED', v: skipLog.length },
                ].map((s, i) => (
                  <View key={i} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 19, fontWeight: '800', color: i === 3 ? '#E74C3C' : '#FF6B35', lineHeight: 22 }}>{s.v}</Text>
                    <Text style={{ fontSize: 8, color: '#555', letterSpacing: 1.5, marginTop: 2 }}>{s.l}</Text>
                  </View>
                ))}
              </View>

              {/* Set tracker dots */}
              {rotTarget > 1 && curEx && !done && !options && (
                <View style={{ alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {Array.from({ length: rotTarget }, (_, i) => (
                      <View key={i} style={{ width: 7, height: 7, borderRadius: 4,
                        backgroundColor: i >= rollsLeft ? '#FF6B35' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </View>
                  <Text style={{ fontSize: 9, color: '#555', marginTop: 2 }}>Set {rotTarget - rollsLeft} of {rotTarget}</Text>
                </View>
              )}

              {/* Dice */}
              <Animated.View style={{ flexDirection: 'row', justifyContent: 'center', gap: currentDiceCount > 3 ? 7 : 10,
                marginBottom: 12, flexWrap: 'wrap', transform: [{ rotate: shakeInterp }] }}>
                {diceVals.map((v, i) => (
                  <DiceFace key={i} value={v}
                    size={currentDiceCount > 3 ? 48 : currentDiceCount > 2 ? 56 : 64}
                    rolling={rolling} />
                ))}
              </Animated.View>

              {/* Exercise picker */}
              {options && !rolling && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ textAlign: 'center', color: '#888', fontSize: 12, marginBottom: 10, fontWeight: '600' }}>
                    PICK YOUR EXERCISE — {options[0]?.reps} REPS
                  </Text>
                  <View style={{ gap: 8 }}>
                    {options.map((opt, i) => (
                      <TouchableOpacity key={i} onPress={() => selectExercise(opt)} style={{
                        padding: 14, borderRadius: 12,
                        borderWidth: 1.5, borderColor: 'rgba(255,107,53,0.25)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                      }}>
                        <Text style={{ fontSize: 9, letterSpacing: 2, color: getGC(opt.group), textTransform: 'uppercase', marginBottom: 2 }}>
                          {getSL(opt.sub)} • {EQUIP.find(e => e.id === opt.equip)?.label}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFF' }}>{opt.name}</Text>
                        <Text style={{ fontSize: 12, color: '#999', marginTop: 3 }}>{opt.desc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Current exercise */}
              {curEx && !rolling && !options && (
                <View>
                  <View style={{ alignItems: 'center', marginBottom: 4 }}>
                    <Text>
                      <Text style={{ fontSize: 32, fontWeight: '900', color: '#FF6B35' }}>{curEx.reps}</Text>
                      <Text style={{ color: '#777', fontSize: 13 }}> REPS</Text>
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={{
                    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
                    padding: 12, marginBottom: 10,
                    borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)',
                  }}>
                    <Text style={{ fontSize: 9, letterSpacing: 2, color: getGC(curEx.group), textTransform: 'uppercase', marginBottom: 2 }}>
                      {getSL(curEx.sub)} • {EQUIP.find(e => e.id === curEx.equip)?.label}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFF' }}>{curEx.name}</Text>
                    {showInfo
                      ? <Text style={{ color: '#AAA', fontSize: 13, marginTop: 6, lineHeight: 20 }}>{curEx.desc}</Text>
                      : <Text style={{ color: '#444', fontSize: 10, marginTop: 4, textAlign: 'center' }}>tap for details</Text>
                    }
                  </TouchableOpacity>

                  {/* Weight picker */}
                  <View style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 10, letterSpacing: 2, color: '#666', textTransform: 'uppercase' }}>Weight used (optional)</Text>
                      {selectedWeight !== null && (
                        <TouchableOpacity onPress={() => applyWeight(null)}>
                          <Text style={{ color: '#666', fontSize: 10, textDecorationLine: 'underline' }}>clear</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity onPress={() => { const next = selectedWeight === null ? 5 : Math.max(5, selectedWeight === 'BW' ? 5 : selectedWeight - 5); applyWeight(next); }}
                        style={S.weightArrowBtn}>
                        <Text style={{ color: '#AAA', fontSize: 20, fontWeight: '700' }}>−</Text>
                      </TouchableOpacity>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 4 }}>
                          {['BW', ...Array.from({ length: 80 }, (_, i) => (i + 1) * 5)].map(w => {
                            const isActive = w === 'BW' ? selectedWeight === 'BW' : selectedWeight === w;
                            return (
                              <TouchableOpacity key={w} onPress={() => applyWeight(isActive ? null : w)} style={{
                                minWidth: w === 'BW' ? 38 : 34, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center',
                                borderWidth: 1.5, borderColor: isActive ? '#FF6B35' : 'rgba(255,255,255,0.06)',
                                backgroundColor: isActive ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.02)',
                              }}>
                                <Text style={{ fontSize: 11, fontWeight: isActive ? '700' : '500', color: isActive ? '#FF6B35' : '#555' }}>
                                  {w === 'BW' ? 'BW' : w}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>
                      <TouchableOpacity onPress={() => { const next = selectedWeight === null ? 5 : selectedWeight === 'BW' ? 5 : Math.min(400, selectedWeight + 5); applyWeight(next); }}
                        style={S.weightArrowBtn}>
                        <Text style={{ color: '#AAA', fontSize: 20, fontWeight: '700' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                    {selectedWeight !== null && (
                      <Text style={{ textAlign: 'center', marginTop: 4, fontSize: 14, fontWeight: '800', color: '#FF6B35' }}>
                        {selectedWeight === 'BW' ? 'Bodyweight' : `${selectedWeight} lbs`}
                      </Text>
                    )}
                  </View>

                  {/* Set tracker + PR */}
                  {(() => {
                    const sets = getCurrentExSets();
                    const pr = getPR(curEx.name);
                    if (sets.length === 0 && !pr) return null;
                    return (
                      <View style={{ marginBottom: 10 }}>
                        {sets.length > 0 && (
                          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10,
                            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <Text style={{ fontSize: 9, letterSpacing: 2, color: '#888', textTransform: 'uppercase' }}>Sets completed</Text>
                              {pr && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2,
                                  borderRadius: 6, backgroundColor: 'rgba(243,156,18,0.12)', borderWidth: 1, borderColor: 'rgba(243,156,18,0.25)' }}>
                                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#F39C12' }}>PR</Text>
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#F39C12' }}>{pr} lbs</Text>
                                </View>
                              )}
                            </View>
                            {sets.map((s, idx) => (
                              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                paddingVertical: 5, borderBottomWidth: idx < sets.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FF6B35', minWidth: 14 }}>{idx + 1}</Text>
                                  <Text style={{ fontSize: 12, color: '#CCC' }}>
                                    {s.reps} reps{s.weight ? ` @ ${s.weight === 'BW' ? 'BW' : s.weight + ' lbs'}` : ''}
                                  </Text>
                                </View>
                                {s.weight && s.weight !== 'BW' && pr && s.weight >= pr && (
                                  <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, backgroundColor: 'rgba(243,156,18,0.1)' }}>
                                    <Text style={{ fontSize: 8, fontWeight: '700', color: '#F39C12' }}>BEST</Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                        {sets.length === 0 && pr && (
                          <View style={{ alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3,
                              borderRadius: 6, backgroundColor: 'rgba(243,156,18,0.12)', borderWidth: 1, borderColor: 'rgba(243,156,18,0.25)' }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#F39C12' }}>PR</Text>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#F39C12' }}>{pr} lbs</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* Workout complete */}
              {done && (
                <View style={{ alignItems: 'center', padding: 18, backgroundColor: 'rgba(255,107,53,0.1)',
                  borderRadius: 14, borderWidth: 2, borderColor: '#FF6B35', marginBottom: 10 }}>
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>🏆</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#FF6B35', marginBottom: 4 }}>WORKOUT COMPLETE!</Text>
                  <Text style={{ color: '#BBB', fontSize: 13 }}>{totalRolls} rolls • {totalReps} reps • {skipLog.length} skipped</Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom button */}
            <View style={{ padding: 12, paddingBottom: 16 }}>
              {!done ? (
                <TouchableOpacity onPress={rollDice} disabled={rolling || !!options} style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={(rolling || options) ? ['rgba(255,107,53,0.2)', 'rgba(255,107,53,0.2)'] : ['#FF6B35', '#FF2D2D']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ padding: 17, alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 3 }}>
                      {rolling ? '🎲 ROLLING...' : options ? '👆 PICK EXERCISE' : totalRolls === 0 ? '🎲 FIRST ROLL' : '🎲 ROLL AGAIN'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <BtnFull outline click={() => setScreen('summary')}>SUMMARY</BtnFull>
                  <BtnFull click={reset}>AGAIN 🎲</BtnFull>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ==================== SUMMARY ==================== */}
        {screen === 'summary' && (
          <ScrollView contentContainerStyle={{ padding: 16, maxWidth: 520, alignSelf: 'center', width: '100%' }}>
            <View style={S.screenHeader}>
              <TouchableOpacity onPress={() => setScreen('workout')} style={S.backBtn}>
                <Text style={S.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <Text style={[S.screenTitle, { color: '#FF6B35' }]}>SUMMARY</Text>
              <View style={{ width: 55 }} />
            </View>

            {/* Stats grid */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
              {[
                { l: 'ROLLS', v: totalRolls, i: '🎲' },
                { l: 'REPS', v: totalReps, i: '💪' },
                { l: 'UNIQUE', v: [...new Set(log.map(e => e.name))].length, i: '📋' },
                { l: 'SKIPPED', v: skipLog.length, i: '⏭️' },
              ].map((s, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12,
                  alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,53,0.08)' }}>
                  <Text style={{ fontSize: 18 }}>{s.i}</Text>
                  <Text style={{ fontSize: 21, fontWeight: '900', color: '#FF6B35' }}>{s.v}</Text>
                  <Text style={{ fontSize: 8, color: '#555', letterSpacing: 1.5 }}>{s.l}</Text>
                </View>
              ))}
            </View>

            <SL>MUSCLE BREAKDOWN</SL>
            <View style={{ gap: 5, marginBottom: 18 }}>
              {BODY_PART_CONFIG.filter(g => selSubs[g.id]).map(g => {
                const r = log.filter(e => e.group === g.id).reduce((a, b) => a + b.reps, 0);
                const p = totalReps > 0 ? (r / totalReps) * 100 : 0;
                return (
                  <View key={g.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 12, color: '#BBB' }}>{g.icon} {g.label}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: g.color }}>{r} reps</Text>
                    </View>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <View style={{ width: `${p}%`, height: '100%', borderRadius: 2, backgroundColor: g.color }} />
                    </View>
                  </View>
                );
              })}
            </View>

            {skipLog.length > 0 && (
              <>
                <SL>MOST SKIPPED EXERCISES</SL>
                <View style={{ marginBottom: 18 }}>
                  {Object.entries(skipLog.reduce((acc, s) => { acc[s.name] = (acc[s.name] || 0) + 1; return acc; }, {}))
                    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count], i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8,
                      backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 6 }}>
                      <Text style={{ fontSize: 13, color: '#DDD' }}>{name}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#E74C3C' }}>⏭️ {count}x</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <SL>FULL LOG</SL>
            <View style={{ marginBottom: 18 }}>
              {log.map((ex, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  padding: 7, backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 5 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Text style={{ color: '#444', fontSize: 10, fontWeight: '700', minWidth: 18 }}>{i + 1}</Text>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#DDD' }}>{ex.name}</Text>
                      <Text style={{ fontSize: 9, color: '#555' }}>
                        {getSL(ex.sub)}{ex.weight ? ` • ${ex.weight === 'BW' ? 'BW' : ex.weight + ' lbs'}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#FF6B35' }}>{ex.reps}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <BtnFull outline click={() => { reset(); setScreen('landing'); }}>HOME</BtnFull>
              <BtnFull click={() => { reset(); setScreen('workout'); }}>ROLL AGAIN 🎲</BtnFull>
            </View>
          </ScrollView>
        )}

        {/* ==================== HISTORY ==================== */}
        {screen === 'history' && (
          <ScrollView contentContainerStyle={{ padding: 16, maxWidth: 520, alignSelf: 'center', width: '100%' }}>
            <View style={S.screenHeader}>
              <TouchableOpacity onPress={() => setScreen('landing')} style={S.backBtn}>
                <Text style={S.backBtnText}>← Home</Text>
              </TouchableOpacity>
              <Text style={[S.screenTitle, { color: '#FF6B35' }]}>PREVIOUS WORKOUTS</Text>
              <View style={{ width: 55 }} />
            </View>

            <BodyHeatmap workoutHistory={workoutHistory} />

            {workoutHistory.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🎲</Text>
                <Text style={{ color: '#666', fontSize: 14, fontWeight: '600' }}>No workouts yet</Text>
                <Text style={{ color: '#444', fontSize: 12, marginTop: 4 }}>Complete a workout and it'll show up here</Text>
                <TouchableOpacity onPress={() => setScreen('setup')} style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden' }}>
                  <LinearGradient colors={['#FF6B35', '#FF2D2D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 12, paddingHorizontal: 24 }}>
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>START FIRST WORKOUT</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {workoutHistory.map((w, i) => (
                  <View key={w.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>{formatDate(w.date)}</Text>
                        <Text style={{ fontSize: 10, color: '#666', marginTop: 1 }}>{w.time || formatTime(w.date)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        {[{ v: w.totalRolls, l: 'ROLLS' }, { v: w.totalReps, l: 'REPS' }, { v: w.uniqueExercises, l: 'UNIQUE' }].map((s, j) => (
                          <View key={j} style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#FF6B35' }}>{s.v}</Text>
                            <Text style={{ fontSize: 8, color: '#555', letterSpacing: 1 }}>{s.l}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: w.log?.length > 0 ? 8 : 0 }}>
                      {w.muscles?.map(m => (
                        <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3,
                          borderRadius: 8, backgroundColor: m.color + '15', borderWidth: 1, borderColor: m.color + '30' }}>
                          <Text style={{ fontSize: 10 }}>{m.icon}</Text>
                          <Text style={{ fontSize: 10, color: m.color, fontWeight: '700' }}>{m.reps}</Text>
                        </View>
                      ))}
                    </View>
                    {w.log?.length > 0 && <HistoryLogExpander log={w.log} getSL={getSL} getGC={getGC} />}
                  </View>
                ))}
                <TouchableOpacity onPress={() => {
                  Alert.alert('Clear History', 'Delete all workout history?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      // Delete all workout docs from Firestore
                      if (user) {
                        const snap = await getDocs(collection(db, 'users', user.uid, 'workouts'));
                        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'users', user.uid, 'workouts', d.id))));
                      }
                      setWorkoutHistory([]);
                    }},
                  ]);
                }} style={{ padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(231,76,60,0.2)',
                  backgroundColor: 'rgba(231,76,60,0.06)', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ color: '#E74C3C', fontSize: 12, fontWeight: '600' }}>Clear History</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* ==================== ADD EXERCISE ==================== */}
        {screen === 'addExercise' && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ padding: 16, maxWidth: 520, alignSelf: 'center', width: '100%' }}>
              <View style={S.screenHeader}>
                <TouchableOpacity onPress={() => { resetAddForm(); setScreen('landing'); }} style={S.backBtn}>
                  <Text style={S.backBtnText}>← Home</Text>
                </TouchableOpacity>
                <Text style={[S.screenTitle, { color: '#2ECC71' }]}>ADD EXERCISE</Text>
                <View style={{ width: 55 }} />
              </View>

              {addSuccess ? (
                <View style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(46,204,113,0.12)',
                  borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)', marginBottom: 14 }}>
                  <Text style={{ color: '#2ECC71', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{addSuccess}</Text>
                </View>
              ) : null}

              <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 18,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 20 }}>
                <SL>{editingId ? 'EDIT EXERCISE' : 'NEW EXERCISE'}</SL>

                {/* Muscle Group */}
                <Text style={S.formLabel}>Muscle Group</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  {BODY_PART_CONFIG.map(g => (
                    <TouchableOpacity key={g.id} onPress={() => { setAddGroup(g.id); setAddSub(''); }} style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                      borderWidth: 2, borderColor: addGroup === g.id ? '#2ECC71' : 'rgba(255,255,255,0.08)',
                      backgroundColor: addGroup === g.id ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.03)',
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: addGroup === g.id ? '#2ECC71' : '#666' }}>
                        {g.icon} {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sub-muscle */}
                {addGroup && (
                  <>
                    <Text style={[S.formLabel, { marginTop: 12 }]}>Specific Muscle</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                      {availableSubs.map(s => (
                        <TouchableOpacity key={s.id} onPress={() => setAddSub(s.id)} style={{
                          paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18,
                          borderWidth: 1.5, borderColor: addSub === s.id ? '#2ECC71' : 'rgba(255,255,255,0.08)',
                          backgroundColor: addSub === s.id ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.03)',
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: addSub === s.id ? '#2ECC71' : '#666' }}>{s.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Equipment */}
                {addSub && (
                  <>
                    <Text style={[S.formLabel, { marginTop: 12 }]}>Equipment</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {EQUIP.map(eq => (
                        <TouchableOpacity key={eq.id} onPress={() => setAddEquip(eq.id)} style={{
                          flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
                          borderWidth: 2, borderColor: addEquip === eq.id ? '#2ECC71' : 'rgba(255,255,255,0.08)',
                          backgroundColor: addEquip === eq.id ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.03)',
                        }}>
                          <Text style={{ fontSize: 18 }}>{eq.icon}</Text>
                          <Text style={{ fontSize: 11, color: addEquip === eq.id ? '#2ECC71' : '#666', fontWeight: '600', marginTop: 2, textAlign: 'center' }}>
                            {eq.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Name */}
                {addEquip && (
                  <>
                    <Text style={[S.formLabel, { marginTop: 12 }]}>Exercise Name</Text>
                    <TextInput
                      value={addName} onChangeText={setAddName}
                      placeholder="e.g. Standing Arnold Press"
                      placeholderTextColor="#444"
                      style={S.textInput}
                    />
                  </>
                )}

                {/* Description */}
                {addName.trim() && (
                  <>
                    <Text style={[S.formLabel, { marginTop: 12 }]}>Description (optional)</Text>
                    <TextInput
                      value={addDesc} onChangeText={setAddDesc}
                      placeholder="Quick tip on form or execution..."
                      placeholderTextColor="#444"
                      multiline numberOfLines={2}
                      style={[S.textInput, { height: 70, textAlignVertical: 'top' }]}
                    />
                  </>
                )}

                {/* Save */}
                <TouchableOpacity onPress={handleSaveExercise}
                  disabled={!addGroup || !addSub || !addEquip || !addName.trim()}
                  style={{ borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
                  <LinearGradient
                    colors={(!addGroup || !addSub || !addEquip || !addName.trim())
                      ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.06)']
                      : ['#2ECC71', '#27AE60']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ padding: 14, alignItems: 'center' }}>
                    <Text style={{ color: (!addGroup || !addSub || !addEquip || !addName.trim()) ? '#555' : '#FFF',
                      fontSize: 15, fontWeight: '700' }}>
                      {editingId ? '💾 UPDATE EXERCISE' : '➕ ADD EXERCISE'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {editingId && (
                  <TouchableOpacity onPress={resetAddForm} style={{ padding: 10, alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Custom exercises list */}
              {customExercises.length > 0 && (
                <>
                  <SL>MY EXERCISES — {customExercises.length}</SL>
                  <View style={{ gap: 8 }}>
                    {customExercises.map((ex) => {
                      const gConfig = BODY_PART_CONFIG.find(g => g.id === ex.group);
                      const color = gConfig?.color || '#FF6B35';
                      return (
                        <View key={ex.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14,
                          borderWidth: 1, borderColor: color + '22' }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 9, letterSpacing: 2, color, textTransform: 'uppercase', marginBottom: 2 }}>
                                {getSL(ex.sub)} • {EQUIP.find(e => e.id === ex.equip)?.label}
                              </Text>
                              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>{ex.name}</Text>
                              {ex.desc ? <Text style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{ex.desc}</Text> : null}
                            </View>
                            <View style={{ flexDirection: 'row', gap: 6, marginLeft: 10 }}>
                              <TouchableOpacity onPress={() => handleEditExercise(ex)} style={{
                                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.04)' }}>
                                <Text style={{ color: '#AAA', fontSize: 11 }}>Edit</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteExercise(ex.id)} style={{
                                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
                                borderWidth: 1, borderColor: 'rgba(231,76,60,0.2)',
                                backgroundColor: 'rgba(231,76,60,0.06)' }}>
                                <Text style={{ color: '#E74C3C', fontSize: 11 }}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================================
// SHARED STYLES
// ============================================================
const S = {
  screenHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
  },
  screenTitle: {
    fontSize: 14, fontWeight: '800', color: '#FF6B35',
  },
  backBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backBtnText: {
    color: '#999', fontSize: 12,
  },
  landingCard: {
    padding: 20, borderRadius: 16,
    borderWidth: 2, borderColor: 'rgba(255,107,53,0.3)',
    backgroundColor: 'rgba(255,107,53,0.06)',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  landingIconBg: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  landingCardTitle: {
    fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: 1,
  },
  landingCardSub: {
    fontSize: 12, color: '#888', marginTop: 2,
  },
  weightArrowBtn: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  formLabel: {
    fontSize: 11, color: '#888', marginBottom: 4,
  },
  textInput: {
    padding: 11, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#FFF', fontSize: 14,
  },
};
