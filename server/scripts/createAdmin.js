import 'dotenv/config';
import readline from 'readline';
import { Writable } from 'stream';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import { hashPassword } from '../utils/crypto.js';

function ask(query, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
    rl.question(prompt, (ans) => {
      rl.close();
      const val = ans.trim();
      resolve(val || defaultValue);
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
  console.log(' Soch College of IT — Administrative Account Setup');
  console.log(' Provisions a new authorized administrator in MongoDB');
  console.log('=======================================================\n');

  try {
    await connectDB();

    const envEmail = (process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
    const envPassword = process.env.INITIAL_ADMIN_PASSWORD || '';
    const envName = (process.env.INITIAL_ADMIN_NAME || 'Campus IT Administrator').trim();

    let cleanEmail = '';
    let name = '';
    let password = '';

    if (envPassword) {
      // Non-interactive automated provisioning from environment configuration
      cleanEmail = envEmail || 'admin@soch.example';
      name = envName;
      password = envPassword;

      console.log(`[Config] Reading administrator credentials from SERVER environment...`);
      console.log(`[Config] Target Administrator Email: ${cleanEmail}`);

      if (password.length < 8) {
        console.error('\n[Error] INITIAL_ADMIN_PASSWORD must be at least 8 characters long.');
        await disconnectDB();
        process.exit(1);
      }
    } else {
      // Interactive setup via secure console prompts
      console.log('[Interactive Setup] Prompting for administrator details...\n');

      const defaultEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@soch.example';
      name = await ask('Enter Administrator Full Name', 'Campus IT Administrator');
      if (!name || name.length < 2) {
        console.error('\n[Error] Administrator name must be at least 2 characters.');
        await disconnectDB();
        process.exit(1);
      }

      const emailInput = await ask('Enter Administrator Email', defaultEmail);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailRegex.test(emailInput)) {
        console.error('\n[Error] A valid email address format is required.');
        await disconnectDB();
        process.exit(1);
      }

      cleanEmail = emailInput.toLowerCase().trim();

      password = await askHidden('Enter Administrator Password (min 8 chars): ');
      if (!password || password.length < 8) {
        console.error('\n[Error] Password must be at least 8 characters long.');
        await disconnectDB();
        process.exit(1);
      }

      const confirmPassword = await askHidden('Confirm Administrator Password: ');
      if (password !== confirmPassword) {
        console.error('\n[Error] Passwords do not match. Aborting.');
        await disconnectDB();
        process.exit(1);
      }
    }

    // 1. Refusal Check: Existing Administrator
    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      console.error(`\n[Refusal] An administrator account with email "${cleanEmail}" already exists.`);
      console.error('[Refusal] Initial provisioning will not reset passwords or alter existing administrator credentials.');
      console.error('[Notice] To reset an existing administrator\'s password, use the separate deliberate command:');
      console.error('         npm run reset-admin-password\n');
      await disconnectDB();
      process.exit(1);
    }

    // 2. Refusal Check: Existing Student Account
    const existingStudent = await Student.findOne({ email: cleanEmail });
    if (existingStudent) {
      console.error(`\n[Refusal] The email "${cleanEmail}" is already registered to an existing student account.`);
      console.error('[Refusal] Initial provisioning will not promote existing student accounts to administrator.');
      console.error('[Notice] Please use a dedicated institutional staff email address for administrator provisioning.\n');
      await disconnectDB();
      process.exit(1);
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(password);

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

    console.log(`\n[Success] Administrator account created:`);
    console.log(`  Name:  ${name}`);
    console.log(`  Email: ${cleanEmail}`);
    console.log(`  Role:  Admin (Argon2id password hash stored)`);

    console.log('\n-------------------------------------------------------');
    console.log(' NEXT STEPS & CREDENTIAL ROTATION');
    console.log('-------------------------------------------------------');
    console.log(' 1. Sign In URL:');
    console.log('    Navigate to /adminlogin');
    console.log('');
    console.log(' 2. Setting Your Real Email & Rotating Password:');
    console.log('    After logging in, open Portal Settings (/admin/settings):');
    console.log('    - Update your email address and full name.');
    console.log('    - Rotate your temporary password to a permanent one.');
    console.log('    You can also reset passwords anytime via CLI:');
    console.log('    npm run reset-admin-password');
    console.log('-------------------------------------------------------\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n[Fatal Error] Could not complete admin setup:', error.message);
    process.exit(1);
  }
}

run();
