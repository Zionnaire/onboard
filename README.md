Onboarding App
Overview
The Onboarding App is designed to streamline the onboarding process for users, making it efficient, user-friendly, and integrated with essential services. This application helps users to onboard into various systems or services, and also supports payment processing through Paystack. The app offers a variety of features including payment management, user authentication, and more.
Features
User Registration & Authentication: Users can sign up and authenticate their accounts.
Payment Integration: The app supports payment processing through Paystack, allowing users to make payments and manage payment statuses.
Webhook for Payment Verification: The app listens to Paystack's webhook to verify payments and update payment statuses accordingly.
Payment Management: Users can initiate payments, mark them as successful or failed, and even request refunds.
Inventory Management: The app can manage inventory, track items, and handle related operations.
Technologies Used
Backend: Node.js with Express.js
Database: MongoDB (for storing user and payment information)
Payment Integration: Paystack API
Authentication: JWT-based authentication for secure access
Others: Axios for making API requests, crypto for secure validation of webhooks


Setup
Prerequisites
Node.js and npm (or Yarn) installed
MongoDB instance running (either locally or using a cloud database like MongoDB Atlas)
Paystack API key for payment functionality
Installation
1. Clone the repository: git clone https://github.com/your-username/onboarding-app.git
   cd onboarding-app then npm install.
Create a .env file in the root directory of the project and add the following variables:
# MongoDB Configuration
MONGO_URI=mongodb+srv://zionnaire2018:Zionnaire2017$@onboarding.sijck.mongodb.net/?retryWrites=true&w=majority&appName=onboarding

JWT_SECRET=MYSECRET
PORT=5000
JWT Expiration Time: JWT_EXPIRES_IN=1h
Paystack API Keys:
PAYSTACK_SECRET_KEY=
Test_Public_Key=
EMAIL_USERNAME=
EMAIL_PASSWORD=

npm start/npm run dev: Start the server
2.	The server should now be running on http://localhost:5000.

API Documentation
Endpoints
Authentication
The app uses JWT (JSON Web Tokens) for authentication. You need to include the token in the Authorization header for accessing protected routes.
POST/auth/register
•	Description: Logs in a user and returns a JWT token.
•	Request Body:
{
  "email": "user@example.com",
  "password": "userpassword",
“name": " “example@name”
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": "678a1352a1b416a6ed8d778b",
    "name": "zions",
    "email": "myg2010@gmail.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGExMzUyYTFiNDE2YTZlZDhkNzc4YiIsImlhdCI6MTczNzEwMjE2MywiZXhwIjoxNzM3MTA1NzYzfQ.Lg90NXXAUamzTNxSugcH2cGM8rcjFYZ-bO-qY4OXODE"
}







POST /auth/login
•	Description: Logs in a user and returns a JWT token.
•	Request Body:
{
  "email": "user@example.com",
  "password": "userpassword"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODdhY2VhZTFkODYxNTA0ODU0YjMxZCIsImlhdCI6MTczNzA5NzE5NiwiZXhwIjoxNzM3MTAwNzk2fQ.5T3gagvv4cq3NI6ZZfhkIPM2OrT9r0kt25mEpYk0tI0",
  "user": {
    "id": "6787aceae1d861504854b31d",
    "name": "zions",
    "email": "myg200@gmail.com"
  }
}


Include the Authorization header with the JWT token for protected routes:
Authorization: Bearer your-jwt-token


Inventory Management
The app includes endpoints for managing inventory. You can add, update, retrieve, and delete inventory items.
POST /inventory
•	Description: Adds a new inventory item.
•	Request Body:


