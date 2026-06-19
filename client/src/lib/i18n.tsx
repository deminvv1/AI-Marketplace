"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ru" | "zh" | "de" | "es" | "fr" | "tr" | "hi" | "pt" | "ar" | "ja" | "id";

export const LOCALES: { code: Locale; label: string; flag: string; native: string; rtl?: boolean }[] = [
  { code: "en", label: "English",    flag: "🇬🇧", native: "EN" },
  { code: "ru", label: "Русский",    flag: "🇷🇺", native: "RU" },
  { code: "zh", label: "中文",        flag: "🇨🇳", native: "ZH" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪", native: "DE" },
  { code: "es", label: "Español",    flag: "🇪🇸", native: "ES" },
  { code: "fr", label: "Français",   flag: "🇫🇷", native: "FR" },
  { code: "tr", label: "Türkçe",     flag: "🇹🇷", native: "TR" },
  { code: "hi", label: "हिन्दी",      flag: "🇮🇳", native: "HI" },
  { code: "pt", label: "Português",  flag: "🇧🇷", native: "PT" },
  { code: "ar", label: "العربية",    flag: "🇸🇦", native: "AR", rtl: true },
  { code: "ja", label: "日本語",      flag: "🇯🇵", native: "JA" },
  { code: "id", label: "Indonesia",  flag: "🇮🇩", native: "ID" },
];

const en = {
    nav: {
      dashboard:    "Dashboard",
      search:       "Search",
      projects:     "Projects",
      proposals:    "My proposals",
      freelancers:  "Freelancers",
      saved:        "Saved",
      solutions:    "Solutions",
      forum:        "Forum",
      messages:     "Messages",
      profile:      "Profile",
      settings:     "Settings",
    },
    header: {
      search_placeholder: "Search…",
    },
    notifications: {
      title:         "Notifications",
      mark_all_read: "Mark all read",
      empty:         "No notifications yet.",
      open:          "Open",
    },
    common: {
      save:        "Save",
      cancel:      "Cancel",
      edit:        "Edit Profile",
      loading:     "Loading…",
      go_home:     "Go home",
      try_again:   "Try again",
      go_back:     "Go back",
      view_all:    "View all",
      post_project:"Post a project",
      publish:     "Publish",
      write:       "Write",
      send:        "Send",
      submit:      "Submit",
      delete:      "Delete",
      report:      "Report",
      block:       "Block",
    },
    empty: {
      no_projects_title: "No projects found",
      no_projects_desc:  "No projects match your filters. Try adjusting them or post a new project.",
      no_solutions_title:"No solutions found",
      no_solutions_desc: "No solutions match your filters. Be the first to publish an AI solution.",
      no_forum_title:    "No topics yet",
      no_forum_desc:     "Be the first to start a discussion in this community.",
      no_convos_title:   "No conversations yet",
      no_convos_desc:    "Open a freelancer profile and click Write to start a conversation.",
      no_saved_title:    "No saved freelancers",
      no_saved_desc:     "Browse freelancers and save the ones you'd like to work with.",
    },
    not_found: {
      title: "Page not found",
      desc:  "The page you're looking for doesn't exist, was moved, or is temporarily unavailable.",
    },
    error: {
      title: "Something went wrong",
      desc:  "An unexpected error occurred. You can try again, or head back to a safe page.",
    },
};

type Dict = typeof en;

const translations: Record<Locale, Dict> = {
  en,

  ru: {
    nav: {
      dashboard:    "Главная",
      search:       "Поиск",
      projects:     "Проекты",
      proposals:    "Мои заявки",
      freelancers:  "Фрилансеры",
      saved:        "Сохранённые",
      solutions:    "Решения",
      forum:        "Форум",
      messages:     "Сообщения",
      profile:      "Профиль",
      settings:     "Настройки",
    },
    header: {
      search_placeholder: "Поиск…",
    },
    notifications: {
      title:         "Уведомления",
      mark_all_read: "Отметить все",
      empty:         "Уведомлений пока нет.",
      open:          "Открыть",
    },
    common: {
      save:        "Сохранить",
      cancel:      "Отмена",
      edit:        "Редактировать",
      loading:     "Загрузка…",
      go_home:     "На главную",
      try_again:   "Попробовать снова",
      go_back:     "Назад",
      view_all:    "Все",
      post_project:"Разместить проект",
      publish:     "Опубликовать",
      write:       "Написать",
      send:        "Отправить",
      submit:      "Подать",
      delete:      "Удалить",
      report:      "Пожаловаться",
      block:       "Заблокировать",
    },
    empty: {
      no_projects_title: "Проекты не найдены",
      no_projects_desc:  "Ни один проект не соответствует фильтрам. Измените параметры или разместите проект.",
      no_solutions_title:"Решения не найдены",
      no_solutions_desc: "Ни одно решение не найдено. Будьте первым, кто опубликует решение.",
      no_forum_title:    "Нет тем",
      no_forum_desc:     "Начните первое обсуждение в этом сообществе.",
      no_convos_title:   "Нет переписок",
      no_convos_desc:    "Откройте профиль фрилансера и нажмите «Написать».",
      no_saved_title:    "Нет сохранённых",
      no_saved_desc:     "Сохраняйте фрилансеров со страницы их профиля.",
    },
    not_found: {
      title: "Страница не найдена",
      desc:  "Такой страницы не существует или она была перемещена.",
    },
    error: {
      title: "Что-то пошло не так",
      desc:  "Произошла непредвиденная ошибка. Попробуйте снова или вернитесь на главную.",
    },
  },

  zh: {
    nav: {
      dashboard:    "主页",
      search:       "搜索",
      projects:     "项目",
      proposals:    "我的投标",
      freelancers:  "自由职业者",
      saved:        "已收藏",
      solutions:    "解决方案",
      forum:        "论坛",
      messages:     "消息",
      profile:      "个人资料",
      settings:     "设置",
    },
    header: {
      search_placeholder: "搜索…",
    },
    notifications: {
      title:         "通知",
      mark_all_read: "全部标为已读",
      empty:         "暂无通知。",
      open:          "打开",
    },
    common: {
      save:        "保存",
      cancel:      "取消",
      edit:        "编辑资料",
      loading:     "加载中…",
      go_home:     "返回主页",
      try_again:   "重试",
      go_back:     "返回",
      view_all:    "查看全部",
      post_project:"发布项目",
      publish:     "发布",
      write:       "写信",
      send:        "发送",
      submit:      "提交",
      delete:      "删除",
      report:      "举报",
      block:       "屏蔽",
    },
    empty: {
      no_projects_title: "未找到项目",
      no_projects_desc:  "没有符合筛选条件的项目，请调整筛选条件或发布新项目。",
      no_solutions_title:"未找到解决方案",
      no_solutions_desc: "暂无解决方案，成为第一个发布的人吧。",
      no_forum_title:    "暂无话题",
      no_forum_desc:     "成为第一个在此社区发起讨论的人。",
      no_convos_title:   "暂无对话",
      no_convos_desc:    "打开自由职业者的主页，点击「写信」开始对话。",
      no_saved_title:    "暂无收藏",
      no_saved_desc:     "浏览自由职业者并将感兴趣的人收藏起来。",
    },
    not_found: {
      title: "页面未找到",
      desc:  "您访问的页面不存在或已被移动。",
    },
    error: {
      title: "出错了",
      desc:  "发生了意外错误，请重试或返回主页。",
    },
  },

  de: {
    nav: {
      dashboard:    "Dashboard",
      search:       "Suche",
      projects:     "Projekte",
      proposals:    "Meine Angebote",
      freelancers:  "Freelancer",
      saved:        "Gespeichert",
      solutions:    "Lösungen",
      forum:        "Forum",
      messages:     "Nachrichten",
      profile:      "Profil",
      settings:     "Einstellungen",
    },
    header: {
      search_placeholder: "Suchen…",
    },
    notifications: {
      title:         "Benachrichtigungen",
      mark_all_read: "Alle gelesen",
      empty:         "Noch keine Benachrichtigungen.",
      open:          "Öffnen",
    },
    common: {
      save:        "Speichern",
      cancel:      "Abbrechen",
      edit:        "Profil bearbeiten",
      loading:     "Laden…",
      go_home:     "Zur Startseite",
      try_again:   "Erneut versuchen",
      go_back:     "Zurück",
      view_all:    "Alle anzeigen",
      post_project:"Projekt veröffentlichen",
      publish:     "Veröffentlichen",
      write:       "Schreiben",
      send:        "Senden",
      submit:      "Einreichen",
      delete:      "Löschen",
      report:      "Melden",
      block:       "Blockieren",
    },
    empty: {
      no_projects_title: "Keine Projekte gefunden",
      no_projects_desc:  "Keine Projekte entsprechen Ihren Filtern. Passen Sie diese an oder erstellen Sie ein neues Projekt.",
      no_solutions_title:"Keine Lösungen gefunden",
      no_solutions_desc: "Keine Lösungen gefunden. Seien Sie der Erste, der eine KI-Lösung veröffentlicht.",
      no_forum_title:    "Noch keine Themen",
      no_forum_desc:     "Starten Sie die erste Diskussion in dieser Community.",
      no_convos_title:   "Noch keine Gespräche",
      no_convos_desc:    "Öffnen Sie ein Freelancer-Profil und klicken Sie auf 'Schreiben'.",
      no_saved_title:    "Keine gespeicherten Freelancer",
      no_saved_desc:     "Durchsuchen Sie Freelancer und speichern Sie die, mit denen Sie arbeiten möchten.",
    },
    not_found: {
      title: "Seite nicht gefunden",
      desc:  "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    },
    error: {
      title: "Etwas ist schiefgelaufen",
      desc:  "Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie es erneut oder gehen Sie zur Startseite.",
    },
  },

  es: {
    nav: {
      dashboard:    "Panel",
      search:       "Buscar",
      projects:     "Proyectos",
      proposals:    "Mis propuestas",
      freelancers:  "Freelancers",
      saved:        "Guardados",
      solutions:    "Soluciones",
      forum:        "Foro",
      messages:     "Mensajes",
      profile:      "Perfil",
      settings:     "Configuración",
    },
    header: {
      search_placeholder: "Buscar…",
    },
    notifications: {
      title:         "Notificaciones",
      mark_all_read: "Marcar todo leído",
      empty:         "Sin notificaciones todavía.",
      open:          "Abrir",
    },
    common: {
      save:        "Guardar",
      cancel:      "Cancelar",
      edit:        "Editar perfil",
      loading:     "Cargando…",
      go_home:     "Ir al inicio",
      try_again:   "Intentar de nuevo",
      go_back:     "Volver",
      view_all:    "Ver todo",
      post_project:"Publicar proyecto",
      publish:     "Publicar",
      write:       "Escribir",
      send:        "Enviar",
      submit:      "Enviar",
      delete:      "Eliminar",
      report:      "Reportar",
      block:       "Bloquear",
    },
    empty: {
      no_projects_title: "No se encontraron proyectos",
      no_projects_desc:  "Ningún proyecto coincide con sus filtros. Ajústelos o publique un nuevo proyecto.",
      no_solutions_title:"No se encontraron soluciones",
      no_solutions_desc: "No hay soluciones disponibles. Sea el primero en publicar una solución de IA.",
      no_forum_title:    "Aún no hay temas",
      no_forum_desc:     "Sea el primero en iniciar una discusión en esta comunidad.",
      no_convos_title:   "Sin conversaciones",
      no_convos_desc:    "Abra un perfil de freelancer y haga clic en Escribir para comenzar.",
      no_saved_title:    "Sin freelancers guardados",
      no_saved_desc:     "Explore freelancers y guarde los que le interesen.",
    },
    not_found: {
      title: "Página no encontrada",
      desc:  "La página que busca no existe, fue movida o no está disponible temporalmente.",
    },
    error: {
      title: "Algo salió mal",
      desc:  "Ocurrió un error inesperado. Puede intentarlo de nuevo o regresar al inicio.",
    },
  },

  fr: {
    nav: {
      dashboard:    "Tableau de bord",
      search:       "Rechercher",
      projects:     "Projets",
      proposals:    "Mes propositions",
      freelancers:  "Freelances",
      saved:        "Enregistrés",
      solutions:    "Solutions",
      forum:        "Forum",
      messages:     "Messages",
      profile:      "Profil",
      settings:     "Paramètres",
    },
    header: {
      search_placeholder: "Rechercher…",
    },
    notifications: {
      title:         "Notifications",
      mark_all_read: "Tout marquer lu",
      empty:         "Aucune notification pour l'instant.",
      open:          "Ouvrir",
    },
    common: {
      save:        "Enregistrer",
      cancel:      "Annuler",
      edit:        "Modifier le profil",
      loading:     "Chargement…",
      go_home:     "Accueil",
      try_again:   "Réessayer",
      go_back:     "Retour",
      view_all:    "Tout voir",
      post_project:"Publier un projet",
      publish:     "Publier",
      write:       "Écrire",
      send:        "Envoyer",
      submit:      "Soumettre",
      delete:      "Supprimer",
      report:      "Signaler",
      block:       "Bloquer",
    },
    empty: {
      no_projects_title: "Aucun projet trouvé",
      no_projects_desc:  "Aucun projet ne correspond à vos filtres. Ajustez-les ou publiez un nouveau projet.",
      no_solutions_title:"Aucune solution trouvée",
      no_solutions_desc: "Aucune solution disponible. Soyez le premier à publier une solution IA.",
      no_forum_title:    "Aucun sujet pour l'instant",
      no_forum_desc:     "Soyez le premier à lancer une discussion dans cette communauté.",
      no_convos_title:   "Aucune conversation",
      no_convos_desc:    "Ouvrez un profil de freelance et cliquez sur Écrire pour commencer.",
      no_saved_title:    "Aucun freelance enregistré",
      no_saved_desc:     "Parcourez les freelances et enregistrez ceux avec qui vous souhaitez travailler.",
    },
    not_found: {
      title: "Page introuvable",
      desc:  "La page que vous recherchez n'existe pas, a été déplacée ou est temporairement indisponible.",
    },
    error: {
      title: "Une erreur s'est produite",
      desc:  "Une erreur inattendue s'est produite. Réessayez ou retournez à l'accueil.",
    },
  },

  tr: {
    nav: {
      dashboard:    "Panel",
      search:       "Ara",
      projects:     "Projeler",
      proposals:    "Tekliflerim",
      freelancers:  "Freelancerlar",
      saved:        "Kaydedilenler",
      solutions:    "Çözümler",
      forum:        "Forum",
      messages:     "Mesajlar",
      profile:      "Profil",
      settings:     "Ayarlar",
    },
    header: {
      search_placeholder: "Ara…",
    },
    notifications: {
      title:         "Bildirimler",
      mark_all_read: "Tümünü okundu işaretle",
      empty:         "Henüz bildirim yok.",
      open:          "Aç",
    },
    common: {
      save:        "Kaydet",
      cancel:      "İptal",
      edit:        "Profili Düzenle",
      loading:     "Yükleniyor…",
      go_home:     "Ana Sayfaya Git",
      try_again:   "Tekrar Dene",
      go_back:     "Geri",
      view_all:    "Tümünü Gör",
      post_project:"Proje Yayınla",
      publish:     "Yayınla",
      write:       "Yaz",
      send:        "Gönder",
      submit:      "Gönder",
      delete:      "Sil",
      report:      "Şikayet Et",
      block:       "Engelle",
    },
    empty: {
      no_projects_title: "Proje bulunamadı",
      no_projects_desc:  "Filtrelerinizle eşleşen proje yok. Filtreleri değiştirin veya yeni proje yayınlayın.",
      no_solutions_title:"Çözüm bulunamadı",
      no_solutions_desc: "Hiç çözüm yok. İlk AI çözümünü yayınlayan siz olun.",
      no_forum_title:    "Henüz konu yok",
      no_forum_desc:     "Bu toplulukta ilk tartışmayı siz başlatın.",
      no_convos_title:   "Henüz konuşma yok",
      no_convos_desc:    "Bir freelancer profili açın ve Yaz'a tıklayın.",
      no_saved_title:    "Kaydedilen freelancer yok",
      no_saved_desc:     "Freelancer'ları gözatın ve birlikte çalışmak istediklerinizi kaydedin.",
    },
    not_found: {
      title: "Sayfa bulunamadı",
      desc:  "Aradığınız sayfa mevcut değil veya taşınmış.",
    },
    error: {
      title: "Bir şeyler yanlış gitti",
      desc:  "Beklenmeyen bir hata oluştu. Tekrar deneyin veya ana sayfaya dönün.",
    },
  },

  hi: {
    nav: {
      dashboard:    "डैशबोर्ड",
      search:       "खोजें",
      projects:     "प्रोजेक्ट",
      proposals:    "मेरे प्रस्ताव",
      freelancers:  "फ्रीलांसर",
      saved:        "सहेजे गए",
      solutions:    "समाधान",
      forum:        "फोरम",
      messages:     "संदेश",
      profile:      "प्रोफ़ाइल",
      settings:     "सेटिंग",
    },
    header: {
      search_placeholder: "खोजें…",
    },
    notifications: {
      title:         "सूचनाएं",
      mark_all_read: "सभी पढ़े हुए",
      empty:         "अभी कोई सूचना नहीं।",
      open:          "खोलें",
    },
    common: {
      save:        "सहेजें",
      cancel:      "रद्द करें",
      edit:        "प्रोफ़ाइल संपादित करें",
      loading:     "लोड हो रहा है…",
      go_home:     "होम पर जाएं",
      try_again:   "पुनः प्रयास करें",
      go_back:     "वापस जाएं",
      view_all:    "सभी देखें",
      post_project:"प्रोजेक्ट पोस्ट करें",
      publish:     "प्रकाशित करें",
      write:       "लिखें",
      send:        "भेजें",
      submit:      "सबमिट करें",
      delete:      "हटाएं",
      report:      "रिपोर्ट करें",
      block:       "ब्लॉक करें",
    },
    empty: {
      no_projects_title: "कोई प्रोजेक्ट नहीं मिला",
      no_projects_desc:  "कोई प्रोजेक्ट आपके फ़िल्टर से मेल नहीं खाता। फ़िल्टर बदलें या नया प्रोजेक्ट पोस्ट करें।",
      no_solutions_title:"कोई समाधान नहीं मिला",
      no_solutions_desc: "कोई समाधान उपलब्ध नहीं है। पहला AI समाधान प्रकाशित करें।",
      no_forum_title:    "अभी कोई विषय नहीं",
      no_forum_desc:     "इस समुदाय में पहली चर्चा शुरू करें।",
      no_convos_title:   "कोई बातचीत नहीं",
      no_convos_desc:    "किसी फ्रीलांसर का प्रोफ़ाइल खोलें और लिखें पर क्लिक करें।",
      no_saved_title:    "कोई सहेजे गए फ्रीलांसर नहीं",
      no_saved_desc:     "फ्रीलांसर ब्राउज़ करें और पसंदीदा को सहेजें।",
    },
    not_found: {
      title: "पेज नहीं मिला",
      desc:  "आप जो पेज ढूंढ रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।",
    },
    error: {
      title: "कुछ गलत हो गया",
      desc:  "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें या होम पर जाएं।",
    },
  },

  pt: {
    nav: {
      dashboard:    "Painel",
      search:       "Buscar",
      projects:     "Projetos",
      proposals:    "Minhas propostas",
      freelancers:  "Freelancers",
      saved:        "Salvos",
      solutions:    "Soluções",
      forum:        "Fórum",
      messages:     "Mensagens",
      profile:      "Perfil",
      settings:     "Configurações",
    },
    header: {
      search_placeholder: "Buscar…",
    },
    notifications: {
      title:         "Notificações",
      mark_all_read: "Marcar tudo como lido",
      empty:         "Sem notificações ainda.",
      open:          "Abrir",
    },
    common: {
      save:        "Salvar",
      cancel:      "Cancelar",
      edit:        "Editar perfil",
      loading:     "Carregando…",
      go_home:     "Ir para início",
      try_again:   "Tentar novamente",
      go_back:     "Voltar",
      view_all:    "Ver tudo",
      post_project:"Publicar projeto",
      publish:     "Publicar",
      write:       "Escrever",
      send:        "Enviar",
      submit:      "Enviar",
      delete:      "Excluir",
      report:      "Denunciar",
      block:       "Bloquear",
    },
    empty: {
      no_projects_title: "Nenhum projeto encontrado",
      no_projects_desc:  "Nenhum projeto corresponde aos filtros. Ajuste-os ou publique um novo projeto.",
      no_solutions_title:"Nenhuma solução encontrada",
      no_solutions_desc: "Sem soluções disponíveis. Seja o primeiro a publicar uma solução de IA.",
      no_forum_title:    "Nenhum tópico ainda",
      no_forum_desc:     "Seja o primeiro a iniciar uma discussão nesta comunidade.",
      no_convos_title:   "Nenhuma conversa",
      no_convos_desc:    "Abra um perfil de freelancer e clique em Escrever para começar.",
      no_saved_title:    "Nenhum freelancer salvo",
      no_saved_desc:     "Explore os freelancers e salve os que lhe interessam.",
    },
    not_found: {
      title: "Página não encontrada",
      desc:  "A página que você procura não existe, foi movida ou está temporariamente indisponível.",
    },
    error: {
      title: "Algo deu errado",
      desc:  "Ocorreu um erro inesperado. Tente novamente ou volte ao início.",
    },
  },

  ar: {
    nav: {
      dashboard:    "لوحة التحكم",
      search:       "بحث",
      projects:     "المشاريع",
      proposals:    "عروضي",
      freelancers:  "المستقلون",
      saved:        "المحفوظات",
      solutions:    "الحلول",
      forum:        "المنتدى",
      messages:     "الرسائل",
      profile:      "الملف الشخصي",
      settings:     "الإعدادات",
    },
    header: {
      search_placeholder: "ابحث…",
    },
    notifications: {
      title:         "الإشعارات",
      mark_all_read: "تعيين الكل كمقروء",
      empty:         "لا توجد إشعارات بعد.",
      open:          "فتح",
    },
    common: {
      save:        "حفظ",
      cancel:      "إلغاء",
      edit:        "تعديل الملف الشخصي",
      loading:     "جار التحميل…",
      go_home:     "الذهاب للرئيسية",
      try_again:   "المحاولة مجددًا",
      go_back:     "رجوع",
      view_all:    "عرض الكل",
      post_project:"نشر مشروع",
      publish:     "نشر",
      write:       "كتابة",
      send:        "إرسال",
      submit:      "إرسال",
      delete:      "حذف",
      report:      "إبلاغ",
      block:       "حظر",
    },
    empty: {
      no_projects_title: "لم يتم العثور على مشاريع",
      no_projects_desc:  "لا توجد مشاريع تطابق الفلاتر. عدّل الفلاتر أو انشر مشروعًا جديدًا.",
      no_solutions_title:"لم يتم العثور على حلول",
      no_solutions_desc: "لا توجد حلول متاحة. كن أول من ينشر حلًا للذكاء الاصطناعي.",
      no_forum_title:    "لا توجد موضوعات بعد",
      no_forum_desc:     "كن أول من يبدأ نقاشًا في هذا المجتمع.",
      no_convos_title:   "لا توجد محادثات",
      no_convos_desc:    "افتح ملف مستقل واضغط على كتابة لبدء محادثة.",
      no_saved_title:    "لا يوجد مستقلون محفوظون",
      no_saved_desc:     "تصفح المستقلين واحفظ من تريد العمل معهم.",
    },
    not_found: {
      title: "الصفحة غير موجودة",
      desc:  "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    },
    error: {
      title: "حدث خطأ ما",
      desc:  "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة للرئيسية.",
    },
  },

  ja: {
    nav: {
      dashboard:    "ダッシュボード",
      search:       "検索",
      projects:     "プロジェクト",
      proposals:    "提案",
      freelancers:  "フリーランサー",
      saved:        "保存済み",
      solutions:    "ソリューション",
      forum:        "フォーラム",
      messages:     "メッセージ",
      profile:      "プロフィール",
      settings:     "設定",
    },
    header: {
      search_placeholder: "検索…",
    },
    notifications: {
      title:         "通知",
      mark_all_read: "すべて既読にする",
      empty:         "まだ通知はありません。",
      open:          "開く",
    },
    common: {
      save:        "保存",
      cancel:      "キャンセル",
      edit:        "プロフィール編集",
      loading:     "読み込み中…",
      go_home:     "ホームへ戻る",
      try_again:   "再試行",
      go_back:     "戻る",
      view_all:    "すべて見る",
      post_project:"プロジェクト投稿",
      publish:     "公開",
      write:       "書く",
      send:        "送信",
      submit:      "送信",
      delete:      "削除",
      report:      "報告",
      block:       "ブロック",
    },
    empty: {
      no_projects_title: "プロジェクトが見つかりません",
      no_projects_desc:  "フィルターに一致するプロジェクトがありません。条件を変更するか新しいプロジェクトを投稿してください。",
      no_solutions_title:"ソリューションが見つかりません",
      no_solutions_desc: "ソリューションがありません。最初のAIソリューションを公開しましょう。",
      no_forum_title:    "まだトピックがありません",
      no_forum_desc:     "このコミュニティで最初のディスカッションを始めましょう。",
      no_convos_title:   "まだ会話がありません",
      no_convos_desc:    "フリーランサーのプロフィールを開き「書く」をクリックしてください。",
      no_saved_title:    "保存済みフリーランサーなし",
      no_saved_desc:     "フリーランサーを閲覧して気に入った方を保存してください。",
    },
    not_found: {
      title: "ページが見つかりません",
      desc:  "お探しのページは存在しないか、移動されました。",
    },
    error: {
      title: "エラーが発生しました",
      desc:  "予期しないエラーが発生しました。再試行するかホームへ戻ってください。",
    },
  },

  id: {
    nav: {
      dashboard:    "Dasbor",
      search:       "Cari",
      projects:     "Proyek",
      proposals:    "Proposal Saya",
      freelancers:  "Freelancer",
      saved:        "Tersimpan",
      solutions:    "Solusi",
      forum:        "Forum",
      messages:     "Pesan",
      profile:      "Profil",
      settings:     "Pengaturan",
    },
    header: {
      search_placeholder: "Cari…",
    },
    notifications: {
      title:         "Notifikasi",
      mark_all_read: "Tandai semua telah dibaca",
      empty:         "Belum ada notifikasi.",
      open:          "Buka",
    },
    common: {
      save:        "Simpan",
      cancel:      "Batal",
      edit:        "Edit Profil",
      loading:     "Memuat…",
      go_home:     "Ke Beranda",
      try_again:   "Coba Lagi",
      go_back:     "Kembali",
      view_all:    "Lihat Semua",
      post_project:"Pasang Proyek",
      publish:     "Publikasikan",
      write:       "Tulis",
      send:        "Kirim",
      submit:      "Kirim",
      delete:      "Hapus",
      report:      "Laporkan",
      block:       "Blokir",
    },
    empty: {
      no_projects_title: "Tidak ada proyek ditemukan",
      no_projects_desc:  "Tidak ada proyek yang sesuai filter. Sesuaikan filter atau pasang proyek baru.",
      no_solutions_title:"Tidak ada solusi ditemukan",
      no_solutions_desc: "Belum ada solusi tersedia. Jadilah yang pertama menerbitkan solusi AI.",
      no_forum_title:    "Belum ada topik",
      no_forum_desc:     "Jadilah yang pertama memulai diskusi di komunitas ini.",
      no_convos_title:   "Belum ada percakapan",
      no_convos_desc:    "Buka profil freelancer dan klik Tulis untuk memulai percakapan.",
      no_saved_title:    "Tidak ada freelancer tersimpan",
      no_saved_desc:     "Jelajahi freelancer dan simpan yang ingin Anda ajak bekerja sama.",
    },
    not_found: {
      title: "Halaman tidak ditemukan",
      desc:  "Halaman yang Anda cari tidak ada, dipindahkan, atau tidak tersedia sementara.",
    },
    error: {
      title: "Ada yang salah",
      desc:  "Terjadi kesalahan tak terduga. Coba lagi atau kembali ke halaman aman.",
    },
  },
};

// ── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ai_marketplace_locale";

type I18nCtx = { locale: Locale; t: Dict; setLocale: (l: Locale) => void };

const I18nContext = createContext<I18nCtx>({
  locale: "en",
  t: translations.en,
  setLocale: () => {},
});

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && saved in translations) return saved;
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  const match = LOCALES.find((l) => l.code === lang);
  return match ? match.code : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    const isRtl = LOCALES.find((l) => l.code === locale)?.rtl;
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
