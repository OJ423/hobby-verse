# Hobby-Verse API

## Overview
This repo is a for an events platform that a business can use to run events and sell tickets. 

**A hosted version** will be available view Neon.

The database contains tables for users, events, event categories, tickets, event tickets, orders and order items. More details about the project schema can be found (Events Platform Diagram)[/events-platform-plan.pdf].

## Running the server
Ensure you go through the set up instructions first. To start your server run:

`npm run start`

The server will be running on `http://localhost:9090/api/`

This url displays all of the endpoints available.

## Set Up Instructions

### Clone

Clone to your own local directory using git:

```bash
git clone https://github.com/OJ423/hobby-verse.git
```

### Install Dependencies

- "bcryptjs": "^2.4.3",
- "dotenv": "^16.4.5",
- "express": "^4.19.2",
- "fs.promises": "^0.1.2",
- "jsonwebtoken": "^9.0.2",
- "nodemailer": "^6.9.15",
- "pg": "^8.12.0"


#### Developer Dependencies

To seed the database and for unit and integration testing, install the following dev dependencies:

- "jest": "^29.7.0",
- "pg-format": "^1.0.4",
- "supertest": "^7.0.0"

### Create Test, Development and Production Environments

In order to run this project locally. Use dotenv and configure your test and development environments.

1. Create file at root level called .env.development
2. In this file add - PGDATABASE=hobbyverse
3. Create another file at root level called .env.test.
4. In this file add PGDATABASE=hobbyverse_test
5. Create file at root level called .env.production
6. In this file you need to specify your production database address - for example DATABASE_URL=your_database_url

### Library Secrets & Keys
This project uses nodemailer for sending emails, JWT for authentication and Password Reset. In each of your .env files you will need:

- JWT_SECRET="Your Secret Key"
- PASS_REST="A different secret key for - password resets"
- EMAIL_USER="Email address for nodemailer"
- EMAIL_PASS="Email password for nodemailer"

### Initialise Databases
Before seeding the database you may wish to change the database name. The database details can be found in the file called `setup.sql`. If you change the database names, ensure that you chance these references in your .env files.

To initialise the test and dev databases:

```bash
npm run setup-dbs
```

### Seed Database

*Requires PG format installation*

In the terminal:

```bash
npm run seed
```

To check you have seeded the database try -

```bash
psql
\c your_database
SELECT * FROM events
```

This should return all events in the database.

### Testing

If extending functionality or want get a better understanding of the API's functionality, take a look at the `__tests__` folder. In order to run tests you will need to have installed `jest`, `jest-extended`, `jest-sortby` and `supertest`.

Run tests from the terminal by using -

```bash
npm test
```