import { REST, Routes } from "discord.js";
import "dotenv/config";
import commandIndex from "./commands";

const CLIENTID = process.env.CLIENTID as string;
const GUILDID = process.env.GUILDID;
const TOKEN = process.env.TOKEN as string;

const commands = [];
for (const command of commandIndex) {
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENTID), {
      body: commands,
    });
    console.log("Successfully deployed slash commands");
  } catch (error) {
    console.log(error);
  }
})();
