import basicAuth from "basic-auth";

export const authMiddleware = (req, res, next) => {
  const user = basicAuth(req);

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!user || user.name !== adminUser || user.pass !== adminPassword) {
    return res.status(401).json({ error: "Unauthorized - Invalid credentials" });
  }

  next();
};