import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCampaign, listCampaigns } from '../../../../utils/campaign-db-handlers';
import { handleError } from '../../../../utils/error-handlers';
import { Campaign } from '../../../../types/model';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path;
    const campaignId = event.pathParameters?.id;

    
    if (path === '/campaigns' && !campaignId) {
      const campaigns = await listCampaigns();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify(campaigns),
      };
    }

    
    if (campaignId) {
      const campaign = await getCampaign(campaignId);
      if (!campaign || campaign.status === 'DELETED') {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
          body: JSON.stringify({ message: 'Campaign not found' }),
        };
      }
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify(campaign),
      };
    }

    
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
      body: JSON.stringify({ message: 'Invalid path' }),
    };
  } catch (error) {
    return handleError(error);
  }
};