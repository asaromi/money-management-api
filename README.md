Money Management API - Backend Skill Test
====

Introduction
----
Ticket Reservation API is an implemented locket reservation flow with HTTP API request. The project using Node JS (ExpressJS) as backend, and PostgreSQL as database (with Sequelize as ORM). I used migrations instead of .sql for the database. This is a simple project skill test for applyment as Fullstack Developer in GorryWell.

Requirements
----
- NodeJS (develop using Node18) - for more info or documentation you can access [here](https://nodejs.org)
- PostgreSQL (develop using postgresql15.1) - for more info or documentation you can access [here](https://www.postgresql.org/)
- or MySQL (with specific setup/configuration)

How to Setup
----
**Project Setup**
- Download or clone this repository (and install all requirements if you haven't ever used it before)
- Open terminal, and execute command `npm install` or `yarn install` to install all required npm packages
- The comment environment variable is optional like PORT, HOST, and others.

**Special Note**

If you want to use MySQL as database, you need to install `mysql2` package by executing `npm install --save-dev mysql2` or `yarn add --dev mysql2` on terminal
**Database Setup**
- Create new database to your Database server (PostgreSQL or MySQL)
- Copy `.env.example` as `.env` and change required data to access database (`DB_NAME`, `DB_PORT`, `DB_USER`, `DB_HOST`, and `DB_PASS`)
- Execute command `npm run db:migrate` or `yarn db:migrate` on terminal
- To running the project, execute `npm run dev` or `yarn dev` and you can access the running API at http://localhost:3000

List of API functionalities
----
| Endpoint                          | Relative Path              | Method | Description                                                                  |
|-----------------------------------|----------------------------|--------|------------------------------------------------------------------------------|
| [Public] Auth Register            | */api/auth/register*       | POST   | Endpoint to register for new user                                            |
| [Public] Auth Login               | */api/auth/login*          | POST   | Endpoint to login and getting the auth token                                 |
| Get Auth User                     | */api/auth*                | GET    | Endpoint to get the authenticated user's data                                |
| Reset Auth User's Password        | */api/auth/reset-password* | PATCH  | Endpoint to reset the password from the authenticated user                   |
| Create Category                   | */api/categories*          | POST   | Endpoint to create new category globally (but with limiation of unique name) |
| [Public] Get All Categories       | */api/categories*          | GET    | Endpoint to get list of categories                                           |
| [Public] Get Category by slug/url | */api/categories/:slug*    | GET    | Endpoint to get detail of category (from the slug or url)                    |
| Create Wallet                     | */api/wallets*             | POST   | Endpoint to create your own wallet (related to userId)                       |
| Get My Wallets                    | */api/wallets*             | GET    | Endpoint to get all of your wallets                                          |
| Get Wallet by Id                  | */api/wallets/:id*         | GET    | Endpoint to get the wallet detail by id                                      |
| Update Wallet by Id               | */api/wallets/:id*         | PUT    | Endpoint to update (the only one field) category's name                      |
| Delete Wallet by Id               | */api/wallets/:id*         | DELETE | Endpoint to delete wallet by id                                              |

For specific API testing example, you can open the documentation [here](https://documenter.getpostman.com/view/15820910/2s9YyzcHha)
