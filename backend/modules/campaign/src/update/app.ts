import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { updateCampaign } from '../../../../utils/campaign-db-handlers';
import { handleError } from '../../../../utils/error-handlers';
import { Campaign } from '../../../../types/model';


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

    const body = JSON.parse(event.body || '{}') as Partial<Campaign>;
    const { name, description, status, leads, accountIDs } = body;

    
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify({ message: 'Invalid status. Must be ACTIVE or INACTIVE' }),
      };
    }

    
    const updateData: Partial<Campaign> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (leads !== undefined) updateData.leads = leads;
    if (accountIDs !== undefined) updateData.accountIDs = accountIDs;

    const updatedCampaign = await updateCampaign(campaignId, updateData);

    if (!updatedCampaign) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify({ message: 'Campaign not found or deleted' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
      body: JSON.stringify({ message: `Campaign ${campaignId} updated successfully` }),
    };
  } catch (error) {
    return handleError(error);
  }
};