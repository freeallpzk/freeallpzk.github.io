const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Путь для сохранения данных
app.post('/save-data', (req, res) => {
    const data = req.body;

    fs.readFile('Base.json', 'utf8', (err, fileContent) => {
        let fileData = fileContent ? JSON.parse(fileContent) : [];
        fileData.push(data);

        fs.writeFile('Base.json', JSON.stringify(fileData), (err) => {
            if (err) {
                res.status(500).send('Ошибка при сохранении данных');
            } else {
                res.status(200).send('Данные успешно сохранены');
            }
        });
    });
});

// Путь для фильтрации данных
app.post('/get-data', (req, res) => {
    const { ageRange, hashtagsFilter, fioFilter } = req.body;

    fs.readFile('Base.json', 'utf8', (err, fileContent) => {
        if (err) {
            return res.status(500).send('Ошибка при чтении данных');
        }

        let data = JSON.parse(fileContent || '[]');
        data = data.filter(item => {
            // Фильтрация по возрасту
            let ageMatch = true;
            if (ageRange) {
                const [min, max] = ageRange.split('-');
                if (max) {
                    ageMatch = item.age >= min && item.age <= max;
                } else {
                    ageMatch = item.age >= min;
                }
            }

            // Фильтрация по хэштегам
            let hashtagsMatch = true;
            if (hashtagsFilter.length > 0) {
                hashtagsMatch = hashtagsFilter.every(tag => item.hashtags.includes(tag));
            }

            // Фильтрация по ФИО
            let fioMatch = true;
            if (fioFilter) {
                fioMatch = item.fio.toLowerCase().includes(fioFilter.toLowerCase());
            }

            return ageMatch && hashtagsMatch && fioMatch;
        });

        res.status(200).json(data);
    });
});

// Слушаем на порту
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
