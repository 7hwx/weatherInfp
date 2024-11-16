const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Настройка подключения к базе данных
const pool = new Pool({
    user: 'postgres', // Ваше имя пользователя PostgreSQL
    host: 'localhost',
    database: 'user_auth', // Имя вашей базы данных
    password: '7412369', // Укажите ваш пароль
    port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Эндпоинт для создания аккаунта
app.post('/create-account', async (req, res) => {
    const { email, nickname, password } = req.body;

    // Проверяем, что передано либо email и password, либо nickname и password
    if ((email && password && !nickname) || (nickname && password && !email)) {
        try {
            // Проверка на существование пользователя с таким email или nickname
            const existingUserQuery = email 
                ? 'SELECT * FROM users WHERE email = $1'
                : 'SELECT * FROM users WHERE nickname = $1';

            const existingUserResult = await pool.query(existingUserQuery, [email || nickname]);

            if (existingUserResult.rowCount > 0) {
                return res.status(400).json({ error: 'Пользователь с таким email или ником уже существует.' });
            }

            // Вставка нового пользователя
            const result = await pool.query(
                'INSERT INTO users (email, nickname, password) VALUES ($1, $2, $3) RETURNING *',
                [email || null, nickname || null, password]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error); // Логируем ошибку в консоль
            res.status(500).json({ error: 'Ошибка при создании аккаунта' });
        }
    } else {
        res.status(400).json({ error: 'Необходимо предоставить либо почту и пароль, либо ник и пароль.' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});