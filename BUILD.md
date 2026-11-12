# NutriFlow — сборка и команды

Все команды выполняются из папки `~/myprojects/NUTRI/NutriFlow`, если не указано иное.
Контекст проекта для ИИ-агентов — в [AGENTS.md](AGENTS.md).

## Версии — поднимать перед каждой загрузкой в Google Play

Google Play принимает сборку, только если `versionCode` больше всех уже загруженных.
**Последний загруженный в Play: 4** (на 12.11.2026).

| Как собираешь | Где номер |
|---|---|
| Локально (Gradle) | `android/app/build.gradle` → `versionCode N` |
| EAS (облако) | хранится в EAS (`appVersionSource: remote`), `autoIncrement` поднимает сам |

Если собирал локально, синхронизируй EAS, чтобы он не выдал уже занятый номер:
```bash
eas build:version:get -p android      # посмотреть текущий номер в EAS
eas build:version:set -p android      # выставить (ввести последний загруженный, напр. 4)
```
`versionName` (видимая версия, напр. `1.0.0`) — `app.json` → `expo.version` и `build.gradle` → `versionName`.

---

## 1. Разработка

```bash
npm install                     # зависимости
npx expo start                  # Metro dev-сервер (QR-код для dev-клиента)
npx expo start --clear          # то же со сбросом кэша Metro
npx expo run:android            # собрать debug и поставить на подключённый телефон/эмулятор
npx expo run:android --variant release   # release-сборка на устройство
npm run lint                    # ESLint
npm test                        # Jest
```

---

## 2. Сборка без Expo (локально, Gradle)

Требуется: JDK 17, Android SDK в `~/Android/Sdk` (файл `android/local.properties` с `sdk.dir`),
ключ загрузки `credentials/android/keystore.jks` + `credentials.json` (см. раздел 5).
Переменные берутся из `.env.local` автоматически.

```bash
cd android

# AAB для Google Play
NODE_ENV=production ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab

# APK для установки на телефон напрямую
NODE_ENV=production ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk

# Оба сразу
NODE_ENV=production ./gradlew bundleRelease assembleRelease

# Очистка, если сборка ведёт себя странно
./gradlew clean
```

Сборка с нуля ~15–20 мин, повторная ~1 мин. Лог в файл и просмотр в реальном времени:
```bash
NODE_ENV=production ./gradlew bundleRelease > /tmp/build.log 2>&1 &
tail -f /tmp/build.log
```

### Проверить готовый файл
```bash
# подпись (должна быть SHA1 4C:22:16:...:B5:81 — ключ загрузки)
keytool -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab | grep SHA1

# Google client ID вшит в бандл (ожидается 1)
unzip -p android/app/build/outputs/bundle/release/app-release.aab base/assets/index.android.bundle | strings | grep -c "223613501486-"

# нет рекламного ID (ожидается 0)
unzip -p android/app/build/outputs/bundle/release/app-release.aab base/manifest/AndroidManifest.xml | strings | grep -c "AD_ID"
```

---

## 3. Сборка через Expo (EAS, в облаке)

Переменные окружения берутся из EAS (окружения `production` / `preview`, см. `eas.json`), а не из `.env.local`.

```bash
npm install -g eas-cli          # установить/обновить CLI
eas login                       # войти (аккаунт kristina_gyk)

eas build -p android --profile production    # AAB для Google Play
eas build -p android --profile preview       # APK для внутренней раздачи
eas build -p ios --profile production        # iOS для App Store
eas build -p all --profile production        # обе платформы

eas build:list                  # список сборок и ссылки на скачивание
eas submit -p android --latest  # отправить последнюю сборку в Google Play
eas submit -p ios --latest      # отправить в App Store Connect
```

Прогресс EAS-сборки — в терминале и на https://expo.dev/accounts/kristina_gyk/projects/nutriflow/builds

### Переменные окружения EAS
```bash
eas env:list --environment production
eas env:create --environment production --environment preview --name ИМЯ --value "значение" --visibility plaintext
eas env:update --environment production --variable-name ИМЯ
eas env:delete --environment production --variable-name ИМЯ
eas env:pull --environment production        # скачать в .env.local
```
Для `EXPO_PUBLIC_*` видимость `plaintext` или `sensitive`, **не `secret`**.

