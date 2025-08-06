// src/services/ProfileService.ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export class ProfileService {
  static async getProfile(id: string) {
    try {
      const { data } = await client.models.Profile.get({ id });
      return data;
    } catch (error: any) {
      // If profile doesn't exist, return null instead of throwing
      if (error.message && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  static async createProfile(id: string, email: string) {
    // Set default values for new fields as needed
    const { data } = await client.models.Profile.create({
      id,
      email,
      user_name: "",
      dietary_preferences: "",
      period_plan: "",
      milk_allergy: false,
      eggs_allergy: false,
      peanuts_allergy: false,
      tree_nuts_allergy: false,
      shellfish_allergy: false,
      other_allergies: "",
      session_data: "",
    });
    return data;
  }

  static async updateProfile(profile: Partial<Schema["Profile"]["type"]> & { id: string }) {
    // Only update allowed fields (no email, and id is only used as identifier)
    const {
      id,
      user_name,
      dietary_preferences,
      period_plan,
      milk_allergy,
      eggs_allergy,
      peanuts_allergy,
      tree_nuts_allergy,
      shellfish_allergy,
      other_allergies,
      session_data,
    } = profile;
    const input = {
      id, // used as identifier, not editable
      user_name,
      dietary_preferences,
      period_plan,
      milk_allergy,
      eggs_allergy,
      peanuts_allergy,
      tree_nuts_allergy,
      shellfish_allergy,
      other_allergies,
      session_data,
    };
    const { data } = await client.models.Profile.update(input);
    return data;
  }

  static async ensureProfileExists(user: { userId: string; signInDetails?: { loginId?: string } }) {
    const id = user.userId;
    const email = user.signInDetails?.loginId ?? "";
    let profile = await this.getProfile(id);
    if (!profile) {
      profile = await this.createProfile(id, email);
    }
    return profile;
  }
}
