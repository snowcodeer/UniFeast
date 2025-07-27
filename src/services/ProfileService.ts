// src/services/ProfileService.ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export class ProfileService {
  static async getProfile(id: string) {
    const { data } = await client.models.Profile.get({ id });
    return data;
  }

  static async createProfile(id: string, email: string) {
    // Set default values for new fields as needed
    const { data } = await client.models.Profile.create({
      id,
      email,
      userIdentity: "student",
      userName: "",
      dietaryPreferences: "",
      periodPlan: "",
      milkAllergy: false,
      eggsAllergy: false,
      peanutsAllergy: false,
      treeNutsAllergy: false,
      shellfishAllergy: false,
      otherAllergens: "",
    });
    return data;
  }

  static async updateProfile(profile: Partial<Schema["Profile"]["type"]> & { id: string }) {
    // Only update allowed fields (no email, and id is only used as identifier)
    const {
      id,
      userName,
      userIdentity,
      dietaryPreferences,
      periodPlan,
      milkAllergy,
      eggsAllergy,
      peanutsAllergy,
      treeNutsAllergy,
      shellfishAllergy,
      otherAllergens,
    } = profile;
    const input = {
      id, // used as identifier, not editable
      userName,
      userIdentity,
      dietaryPreferences,
      periodPlan,
      milkAllergy,
      eggsAllergy,
      peanutsAllergy,
      treeNutsAllergy,
      shellfishAllergy,
      otherAllergens,
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
