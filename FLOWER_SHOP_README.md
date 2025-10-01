# 🌸 Flower Shop E-Commerce Backend

A complete e-commerce backend solution for flower shops built on **Medusa v2.10.0**.

## 🌺 Features

### Core Flower Shop Features

#### 1. **Flower Product Management**
- Detailed flower metadata (type, color, size, stem count)
- Freshness guarantee tracking
- Origin country and farm information
- Care level and scent information
- Seasonal availability tracking
- Flower symbolism information
- Temperature requirements for storage

#### 2. **Occasion-Based Shopping**
- Pre-defined occasions (Birthday, Anniversary, Wedding, Sympathy, Valentine's Day, Mother's Day)
- Recommended flowers for each occasion
- Message examples and suggestions
- Peak season tracking
- Custom color themes and icons

#### 3. **Advanced Delivery Management**
- Multiple delivery time slots (Morning, Afternoon, Evening, Express)
- Delivery slot capacity management
- Gift message support
- Anonymous gifting option
- Photo-on-delivery feature
- Signature requirements
- Real-time delivery status tracking

#### 4. **Flower Subscriptions**
- Weekly, bi-weekly, or monthly subscriptions
- Flexible delivery scheduling
- Pause/resume functionality
- Skip next delivery option
- Auto-renewal support
- Subscription discounts

#### 5. **Care Instructions**
- Detailed care guides for each flower type
- Watering frequency and amounts
- Sunlight requirements
- Pruning instructions
- Common issues and solutions
- Care tips and video tutorials

## 📁 Project Structure

```
my-medusa-store/
├── src/
│   ├── modules/              # Custom modules
│   │   ├── flower/           # Flower product module
│   │   │   ├── models/
│   │   │   │   ├── flower-product.ts
│   │   │   │   └── care-instruction.ts
│   │   │   ├── service.ts
│   │   │   └── index.ts
│   │   ├── occasion/         # Occasion module
│   │   │   ├── models/
│   │   │   │   └── occasion.ts
│   │   │   ├── service.ts
│   │   │   └── index.ts
│   │   ├── delivery-slot/    # Delivery scheduling module
│   │   │   ├── models/
│   │   │   │   ├── delivery-slot.ts
│   │   │   │   └── order-delivery.ts
│   │   │   ├── service.ts
│   │   │   └── index.ts
│   │   └── subscription/     # Subscription module
│   │       ├── models/
│   │       │   └── flower-subscription.ts
│   │       ├── service.ts
│   │       └── index.ts
│   ├── links/                # Module links
│   │   ├── flower-product.ts
│   │   ├── order-delivery.ts
│   │   ├── customer-subscription.ts
│   │   └── product-occasion.ts
│   ├── workflows/            # Custom workflows
│   │   ├── schedule-flower-delivery.ts
│   │   └── create-subscription.ts
│   ├── api/                  # API routes
│   │   ├── store/
│   │   │   ├── flowers/      # Flower products API
│   │   │   ├── occasions/    # Occasions API
│   │   │   ├── delivery-slots/ # Delivery slots API
│   │   │   ├── subscriptions/ # Subscriptions API
│   │   │   └── schedule-delivery/ # Schedule delivery API
│   │   └── admin/
│   │       └── custom/
│   ├── subscribers/          # Event subscribers
│   │   ├── order-placed.ts
│   │   └── product-created.ts
│   ├── admin/                # Admin customizations
│   │   └── widgets/
│   │       ├── flower-inventory-widget.tsx
│   │       └── delivery-schedule-widget.tsx
│   └── scripts/              # Seed scripts
│       ├── seed-flower-shop.ts
│       └── seed-customers.ts
├── medusa-config.ts          # Medusa configuration
└── package.json

```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/flower_shop
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001,http://localhost:7000
AUTH_CORS=http://localhost:8000,http://localhost:7001,http://localhost:7000
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

3. **Run database migrations:**
```bash
npx medusa db:migrate
```

4. **Seed flower shop data:**
```bash
npm run seed:flower
```

5. **Seed customer data (optional):**
```bash
npm run seed:customers
```

6. **Start the development server:**
```bash
npm run dev
```

The backend will be available at `http://localhost:9000`

## 📡 API Endpoints

### Store API

#### Flowers
- `GET /store/flowers` - List all flowers with filters
  - Query params: `flower_type`, `color`, `size`, `care_level`, `is_seasonal`
- `GET /store/flowers/:id` - Get flower details with care instructions

#### Occasions
- `GET /store/occasions` - List all active occasions

#### Delivery Slots
- `GET /store/delivery-slots` - List available delivery slots
  - Query params: `date`, `day_of_week`

