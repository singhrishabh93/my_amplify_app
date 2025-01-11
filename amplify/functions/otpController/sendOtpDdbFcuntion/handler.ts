import { SNS } from 'aws-sdk';
import type { DynamoDBStreamEvent } from "aws-lambda";
import outputs from "../../../../amplify_outputs.json"
import { Amplify } from "aws-amplify";
Amplify.configure(outputs);

const sns = new SNS();

export const handler = async (event: DynamoDBStreamEvent) => {
  try {
    console.log('[OTP_SENDER] Processing records:', {
      count: event.Records.length,
    });

    for (const record of event.Records) {
      if (record.eventName === 'INSERT') {
        const phoneNumber = record.dynamodb?.NewImage?.phoneNumber?.S;
        const otp = record.dynamodb?.NewImage?.otp?.S;

        if (phoneNumber && otp) {
          await sns.publish({
            PhoneNumber: phoneNumber,
            Message: `Your OTP is: ${otp}. Valid for 2 minutes.`
          }).promise();
          
          console.log('[OTP_SENDER] SMS sent:', {
            phoneNumber,
          });
        }
      }
    }
  } catch (error) {
    console.error('[OTP_SENDER_ERROR] Unhandled Error:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};