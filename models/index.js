// models/index.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// User Schema
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    address: { type: String },
    queries: [{ type: Schema.Types.ObjectId, ref: "Query" }],
  },
  { timestamps: true }
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
    hashedPassword: { type: String, required: true },
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
  },
  { _id: false }
);

// Query Schema
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

// Export models
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Department =
  mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
export const DepartmentMember =
  mongoose.models.DepartmentMember ||
  mongoose.model("DepartmentMember", DepartmentMemberSchema);
export const Query =
  mongoose.models.Query || mongoose.model("Query", QuerySchema);
