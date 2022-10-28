"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const Client_1 = require("./utils/Client");
// ENV variables
const TOKEN = process.env.TOKEN;
const client = new Client_1.Client(TOKEN);
client.login(TOKEN);
