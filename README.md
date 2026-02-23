# Finance Tracker

Веб‑приложение для персонального учета финансов. Цель — быстрый и удобный учет расходов/доходов с аналитикой, а в будущем — перенос логики в мобильный клиент.

## Стек
- Backend: Python, Django 6, Django REST Framework
- Auth: JWT (SimpleJWT), email+password
- DB: PostgreSQL (Docker) / SQLite (локально)
- Frontend: React (Vite)
- Infra: Docker, Docker Compose

## Функциональность (MVP)
- Регистрация и вход по email+password
- Категории расходов (базовые + пользовательские)
- Счета (наличные/карта/вклад и т.п.)
- Операции (расходы/доходы), история операций
- Обзор и базовая аналитика
- Запланированные покупки

## Планируется
- Привязка категории к конкретному счету при вводе расходов
- Расширенная аналитика и фильтры
- Экспорт данных
- Google OAuth вход
- Мобильный клиент

## Быстрый старт (локально, SQLite)
1. Клонирование
```bash
git clone https://github.com/KingNothiing/finance-tracker.git
cd finance-tracker
```
2. Backend
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
3. Frontend
```bash
cd ../frontend
npm install
npm run dev
```

## Запуск через Docker (PostgreSQL)
1. Создай `.env` на основе `.env.example`
2. Запуск:
```bash
docker compose up --build
```
Backend будет доступен на `http://localhost:8000`, фронт — через `npm run dev`.

## Тесты
Backend:
```bash
cd backend
python manage.py test
```

## Структура проекта
- `backend/` — Django + DRF
- `frontend/` — React (Vite)
- `finance-tracker-docs/` — техническая документация и диаграммы
- `docker-compose.yml` — контейнеры (PostgreSQL + backend)
- `.env.example` — пример переменных окружения

## Документация
Полная спецификация: `finance-tracker-docs/TECH_DOC.md`
