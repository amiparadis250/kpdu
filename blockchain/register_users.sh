#!/bin/bash

# Register all users to blockchain voting system
# This script connects to the database and registers each user to the identity canister

echo "🔗 Starting blockchain user registration..."

# Change to the blockchain directory
cd kmpdu_voting

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please start it with: dfx start --background"
    exit 1
fi

echo "✅ DFX is running"

# Example registrations (replace with actual user data from your database)
# You would typically fetch this data from your PostgreSQL database

# Sample users - replace with actual database query results
declare -a users=(
    "USER001:WESTERN"
    "USER002:NYANZA" 
    "USER003:UPPER_EASTERN"
)

registered=0
failed=0

for user_data in "${users[@]}"; do
    IFS=':' read -r member_id branch_id <<< "$user_data"
    
    echo "⏳ Registering user: $member_id (Branch: $branch_id)"
    
    result=$(dfx canister call identity_canister registerVoter "(\"$member_id\", \"$branch_id\")" 2>&1)
    
    if [[ $result == *"true"* ]]; then
        echo "✅ Successfully registered: $member_id"
        ((registered++))
    elif [[ $result == *"false"* ]]; then
        echo "⚠️  User already registered: $member_id"
        ((failed++))
    else
        echo "❌ Failed to register $member_id: $result"
        ((failed++))
    fi
done

echo ""
echo "🎉 Registration Summary:"
echo "📊 Total processed: ${#users[@]}"
echo "✅ Successfully registered: $registered"
echo "❌ Failed/Already registered: $failed"

echo ""
echo "💡 To register actual users from database:"
echo "1. Update this script with real user data from PostgreSQL"
echo "2. Or use the Node.js script: node ../register_all_users.js"
echo "3. Or use the API endpoint: POST /api/users/register-blockchain"