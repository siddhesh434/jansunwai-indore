// models/index.js - Fixed with Query cache clearing
import mongoose from "mongoose";

const { Schema } = mongoose;

// SuperAdmin Schema
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

// User Schema
const UserSchema = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: function() {
        return this.authMethod === 'local';
      }
    },
    address: { 
      type: String,
      default: ""
    },
    queries: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Query" 
    }],
    can_see: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Query" 
    }],
    // Google OAuth fields
    googleId: { 
      type: String, 
      sparse: true, 
      unique: true 
    },
    profilePicture: { 
      type: String 
    },
    authMethod: { 
      type: String, 
      enum: ['local', 'google'], 
      default: 'local' 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Department Schema
const DepartmentSchema = new Schema(
  {
    departmentName: { type: String, required: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: "DepartmentMember" }],
    queries: [{ type: Schema.Types.ObjectId, ref: "Query" }],
  },
  { timestamps: true }
);

// Department Member Schema
const DepartmentMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

// Thread Object Schema
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
    attachments: [
      new Schema(
        {
          filename: { type: String, required: true },
          originalName: { type: String, required: true },
          mimetype: { type: String, required: true },
          size: { type: Number, required: true },
          url: { type: String, required: true },
        },
        { _id: false }
      ),
    ],
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

// Query Schema
const QuerySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    latitude: { type: Number }, // Add latitude field
    longitude: { type: Number }, // Add longitude field
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
    feedback: FeedbackSchema,  // This should be defined as a subdocument
    attachments: [
      new Schema(
        {
          filename: { type: String, required: true },
          originalName: { type: String, required: true },
          mimetype: { type: String, required: true },
          size: { type: Number, required: true },
          url: { type: String, required: true },
        },
        { _id: false }
      ),
    ],
    attachmentAnalyses: [
      new Schema(
        {
          filename: { type: String },
          originalName: { type: String },
          mimetype: { type: String },
          description: { type: String },
          summary: { type: String },
          metadata: { type: Schema.Types.Mixed },
        },
        { _id: false }
      ),
    ],
    urgencyScore: { type: Number, min: 1, max: 5 },
    urgencyLabel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    urgencyReason: { type: String },
    impressions: { 
      type: Number, 
      default: 1 
    },
  },
  { timestamps: true }
);

// Clear existing models to avoid caching issues
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// ADD THIS: Clear Query model cache too
if (mongoose.models.Query) {
  delete mongoose.models.Query;
}

// Export models
export const SuperAdmin =
  mongoose.models.SuperAdmin || mongoose.model("SuperAdmin", SuperAdminSchema);
export const User = mongoose.model("User", UserSchema);
export const Department =
  mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
export const DepartmentMember =
  mongoose.models.DepartmentMember ||
  mongoose.model("DepartmentMember", DepartmentMemberSchema);
export const Query = mongoose.model("Query", QuerySchema);