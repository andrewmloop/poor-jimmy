import "dotenv/config";
import { Client } from "./utils/Client";

// ENV variables
const TOKEN = process.env.TOKEN;

const client = new Client(TOKEN);

client.login(TOKEN);
