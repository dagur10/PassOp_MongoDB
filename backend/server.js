const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');

dotenv.config()


// Connecting to the MongoDB Client
const url = process.env.MONGO_URI;
const client = new MongoClient(url);
client.connect();

// App & Database
const dbName = 'passop'
const app = express()
const port = 3000

// Middleware
app.use(bodyParser.json())
app.use(cors())

const JWT_SECRET = process.env.JWT_SECRET;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;

// Register User
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const db = client.db(dbName);
        const users = db.collection('users');
        const existingUser = await users.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await users.insertOne({ username, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt for:", username);
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const db = client.db(dbName);
        const users = db.collection('users');
        const user = await users.findOne({ username });
        if (!user) {
            console.log("User not found:", username);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log("User found:", user.username);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            console.log("Password mismatch for user:", username);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify token
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Encrypt function
const encryptPassword = (password) => {
    return crypto.AES.encrypt(password, CRYPTO_SECRET).toString();
};

// Decrypt function
const decryptPassword = (encryptedPassword) => {
    const bytes = crypto.AES.decrypt(encryptedPassword, CRYPTO_SECRET);
    return bytes.toString(crypto.enc.Utf8);
};


// Get all the passwords for a user
app.get('/api/passwords', authMiddleware, async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const findResult = await collection.find({ userId: req.user.userId }).toArray();
        const decryptedPasswords = findResult.map(p => ({
            ...p,
            password: decryptPassword(p.password),
            site: decryptPassword(p.site),
            username: decryptPassword(p.username)
        }));
        res.json(decryptedPasswords);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Save a password
app.post('/api/passwords', authMiddleware, async (req, res) => { 
    const { site, username, password } = req.body
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const encryptedPassword = {
        userId: req.user.userId,
        site: encryptPassword(site),
        username: encryptPassword(username),
        password: encryptPassword(password)
    };
    const findResult = await collection.insertOne(encryptedPassword);
    res.send({success: true, result: findResult})
})

// Delete a password by id
app.delete('/api/passwords', authMiddleware, async (req, res) => { 
    const { id } = req.body
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.deleteOne({ _id: new ObjectId(id), userId: req.user.userId });
    if (findResult.deletedCount === 1) {
        res.send({success: true, result: findResult})
    } else {
        res.status(404).send({ success: false, message: "Password not found or user not authorized" })
    }
})

// Update a password by id
app.put('/api/passwords', authMiddleware, async (req, res) => {
    const { id, site, username, password } = req.body;
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const encryptedPassword = {
        site: encryptPassword(site),
        username: encryptPassword(username),
        password: encryptPassword(password)
    };
    const findResult = await collection.updateOne(
        { _id: new ObjectId(id), userId: req.user.userId },
        { $set: encryptedPassword }
    );
    if (findResult.matchedCount === 1) {
        res.send({ success: true, result: findResult });
    } else {
        res.status(404).send({ success: false, message: "Password not found or user not authorized" });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on  http://localhost:${port}`)
})