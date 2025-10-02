import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function seedAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModuleService = container.resolve(Modules.USER);

  logger.info("🔐 Creating admin user...");

  const adminEmail = process.env.MEDUSA_ADMIN_EMAIL || "admin@yingfloral.com";
  const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD || "YingFloral2025!";

  try {
    // Check if admin user already exists
    const existingUsers = await userModuleService.listUsers({
      email: adminEmail,
    });

    if (existingUsers.length > 0) {
      logger.info(`✅ Admin user already exists: ${adminEmail}`);
      logger.info("ℹ️  If you need to reset the password, delete the user first or use a different email.");
      return;
    }

    // Create admin user with password
    const adminUser = await userModuleService.createUsers({
      email: adminEmail,
      first_name: "Admin",
      last_name: "Ying Floral",
      password: adminPassword,
    });

    logger.info("✅ Admin user created successfully!");
    logger.info("📧 Email: " + adminEmail);
    logger.info("🔑 Password: " + adminPassword);
    logger.info("");
    logger.info("🌐 Login at: https://yingfloral-production.up.railway.app/app");
    
  } catch (error: any) {
    logger.error("❌ Error creating admin user:");
    logger.error(error.message || error);
    
    // Provide helpful error messages
    if (error.message?.includes("duplicate key")) {
      logger.info("ℹ️  User might already exist. Try logging in with existing credentials.");
    }
    
    throw error;
  }
} 