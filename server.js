const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const fs = require("fs");
const app = express();
const port = 5000;

// Middleware to parse JSON request body
app.use(express.json());
app.use(cors());  // Enable CORS

// Load existing users from the database (database.json)
let users = JSON.parse(fs.readFileSync("database.json", "utf8"));

// POST route for signup
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    // Validate the incoming request data
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store both hashed and original passwords
    users.push({
        name,
        email,
        hashedPassword,  // Store hashed password (safe storage)
        // *** Security risk: Plaintext password (comment this out later for increased security) ***
        //
        // plaintextPassword: password  // Store the original password (unsafe for now)
    });

    // Save the updated users array to database.json
    fs.writeFileSync("database.json", JSON.stringify(users, null, 2));

    res.status(200).json({ message: "Signup successful!" });
});

// POST route for login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    // Read users from database.json
    const users = JSON.parse(fs.readFileSync("database.json"));

    // Find user by email
    const user = users.find(user => user.email === email);
    
    if (!user) {
        return res.status(400).json({ message: "User not found!" });
    }

    // Compare hashed passwords
    const match = await bcrypt.compare(password, user.hashedPassword);
    
    if (!match) {
        return res.status(400).json({ message: "Incorrect password!" });
    }

    // Send success response with success: true
    res.json({ success: true, message: "Login successful!" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
