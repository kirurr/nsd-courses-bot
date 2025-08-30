#!/bin/bash
DB_NAME="app.db"

# Удаляем старую БД, если есть
rm -f "$DB_NAME"

# Создаём новую БД и схему
sqlite3 "$DB_NAME" <<EOF
PRAGMA foreign_keys = ON;

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS user (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    is_accepted NUMERIC NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    state TEXT
);

-- Таблица курсов
CREATE TABLE IF NOT EXISTS course (
    id INTEGER PRIMARY KEY,
    title TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    group_id TEXT NOT NULL,
	payment_link TEXT NOT NULL
);

-- Таблица оплат
CREATE TABLE IF NOT EXISTS payment (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    is_invited NUMERIC NOT NULL DEFAULT 0,
    CONSTRAINT payment_user_id_user_telegram_id_fk FOREIGN KEY(user_id) REFERENCES user(telegram_id),
    CONSTRAINT payment_course_id_course_id_fk FOREIGN KEY(course_id) REFERENCES course(id)
);

-- Тестовые данные
INSERT INTO admin (id, email, password) VALUES
    (1, 'admin@example.com', 'adminpass') ON CONFLICT DO NOTHING;

INSERT INTO course (id, title, description, group_id, payment_link) VALUES
(1, 'Кулинарное мастерство: готовим как шеф-повар', 'Изучи секреты профессиональных поваров и начни готовить блюда ресторанного уровня дома\. \\nНа курсе мы разберём техники нарезки, правильное сочетание продуктов и принципы вкусового баланса\.\\n\\nИтогом станет полноценное меню из нескольких авторских блюд, которые поразят твоих близких\.\\n\\nСтоимость: 5 500 ₽\\n\\nВидео\-пример: [Смотреть на Rutube](https://rutube.ru/video/8c6c7e53a82341fb91fd0e25b65e92bb/)', '-1003058593207', 'https://link.payment.com'),
(2, 'Искусство фотографии: от композиции до обработки', 'На курсе ты узнаешь, как строить гармоничную композицию, работать со светом и тенями, подбирать ракурсы\. \\nМы освоим основы портретной и пейзажной съёмки, а также научимся базовой обработке снимков\.\\n\\nПодходит для начинающих фотографов и тех, кто хочет развить своё творческое видение\.\\n\\nСтоимость: 4 900 ₽\\n\\nВидео\-пример: [Смотреть на Rutube](https://rutube.ru/video/5e5c42a34b2c7c33a2e0b4d7dfbdf12e/)', '-1003058593207', 'https://link.payment.com') ON CONFLICT DO NOTHING;
EOF

echo "База данных '$DB_NAME' создана и заполнена."
