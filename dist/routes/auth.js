"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const types_1 = require("../types");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.use(express_1.default.json());
// Route for user signup
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    // Check if user already exists
    const user = yield db_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (user) {
        res.status(400).json({ error: "User already exists" });
        return;
    }
    // Validate user input using Zod schema
    const result = types_1.userSchema.safeParse({ email, password, username });
    if (result.success) {
        try {
            // Hash the password before storing it
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            // Create new user in the database
            const user = yield db_1.default.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    username,
                },
            });
            res.status(201).json({ message: "User created successfully", user });
        }
        catch (error) {
            res.status(500).json({ error: "Error creating user" });
        }
    }
    else {
        res.status(401).json({ error: result.error.errors });
    }
}));
// Route for user signin
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Validate user input using Zod schema
    const zodResult = types_1.userSchema.safeParse({ email, password });
    if (!zodResult.success) {
        res.status(400).json({ error: zodResult.error.errors });
        return;
    }
    try {
        // Find user by email
        const user = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Compare provided password with stored hashed password
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ error: "Password is incorrect" });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET);
        res
            .status(200)
            .json({
            message: `${user.username} signed in successfully`,
            token,
            role: user.role,
            user: { username: user.username, email: user.email, userId: user.id },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error signing in" });
    }
}));
exports.default = router;
