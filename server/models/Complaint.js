import mongoose from 'mongoose';

export const ALLOWED_CATEGORIES = [
  'Computer Lab / Hardware',
  'Internet / Wi-Fi / Network',
  'Software / Programming Tools',
  'Programming Classes / Assignments',
  'IT Project / Supervision',
  'Classroom Technology / Projector',
  'Wi-Fi & Campus Network',
  'Computer Lab & Workstations',
  'Programming Tools & OS',
  'Classroom Projectors & Tech',
  'Programming Classes & Labs',
  'IT Project & Senior Labs',
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
    filename: { type: String }, // Alias for storageFilename
    storageFilename: { type: String },
    mimeType: { type: String },
    mimetype: { type: String }, // Alias for mimeType
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Ensure filename and mimetype aliases
AttachmentSchema.pre('validate', function () {
  if (this.filename && !this.storageFilename) this.storageFilename = this.filename;
  if (this.storageFilename && !this.filename) this.filename = this.storageFilename;
  if (this.mimetype && !this.mimeType) this.mimeType = this.mimetype;
  if (this.mimeType && !this.mimetype) this.mimetype = this.mimeType;
});

const StatusHistoryEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ALLOWED_STATUSES,
    },
    note: {
      type: String,
      default: '',
    },
    by: {
      type: String,
      default: 'System',
    },
    changedBy: {
      type: String,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

StatusHistoryEntrySchema.pre('validate', function () {
  if (this.changedBy && !this.by) this.by = this.changedBy;
  if (!this.by) this.by = 'Student';
});

const ComplaintSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    student: {
      type: mongoose.Schema.Types.Mixed,
    },
    trackingSecretHash: {
      type: String,
      default: null,
      select: false, // Excluded from normal queries
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
    location: {
      type: String,
      trim: true,
      default: 'General Campus',
    },
    pcNumber: {
      type: String,
      trim: true,
      default: '',
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
    slaDueAt: {
      type: Date,
      index: true,
    },
    attachment: {
      type: AttachmentSchema,
      default: null,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    statusHistory: [StatusHistoryEntrySchema],
    responses: [ResponseSchema], // Student-visible
    internalNotes: [InternalNoteSchema], // Admin-only
    timeline: [TimelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Compound Indexes
ComplaintSchema.index({ student: 1, status: 1 });
ComplaintSchema.index({ studentId: 1, status: 1 });

// Pre-validate hook to synchronize referenceId/reference, student/studentId, slaDueAt, attachments, and statusHistory
ComplaintSchema.pre('validate', function () {
  if (this.referenceId && !this.reference) {
    this.reference = this.referenceId;
  } else if (this.reference && !this.referenceId) {
    this.referenceId = this.reference;
  }

  // Synchronize student and studentId
  if (this.student && mongoose.isValidObjectId(this.student) && !this.studentId) {
    this.studentId = this.student;
  } else if (this.studentId && !this.student) {
    this.student = this.studentId;
  }

  // Calculate slaDueAt if not set (24h for Urgent/High, 48h otherwise)
  if (!this.slaDueAt) {
    const isUrgent = this.priority === 'Urgent' || this.priority === 'High';
    const hours = isUrgent ? 24 : 48;
    this.slaDueAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  // Synchronize attachments array and legacy single attachment
  if (this.attachments && this.attachments.length > 0 && !this.attachment) {
    this.attachment = this.attachments[0];
  } else if (this.attachment && (!this.attachments || this.attachments.length === 0)) {
    this.attachments = [this.attachment];
  }

  // Synchronize statusHistory array and legacy timeline
  if (!this.statusHistory || this.statusHistory.length === 0) {
    const by = typeof this.student === 'object' && this.student?.name ? this.student.name : 'Student';
    this.statusHistory = [
      {
        status: this.status || 'Submitted',
        note: 'Complaint submitted',
        by,
        at: this.createdAt || new Date(),
      },
    ];
  }

  if (!this.timeline || this.timeline.length === 0) {
    const by = typeof this.student === 'object' && this.student?.name ? this.student.name : 'Student';
    this.timeline = [
      {
        action: 'Complaint Submitted',
        fromStatus: null,
        toStatus: this.status || 'Submitted',
        note: 'Complaint registered by student',
        performedBy: by,
        timestamp: this.createdAt || new Date(),
      },
    ];
  }
});

// Indexes
ComplaintSchema.index({ student: 1, status: 1 });
ComplaintSchema.index({ studentId: 1, status: 1 });
ComplaintSchema.index({ referenceId: 1 });
ComplaintSchema.index({ reference: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ slaDueAt: 1 });

// Pre-validate hook to synchronize referenceId/reference, student/studentId, slaDueAt, attachments, and statusHistory
ComplaintSchema.pre('validate', function () {
  if (this.referenceId && !this.reference) {
    this.reference = this.referenceId;
  } else if (this.reference && !this.referenceId) {
    this.referenceId = this.reference;
  }

  // Synchronize student and studentId
  if (this.student && mongoose.isValidObjectId(this.student) && !this.studentId) {
    this.studentId = this.student;
  } else if (this.studentId && !this.student) {
    this.student = this.studentId;
  }

  // Calculate slaDueAt if not set (24h for Urgent/High, 48h otherwise)
  if (!this.slaDueAt) {
    const isUrgent = this.priority === 'Urgent' || this.priority === 'High';
    const hours = isUrgent ? 24 : 48;
    this.slaDueAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  // Synchronize attachments array and legacy single attachment
  if (this.attachments && this.attachments.length > 0 && !this.attachment) {
    this.attachment = this.attachments[0];
  } else if (this.attachment && (!this.attachments || this.attachments.length === 0)) {
    this.attachments = [this.attachment];
  }

  // Synchronize statusHistory array and legacy timeline
  if (!this.statusHistory || this.statusHistory.length === 0) {
    const by = typeof this.student === 'object' && this.student?.name ? this.student.name : 'Student';
    this.statusHistory = [
      {
        status: this.status || 'Submitted',
        note: 'Complaint submitted',
        by,
        at: this.createdAt || new Date(),
      },
    ];
  }

  if (!this.timeline || this.timeline.length === 0) {
    const by = typeof this.student === 'object' && this.student?.name ? this.student.name : 'Student';
    this.timeline = [
      {
        action: 'Complaint Submitted',
        fromStatus: null,
        toStatus: this.status || 'Submitted',
        note: 'Complaint registered by student',
        performedBy: by,
        timestamp: this.createdAt || new Date(),
      },
    ];
  }
});

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
  const ref = this.referenceId || this.reference;
  return {
    id: this._id,
    referenceId: ref,
    reference: ref,
    category: this.category,
    title: this.title,
    description: this.description,
    location: this.location || '',
    pcNumber: this.pcNumber || '',
    status: this.status,
    priority: this.priority,
    slaDueAt: this.slaDueAt,
    program: this.program || this.student?.program || 'BSc CSIT',
    student: {
      name: this.student?.name,
      studentId: this.student?.studentId,
      email: this.student?.email,
      program: this.student?.program || 'BSc CSIT',
    },
    hasAttachment: Boolean(this.attachment || (this.attachments && this.attachments.length > 0)),
    attachment: this.attachment
      ? {
        originalName: this.attachment.originalName,
        filename: this.attachment.storageFilename || this.attachment.filename,
        size: this.attachment.size,
        mimeType: this.attachment.mimeType || this.attachment.mimetype,
        uploadedAt: this.attachment.uploadedAt,
      }
      : null,
    attachments: (this.attachments && this.attachments.length > 0
      ? this.attachments
      : this.attachment ? [this.attachment] : []
    ).map((att) => ({
      originalName: att.originalName,
      filename: att.storageFilename || att.filename,
      size: att.size,
      mimeType: att.mimeType || att.mimetype,
      uploadedAt: att.uploadedAt,
    })),
    statusHistory: (this.statusHistory && this.statusHistory.length > 0
      ? this.statusHistory
      : []
    ).map((sh) => ({
      status: sh.status,
      note: sh.note,
      by: sh.by,
      at: sh.at,
    })),
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
