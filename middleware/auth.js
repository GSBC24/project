import basicAuth from "basic-auth";

export const authMiddleware = (req, res, next) => {
  // Read username and password from request
  const user = basicAuth(req);

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If user is missing or wrong, block access
  if (!user || user.name !== adminUser || user.pass !== adminPassword) {
    return res.status(401).json({
      error: "Unauthorized - Invalid credentials"
    });
  }

  // If correct, allow request to continue
  next();
};
