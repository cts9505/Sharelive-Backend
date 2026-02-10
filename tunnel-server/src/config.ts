import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 8080,
  BASE_DOMAIN: process.env.BASE_DOMAIN || "sharelive.site"
};
