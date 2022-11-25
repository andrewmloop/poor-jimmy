import { EmbedBuilder } from "discord.js";

export default class ResponseBuilder extends EmbedBuilder {
  public constructor() {
    super();
  }

  public setFailure(): this {
    this.setColor(0xff0000);
    return this;
  }

  public setSuccess(): this {
    this.setColor(0x00ff00);
    return this;
  }
}
