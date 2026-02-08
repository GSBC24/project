Census API — Course Assignment
Hosted Application

Your deployed application is available at:

https://project-03jq.onrender.com

You should paste your own Render URL here if it changes in the future.

Project Description

This is a RESTful Census API built with:

Node.js & Express

MySQL (Aiven cloud database)

Basic Authentication

Render.com for deployment

The API allows an authenticated Admin user to perform full CRUD operations on census participants.

Authentication

All endpoints (except /) are protected with Basic Authentication.

Admin credentials:

Username: admin
Password: P4ssword

In Postman, select:

Authorization → Basic Auth

Enter the credentials above.

Environment Variables (.env)

Your application uses the following environment variables:

PORT=3000

DB_HOST=mysql-172eb7c5-census-project1.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=TAVNS_1u2_6jclMqjIsWPPwul
DB_DATABASE=defaultdb
DB_PORT=18327

ADMIN_USER=admin
ADMIN_PASSWORD=P4ssword


Database (MySQL - Aiven)

The following table must exist in your MySQL database:

CREATE TABLE IF NOT EXISTS participants (
  email VARCHAR(255) PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  dob DATE,
  companyname VARCHAR(255),
  salary DECIMAL(10,2),
  currency VARCHAR(10),
  country VARCHAR(100),
  city VARCHAR(100)
);
🚀 API Endpoints
➤ Add a participant

POST /participants/add

Example request body:

{
  "email": "test@example.com",
  "firstname": "Juan",
  "lastname": "Perez",
  "dob": "1995-06-15",
  "work": {
    "companyname": "Tech AS",
    "salary": 55000,
    "currency": "USD"
  },
  "home": {
    "country": "Norway",
    "city": "Oslo"
  }
}
➤ Get all participants

GET /participants

➤ Get personal details of all participants

GET /participants/details

➤ Get details of a specific participant

GET /participants/details/:email

➤ Get work details of a participant

GET /participants/work/:email

➤ Get home details of a participant

GET /participants/home/:email

➤ Update a participant

PUT /participants/:email

➤ Delete a participant

DELETE /participants/:email

Testing

All endpoints were tested using Postman with Basic Authentication.

Deployment

The application is deployed on Render.com and automatically builds using:

Build Command: npm install

Start Command: node server.js

Author

Your Name
GitHub: GSBC24
