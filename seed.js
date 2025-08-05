require("dotenv").config();
const mongoose = require("mongoose");

// ====== DB Connection ======
const MONGO_URI = process.env.MONGOURL;

if (!MONGO_URI) {
  console.error("❌ MONGOURL not found in .env");
  process.exit(1);
}

// ====== Connect and Initialize ======
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }
}

// ====== Define Schemas ======
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    queries: [{ type: Schema.Types.ObjectId, ref: "Query" }],
  },
  { timestamps: true }
);

const DepartmentSchema = new Schema(
  {
    departmentName: { type: String, required: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: "DepartmentMember" }],
    queries: [{ type: Schema.Types.ObjectId, ref: "Query" }],
  },
  { timestamps: true }
);

const DepartmentMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

const ThreadObjectSchema = new Schema(
  {
    message: { type: String, required: true },
    authorType: {
      type: String,
      enum: ["User", "DepartmentMember"],
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "objects.authorType",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const QuerySchema = new Schema(
  {
    title: { type: String, required: true },
    objects: [ThreadObjectSchema],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

// ====== Drop existing collections and recreate models ======
async function dropAllCollectionsAndModels() {
  try {
    // Drop all existing mongoose models
    Object.keys(mongoose.models).forEach((modelName) => {
      delete mongoose.models[modelName];
    });

    // Get all collection names
    const collections = mongoose.connection.collections;

    // Drop each collection
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.drop();
        console.log(`🗑️  Dropped collection: ${key}`);
      } catch (error) {
        // Collection might not exist, ignore error
        console.log(`ℹ️  Collection ${key} not found or already dropped`);
      }
    }

    console.log("✅ All collections dropped successfully");
  } catch (error) {
    console.log("ℹ️  Error dropping collections:", error.message);
  }
}

// Create models
const User = mongoose.model("User", UserSchema);
const Department = mongoose.model("Department", DepartmentSchema);
const DepartmentMember = mongoose.model(
  "DepartmentMember",
  DepartmentMemberSchema
);
const Query = mongoose.model("Query", QuerySchema);

// ====== Extensive Dummy Data ======
const departmentsData = [
  {
    name: "Municipal Services",
    description: "Garbage collection, road maintenance, street lighting",
  },
  {
    name: "Water Supply",
    description: "Water distribution, quality control, pipeline maintenance",
  },
  {
    name: "Traffic Management",
    description: "Traffic signals, parking, road safety",
  },
  {
    name: "Public Health",
    description: "Health centers, sanitation, disease control",
  },
  {
    name: "Education",
    description: "Schools, libraries, educational programs",
  },
  {
    name: "Revenue",
    description: "Tax collection, property registration, certificates",
  },
  {
    name: "Fire Services",
    description: "Fire safety, emergency response, rescue operations",
  },
  {
    name: "Parks & Gardens",
    description: "Park maintenance, tree plantation, landscaping",
  },
];

const usersData = [
  {
    name: "Rajesh Kumar",
    username: "rajesh_k",
    email: "rajesh.kumar@email.com",
    address: "Vijay Nagar, Indore",
    password: "rajesh123",
  },
  {
    name: "Priya Sharma",
    username: "priya_s",
    email: "priya.sharma@email.com",
    address: "Palasia Square, Indore",
    password: "priya123",
  },
  {
    name: "Amit Patel",
    username: "amit_p",
    email: "amit.patel@email.com",
    address: "New Palasia, Indore",
    password: "amit123",
  },
  {
    name: "Sunita Gupta",
    username: "sunita_g",
    email: "sunita.gupta@email.com",
    address: "MG Road, Indore",
    password: "sunita123",
  },
  {
    name: "Vikash Singh",
    username: "vikash_s",
    email: "vikash.singh@email.com",
    address: "AB Road, Indore",
    password: "vikash123",
  },
  {
    name: "Kavita Jain",
    username: "kavita_j",
    email: "kavita.jain@email.com",
    address: "Bhawarkua, Indore",
    password: "kavita123",
  },
  {
    name: "Rohit Agarwal",
    username: "rohit_a",
    email: "rohit.agarwal@email.com",
    address: "Sapna Sangeeta, Indore",
    password: "rohit123",
  },
  {
    name: "Meera Verma",
    username: "meera_v",
    email: "meera.verma@email.com",
    address: "Tilak Nagar, Indore",
    password: "meera123",
  },
  {
    name: "Suresh Yadav",
    username: "suresh_y",
    email: "suresh.yadav@email.com",
    address: "Rau, Indore",
    password: "suresh123",
  },
  {
    name: "Anjali Dubey",
    username: "anjali_d",
    email: "anjali.dubey@email.com",
    address: "Dewas Naka, Indore",
    password: "anjali123",
  },
  {
    name: "Manish Tiwari",
    username: "manish_t",
    email: "manish.tiwari@email.com",
    address: "Sukhliya, Indore",
    password: "manish123",
  },
  {
    name: "Pooja Chouhan",
    username: "pooja_c",
    email: "pooja.chouhan@email.com",
    address: "Kanadiya, Indore",
    password: "pooja123",
  },
  {
    name: "Deepak Malviya",
    username: "deepak_m",
    email: "deepak.malviya@email.com",
    address: "Scheme 54, Indore",
    password: "deepak123",
  },
  {
    name: "Ritu Joshi",
    username: "ritu_j",
    email: "ritu.joshi@email.com",
    address: "Scheme 78, Indore",
    password: "ritu123",
  },
  {
    name: "Arjun Solanki",
    username: "arjun_sol",
    email: "arjun.solanki@email.com",
    address: "LIG Colony, Indore",
    password: "arjun123",
  },
];

const departmentMembersData = [
  // Municipal Services
  {
    name: "Inspector Ramesh",
    username: "ramesh_inspector",
    email: "ramesh@municipal.gov.in",
    dept: "Municipal Services",
    password: "ramesh123",
  },
  {
    name: "Supervisor Lakshmi",
    username: "lakshmi_supervisor",
    email: "lakshmi@municipal.gov.in",
    dept: "Municipal Services",
    password: "lakshmi123",
  },
  {
    name: "Officer Vinod",
    username: "vinod_officer",
    email: "vinod@municipal.gov.in",
    dept: "Municipal Services",
    password: "vinod123",
  },

  // Water Supply
  {
    name: "Engineer Sunil",
    username: "sunil_engineer",
    email: "sunil@watersupply.gov.in",
    dept: "Water Supply",
    password: "sunil123",
  },
  {
    name: "Technician Ravi",
    username: "ravi_tech",
    email: "ravi@watersupply.gov.in",
    dept: "Water Supply",
    password: "ravi123",
  },
  {
    name: "Manager Seema",
    username: "seema_manager",
    email: "seema@watersupply.gov.in",
    dept: "Water Supply",
    password: "seema123",
  },

  // Traffic Management
  {
    name: "Inspector Ajay",
    username: "ajay_traffic",
    email: "ajay@traffic.gov.in",
    dept: "Traffic Management",
    password: "ajay123",
  },
  {
    name: "Constable Mohan",
    username: "mohan_constable",
    email: "mohan@traffic.gov.in",
    dept: "Traffic Management",
    password: "mohan123",
  },

  // Public Health
  {
    name: "Dr. Ashok",
    username: "dr_ashok",
    email: "ashok@health.gov.in",
    dept: "Public Health",
    password: "ashok123",
  },
  {
    name: "Nurse Kamala",
    username: "kamala_nurse",
    email: "kamala@health.gov.in",
    dept: "Public Health",
    password: "kamala123",
  },
  {
    name: "Health Officer Prakash",
    username: "prakash_health",
    email: "prakash@health.gov.in",
    dept: "Public Health",
    password: "prakash123",
  },

  // Education
  {
    name: "Principal Madhuri",
    username: "madhuri_principal",
    email: "madhuri@education.gov.in",
    dept: "Education",
    password: "madhuri123",
  },
  {
    name: "Coordinator Sanjay",
    username: "sanjay_coord",
    email: "sanjay@education.gov.in",
    dept: "Education",
    password: "sanjay123",
  },

  // Revenue
  {
    name: "Clerk Narayan",
    username: "narayan_clerk",
    email: "narayan@revenue.gov.in",
    dept: "Revenue",
    password: "narayan123",
  },
  {
    name: "Officer Shobha",
    username: "shobha_revenue",
    email: "shobha@revenue.gov.in",
    dept: "Revenue",
    password: "shobha123",
  },

  // Fire Services
  {
    name: "Chief Raghav",
    username: "raghav_fire",
    email: "raghav@fire.gov.in",
    dept: "Fire Services",
    password: "raghav123",
  },
  {
    name: "Officer Dinesh",
    username: "dinesh_fire",
    email: "dinesh@fire.gov.in",
    dept: "Fire Services",
    password: "dinesh123",
  },

  // Parks & Gardens
  {
    name: "Gardener Mukesh",
    username: "mukesh_gardener",
    email: "mukesh@parks.gov.in",
    dept: "Parks & Gardens",
    password: "mukesh123",
  },
  {
    name: "Supervisor Anita",
    username: "anita_parks",
    email: "anita@parks.gov.in",
    dept: "Parks & Gardens",
    password: "anita123",
  },
];

const queriesData = [
  // Municipal Services Queries
  {
    title: "Garbage not collected for 1 week",
    department: "Municipal Services",
    author: "rajesh_k",
    status: "in_progress",
    threads: [
      {
        author: "rajesh_k",
        type: "User",
        message:
          "The garbage truck has not come to our area (Vijay Nagar) for the past 7 days. The situation is getting very unhygienic.",
      },
      {
        author: "ramesh_inspector",
        type: "DepartmentMember",
        message:
          "We apologize for the inconvenience. Our truck broke down but we have arranged an alternate vehicle.",
      },
      {
        author: "rajesh_k",
        type: "User",
        message: "When can we expect the collection to resume?",
      },
      {
        author: "ramesh_inspector",
        type: "DepartmentMember",
        message:
          "Collection will resume from tomorrow morning. We will also do a cleanup of the accumulated garbage.",
      },
    ],
  },
  {
    title: "Street light not working",
    department: "Municipal Services",
    author: "priya_s",
    status: "resolved",
    threads: [
      {
        author: "priya_s",
        type: "User",
        message:
          "The street light near Palasia Square bus stop has been flickering and now completely stopped working.",
      },
      {
        author: "vinod_officer",
        type: "DepartmentMember",
        message:
          "Thank you for reporting. We will send our electrician team to check this today.",
      },
      {
        author: "vinod_officer",
        type: "DepartmentMember",
        message:
          "The faulty bulb has been replaced and the street light is now working properly.",
      },
      {
        author: "priya_s",
        type: "User",
        message: "Thank you! The light is working fine now.",
      },
    ],
  },
  {
    title: "Road pothole causing accidents",
    department: "Municipal Services",
    author: "amit_p",
    status: "open",
    threads: [
      {
        author: "amit_p",
        type: "User",
        message:
          "There is a huge pothole on New Palasia main road that has caused 2 bike accidents this week.",
      },
      {
        author: "lakshmi_supervisor",
        type: "DepartmentMember",
        message:
          "We have noted your complaint. Our road maintenance team will inspect the location within 2 days.",
      },
    ],
  },

  // Water Supply Queries
  {
    title: "No water supply for 3 days",
    department: "Water Supply",
    author: "sunita_g",
    status: "in_progress",
    threads: [
      {
        author: "sunita_g",
        type: "User",
        message:
          "Our area (MG Road) has had no water supply for 3 consecutive days. Please help urgently.",
      },
      {
        author: "sunil_engineer",
        type: "DepartmentMember",
        message:
          "There was a major pipeline burst in the main supply line. We are working on repairs.",
      },
      {
        author: "sunita_g",
        type: "User",
        message:
          "When will the supply be restored? We are facing severe water shortage.",
      },
      {
        author: "sunil_engineer",
        type: "DepartmentMember",
        message:
          "Repairs will be completed by tomorrow evening. We are arranging water tankers for immediate relief.",
      },
    ],
  },
  {
    title: "Dirty water from tap",
    department: "Water Supply",
    author: "vikash_s",
    status: "open",
    threads: [
      {
        author: "vikash_s",
        type: "User",
        message:
          "The water coming from our taps is muddy and has a bad smell. This started 2 days ago.",
      },
      {
        author: "ravi_tech",
        type: "DepartmentMember",
        message:
          "This could be due to maintenance work upstream. We will test the water quality and clean the supply line.",
      },
    ],
  },
  {
    title: "Low water pressure",
    department: "Water Supply",
    author: "kavita_j",
    status: "resolved",
    threads: [
      {
        author: "kavita_j",
        type: "User",
        message:
          "Water pressure in Bhawarkua area is very low, especially during morning hours.",
      },
      {
        author: "seema_manager",
        type: "DepartmentMember",
        message:
          "We will check the pump stations and pressure boosters in your area.",
      },
      {
        author: "seema_manager",
        type: "DepartmentMember",
        message:
          "The pressure booster has been repaired and water pressure should be normal now.",
      },
    ],
  },

  // Traffic Management Queries
  {
    title: "Traffic signal not working",
    department: "Traffic Management",
    author: "rohit_a",
    status: "in_progress",
    threads: [
      {
        author: "rohit_a",
        type: "User",
        message:
          "The traffic signal at Sapna Sangeeta intersection has been blinking yellow for 2 days causing traffic jams.",
      },
      {
        author: "ajay_traffic",
        type: "DepartmentMember",
        message:
          "Our technical team will check the signal system today. We have deployed traffic police for manual control.",
      },
    ],
  },
  {
    title: "Illegal parking blocking road",
    department: "Traffic Management",
    author: "meera_v",
    status: "open",
    threads: [
      {
        author: "meera_v",
        type: "User",
        message:
          "Vehicles are illegally parked on both sides of Tilak Nagar main road making it difficult for traffic to pass.",
      },
      {
        author: "mohan_constable",
        type: "DepartmentMember",
        message:
          "We will increase patrolling in that area and issue challans to illegally parked vehicles.",
      },
    ],
  },

  // Public Health Queries
  {
    title: "Stagnant water breeding mosquitoes",
    department: "Public Health",
    author: "suresh_y",
    status: "in_progress",
    threads: [
      {
        author: "suresh_y",
        type: "User",
        message:
          "There is stagnant water in the construction site near our colony which is breeding mosquitoes and causing dengue risk.",
      },
      {
        author: "dr_ashok",
        type: "DepartmentMember",
        message:
          "We will send our fumigation team and also coordinate with municipal services to drain the stagnant water.",
      },
      {
        author: "suresh_y",
        type: "User",
        message: "Please also check other similar sites in Rau area.",
      },
      {
        author: "prakash_health",
        type: "DepartmentMember",
        message:
          "We are conducting a survey of all potential breeding sites in Rau area.",
      },
    ],
  },
  {
    title: "Medical center closed frequently",
    department: "Public Health",
    author: "anjali_d",
    status: "open",
    threads: [
      {
        author: "anjali_d",
        type: "User",
        message:
          "The primary health center in Dewas Naka area remains closed most of the time. Patients have to travel far for basic treatment.",
      },
      {
        author: "kamala_nurse",
        type: "DepartmentMember",
        message:
          "We are facing staff shortage. We are trying to arrange for regular duty schedule and additional staff.",
      },
    ],
  },

  // Education Queries
  {
    title: "School building needs repair",
    department: "Education",
    author: "manish_t",
    status: "open",
    threads: [
      {
        author: "manish_t",
        type: "User",
        message:
          "The government school in Sukhliya has damaged roof and walls. It becomes difficult during monsoon.",
      },
      {
        author: "madhuri_principal",
        type: "DepartmentMember",
        message:
          "We have submitted the repair proposal to higher authorities. Waiting for budget approval.",
      },
    ],
  },
  {
    title: "Lack of books in library",
    department: "Education",
    author: "pooja_c",
    status: "in_progress",
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "The public library in Kanadiya has very few books and most are very old. Please add new books.",
      },
      {
        author: "sanjay_coord",
        type: "DepartmentMember",
        message:
          "We have received budget for new books. We will purchase and add 500 new books next month.",
      },
    ],
  },

  // Revenue Queries
  {
    title: "Property tax calculation error",
    department: "Revenue",
    author: "deepak_m",
    status: "resolved",
    threads: [
      {
        author: "deepak_m",
        type: "User",
        message:
          "My property tax has been calculated incorrectly. The area mentioned is wrong.",
      },
      {
        author: "narayan_clerk",
        type: "DepartmentMember",
        message:
          "Please bring your property documents. We will re-verify and correct the calculation.",
      },
      {
        author: "narayan_clerk",
        type: "DepartmentMember",
        message:
          "The area measurement has been corrected and revised tax amount has been updated in system.",
      },
    ],
  },
  {
    title: "Birth certificate delay",
    department: "Revenue",
    author: "ritu_j",
    status: "open",
    threads: [
      {
        author: "ritu_j",
        type: "User",
        message:
          "I applied for my child's birth certificate 3 weeks ago but have not received it yet.",
      },
      {
        author: "shobha_revenue",
        type: "DepartmentMember",
        message:
          "Please provide your application number. We will check the status and expedite the process.",
      },
    ],
  },

  // Fire Services Queries
  {
    title: "Fire safety inspection needed",
    department: "Fire Services",
    author: "arjun_sol",
    status: "in_progress",
    threads: [
      {
        author: "arjun_sol",
        type: "User",
        message:
          "Our residential complex needs fire safety inspection for NOC. Please schedule an inspection.",
      },
      {
        author: "raghav_fire",
        type: "DepartmentMember",
        message:
          "We will schedule inspection next week. Please ensure all fire safety equipment is in place.",
      },
    ],
  },

  // Parks & Gardens Queries
  {
    title: "Park maintenance required",
    department: "Parks & Gardens",
    author: "rajesh_k",
    status: "open",
    threads: [
      {
        author: "rajesh_k",
        type: "User",
        message:
          "The children's park in Vijay Nagar needs maintenance. Swings are broken and grass is overgrown.",
      },
      {
        author: "mukesh_gardener",
        type: "DepartmentMember",
        message:
          "We will send maintenance team this week to repair equipment and trim the grass.",
      },
    ],
  },

  // Additional queries for more data
  {
    title: "Noise pollution from construction",
    department: "Municipal Services",
    author: "kavita_j",
    status: "open",
    threads: [
      {
        author: "kavita_j",
        type: "User",
        message:
          "Construction work near our house starts at 6 AM and continues till 10 PM causing noise pollution.",
      },
    ],
  },
  {
    title: "Water bill discrepancy",
    department: "Water Supply",
    author: "manish_t",
    status: "open",
    threads: [
      {
        author: "manish_t",
        type: "User",
        message:
          "My water bill shows unusual high consumption this month. Please check for leakage or meter error.",
      },
    ],
  },
  {
    title: "Speed breaker needed",
    department: "Traffic Management",
    author: "deepak_m",
    status: "open",
    threads: [
      {
        author: "deepak_m",
        type: "User",
        message:
          "Vehicles drive very fast on our residential road. We need speed breakers for safety.",
      },
    ],
  },

  // More queries for comprehensive testing
  {
    title: "Public toilet maintenance",
    department: "Municipal Services",
    author: "sunita_g",
    status: "open",
    threads: [
      {
        author: "sunita_g",
        type: "User",
        message:
          "The public toilet near MG Road market is in very poor condition and needs urgent cleaning.",
      },
    ],
  },
  {
    title: "Water contamination report",
    department: "Water Supply",
    author: "vikash_s",
    status: "in_progress",
    threads: [
      {
        author: "vikash_s",
        type: "User",
        message:
          "Several people in our area have fallen sick after drinking tap water. Please test the water quality.",
      },
      {
        author: "seema_manager",
        type: "DepartmentMember",
        message:
          "We are sending a team to collect water samples for testing immediately.",
      },
    ],
  },
  {
    title: "Traffic congestion at school hours",
    department: "Traffic Management",
    author: "pooja_c",
    status: "open",
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "Traffic becomes very congested during school pickup/drop hours near Kanadiya school.",
      },
    ],
  },
  {
    title: "Vaccination camp request",
    department: "Public Health",
    author: "ritu_j",
    status: "resolved",
    threads: [
      {
        author: "ritu_j",
        type: "User",
        message:
          "Please organize a vaccination camp in Scheme 78 area for children.",
      },
      {
        author: "dr_ashok",
        type: "DepartmentMember",
        message:
          "We will organize a vaccination camp next Saturday at the community center.",
      },
      {
        author: "ritu_j",
        type: "User",
        message: "Thank you! This will be very helpful for the community.",
      },
    ],
  },
];

