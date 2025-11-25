
1. Install dependencies:

cd backend
npm install
cp .env.example .env
npm run dev

2. Key Features
- JWT Authentication with role-based access
- Automatic stock management on sales
- Invoice generation
- Sales analytics and reporting
- Low stock alerts

3. I have created a Postman collection for the few required APIs.
The JWT token can be generated using either the Registration API or the Login API.

I have also attached the exported Postman collection for your reference.
Please update the token value as needed.
The file name is smart-canteen.postman_collection.json.

4. API Endpoints

*Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

*Customers
- GET `/api/customers` - Get all customers
- POST `/api/customers` - Create customer
- GET `/api/customers/:id` - Get single customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer (Admin only)

*Items
- GET `/api/items` - Get all items
- GET `/api/items/low-stock` - Get low stock items
- POST `/api/items` - Create item (Admin only)
- GET `/api/items/:id` - Get single item
- PUT `/api/items/:id` - Update item (Admin only)
- DELETE `/api/items/:id` - Delete item (Admin only)

*Sales
- GET `/api/sales` - Get all sales (with filters)
- POST `/api/sales` - Create sale (auto-generates invoice)
- GET `/api/sales/:id` - Get single sale
- PUT `/api/sales/:id` - Update payment status
- GET `/api/sales/stats/summary` - Get sales statistics
