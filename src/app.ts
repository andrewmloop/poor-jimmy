import "dotenv/config";
import { Client } from "./entities/Client";

// ENV variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;

const client = new Client(DISCORD_TOKEN);

client.login(DISCORD_TOKEN);
