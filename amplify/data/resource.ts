import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Profile: a
    .model({
      id: a.id().required(),
      user_name: a.string(),
      email: a.email(),
      dietary_preferences: a.string(),
      period_plan: a.string(),
      milk_allergy: a.boolean().default(false),
      eggs_allergy: a.boolean().default(false),
      peanuts_allergy: a.boolean().default(false),
      tree_nuts_allergy: a.boolean().default(false),
      shellfish_allergy: a.boolean().default(false),
      other_allergies: a.string(),
      session_data: a.string(), // JSONB equivalent in Amplify
      // Remove created_at and updated_at, Amplify adds these automatically
    })
    .authorization(allow => [allow.owner()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
});