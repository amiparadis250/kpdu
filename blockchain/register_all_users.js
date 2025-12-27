#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

// Initialize Prisma client with the backend database
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/kpdu_db'
});

async function registerAllUsers() {
  try {
    console.log('🔗 Starting blockchain user registration...');
    
    // Fetch all active users from database
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { 
        memberId: true, 
        branchId: true, 
        memberName: true,
        branch: true 
      }
    });

    console.log(`📊 Found ${users.length} active users to register`);

    let registered = 0;
    let failed = 0;
    const errors = [];

    const blockchainPath = path.join(__dirname, 'kmpdu_voting');
    
    for (const user of users) {
      try {
        const branchId = user.branchId || user.branch || 'DEFAULT';
        const command = `cd ${blockchainPath} && dfx canister call identity_canister registerVoter '("${user.memberId}", "${branchId}")'`;
        
        console.log(`⏳ Registering ${user.memberName} (${user.memberId})...`);
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr && !stderr.includes('Warning')) {
          failed++;
          errors.push(`❌ ${user.memberName} (${user.memberId}): ${stderr}`);
          console.log(`❌ Failed: ${user.memberName}`);
        } else if (stdout.includes('true')) {
          registered++;
          console.log(`✅ Registered: ${user.memberName}`);
        } else {
          failed++;
          errors.push(`⚠️  ${user.memberName} (${user.memberId}): Already registered`);
          console.log(`⚠️  Already registered: ${user.memberName}`);
        }
      } catch (error) {
        failed++;
        errors.push(`❌ ${user.memberName} (${user.memberId}): ${error.message}`);
        console.log(`❌ Error registering ${user.memberName}: ${error.message}`);
      }
    }

    console.log('\n🎉 Registration Summary:');
    console.log(`📊 Total users: ${users.length}`);
    console.log(`✅ Successfully registered: ${registered}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.slice(0, 10).forEach(error => console.log(error));
      if (errors.length > 10) {
        console.log(`... and ${errors.length - 10} more errors`);
      }
    }

  } catch (error) {
    console.error('💥 Registration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the registration
registerAllUsers();