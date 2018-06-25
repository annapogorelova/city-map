"use strict";

export default Object.freeze({
    NOTICES: {
        FAILED_TO_GET_LOCATION: {
            title: "Не вдалось отримати ваші координати",
            message: "Перевірте налаштування вашого браузера та спробуйте знову."
        },
        NOT_A_STREET : {
            title: "Це місце не є частиною вулиці",
            message: "Спробуйте обрати інші координати."
        },
        STREET_NOT_FOUND: {
            title: "Вулицю не знайдено",
            message: "Перевірте будь ласка назву вулиці та повторіть пошук."
        },
        AUTH_FAILED: {
            title: "Не вдалось здійснити вхід",
            message: "Спробуйте будь ласка ще раз."
        },
        CREATE_ACTION_SUCCESS: {
            title: "Дію успішно виконано",
            message: "Запис було створено."
        },
        UPDATE_ACTION_SUCCESS: {
            title: "Дію успішно виконано",
            message: "Запис було оновлено."
        },
        DELETE_ACTION_SUCCESS: {
            title: "Дію успішно виконано",
            message: "Запис було видалено."
        },
        REQUEST_TIMEOUT: {
            title: "Час запиту вийшов",
            message: "Спробуйте повторити запит пізніше."
        },
        REQUEST_PARAMS_ERROR: {
            title: "Помилка запиту",
            message: "Перевірте будь ласка дані, що відправляються у запиті."
        },
        SERVER_ERROR: {
            title: "Помилка сервера",
            message: "Щось пішло не так. Спробуйте повторити запит пізніше."
        },
        MESSAGE_SENT: {
            title: "Повідомлення надіслано",
            message: "Дякую, ваше повідомлення було успішно надіслано автору."
        },
        RECAPTCHA_UNAVAILABLE: {
            title: "Сервіс ReCaptcha тимчасово недоступний",
            message: "Спробуйте будь ласка пізніше"
        },
        AUTH_EXPIRED: {
            title: "Час сесії минув",
            message: "Увійдіть будь ласка знову."
        }
    },
    HEADERS: {
        CITIES: "Міста",
        STREETS: "Вулиці",
        NAMED_ENTITES: "Персони",
        CONTACT: "Написати автору"
    },
    VALIDATION_MESSAGES: {
        NAME_INVALID: "Вкажіть будь ласка ваше ім'я (щонайменше 2 літери)",
        EMAIL_INVALID: "Вкажіть будь ласка ваш email у коректному форматі",
        MESSAGE_INVALID: "Заповніть будь ласка повідомлення (щонайменше 20 символів)",
        RECAPTCHA_INVALID: "Підтвердіть будь ласка, що ви не робот",
    },
    STRINGS: {
        NO_STREET_INFO: "На жаль, на даний момент відсутні дані про назву цієї вулиці.",
        NO_STREET_FOUND: "Тут не було знайдено жодної вулиці.",
        CHOOSE_THE_STREET: "Оберіть вулицю, щоб отримати інформацію про її назву.",
        SEARCHING: "Шукаємо...",
        NAMED_AFTER: "Назва на честь",
        STREET_NAME: "Назва вулиці",
        OLD_STREET_NAME: "Стара назва",
        CITY_NOT_CHOSEN: "Місто не було обрано",
        IMAGE: "Зображення",
        WIKIPEDIA_LINK_CAPTION: "Посилання на Wikipedia",
        STREET_INFORMATION: "Інформація про вулицю",
        STREET_ON_WIKIPEDIA: "Ця вулиця на Wikipedia",
        HIDE_DETAILS: "Сховати деталі",
        SHOW_DETAILS: "Показати деталі",
        CATEGORIES: "Категорії"
    }
});