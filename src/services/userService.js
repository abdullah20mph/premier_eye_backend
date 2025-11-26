// src/services/userService.js
"use strict";

const bcrypt = require("bcryptjs");
const { supabase } = require("@src/config/supabase");

const USERS_TABLE = "users";

function serializeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    created_at: row.created_at,
  };
}

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("*")
    .eq("email", email)
    .single();

  // PGRST116 = no rows found
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data || null;
}

async function createUser({ firstName, lastName, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("Email already in use");
    err.code = "EMAIL_TAKEN";
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const e = new Error("Email already in use");
      e.code = "EMAIL_TAKEN";
      throw e;
    }
    throw error;
  }

  return serializeUser(data);
}

async function verifyPassword(userRow, password) {
  return bcrypt.compare(password, userRow.password_hash);
}

module.exports = {
  serializeUser,
  findUserByEmail,
  createUser,
  verifyPassword,
};
