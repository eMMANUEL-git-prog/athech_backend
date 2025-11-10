import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  let {
    email,
    password,
    role,
    first_name,
    last_name,
    dob,
    gender,
    county,
    club,
    photo_url,
  } = req.body;
  role = role?.toLowerCase();

  try {
    // Check if user exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role]
    );
    const user = userResult.rows[0];

    // If athlete, create athlete profile
    if (role === "athlete") {
      // Generate unique athlete ID (e.g., ATH + timestamp)
      const uniqueAthleteId = `ATH-${uuidv4().slice(0, 8).toUpperCase()}`;

      await pool.query(
        `INSERT INTO athletes 
          (user_id, first_name, last_name, dob, gender, county, club, unique_athlete_id, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          user.id,
          first_name || "",
          last_name || "",
          dob || null,
          gender || null,
          county || null,
          club || null,
          uniqueAthleteId,
          photo_url || null,
        ]
      );
    }

    // Respond with token and base info
    res.status(201).json({
      ...user,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id AS user_id,
        u.email,
        u.role,
        a.id AS athlete_id,
        a.first_name,
        a.last_name,
        a.dob,
        a.gender,
        a.county,
        a.club,
        a.unique_athlete_id,
        a.photo_url,
        a.created_at AS athlete_created_at
      FROM users u
      LEFT JOIN athletes a ON a.user_id = u.id
      WHERE u.id = $1
    `;

    const { rows } = await pool.query(query, [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Shape response cleanly
    const profile = {
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
      athlete:
        user.role === "athlete"
          ? {
              id: user.athlete_id,
              first_name: user.first_name,
              last_name: user.last_name,
              dob: user.dob,
              gender: user.gender,
              county: user.county,
              club: user.club,
              unique_athlete_id: user.unique_athlete_id,
              photo_url: user.photo_url,
              created_at: user.athlete_created_at,
            }
          : null,
    };

    res.json(profile);
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can update profile" });
    }

    const { first_name, last_name, dob, gender, county, club, photo_url } =
      req.body;

    const { rows } = await pool.query(
      `
      UPDATE athletes
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        dob = COALESCE($3, dob),
        gender = COALESCE($4, gender),
        county = COALESCE($5, county),
        club = COALESCE($6, club),
        photo_url = COALESCE($7, photo_url),
        updated_at = NOW()
      WHERE user_id = $8
      RETURNING *
      `,
      [first_name, last_name, dob, gender, county, club, photo_url, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    res.json({
      message: "Profile updated successfully",
      athlete: rows[0],
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
