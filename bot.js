const fs = require("fs");
const path = require("path");
const { Telegraf, filter } = require('telegraf');
const Markup = require('telegraf/markup');

const dropUpdates = filter(({ message }) => {
    const now = new Date().getTime() / 1000;
    return !message || message.date > (now - 60 * 2);
});

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(dropUpdates);

let voices;

async function loadVoices() {
    const jsonVoices = fs.readFileSync(path.join(__dirname, "timur.json"));
    voices = JSON.parse(jsonVoices);
}

function getNumberNoun(n) {
    const forms = ["паяльник", "паяльника", "паяльников"]
    n = Math.abs(n) % 100; const n1 = n % 10;
    if (n > 10 && n < 20) { return forms[2]; }
    if (n1 > 1 && n1 < 5) { return forms[1]; }
    if (n1 == 1) { return forms[0]; }
    return forms[2];
}

bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
    try {
        const programmer = Math.floor(Math.random() * 100) + 1;
        const query = inlineQuery.query.trim();
        let foundVoices = [];
        
        if (query) {
            voices.forEach(v => {
                v.tags.forEach(tag => { 
                    if (tag.toLowerCase().indexOf(query.toLowerCase()) > -1) foundVoices.push(v);
                });
            });
        } else {
            foundVoices = voices;
        }
        const repsonse = foundVoices.map((v, index) => {
            return {
                type: "voice",
                id: index + 3,
                title: v.title,
                voice_url: v.voice_url
            }
        });

        if (query) {
            repsonse.unshift({
                type: "article",
                id: 2,
                title: `Обращение к анимешнику ${query}`,
                thumb_url: "https://i.ibb.co/3dkm2wk/tmr-pic.jpg",
                reply_markup: Markup.inlineKeyboard([
                    Markup.switchToCurrentChatButton(`Отправь такой совет знакомому анимешнику. Быстро!`, '')
                ]),
                input_message_content: {
                    message_text: `Чел, ${query}, ты, блять, не Кира. Ты просто, блять, не этот... Понимаешь, ты просто, блять, этот... Ты просто анимешник, которому нехуй делать. Найди себе, блять, тянку. Только найди, блять, нормальную, чтобы, нахуй.. Блять,  у тебя всё было заебись с ней, блять, типа... Она, блять, по хате там убиралась, вся такая хуйня, блять. И тебе будет нормально всё, блять. Хватит быть ёбанным анимешником.`
                }
            })
        }

        repsonse.unshift({
            type: "article",
            id: 1,
            title: `Какой уровень программирования у ${query || "у тебя"}?`,
            thumb_url: "https://i.ibb.co/3dkm2wk/tmr-pic.jpg",
            reply_markup: Markup.inlineKeyboard([
                Markup.switchToCurrentChatButton("Поделиться своим уровнем программирования", '')
            ]),
            input_message_content: {
                message_text: query ? `У ${query} есть ${programmer} ${getNumberNoun(programmer)}!` : `У меня ${programmer} ${getNumberNoun(programmer)}!`
            }
        });
        
        return answerInlineQuery(repsonse, { cache_time: 10 })
    } catch (e) {
        console.log(e);
    }
});


async function startBot() {
    await loadVoices();

    if (process.env.BOT_ENV == "prod") {
        const port = parseInt(process.env.PORT || "3000");

        await bot.launch({
            webhook: {
                domain: process.env.WH_DOMAIN,
                port
            }
        });

        console.log(`Bot started in production configuraion on port ${port}`);
    }
    else if (process.env.BOT_ENV == "dev") {
        await bot.launch();
        console.log("Bot stated in dev configuraion");
    }
    else console.log("Unknown BOT_ENV Value");
}

startBot();