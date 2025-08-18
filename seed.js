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

const SuperAdminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "superadmin" },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

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
    description: { type: String },
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

// Feedback Schema
const FeedbackSchema = new Schema(
  {
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    description: { 
      type: String, 
      required: true,
      maxlength: 500 
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { _id: false }
);

const QuerySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
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
    feedback: FeedbackSchema,
    urgencyScore: { type: Number, default: 0 },
    urgencyLabel: { type: String },
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
const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);
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
    name: "Sewage",
    description: "Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints",
  },
  {
    name: "Compost with dried leaves",
    description: "Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing",
  },
  {
    name: "Water Supply",
    description: "Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers",
  },
  {
    name: "Electricity",
    description: "Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs",
  },
  {
    name: "Engineering",
    description: "Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals",
  },
  {
    name: "Revenue",
    description: "Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents",
  },
  {
    name: "Fire Brigade",
    description: "Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC",
  },
  {
    name: "Finance",
    description: "Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency",
  },
  {
    name: "Garden",
    description: "Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation",
  },
  {
    name: "Miscellaneous Complaints",
    description: "General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling",
  },
  {
    name: "Parking",
    description: "Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations",
  },
  {
    name: "Building Allowance",
    description: "Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight",
  },
  {
    name: "Lake Protection",
    description: "Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration",
  },
  {
    name: "Social Security",
    description: "Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services",
  },
  {
    name: "Govardhan Project",
    description: "Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination",
  },
  {
    name: "BRTS and BCL",
    description: "Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination",
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
  // Sewage
  {
    name: "Inspector Ramesh",
    username: "ramesh_inspector",
    email: "ramesh@sewage.gov.in",
    dept: "Sewage",
    password: "ramesh123",
  },
  {
    name: "Supervisor Lakshmi",
    username: "lakshmi_supervisor",
    email: "lakshmi@sewage.gov.in",
    dept: "Sewage",
    password: "lakshmi123",
  },
  {
    name: "Officer Vinod",
    username: "vinod_officer",
    email: "vinod@sewage.gov.in",
    dept: "Sewage",
    password: "vinod123",
  },

  // Compost with dried leaves
  {
    name: "Manager Priya",
    username: "priya_manager",
    email: "priya@compost.gov.in",
    dept: "Compost with dried leaves",
    password: "priya123",
  },
  {
    name: "Technician Rajesh",
    username: "rajesh_tech",
    email: "rajesh@compost.gov.in",
    dept: "Compost with dried leaves",
    password: "rajesh123",
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

  // Electricity
  {
    name: "Engineer Amit",
    username: "amit_electrical",
    email: "amit@electricity.gov.in",
    dept: "Electricity",
    password: "amit123",
  },
  {
    name: "Technician Suresh",
    username: "suresh_tech",
    email: "suresh@electricity.gov.in",
    dept: "Electricity",
    password: "suresh123",
  },

  // Engineering
  {
    name: "Chief Engineer Kumar",
    username: "kumar_chief",
    email: "kumar@engineering.gov.in",
    dept: "Engineering",
    password: "kumar123",
  },
  {
    name: "Project Manager Neha",
    username: "neha_project",
    email: "neha@engineering.gov.in",
    dept: "Engineering",
    password: "neha123",
  },

  // Revenue
  {
    name: "Revenue Officer Singh",
    username: "singh_revenue",
    email: "singh@revenue.gov.in",
    dept: "Revenue",
    password: "singh123",
  },
  {
    name: "Tax Inspector Gupta",
    username: "gupta_tax",
    email: "gupta@revenue.gov.in",
    dept: "Revenue",
    password: "gupta123",
  },

  // Fire Brigade
  {
    name: "Fire Chief Sharma",
    username: "sharma_fire",
    email: "sharma@fire.gov.in",
    dept: "Fire Brigade",
    password: "sharma123",
  },
  {
    name: "Firefighter Verma",
    username: "verma_fire",
    email: "verma@fire.gov.in",
    dept: "Fire Brigade",
    password: "verma123",
  },

  // Finance
  {
    name: "Finance Manager Joshi",
    username: "joshi_finance",
    email: "joshi@finance.gov.in",
    dept: "Finance",
    password: "joshi123",
  },
  {
    name: "Accountant Patel",
    username: "patel_accountant",
    email: "patel@finance.gov.in",
    dept: "Finance",
    password: "patel123",
  },

  // Garden
  {
    name: "Horticulturist Malviya",
    username: "malviya_horticulture",
    email: "malviya@garden.gov.in",
    dept: "Garden",
    password: "malviya123",
  },
  {
    name: "Garden Supervisor Solanki",
    username: "solanki_garden",
    email: "solanki@garden.gov.in",
    dept: "Garden",
    password: "solanki123",
  },

  // Miscellaneous Complaints
  {
    name: "General Officer Tiwari",
    username: "tiwari_general",
    email: "tiwari@misc.gov.in",
    dept: "Miscellaneous Complaints",
    password: "tiwari123",
  },

  // Parking
  {
    name: "Parking Inspector Yadav",
    username: "yadav_parking",
    email: "yadav@parking.gov.in",
    dept: "Parking",
    password: "yadav123",
  },

  // Building Allowance
  {
    name: "Building Inspector Chauhan",
    username: "chauhan_building",
    email: "chauhan@building.gov.in",
    dept: "Building Allowance",
    password: "chauhan123",
  },

  // Lake Protection
  {
    name: "Environmental Officer Saxena",
    username: "saxena_environment",
    email: "saxena@lake.gov.in",
    dept: "Lake Protection",
    password: "saxena123",
  },

  // Social Security
  {
    name: "Welfare Officer Dubey",
    username: "dubey_welfare",
    email: "dubey@social.gov.in",
    dept: "Social Security",
    password: "dubey123",
  },

  // Govardhan Project
  {
    name: "Project Director Mishra",
    username: "mishra_project",
    email: "mishra@govardhan.gov.in",
    dept: "Govardhan Project",
    password: "mishra123",
  },

  // BRTS and BCL
  {
    name: "Transport Manager Trivedi",
    username: "trivedi_transport",
    email: "trivedi@brts.gov.in",
    dept: "BRTS and BCL",
    password: "trivedi123",
  },
];

const queriesData = [
  // Sewage Queries
  {
    title: "Sewage overflow in street",
    department: "Sewage",
    author: "rajesh_k",
    status: "in_progress",
    urgencyScore: 5,
    urgencyLabel: "High",
    createdAt: "2025-08-05T09:42:15.000Z",
    address: "Vijay Nagar, Indore, Madhya Pradesh",
    latitude: 22.7196,
    longitude: 75.8577,
    threads: [
      {
        author: "rajesh_k",
        type: "User",
        message:
          "There is sewage overflow in our street (Vijay Nagar) for the past 3 days. The smell is unbearable.",
      },
      {
        author: "ramesh_inspector",
        type: "DepartmentMember",
        message:
          "We apologize for the inconvenience. Our team will visit today to fix the clogged sewer line.",
      },
      {
        author: "rajesh_k",
        type: "User",
        message: "When can we expect this to be resolved?",
      },
      {
        author: "ramesh_inspector",
        type: "DepartmentMember",
        message:
          "We will complete the repair by evening today. We will also clean the area thoroughly.",
      },
    ],
  },
  {
    title: "Clogged drainage system",
    department: "Sewage",
    author: "priya_s",
    status: "resolved",
    urgencyScore: 4,
    urgencyLabel: "High",
    createdAt: "2025-08-03T14:27:49.000Z",
    address: "Palasia Square, Indore, Madhya Pradesh",
    latitude: 22.7248,
    longitude: 75.8839,
    feedback: {
      rating: 5,
      description: "Excellent service! The drainage was cleared quickly and the area is now clean. Very satisfied with the response time and quality of work.",
      submittedAt: "2025-08-04T10:30:00.000Z"
    },
    threads: [
      {
        author: "priya_s",
        type: "User",
        message:
          "The drainage system near Palasia Square is completely clogged and water is accumulating.",
      },
      {
        author: "vinod_officer",
        type: "DepartmentMember",
        message:
          "Thank you for reporting. We have cleared the blockage and the drainage is working properly now.",
      },
    ],
  },

  // Compost with dried leaves Queries
  {
    title: "Composting facility needed",
    department: "Compost with dried leaves",
    author: "amit_p",
    status: "open",
    urgencyScore: 2,
    urgencyLabel: "Low",
    createdAt: "2025-07-29T11:18:37.000Z",
    address: "New Palasia, Indore, Madhya Pradesh",
    latitude: 22.7265,
    longitude: 75.8832,
    threads: [
      {
        author: "amit_p",
        type: "User",
        message:
          "We need a composting facility in our area (New Palasia) to handle organic waste and dried leaves.",
      },
    ],
  },

  // Water Supply Queries
  {
    title: "No water supply for 3 days",
    department: "Water Supply",
    author: "sunita_g",
    status: "in_progress",
    urgencyScore: 5,
    urgencyLabel: "High",
    createdAt: "2025-08-07T07:54:03.000Z",
    address: "MG Road, Indore, Madhya Pradesh",
    latitude: 22.7231,
    longitude: 75.8836,
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
          "We are aware of the issue. There was a major pipeline break. We are working to restore supply by tomorrow.",
      },
    ],
  },
  {
    title: "Low water pressure",
    department: "Water Supply",
    author: "vikash_s",
    status: "resolved",
    urgencyScore: 3,
    urgencyLabel: "Medium",
    createdAt: "2025-08-01T16:43:21.000Z",
    address: "AB Road, Indore, Madhya Pradesh",
    latitude: 22.7176,
    longitude: 75.8572,
    feedback: {
      rating: 4,
      description: "Good response time. Water pressure is now normal. Would have given 5 stars if they had informed us about the maintenance schedule beforehand.",
      submittedAt: "2025-08-02T14:20:00.000Z"
    },
    threads: [
      {
        author: "vikash_s",
        type: "User",
        message:
          "Water pressure is very low in our building (AB Road). Can't even fill a bucket properly.",
      },
      {
        author: "seema_manager",
        type: "DepartmentMember",
        message:
          "We have increased the pressure for your area. Please check now and let us know if it's better.",
      },
    ],
  },

  // Electricity Queries
  {
    title: "Power outage in sector",
    department: "Electricity",
    author: "kavita_j",
    status: "open",
    urgencyScore: 5,
    urgencyLabel: "High",
    createdAt: "2025-08-06T22:11:57.000Z",
    address: "Bhawarkua, Indore, Madhya Pradesh",
    latitude: 22.7315,
    longitude: 75.8867,
    threads: [
      {
        author: "kavita_j",
        type: "User",
        message:
          "Our entire sector (Bhawarkua) has been without electricity for 6 hours. Please restore power.",
      },
    ],
  },

  // Engineering Queries
  {
    title: "Road construction needed",
    department: "Engineering",
    author: "rohit_a",
    status: "open",
    urgencyScore: 4,
    urgencyLabel: "High",
    createdAt: "2025-07-28T10:05:11.000Z",
    address: "Sapna Sangeeta, Indore, Madhya Pradesh",
    latitude: 22.7358,
    longitude: 75.8892,
    threads: [
      {
        author: "rohit_a",
        type: "User",
        message:
          "The road in Sapna Sangeeta area is in very bad condition. Needs immediate repair and construction.",
      },
    ],
  },

  // Revenue Queries
  {
    title: "Property tax assessment issue",
    department: "Revenue",
    author: "meera_v",
    status: "in_progress",
    urgencyScore: 3,
    urgencyLabel: "Medium",
    createdAt: "2025-08-04T13:36:44.000Z",
    address: "Tilak Nagar, Indore, Madhya Pradesh",
    latitude: 22.7289,
    longitude: 75.8801,
    threads: [
      {
        author: "meera_v",
        type: "User",
        message:
          "My property tax assessment seems incorrect. The amount is much higher than expected.",
      },
      {
        author: "singh_revenue",
        type: "DepartmentMember",
        message:
          "We will review your property details and tax assessment. Please provide your property documents.",
      },
    ],
  },

  // Fire Brigade Queries
  {
    title: "Fire safety inspection needed",
    department: "Fire Brigade",
    author: "deepak_m",
    status: "open",
    urgencyScore: 4,
    urgencyLabel: "High",
    createdAt: "2025-08-02T08:21:19.000Z",
    address: "Scheme 54, Indore, Madhya Pradesh",
    latitude: 22.7412,
    longitude: 75.8934,
    threads: [
      {
        author: "deepak_m",
        type: "User",
        message:
          "Our commercial building needs fire safety inspection and certification. Please schedule a visit.",
      },
    ],
  },

  // Finance Queries
  {
    title: "Budget allocation query",
    department: "Finance",
    author: "ritu_j",
    status: "open",
    urgencyScore: 2,
    urgencyLabel: "Low",
    createdAt: "2025-07-30T15:09:42.000Z",
    address: "Scheme 78, Indore, Madhya Pradesh",
    latitude: 22.7445,
    longitude: 75.8967,
    threads: [
      {
        author: "ritu_j",
        type: "User",
        message:
          "I need information about budget allocation for public infrastructure projects in our area.",
      },
    ],
  },

  // Garden Queries
  {
    title: "Park maintenance needed",
    department: "Garden",
    author: "arjun_sol",
    status: "resolved",
    urgencyScore: 2,
    urgencyLabel: "Low",
    createdAt: "2025-08-01T19:25:33.000Z",
    address: "LIG Colony, Indore, Madhya Pradesh",
    latitude: 22.7389,
    longitude: 75.8901,
    feedback: {
      rating: 5,
      description: "Outstanding work! The park looks beautiful now. All equipment is working perfectly and the grass is well-maintained. Children are very happy with the improvements.",
      submittedAt: "2025-08-02T16:45:00.000Z"
    },
    threads: [
      {
        author: "arjun_sol",
        type: "User",
        message:
          "The children's park in LIG Colony needs maintenance. Equipment is broken and grass needs cutting.",
      },
      {
        author: "malviya_horticulture",
        type: "DepartmentMember",
        message:
          "We have completed the maintenance. All equipment is repaired and the park is clean now.",
      },
    ],
  },

  // Miscellaneous Complaints Queries
  {
    title: "General complaint about noise",
    department: "Miscellaneous Complaints",
    author: "pooja_c",
    status: "open",
    urgencyScore: 3,
    urgencyLabel: "Medium",
    createdAt: "2025-08-05T06:57:09.000Z",
    address: "Kanadiya, Indore, Madhya Pradesh",
    latitude: 22.7321,
    longitude: 75.8876,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "There is excessive noise from construction work near our residential area. Please help.",
      },
    ],
  },

  // Parking Queries
  {
    title: "Illegal parking issue",
    department: "Parking",
    author: "pooja_c",
    status: "open",
    urgencyScore: 3,
    urgencyLabel: "Medium",
    createdAt: "2025-08-04T12:14:26.000Z",
    address: "Dewas Naka, Indore, Madhya Pradesh",
    latitude: 22.7215,
    longitude: 75.8845,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "Vehicles are parked illegally on the main road causing traffic congestion. Please take action.",
      },
    ],
  },

  // Building Allowance Queries
  {
    title: "Building permit application",
    department: "Building Allowance",
    author: "pooja_c",
    status: "in_progress",
    urgencyScore: 2,
    urgencyLabel: "Low",
    createdAt: "2025-08-06T09:48:51.000Z",
    address: "Sukhliya, Indore, Madhya Pradesh",
    latitude: 22.7298,
    longitude: 75.8812,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "I have submitted my building permit application 2 weeks ago. Please update on the status.",
      },
      {
        author: "chauhan_building",
        type: "DepartmentMember",
        message:
          "Your application is under review. We will complete the inspection by next week.",
      },
    ],
  },

  // Lake Protection Queries
  {
    title: "Lake pollution concern",
    department: "Lake Protection",
    author: "pooja_c",
    status: "open",
    urgencyScore: 4,
    urgencyLabel: "High",
    createdAt: "2025-08-03T17:31:05.000Z",
    address: "Rau, Indore, Madhya Pradesh",
    latitude: 22.7156,
    longitude: 75.8589,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "The lake near our area is getting polluted with garbage and sewage. Please take action.",
      },
    ],
  },

  // Social Security Queries
  {
    title: "Welfare scheme application",
    department: "Social Security",
    author: "pooja_c",
    status: "open",
    urgencyScore: 2,
    urgencyLabel: "Low",
    createdAt: "2025-07-31T21:16:58.000Z",
    address: "Rajendra Nagar, Indore, Madhya Pradesh",
    latitude: 22.7334,
    longitude: 75.8889,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "I want to apply for the elderly welfare scheme. Please guide me through the process.",
      },
    ],
  },

  // Govardhan Project Queries
  {
    title: "Project update request",
    department: "Govardhan Project",
    author: "pooja_c",
    status: "open",
    urgencyScore: 1,
    urgencyLabel: "Low",
    createdAt: "2025-08-02T07:44:22.000Z",
    address: "Vijay Nagar Extension, Indore, Madhya Pradesh",
    latitude: 22.7201,
    longitude: 75.8589,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "Can you provide an update on the Govardhan project development in our area?",
      },
    ],
  },

  // BRTS and BCL Queries
  {
    title: "BRTS service complaint",
    department: "BRTS and BCL",
    author: "pooja_c",
    status: "open",
    urgencyScore: 3,
    urgencyLabel: "Medium",
    createdAt: "2025-08-06T18:02:40.000Z",
    address: "Rajendra Nagar BRTS Stop, Indore, Madhya Pradesh",
    latitude: 22.7345,
    longitude: 75.8895,
    threads: [
      {
        author: "pooja_c",
        type: "User",
        message:
          "BRTS buses are not running on schedule. Many buses are delayed or cancelled.",
      },
    ],
  },
  
  // Additional resolved queries with feedback
  {
    title: "Street light repair completed",
    department: "Electricity",
    author: "manish_t",
    status: "resolved",
    urgencyScore: 3,
    urgencyLabel: "Medium",
    createdAt: "2025-07-25T20:15:30.000Z",
    address: "Sukhlia, Indore, Madhya Pradesh",
    latitude: 22.7298,
    longitude: 75.8812,
    feedback: {
      rating: 4,
      description: "Good work! Street lights are working properly now. The area is much safer at night. Thank you for the quick response.",
      submittedAt: "2025-07-26T18:30:00.000Z"
    },
    threads: [
      {
        author: "manish_t",
        type: "User",
        message: "Street lights in our area are not working for the past week. Please repair them.",
      },
      {
        author: "amit_electrical",
        type: "DepartmentMember",
        message: "We have identified the issue and will repair the street lights by tomorrow evening.",
      },
      {
        author: "manish_t",
        type: "User",
        message: "Thank you for the quick response!",
      },
    ],
  },
  
  {
    title: "Garbage collection improved",
    department: "Miscellaneous Complaints",
    author: "suresh_y",
    status: "resolved",
    urgencyScore: 2,
    urgencyLabel: "Low",
    createdAt: "2025-07-20T09:45:15.000Z",
    address: "Rau, Indore, Madhya Pradesh",
    latitude: 22.7156,
    longitude: 75.8589,
    feedback: {
      rating: 5,
      description: "Excellent improvement! Garbage collection is now regular and timely. The area is much cleaner. Very satisfied with the service.",
      submittedAt: "2025-07-22T14:20:00.000Z"
    },
    threads: [
      {
        author: "suresh_y",
        type: "User",
        message: "Garbage collection in our area is irregular. Sometimes garbage remains for 3-4 days.",
      },
      {
        author: "tiwari_general",
        type: "DepartmentMember",
        message: "We have increased the frequency of garbage collection in your area. It will be collected daily now.",
      },
    ],
  },
  
  {
    title: "Traffic signal installation",
    department: "Engineering",
    author: "anjali_d",
    status: "resolved",
    urgencyScore: 4,
    urgencyLabel: "High",
    createdAt: "2025-07-15T11:30:45.000Z",
    address: "Dewas Naka, Indore, Madhya Pradesh",
    latitude: 22.7215,
    longitude: 75.8845,
    feedback: {
      rating: 5,
      description: "Perfect! The traffic signal is working well and has significantly reduced traffic congestion. Great job by the engineering team!",
      submittedAt: "2025-07-18T16:45:00.000Z"
    },
    threads: [
      {
        author: "anjali_d",
        type: "User",
        message: "We need a traffic signal at the main intersection in Dewas Naka. There's heavy traffic and accidents happen frequently.",
      },
      {
        author: "kumar_chief",
        type: "DepartmentMember",
        message: "We have approved the traffic signal installation. Work will start next week and complete within 15 days.",
      },
      {
        author: "anjali_d",
        type: "User",
        message: "That's great news! Thank you for considering our request.",
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
        description: deptData.description,
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

    console.log("👑 Creating superadmin...");
    const superadmin = await SuperAdmin.create({
      username: "admin",
      name: "Super Administrator",
      email: "admin@jansunwai.gov.in",
      password: "admin123", // In production, hash this
      role: "superadmin",
      permissions: ["all"],
    });

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
        description: queryData.threads && queryData.threads.length > 0 ? queryData.threads[0].message : "",
        address: queryData.address || "",
        latitude: queryData.latitude || null,
        longitude: queryData.longitude || null,
        author: author._id,
        department: department._id,
        status: queryData.status || "open",
        objects: threadObjects,
        feedback: queryData.feedback || null,
        urgencyScore: queryData.urgencyScore,
        urgencyLabel: queryData.urgencyLabel,
        createdAt: new Date(queryData.createdAt),
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
    console.log(`   • 1 superadmin`);

    console.log("\n📧 Sample user emails for testing:");
    Object.values(users)
      .slice(0, 5)
      .forEach((user) => {
        const userData = usersData.find((u) => u.username === user.username);
        console.log(`   • ${user.email} / ${userData.password}`);
      });

    console.log("\n👑 Superadmin credentials:");
    console.log(`   • ${superadmin.email} / ${superadmin.password}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();

