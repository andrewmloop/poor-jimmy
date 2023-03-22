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
import SpotifyWebApi from "spotify-web-api-node";

export class Client extends DiscordClient {
  token: string;
  commands: Collection<string, Command>;
  // Map of guildId to active Queue
  queueMap: Map<string, Queue>;
  spotifyClient: SpotifyWebApi;

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
    this.queueMap = new Map();
    this.spotifyClient = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_SECRET,
    });

    this.spotifyClient.clientCredentialsGrant().then((data) => {
      this.spotifyClient.setAccessToken(data.body["access_token"]);
    });

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

        // Don't let a member that is not in a voice
        // channel use commands
        const member = interaction.member as GuildMember;
        if (!member.voice.channel) {
          interaction.reply("You are not in a voice channel!");
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
