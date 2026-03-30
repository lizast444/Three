export type Lang = "ru" | "en";

// ── SOCRATIC_POOL (bilingual) ─────────────────────────────────────────────
export const SOCRATIC_POOL_I18N: Record<Lang, Record<string, string[]>> = {
  ru: {
    autonomy: [
      "Действовал ли я сегодня исходя из своих ценностей или под давлением обстоятельств?",
      "Если бы я был абсолютно свободен в выборе, что из сегодняшних дел я бы оставил, а что вычеркнул?",
      "В какие моменты я чувствовал, что «надо», а не «хочу»? Почему?",
    ],
    competence: [
      "С каким вызовом я сегодня столкнулся и чему он меня научил, даже если я не справился идеально?",
      "В чём я сегодня стал чуть лучше, чем вчера?",
      "Какие мои сильные стороны помогли мне продвинуться в делах?",
    ],
    relatedness: [
      "Был ли я сегодня искренним в общении или играл роль?",
      "Кому я сегодня помог или кто помог мне почувствовать себя понятым?",
      "Как мои сегодняшние действия повлияли на людей, которые мне дороги?",
    ],
    universal: [
      "Какой момент сегодня был наиболее живым для меня?",
      "Что я откладывал — и почему?",
      "Если бы я мог прожить сегодня заново, что бы изменил?",
      "Какое чувство доминировало сегодня — и что за ним стоит?",
      "Что меня удивило сегодня?",
    ],
  },
  en: {
    autonomy: [
      "Did I act from my own values today, or under the pressure of circumstances?",
      "If I had complete freedom of choice, what of today's tasks would I keep — and what would I drop?",
      "At what moments did I feel 'I have to' rather than 'I want to'? Why?",
    ],
    competence: [
      "What challenge did I face today, and what did it teach me — even if I didn't handle it perfectly?",
      "In what way did I become even slightly better today than yesterday?",
      "Which of my strengths helped me make progress today?",
    ],
    relatedness: [
      "Was I genuine in my interactions today, or was I playing a role?",
      "Whom did I help today, or who helped me feel truly understood?",
      "How did my actions today affect the people I care about?",
    ],
    universal: [
      "What moment today felt most alive to me?",
      "What have I been putting off — and why?",
      "If I could live today over again, what would I change?",
      "What feeling dominated today — and what lies beneath it?",
      "What surprised me today?",
    ],
  },
};

// ── INSPIRATION_IDEAS (bilingual) ─────────────────────────────────────────
export const INSPIRATION_IDEAS_I18N: Record<Lang, Record<string, string[]>> = {
  ru: {
    autonomy: [
      "Выключить телефон на 30 минут и сделать что-то только для себя",
      "Сказать «нет» одной просьбе, которая идёт вразрез с моими ценностями",
      "Запланировать один час без обязательств",
      "Принять одно решение, не спрашивая ничьего совета",
      "Написать список того, чего я действительно хочу — без фильтров",
      "Сделать то, что давно откладывал из-за чужого мнения",
    ],
    competence: [
      "Выучить одну новую вещь: посмотреть туториал, прочитать статью",
      "Сделать что-то, что чуть сложнее моего обычного уровня",
      "Зафиксировать в дневнике одно достижение, пусть маленькое",
      "Попросить фидбек у кого-то, кому доверяю",
      "Завершить задачу, которую откладывал",
      "Попрактиковать навык, который хочу развить",
    ],
    relatedness: [
      "Написать кому-то, о ком думал в последнее время",
      "Провести 15 минут в разговоре без телефона",
      "Поблагодарить кого-то конкретно за что-то конкретное",
      "Предложить помощь кому-то, не ожидая ничего взамен",
      "Поделиться с кем-то чем-то личным",
      "Запланировать встречу с другом, которую давно откладывал",
    ],
  },
  en: {
    autonomy: [
      "Turn off my phone for 30 minutes and do something just for myself",
      "Say 'no' to one request that conflicts with my values",
      "Schedule one hour with no obligations",
      "Make one decision without asking anyone's advice",
      "Write a list of what I truly want — without filters",
      "Do something I've been putting off because of others' opinions",
    ],
    competence: [
      "Learn one new thing: watch a tutorial, read an article",
      "Do something slightly harder than my usual level",
      "Write down one achievement in my journal, however small",
      "Ask for feedback from someone I trust",
      "Complete a task I've been postponing",
      "Practice a skill I want to develop",
    ],
    relatedness: [
      "Message someone I've been thinking about lately",
      "Have a 15-minute conversation without my phone",
      "Thank someone specifically for something specific",
      "Offer help to someone without expecting anything in return",
      "Share something personal with someone",
      "Schedule a meeting with a friend I've been postponing",
    ],
  },
};

