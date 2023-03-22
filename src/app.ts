import "dotenv/config";
import { Client } from "./entities/Client";

// ENV variables
const discordToken = process.env.DISCORD_TOKEN;

const client = new Client(discordToken);

client.login(discordToken);
