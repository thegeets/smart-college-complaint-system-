import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_college_complaints';

async function runCheck() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB connected successfully.');

    const collection = mongoose.connection.db.collection('complaints');
    const totalCount = await collection.countDocuments();
    console.log(`Total complaints stored in database: ${totalCount}`);

    const allRecords = await collection.find({}).toArray();

    const incompatible = [];
    for (const rec of allRecords) {
      const issues = [];
      if (rec.program && rec.program !== 'BSc CSIT') {
        issues.push(`Root program field is "${rec.program}" (expected "BSc CSIT")`);
      }
      if (rec.student?.program && rec.student.program !== 'BSc CSIT') {
        issues.push(`student.program field is "${rec.student.program}" (expected "BSc CSIT")`);
      }
      if (rec.student?.studentId && /BIT|BCA|BIM|BSc\s*IT/i.test(rec.student.studentId)) {
        issues.push(`studentId has non-CSIT prefix: "${rec.student.studentId}"`);
      }
      if (issues.length > 0) {
        incompatible.push({
          id: rec._id,
          reference: rec.reference,
          studentName: rec.student?.name,
          studentId: rec.student?.studentId,
          program: rec.program,
          studentProgram: rec.student?.program,
          issues,
        });
      }
    }

    if (totalCount > 0) {
      console.log('Existing database records sample:');
      for (const rec of allRecords) {
        console.log(`- Ref: ${rec.reference}, Title: "${rec.title}", Student: "${rec.student?.name}" (${rec.student?.studentId}), Program: "${rec.program || rec.student?.program || 'N/A'}"`);
      }
    }

    if (incompatible.length > 0) {
      console.log(`Found ${incompatible.length} incompatible records:`);
      console.log(JSON.stringify(incompatible, null, 2));
    } else {
      console.log('Zero incompatible records found in MongoDB. All records are either compliant or have no non-CSIT program.');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

runCheck();
