import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CUI Bio-internship Backend API',
      version: '1.0.0',
      description: 'Backend API for CUI Bio-internship application with authentication and user management',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            regNo: {
              type: 'string',
              nullable: true,
              description: 'User registration number'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'faculty'],
              default: 'user',
              description: 'User role'
            },
            verified: {
              type: 'boolean',
              default: false,
              description: 'Email verification status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password',
              example: 'password123'
            },
            regNo: {
              type: 'string',
              description: 'User registration number (optional)',
              example: '2021-CS-123'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'faculty'],
              default: 'user',
              description: 'User role (optional)',
              example: 'user'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Server is running'
            },
            environment: {
              type: 'string',
              example: 'production'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy']
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected']
            },
            userCount: {
              type: 'number',
              description: 'Total number of users in database'
            }
          }
        }
      }
    },
    paths: {
      '/': {
        get: {
          tags: ['General'],
          summary: 'API Information',
          description: 'Get basic API information and available endpoints',
          responses: {
            '200': {
              description: 'API information retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      environment: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                      endpoints: {
                        type: 'object',
                        properties: {
                          health: { type: 'string' },
                          auth: { type: 'object' }
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
      '/health': {
        get: {
          tags: ['General'],
          summary: 'Health Check',
          description: 'Check API and database connectivity status',
          responses: {
            '200': {
              description: 'Health check successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Health check failed',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register User',
          description: 'Create a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterRequest'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login User',
          description: 'Authenticate user and return access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/verify-email': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify Email (API)',
          description: 'Verify user email using token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: {
                      type: 'string',
                      description: 'Email verification token',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Email verified successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Email verified successfully' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid or expired token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        get: {
          tags: ['Authentication'],
          summary: 'Verify Email (Web)',
          description: 'Verify user email using token from URL parameter',
          parameters: [
            {
              name: 'token',
              in: 'query',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Email verification token'
            }
          ],
          responses: {
            '200': {
              description: 'Email verified successfully - returns HTML page',
              content: {
                'text/html': {
                  schema: {
                    type: 'string',
                    description: 'HTML page confirming email verification'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid or expired token',
              content: {
                'text/html': {
                  schema: {
                    type: 'string',
                    description: 'HTML page showing verification failed'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh Access Token',
          description: 'Get new access token using refresh token',
          security: [{ cookieAuth: [] }],
          responses: {
            '200': {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: {
                        type: 'string',
                        description: 'New JWT access token'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - invalid refresh token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout User',
          description: 'Logout user and revoke refresh token',
          security: [{ cookieAuth: [] }],
          responses: {
            '200': {
              description: 'Logout successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Logged out successfully' }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./api/**/*.ts'], // Path to the API files
};

const specs = swaggerJsdoc(options);

export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(specs);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
