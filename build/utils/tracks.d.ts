import { AudioResource } from "@discordjs/voice";
export interface TrackData {
    url: string;
    title: string;
    onStart: () => void;
    onFinish: () => void;
    onError: (error: Error) => void;
}
export declare class Track implements TrackData {
    readonly url: string;
    readonly title: string;
    readonly onStart: () => void;
    readonly onFinish: () => void;
    readonly onError: (error: Error) => void;
    private constructor();
    createAudioResource(): Promise<AudioResource<Track>>;
}
