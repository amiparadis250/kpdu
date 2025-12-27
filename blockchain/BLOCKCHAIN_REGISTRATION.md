# Blockchain User Registration Guide

This guide explains how to register all users from the database to the blockchain voting system.

## Prerequisites

1. DFX must be running: `dfx start --background`
2. Identity canister must be deployed
3. Database must be accessible with user data

## Methods to Register Users

### Method 1: API Endpoint (Recommended)
```bash
POST /api/users/register-blockchain
Authorization: Bearer <superadmin_token>
```

This endpoint will:
- Fetch all active users from the database
- Register each user to the identity canister
- Return a summary of successful/failed registrations

### Method 2: Node.js Script
```bash
cd /home/benjamin/programming/kpdu/blockchain
node register_all_users.js
```

### Method 3: Shell Script
```bash
cd /home/benjamin/programming/kpdu/blockchain
./register_users.sh
```

## What Happens During Registration

1. **Fetch Users**: All active users are retrieved from the `users` table
2. **Blockchain Registration**: Each user is registered in the identity canister with:
   - `memberId`: Unique member identifier
   - `branchId`: User's branch (or 'DEFAULT' if not set)
3. **Status Tracking**: The system tracks:
   - Successfully registered users
   - Already registered users
   - Failed registrations with error messages

## Blockchain Identity Canister

The identity canister stores:
```motoko
type Voter = {
  memberId : Text;
  branchId : Text;
  hasVotedNational : Bool;
  hasVotedBranch : Bool;
};
```

## Error Handling

- **Already Registered**: Users already in the blockchain return `false` but are counted as processed
- **Invalid Data**: Missing memberId or branchId will cause registration failure
- **Network Issues**: DFX connection problems will be reported in errors

## Verification

To verify a user is registered:
```bash
cd kmpdu_voting
dfx canister call identity_canister verifyVoter '("MEMBER_ID")'
```

## Security Notes

- Only SUPERUSERADMIN role can trigger bulk registration
- Individual user data remains in the traditional database
- Blockchain only stores voting eligibility and status
- No sensitive user information is stored on blockchain