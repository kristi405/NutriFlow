# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# NutriFlow — контекст для ИИ-агентов

Мобильное приложение для питания: персональная норма КБЖУ, автоматическое меню на неделю,
рецепты, список покупок, трекинг веса/воды/шагов, AI-анализ результатов анализов (Google Gemini).
Подписка Premium через RevenueCat. Команды сборки — в [BUILD.md](BUILD.md).

## Репозиторий и соседние проекты

```
~/myprojects/NUTRI/
├── NutriFlow/            ← это приложение (Expo / React Native), git: github.com/kristi405/NutriFlow
├── NUTRIFLOW_BACKEND/    ← API: Node.js + Fastify 5 + PostgreSQL (pgobject), см. его README.md и API.md
├── NUTRIFLOW_FRONTEND/   ← веб-админка/сайт: Vite
└── store-assets/         ← картинки для Google Play (иконка подписки и т.п.)
```

## Стек

- **Expo SDK 57**, React Native 0.86, React 19.2, **expo-router** (файловая маршрутизация в `src/app/`)
- Состояние: **MobX** (`src/store/*Store.js`), серверные данные: **@tanstack/react-query**
- i18n: **i18next**, 6 языков — `en, ru, de, es, pt, pl` (`src/i18n/locales/*.json`). Любой новый текст UI добавлять во **все 6** файлов.
- Вход: Google (`@react-native-google-signin/google-signin`), Apple (`expo-apple-authentication`), гостевой режим (только рецепты)
- Подписки: `react-native-purchases` (RevenueCat)
- Шаги: `expo-sensors` Pedometer (только на устройстве, на сервер не уходит)
- Голосовой поиск: `expo-speech-recognition`

## Структура `src/`

| Папка | Что там |
|---|---|
| `app/` | Экраны (expo-router). `(tabs)/` — нижние вкладки: index (главная), meal-plan, recipes, progress, ai-analysis, articles. `paywall.js`, `profile.js`, `privacy-policy.js` и др. |
| `components/` | UI-компоненты, `auth/google-sign-in-button.js` — вход через Google |
| `store/` | MobX-сторы: `authStore`, `subscriptionStore`, `mealPlanStore`, `profileStore`… `persist.js` — сохранение в AsyncStorage |
| `lib/` | Утилиты: `api.js` (запросы к бэкенду), `purchases.js` (RevenueCat), `premium.js`, `mealPlanGenerator.js`, `nutrition/` |
| `services/` | `ai/` (анализ анализов), `repositories/` |
| `hooks/` | `useStepCount`, `useRecipes`, `useDailyNutrition`… |
| `i18n/` | Переводы |
| `data/` | Каталог и seed-данные |

Алиас импорта: `@/` → `src/` (см. `jsconfig.json`).

## Идентификаторы

| Что | Значение |
|---|---|
| Android package / iOS bundle id | `com.nutriFlow` |
| Expo owner / slug | `kristina_gyk` / `nutriflow`, EAS projectId `450c786e-2b28-415f-a36a-f5806e757935` |
| Google Play app | «Nutri Flow: Menu generation», аккаунт разработчика `6995869890980332570`, app id `4974294859113733675` |
| Google Cloud проект | `nutriflow-509222` (номер `223613501486`) |
| RevenueCat проект | `652c95d8`, Android app `app52c864ad95` |
| Политика конфиденциальности | https://nutriflow.myoffer.life/app_terms |
| Email поддержки (в политике) | nutrifloowapp@gmail.com |

## Переменные окружения

Все — `EXPO_PUBLIC_*` (вшиваются в бандл, не секреты). Локально: `.env.local` (в git не попадает).
В EAS заведены в окружения `production` и `preview` (`eas env:list --environment production`).

`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_FILES_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`,
`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`,
`EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.

При изменении `.env.local` обновить значение и в EAS — само оно не синхронизируется.

## Подписки (RevenueCat + Google Play)

- Entitlement в коде: **`Premium`** (`src/lib/purchases.js`, `ENTITLEMENT_ID`) — должен совпадать с RevenueCat.
- Paywall берёт пакеты из **current offering** (в RevenueCat это offering `Premium`): `$rc_weekly`, `$rc_monthly`, `$rc_annual`.
- Google Play: одна подписка `premium` с базовыми планами `weekly` ($1.99), `monthly` ($3.99), `yearly` ($39.99); пробные 7 дней — офферы `monthly-trial-7d`, `yearly-trial-7d` (только новым подписчикам). В RevenueCat продукты называются `premium:weekly` и т.д.
- Пока RevenueCat-ключ не настоящий (`isPurchasesConfigured()` = false), все Premium-функции открыты (`subscriptionStore.hasAccess`).
- iOS-ключ в env сейчас тестовый (`test_…`) — для production iOS нужен `appl_…`.

## Вход через Google — частые поломки

Ошибка `DEVELOPER_ERROR` (код 10) = SHA-1 подписи сборки не зарегистрирован в Google Cloud.
В проекте `nutriflow-509222` есть три Android OAuth-клиента для `com.nutriFlow`:

| Клиент | SHA-1 | Для чего |
|---|---|---|
| Android client 1 | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` | debug-ключ (`android/app/debug.keystore`) |
| Android - Play signing | `5C:59:96:14:99:32:03:41:E1:7B:71:50:2F:01:14:98:21:8E:C8:A2` | установка из Google Play |
| Android - Upload key | `4C:22:16:54:4B:A9:A5:A4:07:EE:7F:5E:92:E4:74:58:B7:B8:B5:81` | release-сборки, поставленные напрямую (APK) |

Также OAuth consent screen в статусе **Testing** — войти могут только тестовые пользователи из Google Cloud → Google Auth Platform → Audience.

## Нативная папка `android/` — ВАЖНО

`android/` и `ios/` **в `.gitignore`**. Всё, что правится там, есть только на этой машине:

- `android/app/build.gradle` — release-подпись читает `../credentials.json` (ключ загрузки из EAS); `versionCode` задаётся здесь для локальных сборок.
- `android/app/src/main/AndroidManifest.xml` — `AD_ID` удалён (`tools:node="remove"`).
- `android/app/src/main/res/` — иконки и splash из логотипа `assets/logo/IMG_1152.PNG`, фон `#000F26`.

Правило: любую нативную настройку дублировать в `app.json` (там уже есть `blockedPermissions` с AD_ID, `adaptiveIcon`, splash), чтобы `npx expo prebuild` и EAS-сборки давали тот же результат.
**Не запускать `npx expo prebuild --clean`** без нужды — он перезапишет `android/` и сотрёт настройку подписи в `build.gradle`.

## Секреты — не коммитить и не выводить

- `credentials.json`, `credentials/android/keystore.jks` — ключ загрузки Android (в `.gitignore`). Потеря = сброс ключа через поддержку Google Play.
- `.env.local`
- JSON-ключ сервисного аккаунта RevenueCat (`revenuecat@nutriflow-509222.iam.gserviceaccount.com`) — загружен в RevenueCat, локальной копии нет.
- `NUTRIFLOW_BACKEND/key.json`

## Правила для агентов

- Перед изменениями в Expo API сверяться с документацией v57 (ссылка вверху).
- Тексты UI — через i18n во всех 6 локалях.
- Не менять `ENTITLEMENT_ID`, package name `com.nutriFlow` и идентификаторы продуктов без согласования — они завязаны на Google Play и RevenueCat.
- Перед загрузкой новой сборки в Play поднимать `versionCode` (см. BUILD.md).
