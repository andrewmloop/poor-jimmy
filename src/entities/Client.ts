import {
  Client as DiscordClient,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  GuildMember,
  REST,
  Routes,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Queue } from "./Queue";
import { Command } from "./Command";
import { commandIndex } from "../commands";
import ResponseBuilder from "./ResponseBuilder";

export class Client extends DiscordClient {
  token: string;
  commands: Collection<string, Command>;
  // Map of guildId to Queue
  queueMap: Map<string, Queue>;
  // Map of guildId to Timeout
  timeOutMap: Map<string, NodeJS.Timeout>;

  public constructor(token: string) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.token = token;
    this.commands = new Collection();
    this.queueMap = new Map();
    this.timeOutMap = new Map();

    // Load all slash commands
    for (let command of commandIndex) {
      const commandObject = new command(this);
      this.commands.set(commandObject.name, commandObject);
    }

    // Register all slash commands globally to be used in any guild
    this.deployCommands(this.commands, this.token);

    // Add listeners
    this.once(Events.ClientReady, () => {
      console.log(`Ready! Logged in as ${this.user?.tag}`);
    });

    this.addListener(
      Events.InteractionCreate,
      async (interaction: CommandInteraction) => {
        if (!interaction.isCommand()) return;

        // Don't let a member that is not in a voice
        // channel use commands
        const member = interaction.member as GuildMember;
        if (!member.voice.channel) {
          const reply = new ResponseBuilder()
            .setFailure()
            .setDescription("You are not in a voice channel!");
          interaction.reply({ ephemeral: true, embeds: [reply] });
          return;
        }

        // Create a queue for the guild if one doesn't
        // exist already
        const guildId = interaction.guildId as string;
        const textChannel = interaction.channel as TextChannel;
        const voiceChannel = member.voice.channel as VoiceChannel;

        if (this.queueMap.get(guildId) === undefined) {
          this.queueMap.set(guildId, new Queue(voiceChannel, textChannel));
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
    const discordClientId = process.env.DISCORD_CLIENT_ID as string;
    try {
      await rest.put(Routes.applicationCommands(discordClientId), {
        body: commandData,
      });
      console.log("Successfully deployed slash commands!");
    } catch (error) {
      console.log(error);
    }
  }
}