#### Subscriptions
- `POST /store/subscriptions` - Create new subscription
- `GET /store/subscriptions/:id` - Get subscription details
- `POST /store/subscriptions/:id` - Update subscription (pause, resume, cancel)

#### Delivery Scheduling
- `POST /store/schedule-delivery` - Schedule delivery for an order
  ```json
  {
    "order_id": "order_123",
    "delivery_slot_id": "slot_456",
    "delivery_date": "2025-10-01",
    "recipient_name": "John Doe",
    "recipient_phone": "+1234567890",
    "delivery_address": "123 Main St",
    "gift_message": "Happy Birthday!",
    "is_anonymous": false
  }
  ```

## 🎨 Admin Dashboard

The admin dashboard includes custom widgets:

1. **Flower Inventory Widget** - Shows:
   - Fresh flowers count
   - Low stock alerts
   - Expiring items
   - Popular flowers

2. **Delivery Schedule Widget** - Shows:
   - Today's deliveries by time slot
   - Order counts per slot
   - Total deliveries

Access admin at: `http://localhost:9000/app`

## 🗃️ Database Models

### FlowerProduct
```typescript
{
  id: string
  product_id: string
  flower_type: string  // "Rose", "Tulip", "Orchid", etc.
  color: string
  size: "small" | "medium" | "large" | "extra_large"
  stem_count: number
  freshness_guarantee_days: number
  harvest_date: Date
  origin_country: string
  farm_name: string
  care_level: "easy" | "moderate" | "difficult"
  scent_level: "none" | "light" | "moderate" | "strong"
  is_seasonal: boolean
  season_available: string
  symbolism: string
  is_available: boolean
}
```

### Occasion
```typescript
{
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color_theme: string
  recommended_flower_types: string[]  // JSON
  typical_message_examples: string[]  // JSON
  peak_season_start: string  // MM-DD
  peak_season_end: string  // MM-DD
}
```

### DeliverySlot
```typescript
{
  id: string
  name: string
  start_time: string  // "08:00"
  end_time: string  // "12:00"
  day_of_week: string
  max_orders: number
  current_orders: number
  is_express: boolean
  extra_fee: number
  cutoff_hours: number
}
```

### FlowerSubscription
```typescript
{
  id: string
  customer_id: string
  frequency: "weekly" | "bi_weekly" | "monthly"
  delivery_day: string
  delivery_slot_id: string
  start_date: Date
  status: "active" | "paused" | "cancelled" | "expired"
  product_ids: string[]  // JSON
  price: number
  next_delivery_date: Date
  skip_next: boolean
  auto_renew: boolean
}
```

## 🔄 Workflows

### Schedule Flower Delivery Workflow
Handles the complete flow of scheduling a delivery:
1. Validates delivery slot availability
2. Creates order delivery record
3. Updates slot capacity
4. Includes rollback on failure

### Create Subscription Workflow
Handles subscription creation:
1. Validates subscription data
2. Creates subscription record
3. Sets up recurring delivery schedule
4. Includes rollback on failure

## 📊 Sample Data

Running `npm run seed:flower` creates:
- **3 flower products** (Red Rose Bouquet, Mixed Tulip Bundle, Elegant Orchid Plant)
- **6 categories** (Roses, Tulips, Orchids, Bouquets, Wedding Flowers, Sympathy Flowers)
- **6 occasions** (Birthday, Anniversary, Wedding, Sympathy, Valentine's Day, Mother's Day)
- **4 delivery slots** (Morning, Afternoon, Evening, Express)
- **3 care instruction guides** (Rose, Tulip, Orchid)
- **2 regions** (North America, Vietnam)
- **2 shipping options** (Same Day, Next Day)
- **Full inventory** (500 units per product)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed:flower` - Seed flower shop data
- `npm run seed:customers` - Seed customer data
- `npm run test:integration:http` - Run HTTP integration tests
- `npm run test:unit` - Run unit tests

### Adding New Flower Types

1. Add flower metadata when creating a product
2. Create care instructions for the flower type
3. Link to appropriate occasions
4. Update inventory levels

## 📚 Documentation

- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa v2 Architecture](https://docs.medusajs.com/learn/introduction/architecture)
- [Commerce Modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules)

## 🤝 Contributing

This is a customized Medusa implementation for flower shops. Feel free to extend it with:
- Additional flower types
- More delivery options
- Bouquet builder functionality
- Corporate account management
- Advanced reporting
- SMS notifications
- Email marketing integration

## 📝 License

MIT

---

**Built with ❤️ using Medusa v2.10.0**

For questions or support, visit [Medusa Discord](https://discord.com/invite/medusajs) 