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
          // Output asterisk for every character
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
  console.log(' Soch College of IT — Administrative Account Setup');
  console.log(' Creates an authorized administrator account in MongoDB');
  console.log('=======================================================\n');

  try {
    await connectDB();

    const name = await ask('Enter Administrator Full Name (e.g. Er. Pradeep Karki): ');
    if (!name || name.length < 2) {
      console.error('\n[Error] Administrator name must be at least 2 characters.');
      process.exit(1);
    }

    const email = await ask('Enter Administrator Email: ');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      console.error('\n[Error] A valid email address is required.');
      process.exit(1);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      console.error(`\n[Notice] An administrative account with email "${cleanEmail}" already exists.`);
      const answer = await ask('Do you wish to update this administrator\'s password? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('Aborting account setup without modifications.');
        await disconnectDB();
        process.exit(0);
      }
    }

    const password = await askHidden('Enter Administrator Password (min 8 chars): ');
    if (!password || password.length < 8) {
      console.error('\n[Error] Password must be at least 8 characters long.');
      process.exit(1);
    }

    const confirmPassword = await askHidden('Confirm Administrator Password: ');
    if (password !== confirmPassword) {
      console.error('\n[Error] Passwords do not match. Aborting.');
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);

    if (existing) {
      existing.name = name;
      existing.passwordHash = passwordHash;
      existing.isActive = true;
      await existing.save();
      console.log(`\n[Success] Administrator account "${cleanEmail}" password updated successfully.`);
    } else {
      const admin = new Admin({
        name,
        email: cleanEmail,
        passwordHash,
        title: 'IT Grievance Coordinator & Dean Desk',
        department: 'Central Grievance Redressal Cell',
        role: 'Admin',
        isActive: true,
      });
      await admin.save();
      console.log(`\n[Success] Administrator "${name}" (${cleanEmail}) created successfully in MongoDB.`);
    }

    console.log('[Notice] You can now sign in at http://localhost:5173/admin/login using these credentials.');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n[Fatal Error] Could not complete admin setup:', error.message);
    process.exit(1);
  }
}

run();
