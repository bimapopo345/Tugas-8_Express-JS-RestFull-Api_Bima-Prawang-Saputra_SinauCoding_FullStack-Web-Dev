# Tugas-8 Express.js Restful API

## Description
Tugas-8 is a web-based application built using Express.js that provides a RESTful API for managing user registrations, restaurant listings, and reservations. It utilizes SQLite as the database for storing user and restaurant data, featuring secure authentication via JWT (JSON Web Tokens).

## Features and Functionality
- **User Registration**: Allows users to create accounts with unique usernames and emails.
- **User Login**: Secure login mechanism with password verification and token generation.
- **User Profile Management**: Users can view and update their profiles, including email and name.
- **Restaurant Management**: Retrieve a list of restaurants and add new restaurants (admin functionality).
- **Reservation System**: Users can make reservations at restaurants and view their reservation history.

## Technology Stack
- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for Node.js to create RESTful APIs.
- **SQLite**: Lightweight database to store user, restaurant, and reservation data.
- **bcryptjs**: Library for hashing passwords.
- **jsonwebtoken**: Library for generating and verifying JWT tokens.
- **dotenv**: Module for loading environment variables from a `.env` file.
- **body-parser**: Middleware for parsing incoming request bodies.

## Prerequisites
To run this project, ensure you have the following installed on your machine:
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation Instructions
1. Clone this repository:
   ```bash
   git clone https://github.com/bimapopo345/Tugas-8_Express-JS-RestFull-Api_Bima-Prawang-Saputra_SinauCoding_FullStack-Web-Dev.git
   cd Tugas-8_Express-JS-RestFull-Api_Bima-Prawang-Saputra_SinauCoding_FullStack-Web-Dev
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```plaintext
   PORT=3000
   SECRET_KEY=your_secret_key
   ```

4. Start the server:
   ```bash
   node server.js
   ```

## Usage Guide
### API Endpoints
- **Register User**: `POST /register`
  - Request body: `{ "username": "string", "password": "string", "email": "string", "name": "string" }`

- **Login User**: `POST /login`
  - Request body: `{ "username": "string", "password": "string" }`
  - Response: `{ "message": "Login berhasil", "token": "your_jwt_token" }`

- **Get User Profile**: `GET /profile`
  - Requires authentication.
  
- **Update User Profile**: `PUT /profile`
  - Request body: `{ "email": "string", "name": "string", "password": "string" }`
  - Requires authentication.

- **Get List of Restaurants**: `GET /restaurants`

- **Add a Restaurant**: `POST /restaurants`
  - Request body: `{ "name": "string", "address": "string", "phone": "string" }`
  - Requires authentication.

- **Make a Reservation**: `POST /reservations`
  - Request body: `{ "restaurant_id": "integer", "reservation_time": "string", "number_of_people": "integer" }`
  - Requires authentication.

- **Get User Reservations**: `GET /reservations`
  - Requires authentication.

## Contributing Guidelines
Contributions are welcome! If you would like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License Information
No license information is provided for this project. Please check with the repository owner for licensing details.

## Contact/Support Information
For any questions or support, please reach out to the repository owner via GitHub at [bimapopo345](https://github.com/bimapopo345).
