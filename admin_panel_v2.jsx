import { useState, useMemo, useEffect } from "react";

const TRIAL_LIMIT = 10;

// ============================================================
// ADMIN PANEL
// ============================================================
export default function AdminPanel() {
  // Firebase from window (injected by dashboard.html CDN)
  const fb = window.__firebase;
  const { db, collection, collectionGroup, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
          query, orderBy, limit, serverTimestamp, increment } = fb;

  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [users, setUsers] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [promos, setPromos] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", type: "percent", maxUses: "", expires: "" });
  const [toast, setToast] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedUserWorkouts, setSelectedUserWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);

  // ─── Load all data on mount (auth already handled by dashboard.html Gate) ───
  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        // Users — load profiles then count actual workouts from subcollections
        const usersSnap = await getDocs(collection(db, 'users'));
        const userList = await Promise.all(usersSnap.docs.map(async (d) => {
          const profile = { id: d.id, ...d.data() };
          try {
            const wSnap = await getDocs(collection(db, 'users', d.id, 'workouts'));
            profile.workouts = wSnap.size;
          } catch (_) {}
          return profile;
        }));
        setUsers(userList);

        // Gyms
        const gymsSnap = await getDocs(collection(db, 'gyms'));
        setGyms(gymsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Promos
        const promosSnap = await getDocs(collection(db, 'promos'));
        setPromos(promosSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Exercises
        const exSnap = await getDocs(collection(db, 'exercises'));
        setExercises(exSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Recent workouts (collectionGroup — needs Firestore index on workouts/createdAt)
        try {
          const wSnap = await getDocs(query(collectionGroup(db, 'workouts'), orderBy('createdAt', 'desc'), limit(20)));
          setRecentWorkouts(wSnap.docs.map(d => {
            const path = d.ref.path; // users/{uid}/workouts/{id}
            const uid = path.split('/')[1];
            return { id: d.id, uid, ...d.data() };
          }));
        } catch (e) {
          console.warn('Could not load recent workouts (index may be needed):', e.message);
          setRecentWorkouts([]);
        }
      } catch (e) {
        console.error('Failed to load admin data:', e);
      }
      setDataLoading(false);
    };
    loadAll();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: users.length,
      trial: users.filter(u => u.status === "trial").length,
      premium: users.filter(u => u.status === "premium").length,
      expired: users.filter(u => u.status === "expired").length,
      activeToday: users.filter(u => u.lastActive === today).length,
      avgWorkouts: users.length ? Math.round(users.reduce((a, u) => a + (u.workouts || 0), 0) / users.length) : 0,
      aboutToConvert: users.filter(u => u.status === "trial" && (u.workouts || 0) >= 7).length,
      totalGyms: gyms.length,
      gymRevenue: gyms.reduce((a, g) => a + (g.monthlyFee || 0), 0),
      totalExercises: exercises.length,
    };
  }, [users, gyms, exercises]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ─── Firestore mutations ───
  const togglePremium = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const isPremium = user.status === "premium";
    const newStatus = isPremium ? "trial" : "premium";
    const newExpires = isPremium ? null : (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split("T")[0]; })();
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus, expires: newExpires });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus, expires: newExpires } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, status: newStatus, expires: newExpires }));
      showToast("Account status updated");
    } catch (e) { showToast("Error: " + (e.code || e.message)); }
  };

  const grantFreeAccess = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: "premium", expires: "2125-04-07" });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "premium", expires: "2125-04-07" } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, status: "premium", expires: "2125-04-07" }));
      showToast("Free lifetime access granted");
    } catch (e) { showToast("Error: " + (e.code || e.message)); }
  };

  const resetTrial = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { workouts: 0, status: "trial", expires: null });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, workouts: 0, status: "trial", expires: null } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, workouts: 0, status: "trial" }));
      showToast("Trial reset — 10 free workouts restored");
    } catch (e) { showToast("Error: " + (e.code || e.message)); }
  };

  const loadUserWorkouts = async (userId) => {
    setWorkoutsLoading(true);
    try {
      const wSnap = await getDocs(query(collection(db, 'users', userId, 'workouts'), orderBy('createdAt', 'desc')));
      setSelectedUserWorkouts(wSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.warn('Could not load user workouts:', e.message);
      setSelectedUserWorkouts([]);
    }
    setWorkoutsLoading(false);
  };

  const addPromo = async () => {
    if (!newPromo.code || !newPromo.discount) return;
    const promoData = {
      code: newPromo.code.toUpperCase().replace(/\s/g, ""),
      discount: Number(newPromo.discount),
      type: newPromo.type,
      uses: 0,
      maxUses: Number(newPromo.maxUses) || 999,
      expires: newPromo.expires || null,
      active: true,
      createdAt: serverTimestamp(),
    };
    try {
      const ref = await addDoc(collection(db, 'promos'), promoData);
      setPromos(prev => [{ id: ref.id, ...promoData }, ...prev]);
      setNewPromo({ code: "", discount: "", type: "percent", maxUses: "", expires: "" });
      setShowPromoForm(false);
      showToast(`Promo code ${promoData.code} created`);
    } catch (e) { showToast("Error: " + (e.code || e.message)); }
  };

  const togglePromo = async (id) => {
    const promo = promos.find(p => p.id === id);
    if (!promo) return;
    try {
      await updateDoc(doc(db, 'promos', id), { active: !promo.active });
      setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
      showToast("Promo code updated");
    } catch (e) { showToast("Error: " + (e.code || e.message)); }
  };

  const deletePromo = async (id) => {
    try {
      await deleteDoc(doc(db, 'promos', id));
      setPromos(prev => prev.filter(p => p.id !== id));
      showToast("Promo code deleted");
    } catch (e) { showToast("Error: " + (e.code || e.message)); }
  };

  const StatusBadge = ({ status }) => {
    const cfg = {
      admin: { bg: "rgba(255,107,53,0.15)", color: "#FF6B35", border: "rgba(255,107,53,0.3)", label: "ADMIN" },
      premium: { bg: "rgba(46,204,113,0.12)", color: "#2ECC71", border: "rgba(46,204,113,0.25)", label: "PREMIUM" },
      trial: { bg: "rgba(52,152,219,0.12)", color: "#3498DB", border: "rgba(52,152,219,0.25)", label: "TRIAL" },
      expired: { bg: "rgba(231,76,60,0.12)", color: "#E74C3C", border: "rgba(231,76,60,0.25)", label: "EXPIRED" },
      basic: { bg: "rgba(149,165,166,0.12)", color: "#95A5A6", border: "rgba(149,165,166,0.25)", label: "BASIC" },
    }[status] || { bg: "rgba(255,255,255,0.05)", color: "#888", border: "rgba(255,255,255,0.1)", label: status?.toUpperCase() };
    return (
      <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px", padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
    );
  };

  const navItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "gyms", icon: "🏢", label: "Gyms" },
    { id: "promos", icon: "🎟️", label: "Promo Codes" },
    { id: "activity", icon: "⚡", label: "Activity" },
  ];

  const gymMembers = (gymId) => users.filter(u => u.gymId === gymId);
  const unlinkedUsers = users.filter(u => u.gymId === null);

  // Helper: get user name for activity feed
  const getUserName = (uid) => {
    const u = users.find(u => u.id === uid);
    return u?.email || uid.slice(0, 8);
  };

  // Auth is handled by dashboard.html Gate — just show loading while data fetches
  if (dataLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: "2rem" }}>🎲</span>
        <div style={{ color: "#555", fontSize: "0.9rem" }}>Loading dashboard data...</div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #0a0a1a 0%, #0f0f24 50%, #0a0a1a 100%)", color: "#F0F0F0", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", display: "flex" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,107,53,0.3);border-radius:2px}
        input,select{font-family:'Segoe UI',system-ui,sans-serif}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: 220, minHeight: "100vh", padding: "24px 16px", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "1.3rem" }}>🎲</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "1px", background: "linear-gradient(135deg, #FF6B35, #FF2D2D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>DICED</span>
          </div>
          <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "3px", fontWeight: 600, marginLeft: 30 }}>ADMIN PANEL</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSelectedUser(null); setSelectedGym(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: activeSection === item.id ? "rgba(255,107,53,0.1)" : "transparent",
                color: activeSection === item.id ? "#FF6B35" : "#666",
                fontSize: "0.82rem", fontWeight: activeSection === item.id ? 700 : 500, transition: "all 0.15s",
              }}>
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
              {item.id === "gyms" && <span style={{ marginLeft: "auto", fontSize: "0.6rem", padding: "2px 6px", borderRadius: 10, background: "rgba(255,107,53,0.15)", color: "#FF6B35", fontWeight: 700 }}>{gyms.length}</span>}
            </button>
          ))}
        </div>

        <div style={{ padding: "14px", borderRadius: 12, background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.12)", marginTop: "auto" }}>
          <div style={{ fontSize: "0.7rem", color: "#FF6B35", fontWeight: 700, marginBottom: 4 }}>🔒 Admin Access</div>
          <div style={{ fontSize: "0.65rem", color: "#666" }}>{fb.auth.currentUser?.email}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", maxHeight: "100vh" }}>

        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, padding: "12px 20px", borderRadius: 12, background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.3)", color: "#2ECC71", fontSize: "0.8rem", fontWeight: 600, animation: "toastIn 0.3s ease", backdropFilter: "blur(10px)" }}>
            ✓ {toast}
          </div>
        )}

        {/* ========== OVERVIEW ========== */}
        {activeSection === "overview" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800, color: "#FFF" }}>Dashboard Overview</h2>
            <p style={{ margin: "0 0 24px", fontSize: "0.8rem", color: "#555" }}>Real-time snapshot of your Diced Fitness platform</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Total Users", value: stats.total, icon: "👥", color: "#3498DB", sub: `${stats.activeToday} active today` },
                { label: "Free Trials", value: stats.trial, icon: "🎯", color: "#F39C12", sub: `${stats.aboutToConvert} near paywall` },
                { label: "Premium", value: stats.premium, icon: "💎", color: "#2ECC71", sub: "$" + (stats.premium * 9.99).toFixed(0) + "/mo" },
                { label: "Partner Gyms", value: stats.totalGyms, icon: "🏢", color: "#FF6B35", sub: "$" + stats.gymRevenue.toFixed(0) + "/mo B2B" },
                { label: "Avg Workouts", value: stats.avgWorkouts, icon: "🏋️", color: "#9B59B6", sub: "per user" },
                { label: "Exercises", value: stats.totalExercises, icon: "📋", color: "#E67E22", sub: "in shared library" },
              ].map((kpi, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "18px 16px",
                  border: "1px solid rgba(255,255,255,0.06)", animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
                  cursor: "pointer", transition: "border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,107,53,0.2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                  <span style={{ fontSize: "1.3rem" }}>{kpi.icon}</span>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: kpi.color, lineHeight: 1, marginTop: 8 }}>{kpi.value}</div>
                  <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "1.5px", marginTop: 6, textTransform: "uppercase" }}>{kpi.label}</div>
                  <div style={{ fontSize: "0.62rem", color: "#444", marginTop: 4 }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Paywall Alert */}
            <div style={{ background: "rgba(243,156,18,0.06)", borderRadius: 14, padding: "20px", border: "1px solid rgba(243,156,18,0.15)", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", color: "#F39C12", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "1px" }}>🔥 USERS APPROACHING PAYWALL</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {users.filter(u => u.status === "trial" && (u.workouts || 0) >= 7).map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#EEE" }}>{u.email}</div>
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>{u.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1rem", fontWeight: 800, color: "#F39C12" }}>{u.workouts || 0}/{TRIAL_LIMIT}</div>
                      <div style={{ fontSize: "0.6rem", color: "#666" }}>workouts used</div>
                    </div>
                  </div>
                ))}
                {users.filter(u => u.status === "trial" && (u.workouts || 0) >= 7).length === 0 && (
                  <div style={{ fontSize: "0.8rem", color: "#555", textAlign: "center", padding: 10 }}>No users near paywall yet</div>
                )}
              </div>
            </div>

            {/* Recent Signups */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", color: "#FF6B35", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "1px" }}>📥 RECENT SIGNUPS</h3>
              {[...users].sort((a, b) => (b.joined || "").localeCompare(a.joined || "")).slice(0, 8).map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${(i * 67) % 360}, 60%, 45%), hsl(${(i * 67 + 40) % 360}, 60%, 35%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#FFF" }}>{(u.email || "?").slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#EEE" }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <StatusBadge status={u.status} />
                    <span style={{ fontSize: "0.65rem", color: "#555" }}>{u.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== USERS ========== */}
        {activeSection === "users" && !selectedUser && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800, color: "#FFF" }}>User Management</h2>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#555" }}>{users.length} total users • {unlinkedUsers.length} independent</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 280 }}>
                <span style={{ color: "#555" }}>🔍</span>
                <input type="text" placeholder="Search by email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: "none", border: "none", outline: "none", color: "#EEE", fontSize: "0.82rem", width: "100%" }} />
                {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "0.9rem" }}>✕</button>}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 60px", padding: "12px 18px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["User", "Status", "Workouts", "Gym", "Last Active", ""].map((h, i) => (
                  <div key={i} style={{ fontSize: "0.6rem", color: "#555", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {(searchQuery ? users.filter(u => (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())) : users).map((u, i) => (
                <div key={u.id} onClick={() => setSelectedUser(u)}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 60px", padding: "14px 18px", cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    transition: "background 0.15s", animation: `slideIn 0.3s ease ${i * 0.03}s both`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,53,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, hsl(${(i * 67) % 360}, 60%, 45%), hsl(${(i * 67 + 40) % 360}, 60%, 35%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#FFF" }}>{(u.email || "?").slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#EEE" }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}><StatusBadge status={u.status} /></div>
                  <div style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", fontWeight: 700, color: u.status === "trial" && (u.workouts || 0) >= 7 ? "#F39C12" : "#AAA" }}>
                    {u.workouts || 0}{u.status === "trial" ? `/${TRIAL_LIMIT}` : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", fontSize: "0.72rem", color: "#666" }}>
                    {u.gymId ? gyms.find(g => g.id === u.gymId)?.name?.split(" ")[0] || "—" : "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", fontSize: "0.72rem", color: "#666" }}>{u.lastActive || "—"}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "0.8rem", color: "#444" }}>→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== USER DETAIL ========== */}
        {activeSection === "users" && selectedUser && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <button onClick={() => { setSelectedUser(null); setSelectedUserWorkouts([]); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#999", cursor: "pointer", fontSize: "0.75rem", marginBottom: 20 }}>← Back to Users</button>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "28px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${(users.indexOf(selectedUser) * 67) % 360}, 60%, 45%), hsl(${(users.indexOf(selectedUser) * 67 + 40) % 360}, 60%, 35%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#FFF" }}>{(selectedUser.email || "?").slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#FFF" }}>{selectedUser.email}</h2>
                    {selectedUser.gymId && <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#FF6B35" }}>🏢 {gyms.find(g => g.id === selectedUser.gymId)?.name}</p>}
                  </div>
                </div>
                <StatusBadge status={selectedUser.status} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Joined", value: selectedUser.joined || "—", color: "#3498DB" },
                  { label: "Workouts", value: selectedUser.workouts || 0, color: "#FF6B35" },
                  { label: "Last Active", value: selectedUser.lastActive || "—", color: "#2ECC71" },
                  { label: "Expires", value: selectedUser.expires || "N/A", color: "#9B59B6" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", cursor: s.label === "Workouts" ? "pointer" : "default" }}
                    onClick={() => { if (s.label === "Workouts") loadUserWorkouts(selectedUser.id); }}>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "1.5px", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
                    {s.label === "Workouts" && <div style={{ fontSize: "0.55rem", color: "#FF6B35", marginTop: 2 }}>Click to view details</div>}
                  </div>
                ))}
              </div>

              {(selectedUser.status === "trial" || selectedUser.status === "expired") && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Trial Progress</span>
                    <span style={{ fontSize: "0.72rem", color: (selectedUser.workouts || 0) >= TRIAL_LIMIT ? "#E74C3C" : "#F39C12", fontWeight: 700 }}>{selectedUser.workouts || 0}/{TRIAL_LIMIT}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(((selectedUser.workouts || 0) / TRIAL_LIMIT) * 100, 100)}%`, height: "100%", borderRadius: 4, background: (selectedUser.workouts || 0) >= TRIAL_LIMIT ? "linear-gradient(90deg, #E74C3C, #C0392B)" : "linear-gradient(90deg, #FF6B35, #FF2D2D)" }} />
                  </div>
                </div>
              )}

              {selectedUser.role !== "admin" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => togglePremium(selectedUser.id)}
                    style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: selectedUser.status === "premium" ? "rgba(231,76,60,0.15)" : "linear-gradient(135deg, #2ECC71, #27AE60)", color: selectedUser.status === "premium" ? "#E74C3C" : "#FFF", fontSize: "0.78rem", fontWeight: 700 }}>
                    {selectedUser.status === "premium" ? "⬇ Downgrade" : "⬆ Upgrade to Premium"}
                  </button>
                  <button onClick={() => grantFreeAccess(selectedUser.id)}
                    style={{ padding: "10px 20px", borderRadius: 10, cursor: "pointer", background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.25)", color: "#FF6B35", fontSize: "0.78rem", fontWeight: 700 }}>
                    🎁 Free Lifetime
                  </button>
                  <button onClick={() => resetTrial(selectedUser.id)}
                    style={{ padding: "10px 20px", borderRadius: 10, cursor: "pointer", background: "rgba(52,152,219,0.1)", border: "1px solid rgba(52,152,219,0.25)", color: "#3498DB", fontSize: "0.78rem", fontWeight: 700 }}>
                    🔄 Reset Trial
                  </button>
                </div>
              )}
            </div>

            {/* ── Workout History ── */}
            {workoutsLoading && <div style={{ padding: 20, textAlign: "center", color: "#555", fontSize: "0.85rem" }}>Loading workouts...</div>}
            {selectedUserWorkouts.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ margin: "0 0 16px", color: "#FF6B35", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "1px" }}>🎲 WORKOUT HISTORY ({selectedUserWorkouts.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {selectedUserWorkouts.map((w, wi) => {
                    const dateStr = w.date || (w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : "—");
                    return (
                      <div key={w.id} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", animation: `slideIn 0.3s ease ${wi * 0.04}s both` }}>
                        {/* Workout header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.03)", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: "0.85rem" }}>📅</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#EEE" }}>{dateStr}</span>
                            {w.time && <span style={{ fontSize: "0.72rem", color: "#666" }}>{w.time}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 14 }}>
                            {w.totalRolls != null && <span style={{ fontSize: "0.72rem", color: "#3498DB" }}><strong>{w.totalRolls}</strong> rolls</span>}
                            {w.totalReps != null && <span style={{ fontSize: "0.72rem", color: "#2ECC71" }}><strong>{w.totalReps}</strong> reps</span>}
                            {w.uniqueExercises != null && <span style={{ fontSize: "0.72rem", color: "#9B59B6" }}><strong>{w.uniqueExercises}</strong> exercises</span>}
                            {w.skipped > 0 && <span style={{ fontSize: "0.72rem", color: "#E74C3C" }}><strong>{w.skipped}</strong> skipped</span>}
                          </div>
                        </div>

                        {/* Muscles hit */}
                        {w.muscles && w.muscles.length > 0 && (
                          <div style={{ display: "flex", gap: 8, padding: "10px 18px", flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            {w.muscles.map((m, mi) => (
                              <span key={mi} style={{ padding: "3px 10px", borderRadius: 20, background: `${m.color || '#FF6B35'}15`, border: `1px solid ${m.color || '#FF6B35'}30`, fontSize: "0.65rem", color: m.color || "#FF6B35", fontWeight: 600 }}>
                                {m.label || m.id} • {m.reps} reps
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Exercise log */}
                        {w.log && w.log.length > 0 && (
                          <div style={{ padding: "8px 0" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "6px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              {["Exercise", "Group", "Reps", "Weight"].map((h, hi) => (
                                <div key={hi} style={{ fontSize: "0.55rem", color: "#555", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</div>
                              ))}
                            </div>
                            {w.log.map((entry, ei) => (
                              <div key={ei} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "8px 18px", background: ei % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                <div style={{ fontSize: "0.78rem", color: "#DDD", fontWeight: 500 }}>{entry.name}</div>
                                <div style={{ fontSize: "0.72rem", color: "#888" }}>{entry.group || "—"}</div>
                                <div style={{ fontSize: "0.78rem", color: "#2ECC71", fontWeight: 600 }}>{entry.reps}</div>
                                <div style={{ fontSize: "0.78rem", color: entry.weight ? "#FF6B35" : "#444", fontWeight: entry.weight ? 700 : 400 }}>{entry.weight ? entry.weight + " lbs" : "—"}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {!workoutsLoading && selectedUserWorkouts.length === 0 && selectedUserWorkouts !== null && (
              <div style={{ padding: 20, textAlign: "center", color: "#555", fontSize: "0.85rem" }} />
            )}
          </div>
        )}

        {/* ========== GYMS ========== */}
        {activeSection === "gyms" && !selectedGym && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800, color: "#FFF" }}>Partner Gyms</h2>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#555" }}>{gyms.length} gyms • ${stats.gymRevenue.toFixed(0)}/mo B2B revenue</p>
              </div>
            </div>

            {/* Gym KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Gyms", value: gyms.length, icon: "🏢", color: "#FF6B35" },
                { label: "B2B Revenue", value: "$" + stats.gymRevenue.toFixed(0), icon: "💰", color: "#2ECC71" },
                { label: "Gym Members", value: users.filter(u => u.gymId !== null).length, icon: "👥", color: "#3498DB" },
                { label: "Total Equipment", value: gyms.reduce((a, g) => a + (g.equipment || []).reduce((b, e) => b + (e.qty || 0), 0), 0), icon: "🏋️", color: "#9B59B6" },
              ].map((kpi, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.06)", animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
                  <span style={{ fontSize: "1.2rem" }}>{kpi.icon}</span>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: kpi.color, lineHeight: 1, marginTop: 8 }}>{kpi.value}</div>
                  <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "1.5px", marginTop: 6, textTransform: "uppercase" }}>{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Gym Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {gyms.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#555", fontSize: "0.9rem" }}>No partner gyms yet. Add gyms via the seed script or Firebase Console.</div>}
              {gyms.map((gym, i) => (
                <div key={gym.id} onClick={() => setSelectedGym(gym)}
                  style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "22px",
                    border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
                    transition: "border-color 0.2s, transform 0.2s",
                    animation: `slideIn 0.3s ease ${i * 0.08}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,53,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: "1.2rem" }}>🏢</span>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#FFF" }}>{gym.name}</h3>
                        <StatusBadge status={gym.plan} />
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#666", marginLeft: 30 }}>📍 {gym.location} • Owner: {gym.owner}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#2ECC71" }}>${gym.monthlyFee || 0}<span style={{ fontSize: "0.6rem", color: "#666" }}>/mo</span></div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
                    {[
                      { label: "Members", value: gymMembers(gym.id).length, color: "#3498DB" },
                      { label: "Equipment", value: (gym.equipment || []).length + " types", color: "#FF6B35" },
                      { label: "Trainers", value: (gym.trainers || []).length, color: "#9B59B6" },
                      { label: "Avg Daily", value: gym.avgDailyUsers || 0, color: "#2ECC71" },
                      { label: "Peak Hour", value: gym.peakHour || "—", color: "#F39C12" },
                      { label: "Gym Code", value: gym.code || "—", color: "#E67E22" },
                    ].map((s, j) => (
                      <div key={j} style={{ padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: "0.55rem", color: "#555", letterSpacing: "1px", marginTop: 2, textTransform: "uppercase" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== GYM DETAIL ========== */}
        {activeSection === "gyms" && selectedGym && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <button onClick={() => setSelectedGym(null)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#999", cursor: "pointer", fontSize: "0.75rem", marginBottom: 20 }}>← Back to Gyms</button>

            {/* Gym Header */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "28px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: "1.5rem" }}>🏢</span>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#FFF" }}>{selectedGym.name}</h2>
                    <StatusBadge status={selectedGym.plan} />
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666", marginLeft: 34 }}>📍 {selectedGym.location}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#2ECC71" }}>${selectedGym.monthlyFee || 0}<span style={{ fontSize: "0.7rem", color: "#666" }}>/mo</span></div>
                  <div style={{ fontSize: "0.65rem", color: "#555" }}>Since {selectedGym.joined}</div>
                </div>
              </div>

              {/* Owner Info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Owner</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#EEE" }}>{selectedGym.owner}</div>
                  <div style={{ fontSize: "0.72rem", color: "#666", marginTop: 2 }}>{selectedGym.ownerEmail}</div>
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>{selectedGym.phone}</div>
                </div>
                <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)" }}>
                  <div style={{ fontSize: "0.6rem", color: "#FF6B35", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Gym Signup Code</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#FF6B35", fontFamily: "'Courier New', monospace", letterSpacing: "2px" }}>{selectedGym.code}</div>
                  <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 4 }}>Used {selectedGym.codeUses || 0} times</div>
                </div>
                <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Plan</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={selectedGym.plan} />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#666", marginTop: 6 }}>Expires: {selectedGym.planExpires}</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
                {[
                  { label: "Members", value: gymMembers(selectedGym.id).length, color: "#3498DB" },
                  { label: "Trainers", value: (selectedGym.trainers || []).length, color: "#9B59B6" },
                  { label: "Avg Daily Users", value: selectedGym.avgDailyUsers || 0, color: "#2ECC71" },
                  { label: "Peak Hour", value: selectedGym.peakHour || "—", color: "#F39C12" },
                  { label: "Equipment Types", value: (selectedGym.equipment || []).length, color: "#FF6B35" },
                  { label: "Total Sessions", value: (selectedGym.equipment || []).reduce((a, e) => a + (e.totalSessions || 0), 0).toLocaleString(), color: "#E74C3C" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.55rem", color: "#555", letterSpacing: "1px", marginTop: 2, textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Analytics */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "24px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", color: "#FF6B35", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "1px" }}>🏋️ EQUIPMENT ANALYTICS</h3>
              {(selectedGym.equipment || []).sort((a, b) => (b.totalSessions || 0) - (a.totalSessions || 0)).map((eq, i) => {
                const maxSessions = Math.max(...(selectedGym.equipment || []).map(e => e.totalSessions || 0), 1);
                const colors = ["#FF6B35", "#FF2D2D", "#3498DB", "#2ECC71", "#9B59B6", "#F39C12"];
                return (
                  <div key={i} style={{ marginBottom: 14, animation: `slideIn 0.3s ease ${i * 0.06}s both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: colors[i % colors.length], minWidth: 24 }}>#{i + 1}</span>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#EEE" }}>{eq.name}</div>
                          <div style={{ fontSize: "0.65rem", color: "#555" }}>{eq.qty} units • {(eq.totalSessions || 0).toLocaleString()} sessions</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 800, color: colors[i % colors.length] }}>
                        {Math.round(((eq.totalSessions || 0) / (selectedGym.equipment || []).reduce((a, e) => a + (e.totalSessions || 0), 0) || 1) * 100)}%
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ width: `${((eq.totalSessions || 0) / maxSessions) * 100}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}88)`, transition: "width 0.8s" }} />
                    </div>
                  </div>
                );
              })}
              {(selectedGym.equipment || []).length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#555", fontSize: "0.85rem" }}>No equipment data yet</div>}
            </div>

            {/* Gym Members */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "24px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", color: "#3498DB", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "1px" }}>👥 GYM MEMBERS ({gymMembers(selectedGym.id).length})</h3>
              {gymMembers(selectedGym.id).map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${(i * 67) % 360}, 60%, 45%), hsl(${(i * 67 + 40) % 360}, 60%, 35%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "#FFF" }}>{(u.email || "?").slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#EEE" }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>{u.workouts || 0} workouts</span>
                    <StatusBadge status={u.status} />
                  </div>
                </div>
              ))}
              {gymMembers(selectedGym.id).length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "#555", fontSize: "0.85rem" }}>No members linked yet</div>
              )}
            </div>

            {/* Trainers */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#9B59B6", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "1px" }}>🏅 TRAINERS ({(selectedGym.trainers || []).length})</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(selectedGym.trainers || []).map((t, i) => (
                  <div key={i} style={{ padding: "12px 18px", borderRadius: 10, background: "rgba(155,89,182,0.08)", border: "1px solid rgba(155,89,182,0.2)", fontSize: "0.85rem", fontWeight: 600, color: "#CCC" }}>
                    👤 {t}
                  </div>
                ))}
                {(selectedGym.trainers || []).length === 0 && <div style={{ color: "#555", fontSize: "0.85rem" }}>No trainers listed</div>}
              </div>
              {(selectedGym.topExercises || []).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>Top Exercises at this gym:</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    {selectedGym.topExercises.map((ex, i) => (
                      <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", fontSize: "0.72rem", color: "#FF6B35" }}>{ex}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== PROMO CODES ========== */}
        {activeSection === "promos" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800, color: "#FFF" }}>Promo Codes</h2>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#555" }}>Create and manage discount codes</p>
              </div>
              <button onClick={() => setShowPromoForm(!showPromoForm)}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #FF6B35, #FF2D2D)", color: "#FFF", fontSize: "0.78rem", fontWeight: 700 }}>
                {showPromoForm ? "✕ Cancel" : "+ New Promo Code"}
              </button>
            </div>

            {showPromoForm && (
              <div style={{ background: "rgba(255,107,53,0.05)", borderRadius: 14, padding: "24px", border: "1px solid rgba(255,107,53,0.15)", marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
                <h3 style={{ margin: "0 0 16px", color: "#FF6B35", fontSize: "0.85rem", fontWeight: 800 }}>Create Promo Code</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {[
                    { label: "Code", value: newPromo.code, key: "code", placeholder: "e.g. FAMILY100", type: "text", extra: { textTransform: "uppercase" } },
                    { label: "Max Uses", value: newPromo.maxUses, key: "maxUses", placeholder: "Unlimited", type: "number" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label style={{ display: "block", fontSize: "0.65rem", color: "#888", marginBottom: 4, letterSpacing: "1px", textTransform: "uppercase" }}>{f.label}</label>
                      <input value={f.value} onChange={e => setNewPromo(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#FFF", fontSize: "0.85rem", outline: "none", ...f.extra }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: "0.65rem", color: "#888", marginBottom: 4, letterSpacing: "1px", textTransform: "uppercase" }}>Discount</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={newPromo.discount} onChange={e => setNewPromo(p => ({ ...p, discount: e.target.value }))} placeholder="50" type="number"
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#FFF", fontSize: "0.85rem", outline: "none" }} />
                      <select value={newPromo.type} onChange={e => setNewPromo(p => ({ ...p, type: e.target.value }))}
                        style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.08)", color: "#FFF", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
                        <option value="percent">%</option>
                        <option value="dollars">$</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.65rem", color: "#888", marginBottom: 4, letterSpacing: "1px", textTransform: "uppercase" }}>Expires</label>
                    <input value={newPromo.expires} onChange={e => setNewPromo(p => ({ ...p, expires: e.target.value }))} type="date"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#FFF", fontSize: "0.85rem", outline: "none", colorScheme: "dark" }} />
                  </div>
                </div>
                <button onClick={addPromo} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #2ECC71, #27AE60)", color: "#FFF", fontSize: "0.78rem", fontWeight: 700 }}>✓ Create Promo Code</button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {promos.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#555", fontSize: "0.9rem" }}>No promo codes yet. Create one above.</div>}
              {promos.map((p, i) => (
                <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "20px", border: `1px solid ${p.active ? "rgba(255,255,255,0.06)" : "rgba(231,76,60,0.15)"}`, opacity: p.active ? 1 : 0.6, animation: `slideIn 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#FF6B35", fontFamily: "'Courier New', monospace", letterSpacing: "2px" }}>{p.code}</span>
                        <span style={{ fontSize: "0.6rem", padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: p.active ? "rgba(46,204,113,0.12)" : "rgba(231,76,60,0.12)", color: p.active ? "#2ECC71" : "#E74C3C", border: `1px solid ${p.active ? "rgba(46,204,113,0.25)" : "rgba(231,76,60,0.25)"}` }}>{p.active ? "ACTIVE" : "DISABLED"}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#AAA" }}>{p.type === "percent" ? `${p.discount}% off` : `$${p.discount} off`} • Used {p.uses || 0}/{p.maxUses}{p.expires ? ` • Expires ${p.expires}` : " • No expiry"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => togglePromo(p.id)} style={{ padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: p.active ? "rgba(231,76,60,0.1)" : "rgba(46,204,113,0.1)", border: `1px solid ${p.active ? "rgba(231,76,60,0.25)" : "rgba(46,204,113,0.25)"}`, color: p.active ? "#E74C3C" : "#2ECC71", fontSize: "0.7rem", fontWeight: 700 }}>{p.active ? "Disable" : "Enable"}</button>
                      <button onClick={() => deletePromo(p.id)} style={{ padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#666", fontSize: "0.7rem", fontWeight: 600 }}>🗑</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${((p.uses || 0) / (p.maxUses || 1)) * 100}%`, height: "100%", borderRadius: 2, background: (p.uses || 0) / (p.maxUses || 1) > 0.8 ? "linear-gradient(90deg, #E74C3C, #C0392B)" : "linear-gradient(90deg, #FF6B35, #FF2D2D)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ACTIVITY ========== */}
        {activeSection === "activity" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800, color: "#FFF" }}>Recent Activity</h2>
            <p style={{ margin: "0 0 24px", fontSize: "0.8rem", color: "#555" }}>Latest workouts across the platform</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentWorkouts.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#555", fontSize: "0.9rem" }}>No workout activity yet. Activity will appear here as users complete workouts.</div>}
              {recentWorkouts.map((w, i) => {
                const userName = getUserName(w.uid);
                const dateStr = w.date || (w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : "—");
                const totalReps = w.totalReps || "—";
                const rolls = w.log?.length || "—";
                const groups = w.log ? [...new Set(w.log.map(l => l.group).filter(Boolean))].join(", ") : "";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", animation: `slideIn 0.3s ease ${i * 0.03}s both` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "rgba(255,107,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🎲</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#EEE" }}>Workout completed <span style={{ color: "#FF6B35", fontWeight: 700 }}>• {userName}</span></div>
                      <div style={{ fontSize: "0.7rem", color: "#555", marginTop: 1 }}>{rolls} rolls • {totalReps} reps{groups ? ` • ${groups}` : ""}</div>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#444", whiteSpace: "nowrap" }}>{dateStr}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
