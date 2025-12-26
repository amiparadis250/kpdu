import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KMPDU E-Voting API',
      version: '1.0.0',
      description: 'API documentation for KMPDU Electronic Voting System',
      contact: {
        name: 'KMPDU Tech Team',
        email: 'tech@kmpdu.org'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            memberId: { type: 'string' },
            memberName: { type: 'string' },
            nationalId: { type: 'string' },
            mobileNumber: { type: 'string' },
            branch: { 
              type: 'string',
              enum: ['WESTERN_MEMBER', 'NYANZA_MEMBER', 'WESTERN', 'UPPER_EASTERN']
            },
            email: { type: 'string', nullable: true },
            role: { 
              type: 'string',
              enum: ['MEMBER', 'ADMIN', 'SUPERUSERADMIN']
            },
            isActive: { type: 'boolean' },
            hasVoted: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['memberId', 'nationalId'],
          properties: {
            memberId: { type: 'string', example: '12345' },
            nationalId: { type: 'string', example: '987654321' }
          }
        },
        OTPRequest: {
          type: 'object',
          required: ['memberId', 'otp'],
          properties: {
            memberId: { type: 'string', example: '12345' },
            otp: { type: 'string', example: '123456' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        ImportResult: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            results: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      row: { type: 'number' },
                      data: { type: 'object' },
                      error: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);