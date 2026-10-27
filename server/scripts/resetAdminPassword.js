import readline from 'readline';
import { Writable } from 'stream';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { hashPassword } from '../utils/crypto.js';

function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function askHidden(query) {
  return new Promise((resolve) => {
    let muted = false;
    const mutableStdout = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) {
          process.stdout.write(chunk, encoding);
        } else {
          const str = chunk.toString();
          if (str !== '\n' && str !== '\r') {
            process.stdout.write('*');
          }
        }
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    rl.question(query, (ans) => {
      process.stdout.write('\n');
      rl.close();
      resolve(ans.trim());
    });

    muted = true;
  });
}

async function run() {
  console.log('\n=======================================================');
  console.log(' Soch College of IT — Local Admin Password Reset');
  console.log(' Requires direct console access to the server environment');
  console.log('=======================================================\n');

  try {
    await connectDB();

    const email = await ask('Enter Administrator Email to Reset: ');
    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: cleanEmail });
    if (!admin) {
      console.error(`\n[Error] No administrator found with email "${cleanEmail}".`);
      await disconnectDB();
      process.exit(1);
    }

    console.log(`Found administrator: ${admin.name} (${admin.email})`);

    const newPassword = await askHidden('Enter New Password (min 8 chars): ');
    if (!newPassword || newPassword.length < 8) {
      console.error('\n[Error] Password must be at least 8 characters long.');
      process.exit(1);
    }

    const confirmPassword = await askHidden('Confirm New Password: ');
    if (newPassword !== confirmPassword) {
      console.error('\n[Error] Passwords do not match. Aborting.');
      process.exit(1);
    }

    admin.passwordHash = await hashPassword(newPassword);
    await admin.save();

    console.log(`\n[Success] Password reset successfully for "${cleanEmail}".`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n[Fatal Error] Could not reset admin password:', error.message);
    process.exit(1);
  }
}

run();
