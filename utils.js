const buildCalendar = (year, month) => {
    const keyboard = [];
    const date = new Date(year, month, 1);

    // Заголовок: дни недели
    keyboard.push(
        ['Mo','Tu','We','Th','Fr','Sa','Su'].map(day => ({ text: day, callback_data: 'IGNORE' }))
    );

    // Пустые ячейки перед первым днём месяца
    const firstWeekDay = (date.getDay() + 6) % 7;
    let row = Array(firstWeekDay).fill({ text: ' ', callback_data: 'IGNORE' });

    // Заполняем числа месяца
    while (date.getMonth() === month) {
        row.push({
            text: String(date.getDate()),
            callback_data: `DATE:${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
        });
        if (row.length === 7) {
            keyboard.push(row);
            row = [];
        }
        date.setDate(date.getDate() + 1);
    }
    // Остаток последней недели
    if (row.length) keyboard.push(row.concat(Array(7 - row.length).fill({ text: ' ', callback_data: 'IGNORE' })));

    // Навигация между месяцами
    keyboard.unshift([
        { text: '‹', callback_data: `PREV:${year}-${month}` },
        { text: `${year}–${month+1}`, callback_data: 'IGNORE' },
        { text: '›', callback_data: `NEXT:${year}-${month}` }
    ]);
    return { inline_keyboard: keyboard };
};

const getMetaData = (message) => {
    const chatId = message.chat.id;
    const firstName = message.from.first_name;
    const messageId = message.message_id;

    return {
        chatId,
        firstName,
        messageId,
    }
}

module.exports = { buildCalendar, getMetaData }