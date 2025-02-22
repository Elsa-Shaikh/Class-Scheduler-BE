const request = require("supertest");
const express = require("express");
const authRoutes = require("../Routes/authRoute.js");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("POST /api/auth/login", () => {
  it("should login successfully and return a token and user data", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "12345Admin&",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login Successfully");
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: expect.any(String),
        role: expect.any(String),
        email: "admin@test.com",
      })
    );
  });
});