### Ключи подписи в EAS
```bash
eas credentials -p android      # посмотреть / скачать keystore (Download → credentials.json + credentials/)
```

---

## 4. Установка на телефон без Google Play

Телефон по USB с включённой отладкой по USB.

```bash
adb devices                                                        # телефон должен быть в списке
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell monkey -p com.nutriFlow -c android.intent.category.LAUNCHER 1   # запустить
adb shell am force-stop com.nutriFlow                              # закрыть
adb uninstall com.nutriFlow                                        # удалить (стирает локальные данные)
adb shell dumpsys package com.nutriFlow | grep versionCode         # какая версия стоит
adb logcat | grep -iE "ReactNativeJS|nutriflow"                    # логи приложения
```

- APK, поставленный через `adb`, и версия из Google Play подписаны **разными** ключами — поверх друг друга не ставятся, сначала `adb uninstall`.
- **Подписки** тестировать только на версии из Google Play (внутреннее тестирование) с аккаунтом из «Тестировщиков лицензий».

---

## 5. Если `android/` пропала или новый компьютер

`android/` не в git. Восстановить:

```bash
npx expo prebuild -p android    # сгенерировать android/ из app.json
eas credentials -p android      # скачать ключ загрузки → credentials.json + credentials/android/keystore.jks
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
```

Затем вручную вернуть в `android/app/build.gradle`:
1. `versionCode` — следующий после последнего загруженного в Play.
2. Release-подпись из `credentials.json` — внутри `signingConfigs { ... }`:
   ```groovy
   def credsFile = rootProject.file('../credentials.json')
   if (credsFile.exists()) {
       def ks = new groovy.json.JsonSlurper().parse(credsFile).android.keystore
       release {
           storeFile rootProject.file("../${ks.keystorePath}")
           storePassword ks.keystorePassword
           keyAlias ks.keyAlias
           keyPassword ks.keyPassword
       }
   }
   ```
   и в `buildTypes.release`: `signingConfig signingConfigs.findByName('release') ?: signingConfigs.debug`

Иконки, splash и удаление `AD_ID` prebuild берёт из `app.json` сам.

---

## 6. Публикация в Google Play (вручную)

1. Собрать AAB (раздел 2 или 3) с новым `versionCode`.
2. Play Console → NutriFlow → **Тестирование → Внутреннее тестирование → Создать выпуск** → загрузить `app-release.aab`.
3. Примечания к выпуску → **Далее → Сохранить → Отправить**.
4. Статус проверки: **Обзор публикации** и вкладка «Выпуски» трека.

---

## 7. Бэкенд (`../NUTRIFLOW_BACKEND`)

```bash
cd ../NUTRIFLOW_BACKEND
npm install
npm run dev          # nodemon src/index.js
npm start            # node src/index.js
npm run db:create    # создать БД
npm run db:migrate   # прогнать install/steps/*.sql
npm run lint
```
Подробности — `NUTRIFLOW_BACKEND/README.md`, API — `NUTRIFLOW_BACKEND/API.md`.

## 8. Веб-фронтенд (`../NUTRIFLOW_FRONTEND`)

```bash
cd ../NUTRIFLOW_FRONTEND
npm install
npm run dev          # Vite dev-сервер
npm run build        # production-сборка
```

---

## Частые проблемы

| Симптом | Причина / решение |
|---|---|
| Вход через Google: `DEVELOPER_ERROR` / код 10 | SHA-1 сборки не добавлен в Google Cloud (таблица в AGENTS.md) или пустой `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| Google-вход работает только у одного аккаунта | OAuth consent screen в режиме Testing — добавить тестовых пользователей или опубликовать |
| Play: «версия с таким кодом уже есть» | поднять `versionCode` |
| Play: подпись не та | собран debug-ключом — нет `credentials.json`, см. раздел 5 |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` при `adb install` | стоит версия с другой подписью → `adb uninstall com.nutriFlow` |
| Paywall пустой | приложение не из Google Play, или продукты/offering не настроены в RevenueCat |
