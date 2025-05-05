import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createCampaign } from '../../../../utils/campaign-db-handlers';
import { handleError } from '../../../../utils/error-handlers';
import { Campaign } from '../../../../types/model';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}') as Partial<Campaign>;
    const { name, description, status = 'ACTIVE', leads = [], accountIDs = [] } = body;

    if (!name || !description) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify({ message: 'Missing required fields: name, description' }),
      };
    }

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
        body: JSON.stringify({ message: 'Invalid status. Must be ACTIVE or INACTIVE' }),
      };
    }

    const campaign: Campaign = {
      id: uuidv4(),
      name,
      description,
      status,
      leads,
      accountIDs,
    };

    await createCampaign(campaign);

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' },
      body: JSON.stringify(campaign),
    };
  } catch (error) {
    return handleError(error);
  }
};