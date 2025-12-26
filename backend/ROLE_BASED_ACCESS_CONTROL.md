# 🔐 KMPDU E-Voting: Complete Role-Based Access Control

## 👥 **User Roles & Responsibilities**

### **🗳️ MEMBER (Voters)**
**Primary Role**: Cast votes and participate in elections

#### **✅ MEMBER Permissions:**
| Action | Endpoint | Description |
|--------|----------|-------------|
| **Authentication** |
| ✅ Login | `POST /api/auth/login` | Login with Member ID + National ID |
| ✅ Verify OTP | `POST /api/auth/verify-otp` | Complete login with OTP |
| ✅ View Profile | `GET /api/auth/profile` | View own profile information |
| **Voting** |
| ✅ View Ballot | `GET /api/votes/ballot/:userId` | 🔗 View available elections & candidates |
| ✅ Cast Vote | `POST /api/votes/cast` | 🔗 **BLOCKCHAIN**: Cast anonymous vote |
| ✅ View History | `GET /api/votes/history/:userId` | 🔗 **BLOCKCHAIN**: Own voting history (privacy-preserving) |
| **Information Access** |
| ✅ View Elections | `GET /api/elections` | See all elections (national + own branch) |
| ✅ View Positions | `GET /api/elections/:id/positions` | See positions in elections |
| ✅ View Candidates | `GET /api/elections/positions/:id/candidates` | See candidates for positions |
| ✅ View Branches | `GET /api/branches` | See branch information |
| **Dashboard & Notifications** |
| ✅ Member Dashboard | `GET /api/dashboard/member/:userId` | Personal voting dashboard |
| ✅ View Notifications | `GET /api/notifications/:userId` | Own notifications only |
| ✅ Mark as Read | `PUT /api/notifications/:id/read` | Mark own notifications as read |
| ✅ View Announcements | `GET /api/notifications/announcements` | System-wide announcements |

#### **❌ MEMBER Restrictions:**
- ❌ Cannot view other users' profiles or voting history
- ❌ Cannot create or manage elections
- ❌ Cannot add candidates or positions
- ❌ Cannot view election results (until authorized)
- ❌ Cannot access admin functions
- ❌ Cannot import users or manage system

---

### **👨‍💼 ADMIN (Election Managers)**
**Primary Role**: Manage elections, candidates, and view results

#### **✅ ADMIN Permissions:**
**Inherits ALL MEMBER permissions PLUS:**

| Action | Endpoint | Description |
|--------|----------|-------------|
| **Election Management** |
| ✅ Create Election | `POST /api/elections` | Create new elections (national/branch) |
| ✅ Create Position | `POST /api/elections/positions` | Add positions to elections |
| ✅ Add Candidate | `POST /api/elections/candidates` | Add candidates to positions |
| ✅ View Results | `GET /api/elections/:id/results` | 🔗 **BLOCKCHAIN**: View aggregated results |
| **User Management** |
| ✅ Import Users | `POST /api/users/import` | Bulk import voters from Excel |
| ✅ List Users | `GET /api/users` | View all users with pagination |
| ✅ User Statistics | `GET /api/users/branch-stats` | User statistics by branch |
| **Communication** |
| ✅ Send Notifications | `POST /api/notifications/send` | Send notifications to members |
| **Analytics** |
| ✅ Admin Dashboard | `GET /api/dashboard/admin` | Election analytics & statistics |
| ✅ Branch Stats | `GET /api/branches/stats` | Branch-level statistics |
| ✅ Audit Trail | `GET /api/audit/trail` | View system audit logs |

#### **❌ ADMIN Restrictions:**
- ❌ Cannot create or modify branches
- ❌ Cannot access super admin functions
- ❌ Cannot view detailed audit statistics
- ❌ Cannot manage system-wide configurations
- ❌ Cannot see individual votes (blockchain privacy maintained)

---

### **🔧 SUPERUSERADMIN (System Administrator)**
**Primary Role**: Complete system management and configuration

#### **✅ SUPERUSERADMIN Permissions:**
**Inherits ALL ADMIN permissions PLUS:**

| Action | Endpoint | Description |
|--------|----------|-------------|
| **System Management** |
| ✅ Super Dashboard | `GET /api/dashboard/superadmin` | Complete system overview |
| ✅ Create Branch | `POST /api/branches` | Create new voting branches |
| ✅ Update Branch | `PUT /api/branches/:id` | Modify branch information |
| **Advanced Audit** |
| ✅ Audit Statistics | `GET /api/audit/stats` | Detailed system audit analytics |
| ✅ Full Audit Trail | `GET /api/audit/trail` | Complete system activity logs |
| **System Configuration** |
| ✅ All Admin Functions | All admin endpoints | Complete administrative access |
| ✅ User Role Management | Via user management | Can assign roles to users |

#### **❌ SUPERUSERADMIN Restrictions:**
- ❌ Cannot see individual votes (blockchain privacy maintained)
- ❌ Cannot bypass vote anonymity
- ❌ Cannot alter blockchain records
- ❌ Cannot trace votes to voters

---

## 🔗 **Blockchain Privacy Guarantees**

### **What NO ROLE Can Access:**
❌ **Individual vote choices**  
❌ **Vote-to-voter linkage**  
❌ **Who voted for whom**  
❌ **Voting patterns of individuals**  
❌ **Blockchain vote content**

### **🔐 Privacy Protection:**
Even **SUPERUSERADMIN** cannot:
- See who voted for which candidate
- Access individual vote records
- Bypass blockchain anonymity
- Trace votes back to voters

## 📊 **Role Comparison Matrix**

| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| **Vote** | ✅ | ✅ | ✅ |
| **View Own Profile** | ✅ | ✅ | ✅ |
| **View Elections** | ✅ | ✅ | ✅ |
| **Create Elections** | ❌ | ✅ | ✅ |
| **Add Candidates** | ❌ | ✅ | ✅ |
| **View Results** | ❌ | ✅ | ✅ |
| **Import Users** | ❌ | ✅ | ✅ |
| **Send Notifications** | ❌ | ✅ | ✅ |
| **Manage Branches** | ❌ | ❌ | ✅ |
| **System Audit** | ❌ | Basic | Full |
| **See Individual Votes** | ❌ | ❌ | ❌ |

## 🛡️ **Security Implementation**

### **Authentication Flow:**
1. **Login**: Member ID + National ID
2. **OTP Verification**: Email OTP
3. **JWT Token**: Contains user role
4. **Role Validation**: Middleware checks permissions

### **Middleware Stack:**
```typescript
// Authentication required
authenticateToken

// Role-based access
requireRole(['MEMBER'])           // Members only
requireRole(['ADMIN', 'SUPERUSERADMIN'])  // Admin level
requireRole(['SUPERUSERADMIN'])   // Super admin only
```

### **🔗 Blockchain Integration:**
- **Vote Casting**: Direct to ICP blockchain (anonymous)
- **Results**: Aggregated from blockchain
- **Verification**: Cryptographic proofs
- **Privacy**: Complete vote anonymity maintained

## 🎯 **Key Principles**

1. **Least Privilege**: Users get minimum required permissions
2. **Role Separation**: Clear boundaries between roles
3. **Vote Privacy**: No role can see individual votes
4. **Blockchain Immutability**: Vote records cannot be altered
5. **Audit Trail**: All actions logged for transparency
6. **Secure Authentication**: Multi-factor with OTP

This role-based system ensures **democratic integrity** while maintaining **complete vote privacy** through blockchain technology.