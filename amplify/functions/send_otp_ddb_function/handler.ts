import type { DynamoDBStreamEvent } from "aws-lambda";
import { Amplify } from "aws-amplify";
import axios from "axios";

console.log("[OTP_SENDER] Loading function...");
console.log("[OTP_SENDER] Loading Amplify configuration...");
import outputs from "../../../amplify_outputs.json";
Amplify.configure(outputs);

//NOTE : Use axios client instead of raw axios request
// Add a test Number to get free otp
// Make an OTP Service to generate and Send OTP and also add check for test user and non test user

export const handler = async (event: DynamoDBStreamEvent) => {
  try {
    console.log("[OTP_SENDER] Processing records:", {
      count: event.Records.length,
      timestamp: new Date().toISOString()
    });

    for (const record of event.Records) {
      if (record.eventName === "INSERT") {
        const phoneNumber = record.dynamodb?.NewImage?.phoneNumber?.S;
        const otp = record.dynamodb?.NewImage?.otp?.S;
        
        // TTL is 5 minutes
        const TIME_TO_LIVE = process.env.TIME_TO_LIVE
          ? parseInt(process.env.TIME_TO_LIVE, 10)
          : 300000;

        console.log("[OTP_SENDER] Processing record:", {
          phoneNumber,
          otpLength: otp?.length,
          ttl: TIME_TO_LIVE
        });

        if (!phoneNumber || !otp) {
          console.error("[OTP_SENDER] Missing required fields:", {
            hasPhone: !!phoneNumber,
            hasOTP: !!otp,
            timestamp: new Date().toISOString()
          });
          throw new Error(`[OTP_SENDER] Missing Required Fields \n 
            phoneNumber: ${phoneNumber} \n
            otp: ${otp}`);
        }

        // Sanitize phone number - remove spaces and any non-numeric characters
        const sanitizedPhone = phoneNumber.replace(/\D/g, "");

        console.log("[OTP_SENDER] Sending OTP request:", {
          originalPhone: phoneNumber,
          sanitizedPhone,
          timestamp: new Date().toISOString()
        });

        try {
          // Prepare request data
          const requestData = {
            route: "otp",
            numbers: sanitizedPhone,
            variables_values: otp,
          };

          console.log("[OTP_SENDER] Request payload:", {
            ...requestData,
            apiEndpoint: "https://www.fast2sms.com/dev/bulkV2"
          });

          const response = await axios({
            method: 'get',  // Note: Changed to GET as parameters are in query string
            url: buildAuthKeyURL(phoneNumber, otp),
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000  // Maintaining the 10s timeout
        });

          console.log("[OTP_SENDER] SMS API Response:", {
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString()
          });

          if (response.status !== 200 || !response.data.return) {
            throw new Error(`API returned unsuccessful status: ${JSON.stringify(response.data)}`);
          }

        } catch (apiError: any) {
          console.error("[OTP_SENDER] API Request Failed:", {
            error: apiError,
            errorType: apiError instanceof Error ? apiError.constructor.name : "Unknown",
            errorMessage: apiError instanceof Error ? apiError.message : "Unknown error",
            response: apiError.response?.data,
            status: apiError.response?.status,
            timestamp: new Date().toISOString()
          });

          // Check if we should retry based on error type
          if (apiError.response?.status === 429 || apiError.code === 'ECONNABORTED') {
            // These errors might be retryable
            throw apiError; // Let AWS retry the lambda
          }

          // For other errors, log but don't retry
          console.warn("[OTP_SENDER] Non-retryable error encountered:", {
            phone: sanitizedPhone,
            errorType: apiError.response?.status || apiError.code
          });
        }
      }
    }
  } catch (error) {
    console.error("[OTP_SENDER_ERROR] Unhandled Error:", {
      error,
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      stackTrace: error instanceof Error ? error.stack : undefined
    });
    throw error; // Rethrow to trigger Lambda retry
  }
};

const buildAuthKeyURL = (recipientMobile: string, otp: string): string => {
  const params = new URLSearchParams({
      authkey: process.env.AUTHKEY_API_KEY || '864c013b495c69b6',
      mobile: recipientMobile,
      country_code: '91',
      sid: '16026',
      company: 'MONOVA.IN',
      otp: otp
  });

  return `https://api.authkey.io/request?${params.toString()}`;
};