import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_college_complaints';

/**
 * Migration Script: Migrate & Validate Program Field
 * 
 * Complies with strict project requirements:
 * 1. Confirms Soch College of IT offers ONLY BSc CSIT.
 * 2. Does NOT silently overwrite existing real complaint records.
 * 3. Identifies incompatible existing records and logs any migration required before changing them.
 * 4. Safely ensures 'program: BSc CSIT' and 'student.program: BSc CSIT' are populated on existing records.
 */
async function runMigration() {
  console.log('----------------------------------------------------');
  console.log('Soch College of IT - Complaint Program Field Migration');
  console.log(`Connecting to: ${MONGODB_URI}`);
  console.log('----------------------------------------------------');

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    const collection = mongoose.connection.db.collection('complaints');

    const totalRecords = await collection.countDocuments();
    console.log(`[Audit] Total complaints in database: ${totalRecords}`);

    if (totalRecords === 0) {
      console.log('[Audit] Database has no complaint records. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }

    const allRecords = await collection.find({}).toArray();

    // 1. Check for incompatible records (non-CSIT programs)
    const incompatibleRecords = [];
    const compatibleRecordsToUpdate = [];
    const alreadyCompliantRecords = [];

    for (const doc of allRecords) {
      const issues = [];
      const hasNonCsitProgram = doc.program && doc.program !== 'BSc CSIT';
      const hasNonCsitStudentProgram = doc.student?.program && doc.student.program !== 'BSc CSIT';
      const hasNonCsitStudentId = doc.student?.studentId && /BIT|BCA|BIM|BSc\s*IT/i.test(doc.student.studentId);

      if (hasNonCsitProgram) {
        issues.push(`Unsupported root program: "${doc.program}"`);
      }
      if (hasNonCsitStudentProgram) {
        issues.push(`Unsupported student.program: "${doc.student.program}"`);
      }
      if (hasNonCsitStudentId) {
        issues.push(`Non-CSIT roll prefix: "${doc.student.studentId}"`);
      }

      if (issues.length > 0) {
        incompatibleRecords.push({
          id: doc._id,
          reference: doc.reference,
          studentName: doc.student?.name,
          studentId: doc.student?.studentId,
          issues,
        });
      } else if (doc.program === 'BSc CSIT' && doc.student?.program === 'BSc CSIT') {
        alreadyCompliantRecords.push(doc.reference);
      } else {
        compatibleRecordsToUpdate.push(doc);
      }
    }

    console.log(`[Audit] Already fully compliant records: ${alreadyCompliantRecords.length}`);
    console.log(`[Audit] Records needing safe BSc CSIT field population: ${compatibleRecordsToUpdate.length}`);
    console.log(`[Audit] Incompatible records found: ${incompatibleRecords.length}`);

    if (incompatibleRecords.length > 0) {
      console.warn('\n[WARNING] Found records with incompatible program data:');
      console.warn(JSON.stringify(incompatibleRecords, null, 2));
      console.warn('Per safety requirements, these records will NOT be silently overwritten.');
      console.warn('Manual administrative triage is required for incompatible records.');
    }

    if (compatibleRecordsToUpdate.length > 0) {
      console.log('\n[Migrate] Safely backfilling program: "BSc CSIT" onto compatible records...');
      for (const rec of compatibleRecordsToUpdate) {
        await collection.updateOne(
          { _id: rec._id },
          {
            $set: {
              program: 'BSc CSIT',
              'student.program': 'BSc CSIT',
            },
          }
        );
        console.log(`- Updated reference ${rec.reference} (${rec.student?.name || 'Student'}) with BSc CSIT.`);
      }
      console.log(`[Migrate] Successfully updated ${compatibleRecordsToUpdate.length} record(s).`);
    } else {
      console.log('\n[Migrate] No records needed update. Database is up to date.');
    }

    console.log('----------------------------------------------------');
    console.log('Migration audit completed successfully.');
    console.log('----------------------------------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
