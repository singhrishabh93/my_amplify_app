import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  OTPRecord: a
    .model({
      phoneNumber: a.string().required(),
      otp: a.string().required(),
      expiresAt: a.integer().required(),
      ttl: a.integer().required(),
      verified: a.boolean(),
      attempts: a.integer(),
    })
    .identifier(["phoneNumber"])
    .authorization((allow) => [allow.guest()]),
  UserInfo: a
    .model({
      userId: a.string().required(),
      userFullName: a.string().required(),
      userWhatsAppNumber: a.string().required(),
      userStatus: a.enum(["NEW", "ONBOARDED", "INACTIVE"]),
    })
    .identifier(["userId"])
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
