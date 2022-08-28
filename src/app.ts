import "dotenv/config";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import commands from "./commands";
import { AudioPlayerStatus, createAudioPlayer } from "@discordjs/voice";
import getErrorMessage from "./utils/getErrorMessage";

// ENV variables
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Dynamically update commands on the client
client.commands = new Collection();
for (let command of commands) {
  client.commands.set(command.data.name, command);
}

const player = createAudioPlayer();

////////////////
// Client Events
////////////////
client.once("ready", () => {
  console.log(
    "Ready as: " + client.user?.username + "#" + client.user?.discriminator,
  );
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  try {
    if (command.isPlayer) await command.execute(interaction, player);
    else await command.execute(interaction);
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

//////////////////
//// Player events
//////////////////
player.on("error", (error) => {
  console.log(getErrorMessage(error));
});

player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
  console.log(`Now playing ${newState.resource.metadata}`);
});

client.login(TOKEN);
