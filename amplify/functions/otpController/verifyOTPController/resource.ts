import { defineFunction } from "@aws-amplify/backend";

export const verifyOTPController = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: "VERIFY_OTP_CONTROLLER",
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: "./handler.ts",
  timeoutSeconds: 300 // 5 minute timeout
});
