import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteCampaign } from '../../../../utils/campaign-db-handlers';
import { handleError } from '../../../../utils/error-handlers';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const campaignId = event.pathParameters?.id;
    if (!campaignId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify({ message: 'Missing campaign ID' }),
      };
    }

    const success = await deleteCampaign(campaignId);

    if (!success) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify({ message: 'Campaign not found' }),
      };
    }

    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
      body: JSON.stringify({ message: `Campaign ${campaignId} deleted successfully` }),
    };
  } catch (error) {
    return handleError(error);
  }
};