// ── UI STRINGS ────────────────────────────────────────────────────────────
const ruUI = {
  save: "Сохранить",
  close: "Закрыть",
  cancel: "Отмена",
  delete: "Удалить",

  sphere_autonomy: "Автономия",
  sphere_competence: "Компетентность",
  sphere_relatedness: "Связанность",

  nav_today: "Сегодня",
  nav_library: "Библиотека",
  nav_journal: "Журнал",
  nav_analytics: "Аналитика",
  nav_settings: "Оснастка",

  checkin_subtitle: "КАК ВЫ ЧУВСТВУЕТЕ СЕБЯ СЕГОДНЯ?",
  checkin_other_question: "Другой вопрос",
  checkin_all_answers: "Все ответы",
  checkin_deep_dive: "Глубокий разбор",
  checkin_answer_placeholder: "Мой ответ...",
  checkin_score_low: "Совсем нет",
  checkin_score_high: "Полностью",
  checkin_note_title: "Заметка дня",
  checkin_note_placeholder: "Что было важного сегодня? Событие, мысль, состояние...",
  checkin_tags_label: "Теги:",
  checkin_micro_title: "Что я могу изменить завтра?",
  checkin_micro_subtitle: "Выберите одну или несколько сфер для фокуса",
  checkin_ideas_label: "Идеи",
  checkin_ideas_other: "Другие",
  checkin_save: "Сохранить день",
  checkin_yesterday_title: "Что сработало вчера?",
  checkin_yesterday_planned: "Вчера вы планировали:",
  checkin_yesterday_placeholder: "Что из этого получилось? Как оно повлияло на вас?",

  modal_answers_title: "Ответы за сегодня",
  modal_answers_empty: "Нет ответов за сегодня",
  modal_deepdive_title: "Глубокий разбор",
  modal_answer_placeholder: "Мой ответ...",

  insights_title: "Аналитика",
  insights_subtitle: "Паттерны ваших потребностей и моменты ресурса.",
  insights_chart_title: "Динамика состояния",
  insights_peaks_title: "Пиковые дни (8+)",
  insights_reviews_title: "Что помогло из планов",
  insights_days_7: "7 дней",
  insights_days_14: "14 дней",
  insights_days_30: "30 дней",

  journal_title: "Журнал",
  journal_subtitle: "История ваших дней.",
  journal_no_data: "Нет данных за этот день",
  journal_scores: "Оценки",
  journal_note: "Заметка",
  journal_yesterday_review: "Что сработало из планов",
  journal_micro_new: "Микро-действия на завтра",
  journal_micro_old: "Микро-действие",
  journal_answers: "Ответы",
  journal_no_answers: "Нет ответов",

  settings_title: "Оснастка",
  settings_subtitle: "Настройки приложения и управление данными.",
  settings_reminders: "Напоминания",
  settings_reminders_enable: "Включить напоминания",
  settings_reminders_daily: "Ежедневный сигнал для рефлексии",
  settings_reminders_denied: "Разрешите уведомления в браузере",
  settings_reminders_time: "Время напоминания",
  settings_reminders_note:
    "Уведомления работают, пока приложение открыто в браузере.",
  settings_export: "Экспорт данных",
  settings_export_desc:
    "Скачайте все локальные данные приложения (ответы, настройки) в виде JSON-файла.",
  settings_export_btn: "Экспортировать в JSON",
  settings_import: "Импорт данных",
  settings_import_desc:
    "Загрузите ранее экспортированный JSON-файл. Новые дни добавятся, совпадающие — обновятся.",
  settings_import_select: "Выбрать файл",
  settings_import_ready: "Файл готов к импорту",
  settings_import_total: "в файле",
  settings_import_new: "новых",
  settings_import_updated: "обновится",
  settings_import_apply: "Применить",
  settings_reset: "Сброс данных",
  settings_reset_desc:
    "Удаляет все локальные данные: настройки, ответы глубокого разбора, параметры ротации вопросов. Данные чекинов в базе не удаляются.",
  settings_reset_btn: "Сбросить все данные",
  settings_reset_confirm:
    "Вы уверены? Это действие необратимо. Все локальные данные будут удалены, страница перезагрузится.",
  settings_theme: "Тема",
  settings_theme_light: "Светлая",
  settings_theme_dark: "Тёмная",
  settings_language: "Язык",
  settings_about: "О приложении",
  settings_about_theory: "Теория самодетерминации (SDT)",
  settings_about_theory_desc:
    "SDT — психологическая теория, утверждающая, что благополучие и внутренняя мотивация человека зависят от удовлетворения трёх базовых потребностей:",
  settings_about_socratic: "Сократовский метод",
  settings_about_socratic_desc:
    "Метод исследования через вопросы, который помогает осознать скрытые убеждения, противоречия и новые перспективы. Вместо готовых ответов — уточняющие вопросы, которые ведут к собственному пониманию.",
  settings_storage_note:
    "Ваши данные хранятся локально и в защищённой базе данных.",

  library_title: "Библиотека",
  library_subtitle: "40 сократовских вопросов для каждой сферы.",
  library_all: "Все",
  library_universal: "Универсальные",
  library_hints: "Подсказки",
  library_hide_hints: "Скрыть",
  library_saved_note: "Заметки сохраняются...",

  toast_saved: "День сохранен",
  toast_saved_desc: "Ваши размышления бережно записаны.",
  toast_error: "Ошибка",
  toast_save_error: "Не удалось сохранить день.",
  toast_deep_saved: "Сохранено",
  toast_deep_saved_desc: "Ответы глубокого разбора записаны.",
  toast_export_done: "Экспорт готов",
  toast_export_desc: "Файл сохранён на устройство.",
  toast_reminder_saved: "Сохранено",
  toast_reset_done: "Все данные удалены",
  toast_reset_desc: "Локальные данные очищены.",
  toast_import_done: "Импорт завершён",
  toast_import_error: "Ошибка импорта",
  toast_import_file_error: "Ошибка файла",
  toast_import_file_error_desc: "Файл повреждён или имеет неверный формат.",
  toast_import_apply_error: "Не удалось применить данные.",
};

