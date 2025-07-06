const TelegramBotApi = require("node-telegram-bot-api");
const fs = require('fs');
const path = require('path');

const { buildCalendar, getMetaData } = require("./utils");

const token = '7710325866:AAFmDgHyI7iY4bkHDxccssSK7h742HsYhrg';

const bot = new TelegramBotApi(token, { polling: true });

const COMMANDS = {
    start: '/start',
    vote: '/vote',
}

bot.onText(COMMANDS.start, async (message) => {
    const { chatId, firstName } = getMetaData(message);

    try {
        const mainPhoto = await fs.createReadStream(path.join(__dirname, 'assets', 'main-photo.jpg'));

        const caption = `
👻 Бу! Испугался? Не бойся — я друг!

${firstName}, приветствую тебя, будущий frontend-разработчик!

Этот бот поможет в формате голосования выбрать удобное время для следующего занятия по разработке.

Введите команды:
    - ${COMMANDS.vote} - для выбора времени следующего занятия!
`.trim();

        await bot.sendPhoto(chatId, mainPhoto, {
            caption: caption,
            parse_mode: 'Markdown'
        });
    }
    catch (error) {
        await bot.sendMessage(chatId, 'Что то пошло не так!')
    }
});

bot.onText(COMMANDS.vote, async (message) => {
    const { chatId } = getMetaData(message);

    try {
        const now = new Date();
        const caption = `
Следующие занятие будет по теме:
#JAVASCRIPT
Занятие 12 - Прототипы, наследование часть 2
Выберите дату:
`;

        bot.sendMessage(chatId, caption, {
            reply_markup: buildCalendar(now.getFullYear(), now.getMonth())
        });
    }
    catch (error) {
        await bot.sendMessage(chatId, 'Что то пошло не так!')
    }
})

bot.on('callback_query', async (q) => {
    const [type, payload] = q.data.split(':');
    const { chatId, messageId } = getMetaData(q.message);

    if (type === 'DATE') {
        await bot.answerCallbackQuery(q.id, { text: `Вы выбрали ${payload}` });
    }

    if (['PREV', 'NEXT'].includes(type)) {
        let [year, month] = payload.split('-').map(Number);

        if (type === 'PREV') {
            month -= 1;

            if (month < 0) {
                month = 11;
                year -= 1;
            }
        } else {
            month += 1;
            if (month > 11) {
                month = 0;
                year += 1;
            }
        }

        const newMarkup = buildCalendar(year, month);

        await bot.editMessageReplyMarkup(newMarkup, {
            chat_id: chatId,
            message_id: messageId
        });

        await bot.answerCallbackQuery(q.id);
    }
});