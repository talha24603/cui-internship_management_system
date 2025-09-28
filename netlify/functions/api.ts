import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  try {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: '',
      };
    }

    // Import the Express app dynamically to avoid build issues
    const { default: app } = await import('../../src/app');
    
    // Convert Netlify event to Express request
    const expressRequest = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body,
      query: event.queryStringParameters || {},
    };

    return new Promise((resolve) => {
      const expressResponse = {
        status: (code: number) => ({
          json: (data: any) => {
            resolve({
              statusCode: code,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              },
              body: JSON.stringify(data),
            });
          },
          send: (data: any) => {
            resolve({
              statusCode: code,
              headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
              },
              body: data,
            });
          },
        }),
        json: (data: any) => {
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
          });
        },
        send: (data: any) => {
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
            },
            body: data,
          });
        },
      };

      // Call the Express app
      app(expressRequest as any, expressResponse as any);
    });
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };