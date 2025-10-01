import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";

export default async function seedCustomers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Seeding customer data...");

  const customersData = [
    {
      email: "john.doe@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "+1234567890",
    },
    {
      email: "jane.smith@example.com",
      first_name: "Jane",
      last_name: "Smith",
      phone: "+1987654321",
    },
    {
      email: "alice.johnson@example.com",
      first_name: "Alice",
      last_name: "Johnson",
      phone: "+44123456789",
    },
    {
      email: "bob.wilson@example.com",
      first_name: "Bob",
      last_name: "Wilson",
      phone: "+49123456789",
    },
    {
      email: "emma.brown@example.com",
      first_name: "Emma",
      last_name: "Brown",
      phone: "+33123456789",
    },
    {
      email: "michael.davis@example.com",
      first_name: "Michael",
      last_name: "Davis",
      phone: "+39123456789",
    },
    {
      email: "sarah.miller@example.com",
      first_name: "Sarah",
      last_name: "Miller",
      phone: "+34123456789",
    },
    {
      email: "david.garcia@example.com",
      first_name: "David",
      last_name: "Garcia",
      phone: "+45123456789",
    },
    {
      email: "lisa.anderson@example.com",
      first_name: "Lisa",
      last_name: "Anderson",
      phone: "+46123456789",
    },
    {
      email: "test.customer@example.com",
      first_name: "Test",
      last_name: "Customer",
      phone: "+1555000000",
    },
  ];

  try {
    const { result } = await createCustomersWorkflow(container).run({
      input: {
        customersData: customersData,
      },
    });

    logger.info(`Successfully created ${result.length} customers:`);
    result.forEach((customer, index) => {
      logger.info(`${index + 1}. ${customer.first_name} ${customer.last_name} (${customer.email})`);
    });

  } catch (error) {
    logger.error("Error creating customers:", error);
    throw error;
  }

  logger.info("Finished seeding customer data.");
} 