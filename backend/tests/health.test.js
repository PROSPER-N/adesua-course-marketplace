const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("returns 200 in the standard success shape", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: "API is running" });
    expect(res.body.data.time).toEqual(expect.any(String));
  });
});

describe("Errors every route can hit", () => {
  it("returns 404 in the standard error shape for an unknown route", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Route not found", data: null });
  });

  it("returns 400 for a body that isn't valid JSON", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": ');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("The request body isn't valid JSON.");
  });
});
