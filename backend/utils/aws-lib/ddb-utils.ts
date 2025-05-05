import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
  UpdateCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

type AllowedItems = Record<string, any>;

export const saveItem = async <T extends AllowedItems>(
  tableName: string,
  item: T
): Promise<PutCommandOutput> => {
  try {
    return await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
  } catch (error) {
    console.error("Error saving item to DynamoDB:", error);
    throw error;
  }
};

export const getItem = async (
  tableName: string,
  key: { PK: string; SK: string }
): Promise<GetCommandOutput> => {
  try {
    return await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Error fetching item from DynamoDB:", error);
    throw error;
  }
};

export const updateItem = async (params: {
  tableName: string;
  key: { PK: string; SK: string };
  updateExpression: string;
  expressionAttributeValues: Record<string, any>;
  expressionAttributeNames?: Record<string, string>;
}): Promise<UpdateCommandOutput> => {
  const { tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames } =
    params;

  try {
    return await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW",
      })
    );
  } catch (error) {
    console.error("Error updating item in DynamoDB:", error);
    throw error;
  }
};

export const queryItems = async (options: {
  tableName: string;
  indexName?: string;
  keyConditionExpression: string;
  expressionAttributeValues: { [key: string]: any };
  expressionAttributeNames?: { [key: string]: string };
  filterExpression?: string;
  limit?: number;
  exclusiveStartKey?: any;
}): Promise<{ items: any[]; lastEvaluatedKey?: any }> => {
  const {
    tableName,
    indexName,
    keyConditionExpression,
    expressionAttributeValues,
    expressionAttributeNames,
    filterExpression,
    limit,
    exclusiveStartKey,
  } = options;

  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      FilterExpression: filterExpression,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey,
    });

    const result = await docClient.send(command);
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error("Error querying items from DynamoDB:", error);
    throw error;
  }
};

export const addRecordToTableBatch = async (
  params: BatchWriteCommandInput
): Promise<BatchWriteCommandOutput> => {
  try {
    console.log("Batch Write Input -->", JSON.stringify({ params }, null, 2));
    const command = new BatchWriteCommand(params);
    return await docClient.send(command);
  } catch (error) {
    console.error("Error performing batch write to DynamoDB:", error);
    throw error;
  }
};

export const deleteRecordFromTable = async (
  params: DeleteCommandInput
): Promise<DeleteCommandOutput> => {
  try {
    console.log("Delete Input -->", JSON.stringify({ params }, null, 2));
    const command = new DeleteCommand(params);
    return await docClient.send(command);
  } catch (error) {
    console.error("Error deleting item from DynamoDB:", error);
    throw error;
  }
};