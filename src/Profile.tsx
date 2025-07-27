// src/Profile.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react-native";

const client = generateClient<Schema>();

const DIETARY_OPTIONS = [
  "Halal",
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Kosher",
  "Dairy-Free",
  "Nut-Free",
];

const MAIN_5_ALLERGENS = [
  { key: "milkAllergy", label: "Milk" },
  { key: "eggsAllergy", label: "Eggs" },
  { key: "peanutsAllergy", label: "Peanuts" },
  { key: "treeNutsAllergy", label: "Tree nuts" },
  { key: "shellfishAllergy", label: "Shellfish" },
];
const EXTRA_ALLERGENS = [
  { key: "celery", label: "Celery" },
  { key: "gluten", label: "Cereals containing gluten" },
  { key: "crustaceans", label: "Crustaceans" },
  { key: "fish", label: "Fish" },
  { key: "lupin", label: "Lupin" },
  { key: "molluscs", label: "Molluscs" },
  { key: "mustard", label: "Mustard" },
  { key: "sesame", label: "Sesame seeds" },
  { key: "soybeans", label: "Soybeans" },
  { key: "sulphites", label: "Sulphur dioxide and sulphites" },
];
const ALL_ALLERGENS = [
  { key: "milkAllergy", label: "Milk" },
  { key: "eggsAllergy", label: "Eggs" },
  { key: "peanutsAllergy", label: "Peanuts" },
  { key: "treeNutsAllergy", label: "Tree nuts" },
  { key: "shellfishAllergy", label: "Shellfish" },
  { key: "celery", label: "Celery" },
  { key: "gluten", label: "Cereals containing gluten" },
  { key: "crustaceans", label: "Crustaceans" },
  { key: "fish", label: "Fish" },
  { key: "lupin", label: "Lupin" },
  { key: "molluscs", label: "Molluscs" },
  { key: "mustard", label: "Mustard" },
  { key: "sesame", label: "Sesame seeds" },
  { key: "soybeans", label: "Soybeans" },
  { key: "sulphites", label: "Sulphur dioxide and sulphites" },
];

const defaultProfile = {
  userIdentity: "student",
  userName: "",
  dietaryPreferences: [] as string[],
  periodPlan: "",
  milkAllergy: false,
  eggsAllergy: false,
  peanutsAllergy: false,
  treeNutsAllergy: false,
  shellfishAllergy: false,
  otherAllergens: "",
};

