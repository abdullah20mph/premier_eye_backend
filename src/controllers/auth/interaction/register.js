"use strict";

const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { validate } = require("@src/middleware");
const { supabase } = require("@src/config/supabase");
const { response } = require("@src/utils");

const CONTROLLER = [
  validate({
    body: Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      displayName: Joi.string().allow(null).optional(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    }),
  }),

  async function userRegisterController(req, res) {
    try {
      const { firstName, lastName, displayName, email, password } = req.body;

      // check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        return response.send(0, 400, "Email already exists", null, res);
      }

      const password_hash = await bcrypt.hash(password, 10);

      const { data: user, error } = await supabase
        .from("users")
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            display_name:
              !displayName || displayName.trim().length === 0
                ? `${firstName} ${lastName}` // Default fallback
                : displayName.trim(),
            email,
            password_hash,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return response.send(
        1,
        201,
        "User registered successfully",
        {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            displayName: user.display_name,
            email: user.email,
            createdAt: user.created_at,
          },
        },
        res
      );
    } catch (err) {
      console.error(err);
      return response.send(0, 500, "Registration failed", null, res, err);
    }
  },
];

module.exports = CONTROLLER;


/**
 * @swagger
 * /auth/interaction/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               display_name:
 *                 type: string
 *                 example: Johnny
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 *       500:
 *         description: Internal server error
 */
