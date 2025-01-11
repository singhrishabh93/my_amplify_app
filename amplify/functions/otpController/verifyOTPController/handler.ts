import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../../data/resource";
import type { APIGatewayProxyHandler } from "aws-lambda";
import outputs from "../../../../amplify_outputs.json"
import { Amplify } from "aws-amplify";
Amplify.configure(outputs);

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    console.log('[OTP_VERIFIER] Processing request:', {
      requestId: context.awsRequestId,
      phoneNumber: event.queryStringParameters?.phoneNumber
    });

    const { phoneNumber, otp } = event.queryStringParameters || {};

    if (!phoneNumber || !otp) {
      console.log('[OTP_VERIFIER] Missing parameters:', { phoneNumber, otp });
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Phone number and OTP are required" })
      };
    }

    const client = generateClient<Schema>();
    const record = await client.models.OTPRecord.get({ phoneNumber });

    if (!record?.data) {
      console.log('[OTP_VERIFIER] No OTP record found:', { phoneNumber });
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No OTP found for this number" })
      };
    }

    const otpRecord = record.data;
    console.log('[OTP_VERIFIER] OTP record found:', { 
      phoneNumber,
      expiresAt: otpRecord.expiresAt,
      attempts: otpRecord.attempts
    });

    if (Date.now() > otpRecord.expiresAt) {
      console.log('[OTP_VERIFIER] OTP expired:', { phoneNumber });
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "OTP has expired" })
      };
    }

    if (otpRecord.otp !== otp) {
      console.log('[OTP_VERIFIER] Invalid OTP attempt:', { phoneNumber });
      await client.models.OTPRecord.update({
        phoneNumber,
        attempts: (otpRecord.attempts || 0) + 1
      });

      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid OTP" })
      };
    }

    console.log('[OTP_VERIFIER] OTP verified, updating records:', { phoneNumber });
    await client.models.OTPRecord.update({
      phoneNumber,
      verified: true
    });

    await client.models.UserInfo.create({
      userId: phoneNumber,
      userWhatsAppNumber: phoneNumber,
      userFullName: "OTP Verified User",
      userStatus: "NEW"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "OTP verified successfully",
        userId: phoneNumber 
      })
    };
  } catch (error) {
    console.error('[OTP_VERIFIER_ERROR] Unhandled Error:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      requestId: context.awsRequestId,
      timestamp: new Date().toISOString()
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Internal server error",
        requestId: context.awsRequestId
      })
    };
  }
};