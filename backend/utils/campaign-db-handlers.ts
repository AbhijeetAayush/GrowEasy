import { saveItem } from './aws-lib/ddb-utils';
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