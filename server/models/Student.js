import mongoose from 'mongoose';

export const ALLOWED_SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    studentId: {
      type: String,
      required: [true, 'Student ID or roll number is required'],
      trim: true,
      maxlength: [60, 'Student ID cannot exceed 60 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Excluded from default queries
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: {
        values: ALLOWED_SEMESTERS,
        message: '{VALUE} is not a valid semester',
      },
      default: '1st Semester',
    },
    program: {
      type: String,
      default: 'BSc CSIT',
      immutable: true, // Soch College of IT exclusively offers BSc CSIT
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
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

StudentSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    studentId: this.studentId,
    email: this.email,
    semester: this.semester,
    program: this.program,
    avatar: this.avatar,
    phone: this.phone,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

export const Student = mongoose.model('Student', StudentSchema);
