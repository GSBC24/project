Census API — Course Assignment
Hosted Application

Deployed application:

https://project-03jq.onrender.com

Project Description

RESTful Census API built with:

Node.js & Express
MySQL (Aiven cloud database)
Basic Authentication
Render.com for deployment

Admin credentials:

Username: admin
Password: P4ssword

Environment Variables (.env)

PORT=3000
DB_HOST=your_aiven_host_here
DB_USER=avnadmin
DB_PASSWORD=your_password_here
DB_DATABASE=defaultdb
DB_PORT=your_aiven_port_here

ADMIN_USER=admin
ADMIN_PASSWORD=P4ssword


Database (MySQL - Aiven)
Testing: Postman.
Deployment: Render.com.

Main Endpoints

POST /participants/add
GET /participants
GET /participants/details
GET /participants/details/:email
GET /participants/work/:email
GET /participants/home/:email
PUT /participants/:email
DELETE /participants/:email

Author

Your Name — GitHub: GSBC24
