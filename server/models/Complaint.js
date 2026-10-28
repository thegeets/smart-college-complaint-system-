import mongoose from 'mongoose';

export const ALLOWED_CATEGORIES = [
  'Computer Lab / Hardware',
  'Internet / Wi-Fi / Network',
  'Software / Programming Tools',
  'Programming Classes / Assignments',
  'IT Project / Supervision',
  'Classroom Technology / Projector',
];

export const ALLOWED_PROGRAMS = ['BSc CSIT'];

export const ALLOWED_STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

// Valid Status Transition Matrix
export const VALID_STATUS_TRANSITIONS = {
  'Submitted': ['Under Review'],
  'Under Review': ['In Progress', 'Resolved', 'Submitted'],
  'In Progress': ['Resolved', 'Under Review'],
  'Resolved': ['In Progress', 'Under Review'], // Reopening permitted if needed
};

const ResponseSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    createdBy: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const InternalNoteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    createdBy: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const TimelineEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    fromStatus: {
      type: String,
      default: null,
    },
    toStatus: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const AttachmentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storageFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
      default: null,
    },
    trackingSecretHash: {
      type: String,
      default: null,
      select: false, // Excluded from normal queries
    },
    student: {
      name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true,
        minlength: 2,
        maxlength: 120,
      },
      studentId: {
        type: String,
        required: [true, 'Student ID or roll number is required'],
        trim: true,
        maxlength: 60,
      },
      email: {
        type: String,
        required: [true, 'Student email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid student email address'],
      },
      program: {
        type: String,
        default: 'BSc CSIT',
        enum: {
          values: ALLOWED_PROGRAMS,
          message: '{VALUE} is not a supported program. Soch College of IT offers only BSc CSIT.',
        },
      },
    },
    program: {
      type: String,
      default: 'BSc CSIT',
      enum: {
        values: ALLOWED_PROGRAMS,
        message: '{VALUE} is not a supported program. Soch College of IT offers only BSc CSIT.',
      },
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      enum: {
        values: ALLOWED_CATEGORIES,
        message: '{VALUE} is not a valid IT complaint category',
      },
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: 5,
      maxlength: 150,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      minlength: 15,
      maxlength: 4000,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ALLOWED_STATUSES,
      default: 'Submitted',
      index: true,
    },
    attachment: {
      type: AttachmentSchema,
      default: null,
    },
    responses: [ResponseSchema], // Student-visible
    internalNotes: [InternalNoteSchema], // Admin-only
    timeline: [TimelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Method to sanitize complaint data for student tracking response
ComplaintSchema.methods.toStudentTrackingView = function () {
  return {
    reference: this.reference,
    category: this.category,
    title: this.title,
    description: this.description,
    status: this.status,
    priority: this.priority,
    program: this.program || this.student?.program || 'BSc CSIT',
    hasAttachment: !!this.attachment,
    submittedAt: this.createdAt,
    updatedAt: this.updatedAt,
    // Only student-visible responses
    responses: (this.responses || []).map((r) => ({
      id: r._id,
      message: r.message,
      responderName: r.createdBy?.name || 'College IT Desk',
      createdAt: r.createdAt,
    })),
    // Public timeline items only
    timeline: (this.timeline || []).map((t) => ({
      id: t._id,
      action: t.action,
      fromStatus: t.fromStatus,
      toStatus: t.toStatus,
      note: t.note,
      timestamp: t.timestamp,
    })),
  };
};

// Method for authenticated student owner view
ComplaintSchema.methods.toStudentOwnerView = function () {
  return {
    id: this._id,
    reference: this.reference,
    category: this.category,
    title: this.title,
    description: this.description,
    status: this.status,
    priority: this.priority,
    program: this.program || this.student?.program || 'BSc CSIT',
    student: {
      name: this.student?.name,
      studentId: this.student?.studentId,
      email: this.student?.email,
      program: this.student?.program || 'BSc CSIT',
    },
    hasAttachment: !!this.attachment,
    attachment: this.attachment
      ? {
          originalName: this.attachment.originalName,
          size: this.attachment.size,
          mimeType: this.attachment.mimeType,
          uploadedAt: this.attachment.uploadedAt,
        }
      : null,
    submittedAt: this.createdAt,
    updatedAt: this.updatedAt,
    responses: (this.responses || []).map((r) => ({
      id: r._id,
      message: r.message,
      responderName: r.createdBy?.name || 'College IT Desk',
      createdAt: r.createdAt,
    })),
    timeline: (this.timeline || []).map((t) => ({
      id: t._id,
      action: t.action,
      fromStatus: t.fromStatus,
      toStatus: t.toStatus,
      note: t.note,
      timestamp: t.timestamp,
    })),
  };
};

export const Complaint = mongoose.model('Complaint', ComplaintSchema);
