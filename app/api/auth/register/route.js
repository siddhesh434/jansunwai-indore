// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../lib/dbConnect";
import { User } from "../../../../models";

export async function POST(request) {
  try {
    await dbConnect();

    const { name, username, email, password, address } = await request.json();
    
    // Debug logging
    console.log("Registration request data:", { name, username, email, password: password ? "***" : "undefined", address });

    // Validation
    if (!name || !username || !email || !password) {
      console.log("Missing fields:", { name: !!name, username: !!username, email: !!email, password: !!password });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Create user data object
    const userDataToCreate = {
      name,
      username,
      email,
      password,
      address: address || "",
      queries: [],
      authMethod: 'local',
    };

    console.log("Creating user with data:", { 
      ...userDataToCreate, 
      password: "***" 
    });
    
    // Create new user
    const user = await User.create(userDataToCreate);
    
    // DETAILED DEBUG: Check what was actually saved
    console.log("=== DETAILED DEBUG ===");
    console.log("user._doc (raw MongoDB document):", user._doc);
    console.log("user.toObject():", user.toObject());
    console.log("user.toJSON():", user.toJSON());
    
    // Check individual fields directly
    console.log("=== INDIVIDUAL FIELDS ===");
    console.log("user.name:", user.name);
    console.log("user.username:", user.username);
    console.log("user.email:", user.email);
    console.log("user.password:", user.password ? "***" : undefined);
    console.log("user.address:", user.address);
    console.log("user.authMethod:", user.authMethod);
    
    // Query the user back from database immediately
    console.log("=== QUERYING BACK FROM DB ===");
    const savedUser = await User.findById(user._id);
    console.log("savedUser from database:", savedUser);
    console.log("savedUser.email:", savedUser.email);
    
    // Try different query methods
    const savedUserLean = await User.findById(user._id).lean();
    console.log("savedUser (lean):", savedUserLean);
    
    // Check the schema
    console.log("=== SCHEMA DEBUG ===");
    console.log("User schema paths:", Object.keys(User.schema.paths));
    console.log("User schema for email field:", User.schema.paths.email);
    
    console.log("User created successfully:", { _id: user._id, name: user.name, username: user.username, email: user.email });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      address: user.address,
      queries: user.queries,
    };

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.log("Validation error details:", error.errors);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      console.log("Duplicate key error details:", error.keyPattern, error.keyValue);
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}