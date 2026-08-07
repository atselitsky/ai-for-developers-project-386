# AI for Developers Project 386
[![Actions Status](https://github.com/atselitsky/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/atselitsky/ai-for-developers-project-386/actions)

Сервис бронирования встреч (аналог Cal.com) — монорепозиторий с TypeSpec спецификацией, Vue 3 фронтендом и Go бэкендом.

## Роли и сценарии

Владелец календаря — один заранее заданный профиль, используемый в админке по умолчанию. Гость бронирует слоты без создания аккаунта.

### Владелец календаря
- Создаёт типы событий (id, название, описание, длительность)
- Просматривает список предстоящих встреч по всем типам событий

### Гость
- Просматривает список типов событий с названием, описанием и длительностью
- Выбирает тип события, открывает календарь и выбирает свободный слот (окно 14 дней)
- Создаёт бронирование на выбранный слот

## Структура проекта

```
├── packages/
│   ├── typespec/          # TypeSpec спецификация
│   │   ├── main.tsp
│   │   ├── models.tsp
│   │   ├── operations.tsp
│   │   ├── package.json
│   │   └── tspconfig.yaml
│   │
│   └── frontend/          # Vue 3 приложение (в разработке)
│       └── src/
│
├── cmd/
│   └── server/            # Go бэкенд (в разработке)
│       └── main.go
│
├── package.json           # Yarn workspace
├── README.md
└── .gitignore
```

## Быстрый старт

```bash
# Установка зависимостей
yarn install

# Компиляция TypeSpec спецификации
yarn build:typespec

# Watch режим для TypeSpec
yarn watch:typespec
```

## API Specification

TypeSpec спецификация описывает REST API для сервиса бронирования.

### API Endpoints

#### Event Types (Типы событий)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/event-types` | Создать тип события |
| `GET` | `/event-types` | Список всех типов |
| `GET` | `/event-types/{id}` | Получить тип по ID |
| `PUT` | `/event-types/{id}` | Обновить тип |
| `DELETE` | `/event-types/{id}` | Удалить тип (ошибка 409, если есть брони) |

#### Bookings (Бронирования)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/bookings` | Создать бронирование |
| `GET` | `/bookings` | Список всех бронирований |
| `GET` | `/bookings/{id}` | Получить бронирование по ID |
| `DELETE` | `/bookings/{id}` | Отменить бронирование |

#### Time Slots (Слоты времени)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/slots?eventTypeId={id}` | Доступные слоты для типа события |

### Модели данных

#### EventType
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "duration": 30
}
```

#### Booking
```json
{
  "id": "uuid",
  "eventTypeId": "uuid",
  "guestName": "string",
  "guestEmail": "email",
  "comment": "string",
  "startTime": "2026-08-01T09:00:00Z",
  "endTime": "2026-08-01T09:30:00Z",
  "createdAt": "2026-08-01T08:00:00Z"
}
```

#### TimeSlot
```json
{
  "startTime": "2026-08-01T09:00:00Z",
  "endTime": "2026-08-01T09:30:00Z",
  "isAvailable": true
}
```

### Бизнес-правила

| Правило | Описание |
|---------|----------|
| **Длительность** | Кратна 15 минутам (15, 30, 45, ..., 480) |
| **Окно записи** | 14 дней от текущего момента |
| **Рабочие часы** | 09:00–18:00 UTC, Пн–Пт |
| **Пересечения** | Два бронирования на одно время запрещены (409 Conflict) |
| **Удаление типа** | Запрещено, если есть активные брони (409 Conflict) |

### Коды ответов

| Код | Ситуация |
|-----|----------|
| `200` | Успех |
| `204` | Успешное удаление (без тела ответа) |
| `400` | Некорректные данные запроса |
| `404` | Ресурс не найден |
| `409` | Конфликт (пересечение времени или нельзя удалить тип) |
| `422` | Слот вне рабочего окна |

### Авторизация

API требует API-ключ в заголовке:
```
X-API-Key: your-api-key-here
```

## Генерация OpenAPI

После компиляции TypeSpec спецификация генерирует OpenAPI 3.1.0 файл:

```
packages/typespec/tsp-output/@typespec/openapi3/openapi.yaml
```

Этот файл используется для:
- Генерации TypeScript клиента для Vue 3 фронтенда
- Генерации Go моделей и хендлеров для бэкенда
- Документации API (Swagger UI)

## Стек технологий

- **Specification:** TypeSpec
- **Frontend:** Vue 3 + Vite + TypeScript (в разработке)
- **Backend:** Go + SQLite (в разработке)
- **Package Manager:** Yarn (workspaces)

## Разработка

### TypeSpec

```bash
cd packages/typespec
yarn build      # компиляция
yarn watch      # watch режим
```

### Frontend (Vue 3)

```bash
cd packages/frontend
yarn dev       # dev-сервер
yarn build     # сборка
yarn test      # тесты
yarn lint:all  # все проверки (типы, lint, формат, стили)
```

Полный список команд — в `packages/frontend/package.json`.

### Backend (Go)

_TODO: добавить команды после инициализации_

## Лицензия

MIT
