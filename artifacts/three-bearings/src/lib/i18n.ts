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

// ── LIBRARY_QUESTIONS (bilingual) ─────────────────────────────────────────
export type LibraryQuestion = { question: string; hints: string[] };
export const LIBRARY_QUESTIONS_I18N: Record<Lang, Record<string, LibraryQuestion[]>> = {
  ru: {
    autonomy: [
      { question: "Действовал ли я сегодня исходя из своих ценностей или под давлением обстоятельств?", hints: [
        "Какое решение сегодня было самым важным? Что повлияло на него?",
        "Если бы никто не смотрел и не оценивал, сделал(а) бы ты то же самое?",
        "Назови одну ситуацию, где ты чувствовал(а) внутренний конфликт. Что там победило?"
      ]},
      { question: "Если бы я был абсолютно свободен в выборе, что из сегодняшних дел я бы оставил, а что вычеркнул?", hints: [
        "Представь, что у тебя есть волшебная палочка. Какие 1–2 дела исчезли бы из твоего дня?",
        "А какие дела ты оставил(а) бы, даже если бы не надо было?",
        "Что ты делал(а) сегодня просто потому, что тебе это нравится?"
      ]},
      { question: "В какие моменты я чувствовал, что «надо», а не «хочу»? Почему?", hints: [
        "Вспомни момент, когда ты вздыхал(а) перед тем, как что-то сделать.",
        "Чей голос звучал в голове: родителя, начальника, внутреннего критика?",
        "Если бы ты спросил(а) себя «зачем мне это надо?», какой был бы ответ?"
      ]},
      { question: "Я делал это потому, что хотел, или потому что должен был (надо)?", hints: [
        "Вспомни одно конкретное действие сегодня. Что двигало тобой в тот момент?",
        "Если убрать мысль «так надо», что бы ты выбрал(а) сделать?",
        "Был ли момент, когда ты сделал(а) что-то с внутренним сопротивлением? Что именно?"
      ]},
      { question: "Какое «нет» я сегодня не сказал, но стоило?", hints: [
        "Кому или чему ты хотел(а) отказать, но согласился(лась)?",
        "Что ты чувствовал(а) в тот момент?",
        "Если бы ты сказал(а) «нет», что было бы самым страшным в этом? А что хорошим?"
      ]},
      { question: "Если я чувствую давление, кто или что является его источником? Реален ли этот источник или это моё предположение?", hints: [
        "Это конкретный человек сказал тебе «надо», или ты сам(а) так решил(а)?",
        "Если честно спросить себя: что случится, если я не сделаю этого?",
        "Представь, что источник давления исчез. Что бы ты сделал(а) иначе?"
      ]},
      { question: "Могу ли я осознанно выбрать те обязанности, которые кажутся «долженствованием», чтобы вернуть себе автономию?", hints: [
        "Выбери одну обязанность, которая тяготит. Зачем ты её делаешь? Какая в ней твоя выгода?",
        "Если ты скажешь себе: «я выбираю это сделать, потому что для меня важно Х» — изменится ли ощущение?",
        "Какая обязанность сегодня была на 100% твоим выбором?"
      ]},
      { question: "В каких решениях сегодня я отдал свою власть другому человеку или обстоятельствам?", hints: [
        "Было ли сегодня решение, которое принял(а) не ты?",
        "Ты согласился(лась) с чем-то, хотя внутри был(а) против?",
        "Если бы ты взял(а) это решение в свои руки, что бы изменил(а)?"
      ]},
      { question: "Если бы я сейчас получил полную свободу на один день, что бы я изменил в сегодняшнем расписании?", hints: [
        "Что бы ты вычеркнул(а) первым делом?",
        "Что бы добавил(а) такого, чего сегодня точно не было?",
        "С кем бы ты провёл(ла) время? А от кого бы взял(а) паузу?"
      ]},
      { question: "Чей голос звучит в моей голове, когда я говорю «я обязан»?", hints: [
        "Этот голос похож на кого-то из прошлого? Родителя, учителя, бывшего партнёра?",
        "Что именно он говорит? Какие слова?",
        "Если бы этот голос принадлежал доброму другу, что бы он сказал вместо этого?"
      ]},
      { question: "Что из того, что я сделал сегодня, было моим искренним выбором, даже если это было сложно?", hints: [
        "Вспомни момент, когда ты мог(ла) поступить проще, но выбрал(а) сложнее, потому что это было честнее.",
        "Что ты сделал(а) сегодня, что было именно твоим решением?",
        "Даже если результат не идеален — что ты выбрал(а) сам(а)?"
      ]},
    ],
    competence: [
      { question: "С каким вызовом я сегодня столкнулся и чему он меня научил, даже если я не справился идеально?", hints: [
        "Что сегодня было трудным? Что ты чувствовал(а) в этот момент?",
        "Даже если результат не такой, как хотелось, что ты узнал(а) о себе или о процессе?",
        "Если бы это повторилось завтра, что бы ты сделал(а) иначе?"
      ]},
      { question: "В чём я сегодня стал чуть лучше, чем вчера?", hints: [
        "Это может быть что угодно: чуть больше терпения, чуть быстрее, чуть спокойнее.",
        "Сравни с собой вчерашним. Где прогресс, даже микроскопический?",
        "Что сегодня получилось легче, чем обычно?"
      ]},
      { question: "Какие мои сильные стороны помогли мне продвинуться в делах?", hints: [
        "Какие твои качества сегодня сработали? Упорство? Гибкость? Эмпатия? Организованность?",
        "Что ты сделал(а) хорошо сегодня?",
        "Что другие люди ценят в тебе? Сегодня это проявилось?"
      ]},
      { question: "С чем я справился сегодня, даже если это было мелко? Что доказывает, что я эффективен?", hints: [
        "Это может быть что угодно: встал с кровати, ответил на сложное письмо, приготовил еду, сказал «нет», успокоился после стресса.",
        "Если ничего не приходит в голову, представь, что твой лучший друг перечисляет твои заслуги за сегодня. Что бы он назвал?",
        "Не ищи «великих достижений». Мелочи — это тоже доказательства."
      ]},
      { question: "Была ли задача, которую я избегал из-за страха не справиться? Реален ли этот страх или это перфекционизм?", hints: [
        "Какую задачу ты откладывал(а) сегодня? Что ты чувствовал(а), когда думал(а) о ней?",
        "Если бы ты не боялся(ась) ошибиться, сделал(а) бы ты её?",
        "Что бы случилось на самом деле, если бы ты сделал(а) это неидеально?"
      ]},
      { question: "Что я сделал сегодня, что доказало мне: я способен(а) на большее, чем думал(а)?", hints: [
        "Был ли момент, когда ты удивил(а) сам(а) себя?",
        "Что ты сделал(а), чего не ожидал(а) от себя?",
        "Если бы ты сказал(а) себе утром, что сделаешь это — поверил(а) бы?"
      ]},
      { question: "Если бы мой лучший друг описал свою неудачу сегодня теми же словами, что и я, сказал бы я ему, что он некомпетентен?", hints: [
        "Какие слова ты используешь о себе, когда что-то идёт не так?",
        "Сказал(а) бы ты это другу?",
        "Что бы ты сказал(а) другу вместо этого? Попробуй сказать это себе."
      ]},
      { question: "Где я сегодня был(а) слишком строг(а) к себе и не заметил(а) своих реальных достижений?", hints: [
        "За что ты себя сегодня критиковал(а)? А за что можно было бы похвалить?",
        "Если бы кто-то другой сделал то же самое, осудил(а) бы ты его?",
        "Что ты сделал(а) сегодня, но не засчитал(а) себе?"
      ]},
      { question: "Какая задача сегодня казалась сложной, но я всё равно с ней справился(лась)? Как мне это удалось?", hints: [
        "Что в начале дня казалось неподъёмным, но ты это сделал(а)?",
        "Какие ресурсы ты использовал(а)? Время? Помощь? Терпение?",
        "Что именно помогло тебе не бросить?"
      ]},
      { question: "Что я сегодня сделал(а) впервые или научился(лась) делать лучше?", hints: [
        "Был ли сегодня опыт, которого раньше не было?",
        "Что ты сделал(а) сегодня быстрее, легче или осознаннее, чем обычно?",
        "Даже если это маленький шаг — что ты освоил(а)?"
      ]},
      { question: "Если бы я посмотрел(а) на свой день глазами стороннего наблюдателя, какие моменты показались бы мне доказательством моей эффективности?", hints: [
        "Представь, что ты смотришь фильм о своём дне. Какие сцены показали бы, что главный герой справляется?",
        "Что бы заметил(а) беспристрастный наблюдатель?",
        "Какие действия сегодня были эффективными, даже если ты этого не чувствуешь?"
      ]},
      { question: "Какой маленький шаг я сделал(а) сегодня в сторону навыка, который хочу развить?", hints: [
        "Есть ли навык, который ты развиваешь? Что ты сегодня сделал(а) для этого?",
        "Это может быть 5 минут практики, одно прочитанное письмо, один раз, когда ты сдержал(а) эмоцию.",
        "Если ты ничего не делал(а) — что мог(ла) бы сделать завтра за 2 минуты?"
      ]},
    ],
    relatedness: [
      { question: "Был ли я сегодня искренним в общении или играл роль?", hints: [
        "Был ли момент, когда ты сказал(а) не то, что думаешь?",
        "С кем ты сегодня был(а) собой настоящим(ей)?",
        "Если надевал(а) «маску» — зачем? Что пытался(лась) защитить?"
      ]},
      { question: "Кому я сегодня помог или кто помог мне почувствовать себя понятым?", hints: [
        "Был ли момент, когда ты поддержал(а) кого-то?",
        "Был ли момент, когда кто-то услышал тебя по-настоящему?",
        "Что именно сделало этот момент тёплым?"
      ]},
      { question: "Как мои сегодняшние действия повлияли на людей, которые мне дороги?", hints: [
        "Что ты сделал(а) сегодня, что повлияло на близких? Даже если это мелочь.",
        "Как твоё настроение или действия отразились на ком-то из важных людей?",
        "Если бы они описали твоё влияние на их день, что бы они сказали?"
      ]},
      { question: "Был ли момент сегодня, когда я почувствовал(а) тепло или поддержку? Что этому способствовало?", hints: [
        "Вспомни тёплый момент. Кто или что его создал(а)?",
        "Что именно тебя согрело? Слова? Взгляд? Молчание рядом?",
        "Как ты можешь создать такой момент для себя или другого завтра?"
      ]},
      { question: "Ждал(а) ли я сегодня от других «чтения мыслей»? Сказал(а) ли я им о том, что мне нужно?", hints: [
        "Был ли момент, когда ты обиделся(лась) на то, что кто-то не понял тебя без слов?",
        "Попросил(а) ли ты о том, что тебе было нужно?",
        "Если не попросил(а) — что тебя остановило?"
      ]},
      { question: "Если я чувствую одиночество сегодня, это объективное отсутствие людей или присутствие людей без глубины контакта?", hints: [
        "Сколько людей было рядом сегодня? А сколько из них видели тебя настоящего(ей)?",
        "Ты был(а) в компании, но чувствовал(а) себя одиноко? Почему?",
        "Что нужно, чтобы почувствовать глубину контакта?"
      ]},
      { question: "С кем сегодня я был(а) собой настоящим(ей)? Что мне дало это ощущение безопасности?", hints: [
        "Назови человека или людей, с кем ты сегодня не играл(а) роль.",
        "Что именно в этом общении позволило тебе расслабиться?",
        "Что ты чувствовал(а) после этого общения?"
      ]},
      { question: "Кому сегодня стало лучше от того, что я существую?", hints: [
        "Кого ты сегодня порадовал(а)? Даже если это был прохожий, которому ты улыбнулся(лась).",
        "Чей день стал легче из-за тебя?",
        "Если никто не приходит на ум — что ты можешь сделать завтра для этого?"
      ]},
      { question: "Был ли сегодня момент, когда я хотел(а) получить поддержку, но не попросил(а)? Что меня остановило?", hints: [
        "Вспомни момент, когда тебе было тяжело или грустно. Ты попросил(а) о помощи?",
        "Если нет — что тебя остановило? Страх показаться слабым? Нежелание обременять?",
        "Что могло бы случиться, если бы ты попросил(а)?"
      ]},
      { question: "Если бы я сегодня проявил(а) на 10% больше уязвимости с близким человеком, что бы изменилось?", hints: [
        "Что ты сегодня скрыл(а) от близкого? Чувство, страх, усталость?",
        "Если бы ты поделился(лась) этим — как бы это повлияло на вашу близость?",
        "Что самое страшное могло бы случиться? А самое хорошее?"
      ]},
    ],
    universal: [
      { question: "Что я думаю по этому поводу? Откуда у меня эта мысль?", hints: [
        "Запиши эту мысль буквально, как она звучит в голове.",
        "Когда ты впервые услышал(а) эту мысль? Кто её сказал?",
        "Это факт или интерпретация?"
      ]},
      { question: "Какие доказательства подтверждают моё убеждение? А какие опровергают?", hints: [
        "Составь два списка: «за» и «против». Будь честен(на).",
        "Если бы это был суд, какие улики были бы у обвинения и защиты?",
        "Есть ли доказательства, которые ты обычно игнорируешь?"
      ]},
      { question: "Есть ли другой способ посмотреть на эту ситуацию?", hints: [
        "Как бы на это посмотрел человек, который тебя любит?",
        "Как бы на это посмотрел человек, который не вовлечён эмоционально?",
        "Что ты мог(ла) упустить из виду?"
      ]},
      { question: "Что я посоветовал(а) бы другу на моём месте?", hints: [
        "Представь, что лучший друг пришёл к тебе с этой же ситуацией. Что бы ты ему сказал(а)?",
        "Был(а) ли ты с собой так же добр(а), как с другом?",
        "Напиши совет, который дал(а) бы другу, а потом прочитай его себе."
      ]},
      { question: "Что самое худшее может произойти? И насколько это вероятно на самом деле?", hints: [
        "Назови самый страшный сценарий. Выпиши его.",
        "Оцени вероятность этого сценария по шкале 1–10.",
        "Даже если это случится — сможешь ли ты с этим справиться? Как?"
      ]},
      { question: "Если я оставлю всё как есть, где я буду через месяц? А через год?", hints: [
        "Если ничего не менять, что будет с твоей ситуацией через месяц?",
        "А через год? Устроит ли тебя это?",
        "Если не устроит — какой самый маленький шаг можно сделать сегодня?"
      ]},
      { question: "Какое одно маленькое действие я могу сделать прямо сейчас?", hints: [
        "Не думай о большом плане. Что займёт меньше 2 минут?",
        "Что ты можешь сделать, даже если у тебя нет сил?",
        "Сделай это прямо сейчас, пока читаешь эту подсказку."
      ]},
    ],
  },
  en: {
    autonomy: [
      { question: "Did I act today from my own values, or under the pressure of circumstances?", hints: [
        "What was the most important decision today? What influenced it?",
        "If no one were watching or judging, would you have done the same thing?",
        "Name one situation where you felt an inner conflict. What won out?"
      ]},
      { question: "If I had complete freedom of choice, what of today's tasks would I keep — and what would I drop?", hints: [
        "Imagine you have a magic wand. Which 1–2 tasks would disappear from your day?",
        "Which tasks would you keep doing even if you didn't have to?",
        "What did you do today simply because you enjoy it?"
      ]},
      { question: "At what moments did I feel 'I have to' rather than 'I want to'? Why?", hints: [
        "Recall a moment when you sighed before doing something.",
        "Whose voice was in your head: a parent, a boss, an inner critic?",
        "If you asked yourself 'why do I have to do this?', what would the answer be?"
      ]},
      { question: "Did I do this because I wanted to, or because I had to?", hints: [
        "Recall one concrete action today. What drove you in that moment?",
        "If you removed the thought 'I have to', what would you choose to do?",
        "Was there a moment when you did something with inner resistance? What exactly?"
      ]},
      { question: "What 'no' did I fail to say today that I should have said?", hints: [
        "Whom or what did you want to refuse, but agreed to instead?",
        "What did you feel in that moment?",
        "If you had said 'no', what would have been the scariest thing about it? And the best?"
      ]},
      { question: "If I feel pressure, who or what is its source? Is that source real, or is it my assumption?", hints: [
        "Did a specific person tell you 'you must', or did you decide that yourself?",
        "If you ask honestly: what would happen if I didn't do this?",
        "Imagine the source of pressure disappeared. What would you do differently?"
      ]},
      { question: "Can I consciously choose the obligations that feel like 'have-tos', to reclaim my autonomy?", hints: [
        "Pick one obligation that weighs on you. Why are you doing it? What's your benefit in it?",
        "If you say to yourself: 'I choose to do this because X matters to me' — does the feeling change?",
        "Which obligation today was 100% your own choice?"
      ]},
      { question: "In which decisions today did I hand my power to another person or to circumstances?", hints: [
        "Was there a decision today that you didn't actually make?",
        "Did you agree to something while internally being against it?",
        "If you had taken that decision into your own hands, what would you have changed?"
      ]},
      { question: "If I were given complete freedom for one day right now, what would I change in today's schedule?", hints: [
        "What would you cross out first?",
        "What would you add that definitely wasn't there today?",
        "Whom would you spend time with? And from whom would you take a break?"
      ]},
      { question: "Whose voice plays in my head when I say 'I'm obligated'?", hints: [
        "Does that voice resemble someone from your past? A parent, a teacher, an ex-partner?",
        "What exactly does it say? Which words?",
        "If that voice belonged to a kind friend, what would they say instead?"
      ]},
      { question: "What that I did today was a sincere choice of mine, even though it was hard?", hints: [
        "Recall a moment when you could have taken the easier path but chose the harder one because it was more honest.",
        "What did you do today that was clearly your own decision?",
        "Even if the result isn't perfect — what did you choose for yourself?"
      ]},
    ],
    competence: [
      { question: "What challenge did I face today, and what did it teach me — even if I didn't handle it perfectly?", hints: [
        "What was hard today? What did you feel in that moment?",
        "Even if the result isn't what you wanted, what did you learn about yourself or the process?",
        "If it happened again tomorrow, what would you do differently?"
      ]},
      { question: "In what way did I become slightly better today than yesterday?", hints: [
        "It could be anything: a bit more patience, a bit faster, a bit calmer.",
        "Compare with yesterday's self. Where is there progress, even microscopic?",
        "What came easier today than usual?"
      ]},
      { question: "Which of my strengths helped me make progress today?", hints: [
        "Which of your qualities worked for you today? Persistence? Flexibility? Empathy? Organization?",
        "What did you do well today?",
        "What do other people value in you? Did that show up today?"
      ]},
      { question: "What did I handle today, even if it was small? What proves that I'm effective?", hints: [
        "It can be anything: got out of bed, replied to a hard email, cooked a meal, said 'no', calmed down after stress.",
        "If nothing comes to mind, imagine your best friend listing your accomplishments for today. What would they name?",
        "Don't look for 'great achievements'. Small things are also evidence."
      ]},
      { question: "Was there a task I avoided out of fear of failing? Is that fear real, or is it perfectionism?", hints: [
        "Which task did you postpone today? What did you feel when you thought about it?",
        "If you weren't afraid of making a mistake, would you have done it?",
        "What would actually happen if you did it imperfectly?"
      ]},
      { question: "What did I do today that proved to me I'm capable of more than I thought?", hints: [
        "Was there a moment when you surprised yourself?",
        "What did you do that you didn't expect from yourself?",
        "If you had told yourself in the morning that you'd do this — would you have believed it?"
      ]},
      { question: "If my best friend described their failure today using my words, would I tell them they're incompetent?", hints: [
        "What words do you use about yourself when something goes wrong?",
        "Would you say that to a friend?",
        "What would you say to a friend instead? Try saying it to yourself."
      ]},
      { question: "Where was I too harsh on myself today, missing my real achievements?", hints: [
        "What did you criticize yourself for today? And what could have been praised?",
        "If someone else had done the same, would you judge them?",
        "What did you do today but failed to give yourself credit for?"
      ]},
      { question: "Which task seemed difficult today, but I handled it anyway? How did I do it?", hints: [
        "What seemed unbearable at the start of the day, but you did it?",
        "What resources did you use? Time? Help? Patience?",
        "What exactly helped you not give up?"
      ]},
      { question: "What did I do for the first time today, or learn to do better?", hints: [
        "Was there an experience today that you hadn't had before?",
        "What did you do today faster, easier, or more consciously than usual?",
        "Even if it's a small step — what did you master?"
      ]},
      { question: "If I looked at my day through the eyes of an outside observer, which moments would seem like proof of my effectiveness?", hints: [
        "Imagine you're watching a film about your day. Which scenes would show that the main character is coping?",
        "What would an impartial observer notice?",
        "Which actions today were effective, even if you don't feel it?"
      ]},
      { question: "What small step did I take today toward a skill I want to develop?", hints: [
        "Is there a skill you're developing? What did you do for it today?",
        "It could be 5 minutes of practice, one letter read, one time you held back an emotion.",
        "If you didn't do anything — what could you do tomorrow in 2 minutes?"
      ]},
    ],
    relatedness: [
      { question: "Was I genuine in my interactions today, or was I playing a role?", hints: [
        "Was there a moment when you said something other than what you thought?",
        "With whom were you your true self today?",
        "If you wore a 'mask' — why? What were you trying to protect?"
      ]},
      { question: "Whom did I help today, or who helped me feel truly understood?", hints: [
        "Was there a moment when you supported someone?",
        "Was there a moment when someone really heard you?",
        "What exactly made that moment warm?"
      ]},
      { question: "How did my actions today affect the people I care about?", hints: [
        "What did you do today that affected loved ones? Even if it's small.",
        "How did your mood or actions reflect on someone important?",
        "If they described your influence on their day, what would they say?"
      ]},
      { question: "Was there a moment today when I felt warmth or support? What made it possible?", hints: [
        "Recall a warm moment. Who or what created it?",
        "What exactly warmed you? Words? A look? Silence nearby?",
        "How can you create such a moment for yourself or another tomorrow?"
      ]},
      { question: "Did I expect 'mind-reading' from others today? Did I tell them what I needed?", hints: [
        "Was there a moment when you got upset that someone didn't understand you without words?",
        "Did you ask for what you needed?",
        "If you didn't — what stopped you?"
      ]},
      { question: "If I feel lonely today, is it the objective absence of people, or the presence of people without depth of contact?", hints: [
        "How many people were around you today? And how many of them saw the real you?",
        "Were you in company but felt lonely? Why?",
        "What's needed to feel depth of contact?"
      ]},
      { question: "With whom was I my true self today? What gave me that sense of safety?", hints: [
        "Name the person or people with whom you didn't play a role today.",
        "What exactly in that interaction allowed you to relax?",
        "What did you feel after that interaction?"
      ]},
      { question: "Whose life got better today because I exist?", hints: [
        "Whom did you bring joy to today? Even if it was a passerby you smiled at.",
        "Whose day became easier because of you?",
        "If no one comes to mind — what can you do tomorrow for that?"
      ]},
      { question: "Was there a moment today when I wanted support but didn't ask? What stopped me?", hints: [
        "Recall a moment when it was hard or sad. Did you ask for help?",
        "If not — what stopped you? Fear of seeming weak? Not wanting to burden anyone?",
        "What might have happened if you had asked?"
      ]},
      { question: "If I had shown 10% more vulnerability with a close person today, what would have changed?", hints: [
        "What did you hide from someone close today? A feeling, a fear, fatigue?",
        "If you had shared it — how would it have affected your closeness?",
        "What's the worst that could have happened? And the best?"
      ]},
    ],
    universal: [
      { question: "What do I think about this? Where does that thought come from?", hints: [
        "Write down that thought literally, the way it sounds in your head.",
        "When did you first hear that thought? Who said it?",
        "Is it a fact or an interpretation?"
      ]},
      { question: "What evidence supports my belief? And what contradicts it?", hints: [
        "Make two lists: 'for' and 'against'. Be honest.",
        "If this were a court, what evidence would the prosecution and defense have?",
        "Is there evidence you usually ignore?"
      ]},
      { question: "Is there another way to look at this situation?", hints: [
        "How would someone who loves you look at this?",
        "How would someone who isn't emotionally involved look at this?",
        "What might you have overlooked?"
      ]},
      { question: "What would I advise a friend in my place?", hints: [
        "Imagine your best friend came to you with the same situation. What would you say?",
        "Were you as kind to yourself as you would be to a friend?",
        "Write down the advice you'd give a friend, then read it to yourself."
      ]},
      { question: "What's the worst that could happen? And how likely is it really?", hints: [
        "Name the scariest scenario. Write it out.",
        "Rate the probability of that scenario on a 1–10 scale.",
        "Even if it happens — could you cope with it? How?"
      ]},
      { question: "If I leave everything as it is, where will I be in a month? In a year?", hints: [
        "If nothing changes, where will your situation be in a month?",
        "And in a year? Does that suit you?",
        "If not — what's the smallest step you can take today?"
      ]},
      { question: "What is one small action I can take right now?", hints: [
        "Don't think about the big plan. What takes less than 2 minutes?",
        "What can you do even if you have no energy?",
        "Do it right now, while you're reading this hint."
      ]},
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
  journal_legend_checkin: "Чекин",
  journal_legend_note: "Ответ/заметка",
  journal_legend_deep: "Разбор",
  journal_month_stats_suffix: "— статистика",
  journal_records: "Записей",
  journal_avg_suffix: "(avg)",

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
  journal_legend_checkin: "Check-in",
  journal_legend_note: "Answer / note",
  journal_legend_deep: "Deep dive",
  journal_month_stats_suffix: "— statistics",
  journal_records: "Records",
  journal_avg_suffix: "(avg)",

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
