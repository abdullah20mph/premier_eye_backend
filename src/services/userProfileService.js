"use strict";

const { supabase } = require("@src/config/supabase");
const bcrypt = require("bcryptjs");

const USERS_TABLE = "users";

async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(
      `
        id,
        first_name,
        last_name,
        display_name,
        email,
        created_at,
        updated_at
      `
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

async function updateUserProfile(userId, payload) {
  const update = {
    updated_at: new Date().toISOString(),
  };

  if (payload.display_name !== undefined)
    update.display_name = payload.display_name;

  if (payload.email !== undefined)
    update.email = payload.email;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update(update)
    .eq("id", userId)
    .select(
      `
        id,
        first_name,
        last_name,
        display_name,
        email,
        created_at,
        updated_at
      `
    )
    .single();

  if (error) throw error;
  return data;
}

async function changeUserPassword(userId, currentPassword, newPassword) {
  // Fetch user
  const { data: user, error } = await supabase
    .from(USERS_TABLE)
    .select("id, password_hash")
    .eq("id", userId)
    .single();

  if (error || !user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) {
    const err = new Error("Current password is incorrect");
    err.statusCode = 400;
    throw err;
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from(USERS_TABLE)
    .update({
      password_hash: newHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw updateError;

  return true;
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};
