
import { prisma } from "../config/database.js";
import type { CreateCustomerInput } from "../validators/customers.validator.js";

export async function getCustomers(organizationId: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return customers;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
}

export async function createCustomer(
  input: CreateCustomerInput,
  organizationId: string
) {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        organizationId,
      },
    });

    return customer;
  } catch (error) {
    console.error("Failed to create customer:", error);
    throw error;
  }
}
