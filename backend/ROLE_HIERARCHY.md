# 🔐 KMPDU E-Voting: Role Hierarchy & Permissions

## 👥 **Role Hierarchy**

```
┌─────────────────────────────────────────────────────────────┐
│                    🔧 SUPERUSERADMIN                        │
│                   (System Administrator)                    │
│  ✅ ALL ADMIN PERMISSIONS +                                │
│  ✅ Create/Update Branches                                  │
│  ✅ System Configuration                                    │
│  ✅ Full Audit Access                                       │
│  ✅ User Role Management                                    │
│  ❌ Cannot see individual votes (blockchain privacy)        │
└─────────────────────┬───────────────────────────────────────┘
                      │ Inherits All Permissions
┌─────────────────────▼───────────────────────────────────────┐
│                    👨💼 ADMIN                               │
│                 (Election Manager)                          │
│  ✅ ALL MEMBER PERMISSIONS +                               │
│  ✅ Create Elections & Positions                           │
│  ✅ Add Candidates                                         │
│  ✅ View Results (aggregated from blockchain)              │
│  ✅ Import Users from Excel                                │
│  ✅ Send Notifications                                     │
│  ✅ Basic Audit Trail                                      │
│  ❌ Cannot see individual votes (blockchain privacy)        │
└─────────────────────┬───────────────────────────────────────┘
                      │ Inherits All Permissions
┌─────────────────────▼───────────────────────────────────────┐
│                    🗳️ MEMBER                               │
│                     (Voter)                                │
│  ✅ Login & Authentication                                 │
│  ✅ View Own Profile                                       │
│  ✅ View Ballot & Elections                                │
│  ✅ Cast Vote (🔗 blockchain)                             │
│  ✅ View Own Voting History (privacy-preserving)          │
│  ✅ View Notifications & Announcements                    │
│  ✅ Member Dashboard                                       │
│  ❌ Cannot manage elections or users                       │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 **Blockchain Privacy Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                🔗 ICP BLOCKCHAIN LAYER                     │
│                  (Vote Privacy Zone)                        │
│                                                             │
│  🔒 WHAT'S STORED:                                         │
│  ✅ Individual votes (anonymous)                           │
│  ✅ Anonymous voter hashes                                 │
│  ✅ Vote timestamps                                        │
│  ✅ Cryptographic proofs                                   │
│                                                             │
│  🚫 WHAT NO ROLE CAN ACCESS:                              │
│  ❌ Vote-to-voter linkage                                  │
│  ❌ Who voted for whom                                     │
│  ❌ Individual voting patterns                             │
│                                                             │
│  👥 ACCESS LEVEL: ANONYMOUS ONLY                           │
│  Even SUPERUSERADMIN cannot see individual votes           │
└─────────────────────────────────────────────────────────────┘
```

## 📊 **Permission Matrix by Feature**

### **🔐 Authentication & Profile**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| Login with Member ID + National ID | ✅ | ✅ | ✅ |
| OTP Verification | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ |
| View Other Profiles | ❌ | ✅ | ✅ |

### **🗳️ Voting & Elections**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| View Elections | ✅ | ✅ | ✅ |
| View Ballot | ✅ | ✅ | ✅ |
| Cast Vote (🔗 blockchain) | ✅ | ✅ | ✅ |
| Create Elections | ❌ | ✅ | ✅ |
| Add Positions | ❌ | ✅ | ✅ |
| Add Candidates | ❌ | ✅ | ✅ |
| View Results (🔗 blockchain) | ❌ | ✅ | ✅ |

### **👥 User Management**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| Import Users from Excel | ❌ | ✅ | ✅ |
| List All Users | ❌ | ✅ | ✅ |
| View User Statistics | ❌ | ✅ | ✅ |
| Manage User Roles | ❌ | ❌ | ✅ |

### **🏢 Branch Management**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| View Branches | ✅ | ✅ | ✅ |
| Create Branches | ❌ | ❌ | ✅ |
| Update Branches | ❌ | ❌ | ✅ |
| Branch Statistics | ❌ | ✅ | ✅ |

### **🔔 Notifications**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| View Own Notifications | ✅ | ✅ | ✅ |
| View Announcements | ✅ | ✅ | ✅ |
| Send Notifications | ❌ | ✅ | ✅ |
| System-wide Announcements | ❌ | ✅ | ✅ |

### **📊 Dashboard & Analytics**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| Member Dashboard | ✅ | ✅ | ✅ |
| Admin Dashboard | ❌ | ✅ | ✅ |
| Super Admin Dashboard | ❌ | ❌ | ✅ |
| Basic Analytics | ❌ | ✅ | ✅ |
| System Metrics | ❌ | ❌ | ✅ |

### **📋 Audit & Security**
| Feature | MEMBER | ADMIN | SUPERUSERADMIN |
|---------|--------|-------|----------------|
| View Own Activity | ✅ | ✅ | ✅ |
| Basic Audit Trail | ❌ | ✅ | ✅ |
| Full Audit Trail | ❌ | ❌ | ✅ |
| Audit Statistics | ❌ | ❌ | ✅ |
| System Logs | ❌ | ❌ | ✅ |

## 🛡️ **Security Boundaries**

### **🔒 What Each Role CANNOT Do:**

#### **MEMBER Limitations:**
- ❌ Cannot create or manage elections
- ❌ Cannot add candidates or positions  
- ❌ Cannot view election results
- ❌ Cannot access other users' data
- ❌ Cannot send system notifications
- ❌ Cannot access admin functions

#### **ADMIN Limitations:**
- ❌ Cannot create or modify branches
- ❌ Cannot access super admin dashboard
- ❌ Cannot view detailed system metrics
- ❌ Cannot manage user roles
- ❌ Cannot see individual votes (blockchain privacy)

#### **SUPERUSERADMIN Limitations:**
- ❌ Cannot see individual votes (blockchain privacy)
- ❌ Cannot bypass vote anonymity
- ❌ Cannot alter blockchain records
- ❌ Cannot trace votes to voters

### **🔗 Universal Blockchain Privacy:**
**NO ROLE** can access:
- Individual vote choices
- Vote-to-voter linkage  
- Who voted for whom
- Voting patterns of individuals

## 🎯 **Role Assignment Guidelines**

### **👤 MEMBER Role:**
- **Who**: All registered voters
- **Purpose**: Participate in elections
- **Access**: Voting and personal information only

### **👨💼 ADMIN Role:**
- **Who**: Election officials, branch managers
- **Purpose**: Manage elections and candidates
- **Access**: Election management + all member functions

### **🔧 SUPERUSERADMIN Role:**
- **Who**: System administrators, IT staff
- **Purpose**: System configuration and maintenance
- **Access**: Complete system access (except individual votes)

This role-based system ensures **democratic participation** while maintaining **complete vote privacy** and **system security**.