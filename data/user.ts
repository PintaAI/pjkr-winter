import { db } from "@/lib/db";

/**
 * Fetch a user from the database by their email.
 *
 * @param email The email of the user to fetch.
 * @returns The user record, or null if no user was found.
 */
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  } catch (error) {
    console.error(`Failed to get user by email: ${email}`, error);
    throw error;
  }
};

/**
 * Fetch a user from the database by their id.
 *
 * @param id The id of the user to fetch.
 * @returns The user record, or null if no user was found.
 */
export const getUserById = async (id: string) => {
    try {
      const user = await db.user.findUnique({
        where: {
          id,
        },
      });
  
      return user;
    } catch (error) {
      console.error(`Failed to get user by id: ${id}`, error);
      throw error;
    }
  };