{
  "name": "Item Name",
  "quantity": 10,
  "price": 500
}
•	Response:
{
  "message": "Item added successfully",
  "item": {
    "name": "Item Name",
    "quantity": 10,
    "price": 500,
    "_id": "item-id"
  }
}
PUT /inventory/:itemId
•	Description: Updates an existing inventory item.
•	Parameters: itemId (the ID of the inventory item to update)
•	Request Body:
{
  "name": "Updated Item Name",
  "quantity": 20,
  "price": 550
}
•	Response:
{
  "message": "Item updated successfully",
  "item": {
    "name": "Updated Item Name",
    "quantity": 20,
    "price": 550,
    "_id": "item-id"
  }
}

GET /inventory
•	Description: Retrieves all inventory items.
•	Response:
[
  {
    "_id": "item-id",
    "name": "Item Name",
    "quantity": 10,
    "price": 500
  },
  {
    "_id": "another-item-id",
    "name": "Another Item",
    "quantity": 5,
    "price": 300
  }
]

GET /inventory/:itemId
•	Description: Retrieves an inventory item by its ID.
•	Parameters: itemId (the ID of the inventory item)
•	Response:
{
  "_id": "item-id",
  "name": "Item Name",
  "quantity": 10,
  "price": 500
}

DELETE /inventory/:itemId
•	Description: Deletes an inventory item by its ID.
•	Parameters: itemId (the ID of the inventory item)
•	Response:


{
  "message": "Item deleted successfully"
}


POST /payments
•	Description: Initiates a payment for a user.
•	Request Body:
{
  "userId": "user_id",
  "amount": 1000,
  "currency": "NGN",
  "email": "user@example.com",
  "paymentMethod": "card"
}

Response: 
{
  "message": "Payment initialized successfully",
  "payment": {
    "userId": "user_id",
    "amount": 1000,
    "currency": "NGN",
    "paymentMethod": "card",
    "paymentStatus": "Pending",
    "transactionId": "tx12345",
    "paymentDate": "2025-01-16T00:00:00Z"
  },
  "authorizationUrl": "https://paystack.com/pay/authorization-url"
}





POST /payments/:paymentId/refund
•	Description: Refunds a payment by its ID.
•	Parameters: paymentId (the ID of the payment to refund)
•	Response:
{
  "message": "Payment refunded successfully",
  "payment": {
    "paymentStatus": "Refunded"
  }
}

POST /payments/webhook
•	Description: Paystack webhook to verify the status of a payment.
•	Request Body: The webhook payload sent by Paystack.
•	Response:
{
  "message": "Webhook received successfully"
}


PUT /payments/:paymentId/paymentSuccess
•	Description: Marks a payment as successful.
•	Parameters: paymentId (the ID of the payment to mark as successful)
•	Response:

{
  "message": "Payment status updated to success",
  "payment": {
    "paymentStatus": "Success"
  }
}

GET /payments/:paymentId
•	Description: Retrieves the details of a payment by its ID.
•	Parameters: paymentId (the ID of the payment to retrieve)
•	Response:
{
  "payment": {
    "userId": "user_id",
    "amount": 1000,
    "currency": "NGN",
    "paymentMethod": "card",
    "paymentStatus": "Success",
    "transactionId": "tx12345",
    "paymentDate": "2025-01-16T00:00:00Z"
  }
}

PUT /payments/:paymentId/completePayment
•	Description: Completes the payment by validating the webhook and updating payment status.
•	Parameters: paymentId (the ID of the payment to complete)
•	Response:
{
  "message": "Payment completed successfully"
}

Testing
To test the application, you can use tools like Postman or Insomnia to make requests to the API endpoints. Make sure to include the appropriate authorization tokens (JWT) where required.

Example Testing Workflow
1.	Create a payment by sending a POST request to /payments with the required data.
2.	Complete the payment:
simulating the webhook event or calling the
/payments/:paymentId/completePayment endpoint.
3.	Verify the payment
status by using the /payments/:paymentId/verifyPayment endpoint.
4.	Refund a payment using the /payments/:paymentId/refund endpoint.

Contribution
Contributions are welcome! Feel free to fork this repository, create a branch, and submit a pull request.

