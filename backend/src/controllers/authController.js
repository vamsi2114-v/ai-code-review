const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const r = await pool.query('INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email,created_at', [name, email, hashed]);
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!r.rows[0]) return res.status(401).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getMe = async (req, res) => {
  try {
    const r = await pool.query('SELECT id,name,email,bio,avatar_url,created_at FROM users WHERE id=$1', [req.user.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const r = await pool.query('UPDATE users SET name=$1,bio=$2,updated_at=NOW() WHERE id=$3 RETURNING id,name,email,bio,avatar_url', [name, bio, req.user.id]);
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const r = await pool.query('SELECT password FROM users WHERE id=$1', [req.user.id]);
    if (!await bcrypt.compare(currentPassword, r.rows[0].password)) return res.status(400).json({ error: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
