/**
 * Diced Fitness — Admin Seed Script
 *
 * Backfills user profile docs for existing Auth users,
 * seeds gyms & promos collections, and sets the admin role.
 *
 * Usage:  node seed-admin.js
 * Requires: serviceAccountKey.json in this directory
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Set your admin email here
const ADMIN_EMAIL = 'juice@dicedfitness.com';

// ─── GYMS SEED DATA ─────────────────────────────────────────────────────────
const GYMS = [
  {
    name: "Iron District Gym", location: "Astoria, Queens NY", owner: "Tony Russo",
    ownerEmail: "tony@irondistrictgym.com", phone: "(718) 555-0142",
    joined: "2026-03-10", plan: "premium", planExpires: "2027-03-10", monthlyFee: 49.99,
    code: "IRON-DISTRICT", codeUses: 4,
    equipment: [
      { name: "Functional Trainer", qty: 3, totalSessions: 1842 },
      { name: "Dumbbells", qty: 8, totalSessions: 1520 },
      { name: "Barbell Rack", qty: 4, totalSessions: 980 },
      { name: "Smith Machine", qty: 2, totalSessions: 620 },
      { name: "Leg Press", qty: 2, totalSessions: 410 },
    ],
    trainers: ["Mike R.", "Sarah K."],
    topExercises: ["Cable Crossover", "Bicep Curl", "Lat Pulldown"],
    peakHour: "6:00 PM",
    avgDailyUsers: 34,
  },
  {
    name: "Flex Fitness NYC", location: "Inwood, Manhattan NY", owner: "Carmen Diaz",
    ownerEmail: "carmen@flexfitnessnyc.com", phone: "(212) 555-0198",
    joined: "2026-03-18", plan: "basic", planExpires: "2026-09-18", monthlyFee: 29.99,
    code: "FLEX-NYC", codeUses: 2,
    equipment: [
      { name: "Dumbbells", qty: 6, totalSessions: 890 },
      { name: "Bodyweight Area", qty: 1, totalSessions: 720 },
      { name: "Resistance Bands", qty: 10, totalSessions: 340 },
      { name: "Kettlebells", qty: 6, totalSessions: 280 },
    ],
    trainers: ["Jay T."],
    topExercises: ["Push-Ups", "Goblet Squat", "Band Pull-Apart"],
    peakHour: "7:00 AM",
    avgDailyUsers: 18,
  },
  {
    name: "PowerHouse BK", location: "Bay Ridge, Brooklyn NY", owner: "Marcus Johnson",
    ownerEmail: "marcus@powerhousebk.com", phone: "(718) 555-0267",
    joined: "2026-04-01", plan: "trial", planExpires: "2026-05-01", monthlyFee: 0,
    code: "POWER-BK", codeUses: 2,
    equipment: [
      { name: "Functional Trainer", qty: 2, totalSessions: 210 },
      { name: "Dumbbells", qty: 10, totalSessions: 185 },
      { name: "Barbell Rack", qty: 6, totalSessions: 160 },
      { name: "Smith Machine", qty: 1, totalSessions: 90 },
      { name: "Kettlebells", qty: 4, totalSessions: 75 },
      { name: "Bodyweight Area", qty: 1, totalSessions: 120 },
    ],
    trainers: ["Lisa M.", "Andre W."],
    topExercises: ["Bench Press", "Deadlift", "Shoulder Press"],
    peakHour: "5:30 PM",
    avgDailyUsers: 12,
  },
];

// ─── PROMOS SEED DATA ────────────────────────────────────────────────────────
const PROMOS = [
  { code: "FAMILY100", discount: 100, type: "percent", uses: 3, maxUses: 10, expires: null, active: true },
  { code: "FRIENDS50", discount: 50, type: "percent", uses: 7, maxUses: 20, expires: "2026-06-01", active: true },
  { code: "LAUNCH25", discount: 25, type: "percent", uses: 42, maxUses: 100, expires: "2026-05-01", active: true },
  { code: "EARLYBIRD", discount: 3, type: "dollars", uses: 15, maxUses: 50, expires: "2026-04-30", active: false },
];

// ─── BACKFILL USERS ──────────────────────────────────────────────────────────
async function backfillUsers() {
  console.log('Backfilling user profiles...');
  const listResult = await admin.auth().listUsers(1000);
  let created = 0, skipped = 0;

  for (const userRecord of listResult.users) {
    const uid = userRecord.uid;
    const docRef = db.collection('users').doc(uid);
    const existing = await docRef.get();

    if (existing.exists) {
      // Ensure admin role is set for admin email
      if (userRecord.email === ADMIN_EMAIL && existing.data().role !== 'admin') {
        await docRef.update({ role: 'admin', status: 'admin' });
        console.log(`  ✓ Updated ${userRecord.email} → admin role`);
      }
      skipped++;
      continue;
    }

    // Count workouts in subcollection
    const workoutsSnap = await db.collection('users').doc(uid).collection('workouts').get();
    const workoutCount = workoutsSnap.size;

    const isAdmin = userRecord.email === ADMIN_EMAIL;
    const profile = {
      email: userRecord.email || '',
      name: userRecord.displayName || '',
      status: isAdmin ? 'admin' : 'trial',
      role: isAdmin ? 'admin' : 'user',
      joined: userRecord.metadata.creationTime
        ? new Date(userRecord.metadata.creationTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      lastActive: userRecord.metadata.lastSignInTime
        ? new Date(userRecord.metadata.lastSignInTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      workouts: workoutCount,
      gymId: null,
      expires: null,
    };

    await docRef.set(profile);
    console.log(`  ✓ Created profile for ${userRecord.email || uid} (${workoutCount} workouts)`);
    created++;
  }

  console.log(`Users: ${created} created, ${skipped} already existed`);
}

// ─── SEED GYMS ───────────────────────────────────────────────────────────────
async function seedGyms() {
  console.log('Seeding gyms...');
  const batch = db.batch();
  for (const gym of GYMS) {
    const id = gym.code.toLowerCase().replace(/[^a-z0-9]/g, '_');
    batch.set(db.collection('gyms').doc(id), gym);
  }
  await batch.commit();
  console.log(`  ✓ ${GYMS.length} gyms seeded`);
}

// ─── SEED PROMOS ─────────────────────────────────────────────────────────────
async function seedPromos() {
  console.log('Seeding promos...');
  const batch = db.batch();
  for (const promo of PROMOS) {
    const id = promo.code.toLowerCase().replace(/[^a-z0-9]/g, '_');
    batch.set(db.collection('promos').doc(id), {
      ...promo,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`  ✓ ${PROMOS.length} promos seeded`);
}

// ─── RUN ─────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await backfillUsers();
    await seedGyms();
    await seedPromos();
    console.log('\nDone! ✓');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

main();
