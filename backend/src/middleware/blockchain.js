// KMPDU Blockchain Integration Middleware
// File: backend/src/middleware/blockchain.js

const crypto = require('crypto');

// Blockchain connection status
let blockchainConnected = false;

// Middleware to check blockchain connection
const checkBlockchainConnection = (req, res, next) => {
  if (!blockchainConnected && process.env.NODE_ENV === 'production') {
    return res.status(503).json({
      success: false,
      error: 'Blockchain service unavailable'
    });
  }
  next();
};

// Validate election data
const validateElectionData = (req, res, next) => {
  const { title, electionType, startDate, endDate, positions } = req.body;
  
  if (!title || !electionType || !startDate || !endDate || !positions) {
    return res.status(400).json({
      success: false,
      error: 'Missing required election fields'
    });
  }

  if (!['NATIONAL', 'BRANCH'].includes(electionType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid election type'
    });
  }

  if (electionType === 'BRANCH' && !req.body.branchId) {
    return res.status(400).json({
      success: false,
      error: 'Branch ID required for branch elections'
    });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      success: false,
      error: 'End date must be after start date'
    });
  }

  next();
};

// Validate vote data
const validateVoteData = (req, res, next) => {
  const { electionId, memberId, nationalId, positionId, candidateId, userBranch } = req.body;
  
  if (!electionId || !memberId || !nationalId || !positionId || !candidateId || !userBranch) {
    return res.status(400).json({
      success: false,
      error: 'Missing required vote fields'
    });
  }

  // Validate member ID format
  if (!/^KMPDU\d+$/.test(memberId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid member ID format'
    });
  }

  // Validate national ID (8 digits)
  if (!/^\d{8}$/.test(nationalId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid national ID format'
    });
  }

  next();
};

// Rate limiting for voting
const voteRateLimit = new Map();

const rateLimitVoting = (req, res, next) => {
  const { memberId } = req.body;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxAttempts = 3;

  if (!voteRateLimit.has(memberId)) {
    voteRateLimit.set(memberId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const userLimit = voteRateLimit.get(memberId);
  
  if (now > userLimit.resetTime) {
    // Reset window
    voteRateLimit.set(memberId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (userLimit.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      error: 'Too many vote attempts. Please wait before trying again.'
    });
  }

  userLimit.count++;
  next();
};

// Audit logging
const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action
      console.log(`[BLOCKCHAIN AUDIT] ${new Date().toISOString()} - ${action}`, {
        user: req.user?.memberId || 'anonymous',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: JSON.parse(data).success
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Hash voter identity consistently
const hashVoter = (memberId, nationalId) => {
  const salt = process.env.VOTER_HASH_SALT || 'kmpdu-voting-salt';
  return crypto.createHash('sha256')
    .update(`${memberId}-${nationalId}-${salt}`)
    .digest('hex');
};

// Set blockchain connection status
const setBlockchainStatus = (status) => {
  blockchainConnected = status;
  console.log(`Blockchain connection: ${status ? 'Connected' : 'Disconnected'}`);
};

module.exports = {
  checkBlockchainConnection,
  validateElectionData,
  validateVoteData,
  rateLimitVoting,
  auditLog,
  hashVoter,
  setBlockchainStatus
};