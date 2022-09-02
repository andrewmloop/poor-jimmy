import {
  Client as DiscordClient,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  Interaction,
  InteractionType,
  REST,
  Routes,
} from "discord.js";
import { Queue } from "./Bot";
import { Command } from "./Command";
import { commandIndex } from "../commands";

export class Client extends DiscordClient {
  commands: Collection<string, Command>;
  queueMap: Map<string, Queue>;
  token: string;
  testGuildId: string;

  public constructor(token?: string, testGuildId?: string) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.commands = new Collection();
    this.queueMap = new Map();
    this.token = token as string;
    this.testGuildId = testGuildId as string;

    // Load all commands
    for (let command of commandIndex) {
      const commandObject = new command(this);
      this.commands.set(commandObject.name, commandObject);
    }

    this.deployCommands(this.commands, this.token);

    this.once("ready", () => {
      console.log(
        "Ready as: " + this.user?.username + "#" + this.user?.discriminator,
      );
    });

    this.addListener(
      Events.InteractionCreate,
      async (interaction: CommandInteraction) => {
        if (!interaction.isCommand()) return;
        try {
          const command = this.commands.get(interaction.commandName);

          command?.execute(interaction);
        } catch (error) {
          console.log(error);
          interaction.followUp(`Error executing command: ${error}`);
        }
      },
    );
  }

  private async deployCommands(
    commands: Collection<string, Command>,
    token: string,
  ): Promise<void> {
    const commandData = commands.map((command) => command.data.toJSON());
    const rest = new REST({ version: "10" }).setToken(token);
    const CLIENTID = process.env.CLIENTID as string;
    try {
      await rest.put(Routes.applicationCommands(CLIENTID), {
        body: commandData,
      });
      console.log("Successfully deployed slash commands");
    } catch (error) {
      console.log(error);
    }
  }
}