const Profile = () => {
  const { user } = useAuthenticator();
  const [profile, setProfile] = useState<Schema["Profile"]["type"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({ ...defaultProfile });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const { data } = await client.models.Profile.get({ id: user.userId });
        if (data) {
          setProfile(data);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    };
    fetchProfile();
  }, [user]);

  // When entering edit mode, prefill form with current profile
  useEffect(() => {
    if (editing && profile) {
      // Handle main 5 allergens as booleans
      const mainAllergens = MAIN_5_ALLERGENS.reduce((acc, a) => {
        acc[a.key] = !!(profile as any)[a.key];
        return acc;
      }, {} as Record<string, boolean>);
      
      // Handle extra allergens from otherAllergens string
      const extraAllergens = EXTRA_ALLERGENS.reduce((acc, a) => {
        acc[a.key] = profile.otherAllergens?.includes(a.label) || false;
        return acc;
      }, {} as Record<string, boolean>);
      
      setForm({
        userIdentity: profile.userIdentity ?? "student",
        userName: profile.userName ?? "",
        dietaryPreferences: profile.dietaryPreferences
          ? profile.dietaryPreferences.split(",").filter(Boolean)
          : [],
        periodPlan: profile.periodPlan ?? "",
        ...mainAllergens,
        ...extraAllergens,
      });
    }
  }, [editing, profile]);

  const handleCreate = async () => {
    try {
      const { ...formFields } = form;
      
      // Collect extra allergens that are toggled on
      const otherAllergens = EXTRA_ALLERGENS
        .filter(allergen => formFields[allergen.key])
        .map(allergen => allergen.label)
        .join(",");
      
      const { data: created, errors } = await client.models.Profile.create({
        id: user.userId,
        email: formFields.email ?? user.signInDetails?.loginId ?? "",
        userName: formFields.userName,
        userIdentity: formFields.userIdentity as "student" | "staff" | "visitor",
        dietaryPreferences: formFields.dietaryPreferences.join(","),
        periodPlan: formFields.periodPlan,
        milkAllergy: formFields.milkAllergy,
        eggsAllergy: formFields.eggsAllergy,
        peanutsAllergy: formFields.peanutsAllergy,
        treeNutsAllergy: formFields.treeNutsAllergy,
        shellfishAllergy: formFields.shellfishAllergy,
        otherAllergens,
      });
      if (errors && errors.length > 0) {
        setError(errors.map(e => e.message).join(", "));
      } else {
        setProfile(created);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  const handleUpdate = async () => {
    try {
      const { ...formFields } = form;
      
      // Collect extra allergens that are toggled on
      const otherAllergens = EXTRA_ALLERGENS
        .filter(allergen => formFields[allergen.key])
        .map(allergen => allergen.label)
        .join(",");
      
      const { data: updated, errors } = await client.models.Profile.update({
        id: user.userId,
        userName: formFields.userName,
        userIdentity: formFields.userIdentity as "student" | "staff" | "visitor",
        dietaryPreferences: formFields.dietaryPreferences.join(","),
        periodPlan: formFields.periodPlan,
        milkAllergy: formFields.milkAllergy,
        eggsAllergy: formFields.eggsAllergy,
        peanutsAllergy: formFields.peanutsAllergy,
        treeNutsAllergy: formFields.treeNutsAllergy,
        shellfishAllergy: formFields.shellfishAllergy,
        otherAllergens,
      });
      if (errors && errors.length > 0) {
        setError(errors.map(e => e.message).join(", "));
      } else {
        setProfile(updated);
        setEditing(false);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  const toggleDietary = (option: string) => {
    setForm(f => {
      const selected = f.dietaryPreferences.includes(option)
        ? f.dietaryPreferences.filter((o: string) => o !== option)
        : [...f.dietaryPreferences, option];
      return { ...f, dietaryPreferences: selected };
    });
  };

  const toggleAllergen = (key: string) => {
    setForm(f => ({ ...f, [key]: !f[key] }));
  };

  if (error) return <Text>Error: {error}</Text>;
  if (!profile) {
    // Show form to create profile
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>Create Your Profile</Text>
        <Text>User Name:</Text>
        <TextInput
          value={form.userName}
          onChangeText={v => setForm(f => ({ ...f, userName: v }))}
          style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        />
        <Text>User Identity:</Text>
        <View style={{ borderWidth: 1, marginBottom: 8 }}>
          <Picker
            selectedValue={form.userIdentity}
            onValueChange={v => setForm(f => ({ ...f, userIdentity: v }))}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Staff" value="staff" />
            <Picker.Item label="Visitor" value="visitor" />
          </Picker>
        </View>
        <Text>Dietary Preferences (multi-select):</Text>
        {DIETARY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
            onPress={() => toggleDietary(option)}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: "#333",
                marginRight: 8,
                backgroundColor: form.dietaryPreferences.includes(option) ? "#333" : "#fff",
              }}
            />
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
        <Text>Period Plan:</Text>
        <TextInput
          value={form.periodPlan}
          onChangeText={v => setForm(f => ({ ...f, periodPlan: v }))}
          style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        />
        <Text style={{ marginTop: 12, fontWeight: "bold" }}>Allergies (toggle):</Text>
        {ALL_ALLERGENS.map(allergen => (
          <View key={allergen.key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Switch
              value={!!form[allergen.key]}
              onValueChange={() => toggleAllergen(allergen.key)}
            />
            <Text style={{ marginLeft: 8 }}>{allergen.label}</Text>
          </View>
        ))}
        <Button title="Create Profile" onPress={handleCreate} />
      </ScrollView>
    );
  }

  // Edit mode
  if (editing) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>Edit Profile</Text>
        <Text>User Name:</Text>
        <TextInput
          value={form.userName}
          onChangeText={v => setForm(f => ({ ...f, userName: v }))}
          style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        />
        <Text>User Identity:</Text>
        <View style={{ borderWidth: 1, marginBottom: 8 }}>
          <Picker
            selectedValue={form.userIdentity}
            onValueChange={v => setForm(f => ({ ...f, userIdentity: v }))}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Staff" value="staff" />
            <Picker.Item label="Visitor" value="visitor" />
          </Picker>
        </View>
        <Text>Dietary Preferences (multi-select):</Text>
        {DIETARY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
            onPress={() => toggleDietary(option)}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: "#333",
                marginRight: 8,
                backgroundColor: form.dietaryPreferences.includes(option) ? "#333" : "#fff",
              }}
            />
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
        <Text>Period Plan:</Text>
        <TextInput
          value={form.periodPlan}
          onChangeText={v => setForm(f => ({ ...f, periodPlan: v }))}
          style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        />
        <Text style={{ marginTop: 12, fontWeight: "bold" }}>Allergies (toggle):</Text>
        {ALL_ALLERGENS.map(allergen => (
          <View key={allergen.key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Switch
              value={!!form[allergen.key]}
              onValueChange={() => toggleAllergen(allergen.key)}
            />
            <Text style={{ marginLeft: 8 }}>{allergen.label}</Text>
          </View>
        ))}
        <Button title="Save" onPress={handleUpdate} />
        <Button title="Cancel" onPress={() => setEditing(false)} color="gray" />
      </ScrollView>
    );
  }

  // Show profile if it exists
  return (
    <View style={{ padding: 16 }}>
      <Text>Email: {profile.email ?? "N/A"}</Text>
      <Text>User Name: {profile.userName ?? "N/A"}</Text>
      <Text>User Identity: {profile.userIdentity ?? "N/A"}</Text>
      <Text>
        Dietary Preferences:{" "}
        {profile.dietaryPreferences
          ? profile.dietaryPreferences.split(",").filter(Boolean).join(", ")
          : "None"}
      </Text>
      <Text>Period Plan: {profile.periodPlan ?? "N/A"}</Text>
      <Text style={{ marginTop: 12, fontWeight: "bold" }}>Allergies:</Text>
      <Text>
        {[
          ...MAIN_5_ALLERGENS.filter(a => (profile as any)[a.key]).map(a => a.label),
          ...(profile.otherAllergens ? profile.otherAllergens.split(",").filter(Boolean) : [])
        ].join(", ") || "None"}
      </Text>
      <Button title="Edit Profile" onPress={() => setEditing(true)} />
    </View>
  );
};

export default Profile;
