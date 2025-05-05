import { saveItem, getItem, queryItems } from './aws-lib/ddb-utils';
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