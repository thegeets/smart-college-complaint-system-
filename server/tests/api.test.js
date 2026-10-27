import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Complaint } from '../models/Complaint.js';
import { hashPassword } from '../utils/crypto.js';

test('Smart College Complaint System API Integration Tests', async (t) => {
  let app;
  let testAdmin;
  let adminSessionCookie;
  let csrfToken;
  let createdComplaintRef;
  let createdTrackingSecret;
  let complaintId;

  const TEST_ADMIN = {
    name: 'Er. Pradeep Karki',
    email: 'testadmin@sochcollege.edu.np',
    password: 'SecureAdminPass123!',
  };

  t.before(async () => {
    await connectDB();
    app = createApp();

    // Clean up previous test artifacts
    await Admin.deleteMany({ email: TEST_ADMIN.email });
    await Complaint.deleteMany({ 'student.email': 'teststudent@sochcollege.edu.np' });

    // Seed test admin
    const passwordHash = await hashPassword(TEST_ADMIN.password);
    testAdmin = new Admin({
      name: TEST_ADMIN.name,
      email: TEST_ADMIN.email,
      passwordHash,
      role: 'Admin',
      isActive: true,
    });
    await testAdmin.save();
  });

  t.after(async () => {
    // Cleanup test data
    await Admin.deleteMany({ email: TEST_ADMIN.email });
    await Complaint.deleteMany({ 'student.email': 'teststudent@sochcollege.edu.np' });
    await disconnectDB();
  });

  // 1. Health check
  await t.test('GET /api/v1/health returns healthy operational status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.institution, 'Soch College of IT, Pokhara');
    assert.equal(res.body.database, 'connected');
  });

  // 2. Public Complaint Submission: Validation
  await t.test('POST /api/v1/complaints rejects invalid or missing fields, and rejects non-CSIT programs', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .send({
        studentName: 'A', // too short
        email: 'invalid-email',
        category: 'Non-Existent Category',
        program: 'BIT', // Unsupported program (only BSc CSIT is offered)
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    assert.ok(res.body.errors.studentName);
    assert.ok(res.body.errors.email);
    assert.ok(res.body.errors.category);
    assert.ok(res.body.errors.program);
    assert.match(res.body.errors.program, /offers only BSc CSIT/i);
  });

  // 3. Public Complaint Submission: Successful
  await t.test('POST /api/v1/complaints successfully saves valid complaint with BSc CSIT program and returns secret once', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .field('studentName', 'Kiran Shrestha')
      .field('studentId', 'SOCH-CSIT-2024-012')
      .field('email', 'teststudent@sochcollege.edu.np')
      .field('category', 'Computer Lab / Hardware')
      .field('title', 'Workstation 14 Keyboard Key Fault')
      .field('description', 'The mechanical enter key on Lab 2 PC 14 is non-responsive during C++ practicals.')
      .field('priority', 'Medium')
      .field('program', 'BSc CSIT');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.reference.startsWith('CMP-'));
    assert.ok(res.body.trackingSecret.startsWith('trk_'));

    createdComplaintRef = res.body.reference;
    createdTrackingSecret = res.body.trackingSecret;

    // Verify database record
    const saved = await Complaint.findOne({ reference: createdComplaintRef }).select('+trackingSecretHash');
    assert.ok(saved);
    complaintId = saved._id.toString();
    assert.equal(saved.status, 'Submitted');
    assert.equal(saved.student.name, 'Kiran Shrestha');
    assert.equal(saved.student.program, 'BSc CSIT');
    assert.equal(saved.program, 'BSc CSIT');
    assert.equal(saved.category, 'Computer Lab / Hardware');
    assert.notEqual(saved.trackingSecretHash, createdTrackingSecret, 'Tracking secret must be hashed, not stored plaintext');
  });

  // 4. Private Tracking: Invalid secret
  await t.test('POST /api/v1/complaints/track rejects incorrect tracking secret', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/track')
      .send({
        reference: createdComplaintRef,
        trackingSecret: 'wrong_secret_12345',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'INVALID_CREDENTIALS');
  });

  // 5. Private Tracking: Valid secret & No Leaks
  await t.test('POST /api/v1/complaints/track returns safe student view with zero internal notes', async () => {
    // Add internal note directly to simulate admin action
    const doc = await Complaint.findById(complaintId);
    doc.internalNotes.push({
      note: 'INTERNAL SECRET: Technician checking spare keyboard stock',
      createdBy: { name: 'Admin', email: 'admin@sochcollege.edu.np' },
    });
    await doc.save();

    const res = await request(app)
      .post('/api/v1/complaints/track')
      .send({
        reference: createdComplaintRef,
        trackingSecret: createdTrackingSecret,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.complaint.reference, createdComplaintRef);
    assert.equal(res.body.complaint.status, 'Submitted');
    assert.equal(res.body.complaint.program, 'BSc CSIT');
    // Ensure sensitive fields are NEVER leaked
    assert.equal(res.body.complaint.trackingSecretHash, undefined);
    assert.equal(res.body.complaint.internalNotes, undefined);
    assert.equal(res.body.complaint.student, undefined);
  });

  // 6. Admin Login: Failed
  await t.test('POST /api/v1/admin/auth/login rejects incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: TEST_ADMIN.email,
        password: 'WrongPassword!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'INVALID_CREDENTIALS');
  });

  // 7. Admin Login: Successful
  await t.test('POST /api/v1/admin/auth/login succeeds, returns cookie and CSRF token', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: TEST_ADMIN.email,
        password: TEST_ADMIN.password,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.csrfToken);
    assert.equal(res.body.admin.email, TEST_ADMIN.email);
    assert.equal(res.body.admin.passwordHash, undefined, 'Password hash must never be returned');

    csrfToken = res.body.csrfToken;

    // Capture session cookie
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    adminSessionCookie = cookies.find((c) => c.startsWith('sccs_admin_sid'));
    assert.ok(adminSessionCookie);
  });

  // 8. Unauthorized Admin Access
  await t.test('GET /api/v1/admin/complaints rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/admin/complaints');
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'UNAUTHORIZED');
  });

  // 9. CSRF Protection on State Changes
  await t.test('PATCH /api/v1/admin/complaints/:id/status rejects request without CSRF token', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/complaints/${complaintId}/status`)
      .set('Cookie', adminSessionCookie)
      .send({ status: 'Under Review' });

    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'CSRF_INVALID');
  });

  // 10. Valid Status Transition
  await t.test('PATCH /api/v1/admin/complaints/:id/status allows valid transition with CSRF', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/complaints/${complaintId}/status`)
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        status: 'Under Review',
        note: 'Assigned to Lab Assistant for physical inspection',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.complaint.status, 'Under Review');

    // Verify audit timeline
    const latestTimeline = res.body.complaint.timeline.slice(-1)[0];
    assert.equal(latestTimeline.fromStatus, 'Submitted');
    assert.equal(latestTimeline.toStatus, 'Under Review');
  });

  // 11. Invalid Status Transition
  await t.test('PATCH /api/v1/admin/complaints/:id/status blocks invalid transition directly to Submitted', async () => {
    // Current is Under Review; set to Resolved first
    await request(app)
      .patch(`/api/v1/admin/complaints/${complaintId}/status`)
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({ status: 'Resolved', note: 'Replaced keyboard' });

    // From Resolved, transition directly to Submitted is NOT allowed
    const res = await request(app)
      .patch(`/api/v1/admin/complaints/${complaintId}/status`)
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({ status: 'Submitted' });

    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INVALID_TRANSITION');
  });

  // 12. Add Student-Visible Response
  await t.test('POST /api/v1/admin/complaints/:id/responses records official response', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/complaints/${complaintId}/responses`)
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        message: 'The hardware team has replaced the keyboard with a new USB mechanical unit.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.response.message.includes('replaced the keyboard'));

    // Verify that tracking endpoint now exposes this response to the student
    const trackRes = await request(app)
      .post('/api/v1/complaints/track')
      .send({
        reference: createdComplaintRef,
        trackingSecret: createdTrackingSecret,
      });

    assert.equal(trackRes.status, 200);
    assert.equal(trackRes.body.complaint.responses.length, 1);
    assert.ok(trackRes.body.complaint.responses[0].message.includes('replaced the keyboard'));
  });

  // 13. Reports summary
  await t.test('GET /api/v1/admin/reports/summary returns database-backed statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/summary')
      .set('Cookie', adminSessionCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.summary.total >= 1);
    assert.equal(typeof res.body.summary.byStatus, 'object');
  });

  // 14. Attachment Security: Reject disallowed extension (.exe)
  await t.test('POST /api/v1/complaints rejects non-permitted file extension', async () => {
    const fakeExeBuffer = Buffer.from('MZ...fake executable content');
    const res = await request(app)
      .post('/api/v1/complaints')
      .field('studentName', 'Kiran Shrestha')
      .field('studentId', 'SOCH-CSIT-2024-012')
      .field('email', 'teststudent@sochcollege.edu.np')
      .field('category', 'Computer Lab / Hardware')
      .field('title', 'Testing Executable Upload')
      .field('description', 'Attempting to attach a script or executable file.')
      .attach('attachment', fakeExeBuffer, 'script.exe');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not permitted|Only JPG, PNG, and PDF/i);
  });

  // 15. Attachment Security: Reject disguised file with invalid magic bytes
  await t.test('POST /api/v1/complaints rejects file with mismatched magic bytes (disguised file)', async () => {
    // File named error.png, but content is arbitrary ASCII text
    const textAsPng = Buffer.from('<html><script>alert("exploit")</script></html>');
    const res = await request(app)
      .post('/api/v1/complaints')
      .field('studentName', 'Kiran Shrestha')
      .field('studentId', 'SOCH-CSIT-2024-012')
      .field('email', 'teststudent@sochcollege.edu.np')
      .field('category', 'Computer Lab / Hardware')
      .field('title', 'Testing Disguised Script')
      .field('description', 'Attempting to upload an HTML file disguised as a PNG image.')
      .attach('attachment', textAsPng, 'screenshot.png');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'INVALID_FILE_SIGNATURE');
  });

  // 16. Attachment Security: Valid PNG upload & private tracking check
  let attachedComplaintId;
  let attachedComplaintRef;
  let attachedTrackingSecret;
  const validPngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  ]);

  await t.test('POST /api/v1/complaints successfully accepts valid PNG image attachment', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .field('studentName', 'Kiran Shrestha')
      .field('studentId', 'SOCH-CSIT-2024-012')
      .field('email', 'teststudent@sochcollege.edu.np')
      .field('category', 'Classroom Technology / Projector')
      .field('title', 'Projector Display Artifacts in Lab 1')
      .field('description', 'The ceiling HDMI projector flickers red bands across the whiteboard.')
      .attach('attachment', validPngHeader, 'screen_artifact.png');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.reference);
    assert.ok(res.body.trackingSecret);

    attachedComplaintRef = res.body.reference;
    attachedTrackingSecret = res.body.trackingSecret;

    const savedDoc = await Complaint.findOne({ reference: attachedComplaintRef });
    assert.ok(savedDoc);
    attachedComplaintId = savedDoc._id.toString();
    assert.ok(savedDoc.attachment);
    assert.equal(savedDoc.attachment.originalName, 'screen_artifact.png');
    assert.equal(savedDoc.attachment.mimeType, 'image/png');
  });

  // 17. Private Tracking View: Exposes hasAttachment flag but NEVER internal path
  await t.test('POST /api/v1/complaints/track reflects hasAttachment: true without leaking storage path', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/track')
      .send({
        reference: attachedComplaintRef,
        trackingSecret: attachedTrackingSecret,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.complaint.hasAttachment, true);
    assert.equal(res.body.complaint.attachment, undefined, 'Attachment object and disk path must not be exposed to tracking');
  });

  // 18. Private Attachment Download: Unauthenticated access rejected
  await t.test('GET /api/v1/admin/complaints/:id/attachment rejects unauthenticated download requests', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/complaints/${attachedComplaintId}/attachment`);

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'UNAUTHORIZED');
  });

  // 19. Private Attachment Download: Authenticated admin download stream
  await t.test('GET /api/v1/admin/complaints/:id/attachment streams attachment with nosniff security header', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/complaints/${attachedComplaintId}/attachment`)
      .set('Cookie', adminSessionCookie);

    assert.equal(res.status, 200);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['content-disposition'].includes('attachment'));
    assert.ok(res.headers['content-disposition'].includes('screen_artifact.png'));
    assert.ok(res.body.length >= validPngHeader.length);
  });

  // 20. Authenticated Password Change
  await t.test('PATCH /api/v1/admin/auth/password verifies current password and updates hash', async () => {
    // 20a. Rejects wrong current password
    const failRes = await request(app)
      .patch('/api/v1/admin/auth/password')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'BrandNewSecurePass123!',
        confirmPassword: 'BrandNewSecurePass123!',
      });

    assert.equal(failRes.status, 400);
    assert.equal(failRes.body.code, 'INVALID_CURRENT_PASSWORD');

    // 20b. Accepts valid password change
    const successRes = await request(app)
      .patch('/api/v1/admin/auth/password')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        currentPassword: TEST_ADMIN.password,
        newPassword: 'BrandNewSecurePass123!',
        confirmPassword: 'BrandNewSecurePass123!',
      });

    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.success, true);
    assert.ok(successRes.body.csrfToken);

    // Update csrfToken and password reference for subsequent tests
    csrfToken = successRes.body.csrfToken;
    const cookies = successRes.headers['set-cookie'];
    if (cookies) {
      const refreshedCookie = cookies.find((c) => c.startsWith('sccs_admin_sid'));
      if (refreshedCookie) adminSessionCookie = refreshedCookie;
    }
  });

  // 21. Admin Logout & Session Invalidation
  await t.test('POST /api/v1/admin/auth/logout invalidates session', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/logout')
      .set('Cookie', adminSessionCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Subsequent authenticated request must be rejected
    const afterLogout = await request(app)
      .get('/api/v1/admin/auth/me')
      .set('Cookie', adminSessionCookie);

    assert.equal(afterLogout.status, 401);
  });
});
