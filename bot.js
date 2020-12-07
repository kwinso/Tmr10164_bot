const fs = require("fs");
const path = require("path");
const { Telegraf, filter } = require('telegraf');
const Markup = require('telegraf/markup');

const dropOldUpdatesModern = filter(({ message }) => {
  const now = new Date().getTime() / 1000;
  return !message || message.date > (now - 60 * 2);
});

const BOT_TOKEN = "1346820594:AAHljIBK2lELio9nN0oFJS2_okce063WzF8"

const bot = new Telegraf(BOT_TOKEN);
bot.use(dropOldUpdatesModern);

let voices; 

async function loadVoices() {
    const jsonVoices = await fs.readFileSync(path.join(__dirname, "timur.json"));
    voices = JSON.parse(jsonVoices);
} 

bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
    try {
                
        const programmer = Math.floor(Math.random() * 100) + 1;
        const query = inlineQuery.query.trim();
        let foundVoices;
        if (query) {
            foundVoices = voices.filter(v => v.tags.includes(query));
        } else {
            foundVoices = voices;
        } 
        const repsonse = foundVoices.map((v, index) => {
            return {
                type: "voice", 
                id: index + 2,
                title: v.title,
                voice_url: v.voice_url
            }
        });
        repsonse.unshift({
            type: "article", 
            id: 1,
            title: `Какой уровень программирования у ${query || "у тебя"}?`,
            thumb_url: "https://i.ibb.co/3dkm2wk/tmr-pic.jpg",
            reply_markup: Markup.inlineKeyboard([
                Markup.switchToCurrentChatButton("Поделиться своим уровнем программирования", '')
            ]),
            input_message_content: {
                message_text: query ? `У ${query} есть ${programmer} паяльник(-ов)!` : `У меня ${programmer} паяльник(-ов)!`
            }
        })
        return answerInlineQuery(repsonse, { cache_time: 10})
    } catch (e) {
        console.log(e);
    }
});

async function startBot() {
    await loadVoices();
    await bot.launch();
    console.log("Bot started");
}

startBot();