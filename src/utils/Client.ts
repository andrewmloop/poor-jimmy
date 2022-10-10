import {
  Client as DiscordClient,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  GuildMember,
  REST,
  Routes,
} from "discord.js";
import { Queue } from "./Bot";
import { Command } from "./Command";
import { commandIndex } from "../commands";

export class Client extends DiscordClient {
  token: string;
  commands: Collection<string, Command>;
  // Map of guildId to created Queue Array
  queueListMap: Map<string, Queue[]>;
  // Map of guildId to active Queue
  activeQueueMap: Map<string, Queue>;

  public constructor(token?: string) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.token = token as string;
    this.commands = new Collection();
    this.queueListMap = new Map();
    this.activeQueueMap = new Map();

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

        // Add guildId to queueListMap if not present
        const guildId = interaction.guildId as string;
        if (this.queueListMap.get(guildId) === undefined) {
          this.queueListMap.set(guildId, []);
        }

        // Don't let a member that is not in a voice
        // channel use commands
        const member = interaction.member as GuildMember;
        if (!member.voice.channel) {
          interaction.reply("You are not in a voice channel!");
          return;
        }

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
      console.log("Successfully deployed slash commands!");
    } catch (error) {
      console.log(error);
    }
  }

  addQueueToList(guildId: string, queue: Queue): void {
    const queueList = this.queueListMap.get(guildId);

    if (queueList) {
      queueList.push(queue);
    } else {
      const initList: Queue[] = [queue];
      this.queueListMap.set(guildId, initList);
    }
  }
}
