const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Record = require('../models/Record');

const upload = multer({ dest: 'uploads/' });

// In-memory store when MongoDB is not available
let inMemoryRecords = [];

const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// GET all records
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const records = await Record.find().sort({ createdAt: -1 });
      return res.json(records);
    }
    res.json(inMemoryRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST single record
router.post('/', async (req, res) => {
  try {
    const record = { id: uuidv4(), ...req.body };
    if (isMongoConnected()) {
      const newRecord = new Record(record);
      await newRecord.save();
      return res.status(201).json(newRecord);
    }
    inMemoryRecords.push(record);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST bulk records
router.post('/bulk', async (req, res) => {
  try {
    const records = req.body.records.map(r => ({ id: uuidv4(), ...r }));
    if (isMongoConnected()) {
      const inserted = await Record.insertMany(records);
      return res.status(201).json({ count: inserted.length, records: inserted });
    }
    inMemoryRecords = [...inMemoryRecords, ...records];
    res.status(201).json({ count: records.length, records });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE all records (reset)
router.delete('/all', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Record.deleteMany({});
      return res.json({ message: 'All records deleted' });
    }
    inMemoryRecords = [];
    res.json({ message: 'All records cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload CSV
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const records = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      records.push({ id: uuidv4(), ...row });
    })
    .on('end', async () => {
      fs.unlinkSync(req.file.path);
      try {
        if (isMongoConnected()) {
          const inserted = await Record.insertMany(records);
          return res.json({ count: inserted.length, records: inserted });
        }
        inMemoryRecords = [...inMemoryRecords, ...records];
        res.json({ count: records.length, records });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
});

module.exports = router;
