import { APIGatewayProxyResult } from 'aws-lambda';

export const handleError = (error: unknown): APIGatewayProxyResult => {
  console.error('Error:', error);
  return {
    statusCode: 500,
    headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
    body: JSON.stringify({ message: 'Internal Server Error' }),
  };
};