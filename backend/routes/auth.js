const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 


router.post("/signup", async (req, res) => {
    try {
        console.log("Received Signup Request:", req.body);
        const { name, email, password, role } = req.body || {}; 
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

    
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const validRoles = ["patient", "doctor"];
        const userRole = validRoles.includes(role) ? role : "patient"; 

        user = new User({ name, email, password: hashedPassword, role: userRole });
        await user.save();

        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, name, email, role: user.role } });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        console.log("Received Login Request:", req.body);
        const { email, password } = req.body;

    
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        console.log(`User Found: ${user.email}`);

    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        console.log(`Password Matched`);

        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user._id, email } });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

router.post("/google-login", async (req, res) => {
    try {
        const { token } = req.body;
        
        
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        const { name, email } = ticket.getPayload();
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ name, email, password: "" }); 
            await user.save();
        }

        const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token: authToken, user: { id: user._id, name, email } });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ msg: "Google authentication failed" });
    }
});


router.get("/user", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.status(401).json({ msg: "Token is not valid" });

        const user = await User.findById(verified.id).select("-password");
        res.json(user);

    } catch (error) {
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
