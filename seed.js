require('dotenv').config();
const mongoose = require('mongoose');

// ====== DB Connection ======
const MONGO_URI = process.env.MONGOURL;

if (!MONGO_URI) {
  console.error('❌ MONGOURL not found in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });

// ====== Define Schemas ======
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  address: { type: String },
  queries: [{ type: Schema.Types.ObjectId, ref: 'Query' }]
}, { timestamps: true });

const DepartmentSchema = new Schema({
  departmentName: { type: String, required: true, unique: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'DepartmentMember' }],
  queries: [{ type: Schema.Types.ObjectId, ref: 'Query' }]
}, { timestamps: true });

const DepartmentMemberSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

const ThreadObjectSchema = new Schema({
  message: { type: String, required: true },
  authorType: { type: String, enum: ['User', 'DepartmentMember'], required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, refPath: 'objects.authorType' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const QuerySchema = new Schema({
  title: { type: String, required: true },
  objects: [ThreadObjectSchema],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' }
}, { timestamps: true });

// ====== Create Models ======
const User = mongoose.model('User', UserSchema);
const Department = mongoose.model('Department', DepartmentSchema);
const DepartmentMember = mongoose.model('DepartmentMember', DepartmentMemberSchema);
const Query = mongoose.model('Query', QuerySchema);

// ====== Insert Dummy Data ======
async function seedDatabase() {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await DepartmentMember.deleteMany({});
    await Query.deleteMany({});

    const dept = await Department.create({ departmentName: 'Municipal Services' });

    const deptMember = await DepartmentMember.create({
      name: 'Inspector Arjun',
      username: 'arjun_inspector',
      hashedPassword: 'hashed_arjun_123',
      department: dept._id
    });

    dept.members.push(deptMember._id);
    await dept.save();

    const user = await User.create({
      name: 'Neha Verma',
      username: 'neha_v',
      hashedPassword: 'hashed_neha_123',
      address: 'Sector 11, Indore'
    });

    const query = await Query.create({
      title: 'Garbage collection not happening',
      author: user._id,
      department: dept._id,
      status: 'open',
      objects: [
        {
          message: 'Garbage truck has not come for 5 days.',
          authorType: 'User',
          authorId: user._id
        },
        {
          message: 'We will send a team tomorrow.',
          authorType: 'DepartmentMember',
          authorId: deptMember._id
        }
      ]
    });

    user.queries.push(query._id);
    dept.queries.push(query._id);
    await user.save();
    await dept.save();

    console.log('✅ Dummy data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inserting data:', err);
    process.exit(1);
  }
}

seedDatabase();
