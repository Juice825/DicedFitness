// ============================================================
// DICED FITNESS — EXERCISE DATABASE EXPANSION
// Format: { name, desc, group, sub, equip }
// New equipment: barbell, smith_machine, kettlebell, bands
// Plus additional exercises for: dumbbells, functional_trainer, bodyweight
// ============================================================

const NEW_EXERCISES = [

// ============================================================
// BARBELL
// ============================================================

// CHEST - Upper
{ name: "Incline Barbell Press", desc: "Bench 30-45°. Unrack, lower to upper chest, press up. Keep shoulder blades pinched.", group: "chest", sub: "upper_chest", equip: "barbell" },
{ name: "Incline Close Grip Press", desc: "Incline bench, narrow grip. Upper chest and tricep combo.", group: "chest", sub: "upper_chest", equip: "barbell" },
{ name: "Reverse Grip Incline Press", desc: "Underhand grip on incline. Unique upper chest activation.", group: "chest", sub: "upper_chest", equip: "barbell" },

// CHEST - Mid
{ name: "Flat Barbell Bench Press", desc: "The king. Bar to mid-chest, drive up. Arch back, feet planted.", group: "chest", sub: "mid_chest", equip: "barbell" },
{ name: "Wide Grip Bench Press", desc: "Hands wider than normal. More chest stretch, less tricep.", group: "chest", sub: "mid_chest", equip: "barbell" },
{ name: "Pause Rep Bench Press", desc: "Pause bar on chest 2 seconds. Eliminates momentum. Builds power.", group: "chest", sub: "mid_chest", equip: "barbell" },
{ name: "Floor Press", desc: "Lie on floor, press up. Limits range for lockout strength.", group: "chest", sub: "mid_chest", equip: "barbell" },

// CHEST - Lower
{ name: "Decline Barbell Press", desc: "Decline bench, press from lower chest. Heavy lower pec builder.", group: "chest", sub: "lower_chest", equip: "barbell" },

// CHEST - Inner
{ name: "Close Grip Bench Press", desc: "Hands 12 inches apart. Inner chest squeeze plus triceps.", group: "chest", sub: "inner_chest", equip: "barbell" },

// BACK - Lats
{ name: "Barbell Row", desc: "Bent over 45°, pull bar to belly button. Squeeze lats hard.", group: "back", sub: "lats", equip: "barbell" },
{ name: "Pendlay Row", desc: "Dead stop each rep from floor. Explosive pull to chest. Strict form.", group: "back", sub: "lats", equip: "barbell" },
{ name: "Underhand Barbell Row", desc: "Supinated grip row. More lat and bicep involvement.", group: "back", sub: "lats", equip: "barbell" },
{ name: "T-Bar Row", desc: "Barbell in corner, row with V-grip. Thick back builder.", group: "back", sub: "lats", equip: "barbell" },

// BACK - Rhomboids
{ name: "Chest Supported Barbell Row", desc: "Face down on incline, row barbell. Pure rhomboid squeeze.", group: "back", sub: "rhomboids", equip: "barbell" },
{ name: "Wide Grip Barbell Row", desc: "Elbows flared out, pull to chest. Upper back and rhomboids.", group: "back", sub: "rhomboids", equip: "barbell" },
{ name: "Seal Row", desc: "Lying face down on elevated bench. Row with zero momentum.", group: "back", sub: "rhomboids", equip: "barbell" },

// BACK - Lower
{ name: "Barbell Deadlift", desc: "The ultimate pull. Hip hinge, drive through heels. Full body.", group: "back", sub: "lower_back", equip: "barbell" },
{ name: "Romanian Deadlift", desc: "Stiff legs, hinge at hips. Bar slides down thighs. Hamstring and lower back.", group: "back", sub: "lower_back", equip: "barbell" },
{ name: "Good Morning", desc: "Bar on back, hinge forward. Lower back and hamstring builder.", group: "back", sub: "lower_back", equip: "barbell" },
{ name: "Rack Pull", desc: "Deadlift from knee height. Overloads lockout and upper back.", group: "back", sub: "lower_back", equip: "barbell" },

// SHOULDERS - Front Delts
{ name: "Overhead Press", desc: "Standing strict press. Bar from shoulders to overhead. The OG.", group: "shoulders", sub: "front_delts", equip: "barbell" },
{ name: "Push Press", desc: "Slight leg drive to press overhead. Heavier than strict press.", group: "shoulders", sub: "front_delts", equip: "barbell" },
{ name: "Seated Barbell Press", desc: "Seated, press from behind or in front. Strict shoulder press.", group: "shoulders", sub: "front_delts", equip: "barbell" },
{ name: "Barbell Front Raise", desc: "Overhand grip, raise bar to shoulder height. Front delt isolation.", group: "shoulders", sub: "front_delts", equip: "barbell" },

// SHOULDERS - Lateral Delts
{ name: "Barbell Upright Row", desc: "Narrow grip, pull to chin. Lateral delts and traps. Elbows high.", group: "shoulders", sub: "lateral_delts", equip: "barbell" },
{ name: "Wide Grip Upright Row", desc: "Wider grip, pull to chest. More lateral delt, less trap.", group: "shoulders", sub: "lateral_delts", equip: "barbell" },

// SHOULDERS - Rear Delts
{ name: "Barbell Rear Delt Row", desc: "Bent over, wide grip, pull to upper chest. Elbows flared for rear delts.", group: "shoulders", sub: "rear_delts", equip: "barbell" },

// SHOULDERS - Traps
{ name: "Barbell Shrug", desc: "Heavy bar at waist, shrug straight up. Hold at top 2 seconds.", group: "shoulders", sub: "traps", equip: "barbell" },
{ name: "Behind Back Barbell Shrug", desc: "Bar behind you in smith or rack. Different trap angle.", group: "shoulders", sub: "traps", equip: "barbell" },
{ name: "Barbell Power Shrug", desc: "Slight leg drive to shrug heavier. Explosive trap builder.", group: "shoulders", sub: "traps", equip: "barbell" },

// ARMS - Biceps
{ name: "Barbell Curl", desc: "Standing curl, shoulder width grip. The classic mass builder.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "EZ Bar Curl", desc: "Angled grip is easier on wrists. Full range bicep curl.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "Reverse Barbell Curl", desc: "Overhand grip curl. Forearms and brachioradialis.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "Barbell Preacher Curl", desc: "Arms on preacher bench, curl. Short head isolation. No cheating.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "Barbell Drag Curl", desc: "Pull elbows back as you curl. Bar drags up your body.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "Wide Grip Barbell Curl", desc: "Wider than shoulder width. Targets short head of bicep.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "Close Grip Barbell Curl", desc: "Narrower grip. Targets long head of bicep.", group: "arms", sub: "biceps", equip: "barbell" },
{ name: "Barbell 21s", desc: "7 bottom half, 7 top half, 7 full range. Brutal pump.", group: "arms", sub: "biceps", equip: "barbell" },

// ARMS - Triceps
{ name: "Close Grip Barbell Press", desc: "Flat bench, hands 10-12 inches apart. Heavy tricep press.", group: "arms", sub: "triceps", equip: "barbell" },
{ name: "Barbell Skull Crusher", desc: "Lying, lower bar to forehead. Extend up. Elbows stay fixed.", group: "arms", sub: "triceps", equip: "barbell" },
{ name: "EZ Bar Skull Crusher", desc: "Angled grip skull crusher. Easier on wrists.", group: "arms", sub: "triceps", equip: "barbell" },
{ name: "Overhead Barbell Extension", desc: "Bar behind head, extend overhead. Long head tricep stretch.", group: "arms", sub: "triceps", equip: "barbell" },
{ name: "JM Press", desc: "Hybrid skull crusher and close grip press. Tricep destroyer.", group: "arms", sub: "triceps", equip: "barbell" },

// ARMS - Forearms
{ name: "Barbell Wrist Curl", desc: "Forearms on bench, curl wrists up. Flexor builder.", group: "arms", sub: "forearms", equip: "barbell" },
{ name: "Reverse Barbell Wrist Curl", desc: "Overhand grip, curl wrists up. Extensor strength.", group: "arms", sub: "forearms", equip: "barbell" },
{ name: "Behind Back Wrist Curl", desc: "Bar behind you, curl wrists. Different angle on forearms.", group: "arms", sub: "forearms", equip: "barbell" },

// LEGS - Quads
{ name: "Back Squat", desc: "Bar on upper traps. Squat to parallel or below. King of legs.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "Front Squat", desc: "Bar on front delts. More upright torso. Quad dominant.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "Barbell Lunge", desc: "Bar on back, step forward into lunge. Alternate legs.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "Barbell Bulgarian Split Squat", desc: "Rear foot elevated, bar on back. Single leg quad killer.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "Barbell Step-Up", desc: "Bar on back, step onto box. Drive through front heel.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "Pause Squat", desc: "Squat down, hold 2-3 seconds at bottom, drive up. No bounce.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "1.5 Rep Squat", desc: "Full squat, half up, back down, full up. Quad burner.", group: "legs", sub: "quads", equip: "barbell" },
{ name: "Zercher Squat", desc: "Bar in crook of elbows. Deep squat, upright torso.", group: "legs", sub: "quads", equip: "barbell" },

// LEGS - Hamstrings
{ name: "Barbell RDL", desc: "Stiff legs, bar slides down thighs. Maximum hamstring stretch.", group: "legs", sub: "hamstrings", equip: "barbell" },
{ name: "Stiff Leg Deadlift", desc: "Straight legs, hinge at hips. Hamstring and lower back.", group: "legs", sub: "hamstrings", equip: "barbell" },
{ name: "Barbell Good Morning", desc: "Bar on back, hinge forward. Hamstrings loaded.", group: "legs", sub: "hamstrings", equip: "barbell" },
{ name: "Barbell Hip Thrust", desc: "Back on bench, bar on hips. Drive up hard, squeeze glutes.", group: "legs", sub: "hamstrings", equip: "barbell" },

// LEGS - Glutes
{ name: "Barbell Hip Thrust", desc: "Back on bench, bar across hips. Drive up, squeeze hard at top.", group: "legs", sub: "glutes", equip: "barbell" },
{ name: "Barbell Glute Bridge", desc: "Floor bridge with bar on hips. Squeeze glutes at top.", group: "legs", sub: "glutes", equip: "barbell" },
{ name: "Sumo Deadlift", desc: "Wide stance, toes out. Bar between legs. Glute and inner thigh.", group: "legs", sub: "glutes", equip: "barbell" },
{ name: "Barbell Curtsy Lunge", desc: "Bar on back, step behind and across. Glute medius hit.", group: "legs", sub: "glutes", equip: "barbell" },

// LEGS - Calves
{ name: "Barbell Calf Raise", desc: "Bar on back, raise on toes. Pause at top, slow negative.", group: "legs", sub: "calves", equip: "barbell" },
{ name: "Seated Barbell Calf Raise", desc: "Bar on knees, raise heels. Soleus focus.", group: "legs", sub: "calves", equip: "barbell" },

// LEGS - Inner Thigh
{ name: "Sumo Squat (Barbell)", desc: "Wide stance, bar on back. Deep squat for inner thigh.", group: "legs", sub: "inner_thigh", equip: "barbell" },
{ name: "Barbell Lateral Lunge", desc: "Bar on back, step wide to side. Inner thigh stretch.", group: "legs", sub: "inner_thigh", equip: "barbell" },

// CORE - Upper Abs
{ name: "Barbell Rollout", desc: "Kneel, roll bar out in front. Pull back with abs. Brutal.", group: "core", sub: "upper_abs", equip: "barbell" },
{ name: "Weighted Sit-Up (Barbell)", desc: "Light bar across chest, full sit-up.", group: "core", sub: "upper_abs", equip: "barbell" },

// CORE - Lower Abs
{ name: "Barbell Leg Raise", desc: "Hold bar overhead for stability. Raise legs to 90°.", group: "core", sub: "lower_abs", equip: "barbell" },

// CORE - Obliques
{ name: "Barbell Landmine Rotation", desc: "Bar in corner, rotate side to side. Oblique and core power.", group: "core", sub: "obliques", equip: "barbell" },
{ name: "Barbell Side Bend", desc: "Bar on back, lean to each side. Controlled oblique work.", group: "core", sub: "obliques", equip: "barbell" },

// CORE - Deep Core
{ name: "Barbell Rollout (Full)", desc: "Full extension rollout from knees or standing. Deep core destroyer.", group: "core", sub: "deep_core", equip: "barbell" },
{ name: "Landmine Anti-Rotation", desc: "Press bar out, resist rotation. Core stability.", group: "core", sub: "deep_core", equip: "barbell" },


// ============================================================
// SMITH MACHINE
// ============================================================

// CHEST
{ name: "Smith Machine Flat Press", desc: "Guided bar path. Good for isolating chest without stabilizers.", group: "chest", sub: "mid_chest", equip: "smith_machine" },
{ name: "Smith Machine Incline Press", desc: "Bench at 30-45° in smith. Upper chest focus, no spotter needed.", group: "chest", sub: "upper_chest", equip: "smith_machine" },
{ name: "Smith Machine Decline Press", desc: "Decline bench in smith. Lower chest isolation.", group: "chest", sub: "lower_chest", equip: "smith_machine" },
{ name: "Smith Machine Close Grip Press", desc: "Narrow grip on smith bar. Inner chest and triceps.", group: "chest", sub: "inner_chest", equip: "smith_machine" },

// BACK
{ name: "Smith Machine Row", desc: "Bent over, pull bar to belly. Guided path for strict form.", group: "back", sub: "lats", equip: "smith_machine" },
{ name: "Smith Machine Inverted Row", desc: "Set bar low, hang underneath, pull chest up.", group: "back", sub: "rhomboids", equip: "smith_machine" },
{ name: "Smith Machine Deadlift", desc: "Guided deadlift. Good for learning form.", group: "back", sub: "lower_back", equip: "smith_machine" },
{ name: "Smith Machine Shrug", desc: "Heavy shrugs with no balance concerns. Pure trap work.", group: "shoulders", sub: "traps", equip: "smith_machine" },

// SHOULDERS
{ name: "Smith Machine Shoulder Press", desc: "Seated or standing. Press overhead on guided rails.", group: "shoulders", sub: "front_delts", equip: "smith_machine" },
{ name: "Smith Machine Behind Neck Press", desc: "Careful — press from behind head. Shoulder flexibility required.", group: "shoulders", sub: "front_delts", equip: "smith_machine" },
{ name: "Smith Machine Upright Row", desc: "Pull bar to chin on smith. Lateral delts and traps.", group: "shoulders", sub: "lateral_delts", equip: "smith_machine" },
{ name: "Smith Machine Face Pull", desc: "Set bar at face height, pull toward face with elbows high.", group: "shoulders", sub: "rear_delts", equip: "smith_machine" },

// ARMS
{ name: "Smith Machine Close Grip Press", desc: "Tricep-focused pressing. Narrow grip, elbows tight.", group: "arms", sub: "triceps", equip: "smith_machine" },
{ name: "Smith Machine Drag Curl", desc: "Curl bar up while pulling elbows back. Bicep isolation.", group: "arms", sub: "biceps", equip: "smith_machine" },

// LEGS
{ name: "Smith Machine Squat", desc: "Feet slightly forward, squat on guided rails. Safe for heavy sets.", group: "legs", sub: "quads", equip: "smith_machine" },
{ name: "Smith Machine Front Squat", desc: "Bar on front delts, squat upright. Quad dominant.", group: "legs", sub: "quads", equip: "smith_machine" },
{ name: "Smith Machine Bulgarian Split Squat", desc: "Rear foot elevated. Single leg quad and glute.", group: "legs", sub: "quads", equip: "smith_machine" },
{ name: "Smith Machine Lunge", desc: "Step forward or reverse under guided bar. Stable lunging.", group: "legs", sub: "quads", equip: "smith_machine" },
{ name: "Smith Machine RDL", desc: "Guided Romanian deadlift. Focus on hamstring stretch.", group: "legs", sub: "hamstrings", equip: "smith_machine" },
{ name: "Smith Machine Hip Thrust", desc: "Back on bench, bar guided. Heavy glute work, no balance issues.", group: "legs", sub: "glutes", equip: "smith_machine" },
{ name: "Smith Machine Calf Raise", desc: "Shoulders under bar, raise on toes. Go heavy.", group: "legs", sub: "calves", equip: "smith_machine" },
{ name: "Smith Machine Sumo Squat", desc: "Wide stance under bar. Inner thigh and glutes.", group: "legs", sub: "inner_thigh", equip: "smith_machine" },

// CORE
{ name: "Smith Machine Rollout", desc: "Bar at lowest setting. Roll out like ab wheel.", group: "core", sub: "deep_core", equip: "smith_machine" },


// ============================================================
// KETTLEBELL
// ============================================================

// CHEST
{ name: "Kettlebell Floor Press", desc: "Lie flat, press KB up. Unique grip challenges stabilizers.", group: "chest", sub: "mid_chest", equip: "kettlebell" },
{ name: "Kettlebell Squeeze Press", desc: "Press two KBs together while pressing up. Inner chest.", group: "chest", sub: "inner_chest", equip: "kettlebell" },
{ name: "Kettlebell Pullover", desc: "Lie on bench, lower KB behind head. Chest and lat stretch.", group: "chest", sub: "upper_chest", equip: "kettlebell" },

// BACK
{ name: "Kettlebell Row", desc: "Single arm row from hinge position. Pull to hip.", group: "back", sub: "lats", equip: "kettlebell" },
{ name: "Kettlebell Gorilla Row", desc: "Two KBs on floor, alternating rows from bent position.", group: "back", sub: "lats", equip: "kettlebell" },
{ name: "Kettlebell High Pull", desc: "Explosive pull from hip to shoulder. Back and shoulders.", group: "back", sub: "rhomboids", equip: "kettlebell" },
{ name: "Kettlebell Swing (Hinge)", desc: "Hip hinge, swing KB to chest height. Lower back power.", group: "back", sub: "lower_back", equip: "kettlebell" },
{ name: "Kettlebell Deadlift", desc: "KB between feet, hip hinge, stand up. Lower back foundation.", group: "back", sub: "lower_back", equip: "kettlebell" },
{ name: "Single Leg KB Deadlift", desc: "One leg, hinge forward, KB hangs. Balance and lower back.", group: "back", sub: "lower_back", equip: "kettlebell" },

// SHOULDERS
{ name: "Kettlebell Press", desc: "Clean to rack position, press overhead. One arm at a time.", group: "shoulders", sub: "front_delts", equip: "kettlebell" },
{ name: "Kettlebell Push Press", desc: "Leg drive assist to press KB overhead. Heavier loads.", group: "shoulders", sub: "front_delts", equip: "kettlebell" },
{ name: "Kettlebell Bottoms Up Press", desc: "Hold KB upside down, press up. Insane stability challenge.", group: "shoulders", sub: "front_delts", equip: "kettlebell" },
{ name: "KB Lateral Raise", desc: "Hold KB by horn, raise to side. Different grip challenges delts.", group: "shoulders", sub: "lateral_delts", equip: "kettlebell" },
{ name: "KB Halo", desc: "Circle KB around head. Shoulders, traps, core all working.", group: "shoulders", sub: "lateral_delts", equip: "kettlebell" },
{ name: "KB Upright Row", desc: "Two hands on horn, pull to chin. Traps and lateral delts.", group: "shoulders", sub: "traps", equip: "kettlebell" },
{ name: "KB Shrug", desc: "Heavy KBs at sides, shrug up. Squeeze traps at top.", group: "shoulders", sub: "traps", equip: "kettlebell" },
{ name: "KB Bent Over Rear Fly", desc: "Hinge forward, raise KBs to sides. Rear delt and rhomboids.", group: "shoulders", sub: "rear_delts", equip: "kettlebell" },

// ARMS
{ name: "KB Curl", desc: "Hold horn with both hands or single arm. Curl up.", group: "arms", sub: "biceps", equip: "kettlebell" },
{ name: "KB Hammer Curl", desc: "Grip KB by horn vertically. Neutral grip curl.", group: "arms", sub: "biceps", equip: "kettlebell" },
{ name: "KB Concentration Curl", desc: "Seated, elbow on thigh. Curl KB for peak isolation.", group: "arms", sub: "biceps", equip: "kettlebell" },
{ name: "KB Overhead Tricep Extension", desc: "Hold KB by horn behind head. Extend overhead.", group: "arms", sub: "triceps", equip: "kettlebell" },
{ name: "KB Skull Crusher", desc: "Lying, lower KB to forehead. Extend up. Control the weight.", group: "arms", sub: "triceps", equip: "kettlebell" },
{ name: "KB Kickback", desc: "Bent over, extend KB behind. Squeeze at lockout.", group: "arms", sub: "triceps", equip: "kettlebell" },
{ name: "KB Farmer Carry", desc: "Heavy KBs, walk with grip. Forearms and traps on fire.", group: "arms", sub: "forearms", equip: "kettlebell" },
{ name: "KB Wrist Curl", desc: "Forearm on bench, curl KB with wrist.", group: "arms", sub: "forearms", equip: "kettlebell" },

// LEGS
{ name: "KB Goblet Squat", desc: "Hold KB at chest by horns. Deep squat, elbows inside knees.", group: "legs", sub: "quads", equip: "kettlebell" },
{ name: "KB Front Squat (Double)", desc: "Two KBs in rack position. Squat keeping elbows up.", group: "legs", sub: "quads", equip: "kettlebell" },
{ name: "KB Lunge", desc: "KBs at sides or rack position. Step forward into lunge.", group: "legs", sub: "quads", equip: "kettlebell" },
{ name: "KB Step-Up", desc: "Hold KBs, step onto box. Drive through heel.", group: "legs", sub: "quads", equip: "kettlebell" },
{ name: "KB Pistol Squat", desc: "Hold KB at chest, single leg squat. Advanced balance.", group: "legs", sub: "quads", equip: "kettlebell" },
{ name: "KB Swing", desc: "The king of KB exercises. Hip hinge, explosive swing. Full body.", group: "legs", sub: "hamstrings", equip: "kettlebell" },
{ name: "KB Single Leg RDL", desc: "One KB, one leg. Hinge forward. Hamstring and balance.", group: "legs", sub: "hamstrings", equip: "kettlebell" },
{ name: "KB Sumo Deadlift", desc: "Wide stance, KB between legs. Pull up to standing.", group: "legs", sub: "glutes", equip: "kettlebell" },
{ name: "KB Hip Thrust", desc: "Back on bench, KB on hips. Drive up, squeeze glutes.", group: "legs", sub: "glutes", equip: "kettlebell" },
{ name: "KB Calf Raise", desc: "Hold KB, raise on toes. Pause at top.", group: "legs", sub: "calves", equip: "kettlebell" },
{ name: "KB Cossack Squat", desc: "Wide stance, shift side to side. Deep inner thigh stretch.", group: "legs", sub: "inner_thigh", equip: "kettlebell" },
{ name: "KB Lateral Lunge", desc: "Step wide holding KB. Deep side lunge for inner thigh.", group: "legs", sub: "inner_thigh", equip: "kettlebell" },

// CORE
{ name: "KB Turkish Get-Up", desc: "Floor to standing with KB overhead. Full body core stability.", group: "core", sub: "deep_core", equip: "kettlebell" },
{ name: "KB Windmill", desc: "KB overhead, bend to opposite side. Obliques and stability.", group: "core", sub: "obliques", equip: "kettlebell" },
{ name: "KB Russian Twist", desc: "Seated, feet off floor. Rotate KB side to side.", group: "core", sub: "obliques", equip: "kettlebell" },
{ name: "KB Sit-Up", desc: "Hold KB at chest, full sit-up. Weighted core.", group: "core", sub: "upper_abs", equip: "kettlebell" },
{ name: "KB Crunch", desc: "Hold KB on chest, crunch up. Squeeze abs hard.", group: "core", sub: "upper_abs", equip: "kettlebell" },
{ name: "KB Leg Raise", desc: "KB between feet, raise legs to 90°. Lower ab burner.", group: "core", sub: "lower_abs", equip: "kettlebell" },
{ name: "KB Plank Pull-Through", desc: "Plank, drag KB under body side to side. Anti-rotation.", group: "core", sub: "deep_core", equip: "kettlebell" },
{ name: "KB Suitcase Carry", desc: "One KB, walk straight. Resist lateral flexion. Core stability.", group: "core", sub: "deep_core", equip: "kettlebell" },


// ============================================================
// RESISTANCE BANDS
// ============================================================

// CHEST
{ name: "Band Push-Up", desc: "Band across back, hands on ends. Push-up with added resistance.", group: "chest", sub: "mid_chest", equip: "bands" },
{ name: "Band Chest Fly", desc: "Anchor behind, bring hands together at chest height.", group: "chest", sub: "mid_chest", equip: "bands" },
{ name: "Band Incline Press", desc: "Anchor low behind, press up and forward. Upper chest.", group: "chest", sub: "upper_chest", equip: "bands" },
{ name: "Band Crossover", desc: "High anchor, cross hands past midline. Inner chest squeeze.", group: "chest", sub: "inner_chest", equip: "bands" },
{ name: "Band Decline Press", desc: "Anchor high, press down and forward. Lower chest.", group: "chest", sub: "lower_chest", equip: "bands" },

// BACK
{ name: "Band Row", desc: "Anchor in front, pull to ribs. Squeeze shoulder blades.", group: "back", sub: "lats", equip: "bands" },
{ name: "Band Pull-Apart", desc: "Hold band in front, pull apart to sides. Rear delts and rhomboids.", group: "back", sub: "rhomboids", equip: "bands" },
{ name: "Band Lat Pulldown", desc: "Anchor high, pull down to chest. Lat activation.", group: "back", sub: "lats", equip: "bands" },
{ name: "Band Straight Arm Pulldown", desc: "High anchor, arms straight, pull to thighs. Pure lats.", group: "back", sub: "lats", equip: "bands" },
{ name: "Band Face Pull", desc: "Anchor at face height, pull apart toward face. Rear delts.", group: "back", sub: "rhomboids", equip: "bands" },
{ name: "Band Good Morning", desc: "Band under feet, around neck. Hinge forward. Lower back.", group: "back", sub: "lower_back", equip: "bands" },
{ name: "Band Deadlift", desc: "Stand on band, hinge and stand up. Hip hinge pattern.", group: "back", sub: "lower_back", equip: "bands" },

// SHOULDERS
{ name: "Band Shoulder Press", desc: "Stand on band, press overhead. Constant tension.", group: "shoulders", sub: "front_delts", equip: "bands" },
{ name: "Band Lateral Raise", desc: "Stand on band, raise arms to sides. Burns different than DBs.", group: "shoulders", sub: "lateral_delts", equip: "bands" },
{ name: "Band Front Raise", desc: "Stand on band, raise in front to shoulder height.", group: "shoulders", sub: "front_delts", equip: "bands" },
{ name: "Band Reverse Fly", desc: "Hold band in front, pull apart. Rear delts and upper back.", group: "shoulders", sub: "rear_delts", equip: "bands" },
{ name: "Band Upright Row", desc: "Stand on band, pull to chin. Lateral delts and traps.", group: "shoulders", sub: "lateral_delts", equip: "bands" },
{ name: "Band Shrug", desc: "Stand on band, handles at sides. Shrug up.", group: "shoulders", sub: "traps", equip: "bands" },
{ name: "Band External Rotation", desc: "Elbow at side, rotate forearm out. Rotator cuff health.", group: "shoulders", sub: "rear_delts", equip: "bands" },

// ARMS
{ name: "Band Curl", desc: "Stand on band, curl up. Increasing resistance at the top.", group: "arms", sub: "biceps", equip: "bands" },
{ name: "Band Hammer Curl", desc: "Neutral grip on band handles. Curl up.", group: "arms", sub: "biceps", equip: "bands" },
{ name: "Band Concentration Curl", desc: "Step on band, elbow on thigh. Single arm curl.", group: "arms", sub: "biceps", equip: "bands" },
{ name: "Band Overhead Extension", desc: "Anchor low behind, extend overhead. Tricep stretch.", group: "arms", sub: "triceps", equip: "bands" },
{ name: "Band Pushdown", desc: "Anchor high, push down. Mimics cable pushdown.", group: "arms", sub: "triceps", equip: "bands" },
{ name: "Band Kickback", desc: "Anchor low, kick arm back. Tricep squeeze.", group: "arms", sub: "triceps", equip: "bands" },
{ name: "Band Wrist Curl", desc: "Loop band around hand, curl wrist. Forearm pump.", group: "arms", sub: "forearms", equip: "bands" },

// LEGS
{ name: "Band Squat", desc: "Stand on band, handles at shoulders. Squat with resistance.", group: "legs", sub: "quads", equip: "bands" },
{ name: "Band Leg Extension", desc: "Anchor behind, strap around ankle. Extend knee. Quad isolation.", group: "legs", sub: "quads", equip: "bands" },
{ name: "Band Lunge", desc: "Stand on band, lunge forward with added resistance.", group: "legs", sub: "quads", equip: "bands" },
{ name: "Band Leg Curl", desc: "Anchor in front, strap around ankle. Curl heel to glute.", group: "legs", sub: "hamstrings", equip: "bands" },
{ name: "Band RDL", desc: "Stand on band, hinge forward. Hamstring tension throughout.", group: "legs", sub: "hamstrings", equip: "bands" },
{ name: "Band Glute Bridge", desc: "Band over hips, anchored under feet. Bridge up.", group: "legs", sub: "glutes", equip: "bands" },
{ name: "Band Kickback (Glute)", desc: "On all fours, band around foot. Kick back for glute.", group: "legs", sub: "glutes", equip: "bands" },
{ name: "Band Hip Abduction", desc: "Band around knees, push knees apart. Glute medius.", group: "legs", sub: "glutes", equip: "bands" },
{ name: "Band Clamshell", desc: "Side lying, band around knees. Open and close. Glute activation.", group: "legs", sub: "glutes", equip: "bands" },
{ name: "Band Calf Raise", desc: "Stand on band, raise on toes against resistance.", group: "legs", sub: "calves", equip: "bands" },
{ name: "Band Adduction", desc: "Anchor to side, strap on ankle. Pull leg inward across body.", group: "legs", sub: "inner_thigh", equip: "bands" },
{ name: "Band Lateral Walk", desc: "Band around ankles, walk sideways. Glutes and abductors.", group: "legs", sub: "glutes", equip: "bands" },

// CORE
{ name: "Band Crunch", desc: "Anchor high behind, crunch forward against resistance.", group: "core", sub: "upper_abs", equip: "bands" },
{ name: "Band Woodchop", desc: "Anchor to side, diagonal chop across body. Obliques.", group: "core", sub: "obliques", equip: "bands" },
{ name: "Band Pallof Press", desc: "Anchor to side, press band straight out. Anti-rotation.", group: "core", sub: "deep_core", equip: "bands" },
{ name: "Band Anti-Rotation Hold", desc: "Press band out, hold 10 seconds. Resist being pulled.", group: "core", sub: "deep_core", equip: "bands" },
{ name: "Band Reverse Crunch", desc: "Band anchored at feet, pull knees to chest. Lower abs.", group: "core", sub: "lower_abs", equip: "bands" },


// ============================================================
// ADDITIONAL EXERCISES FOR EXISTING EQUIPMENT
// ============================================================

// DUMBBELLS - extras
{ name: "DB Snatch", desc: "Explosive one-arm pull from floor to overhead. Full body power.", group: "shoulders", sub: "front_delts", equip: "dumbbells" },
{ name: "DB Clean and Press", desc: "Clean to shoulder, press overhead. Total body.", group: "shoulders", sub: "front_delts", equip: "dumbbells" },
{ name: "Around the World", desc: "Flat bench, arc DBs from hips to overhead and back. Chest stretch.", group: "chest", sub: "mid_chest", equip: "dumbbells" },
{ name: "Renegade Row", desc: "Plank on DBs, row one arm at a time. Core and back.", group: "back", sub: "lats", equip: "dumbbells" },
{ name: "DB Thruster", desc: "Front squat into overhead press. Full body metabolic move.", group: "legs", sub: "quads", equip: "dumbbells" },
{ name: "DB Hang Clean", desc: "From hang position, clean to shoulders. Explosive power.", group: "shoulders", sub: "traps", equip: "dumbbells" },
{ name: "Goblet Cossack Squat", desc: "Wide stance, DB at chest. Shift deep side to side.", group: "legs", sub: "inner_thigh", equip: "dumbbells" },
{ name: "DB Deficit RDL", desc: "Stand on plates, RDL with extra range. Deep hamstring stretch.", group: "legs", sub: "hamstrings", equip: "dumbbells" },
{ name: "DB Prone Incline Curl", desc: "Face down on incline, arms hang. Curl for constant tension.", group: "arms", sub: "biceps", equip: "dumbbells" },
{ name: "DB Waiter Curl", desc: "Hold DB by one end vertically. Curl. Unique bicep squeeze.", group: "arms", sub: "biceps", equip: "dumbbells" },

// FUNCTIONAL TRAINER (Cable Machine) - extras
{ name: "Cable Bayesian Curl", desc: "Facing away, arm behind body. Curl forward. Long head stretch.", group: "arms", sub: "biceps", equip: "functional_trainer" },
{ name: "Cable Lateral Lunge", desc: "Low pulley, step to side against resistance. Inner thigh.", group: "legs", sub: "inner_thigh", equip: "functional_trainer" },
{ name: "Cable Goblet Squat", desc: "Low pulley, hold close to chest. Squat with cable tension.", group: "legs", sub: "quads", equip: "functional_trainer" },
{ name: "Cable Chest Press", desc: "Cables at chest height, step forward, press. Constant tension.", group: "chest", sub: "mid_chest", equip: "functional_trainer" },
{ name: "Cable Incline Fly", desc: "Low pulleys, incline bench. Fly motion with cables.", group: "chest", sub: "upper_chest", equip: "functional_trainer" },
{ name: "Cable Y Raise", desc: "Low pulleys, raise arms in Y shape overhead. Lower traps.", group: "shoulders", sub: "rear_delts", equip: "functional_trainer" },
{ name: "Cable Overhead Tricep Ext (Bar)", desc: "High pulley, bar attachment. Extend overhead.", group: "arms", sub: "triceps", equip: "functional_trainer" },
{ name: "Cable Step-Through Lunge", desc: "Low cable, lunge forward through. Quads with cable resistance.", group: "legs", sub: "quads", equip: "functional_trainer" },

// BODYWEIGHT - extras
{ name: "Burpee", desc: "Squat, jump back, push-up, jump forward, jump up. Full body.", group: "chest", sub: "mid_chest", equip: "bodyweight" },
{ name: "Muscle-Up (Assisted)", desc: "Pull-up transitioning into a dip on top of bar. Advanced.", group: "back", sub: "lats", equip: "bodyweight" },
{ name: "Dragon Flag", desc: "Lying, raise entire body using core. Lower slowly. Bruce Lee special.", group: "core", sub: "deep_core", equip: "bodyweight" },
{ name: "L-Sit Hold", desc: "Support on hands or bars, hold legs straight out. Deep core.", group: "core", sub: "deep_core", equip: "bodyweight" },
{ name: "Pseudo Planche Push-Up", desc: "Hands turned back by hips. Lean forward, push up. Front delt and chest.", group: "chest", sub: "upper_chest", equip: "bodyweight" },
{ name: "Archer Push-Up", desc: "Wide hands, lower to one side, push back. One arm works harder.", group: "chest", sub: "mid_chest", equip: "bodyweight" },
{ name: "Hindu Push-Up", desc: "Dive forward and scoop up. Chest, shoulders, and flexibility.", group: "chest", sub: "mid_chest", equip: "bodyweight" },
{ name: "Commando Pull-Up", desc: "Hands staggered, pull up to one side, alternate. Lats and core.", group: "back", sub: "lats", equip: "bodyweight" },
{ name: "Typewriter Pull-Up", desc: "Pull up, shift side to side at the top. Advanced lat work.", group: "back", sub: "lats", equip: "bodyweight" },
{ name: "Box Jump", desc: "Explode up onto box. Land soft. Quad power and athleticism.", group: "legs", sub: "quads", equip: "bodyweight" },
{ name: "Sissy Squat", desc: "Lean back on toes, lower body. Quad isolation. Use support if needed.", group: "legs", sub: "quads", equip: "bodyweight" },
{ name: "Crab Walk", desc: "Hands and feet, belly up. Walk forward/backward. Triceps and core.", group: "arms", sub: "triceps", equip: "bodyweight" },
{ name: "Handstand Push-Up (Wall)", desc: "Kick up to wall, lower head to floor. Press up. Shoulder beast.", group: "shoulders", sub: "front_delts", equip: "bodyweight" },
{ name: "Plank to Push-Up", desc: "Forearm plank, push up to hands one at a time. Repeat.", group: "core", sub: "deep_core", equip: "bodyweight" },
{ name: "V-Sit Hold", desc: "Balance on tailbone, legs and torso form V shape. Hold.", group: "core", sub: "upper_abs", equip: "bodyweight" },
{ name: "Hanging Windshield Wiper", desc: "Hang from bar, rotate legs side to side. Advanced obliques.", group: "core", sub: "obliques", equip: "bodyweight" },

];

// Total new exercises in this file: ~230+
// Combined with existing 200+, database will have 430+ exercises

module.exports = NEW_EXERCISES;
