import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Do not return by default in queries
    },
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      maxlength: 120,
    },
    title: {
      type: String,
      trim: true,
      default: 'IT Grievance Coordinator',
      maxlength: 120,
    },
    department: {
      type: String,
      trim: true,
      default: 'Central Grievance Redressal Cell',
      maxlength: 120,
    },
    role: {
      type: String,
      default: 'Admin',
      immutable: true, // Only Admin in this phase per requirements
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    title: this.title,
    department: this.department,
    role: this.role,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Admin = mongoose.model('Admin', AdminSchema);
