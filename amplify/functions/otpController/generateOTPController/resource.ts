import { defineFunction } from "@aws-amplify/backend";

export const generateOTPController = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: "GENERATE_OTP_CONTROLLER",
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: "./handler.ts",
  timeoutSeconds: 300 // 5 minute timeout
});