export type UITranslations = typeof ruUI;

const enUI: UITranslations = {
  save: "Save",
  close: "Close",
  cancel: "Cancel",
  delete: "Delete",

  sphere_autonomy: "Autonomy",
  sphere_competence: "Competence",
  sphere_relatedness: "Relatedness",

  nav_today: "Today",
  nav_library: "Library",
  nav_journal: "Journal",
  nav_analytics: "Analytics",
  nav_settings: "Settings",

  checkin_subtitle: "HOW ARE YOU FEELING TODAY?",
  checkin_other_question: "Other question",
  checkin_all_answers: "All answers",
  checkin_deep_dive: "Deep dive",
  checkin_answer_placeholder: "My answer...",
  checkin_score_low: "Not at all",
  checkin_score_high: "Fully",
  checkin_note_title: "Day note",
  checkin_note_placeholder:
    "What was important today? An event, a thought, a feeling...",
  checkin_tags_label: "Tags:",
  checkin_micro_title: "What can I change tomorrow?",
  checkin_micro_subtitle: "Choose one or more spheres to focus on",
  checkin_ideas_label: "Ideas",
  checkin_ideas_other: "More",
  checkin_save: "Save day",
  checkin_yesterday_title: "What worked yesterday?",
  checkin_yesterday_planned: "Yesterday you planned:",
  checkin_yesterday_placeholder: "What worked out? How did it affect you?",

  modal_answers_title: "Today's answers",
  modal_answers_empty: "No answers yet today",
  modal_deepdive_title: "Deep dive",
  modal_answer_placeholder: "My answer...",

  insights_title: "Analytics",
  insights_subtitle: "Patterns in your needs and moments of resource.",
  insights_chart_title: "State dynamics",
  insights_peaks_title: "Peak days (8+)",
  insights_reviews_title: "What helped from plans",
  insights_days_7: "7 days",
  insights_days_14: "14 days",
  insights_days_30: "30 days",

  journal_title: "Journal",
  journal_subtitle: "A history of your days.",
  journal_no_data: "No data for this day",
  journal_scores: "Scores",
  journal_note: "Note",
  journal_yesterday_review: "What worked from plans",
  journal_micro_new: "Tomorrow's micro-actions",
  journal_micro_old: "Micro-action",
  journal_answers: "Answers",
  journal_no_answers: "No answers",

  settings_title: "Settings",
  settings_subtitle: "App settings and data management.",
  settings_reminders: "Reminders",
  settings_reminders_enable: "Enable reminders",
  settings_reminders_daily: "Daily reflection signal",
  settings_reminders_denied: "Allow notifications in your browser",
  settings_reminders_time: "Reminder time",
  settings_reminders_note:
    "Notifications work while the app is open in your browser.",
  settings_export: "Export data",
  settings_export_desc:
    "Download all local app data (answers, settings) as a JSON file.",
  settings_export_btn: "Export to JSON",
  settings_import: "Import data",
  settings_import_desc:
    "Upload a previously exported JSON file. New days will be added, matching days updated.",
  settings_import_select: "Select file",
  settings_import_ready: "File ready to import",
  settings_import_total: "in file",
  settings_import_new: "new",
  settings_import_updated: "will update",
  settings_import_apply: "Apply",
  settings_reset: "Reset data",
  settings_reset_desc:
    "Deletes all local data: settings, deep dive answers, question rotation. Check-in data in the database is not deleted.",
  settings_reset_btn: "Reset all data",
  settings_reset_confirm:
    "Are you sure? This is irreversible. All local data will be deleted and the page will reload.",
  settings_theme: "Theme",
  settings_theme_light: "Light",
  settings_theme_dark: "Dark",
  settings_language: "Language",
  settings_about: "About",
  settings_about_theory: "Self-Determination Theory (SDT)",
  settings_about_theory_desc:
    "SDT is a psychological theory stating that human wellbeing and intrinsic motivation depend on satisfying three basic needs:",
  settings_about_socratic: "The Socratic Method",
  settings_about_socratic_desc:
    "A method of inquiry through questions that helps uncover hidden beliefs, contradictions, and new perspectives. Instead of ready-made answers — clarifying questions that lead to your own understanding.",
  settings_storage_note: "Your data is stored locally and in a secure database.",

  library_title: "Library",
  library_subtitle: "40 Socratic questions for each sphere.",
  library_all: "All",
  library_universal: "Universal",
  library_hints: "Hints",
  library_hide_hints: "Hide",
  library_saved_note: "Notes are saving...",

  toast_saved: "Day saved",
  toast_saved_desc: "Your reflections have been carefully recorded.",
  toast_error: "Error",
  toast_save_error: "Failed to save the day.",
  toast_deep_saved: "Saved",
  toast_deep_saved_desc: "Deep dive answers recorded.",
  toast_export_done: "Export ready",
  toast_export_desc: "File saved to your device.",
  toast_reminder_saved: "Saved",
  toast_reset_done: "All data deleted",
  toast_reset_desc: "Local data cleared.",
  toast_import_done: "Import complete",
  toast_import_error: "Import error",
  toast_import_file_error: "File error",
  toast_import_file_error_desc:
    "File is corrupted or has an invalid format.",
  toast_import_apply_error: "Failed to apply data.",
};

export const UI: Record<Lang, UITranslations> = { ru: ruUI, en: enUI };

export function getSphereLabel(
  key: string,
  T: UITranslations
): string {
  const map: Record<string, keyof UITranslations> = {
    autonomy: "sphere_autonomy",
    competence: "sphere_competence",
    relatedness: "sphere_relatedness",
  };
  return T[map[key] ?? "sphere_autonomy"] as string;
}
