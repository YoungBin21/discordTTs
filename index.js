const discordTTS=require("discord-tts");
const {Client, Intents} = require("discord.js");
const {getVoiceConnection, AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel} = require("@discordjs/voice");
const tokenMy= require('./token.json');

const intents=
[
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS
];

const client = new Client({intents:intents});
client.login(tokenMy.token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let voiceConnection = null;
let audioPlayer=new AudioPlayer();

client.once('ready', () => {
    console.log('Bot is ready!')

    setInterval(() => {
        const statuses = [
            '= 할말 (5글자 이상 사용가능 원인 찾는중)'
        ]

        const status = statuses[Math.floor(Math.random() * statuses.length)]
        client.user.setActivity(status, {type: "PLAYING"})
    }, 1000) //1000 = 1초 5000 = 5초 10000 = 10초
})

client.on("messageCreate", async (msg)=>{
	const connection = getVoiceConnection(msg.guildId);
	const user_mas = msg.content;

	function timeOut() {
		getVoiceConnection(msg.guildId).destroy();
		voiceConnection = null
	}

	setInterval(timeOut, 3000);

	for (var i = 0; i < user_mas.length; i++) {
		if(user_mas[i] == "=") {
			const user_msg_Str = user_mas.substr(2, user_mas.length);
			const stream=discordTTS.getVoiceStream(user_msg_Str);
			const audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
			if(!voiceConnection || voiceConnection?.status===VoiceConnectionStatus.Disconnected){
				voiceConnection = joinVoiceChannel({
					channelId: msg.member.voice.channelId,
					guildId: msg.guildId,
					adapterCreator: msg.guild.voiceAdapterCreator,
				});
				voiceConnection=await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
			}
			
			if(voiceConnection.status===VoiceConnectionStatus.Connected){
				voiceConnection.subscribe(audioPlayer);
				audioPlayer.play(audioResource);
			}

		}
	}

	if(user_mas === "== command out") {
		connection.destroy();
		voiceConnection = null;
	}
	
});

client.login(tokenMy.token);