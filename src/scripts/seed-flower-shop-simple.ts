import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedFlowerShop({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("🌸 Setting up Flower Shop...");

  // 1. Setup Store
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "usd", is_default: true },
          { currency_code: "eur", is_default: false },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // 2. Check and Create Regions (only if not exist)
  logger.info("🌍 Checking regions...");
  const existingRegions = await regionModuleService.listRegions();
  let regionResult = existingRegions;

  if (existingRegions.length === 0) {
    logger.info("Creating new regions...");
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries: ["us"],
            payment_providers: ["pp_system_default"],
          },
          {
            name: "Europe",
            currency_code: "eur",
            countries: ["de", "fr", "it", "es", "nl"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    regionResult = result;
  } else {
    logger.info(`Found ${existingRegions.length} existing regions, skipping creation.`);
  }

  // 3. Create Tax Regions (only if needed)
  const allCountries = ["us", "de", "fr", "it", "es", "nl"];
  const existingTaxRegions = await query.graph({
    entity: "tax_region",
    fields: ["country_code"],
  });
  
  const existingCountries = existingTaxRegions.data.map((tr: any) => tr.country_code);
  const missingCountries = allCountries.filter(country => !existingCountries.includes(country));
  
  if (missingCountries.length > 0) {
    logger.info(`Creating tax regions for: ${missingCountries.join(", ")}`);
    await createTaxRegionsWorkflow(container).run({
      input: missingCountries.map(country_code => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  }

  // 4. Check and Create Stock Location
  logger.info("📦 Checking warehouse...");
  const existingLocations = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  let stockLocation;
  const flowerWarehouse = existingLocations.data.find((loc: any) => 
    loc.name.includes("Flower") || loc.name.includes("flower")
  );

  if (!flowerWarehouse) {
    logger.info("Creating flower warehouse...");
    const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Flower Warehouse",
            address: {
              city: "New York",
              country_code: "US",
              address_1: "123 Flower District",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
  } else {
    stockLocation = flowerWarehouse;
    logger.info(`Using existing warehouse: ${stockLocation.name}`);
  }

  // 5. Create Shipping Profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Default Shipping Profile", type: "default" }],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  // 6. Create Fulfillment Set (if not exists)
  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();
  let fulfillmentSet;

  const flowerFulfillmentSet = existingFulfillmentSets.find(fs => 
    fs.name.includes("Flower") || fs.name.includes("flower")
  );

  if (!flowerFulfillmentSet) {
    logger.info("Creating fulfillment set...");
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Flower Delivery Service",
      type: "shipping",
      service_zones: [
        {
          name: "Delivery Zone",
          geo_zones: [
            { country_code: "us", type: "country" as const },
            { country_code: "de", type: "country" as const },
            { country_code: "fr", type: "country" as const },
            { country_code: "it", type: "country" as const },
            { country_code: "es", type: "country" as const },
            { country_code: "nl", type: "country" as const },
          ],
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });
  } else {
    fulfillmentSet = flowerFulfillmentSet;
    logger.info("Using existing fulfillment set");
  }

  // 7. Create Shipping Options (if not exists)
  const existingShippingOptions = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  });

  const hasFlowerShipping = existingShippingOptions.data.some((so: any) => 
    so.name.includes("Same Day") || so.name.includes("Next Day")
  );

  if (!hasFlowerShipping) {
    logger.info("🚚 Creating shipping options...");
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Same Day Delivery",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Same Day",
            description: "Delivered same day if ordered before 2 PM",
            code: "same-day",
          },
          prices: [
            { currency_code: "usd", amount: 1500 },
            { currency_code: "eur", amount: 1400 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
          ],
        },
        {
          name: "Next Day Delivery",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Next Day",
            description: "Delivered next business day",
            code: "next-day",
          },
          prices: [
            { currency_code: "usd", amount: 1000 },
            { currency_code: "eur", amount: 900 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
          ],
        },
      ],
    });
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  // 8. Check and Create Flower Categories
  logger.info("📂 Checking flower categories...");
  const existingCategories = await productModuleService.listProductCategories();
  
  const flowerCategoryHandles = [
    "fresh-cut-flowers",
    "bouquets-arrangements", 
    "plants-potted-flowers",
    "wedding-flowers",
    "sympathy-funeral"
  ];

  const hasFlowerCategories = existingCategories.some(cat => 
    cat.handle && flowerCategoryHandles.includes(cat.handle)
  );

  let categoryResult = existingCategories;

  if (!hasFlowerCategories) {
    try {
      logger.info("Creating flower categories...");
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            {
              name: "Fresh Cut Flowers",
              description: "Beautiful fresh cut flowers for any occasion",
              handle: "fresh-cut-flowers",
              is_active: true,
            },
            {
              name: "Bouquets & Arrangements",
              description: "Pre-designed bouquets and floral arrangements",
              handle: "bouquets-arrangements",
              is_active: true,
            },
            {
              name: "Plants & Potted Flowers",
              description: "Living plants and potted flowering plants",
              handle: "plants-potted-flowers",
              is_active: true,
            },
            {
              name: "Wedding Flowers",
              description: "Elegant flowers perfect for weddings",
              handle: "wedding-flowers",
              is_active: true,
            },
            {
              name: "Sympathy & Funeral",
              description: "Respectful arrangements for sympathy and funeral services",
              handle: "sympathy-funeral",
              is_active: true,
            },
          ],
        },
      });
      categoryResult = result;
    } catch (error) {
      logger.info("Categories may already exist, using existing ones");
      categoryResult = await productModuleService.listProductCategories();
    }
  } else {
    logger.info("Using existing categories");
  }

  // 9. Check and Create Flower Products
  logger.info("🌹 Checking flower products...");
  const existingProducts = await productModuleService.listProducts();
  
  const flowerProductNames = [
    "Premium Red Rose Bouquet",
    "Spring Tulip Mix", 
    "Elegant White Orchid Plant"
  ];

  const hasFlowerProducts = existingProducts.some(product => 
    product.title && flowerProductNames.some(flowerName => product.title.includes(flowerName))
  );

  if (!hasFlowerProducts) {
    logger.info("Creating flower products...");
    const { result: productsResult } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Premium Red Rose Bouquet",
            description: "Elegant bouquet of 24 premium red roses, perfect for expressing love and romance. Each rose is hand-selected for quality and freshness.",
            handle: "premium-red-rose-bouquet",
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            weight: 500,
            category_ids: [
              categoryResult.find(cat => cat.name === "Fresh Cut Flowers")?.id,
              categoryResult.find(cat => cat.name === "Bouquets & Arrangements")?.id,
            ].filter(Boolean) as string[],
            images: [
              { url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80" },
            ],
            options: [
              {
                title: "Size",
                values: ["Standard"],
              },
            ],
            variants: [
              {
                title: "Standard Bouquet",
                sku: "ROSE-RED-STD",
                options: {
                  Size: "Standard",
                },
                prices: [
                  { currency_code: "usd", amount: 7500 },
                  { currency_code: "eur", amount: 6800 },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Spring Tulip Mix",
            description: "Vibrant collection of mixed tulips in assorted spring colors. Brings the freshness of spring to any space.",
            handle: "spring-tulip-mix",
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            weight: 400,
            category_ids: [
              categoryResult.find(cat => cat.name === "Fresh Cut Flowers")?.id,
            ].filter(Boolean) as string[],
            images: [
              { url: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80" },
            ],
            options: [
              {
                title: "Bundle Size",
                values: ["20 Stems"],
              },
            ],
            variants: [
              {
                title: "20 Stems Bundle",
                sku: "TULIP-MIX-20",
                options: {
                  "Bundle Size": "20 Stems",
                },
                prices: [
                  { currency_code: "usd", amount: 4500 },
                  { currency_code: "eur", amount: 4200 },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Elegant White Orchid Plant",
            description: "Sophisticated white orchid plant with multiple blooms. Long-lasting and perfect for home or office decoration.",
            handle: "elegant-white-orchid-plant",
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            weight: 1200,
            category_ids: [
              categoryResult.find(cat => cat.name === "Plants & Potted Flowers")?.id,
            ].filter(Boolean) as string[],
            images: [
              { url: "https://images.unsplash.com/photo-1551967218-94a67c0c4a76?w=800&q=80" },
            ],
            options: [
              {
                title: "Type",
                values: ["Single Plant"],
              },
            ],
            variants: [
              {
                title: "Single Plant",
                sku: "ORCHID-WHITE-SINGLE",
                options: {
                  Type: "Single Plant",
                },
                prices: [
                  { currency_code: "usd", amount: 8500 },
                  { currency_code: "eur", amount: 7800 },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
        ],
      },
    });

    // 10. Setup Inventory for new products
    logger.info("📦 Setting up inventory...");
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    });

    if (inventoryItems.length > 0) {
      const inventoryLevels = inventoryItems.map((item: any) => ({
        location_id: stockLocation.id,
        stocked_quantity: 100,
        inventory_item_id: item.id,
      }));

      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: inventoryLevels },
      });
    }
  } else {
    logger.info("Flower products already exist, skipping creation");
  }

  // Success Summary
  logger.info("✅ Flower Shop setup completed successfully!");
  logger.info("🌺 Summary:");
  logger.info(`   - ${categoryResult.length} categories available`);
  logger.info(`   - ${existingProducts.length} products in store`);
  logger.info(`   - ${regionResult.length} regions configured`);
  logger.info(`   - Shipping and fulfillment ready`);
  logger.info("🎉 Your flower shop is ready for business!");
} 