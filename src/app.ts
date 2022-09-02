import "dotenv/config";
import { Client } from "./utils/Client";

// ENV variables
const TOKEN = process.env.TOKEN;
const GUILDID = process.env.GUILDID;

const client = new Client(TOKEN, GUILDID);

client.login(TOKEN);
