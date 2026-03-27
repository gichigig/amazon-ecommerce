# E-Commerce Spring Boot Backend

This is the Spring Boot backend for the E-Commerce application, replacing the previous Supabase backend.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL (for production) or H2 (for development)

## Project Structure

```
backend/
├── src/main/java/com/ecommerce/
│   ├── EcommerceApplication.java      # Main application entry
│   ├── config/
│   │   └── SecurityConfig.java        # Security & CORS configuration
│   ├── controller/
│   │   ├── AuthController.java        # Authentication endpoints
│   │   ├── ProductController.java     # Product CRUD endpoints
│   │   ├── CartController.java        # Shopping cart endpoints
│   │   ├── OrderController.java       # Order management endpoints
│   │   ├── MpesaController.java       # M-Pesa payment endpoints
│   │   └── FileController.java        # File upload/download endpoints
│   ├── dto/                            # Data Transfer Objects
│   ├── exception/
│   │   └── GlobalExceptionHandler.java
│   ├── model/                          # JPA Entity classes
│   ├── repository/                     # Spring Data JPA repositories
│   ├── security/
│   │   ├── JwtTokenProvider.java      # JWT token generation/validation
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── UserPrincipal.java
│   │   └── CurrentUser.java
│   └── service/                        # Business logic services
└── src/main/resources/
    └── application.properties          # Configuration
```

## Quick Start

### 1. Clone and navigate to the backend folder

```bash
cd backend
```

### 2. Configure the application

Edit `src/main/resources/application.properties`:

```properties
# For development (H2 database - default)
# No changes needed, H2 is configured by default

# For production (PostgreSQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Secret (IMPORTANT: Change this in production!)
jwt.secret=your-256-bit-secret-key-base64-encoded

# M-Pesa Configuration
mpesa.consumer-key=YOUR_CONSUMER_KEY
mpesa.consumer-secret=YOUR_CONSUMER_SECRET
mpesa.passkey=YOUR_PASSKEY
mpesa.shortcode=174379
mpesa.environment=sandbox
mpesa.callback-url=https://your-domain.com/api/mpesa/callback
```

### 3. Run the application

```bash
# Using Maven
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

The server will start on `http://localhost:8080`

### 4. Access H2 Console (Development)

Navigate to `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/ecommerce`
- Username: `sa`
- Password: (empty)

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login user |
| GET | `/api/auth/me` | Get current user |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all active products |
| GET | `/api/products/all` | Get all products (admin) |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/search?q=` | Search products |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/{id}` | Update product (admin) |
| DELETE | `/api/products/{id}` | Delete product (admin) |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart items |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/{itemId}` | Update cart item |
| DELETE | `/api/cart/{itemId}` | Remove from cart |
| DELETE | `/api/cart` | Clear cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/all` | Get all orders (admin) |
| GET | `/api/orders/{id}` | Get order by ID |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/{id}/status` | Update order status (admin) |

### M-Pesa

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mpesa/stk-push` | Initiate STK Push |
| POST | `/api/mpesa/callback` | M-Pesa callback (public) |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/{filename}` | Get uploaded file |

## Creating an Admin User

To create an admin user, you can:

1. **Using H2 Console (Development)**:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
   ```

2. **Using PostgreSQL (Production)**:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
   ```

3. **Programmatically** - Create a `DataInitializer` class:
   ```java
   @Component
   public class DataInitializer implements CommandLineRunner {
       @Autowired
       private UserRepository userRepository;
       @Autowired
       private PasswordEncoder passwordEncoder;
       
       @Override
       public void run(String... args) {
           if (!userRepository.existsByEmail("admin@admin.com")) {
               User admin = User.builder()
                   .email("admin@admin.com")
                   .password(passwordEncoder.encode("admin123"))
                   .fullName("Admin User")
                   .isAdmin(true)
                   .build();
               userRepository.save(admin);
           }
       }
   }
   ```

## Frontend Configuration

Update the frontend `.env` files:

**user-app/.env**
```
VITE_API_URL=http://localhost:8080/api
```

**admin-app/.env**
```
VITE_API_URL=http://localhost:8080/api
```

## Production Deployment

### 1. Build the JAR
```bash
./mvnw clean package -DskipTests
```

### 2. Run the JAR
```bash
java -jar target/ecommerce-backend-1.0.0.jar
```

### 3. Environment Variables (Production)
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/ecommerce
export SPRING_DATASOURCE_USERNAME=your_username
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your-production-secret
export MPESA_CONSUMER_KEY=your_key
export MPESA_CONSUMER_SECRET=your_secret
export MPESA_PASSKEY=your_passkey
export MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

## Key Changes from Supabase

| Feature | Supabase | Spring Boot |
|---------|----------|-------------|
| Authentication | Supabase Auth | JWT-based auth |
| Database | Supabase PostgreSQL | H2 (dev) / PostgreSQL (prod) |
| File Storage | Supabase Storage | Local file storage |
| Edge Functions | Supabase Edge Functions | REST Controllers |
| Real-time | Supabase Realtime | WebSockets (if needed) |
| Row Level Security | RLS Policies | Spring Security + @PreAuthorize |

## License

MIT
