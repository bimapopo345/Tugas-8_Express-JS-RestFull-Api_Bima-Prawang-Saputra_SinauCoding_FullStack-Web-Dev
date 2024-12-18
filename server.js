// server.js

const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Konfigurasi lingkungan
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Inisialisasi Database SQLite
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Tidak dapat terhubung ke database", err);
  } else {
    console.log("Terhubung ke database SQLite");
  }
});

// Membuat Tabel jika belum ada
db.serialize(() => {
  // Tabel Users
  db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT UNIQUE,
        name TEXT
    )`);

  // Tabel Restaurants
  db.run(`CREATE TABLE IF NOT EXISTS Restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        phone TEXT
    )`);

  // Tabel Reservations
  db.run(`CREATE TABLE IF NOT EXISTS Reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        restaurant_id INTEGER,
        reservation_time TEXT,
        number_of_people INTEGER,
        FOREIGN KEY(user_id) REFERENCES Users(id),
        FOREIGN KEY(restaurant_id) REFERENCES Restaurants(id)
    )`);
});

// Middleware untuk memverifikasi token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({ message: "Token tidak ditemukan" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = user;
    next();
  });
}

// ===== Rute RESTful API =====

// 1. Register User
app.post("/register", (req, res) => {
  const { username, password, email, name } = req.body;

  if (!username || !password || !email || !name) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `INSERT INTO Users (username, password, email, name) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, hashedPassword, email, name], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res
          .status(400)
          .json({ message: "Username atau email sudah digunakan" });
      }
      return res.status(500).json({ message: "Server error" });
    }
    res
      .status(201)
      .json({ message: "User berhasil terdaftar", userId: this.lastID });
  });
});

// 2. Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM Users WHERE username = ?`;
  db.get(query, [username], (err, user) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user) return res.status(400).json({ message: "User tidak ditemukan" });

    // Verifikasi password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Password salah" });

    // Buat JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login berhasil", token });
  });
});

// 3. Get User Profile
app.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `SELECT id, username, email, name FROM Users WHERE id = ?`;
  db.get(query, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(user);
  });
});

// 4. Update User Profile
app.put("/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { email, name, password } = req.body;

  // Optional: Hash new password if provided
  let hashedPassword = null;
  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }

  // Update query
  let query = `UPDATE Users SET email = ?, name = ?`;
  let params = [email, name];

  if (hashedPassword) {
    query += `, password = ?`;
    params.push(hashedPassword);
  }

  query += ` WHERE id = ?`;
  params.push(userId);

  db.run(query, params, function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Profil berhasil diperbarui" });
  });
});

// 5. Get List of Restaurants
app.get("/restaurants", (req, res) => {
  const query = `SELECT * FROM Restaurants`;
  db.all(query, [], (err, restaurants) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(restaurants);
  });
});

// 6. Add a Restaurant (Opsional)
app.post("/restaurants", authenticateToken, (req, res) => {
  const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  const query = `INSERT INTO Restaurants (name, address, phone) VALUES (?, ?, ?)`;
  db.run(query, [name, address, phone], function (err) {
    if (err) return res.status(500).json({ message: "Server error" });
    res
      .status(201)
      .json({
        message: "Restoran berhasil ditambahkan",
        restaurantId: this.lastID,
      });
  });
});

// 7. Make a Reservation
app.post("/reservations", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { restaurant_id, reservation_time, number_of_people } = req.body;

  if (!restaurant_id || !reservation_time || !number_of_people) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  // Validasi apakah restoran ada
  const checkRestaurant = `SELECT * FROM Restaurants WHERE id = ?`;
  db.get(checkRestaurant, [restaurant_id], (err, restaurant) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!restaurant)
      return res.status(400).json({ message: "Restoran tidak ditemukan" });

    // Insert reservation
    const query = `INSERT INTO Reservations (user_id, restaurant_id, reservation_time, number_of_people) VALUES (?, ?, ?, ?)`;
    db.run(
      query,
      [userId, restaurant_id, reservation_time, number_of_people],
      function (err) {
        if (err) return res.status(500).json({ message: "Server error" });
        res
          .status(201)
          .json({
            message: "Reservasi berhasil dibuat",
            reservationId: this.lastID,
          });
      }
    );
  });
});

// 8. Get User Reservations
app.get("/reservations", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
        SELECT Reservations.id, Restaurants.name as restaurant_name, reservation_time, number_of_people
        FROM Reservations
        JOIN Restaurants ON Reservations.restaurant_id = Restaurants.id
        WHERE Reservations.user_id = ?
    `;
  db.all(query, [userId], (err, reservations) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(reservations);
  });
});

// ===== Mulai Server =====
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
