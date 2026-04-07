/**
 * Diced Fitness — Exercise Seed Script
 *
 * Uploads the shared exercise library to Firestore.
 * Safe to run multiple times — uses deterministic doc IDs so it upserts.
 *
 * Setup:
 *   1. npm install firebase-admin   (one-time)
 *   2. Download your service account key from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   3. Save it as serviceAccountKey.json in this directory
 *   4. node seed.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── EXERCISE DATA ────────────────────────────────────────────────────────────
// Add new exercises here and re-run the script to sync them to Firestore.
// Fields: group, sub, equip, name, desc

const EXERCISES = [
  // ── CHEST ─────────────────────────────────────────────────────────────────
  // upper_chest
  { group:'chest', sub:'upper_chest', equip:'dumbbells',           name:'Incline DB Press',         desc:'Bench 30-45°. Press up, shoulder blades pinched. Full lockout.' },
  { group:'chest', sub:'upper_chest', equip:'dumbbells',           name:'Incline DB Flyes',          desc:'Incline bench, wide arc. Deep stretch at bottom, squeeze top.' },
  { group:'chest', sub:'upper_chest', equip:'dumbbells',           name:'Low Incline DB Press',      desc:'Bench at 15-20°. Slight incline for upper/mid chest blend.' },
  { group:'chest', sub:'upper_chest', equip:'dumbbells',           name:'Incline Hammer Press',      desc:'Neutral grip incline press. Easier on shoulders.' },
  { group:'chest', sub:'upper_chest', equip:'dumbbells',           name:'Incline Single Arm Press',  desc:'One arm at a time. Core stability plus upper chest.' },
  { group:'chest', sub:'upper_chest', equip:'functional_trainer',  name:'Low Cable Fly',             desc:'Pulleys at bottom. Scoop handles up to chest height.' },
  { group:'chest', sub:'upper_chest', equip:'functional_trainer',  name:'Low Cable Press',           desc:'Pulleys low, press up and forward. Mimic incline press.' },
  { group:'chest', sub:'upper_chest', equip:'functional_trainer',  name:'Incline Cable Fly',         desc:'Set bench in front of cables. Incline fly with cables.' },
  { group:'chest', sub:'upper_chest', equip:'bodyweight',          name:'Decline Push-Ups',          desc:'Feet elevated on bench. Shifts focus to upper chest.' },
  { group:'chest', sub:'upper_chest', equip:'bodyweight',          name:'Pike-to-Push-Up',           desc:'Start pike, transition to push-up. Upper chest and shoulders.' },

  // mid_chest
  { group:'chest', sub:'mid_chest', equip:'dumbbells',           name:'Flat DB Press',              desc:'Lie flat, press up. Full range of motion, control the negative.' },
  { group:'chest', sub:'mid_chest', equip:'dumbbells',           name:'Flat DB Flyes',              desc:'Wide arc, slight elbow bend. Squeeze chest at top.' },
  { group:'chest', sub:'mid_chest', equip:'dumbbells',           name:'Alternating DB Press',       desc:'Press one arm at a time. Core engagement plus chest.' },
  { group:'chest', sub:'mid_chest', equip:'dumbbells',           name:'DB Squeeze Press',           desc:'Press dumbbells together hard throughout entire movement.' },
  { group:'chest', sub:'mid_chest', equip:'dumbbells',           name:'Flat Neutral Grip Press',    desc:'Palms facing each other. Easier on shoulders.' },
  { group:'chest', sub:'mid_chest', equip:'functional_trainer',  name:'Mid Cable Fly',              desc:'Pulleys at chest height. Constant tension, squeeze center.' },
  { group:'chest', sub:'mid_chest', equip:'functional_trainer',  name:'Cable Crossover (High)',     desc:'Pulleys high, step forward. Bring handles together.' },
  { group:'chest', sub:'mid_chest', equip:'functional_trainer',  name:'Single Arm Cable Fly',       desc:'One arm at a time. Feel the full stretch and squeeze.' },
  { group:'chest', sub:'mid_chest', equip:'functional_trainer',  name:'Standing Cable Press',       desc:'Staggered stance, press forward from chest height.' },
  { group:'chest', sub:'mid_chest', equip:'bodyweight',          name:'Push-Ups',                   desc:'Hands shoulder-width. Chest to floor, push back up.' },
  { group:'chest', sub:'mid_chest', equip:'bodyweight',          name:'Wide Push-Ups',              desc:'Hands wider than shoulders. More chest stretch.' },
  { group:'chest', sub:'mid_chest', equip:'bodyweight',          name:'Tempo Push-Ups',             desc:'3 seconds down, 1 second up. Time under tension.' },

  // lower_chest
  { group:'chest', sub:'lower_chest', equip:'dumbbells',           name:'Decline DB Press',           desc:'Decline bench. Press up targeting lower pec fibers.' },
  { group:'chest', sub:'lower_chest', equip:'dumbbells',           name:'Decline DB Flyes',            desc:'Decline bench. Fly motion for lower chest isolation.' },
  { group:'chest', sub:'lower_chest', equip:'dumbbells',           name:'Standing DB Svend Press',     desc:'Squeeze DBs together, press out from chest. Lower pec squeeze.' },
  { group:'chest', sub:'lower_chest', equip:'functional_trainer',  name:'High-to-Low Cable Fly',       desc:'Pulleys high. Bring hands down and together.' },
  { group:'chest', sub:'lower_chest', equip:'functional_trainer',  name:'High Cable Crossover',        desc:'High pulleys, big step forward. Cross at bottom.' },
  { group:'chest', sub:'lower_chest', equip:'bodyweight',          name:'Dip (on Pull-Up Bar)',         desc:'If handles allow, dip with forward lean for lower chest.' },
  { group:'chest', sub:'lower_chest', equip:'bodyweight',          name:'Decline Diamond Push-Up',     desc:'Feet elevated, hands close. Lower chest + triceps.' },

  // inner_chest
  { group:'chest', sub:'inner_chest', equip:'dumbbells',           name:'Close Grip DB Press',              desc:'Dumbbells touching throughout. Squeeze inner chest.' },
  { group:'chest', sub:'inner_chest', equip:'dumbbells',           name:'DB Pullover',                      desc:'Across bench, lower behind head. Pull over chest.' },
  { group:'chest', sub:'inner_chest', equip:'dumbbells',           name:'Crush Press',                      desc:'Press DBs together as hard as possible while pressing up.' },
  { group:'chest', sub:'inner_chest', equip:'functional_trainer',  name:'Cable Crossover (Squeeze)',         desc:'Cross handles past midline. Hold squeeze 2 seconds.' },
  { group:'chest', sub:'inner_chest', equip:'functional_trainer',  name:'Single Arm Cross-Body Fly',         desc:'One arm, pull past center. Peak inner chest contraction.' },
  { group:'chest', sub:'inner_chest', equip:'bodyweight',          name:'Diamond Push-Ups',                 desc:'Hands in diamond shape. Inner chest and triceps.' },
  { group:'chest', sub:'inner_chest', equip:'bodyweight',          name:'Close Grip Push-Ups',              desc:'Hands 6 inches apart. Inner chest focus.' },

  // ── BACK ──────────────────────────────────────────────────────────────────
  // lats
  { group:'back', sub:'lats', equip:'dumbbells',           name:'DB Row',                    desc:'One knee on bench. Pull to hip, squeeze lat hard.' },
  { group:'back', sub:'lats', equip:'dumbbells',           name:'DB Pullover',               desc:'Across bench, arms overhead. Feel lat stretch and pull.' },
  { group:'back', sub:'lats', equip:'dumbbells',           name:'Kroc Row',                  desc:'Heavy single arm row with slight body english. Lat mass builder.' },
  { group:'back', sub:'lats', equip:'dumbbells',           name:'Chest Supported Row',       desc:'Face down on incline bench. Row both DBs. Pure back.' },
  { group:'back', sub:'lats', equip:'dumbbells',           name:'Meadows Row',               desc:'Landmine style single arm row. Amazing lat stretch.' },
  { group:'back', sub:'lats', equip:'functional_trainer',  name:'Lat Pulldown (Wide)',       desc:'Wide overhand grip. Pull to upper chest, lean slightly back.' },
  { group:'back', sub:'lats', equip:'functional_trainer',  name:'Lat Pulldown (Close)',      desc:'Close grip handle. Pull to chest, elbows tight.' },
  { group:'back', sub:'lats', equip:'functional_trainer',  name:'Straight Arm Pulldown',     desc:'Arms straight, pull bar overhead to thighs. Pure lat.' },
  { group:'back', sub:'lats', equip:'functional_trainer',  name:'Single Arm Pulldown',       desc:'One arm at a time. Full stretch and contraction.' },
  { group:'back', sub:'lats', equip:'functional_trainer',  name:'Neutral Grip Pulldown',     desc:'Palms facing. Great for lower lat emphasis.' },
  { group:'back', sub:'lats', equip:'functional_trainer',  name:'Behind Neck Pulldown',      desc:'Pull behind head carefully. Wide lat activation.' },
  { group:'back', sub:'lats', equip:'bodyweight',          name:'Pull-Ups (Wide)',           desc:'Wide overhand grip. Pull chin over bar.' },
  { group:'back', sub:'lats', equip:'bodyweight',          name:'Pull-Ups (Shoulder Width)', desc:'Standard grip. Solid all-around lat builder.' },
  { group:'back', sub:'lats', equip:'bodyweight',          name:'Chin-Ups',                  desc:'Underhand grip. Lats plus heavy bicep involvement.' },
  { group:'back', sub:'lats', equip:'bodyweight',          name:'Neutral Grip Pull-Ups',     desc:'Palms facing. Great for brachialis and lats.' },
  { group:'back', sub:'lats', equip:'bodyweight',          name:'Slow Negative Pull-Ups',    desc:'Jump up, lower yourself for 5 seconds. Brutal.' },
  { group:'back', sub:'lats', equip:'bodyweight',          name:'Dead Hang Scapular Pulls',  desc:'Hang and pull shoulder blades down. Lat activation.' },

  // rhomboids
  { group:'back', sub:'rhomboids', equip:'dumbbells',           name:'Chest Supported Row',      desc:'Incline bench, row both DBs. Pinch shoulder blades.' },
  { group:'back', sub:'rhomboids', equip:'dumbbells',           name:'Bent Over Reverse Fly',    desc:'Hinge 45°, arms out. Squeeze blades together.' },
  { group:'back', sub:'rhomboids', equip:'dumbbells',           name:'Prone Y-T-W Raises',       desc:'Face down, raise arms in Y, T, and W patterns.' },
  { group:'back', sub:'rhomboids', equip:'dumbbells',           name:'Wide DB Row',              desc:'Row with elbows flared out at 90°. Rhomboid focus.' },
  { group:'back', sub:'rhomboids', equip:'functional_trainer',  name:'Seated Cable Row',         desc:'Pull handle to midsection. Drive elbows behind you.' },
  { group:'back', sub:'rhomboids', equip:'functional_trainer',  name:'Face Pull',                desc:'Rope at face height. Pull apart with external rotation.' },
  { group:'back', sub:'rhomboids', equip:'functional_trainer',  name:'Wide Grip Cable Row',      desc:'Wide bar attachment. Elbows high, squeeze mid back.' },
  { group:'back', sub:'rhomboids', equip:'functional_trainer',  name:'Cable Reverse Fly',        desc:'Cross cables at chest height. Pull apart.' },
  { group:'back', sub:'rhomboids', equip:'bodyweight',          name:'Inverted Row',             desc:'Under bar, pull chest up. Squeeze shoulder blades.' },
  { group:'back', sub:'rhomboids', equip:'bodyweight',          name:'Inverted Row (Wide)',      desc:'Wide grip inverted row. More rhomboid focus.' },
  { group:'back', sub:'rhomboids', equip:'bodyweight',          name:'Prone Y Raise',            desc:'Face down, arms in Y. Lower trap and rhomboid.' },

  // lower_back
  { group:'back', sub:'lower_back', equip:'dumbbells',           name:'DB Deadlift',              desc:'Hip hinge, DBs at sides. Drive hips forward.' },
  { group:'back', sub:'lower_back', equip:'dumbbells',           name:'DB Good Morning',          desc:'DB behind head, hinge at hips. Lower back focus.' },
  { group:'back', sub:'lower_back', equip:'dumbbells',           name:'Single Leg DB RDL',        desc:'One leg, hinge forward. Lower back + balance.' },
  { group:'back', sub:'lower_back', equip:'dumbbells',           name:'DB Suitcase Deadlift',     desc:'One DB, one side. Anti-lateral flexion for lower back.' },
  { group:'back', sub:'lower_back', equip:'functional_trainer',  name:'Cable Pull-Through',       desc:'Rope between legs. Hinge and drive hips forward.' },
  { group:'back', sub:'lower_back', equip:'functional_trainer',  name:'Cable Good Morning',       desc:'Bar across shoulders, hinge forward. Cable resistance.' },
  { group:'back', sub:'lower_back', equip:'bodyweight',          name:'Superman',                 desc:'Face down, lift arms and legs. Hold 2-3 seconds.' },
  { group:'back', sub:'lower_back', equip:'bodyweight',          name:'Back Extension (Floor)',   desc:'Face down, hands behind head. Lift chest off floor.' },
  { group:'back', sub:'lower_back', equip:'bodyweight',          name:'Bird Dog',                 desc:'All fours, extend opposite arm and leg. Hold.' },
  { group:'back', sub:'lower_back', equip:'bodyweight',          name:'Reverse Hyper (Bench)',    desc:'Lie face down on bench edge. Raise legs behind.' },

  // ── SHOULDERS ─────────────────────────────────────────────────────────────
  // front_delts
  { group:'shoulders', sub:'front_delts', equip:'dumbbells',           name:'DB Shoulder Press',         desc:'Seated or standing. Press overhead, full lockout.' },
  { group:'shoulders', sub:'front_delts', equip:'dumbbells',           name:'Arnold Press',               desc:'Start palms facing you. Rotate as you press up.' },
  { group:'shoulders', sub:'front_delts', equip:'dumbbells',           name:'Front Raise',                desc:'Alternate arms to front at shoulder height.' },
  { group:'shoulders', sub:'front_delts', equip:'dumbbells',           name:'DB Push Press',              desc:'Slight leg drive to help press overhead. Heavier loads.' },
  { group:'shoulders', sub:'front_delts', equip:'dumbbells',           name:'Half-Kneeling DB Press',     desc:'One knee down. Press overhead. Core + front delt.' },
  { group:'shoulders', sub:'front_delts', equip:'dumbbells',           name:'Seated DB Front Raise',      desc:'Seated to eliminate momentum. Strict front delt.' },
  { group:'shoulders', sub:'front_delts', equip:'functional_trainer',  name:'Cable Front Raise',          desc:'Low pulley, raise to shoulder height.' },
  { group:'shoulders', sub:'front_delts', equip:'functional_trainer',  name:'Cable Shoulder Press',       desc:'Face away from machine. Press overhead.' },
  { group:'shoulders', sub:'front_delts', equip:'functional_trainer',  name:'Single Arm Cable Front Raise', desc:'One arm, low pulley. Full isolation.' },
  { group:'shoulders', sub:'front_delts', equip:'bodyweight',          name:'Pike Push-Ups',              desc:'Hips high in V. Lower head between hands.' },
  { group:'shoulders', sub:'front_delts', equip:'bodyweight',          name:'Wall Handstand Hold',        desc:'Kick up to wall. Hold for time.' },
  { group:'shoulders', sub:'front_delts', equip:'bodyweight',          name:'Elevated Pike Push-Ups',     desc:'Feet on bench, pike position. Heavier load.' },

  // lateral_delts
  { group:'shoulders', sub:'lateral_delts', equip:'dumbbells',           name:'Lateral Raise',            desc:'Arms to sides, slight elbow bend. Don\'t go above shoulder.' },
  { group:'shoulders', sub:'lateral_delts', equip:'dumbbells',           name:'Leaning Lateral Raise',    desc:'Hold pole with one hand, lean away. Extended range.' },
  { group:'shoulders', sub:'lateral_delts', equip:'dumbbells',           name:'DB Upright Row',           desc:'Pull to chin, elbows high. Lateral delts + traps.' },
  { group:'shoulders', sub:'lateral_delts', equip:'dumbbells',           name:'Lu Raise',                 desc:'Arms slightly in front, raise with slight external rotation.' },
  { group:'shoulders', sub:'lateral_delts', equip:'dumbbells',           name:'Seated Lateral Raise',     desc:'Seated to eliminate cheating. Strict form.' },
  { group:'shoulders', sub:'lateral_delts', equip:'dumbbells',           name:'Drop Set Lateral Raise',   desc:'Start heavy, drop weight twice without rest. Shoulder burner.' },
  { group:'shoulders', sub:'lateral_delts', equip:'functional_trainer',  name:'Cable Lateral Raise',      desc:'Low pulley, cross body. Superior constant tension.' },
  { group:'shoulders', sub:'lateral_delts', equip:'functional_trainer',  name:'Behind-Back Cable Lateral', desc:'Cable behind you. Different resistance curve.' },
  { group:'shoulders', sub:'lateral_delts', equip:'functional_trainer',  name:'Cable Upright Row',        desc:'Bar attachment. Pull to chin height.' },
  { group:'shoulders', sub:'lateral_delts', equip:'bodyweight',          name:'Arm Circles',              desc:'Arms extended. Small to large circles. Forward then reverse.' },
  { group:'shoulders', sub:'lateral_delts', equip:'bodyweight',          name:'Side Plank Arm Raise',     desc:'Side plank, raise top arm up and down.' },

  // rear_delts
  { group:'shoulders', sub:'rear_delts', equip:'dumbbells',           name:'Bent Over Reverse Fly',      desc:'Hinge forward, arms out to sides. Squeeze blades.' },
  { group:'shoulders', sub:'rear_delts', equip:'dumbbells',           name:'Seated Reverse Fly',         desc:'Seated, bent forward. Strict rear delt isolation.' },
  { group:'shoulders', sub:'rear_delts', equip:'dumbbells',           name:'Incline Bench Reverse Fly',  desc:'Face down on incline. Gravity-assisted isolation.' },
  { group:'shoulders', sub:'rear_delts', equip:'dumbbells',           name:'DB Face Pull',               desc:'Bent over, pull to face with external rotation.' },
  { group:'shoulders', sub:'rear_delts', equip:'functional_trainer',  name:'Cable Face Pull',            desc:'Rope at face height. Pull apart, externally rotate.' },
  { group:'shoulders', sub:'rear_delts', equip:'functional_trainer',  name:'Cable Reverse Fly',          desc:'Cross cables. Pull apart at shoulder height.' },
  { group:'shoulders', sub:'rear_delts', equip:'functional_trainer',  name:'Cable Rear Delt Row',        desc:'Low pulley, pull high with elbows flared.' },
  { group:'shoulders', sub:'rear_delts', equip:'functional_trainer',  name:'High Cable Reverse Fly',     desc:'Pulleys high. Cross arms, pull apart.' },
  { group:'shoulders', sub:'rear_delts', equip:'bodyweight',          name:'Prone Y Raise',              desc:'Face down, arms in Y position. Squeeze rear delts.' },
  { group:'shoulders', sub:'rear_delts', equip:'bodyweight',          name:'Band Pull-Apart Motion',     desc:'Arms in front, pull apart using rear delts.' },

  // traps
  { group:'shoulders', sub:'traps', equip:'dumbbells',           name:'DB Shrugs',                desc:'Heavy DBs at sides. Shrug straight up, hold at top.' },
  { group:'shoulders', sub:'traps', equip:'dumbbells',           name:'DB Upright Row',           desc:'Pull to chin. Traps and lateral delts.' },
  { group:'shoulders', sub:'traps', equip:'dumbbells',           name:'Farmer Carry',             desc:'Heavy DBs, walk with perfect posture. Traps and grip.' },
  { group:'shoulders', sub:'traps', equip:'dumbbells',           name:'Incline DB Shrug',         desc:'Face down on incline. Shrug for lower trap.' },
  { group:'shoulders', sub:'traps', equip:'dumbbells',           name:'DB Power Shrug',           desc:'Slight jump assist to shrug heavier weight.' },
  { group:'shoulders', sub:'traps', equip:'functional_trainer',  name:'Cable Shrug',              desc:'Handles at sides. Smooth constant tension shrug.' },
  { group:'shoulders', sub:'traps', equip:'functional_trainer',  name:'Face Pull',                desc:'Rope attachment. Pull to face, external rotation.' },
  { group:'shoulders', sub:'traps', equip:'functional_trainer',  name:'Cable Upright Row',        desc:'Bar attachment. Pull to chin.' },
  { group:'shoulders', sub:'traps', equip:'functional_trainer',  name:'Behind-Back Cable Shrug',  desc:'Pulley behind you. Different angle on traps.' },
  { group:'shoulders', sub:'traps', equip:'bodyweight',          name:'Scapular Push-Up',         desc:'Plank position. Protract and retract shoulder blades.' },
  { group:'shoulders', sub:'traps', equip:'bodyweight',          name:'Prone Y Raise',            desc:'Face down, arms in Y. Lower trap activation.' },
  { group:'shoulders', sub:'traps', equip:'bodyweight',          name:'Hang Shrugs',              desc:'Hang from pull-up bar. Shrug shoulders up.' },

  // ── ARMS ──────────────────────────────────────────────────────────────────
  // biceps
  { group:'arms', sub:'biceps', equip:'dumbbells',           name:'DB Curl',                  desc:'Supinate at top. Full stretch at bottom, squeeze at top.' },
  { group:'arms', sub:'biceps', equip:'dumbbells',           name:'Hammer Curl',              desc:'Neutral grip. Brachialis and brachioradialis emphasis.' },
  { group:'arms', sub:'biceps', equip:'dumbbells',           name:'Incline DB Curl',          desc:'Seated incline. Full bicep stretch at bottom.' },
  { group:'arms', sub:'biceps', equip:'dumbbells',           name:'Concentration Curl',       desc:'Elbow on inner thigh. Pure bicep isolation.' },
  { group:'arms', sub:'biceps', equip:'dumbbells',           name:'Zottman Curl',             desc:'Curl up supinated, lower pronated. Hits all elbow flexors.' },
  { group:'arms', sub:'biceps', equip:'dumbbells',           name:'Cross-Body Hammer Curl',   desc:'Curl across body. Long head of bicep emphasis.' },
  { group:'arms', sub:'biceps', equip:'functional_trainer',  name:'Cable Curl',               desc:'Low pulley, curl up. Constant tension throughout.' },
  { group:'arms', sub:'biceps', equip:'functional_trainer',  name:'High Cable Curl',          desc:'Pulley high, curl toward face. Peak contraction.' },
  { group:'arms', sub:'biceps', equip:'functional_trainer',  name:'Cable Hammer Curl',        desc:'Rope attachment, neutral grip curl.' },
  { group:'arms', sub:'biceps', equip:'functional_trainer',  name:'Single Arm Cable Curl',    desc:'One arm, low pulley. Feel the full range.' },
  { group:'arms', sub:'biceps', equip:'bodyweight',          name:'Chin-Ups',                 desc:'Underhand grip pull-up. Bicep dominant.' },
  { group:'arms', sub:'biceps', equip:'bodyweight',          name:'Inverted Row (Underhand)', desc:'Under bar, palms up. More bicep involvement.' },
  { group:'arms', sub:'biceps', equip:'bodyweight',          name:'Negative Chin-Up',         desc:'Jump to top, lower slowly over 5 seconds.' },

  // triceps
  { group:'arms', sub:'triceps', equip:'dumbbells',           name:'Overhead DB Extension',       desc:'Both hands on one DB overhead. Full stretch at bottom.' },
  { group:'arms', sub:'triceps', equip:'dumbbells',           name:'Single Arm Overhead Extension', desc:'One arm overhead. Maximum long head stretch.' },
  { group:'arms', sub:'triceps', equip:'dumbbells',           name:'DB Kickback',                  desc:'Hinge 45°, extend arm straight back. Squeeze at top.' },
  { group:'arms', sub:'triceps', equip:'dumbbells',           name:'DB Skull Crusher',             desc:'Lie flat, lower DBs to temples. Press back up.' },
  { group:'arms', sub:'triceps', equip:'dumbbells',           name:'Close Grip DB Press',          desc:'Narrow grip, elbows tight. Chest + triceps.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Tricep Pushdown (Bar)',        desc:'Overhand grip, push bar to thighs. Elbows stationary.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Tricep Pushdown (Rope)',       desc:'Rope attachment. Flare at bottom for lateral head.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Overhead Cable Extension',     desc:'Rope overhead, extend arms up. Long head stretch.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Single Arm Cable Pushdown',    desc:'One arm at a time. Isolate each side.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Reverse Grip Pushdown',        desc:'Underhand grip on bar. Targets medial head hard.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Cable Kickback',               desc:'Low pulley, hinge forward. Extend arm back at peak squeeze.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Cross Body Cable Pushdown',    desc:'Single handle, push across body. Lateral head emphasis.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Cable French Press',           desc:'Low pulley, rope overhead. Step forward, extend up. Deep long head stretch.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'High Cable Overhead Extension', desc:'Face away from high pulley, rope behind head. Extend forward and up.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'V-Bar Pushdown',               desc:'V-bar attachment, elbows pinned. Squeeze at bottom.' },
  { group:'arms', sub:'triceps', equip:'functional_trainer',  name:'Single Arm Overhead Cable Ext', desc:'Low pulley, one arm. Reach behind head, extend up. Unilateral long head work.' },
  { group:'arms', sub:'triceps', equip:'bodyweight',          name:'Close Grip Push-Up',           desc:'Hands together, elbows tight. Tricep dominant push-up.' },
  { group:'arms', sub:'triceps', equip:'bodyweight',          name:'Diamond Push-Up',              desc:'Diamond hand position. Maximum tricep activation.' },
  { group:'arms', sub:'triceps', equip:'bodyweight',          name:'Bench Dip',                    desc:'Hands on bench, feet forward. Tricep dip.' },
  { group:'arms', sub:'triceps', equip:'bodyweight',          name:'Pike Push-Up',                 desc:'Hips high, lower to floor. Front delts and triceps.' },

  // forearms
  { group:'arms', sub:'forearms', equip:'dumbbells',           name:'DB Wrist Curl',        desc:'Forearms on knees, curl wrists up. Flexors.' },
  { group:'arms', sub:'forearms', equip:'dumbbells',           name:'DB Reverse Wrist Curl', desc:'Overhand, curl wrists up. Extensors.' },
  { group:'arms', sub:'forearms', equip:'dumbbells',           name:'DB Reverse Curl',       desc:'Overhand grip curl. Brachioradialis + extensors.' },
  { group:'arms', sub:'forearms', equip:'dumbbells',           name:'Farmer Carry',          desc:'Heavy DBs, walk with iron grip. Forearms and traps.' },
  { group:'arms', sub:'forearms', equip:'functional_trainer',  name:'Cable Wrist Curl',      desc:'Low pulley, wrist curl motion. Constant tension.' },
  { group:'arms', sub:'forearms', equip:'functional_trainer',  name:'Cable Reverse Curl',    desc:'Overhand grip, curl up. Forearm extensors.' },
  { group:'arms', sub:'forearms', equip:'bodyweight',          name:'Dead Hang',             desc:'Hang from pull-up bar as long as possible. Grip strength.' },
  { group:'arms', sub:'forearms', equip:'bodyweight',          name:'Towel Pull-Up',         desc:'Hang towel over bar, grip it. Brutal forearms.' },

  // ── LEGS ──────────────────────────────────────────────────────────────────
  // quads
  { group:'legs', sub:'quads', equip:'dumbbells',           name:'DB Goblet Squat',           desc:'Hold DB at chest. Deep squat, chest up.' },
  { group:'legs', sub:'quads', equip:'dumbbells',           name:'DB Front Squat',            desc:'DBs at shoulders. Upright torso, deep squat.' },
  { group:'legs', sub:'quads', equip:'dumbbells',           name:'DB Bulgarian Split Squat',  desc:'Rear foot elevated. Deep lunge. Quad killer.' },
  { group:'legs', sub:'quads', equip:'dumbbells',           name:'DB Walking Lunge',          desc:'Alternate steps forward. Control the descent.' },
  { group:'legs', sub:'quads', equip:'dumbbells',           name:'DB Step-Up',                desc:'Step onto bench, drive knee up. Quad dominant.' },
  { group:'legs', sub:'quads', equip:'dumbbells',           name:'DB Sissy Squat',            desc:'Lean back, knees forward. Pure quad isolation.' },
  { group:'legs', sub:'quads', equip:'functional_trainer',  name:'Cable Squat',               desc:'Holding cable at chest. Counterbalance helps depth.' },
  { group:'legs', sub:'quads', equip:'functional_trainer',  name:'Cable Leg Extension',       desc:'Ankle strap, low pulley. Extend leg at knee.' },
  { group:'legs', sub:'quads', equip:'functional_trainer',  name:'Hack Squat (Cable)',        desc:'Cable behind body, squat down. Quad focus.' },
  { group:'legs', sub:'quads', equip:'bodyweight',          name:'Squat',                     desc:'Bodyweight squat. Feet shoulder-width, knees out.' },
  { group:'legs', sub:'quads', equip:'bodyweight',          name:'Jump Squat',                desc:'Squat then explode up. Power + endurance.' },
  { group:'legs', sub:'quads', equip:'bodyweight',          name:'Wall Sit',                  desc:'Back against wall, 90° hold. Quad burner.' },
  { group:'legs', sub:'quads', equip:'bodyweight',          name:'Pistol Squat (assisted)',   desc:'Single leg squat holding support. Build to full.' },
  { group:'legs', sub:'quads', equip:'bodyweight',          name:'Step-Ups',                  desc:'Use stairs or bench. Drive through heel.' },

  // hamstrings
  { group:'legs', sub:'hamstrings', equip:'dumbbells',           name:'DB Romanian Deadlift',    desc:'Hip hinge, DBs close to legs. Feel the hamstring stretch.' },
  { group:'legs', sub:'hamstrings', equip:'dumbbells',           name:'DB Single Leg RDL',       desc:'One leg, hinge forward. Balance + hamstring.' },
  { group:'legs', sub:'hamstrings', equip:'dumbbells',           name:'DB Good Morning',         desc:'Hinge forward with DB behind head. Posterior chain.' },
  { group:'legs', sub:'hamstrings', equip:'functional_trainer',  name:'Lying Leg Curl (Cable)',  desc:'Ankle strap, face down. Curl heel to glute.' },
  { group:'legs', sub:'hamstrings', equip:'functional_trainer',  name:'Standing Leg Curl (Cable)', desc:'Ankle strap, curl standing. Single leg.' },
  { group:'legs', sub:'hamstrings', equip:'functional_trainer',  name:'Cable Pull-Through',      desc:'Rope between legs, hinge and stand. Hamstrings + glutes.' },
  { group:'legs', sub:'hamstrings', equip:'bodyweight',          name:'Nordic Curl',             desc:'Feet anchored, lower body forward. Elite hamstring strength.' },
  { group:'legs', sub:'hamstrings', equip:'bodyweight',          name:'Glute Bridge',            desc:'Hips up, squeeze glutes. Hamstring isometric hold.' },
  { group:'legs', sub:'hamstrings', equip:'bodyweight',          name:'Single Leg Glute Bridge', desc:'One leg bridge. More hamstring and glute demand.' },
  { group:'legs', sub:'hamstrings', equip:'bodyweight',          name:'Good Morning (BW)',       desc:'Hands behind head, hinge forward slowly.' },

  // glutes
  { group:'legs', sub:'glutes', equip:'dumbbells',           name:'DB Hip Thrust',       desc:'Shoulders on bench, DB on hips. Drive up hard.' },
  { group:'legs', sub:'glutes', equip:'dumbbells',           name:'DB Sumo Deadlift',    desc:'Wide stance, toes out. Glute dominant pull.' },
  { group:'legs', sub:'glutes', equip:'dumbbells',           name:'DB Step-Up (high)',   desc:'High step, drive hip forward at top.' },
  { group:'legs', sub:'glutes', equip:'dumbbells',           name:'DB Lateral Lunge',    desc:'Wide side step. Glute med activation.' },
  { group:'legs', sub:'glutes', equip:'functional_trainer',  name:'Cable Kickback',      desc:'Ankle strap, kick back and up. Squeeze glute at top.' },
  { group:'legs', sub:'glutes', equip:'functional_trainer',  name:'Cable Pull-Through',  desc:'Hinge and drive hips forward. Hip hinge power.' },
  { group:'legs', sub:'glutes', equip:'functional_trainer',  name:'Cable Hip Abduction', desc:'Ankle strap, pull leg out to side. Glute med.' },
  { group:'legs', sub:'glutes', equip:'bodyweight',          name:'Hip Thrust (BW)',     desc:'Shoulders on bench, drive hips up. Squeeze hard at top.' },
  { group:'legs', sub:'glutes', equip:'bodyweight',          name:'Donkey Kick',         desc:'All fours, kick leg back and up. Glute isolation.' },
  { group:'legs', sub:'glutes', equip:'bodyweight',          name:'Fire Hydrant',        desc:'All fours, lift leg to side. Glute med activation.' },
  { group:'legs', sub:'glutes', equip:'bodyweight',          name:'Glute Bridge March',  desc:'Bridge position, alternate leg lifts.' },
  { group:'legs', sub:'glutes', equip:'bodyweight',          name:'Sumo Squat Pulse',    desc:'Wide squat, small pulses at bottom.' },

  // calves
  { group:'legs', sub:'calves', equip:'dumbbells',           name:'DB Standing Calf Raise', desc:'DBs at sides, raise up on toes. Full range.' },
  { group:'legs', sub:'calves', equip:'dumbbells',           name:'DB Seated Calf Raise',   desc:'Seated, DBs on knees. Soleus emphasis.' },
  { group:'legs', sub:'calves', equip:'dumbbells',           name:'Single Leg DB Calf Raise', desc:'One leg, heavy DB. Maximum overload.' },
  { group:'legs', sub:'calves', equip:'functional_trainer',  name:'Cable Calf Raise',       desc:'Low pulley, cable between legs. Constant tension.' },
  { group:'legs', sub:'calves', equip:'bodyweight',          name:'Standing Calf Raise',    desc:'On step edge for full range. Up slow, down slow.' },
  { group:'legs', sub:'calves', equip:'bodyweight',          name:'Single Leg Calf Raise',  desc:'One leg, bodyweight only. Work up to full range.' },
  { group:'legs', sub:'calves', equip:'bodyweight',          name:'Jump Rope (Calf Focus)', desc:'Stay on toes, minimal jump height. Calf endurance.' },
  { group:'legs', sub:'calves', equip:'bodyweight',          name:'Calf Raise (Wall-Assisted)', desc:'Hands on wall, both legs. Focus on full stretch.' },

  // inner_thigh
  { group:'legs', sub:'inner_thigh', equip:'dumbbells',           name:'DB Sumo Squat',    desc:'Wide stance, toes out. Feel inner thigh.' },
  { group:'legs', sub:'inner_thigh', equip:'dumbbells',           name:'DB Lateral Lunge', desc:'Wide step to side. Deep stretch inner thigh.' },
  { group:'legs', sub:'inner_thigh', equip:'dumbbells',           name:'DB Cossack Squat', desc:'Side-to-side deep squat. Mobility + inner thigh.' },
  { group:'legs', sub:'inner_thigh', equip:'functional_trainer',  name:'Cable Hip Adduction', desc:'Ankle strap, pull leg inward across body.' },
  { group:'legs', sub:'inner_thigh', equip:'functional_trainer',  name:'Cable Sumo Squat', desc:'Wide stance squat with low cable. Inner thigh focus.' },
  { group:'legs', sub:'inner_thigh', equip:'bodyweight',          name:'Lateral Lunge',    desc:'Step wide to side, bend one knee.' },
  { group:'legs', sub:'inner_thigh', equip:'bodyweight',          name:'Sumo Squat Hold',  desc:'Wide stance, hold at bottom.' },
  { group:'legs', sub:'inner_thigh', equip:'bodyweight',          name:'Copenhagen Plank', desc:'Side plank, top foot on bench. Adductor hold.' },
  { group:'legs', sub:'inner_thigh', equip:'bodyweight',          name:'Frog Squat',       desc:'Wide stance, hands on floor. Squat deep.' },

  // ── CORE ──────────────────────────────────────────────────────────────────
  // upper_abs
  { group:'core', sub:'upper_abs', equip:'dumbbells',           name:'Weighted Crunch',     desc:'DB on chest, crunch up. Don\'t pull neck.' },
  { group:'core', sub:'upper_abs', equip:'dumbbells',           name:'DB Sit-Up',           desc:'Hold DB at chest. Full sit-up.' },
  { group:'core', sub:'upper_abs', equip:'dumbbells',           name:'Incline DB Crunch',   desc:'On incline bench, DB on chest. Crunch against gravity.' },
  { group:'core', sub:'upper_abs', equip:'functional_trainer',  name:'Cable Crunch',        desc:'Kneeling, rope behind head. Crunch down hard.' },
  { group:'core', sub:'upper_abs', equip:'functional_trainer',  name:'Standing Cable Crunch', desc:'Standing, pull rope down with abs.' },
  { group:'core', sub:'upper_abs', equip:'bodyweight',          name:'Crunch',              desc:'Shoulder blades off floor. Squeeze abs.' },
  { group:'core', sub:'upper_abs', equip:'bodyweight',          name:'V-Up',                desc:'Arms and legs meet in middle.' },
  { group:'core', sub:'upper_abs', equip:'bodyweight',          name:'Toe Touch',           desc:'Legs straight up, reach for toes.' },
  { group:'core', sub:'upper_abs', equip:'bodyweight',          name:'Butterfly Sit-Up',    desc:'Soles together, full sit-up. No hip flexor.' },

  // lower_abs
  { group:'core', sub:'lower_abs', equip:'dumbbells',           name:'Weighted Leg Raise',         desc:'DB between feet. Raise legs to 90°.' },
  { group:'core', sub:'lower_abs', equip:'functional_trainer',  name:'Hanging Knee Raise (Bar)',   desc:'Hang from pull-up bar. Raise knees to chest.' },
  { group:'core', sub:'lower_abs', equip:'functional_trainer',  name:'Hanging Leg Raise (Bar)',    desc:'Hang from bar. Straight legs to 90°.' },
  { group:'core', sub:'lower_abs', equip:'bodyweight',          name:'Leg Raise',                  desc:'Lying flat, raise legs to 90°. Slow negative.' },
  { group:'core', sub:'lower_abs', equip:'bodyweight',          name:'Reverse Crunch',             desc:'Knees to chest, lift hips off floor.' },
  { group:'core', sub:'lower_abs', equip:'bodyweight',          name:'Mountain Climbers',          desc:'Plank, drive knees to chest fast.' },
  { group:'core', sub:'lower_abs', equip:'bodyweight',          name:'Flutter Kicks',              desc:'Lying, small alternating leg kicks. Core on fire.' },
  { group:'core', sub:'lower_abs', equip:'bodyweight',          name:'Scissor Kicks',              desc:'Lying, cross legs alternating. Lower ab burn.' },
  { group:'core', sub:'lower_abs', equip:'bodyweight',          name:'Knee Tuck (Hanging)',        desc:'Hang from bar, tuck knees to chest.' },

  // obliques
  { group:'core', sub:'obliques', equip:'dumbbells',           name:'Russian Twist',        desc:'Seated, feet off floor. Rotate DB side to side.' },
  { group:'core', sub:'obliques', equip:'dumbbells',           name:'DB Side Bend',         desc:'One DB, lean to side, pull up with obliques.' },
  { group:'core', sub:'obliques', equip:'dumbbells',           name:'DB Windmill',          desc:'One DB overhead, bend to opposite side. Oblique stretch.' },
  { group:'core', sub:'obliques', equip:'dumbbells',           name:'Suitcase Carry',       desc:'Heavy DB one side. Walk maintaining upright posture.' },
  { group:'core', sub:'obliques', equip:'functional_trainer',  name:'Cable Woodchop',       desc:'High to low diagonal chop. Rotate through core.' },
  { group:'core', sub:'obliques', equip:'functional_trainer',  name:'Reverse Woodchop',     desc:'Low to high diagonal lift.' },
  { group:'core', sub:'obliques', equip:'functional_trainer',  name:'Cable Oblique Crunch', desc:'Side crunch against cable resistance.' },
  { group:'core', sub:'obliques', equip:'bodyweight',          name:'Bicycle Crunch',       desc:'Alternating elbow to opposite knee.' },
  { group:'core', sub:'obliques', equip:'bodyweight',          name:'Side Plank',           desc:'Hold on one forearm. Stack or stagger feet.' },
  { group:'core', sub:'obliques', equip:'bodyweight',          name:'Side Plank Dip',       desc:'Side plank, drop hip, raise back up.' },
  { group:'core', sub:'obliques', equip:'bodyweight',          name:'Heel Touch',           desc:'Lying, alternate reaching for heels. Oblique crunch.' },
  { group:'core', sub:'obliques', equip:'bodyweight',          name:'Windshield Wipers',    desc:'Legs up, rotate side to side. Advanced.' },

  // deep_core
  { group:'core', sub:'deep_core', equip:'dumbbells',           name:'DB Pallof Press',           desc:'Hold DB at chest, press out. Resist rotation.' },
  { group:'core', sub:'deep_core', equip:'dumbbells',           name:'Weighted Plank',            desc:'DB on upper back during plank.' },
  { group:'core', sub:'deep_core', equip:'dumbbells',           name:'Turkish Get-Up',            desc:'Complex movement from floor to standing with DB overhead.' },
  { group:'core', sub:'deep_core', equip:'functional_trainer',  name:'Pallof Press',              desc:'Stand sideways to cable. Press out, resist rotation.' },
  { group:'core', sub:'deep_core', equip:'functional_trainer',  name:'Cable Anti-Rotation Hold',  desc:'Press cable out, hold 10 seconds. Fight rotation.' },
  { group:'core', sub:'deep_core', equip:'functional_trainer',  name:'Cable Stir the Pot',        desc:'Arms extended, make circles against cable resistance.' },
  { group:'core', sub:'deep_core', equip:'bodyweight',          name:'Plank',                     desc:'Forearm plank. Straight line head to heels.' },
  { group:'core', sub:'deep_core', equip:'bodyweight',          name:'Dead Bug',                  desc:'On back, opposite arm/leg extend. Alternate.' },
  { group:'core', sub:'deep_core', equip:'bodyweight',          name:'Bird Dog',                  desc:'All fours, extend opposite arm and leg.' },
  { group:'core', sub:'deep_core', equip:'bodyweight',          name:'Hollow Body Hold',          desc:'Arms overhead, legs extended, hold off floor.' },
  { group:'core', sub:'deep_core', equip:'bodyweight',          name:'Bear Crawl',                desc:'All fours, knees off ground. Crawl forward/back.' },
  { group:'core', sub:'deep_core', equip:'bodyweight',          name:'Ab Wheel (From Knees)',     desc:'Roll out and back. Deep core engagement.' },

  // ── BARBELL ───────────────────────────────────────────────────────────────
  // chest
  { group:'chest', sub:'upper_chest', equip:'barbell', name:'Incline Barbell Press',         desc:'Bench 30-45°. Unrack, lower to upper chest, press up. Keep shoulder blades pinched.' },
  { group:'chest', sub:'upper_chest', equip:'barbell', name:'Incline Close Grip Press',      desc:'Incline bench, narrow grip. Upper chest and tricep combo.' },
  { group:'chest', sub:'upper_chest', equip:'barbell', name:'Reverse Grip Incline Press',    desc:'Underhand grip on incline. Unique upper chest activation.' },
  { group:'chest', sub:'mid_chest',   equip:'barbell', name:'Flat Barbell Bench Press',      desc:'The king. Bar to mid-chest, drive up. Arch back, feet planted.' },
  { group:'chest', sub:'mid_chest',   equip:'barbell', name:'Wide Grip Bench Press',         desc:'Hands wider than normal. More chest stretch, less tricep.' },
  { group:'chest', sub:'mid_chest',   equip:'barbell', name:'Pause Rep Bench Press',         desc:'Pause bar on chest 2 seconds. Eliminates momentum. Builds power.' },
  { group:'chest', sub:'mid_chest',   equip:'barbell', name:'Floor Press',                   desc:'Lie on floor, press up. Limits range for lockout strength.' },
  { group:'chest', sub:'lower_chest', equip:'barbell', name:'Decline Barbell Press',         desc:'Decline bench, press from lower chest. Heavy lower pec builder.' },
  { group:'chest', sub:'inner_chest', equip:'barbell', name:'Close Grip Bench Press',        desc:'Hands 12 inches apart. Inner chest squeeze plus triceps.' },
  // back
  { group:'back', sub:'lats',        equip:'barbell', name:'Barbell Row',                   desc:'Bent over 45°, pull bar to belly button. Squeeze lats hard.' },
  { group:'back', sub:'lats',        equip:'barbell', name:'Pendlay Row',                   desc:'Dead stop each rep from floor. Explosive pull to chest. Strict form.' },
  { group:'back', sub:'lats',        equip:'barbell', name:'Underhand Barbell Row',         desc:'Supinated grip row. More lat and bicep involvement.' },
  { group:'back', sub:'lats',        equip:'barbell', name:'T-Bar Row',                     desc:'Barbell in corner, row with V-grip. Thick back builder.' },
  { group:'back', sub:'rhomboids',   equip:'barbell', name:'Chest Supported Barbell Row',   desc:'Face down on incline, row barbell. Pure rhomboid squeeze.' },
  { group:'back', sub:'rhomboids',   equip:'barbell', name:'Wide Grip Barbell Row',         desc:'Elbows flared out, pull to chest. Upper back and rhomboids.' },
  { group:'back', sub:'rhomboids',   equip:'barbell', name:'Seal Row',                      desc:'Lying face down on elevated bench. Row with zero momentum.' },
  { group:'back', sub:'lower_back',  equip:'barbell', name:'Barbell Deadlift',              desc:'The ultimate pull. Hip hinge, drive through heels. Full body.' },
  { group:'back', sub:'lower_back',  equip:'barbell', name:'Romanian Deadlift',             desc:'Stiff legs, hinge at hips. Bar slides down thighs. Hamstring and lower back.' },
  { group:'back', sub:'lower_back',  equip:'barbell', name:'Good Morning',                  desc:'Bar on back, hinge forward. Lower back and hamstring builder.' },
  { group:'back', sub:'lower_back',  equip:'barbell', name:'Rack Pull',                     desc:'Deadlift from knee height. Overloads lockout and upper back.' },
  // shoulders
  { group:'shoulders', sub:'front_delts',   equip:'barbell', name:'Overhead Press',              desc:'Standing strict press. Bar from shoulders to overhead. The OG.' },
  { group:'shoulders', sub:'front_delts',   equip:'barbell', name:'Push Press',                  desc:'Slight leg drive to press overhead. Heavier than strict press.' },
  { group:'shoulders', sub:'front_delts',   equip:'barbell', name:'Seated Barbell Press',        desc:'Seated, press from behind or in front. Strict shoulder press.' },
  { group:'shoulders', sub:'front_delts',   equip:'barbell', name:'Barbell Front Raise',         desc:'Overhand grip, raise bar to shoulder height. Front delt isolation.' },
  { group:'shoulders', sub:'lateral_delts', equip:'barbell', name:'Barbell Upright Row',         desc:'Narrow grip, pull to chin. Lateral delts and traps. Elbows high.' },
  { group:'shoulders', sub:'lateral_delts', equip:'barbell', name:'Wide Grip Upright Row',       desc:'Wider grip, pull to chest. More lateral delt, less trap.' },
  { group:'shoulders', sub:'rear_delts',    equip:'barbell', name:'Barbell Rear Delt Row',       desc:'Bent over, wide grip, pull to upper chest. Elbows flared for rear delts.' },
  { group:'shoulders', sub:'traps',         equip:'barbell', name:'Barbell Shrug',               desc:'Heavy bar at waist, shrug straight up. Hold at top 2 seconds.' },
  { group:'shoulders', sub:'traps',         equip:'barbell', name:'Behind Back Barbell Shrug',   desc:'Bar behind you in smith or rack. Different trap angle.' },
  { group:'shoulders', sub:'traps',         equip:'barbell', name:'Barbell Power Shrug',         desc:'Slight leg drive to shrug heavier. Explosive trap builder.' },
  // arms
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Barbell Curl',                desc:'Standing curl, shoulder width grip. The classic mass builder.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'EZ Bar Curl',                desc:'Angled grip is easier on wrists. Full range bicep curl.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Reverse Barbell Curl',       desc:'Overhand grip curl. Forearms and brachioradialis.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Barbell Preacher Curl',      desc:'Arms on preacher bench, curl. Short head isolation. No cheating.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Barbell Drag Curl',          desc:'Pull elbows back as you curl. Bar drags up your body.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Wide Grip Barbell Curl',     desc:'Wider than shoulder width. Targets short head of bicep.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Close Grip Barbell Curl',    desc:'Narrower grip. Targets long head of bicep.' },
  { group:'arms', sub:'biceps',   equip:'barbell', name:'Barbell 21s',                desc:'7 bottom half, 7 top half, 7 full range. Brutal pump.' },
  { group:'arms', sub:'triceps',  equip:'barbell', name:'Close Grip Barbell Press',   desc:'Flat bench, hands 10-12 inches apart. Heavy tricep press.' },
  { group:'arms', sub:'triceps',  equip:'barbell', name:'Barbell Skull Crusher',      desc:'Lying, lower bar to forehead. Extend up. Elbows stay fixed.' },
  { group:'arms', sub:'triceps',  equip:'barbell', name:'EZ Bar Skull Crusher',       desc:'Angled grip skull crusher. Easier on wrists.' },
  { group:'arms', sub:'triceps',  equip:'barbell', name:'Overhead Barbell Extension', desc:'Bar behind head, extend overhead. Long head tricep stretch.' },
  { group:'arms', sub:'triceps',  equip:'barbell', name:'JM Press',                   desc:'Hybrid skull crusher and close grip press. Tricep destroyer.' },
  { group:'arms', sub:'forearms', equip:'barbell', name:'Barbell Wrist Curl',         desc:'Forearms on bench, curl wrists up. Flexor builder.' },
  { group:'arms', sub:'forearms', equip:'barbell', name:'Reverse Barbell Wrist Curl', desc:'Overhand grip, curl wrists up. Extensor strength.' },
  { group:'arms', sub:'forearms', equip:'barbell', name:'Behind Back Wrist Curl',     desc:'Bar behind you, curl wrists. Different angle on forearms.' },
  // legs
  { group:'legs', sub:'quads',       equip:'barbell', name:'Back Squat',                    desc:'Bar on upper traps. Squat to parallel or below. King of legs.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'Front Squat',                   desc:'Bar on front delts. More upright torso. Quad dominant.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'Barbell Lunge',                 desc:'Bar on back, step forward into lunge. Alternate legs.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'Barbell Bulgarian Split Squat', desc:'Rear foot elevated, bar on back. Single leg quad killer.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'Barbell Step-Up',               desc:'Bar on back, step onto box. Drive through front heel.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'Pause Squat',                   desc:'Squat down, hold 2-3 seconds at bottom, drive up. No bounce.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'1.5 Rep Squat',                 desc:'Full squat, half up, back down, full up. Quad burner.' },
  { group:'legs', sub:'quads',       equip:'barbell', name:'Zercher Squat',                 desc:'Bar in crook of elbows. Deep squat, upright torso.' },
  { group:'legs', sub:'hamstrings',  equip:'barbell', name:'Barbell RDL',                   desc:'Stiff legs, bar slides down thighs. Maximum hamstring stretch.' },
  { group:'legs', sub:'hamstrings',  equip:'barbell', name:'Stiff Leg Deadlift',            desc:'Straight legs, hinge at hips. Hamstring and lower back.' },
  { group:'legs', sub:'hamstrings',  equip:'barbell', name:'Barbell Good Morning',          desc:'Bar on back, hinge forward. Hamstrings loaded.' },
  { group:'legs', sub:'hamstrings',  equip:'barbell', name:'Barbell Hip Thrust',            desc:'Back on bench, bar on hips. Drive up hard, squeeze glutes.' },
  { group:'legs', sub:'glutes',      equip:'barbell', name:'Barbell Glute Bridge',          desc:'Floor bridge with bar on hips. Squeeze glutes at top.' },
  { group:'legs', sub:'glutes',      equip:'barbell', name:'Sumo Deadlift',                 desc:'Wide stance, toes out. Bar between legs. Glute and inner thigh.' },
  { group:'legs', sub:'glutes',      equip:'barbell', name:'Barbell Curtsy Lunge',          desc:'Bar on back, step behind and across. Glute medius hit.' },
  { group:'legs', sub:'calves',      equip:'barbell', name:'Barbell Calf Raise',            desc:'Bar on back, raise on toes. Pause at top, slow negative.' },
  { group:'legs', sub:'calves',      equip:'barbell', name:'Seated Barbell Calf Raise',     desc:'Bar on knees, raise heels. Soleus focus.' },
  { group:'legs', sub:'inner_thigh', equip:'barbell', name:'Sumo Squat (Barbell)',          desc:'Wide stance, bar on back. Deep squat for inner thigh.' },
  { group:'legs', sub:'inner_thigh', equip:'barbell', name:'Barbell Lateral Lunge',         desc:'Bar on back, step wide to side. Inner thigh stretch.' },
  // core
  { group:'core', sub:'upper_abs', equip:'barbell', name:'Barbell Rollout',              desc:'Kneel, roll bar out in front. Pull back with abs. Brutal.' },
  { group:'core', sub:'upper_abs', equip:'barbell', name:'Weighted Sit-Up (Barbell)',    desc:'Light bar across chest, full sit-up.' },
  { group:'core', sub:'lower_abs', equip:'barbell', name:'Barbell Leg Raise',            desc:'Hold bar overhead for stability. Raise legs to 90°.' },
  { group:'core', sub:'obliques',  equip:'barbell', name:'Barbell Landmine Rotation',    desc:'Bar in corner, rotate side to side. Oblique and core power.' },
  { group:'core', sub:'obliques',  equip:'barbell', name:'Barbell Side Bend',            desc:'Bar on back, lean to each side. Controlled oblique work.' },
  { group:'core', sub:'deep_core', equip:'barbell', name:'Barbell Rollout (Full)',       desc:'Full extension rollout from knees or standing. Deep core destroyer.' },
  { group:'core', sub:'deep_core', equip:'barbell', name:'Landmine Anti-Rotation',       desc:'Press bar out, resist rotation. Core stability.' },

  // ── SMITH MACHINE ─────────────────────────────────────────────────────────
  { group:'chest',     sub:'mid_chest',      equip:'smith_machine', name:'Smith Machine Flat Press',          desc:'Guided bar path. Good for isolating chest without stabilizers.' },
  { group:'chest',     sub:'upper_chest',    equip:'smith_machine', name:'Smith Machine Incline Press',       desc:'Bench at 30-45° in smith. Upper chest focus, no spotter needed.' },
  { group:'chest',     sub:'lower_chest',    equip:'smith_machine', name:'Smith Machine Decline Press',       desc:'Decline bench in smith. Lower chest isolation.' },
  { group:'chest',     sub:'inner_chest',    equip:'smith_machine', name:'Smith Machine Close Grip Press',    desc:'Narrow grip on smith bar. Inner chest and triceps.' },
  { group:'back',      sub:'lats',           equip:'smith_machine', name:'Smith Machine Row',                 desc:'Bent over, pull bar to belly. Guided path for strict form.' },
  { group:'back',      sub:'rhomboids',      equip:'smith_machine', name:'Smith Machine Inverted Row',        desc:'Set bar low, hang underneath, pull chest up.' },
  { group:'back',      sub:'lower_back',     equip:'smith_machine', name:'Smith Machine Deadlift',            desc:'Guided deadlift. Good for learning form.' },
  { group:'shoulders', sub:'traps',          equip:'smith_machine', name:'Smith Machine Shrug',               desc:'Heavy shrugs with no balance concerns. Pure trap work.' },
  { group:'shoulders', sub:'front_delts',    equip:'smith_machine', name:'Smith Machine Shoulder Press',      desc:'Seated or standing. Press overhead on guided rails.' },
  { group:'shoulders', sub:'front_delts',    equip:'smith_machine', name:'Smith Machine Behind Neck Press',   desc:'Careful — press from behind head. Shoulder flexibility required.' },
  { group:'shoulders', sub:'lateral_delts',  equip:'smith_machine', name:'Smith Machine Upright Row',         desc:'Pull bar to chin on smith. Lateral delts and traps.' },
  { group:'shoulders', sub:'rear_delts',     equip:'smith_machine', name:'Smith Machine Face Pull',           desc:'Set bar at face height, pull toward face with elbows high.' },
  { group:'arms',      sub:'triceps',        equip:'smith_machine', name:'Smith Machine Tricep Press',        desc:'Tricep-focused pressing. Narrow grip, elbows tight.' },
  { group:'arms',      sub:'biceps',         equip:'smith_machine', name:'Smith Machine Drag Curl',           desc:'Curl bar up while pulling elbows back. Bicep isolation.' },
  { group:'legs',      sub:'quads',          equip:'smith_machine', name:'Smith Machine Squat',               desc:'Feet slightly forward, squat on guided rails. Safe for heavy sets.' },
  { group:'legs',      sub:'quads',          equip:'smith_machine', name:'Smith Machine Front Squat',         desc:'Bar on front delts, squat upright. Quad dominant.' },
  { group:'legs',      sub:'quads',          equip:'smith_machine', name:'Smith Machine Bulgarian Split Squat',desc:'Rear foot elevated. Single leg quad and glute.' },
  { group:'legs',      sub:'quads',          equip:'smith_machine', name:'Smith Machine Lunge',               desc:'Step forward or reverse under guided bar. Stable lunging.' },
  { group:'legs',      sub:'hamstrings',     equip:'smith_machine', name:'Smith Machine RDL',                 desc:'Guided Romanian deadlift. Focus on hamstring stretch.' },
  { group:'legs',      sub:'glutes',         equip:'smith_machine', name:'Smith Machine Hip Thrust',          desc:'Back on bench, bar guided. Heavy glute work, no balance issues.' },
  { group:'legs',      sub:'calves',         equip:'smith_machine', name:'Smith Machine Calf Raise',          desc:'Shoulders under bar, raise on toes. Go heavy.' },
  { group:'legs',      sub:'inner_thigh',    equip:'smith_machine', name:'Smith Machine Sumo Squat',          desc:'Wide stance under bar. Inner thigh and glutes.' },
  { group:'core',      sub:'deep_core',      equip:'smith_machine', name:'Smith Machine Rollout',             desc:'Bar at lowest setting. Roll out like ab wheel.' },

  // ── KETTLEBELL ────────────────────────────────────────────────────────────
  { group:'chest',     sub:'mid_chest',   equip:'kettlebell', name:'Kettlebell Floor Press',        desc:'Lie flat, press KB up. Unique grip challenges stabilizers.' },
  { group:'chest',     sub:'inner_chest', equip:'kettlebell', name:'Kettlebell Squeeze Press',      desc:'Press two KBs together while pressing up. Inner chest.' },
  { group:'chest',     sub:'upper_chest', equip:'kettlebell', name:'Kettlebell Pullover',           desc:'Lie on bench, lower KB behind head. Chest and lat stretch.' },
  { group:'back',      sub:'lats',        equip:'kettlebell', name:'Kettlebell Row',                desc:'Single arm row from hinge position. Pull to hip.' },
  { group:'back',      sub:'lats',        equip:'kettlebell', name:'Kettlebell Gorilla Row',        desc:'Two KBs on floor, alternating rows from bent position.' },
  { group:'back',      sub:'rhomboids',   equip:'kettlebell', name:'Kettlebell High Pull',          desc:'Explosive pull from hip to shoulder. Back and shoulders.' },
  { group:'back',      sub:'lower_back',  equip:'kettlebell', name:'Kettlebell Swing (Hinge)',      desc:'Hip hinge, swing KB to chest height. Lower back power.' },
  { group:'back',      sub:'lower_back',  equip:'kettlebell', name:'Kettlebell Deadlift',           desc:'KB between feet, hip hinge, stand up. Lower back foundation.' },
  { group:'back',      sub:'lower_back',  equip:'kettlebell', name:'Single Leg KB Deadlift',        desc:'One leg, hinge forward, KB hangs. Balance and lower back.' },
  { group:'shoulders', sub:'front_delts',   equip:'kettlebell', name:'Kettlebell Press',             desc:'Clean to rack position, press overhead. One arm at a time.' },
  { group:'shoulders', sub:'front_delts',   equip:'kettlebell', name:'Kettlebell Push Press',        desc:'Leg drive assist to press KB overhead. Heavier loads.' },
  { group:'shoulders', sub:'front_delts',   equip:'kettlebell', name:'Kettlebell Bottoms Up Press',  desc:'Hold KB upside down, press up. Insane stability challenge.' },
  { group:'shoulders', sub:'lateral_delts', equip:'kettlebell', name:'KB Lateral Raise',             desc:'Hold KB by horn, raise to side. Different grip challenges delts.' },
  { group:'shoulders', sub:'lateral_delts', equip:'kettlebell', name:'KB Halo',                      desc:'Circle KB around head. Shoulders, traps, core all working.' },
  { group:'shoulders', sub:'traps',         equip:'kettlebell', name:'KB Upright Row',               desc:'Two hands on horn, pull to chin. Traps and lateral delts.' },
  { group:'shoulders', sub:'traps',         equip:'kettlebell', name:'KB Shrug',                     desc:'Heavy KBs at sides, shrug up. Squeeze traps at top.' },
  { group:'shoulders', sub:'rear_delts',    equip:'kettlebell', name:'KB Bent Over Rear Fly',        desc:'Hinge forward, raise KBs to sides. Rear delt and rhomboids.' },
  { group:'arms', sub:'biceps',   equip:'kettlebell', name:'KB Curl',                      desc:'Hold horn with both hands or single arm. Curl up.' },
  { group:'arms', sub:'biceps',   equip:'kettlebell', name:'KB Hammer Curl',               desc:'Grip KB by horn vertically. Neutral grip curl.' },
  { group:'arms', sub:'biceps',   equip:'kettlebell', name:'KB Concentration Curl',        desc:'Seated, elbow on thigh. Curl KB for peak isolation.' },
  { group:'arms', sub:'triceps',  equip:'kettlebell', name:'KB Overhead Tricep Extension', desc:'Hold KB by horn behind head. Extend overhead.' },
  { group:'arms', sub:'triceps',  equip:'kettlebell', name:'KB Skull Crusher',             desc:'Lying, lower KB to forehead. Extend up. Control the weight.' },
  { group:'arms', sub:'triceps',  equip:'kettlebell', name:'KB Kickback',                  desc:'Bent over, extend KB behind. Squeeze at lockout.' },
  { group:'arms', sub:'forearms', equip:'kettlebell', name:'KB Farmer Carry',              desc:'Heavy KBs, walk with grip. Forearms and traps on fire.' },
  { group:'arms', sub:'forearms', equip:'kettlebell', name:'KB Wrist Curl',                desc:'Forearm on bench, curl KB with wrist.' },
  { group:'legs', sub:'quads',       equip:'kettlebell', name:'KB Goblet Squat',           desc:'Hold KB at chest by horns. Deep squat, elbows inside knees.' },
  { group:'legs', sub:'quads',       equip:'kettlebell', name:'KB Front Squat (Double)',   desc:'Two KBs in rack position. Squat keeping elbows up.' },
  { group:'legs', sub:'quads',       equip:'kettlebell', name:'KB Lunge',                  desc:'KBs at sides or rack position. Step forward into lunge.' },
  { group:'legs', sub:'quads',       equip:'kettlebell', name:'KB Step-Up',                desc:'Hold KBs, step onto box. Drive through heel.' },
  { group:'legs', sub:'quads',       equip:'kettlebell', name:'KB Pistol Squat',           desc:'Hold KB at chest, single leg squat. Advanced balance.' },
  { group:'legs', sub:'hamstrings',  equip:'kettlebell', name:'KB Swing',                  desc:'The king of KB exercises. Hip hinge, explosive swing. Full body.' },
  { group:'legs', sub:'hamstrings',  equip:'kettlebell', name:'KB Single Leg RDL',         desc:'One KB, one leg. Hinge forward. Hamstring and balance.' },
  { group:'legs', sub:'glutes',      equip:'kettlebell', name:'KB Sumo Deadlift',          desc:'Wide stance, KB between legs. Pull up to standing.' },
  { group:'legs', sub:'glutes',      equip:'kettlebell', name:'KB Hip Thrust',             desc:'Back on bench, KB on hips. Drive up, squeeze glutes.' },
  { group:'legs', sub:'calves',      equip:'kettlebell', name:'KB Calf Raise',             desc:'Hold KB, raise on toes. Pause at top.' },
  { group:'legs', sub:'inner_thigh', equip:'kettlebell', name:'KB Cossack Squat',          desc:'Wide stance, shift side to side. Deep inner thigh stretch.' },
  { group:'legs', sub:'inner_thigh', equip:'kettlebell', name:'KB Lateral Lunge',          desc:'Step wide holding KB. Deep side lunge for inner thigh.' },
  { group:'core', sub:'deep_core',  equip:'kettlebell', name:'KB Turkish Get-Up',          desc:'Floor to standing with KB overhead. Full body core stability.' },
  { group:'core', sub:'obliques',   equip:'kettlebell', name:'KB Windmill',                desc:'KB overhead, bend to opposite side. Obliques and stability.' },
  { group:'core', sub:'obliques',   equip:'kettlebell', name:'KB Russian Twist',           desc:'Seated, feet off floor. Rotate KB side to side.' },
  { group:'core', sub:'upper_abs',  equip:'kettlebell', name:'KB Sit-Up',                  desc:'Hold KB at chest, full sit-up. Weighted core.' },
  { group:'core', sub:'upper_abs',  equip:'kettlebell', name:'KB Crunch',                  desc:'Hold KB on chest, crunch up. Squeeze abs hard.' },
  { group:'core', sub:'lower_abs',  equip:'kettlebell', name:'KB Leg Raise',               desc:'KB between feet, raise legs to 90°. Lower ab burner.' },
  { group:'core', sub:'deep_core',  equip:'kettlebell', name:'KB Plank Pull-Through',      desc:'Plank, drag KB under body side to side. Anti-rotation.' },
  { group:'core', sub:'deep_core',  equip:'kettlebell', name:'KB Suitcase Carry',          desc:'One KB, walk straight. Resist lateral flexion. Core stability.' },

  // ── BANDS ─────────────────────────────────────────────────────────────────
  { group:'chest',     sub:'mid_chest',   equip:'bands', name:'Band Push-Up',              desc:'Band across back, hands on ends. Push-up with added resistance.' },
  { group:'chest',     sub:'mid_chest',   equip:'bands', name:'Band Chest Fly',            desc:'Anchor behind, bring hands together at chest height.' },
  { group:'chest',     sub:'upper_chest', equip:'bands', name:'Band Incline Press',        desc:'Anchor low behind, press up and forward. Upper chest.' },
  { group:'chest',     sub:'inner_chest', equip:'bands', name:'Band Crossover',            desc:'High anchor, cross hands past midline. Inner chest squeeze.' },
  { group:'chest',     sub:'lower_chest', equip:'bands', name:'Band Decline Press',        desc:'Anchor high, press down and forward. Lower chest.' },
  { group:'back',      sub:'lats',        equip:'bands', name:'Band Row',                  desc:'Anchor in front, pull to ribs. Squeeze shoulder blades.' },
  { group:'back',      sub:'rhomboids',   equip:'bands', name:'Band Pull-Apart',           desc:'Hold band in front, pull apart to sides. Rear delts and rhomboids.' },
  { group:'back',      sub:'lats',        equip:'bands', name:'Band Lat Pulldown',         desc:'Anchor high, pull down to chest. Lat activation.' },
  { group:'back',      sub:'lats',        equip:'bands', name:'Band Straight Arm Pulldown',desc:'High anchor, arms straight, pull to thighs. Pure lats.' },
  { group:'back',      sub:'rhomboids',   equip:'bands', name:'Band Face Pull',            desc:'Anchor at face height, pull apart toward face. Rear delts.' },
  { group:'back',      sub:'lower_back',  equip:'bands', name:'Band Good Morning',         desc:'Band under feet, around neck. Hinge forward. Lower back.' },
  { group:'back',      sub:'lower_back',  equip:'bands', name:'Band Deadlift',             desc:'Stand on band, hinge and stand up. Hip hinge pattern.' },
  { group:'shoulders', sub:'front_delts',   equip:'bands', name:'Band Shoulder Press',     desc:'Stand on band, press overhead. Constant tension.' },
  { group:'shoulders', sub:'lateral_delts', equip:'bands', name:'Band Lateral Raise',      desc:'Stand on band, raise arms to sides. Burns different than DBs.' },
  { group:'shoulders', sub:'front_delts',   equip:'bands', name:'Band Front Raise',        desc:'Stand on band, raise in front to shoulder height.' },
  { group:'shoulders', sub:'rear_delts',    equip:'bands', name:'Band Reverse Fly',        desc:'Hold band in front, pull apart. Rear delts and upper back.' },
  { group:'shoulders', sub:'lateral_delts', equip:'bands', name:'Band Upright Row',        desc:'Stand on band, pull to chin. Lateral delts and traps.' },
  { group:'shoulders', sub:'traps',         equip:'bands', name:'Band Shrug',              desc:'Stand on band, handles at sides. Shrug up.' },
  { group:'shoulders', sub:'rear_delts',    equip:'bands', name:'Band External Rotation',  desc:'Elbow at side, rotate forearm out. Rotator cuff health.' },
  { group:'arms', sub:'biceps',   equip:'bands', name:'Band Curl',                 desc:'Stand on band, curl up. Increasing resistance at the top.' },
  { group:'arms', sub:'biceps',   equip:'bands', name:'Band Hammer Curl',          desc:'Neutral grip on band handles. Curl up.' },
  { group:'arms', sub:'biceps',   equip:'bands', name:'Band Concentration Curl',   desc:'Step on band, elbow on thigh. Single arm curl.' },
  { group:'arms', sub:'triceps',  equip:'bands', name:'Band Overhead Extension',   desc:'Anchor low behind, extend overhead. Tricep stretch.' },
  { group:'arms', sub:'triceps',  equip:'bands', name:'Band Pushdown',             desc:'Anchor high, push down. Mimics cable pushdown.' },
  { group:'arms', sub:'triceps',  equip:'bands', name:'Band Kickback',             desc:'Anchor low, kick arm back. Tricep squeeze.' },
  { group:'arms', sub:'forearms', equip:'bands', name:'Band Wrist Curl',           desc:'Loop band around hand, curl wrist. Forearm pump.' },
  { group:'legs', sub:'quads',       equip:'bands', name:'Band Squat',             desc:'Stand on band, handles at shoulders. Squat with resistance.' },
  { group:'legs', sub:'quads',       equip:'bands', name:'Band Leg Extension',     desc:'Anchor behind, strap around ankle. Extend knee. Quad isolation.' },
  { group:'legs', sub:'quads',       equip:'bands', name:'Band Lunge',             desc:'Stand on band, lunge forward with added resistance.' },
  { group:'legs', sub:'hamstrings',  equip:'bands', name:'Band Leg Curl',          desc:'Anchor in front, strap around ankle. Curl heel to glute.' },
  { group:'legs', sub:'hamstrings',  equip:'bands', name:'Band RDL',               desc:'Stand on band, hinge forward. Hamstring tension throughout.' },
  { group:'legs', sub:'glutes',      equip:'bands', name:'Band Glute Bridge',      desc:'Band over hips, anchored under feet. Bridge up.' },
  { group:'legs', sub:'glutes',      equip:'bands', name:'Band Kickback (Glute)',  desc:'On all fours, band around foot. Kick back for glute.' },
  { group:'legs', sub:'glutes',      equip:'bands', name:'Band Hip Abduction',     desc:'Band around knees, push knees apart. Glute medius.' },
  { group:'legs', sub:'glutes',      equip:'bands', name:'Band Clamshell',         desc:'Side lying, band around knees. Open and close. Glute activation.' },
  { group:'legs', sub:'calves',      equip:'bands', name:'Band Calf Raise',        desc:'Stand on band, raise on toes against resistance.' },
  { group:'legs', sub:'inner_thigh', equip:'bands', name:'Band Adduction',         desc:'Anchor to side, strap on ankle. Pull leg inward across body.' },
  { group:'legs', sub:'glutes',      equip:'bands', name:'Band Lateral Walk',      desc:'Band around ankles, walk sideways. Glutes and abductors.' },
  { group:'core', sub:'upper_abs', equip:'bands', name:'Band Crunch',              desc:'Anchor high behind, crunch forward against resistance.' },
  { group:'core', sub:'obliques',  equip:'bands', name:'Band Woodchop',            desc:'Anchor to side, diagonal chop across body. Obliques.' },
  { group:'core', sub:'deep_core', equip:'bands', name:'Band Pallof Press',        desc:'Anchor to side, press band straight out. Anti-rotation.' },
  { group:'core', sub:'deep_core', equip:'bands', name:'Band Anti-Rotation Hold',  desc:'Press band out, hold 10 seconds. Resist being pulled.' },
  { group:'core', sub:'lower_abs', equip:'bands', name:'Band Reverse Crunch',      desc:'Band anchored at feet, pull knees to chest. Lower abs.' },

  // ── EXTRA (dumbbells / cables / bodyweight) ────────────────────────────────
  { group:'shoulders', sub:'front_delts',   equip:'dumbbells',          name:'DB Snatch',                       desc:'Explosive one-arm pull from floor to overhead. Full body power.' },
  { group:'shoulders', sub:'front_delts',   equip:'dumbbells',          name:'DB Clean and Press',              desc:'Clean to shoulder, press overhead. Total body.' },
  { group:'chest',     sub:'mid_chest',     equip:'dumbbells',          name:'Around the World',                desc:'Flat bench, arc DBs from hips to overhead and back. Chest stretch.' },
  { group:'back',      sub:'lats',          equip:'dumbbells',          name:'Renegade Row',                    desc:'Plank on DBs, row one arm at a time. Core and back.' },
  { group:'legs',      sub:'quads',         equip:'dumbbells',          name:'DB Thruster',                     desc:'Front squat into overhead press. Full body metabolic move.' },
  { group:'shoulders', sub:'traps',         equip:'dumbbells',          name:'DB Hang Clean',                   desc:'From hang position, clean to shoulders. Explosive power.' },
  { group:'legs',      sub:'inner_thigh',   equip:'dumbbells',          name:'Goblet Cossack Squat',            desc:'Wide stance, DB at chest. Shift deep side to side.' },
  { group:'legs',      sub:'hamstrings',    equip:'dumbbells',          name:'DB Deficit RDL',                  desc:'Stand on plates, RDL with extra range. Deep hamstring stretch.' },
  { group:'arms',      sub:'biceps',        equip:'dumbbells',          name:'DB Prone Incline Curl',           desc:'Face down on incline, arms hang. Curl for constant tension.' },
  { group:'arms',      sub:'biceps',        equip:'dumbbells',          name:'DB Waiter Curl',                  desc:'Hold DB by one end vertically. Curl. Unique bicep squeeze.' },
  { group:'arms',      sub:'biceps',        equip:'functional_trainer', name:'Cable Bayesian Curl',             desc:'Facing away, arm behind body. Curl forward. Long head stretch.' },
  { group:'legs',      sub:'inner_thigh',   equip:'functional_trainer', name:'Cable Lateral Lunge',             desc:'Low pulley, step to side against resistance. Inner thigh.' },
  { group:'legs',      sub:'quads',         equip:'functional_trainer', name:'Cable Goblet Squat',              desc:'Low pulley, hold close to chest. Squat with cable tension.' },
  { group:'chest',     sub:'mid_chest',     equip:'functional_trainer', name:'Cable Chest Press',               desc:'Cables at chest height, step forward, press. Constant tension.' },
  { group:'chest',     sub:'upper_chest',   equip:'functional_trainer', name:'Cable Incline Fly',               desc:'Low pulleys, incline bench. Fly motion with cables.' },
  { group:'shoulders', sub:'rear_delts',    equip:'functional_trainer', name:'Cable Y Raise',                   desc:'Low pulleys, raise arms in Y shape overhead. Lower traps.' },
  { group:'arms',      sub:'triceps',       equip:'functional_trainer', name:'Cable Overhead Tricep Ext (Bar)', desc:'High pulley, bar attachment. Extend overhead.' },
  { group:'legs',      sub:'quads',         equip:'functional_trainer', name:'Cable Step-Through Lunge',        desc:'Low cable, lunge forward through. Quads with cable resistance.' },
  { group:'chest',     sub:'mid_chest',     equip:'bodyweight',         name:'Burpee',                          desc:'Squat, jump back, push-up, jump forward, jump up. Full body.' },
  { group:'back',      sub:'lats',          equip:'bodyweight',         name:'Muscle-Up (Assisted)',            desc:'Pull-up transitioning into a dip on top of bar. Advanced.' },
  { group:'core',      sub:'deep_core',     equip:'bodyweight',         name:'Dragon Flag',                     desc:'Lying, raise entire body using core. Lower slowly. Bruce Lee special.' },
  { group:'core',      sub:'deep_core',     equip:'bodyweight',         name:'L-Sit Hold',                      desc:'Support on hands or bars, hold legs straight out. Deep core.' },
  { group:'chest',     sub:'upper_chest',   equip:'bodyweight',         name:'Pseudo Planche Push-Up',          desc:'Hands turned back by hips. Lean forward, push up. Front delt and chest.' },
  { group:'chest',     sub:'mid_chest',     equip:'bodyweight',         name:'Archer Push-Up',                  desc:'Wide hands, lower to one side, push back. One arm works harder.' },
  { group:'chest',     sub:'mid_chest',     equip:'bodyweight',         name:'Hindu Push-Up',                   desc:'Dive forward and scoop up. Chest, shoulders, and flexibility.' },
  { group:'back',      sub:'lats',          equip:'bodyweight',         name:'Commando Pull-Up',                desc:'Hands staggered, pull up to one side, alternate. Lats and core.' },
  { group:'back',      sub:'lats',          equip:'bodyweight',         name:'Typewriter Pull-Up',              desc:'Pull up, shift side to side at the top. Advanced lat work.' },
  { group:'legs',      sub:'quads',         equip:'bodyweight',         name:'Box Jump',                        desc:'Explode up onto box. Land soft. Quad power and athleticism.' },
  { group:'legs',      sub:'quads',         equip:'bodyweight',         name:'Sissy Squat',                     desc:'Lean back on toes, lower body. Quad isolation. Use support if needed.' },
  { group:'arms',      sub:'triceps',       equip:'bodyweight',         name:'Crab Walk',                       desc:'Hands and feet, belly up. Walk forward/backward. Triceps and core.' },
  { group:'shoulders', sub:'front_delts',   equip:'bodyweight',         name:'Handstand Push-Up (Wall)',        desc:'Kick up to wall, lower head to floor. Press up. Shoulder beast.' },
  { group:'core',      sub:'deep_core',     equip:'bodyweight',         name:'Plank to Push-Up',                desc:'Forearm plank, push up to hands one at a time. Repeat.' },
  { group:'core',      sub:'upper_abs',     equip:'bodyweight',         name:'V-Sit Hold',                      desc:'Balance on tailbone, legs and torso form V shape. Hold.' },
  { group:'core',      sub:'obliques',      equip:'bodyweight',         name:'Hanging Windshield Wiper',        desc:'Hang from bar, rotate legs side to side. Advanced obliques.' },

  // ── SMITH MACHINE EXTRAS ──────────────────────────────────────────────────
  { group:'chest',     sub:'lower_chest',   equip:'smith_machine',      name:'Smith Machine Decline Press',     desc:'Decline bench in smith. Heavy lower chest work, no spotter needed.' },
  { group:'chest',     sub:'upper_chest',   equip:'smith_machine',      name:'Smith Machine Low-to-High Fly',   desc:'Set pins low, press up and in. Upper chest cable-fly feel.' },
  { group:'chest',     sub:'inner_chest',   equip:'smith_machine',      name:'Smith Machine Guillotine Press',  desc:'Bar to throat level, elbows wide. Extreme chest stretch.' },
  { group:'back',      sub:'rhomboids',     equip:'smith_machine',      name:'Smith Machine Bent Over Row',     desc:'Hinge forward, pull bar to lower chest. Strict rhomboid work.' },
  { group:'back',      sub:'lower_back',    equip:'smith_machine',      name:'Smith Machine Good Morning',      desc:'Bar on traps, hinge forward slowly. Lower back and hamstrings.' },
  { group:'shoulders', sub:'lateral_delts', equip:'smith_machine',      name:'Smith Machine Lateral Raise',     desc:'Stand sideways, grip bar with one hand. Raise to side. Unique angle.' },
  { group:'shoulders', sub:'rear_delts',    equip:'smith_machine',      name:'Smith Machine Rear Delt Row',     desc:'Grip wide, bent over. Pull bar to upper chest with elbows flared.' },
  { group:'arms',      sub:'biceps',        equip:'smith_machine',      name:'Smith Machine Curl',              desc:'Underhand grip on bar. Strict curl. Great for beginners.' },
  { group:'arms',      sub:'triceps',       equip:'smith_machine',      name:'Smith Machine Skull Crusher',     desc:'Lie under bar, lower to forehead. Extend up. Locked range of motion.' },
  { group:'arms',      sub:'forearms',      equip:'smith_machine',      name:'Smith Machine Wrist Curl',        desc:'Forearms on bench, bar in hands. Curl wrists up. Forearm pump.' },
  { group:'legs',      sub:'hamstrings',    equip:'smith_machine',      name:'Smith Machine Stiff Leg Deadlift',desc:'Straight legs, bar guided. Deep hamstring stretch each rep.' },
  { group:'legs',      sub:'glutes',        equip:'smith_machine',      name:'Smith Machine Curtsy Lunge',      desc:'Step behind and across under smith bar. Glute medius and outer glute.' },
  { group:'legs',      sub:'calves',        equip:'smith_machine',      name:'Smith Machine Seated Calf Raise', desc:'Bar across knees, raise heels. Targets soleus deep calf muscle.' },
  { group:'legs',      sub:'inner_thigh',   equip:'smith_machine',      name:'Smith Machine Lateral Lunge',     desc:'Step wide to side under guided bar. Inner thigh stretch.' },
  { group:'core',      sub:'upper_abs',     equip:'smith_machine',      name:'Smith Machine Crunch',            desc:'Bar low, lie under it, hook feet. Crunch up with resistance.' },
  { group:'core',      sub:'obliques',      equip:'smith_machine',      name:'Smith Machine Landmine Rotation', desc:'Bar fixed at pivot, rotate side to side. Oblique power.' },

  // ── LOWER CHEST EXTRAS ────────────────────────────────────────────────────
  { group:'chest',     sub:'lower_chest',   equip:'dumbbells',          name:'Decline Neutral Grip Press',      desc:'Decline bench, palms facing in. Easier on wrists, hits lower pec.' },
  { group:'chest',     sub:'lower_chest',   equip:'dumbbells',          name:'DB Dips (Weighted)',               desc:'Hold DB between legs while dipping. Extra resistance for lower chest.' },
  { group:'chest',     sub:'lower_chest',   equip:'functional_trainer', name:'Low-to-High Crunch Fly',          desc:'Pulleys low, elbows bent, bring hands up to eye level. Lower pec sweep.' },
  { group:'chest',     sub:'lower_chest',   equip:'bands',              name:'Band Chest Dip',                  desc:'Loop band over back, hold ends. Perform dip against extra resistance.' },
  { group:'chest',     sub:'lower_chest',   equip:'bodyweight',         name:'Ring Dip',                        desc:'Gymnastic rings. Deep dip, lean forward for chest focus. Advanced.' },
  { group:'chest',     sub:'lower_chest',   equip:'kettlebell',         name:'Kettlebell Decline Press',        desc:'Decline bench, press KBs up. Lower chest with unique wrist angle.' },

  // ── INNER CHEST EXTRAS ────────────────────────────────────────────────────
  { group:'chest',     sub:'inner_chest',   equip:'dumbbells',          name:'Single Arm DB Crossover',         desc:'One DB, reach across body at the top. Inner chest peak contraction.' },
  { group:'chest',     sub:'inner_chest',   equip:'functional_trainer', name:'Narrow Cable Press',              desc:'One pulley, narrow grip, press straight forward. Inner chest squeeze.' },
  { group:'chest',     sub:'inner_chest',   equip:'bands',              name:'Band Hex Press',                  desc:'Hold band taut between hands, press out against resistance. Inner chest.' },
  { group:'chest',     sub:'inner_chest',   equip:'bodyweight',         name:'Wide Grip Diamond Push-Up',       desc:'Hands form wide diamond. Squeeze pecs together at top.' },
  { group:'chest',     sub:'inner_chest',   equip:'kettlebell',         name:'Double KB Squeeze Press',         desc:'Two KBs pressed together, press overhead. Inner chest constant tension.' },

  // ── LOWER ABS EXTRAS ──────────────────────────────────────────────────────
  { group:'core',      sub:'lower_abs',     equip:'bodyweight',         name:'Flutter Kicks',                   desc:'Lying flat, legs low. Alternate small kicks. Lower abs endurance.' },
  { group:'core',      sub:'lower_abs',     equip:'bodyweight',         name:'Scissor Kicks',                   desc:'Cross legs over and under alternating. Lower abs and hip flexors.' },
  { group:'core',      sub:'lower_abs',     equip:'bodyweight',         name:'Tuck Crunch',                     desc:'Lie flat, bring knees and shoulders in simultaneously. Lower focus.' },
  { group:'core',      sub:'lower_abs',     equip:'bodyweight',         name:'Dead Bug',                        desc:'Extend opposite arm and leg, return. Lower ab and deep core stability.' },
  { group:'core',      sub:'lower_abs',     equip:'bodyweight',         name:'Hollow Body Hold',                desc:'Arms overhead, legs low off floor. Hold. Full lower ab contraction.' },
  { group:'core',      sub:'lower_abs',     equip:'dumbbells',          name:'Weighted Leg Raise',              desc:'DB between feet, raise to 90°. Extra resistance for lower abs.' },
  { group:'core',      sub:'lower_abs',     equip:'functional_trainer', name:'Cable Knee Tuck',                 desc:'Low pulley ankle strap. Lie face-up, pull knees to chest.' },
  { group:'core',      sub:'lower_abs',     equip:'bands',              name:'Band Lying Leg Raise',            desc:'Band around ankles adds resistance to leg raise. Lower ab burner.' },
  { group:'core',      sub:'lower_abs',     equip:'kettlebell',         name:'KB Figure 8 Leg Raise',           desc:'KB between feet, trace figure-8 in air. Lower ab control.' },

  // ── CALVES EXTRAS ─────────────────────────────────────────────────────────
  { group:'legs',      sub:'calves',        equip:'bodyweight',         name:'Single Leg Calf Raise',           desc:'One foot, raise on toes. Slow negative. Equal left/right strength.' },
  { group:'legs',      sub:'calves',        equip:'bodyweight',         name:'Jump Rope',                       desc:'Continuous jumping on toes. Explosive calf endurance and power.' },
  { group:'legs',      sub:'calves',        equip:'bodyweight',         name:'Explosive Calf Raise',            desc:'Fast, powerful raises onto toes. Builds reactive calf strength.' },
  { group:'legs',      sub:'calves',        equip:'dumbbells',          name:'Single Leg DB Calf Raise',        desc:'One DB, one leg. Stand on edge of step. Full range of motion.' },
  { group:'legs',      sub:'calves',        equip:'dumbbells',          name:'Seated DB Calf Raise',            desc:'Sit on bench, DB on knee. Raise heel. Isolates soleus.' },
  { group:'legs',      sub:'calves',        equip:'functional_trainer', name:'Cable Calf Raise',                desc:'Low pulley, strap around waist or hold. Rise on toes with resistance.' },
  { group:'legs',      sub:'calves',        equip:'barbell',            name:'Donkey Calf Raise',               desc:'Bent at hips, weight on low back. Raise on toes. Old school mass builder.' },
  { group:'legs',      sub:'calves',        equip:'bands',              name:'Banded Calf Raise',               desc:'Band under foot, over shoulder. Raise heel against resistance.' },

  // ── FOREARMS EXTRAS ───────────────────────────────────────────────────────
  { group:'arms',      sub:'forearms',      equip:'dumbbells',          name:'DB Reverse Curl',                 desc:'Overhand grip, curl up. Brachioradialis and forearm extensors.' },
  { group:'arms',      sub:'forearms',      equip:'dumbbells',          name:'DB Zottman Curl',                 desc:'Curl up supinated, rotate to overhand at top, lower slowly. Both sides.' },
  { group:'arms',      sub:'forearms',      equip:'dumbbells',          name:'DB Wrist Roller',                 desc:'Hold DB vertically, roll wrist. Forearm pump in seconds.' },
  { group:'arms',      sub:'forearms',      equip:'dumbbells',          name:'Radial Deviation Curl',           desc:'Thumb side up, curl in radial deviation. Unique forearm angle.' },
  { group:'arms',      sub:'forearms',      equip:'bodyweight',         name:'Dead Hang',                       desc:'Hang from bar, fully relaxed. Grip and forearm endurance builder.' },
  { group:'arms',      sub:'forearms',      equip:'bodyweight',         name:'Towel Pull-Up',                   desc:'Drape towel over bar, grip ends. Pull up. Extreme grip training.' },
  { group:'arms',      sub:'forearms',      equip:'bodyweight',         name:'Finger Push-Up',                  desc:'Push-up on fingertips. Finger flexor and forearm strength.' },
  { group:'arms',      sub:'forearms',      equip:'functional_trainer', name:'Cable Reverse Wrist Curl',        desc:'Forearm on pad, pull wrist up against cable. Extensor isolation.' },
  { group:'arms',      sub:'forearms',      equip:'bands',              name:'Band Wrist Extension',            desc:'Band over top of hand, extend wrist up. Extensor strength.' },
  { group:'arms',      sub:'forearms',      equip:'kettlebell',         name:'KB Bottoms Up Hold',              desc:'Hold KB upside down at shoulder. Grip maxes out in seconds.' },

  // ── REAR DELTS EXTRAS ─────────────────────────────────────────────────────
  { group:'shoulders', sub:'rear_delts',    equip:'dumbbells',          name:'Prone DB Rear Fly',               desc:'Face down on incline, raise arms to sides. Pure rear delt isolation.' },
  { group:'shoulders', sub:'rear_delts',    equip:'dumbbells',          name:'DB W-Raise',                      desc:'Bent over, elbows bent at 90°, raise to W shape. Rear delts and rhomboids.' },
  { group:'shoulders', sub:'rear_delts',    equip:'functional_trainer', name:'Cable Rear Delt Row',             desc:'Single arm, low to high. Pull to ear level with elbow flared.' },
  { group:'shoulders', sub:'rear_delts',    equip:'bands',              name:'Band No Money Curl',              desc:'Elbows at sides, rotate forearms outward. Rotator cuff and rear delts.' },
  { group:'shoulders', sub:'rear_delts',    equip:'bodyweight',         name:'Scapular Pull-Up',                desc:'Hang from bar, depress and retract scapula without bending elbows.' },
  { group:'shoulders', sub:'rear_delts',    equip:'kettlebell',         name:'KB Face Pull',                    desc:'Hinge forward, row KBs to face with elbows flared. Rear delt burn.' },

  // ── INNER THIGH EXTRAS ────────────────────────────────────────────────────
  { group:'legs',      sub:'inner_thigh',   equip:'bodyweight',         name:'Sumo Squat Hold',                 desc:'Wide squat, hold at bottom. Inner thigh stretch and strength.' },
  { group:'legs',      sub:'inner_thigh',   equip:'bodyweight',         name:'Side Lying Leg Raise (Lower)',    desc:'Bottom leg raises up across body. Inner thigh and adductor.' },
  { group:'legs',      sub:'inner_thigh',   equip:'bodyweight',         name:'Frog Squat',                      desc:'Squat with knees wide, heels together. Deep inner thigh stretch.' },
  { group:'legs',      sub:'inner_thigh',   equip:'dumbbells',          name:'DB Sumo Deadlift',                desc:'Wide stance, DB between legs. Pull up. Inner thigh and glutes.' },
  { group:'legs',      sub:'inner_thigh',   equip:'functional_trainer', name:'Cable Adduction',                 desc:'Ankle strap, low pulley to side. Pull leg across midline. Adductor.' },
  { group:'legs',      sub:'inner_thigh',   equip:'bands',              name:'Banded Side Step',                desc:'Band around ankles, step laterally. Abductors and adductors both fire.' },
  { group:'legs',      sub:'inner_thigh',   equip:'kettlebell',         name:'KB Sumo High Pull',               desc:'Wide stance, KB between legs. Explosive pull to chin. Inner thigh power.' },

  // ── UPPER ABS EXTRAS ──────────────────────────────────────────────────────
  { group:'core',      sub:'upper_abs',     equip:'bodyweight',         name:'Crunch',                          desc:'Classic crunch. Hands behind head, lift shoulders. Squeeze upper abs.' },
  { group:'core',      sub:'upper_abs',     equip:'bodyweight',         name:'Bicycle Crunch',                  desc:'Rotate elbow to opposite knee. Alternating. Upper abs and obliques.' },
  { group:'core',      sub:'upper_abs',     equip:'bodyweight',         name:'Reverse Crunch',                  desc:'Hips come up, knees pull toward chest. Lower and upper abs together.' },
  { group:'core',      sub:'upper_abs',     equip:'bodyweight',         name:'Toe Touch Crunch',                desc:'Legs vertical, reach hands to toes. Upper ab contraction.' },
  { group:'core',      sub:'upper_abs',     equip:'dumbbells',          name:'Dumbbell Crunch',                 desc:'Hold DB on chest or overhead to add resistance to standard crunch.' },
  { group:'core',      sub:'upper_abs',     equip:'functional_trainer', name:'Kneeling Cable Crunch',           desc:'High pulley, kneel, pull elbows to knees. Classic cable ab move.' },
  { group:'core',      sub:'upper_abs',     equip:'bands',              name:'Band Crunch Pulldown',            desc:'Anchor high, grab band, kneel and crunch elbows to thighs.' },
  { group:'core',      sub:'upper_abs',     equip:'kettlebell',         name:'KB Weighted Crunch',              desc:'KB on chest, crunch up. Extra load burns upper abs faster.' },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${EXERCISES.length} exercises...`);

  // Firestore batch writes (max 500 per batch)
  const BATCH_SIZE = 499;
  for (let i = 0; i < EXERCISES.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = EXERCISES.slice(i, i + BATCH_SIZE);

    chunk.forEach(ex => {
      // Deterministic doc ID: sub_equip_name → re-running is a safe upsert
      const id = `${ex.sub}__${ex.equip}__${ex.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
      const ref = db.collection('exercises').doc(id);
      batch.set(ref, ex);
    });

    await batch.commit();
    console.log(`  Committed ${Math.min(i + BATCH_SIZE, EXERCISES.length)} / ${EXERCISES.length}`);
  }

  console.log('Done! ✓');
}

seed().catch(console.error).finally(() => process.exit(0));
