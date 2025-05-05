import { saveItem, getItem, queryItems, updateItem } from './aws-lib/ddb-utils';
import { Campaign } from '../types/model';

export const createCampaign = async (campaign: Campaign): Promise<void> => {
  const tableName = process.env.TABLE_NAME || '';
  const item = {
    PK: `CAMPAIGN#${campaign.id}`,
    SK: '#DATA',
    GSI1PK: `STATUS#${campaign.status}`,
    GSI1SK: `CAMPAIGN#${campaign.id}`,
    name: campaign.name,
    description: campaign.description,
    status: campaign.status,
    leads: campaign.leads,
    accountIDs: campaign.accountIDs,
  };

  await saveItem(tableName, item);
};

export const listCampaigns = async (): Promise<Campaign[]> => {
  const tableName = process.env.TABLE_NAME || '';
  const statuses = ['ACTIVE', 'INACTIVE'];

  let allCampaigns: Campaign[] = [];

  for (const status of statuses) {
    const result = await queryItems({
      tableName,
      indexName: 'StatusIndex',
      keyConditionExpression: 'GSI1PK = :status',
      expressionAttributeValues: {
        ':status': `STATUS#${status}`,
      },
    });

    allCampaigns = allCampaigns.concat(
      result.items.map((item) => ({
        id: item.PK.replace('CAMPAIGN#', ''),
        name: item.name,
        description: item.description,
        status: item.status,
        leads: item.leads,
        accountIDs: item.accountIDs,
      }))
    );
  }

  return allCampaigns;
};

export const getCampaign = async (id: string): Promise<Campaign | null> => {
  const tableName = process.env.TABLE_NAME || '';
  const result = await getItem(tableName, {
    PK: `CAMPAIGN#${id}`,
    SK: '#DATA',
  });

  if (!result.Item) {
    return null;
  }

  return {
    id,
    name: result.Item.name,
    description: result.Item.description,
    status: result.Item.status,
    leads: result.Item.leads,
    accountIDs: result.Item.accountIDs,
  };
};

export const updateCampaign = async (id: string, updateData: Partial<Campaign>): Promise<Campaign | null> => {
  const tableName = process.env.TABLE_NAME || '';
  
  
  const existingCampaign = await getItem(tableName, {
    PK: `CAMPAIGN#${id}`,
    SK: '#DATA',
  });

  if (!existingCampaign.Item || existingCampaign.Item.status === 'DELETED') {
    return null;
  }

  
  const updateExpressionParts: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  if (updateData.name !== undefined) {
    updateExpressionParts.push('#name = :name');
    expressionAttributeValues[':name'] = updateData.name;
    expressionAttributeNames['#name'] = 'name';
  }
  if (updateData.description !== undefined) {
    updateExpressionParts.push('#description = :description');
    expressionAttributeValues[':description'] = updateData.description;
    expressionAttributeNames['#description'] = 'description';
  }
  if (updateData.status !== undefined) {
    updateExpressionParts.push('#status = :status', 'GSI1PK = :gsi1pk', 'GSI1SK = :gsi1sk');
    expressionAttributeValues[':status'] = updateData.status;
    expressionAttributeValues[':gsi1pk'] = `STATUS#${updateData.status}`;
    expressionAttributeValues[':gsi1sk'] = `CAMPAIGN#${id}`;
    expressionAttributeNames['#status'] = 'status';
  }
  if (updateData.leads !== undefined) {
    updateExpressionParts.push('#leads = :leads');
    expressionAttributeValues[':leads'] = updateData.leads;
    expressionAttributeNames['#leads'] = 'leads';
  }
  if (updateData.accountIDs !== undefined) {
    updateExpressionParts.push('#accountIDs = :accountIDs');
    expressionAttributeValues[':accountIDs'] = updateData.accountIDs;
    expressionAttributeNames['#accountIDs'] = 'accountIDs';
  }

  if (updateExpressionParts.length === 0) {
    return existingCampaign.Item as Campaign;
  }

  const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

  const result = await updateItem({
    tableName,
    key: {
      PK: `CAMPAIGN#${id}`,
      SK: '#DATA',
    },
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames,
  });

  return {
    id,
    name: result.Attributes?.name,
    description: result.Attributes?.description,
    status: result.Attributes?.status,
    leads: result.Attributes?.leads,
    accountIDs: result.Attributes?.accountIDs,
  };
};