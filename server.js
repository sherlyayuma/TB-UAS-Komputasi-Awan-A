require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// =======================
// HEALTH CHECK
// =======================
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "success",
      message: "Backend is running",
      database: "connected",
      student: {
        name: "Sherly Ayuma Putri",
        nim: "2311521018",
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
      database: "disconnected",
    });
  }
});

// =======================
// SCHEMA
// =======================
app.get("/schema", (req, res) => {
  res.json({
    student: {
      name: "Sherly Ayuma Putri",
      nim: "2311521018",
    },

    resource: {
      name: "kuliner-umkm",
      label: "Data Kuliner UMKM",
      description: "Direktori UMKM Kuliner Padang Pariaman",
    },

    fields: [
      {
        name: "nama_usaha",
        label: "Nama Usaha",
        type: "text",
        required: true,
        showInTable: true,
      },
      {
        name: "pemilik",
        label: "Pemilik",
        type: "text",
        required: true,
        showInTable: true,
      },
      {
        name: "jenis_kuliner",
        label: "Jenis Kuliner",
        type: "text",
        required: true,
        showInTable: true,
      },
      {
        name: "nagari",
        label: "Nagari",
        type: "text",
        required: true,
        showInTable: true,
      },
      {
        name: "harga_rata_rata",
        label: "Harga Rata-rata",
        type: "number",
        required: false,
        showInTable: true,
      },
      {
        name: "kontak",
        label: "Kontak",
        type: "text",
        required: false,
        showInTable: true,
      },
      {
        name: "deskripsi",
        label: "Deskripsi",
        type: "textarea",
        required: false,
        showInTable: false,
      },
    ],

    endpoints: {
      list: "/kuliner-umkm",
      detail: "/kuliner-umkm/{id}",
      create: "/kuliner-umkm",
      update: "/kuliner-umkm/{id}",
      delete: "/kuliner-umkm/{id}",
    },
  });
});

app.get("/kuliner-umkm", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM kuliner_umkm ORDER BY id DESC"
    );

    res.json({
      items: rows,
      total: rows.length,
      page: 1,
      limit: rows.length,
      hasMore: false
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// =======================
// GET BY ID
// =======================
app.get("/kuliner-umkm/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM kuliner_umkm WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// =======================
// CREATE
// =======================
app.post("/kuliner-umkm", async (req, res) => {
  try {
    const {
      nama_usaha,
      pemilik,
      jenis_kuliner,
      nagari,
      harga_rata_rata,
      kontak,
      deskripsi,
    } = req.body;

    const [result] = await pool.query(
      `
      INSERT INTO kuliner_umkm
      (
        nama_usaha,
        pemilik,
        jenis_kuliner,
        nagari,
        harga_rata_rata,
        kontak,
        deskripsi
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nama_usaha,
        pemilik,
        jenis_kuliner,
        nagari,
        harga_rata_rata,
        kontak,
        deskripsi,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Data berhasil ditambahkan",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// =======================
// UPDATE
// =======================
app.put("/kuliner-umkm/:id", async (req, res) => {
  try {
    const {
      nama_usaha,
      pemilik,
      jenis_kuliner,
      nagari,
      harga_rata_rata,
      kontak,
      deskripsi,
    } = req.body;

    await pool.query(
      `
      UPDATE kuliner_umkm
      SET
        nama_usaha=?,
        pemilik=?,
        jenis_kuliner=?,
        nagari=?,
        harga_rata_rata=?,
        kontak=?,
        deskripsi=?
      WHERE id=?
      `,
      [
        nama_usaha,
        pemilik,
        jenis_kuliner,
        nagari,
        harga_rata_rata,
        kontak,
        deskripsi,
        req.params.id,
      ]
    );

    res.json({
      message: "Data berhasil diupdate",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// =======================
// DELETE
// =======================
app.delete("/kuliner-umkm/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM kuliner_umkm WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Data berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// =======================
// ROOT
// =======================
app.get("/", (req, res) => {
  res.json({
    message: "Kuliner UMKM API Running",
  });
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});