// ====== Seeding Function ======
async function seedDatabase() {
  try {
    // Connect to database first
    await connectDB();

    console.log("🗑️  Dropping all collections and models...");
    await dropAllCollectionsAndModels();

    console.log("🏢 Creating departments...");
    const departments = {};
    for (const deptData of departmentsData) {
      const dept = await Department.create({
        departmentName: deptData.name,
      });
      departments[deptData.name] = dept;
    }

    console.log("👥 Creating users...");
    const users = {};
    for (const userData of usersData) {
      const user = await User.create({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        address: userData.address,
        password: userData.password, // In production, hash this
      });
      users[userData.username] = user;
    }

    console.log("👮 Creating department members...");
    const deptMembers = {};
    for (const memberData of departmentMembersData) {
      const member = await DepartmentMember.create({
        name: memberData.name,
        username: memberData.username,
        email: memberData.email,
        password: memberData.password, // In production, hash this
        department: departments[memberData.dept]._id,
      });

      deptMembers[memberData.username] = member;
      departments[memberData.dept].members.push(member._id);
    }

    // Save departments with members
    for (const dept of Object.values(departments)) {
      await dept.save();
    }

    console.log("❓ Creating queries with threads...");
    let queryCount = 0;
    for (const queryData of queriesData) {
      const author = users[queryData.author];
      const department = departments[queryData.department];

      if (!author || !department) {
        console.warn(
          `⚠️  Skipping query: ${queryData.title} - missing author or department`
        );
        continue;
      }

      // Create thread objects
      const threadObjects = [];
      if (queryData.threads && queryData.threads.length > 0) {
        for (const thread of queryData.threads) {
          let authorId;
          if (thread.type === "User") {
            authorId = users[thread.author]?._id;
          } else {
            authorId = deptMembers[thread.author]?._id;
          }

          if (authorId) {
            threadObjects.push({
              message: thread.message,
              authorType: thread.type,
              authorId: authorId,
              timestamp: new Date(
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
              ), // Random time within last week
            });
          }
        }
      }

      const query = await Query.create({
        title: queryData.title,
        author: author._id,
        department: department._id,
        status: queryData.status || "open",
        objects: threadObjects,
      });

      // Update user and department with query reference
      author.queries.push(query._id);
      department.queries.push(query._id);

      queryCount++;
    }

    // Save all users and departments
    for (const user of Object.values(users)) {
      await user.save();
    }
    for (const dept of Object.values(departments)) {
      await dept.save();
    }

    console.log("✅ Database seeded successfully!");
    console.log(`📊 Created:`);
    console.log(`   • ${Object.keys(departments).length} departments`);
    console.log(`   • ${Object.keys(users).length} users`);
    console.log(`   • ${Object.keys(deptMembers).length} department members`);
    console.log(`   • ${queryCount} queries with threads`);

    console.log("\n📧 Sample user emails for testing:");
    Object.values(users)
      .slice(0, 5)
      .forEach((user) => {
        const userData = usersData.find((u) => u.username === user.username);
        console.log(`   • ${user.email} / ${userData.password}`);
      });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
