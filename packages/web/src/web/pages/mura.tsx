import { DemoDialog } from "../components/demo-dialog";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Plus,
  Sun,
  Moon,
  User,
  Search,
  X,
  Leaf,
  ShieldCheck,
  QrCode,
  Heart,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Bell,
  LogOut,
  Upload,
  Repeat2,
  Package,
  Menu,
  Copy,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  categories,
  conditions,
  seed,
  stored,
  type Lang,
  type Item,
  type Booking,
  type Text,
} from "../lib/demo";

export default function Mura() {
  const [path, navigate] = useLocation();
  const [lang, setLang] = useState<Lang>(() => stored("mura-lang", "ru"));
  const [dark, setDark] = useState(() => stored("mura-dark", false));
  const [items, setItems] = useState<Item[]>(() => stored("mura-items", seed));
  const [bookings, setBookings] = useState<Booking[]>(() => stored("mura-bookings", []));
  const [account, setAccount] = useState<{ name: string; grade: string } | null>(() =>
    stored("mura-account", null),
  );
  const [saved, setSaved] = useState<string[]>(() => stored("mura-saved", []));
  const [auth, setAuth] = useState(false);
  const [register, setRegister] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(0);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");
  const [profileTab, setProfileTab] = useState("items");
  const [reserve, setReserve] = useState<Item | null>(null);
  const [preview, setPreview] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const t = (ru: string, kz: string, en: string) =>
    [ru, kz, en][lang === "ru" ? 0 : lang === "kz" ? 1 : 2];
  const txt = (v: Text) => t(...v);
  useEffect(() => {
    localStorage.setItem("mura-lang", JSON.stringify(lang));
    document.documentElement.lang = lang === "kz" ? "kk" : lang;
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("mura-dark", JSON.stringify(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    try {
      localStorage.setItem("mura-items", JSON.stringify(items));
    } catch {
      setToast("Demo: browser storage is full. New images may not persist.");
    }
  }, [items]);
  useEffect(() => {
    localStorage.setItem("mura-bookings", JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem("mura-account", JSON.stringify(account));
  }, [account]);
  useEffect(() => {
    localStorage.setItem("mura-saved", JSON.stringify(saved));
  }, [saved]);
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenu(false);
  }, [path]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const labelType = (type: string) =>
    type === "sale"
      ? t("Продажа", "Сату", "For sale")
      : type === "exchange"
        ? t("Обмен", "Айырбас", "Exchange")
        : t("Даром", "Тегін", "Free");
  const status = (s: string) =>
    s === "available"
      ? t("Доступна", "Қолжетімді", "Available")
      : s === "pending"
        ? t("На проверке", "Тексерілуде", "Under review")
        : s === "reserved"
          ? t("Забронирована", "Брондалған", "Reserved")
          : s === "transferred"
            ? t("Передана", "Берілді", "Transferred")
            : t("Снята с публикации", "Жарияланымнан алынды", "Withdrawn");
  const needAccount = (action: () => void) => {
    if (account) action();
    else setAuth(true);
  };
  const onAdd = () => needAccount(() => navigate("/add"));
  const toggleSaved = (id: string) =>
    setSaved((old) => (old.includes(id) ? old.filter((v) => v !== id) : [...old, id]));
  const activeItems = items.filter((i) => i.status === "available");
  const filtered = activeItems
    .filter(
      (i) =>
        (!cat || i.category === cat) &&
        (filter === "all" || i.type === filter) &&
        (txt(i.title) + " " + txt(i.description)).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (sort === "price" ? a.price - b.price : 0));
  const item = items.find((i) => i.id === path.split("/")[2]);
  const home = path === "/";
  const goHow = () => {
    navigate("/");
    setTimeout(() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }), 80);
  };
  const goAbout = () => {
    navigate("/");
    setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 80);
  };
  const Brand = () => (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <BookOpen size={28} strokeWidth={1.6} />
      </span>
      <span>
        Мұра
        <span className="brand-caption">
          {t("ШКОЛЬНОЕ СООБЩЕСТВО", "МЕКТЕП ҚАУЫМДАСТЫҒЫ", "SCHOOL COMMUNITY")}
        </span>
      </span>
    </Link>
  );
  const Card = ({ i }: { i: Item }) => (
    <article className="item-card">
      <div className={"item-photo " + i.id}>
        <Link href={"/item/" + i.id}>
          <img src={i.image} alt={txt(i.title)} loading="lazy" />
        </Link>
        <span className={"type-label " + i.type}>{labelType(i.type)}</span>
        <button
          className={"favorite " + (saved.includes(i.id) ? "is-saved" : "")}
          onClick={() => toggleSaved(i.id)}
          aria-label={t("Сохранить вещь", "Затты сақтау", "Save item")}
        >
          <Heart size={18} fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="item-info">
        <span className="eyebrow">{txt(categories[i.category])}</span>
        <Link href={"/item/" + i.id}>
          <h3>{txt(i.title)}</h3>
        </Link>
        <div className="item-price">
          {i.type === "sale"
            ? i.price.toLocaleString("ru-RU") + " ₸"
            : i.type === "free"
              ? t("Бесплатно", "Тегін", "Free to a new home")
              : t("На обмен", "Айырбасқа", "Open to exchange")}
        </div>
        <div className="item-bottom">
          <span>
            {txt(conditions[i.condition])} · {i.grade}
          </span>
          <span className="availability">
            <i />
            {status(i.status)}
          </span>
        </div>
      </div>
    </article>
  );
  const sectionTitle = (small: string, title: string, sub?: string) => (
    <div className="section-title">
      <span className="eyebrow orange">{small}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
  const Profile = () => (
    <div className="container page">
      <div className="page-head">
        {sectionTitle(
          t("ЛИЧНЫЙ КАБИНЕТ", "ЖЕКЕ КАБИНЕТ", "YOUR SPACE"),
          account?.name || t("Ваш профиль", "Сіздің профиліңіз", "Your profile"),
        )}
        <button
          className="secondary"
          onClick={() => {
            setAccount(null);
            navigate("/");
            setToast(
              t(
                "Вы вышли из демопрофиля",
                "Демо-профильден шықтыңыз",
                "Signed out of demo profile",
              ),
            );
          }}
        >
          <LogOut size={16} />
          {t("Выйти", "Шығу", "Sign out")}
        </button>
      </div>
      {!account ? (
        <div className="empty">
          <User size={36} />
          <h3>{t("Войдите в своё сообщество", "Қауымдастыққа кіріңіз", "Join your community")}</h3>
          <p>
            {t(
              "Публикуйте вещи и следите за передачами в деморежиме.",
              "Демо режимде заттарды жариялап, берілімдерді бақылаңыз.",
              "Publish items and follow transfers in demo mode.",
            )}
          </p>
          <button className="primary" onClick={() => setAuth(true)}>
            {t("Войти", "Кіру", "Sign in")}
          </button>
        </div>
      ) : (
        <>
          <div className="profile-meta">
            <span className="avatar">{account.name[0]}</span>
            <div>
              <h3>{account.name}</h3>
              <p>
                {t("Демонстрационная школа", "Демонстрациялық мектеп", "Demo school")} ·{" "}
                {account.grade}
              </p>
            </div>
            <span className="demo-pill">DEMO</span>
          </div>
          <div className="profile-stats">
            <div>
              <b>{items.filter((i) => i.mine && i.status !== "removed").length}</b>
              <span>{t("Мои объявления", "Менің хабарландыруларым", "My listings")}</span>
            </div>
            <div>
              <b>
                {bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length}
              </b>
              <span>{t("Активные запросы", "Белсенді сұраулар", "Active requests")}</span>
            </div>
            <div>
              <b>{bookings.filter((b) => b.status === "done").length}</b>
              <span>{t("Демо-передачи", "Демо-берілімдер", "Demo transfers")}</span>
            </div>
          </div>
          <div className="tabs">
            {[
              ["items", t("Мои вещи", "Менің заттарым", "My items")],
              ["bookings", t("Бронирования", "Брондаулар", "Bookings")],
              ["saved", t("Избранное", "Таңдаулылар", "Saved")],
              ["notifications", t("Уведомления", "Хабарламалар", "Notifications")],
              ["moderation", t("Демо-модерация", "Демо-модерация", "Demo moderation")],
            ].map(([v, l]) => (
              <button
                className={profileTab === v ? "active" : ""}
                onClick={() => setProfileTab(v)}
                key={v}
              >
                {l}
              </button>
            ))}
          </div>
          {profileTab === "items" && (
            <>
              <div className="list-toolbar">
                <p>
                  {t(
                    "Публикации проходят проверку перед появлением в каталоге.",
                    "Жарияланымдар каталогта көрсетілмес бұрын тексеріледі.",
                    "Listings are reviewed before appearing in the catalog.",
                  )}
                </p>
                <button className="primary" onClick={onAdd}>
                  <Plus size={17} />
                  {t("Добавить вещь", "Зат қосу", "Add item")}
                </button>
              </div>
              {!items.some((i) => i.mine && i.status !== "removed") ? (
                <div className="empty">
                  <Package />
                  <h3>
                    {t("Начните свою историю", "Өз тарихыңызды бастаңыз", "Start your story")}
                  </h3>
                  <p>
                    {t(
                      "Добавьте вещь, которая пригодится другому ученику.",
                      "Басқа оқушыға пайдалы болатын затты қосыңыз.",
                      "Add something another student can use.",
                    )}
                  </p>
                </div>
              ) : (
                <div className="listing-rows">
                  {items
                    .filter((i) => i.mine && i.status !== "removed")
                    .map((i) => (
                      <div className="listing-row" key={i.id}>
                        <img src={i.image} alt="" />
                        <div>
                          <Link href={"/item/" + i.id}>
                            <h3>{txt(i.title)}</h3>
                          </Link>
                          <p>{status(i.status)}</p>
                        </div>
                        {i.status !== "transferred" && i.status !== "reserved" && (
                          <button
                            className="text-button"
                            onClick={() => {
                              setPreview(i.image);
                              navigate("/edit/" + i.id);
                            }}
                          >
                            {t("Редактировать", "Өңдеу", "Edit")}
                          </button>
                        )}
                        {i.status !== "reserved" && i.status !== "transferred" && (
                          <button
                            className="text-button"
                            onClick={() =>
                              setItems((old) =>
                                old.map((x) => (x.id === i.id ? { ...x, status: "removed" } : x)),
                              )
                            }
                          >
                            {t("Снять", "Алып тастау", "Withdraw")}
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
          {profileTab === "saved" && (
            <div className="product-grid">
              {items
                .filter((i) => saved.includes(i.id))
                .map((i) => (
                  <Card key={i.id} i={i} />
                ))}
              {!saved.length && (
                <p className="empty">
                  {t(
                    "Сохраните понравившуюся вещь, нажав на сердечко.",
                    "Ұнаған затты жүрекшені басып сақтаңыз.",
                    "Tap a heart to save something you like.",
                  )}
                </p>
              )}
            </div>
          )}
          {profileTab === "bookings" && (
            <div className="listing-rows">
              {!bookings.length && (
                <div className="empty">
                  <BookOpen />
                  <h3>{t("Пока нет бронирований", "Әзірге брондау жоқ", "No bookings yet")}</h3>
                  <Link className="primary" href="/catalog">
                    {t("Открыть каталог", "Каталогты ашу", "Explore catalog")}
                  </Link>
                </div>
              )}
              {bookings.map((b) => {
                const i = items.find((x) => x.id === b.itemId);
                return (
                  i && (
                    <div className="booking-card" key={b.id}>
                      <img src={i.image} alt="" />
                      <div>
                        <h3>{txt(i.title)}</h3>
                        <p>
                          {b.date} ·{" "}
                          {b.place === 0
                            ? t("Библиотека", "Кітапхана", "Library")
                            : t("Стойка администрации", "Әкімшілік орны", "Administration desk")}
                        </p>
                        <span className="demo-pill">
                          {b.status === "pending"
                            ? t("Ожидает ответа", "Жауап күтілуде", "Awaiting response")
                            : b.status === "confirmed"
                              ? t("Подтверждено", "Расталды", "Confirmed")
                              : b.status === "done"
                                ? t("Передача завершена", "Берілім аяқталды", "Transfer completed")
                                : t("Отменено", "Бас тартылды", "Cancelled")}
                        </span>
                      </div>
                      <div className="booking-actions">
                        {b.status === "pending" && (
                          <button
                            className="secondary"
                            onClick={() => {
                              setBookings((old) =>
                                old.map((x) => (x.id === b.id ? { ...x, status: "confirmed" } : x)),
                              );
                              setItems((old) =>
                                old.map((x) => (x.id === i.id ? { ...x, status: "reserved" } : x)),
                              );
                              setToast(
                                t(
                                  "Ответ владельца смоделирован",
                                  "Иесінің жауабы модельденді",
                                  "Owner response simulated",
                                ),
                              );
                            }}
                          >
                            {t(
                              "Демо: подтвердить от владельца",
                              "Демо: иесі растау",
                              "Demo: owner confirms",
                            )}
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            className="primary"
                            onClick={() => {
                              setBookings((old) =>
                                old.map((x) => (x.id === b.id ? { ...x, status: "done" } : x)),
                              );
                              setItems((old) =>
                                old.map((x) =>
                                  x.id === i.id ? { ...x, status: "transferred" } : x,
                                ),
                              );
                              setToast(
                                t(
                                  "Демонстрационная передача завершена",
                                  "Демонстрациялық берілім аяқталды",
                                  "Demo transfer completed",
                                ),
                              );
                            }}
                          >
                            {t(
                              "Демо: обе стороны подтвердили",
                              "Демо: екі тарап растады",
                              "Demo: both parties confirm",
                            )}
                          </button>
                        )}
                        {["pending", "confirmed"].includes(b.status) && (
                          <button
                            className="text-button"
                            onClick={() => {
                              setBookings((old) =>
                                old.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)),
                              );
                              setItems((old) =>
                                old.map((x) => (x.id === i.id ? { ...x, status: "available" } : x)),
                              );
                            }}
                          >
                            {t("Отменить", "Бас тарту", "Cancel")}
                          </button>
                        )}
                        {b.status === "done" && (
                          <Link href={"/passport/" + i.id} className="text-button">
                            {t("Паспорт вещи", "Зат паспорты", "Item passport")}
                            <ArrowRight size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
          {profileTab === "notifications" && (
            <div className="empty">
              <Bell />
              <h3>
                {t("События вашего демопрофиля", "Демо-профиль оқиғалары", "Demo profile activity")}
              </h3>
              <p>
                {t(
                  "Внешние уведомления не отправляются.",
                  "Сыртқы хабарламалар жіберілмейді.",
                  "No external notifications are sent.",
                )}
              </p>
              {items
                .filter((i) => i.mine)
                .map((i) => (
                  <p key={i.id}>
                    {txt(i.title)} — {status(i.status)}
                  </p>
                ))}
              {bookings.map((b) => (
                <p key={b.id}>
                  {txt(items.find((i) => i.id === b.itemId)?.title || ["", "", ""])} —{" "}
                  {b.status === "done"
                    ? t("Передача завершена", "Берілім аяқталды", "Transfer completed")
                    : t("Запрос создан", "Сұрау жасалды", "Request created")}
                </p>
              ))}
            </div>
          )}
          {profileTab === "moderation" && (
            <>
              <div className="notice">
                <ShieldCheck size={19} />
                {t(
                  "Только симуляция. В рабочей версии роль модератора будет проверяться сервером.",
                  "Тек симуляция. Жұмыс нұсқасында модератор рөлін сервер тексереді.",
                  "Simulation only. Production moderator roles will be checked on the server.",
                )}
              </div>
              {items
                .filter((i) => i.status === "pending")
                .map((i) => (
                  <div className="listing-row" key={i.id}>
                    <img src={i.image} alt="" />
                    <div>
                      <h3>{txt(i.title)}</h3>
                      <p>{txt(i.description)}</p>
                    </div>
                    <button
                      className="primary"
                      onClick={() =>
                        setItems((old) =>
                          old.map((x) => (x.id === i.id ? { ...x, status: "available" } : x)),
                        )
                      }
                    >
                      {t("Одобрить", "Мақұлдау", "Approve")}
                    </button>
                    <button
                      className="secondary"
                      onClick={() =>
                        setItems((old) =>
                          old.map((x) => (x.id === i.id ? { ...x, status: "removed" } : x)),
                        )
                      }
                    >
                      {t("Отклонить", "Қабылдамау", "Reject")}
                    </button>
                  </div>
                ))}
              {!items.some((i) => i.status === "pending") && (
                <div className="empty">
                  {t(
                    "Нет объявлений на проверке",
                    "Тексерілетін хабарландыру жоқ",
                    "No listings awaiting review",
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
  return (
    <>
      <div className="topline">
        <div className="container">
          <span>
            {t(
              "Новая жизнь вещей. Новые возможности для каждого.",
              "Заттарға жаңа өмір. Әркімге жаңа мүмкіндік.",
              "A new life for things. New possibilities for everyone.",
            )}
          </span>
          <span className="topline-right">
            <Leaf size={13} />{" "}
            {t("Ответственное потребление", "Жауапты тұтыну", "Responsible consumption")}
            <span className="top-demo">DEMO</span>
          </span>
        </div>
      </div>
      <header>
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav">
            <Link className={path === "/catalog" ? "active" : ""} href="/catalog">
              {t("Каталог", "Каталог", "Catalog")}
            </Link>
            <button onClick={goHow}>
              {t("Как это работает", "Қалай жұмыс істейді", "How it works")}
            </button>
            <button onClick={goAbout}>{t("О проекте", "Жоба туралы", "About us")}</button>
          </nav>
          <div className="header-actions">
            <div className="languages" aria-label="Language">
              {(["kz", "ru", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={lang === l ? "active" : ""}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="header-divider" />
            <button
              className="icon-button theme-button"
              onClick={() => setDark(!dark)}
              aria-label={t("Переключить тему", "Тақырыпты ауыстыру", "Toggle theme")}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="login-button"
              onClick={() => (account ? navigate("/profile") : setAuth(true))}
            >
              <User size={17} />
              <span>{account ? account.name : t("Войти", "Кіру", "Sign in")}</span>
            </button>
            <button
              className="icon-button mobile-menu-button"
              aria-label="Menu"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav className="mobile-menu">
            <Link href="/catalog">{t("Каталог", "Каталог", "Catalog")}</Link>
            <button onClick={goHow}>
              {t("Как это работает", "Қалай жұмыс істейді", "How it works")}
            </button>
            <button onClick={goAbout}>{t("О проекте", "Жоба туралы", "About us")}</button>
          </nav>
        )}
      </header>
      <main>
        {home ? (
          <>
            <section className="hero container">
              <div className="hero-text">
                <span className="hero-kicker">
                  <span />{" "}
                  {t(
                    "ПЕРЕДАВАЙ ДАЛЬШЕ. СОХРАНЯЙ ВАЖНОЕ.",
                    "ӘРІ ҚАРАЙ БЕР. МАҢЫЗДЫНЫ САҚТА.",
                    "PASS IT ON. KEEP WHAT MATTERS.",
                  )}
                </span>
                <h1>
                  {t("У каждой вещи", "Әр заттың", "Every object")}
                  <br />
                  {t("есть своя", "өз", "has a")}
                  <br />
                  <span>{t("история.", "тарихы бар.", "story.")}</span>
                </h1>
                <p>
                  {t(
                    "Передавай знания, вещи и возможности следующему поколению. Вместе со школьным сообществом «Мұра».",
                    "Білімді, заттарды және мүмкіндіктерді келесі ұрпаққа бер. «Мұра» мектеп қауымдастығымен бірге.",
                    "Pass knowledge, things and opportunities to the next generation. Together with the Mura school community.",
                  )}
                </p>
                <div className="hero-buttons">
                  <Link href="/catalog" className="primary">
                    {t("Открыть каталог", "Каталогты ашу", "Explore catalog")}
                    <ArrowUpRight size={19} />
                  </Link>
                  <button className="hero-secondary" onClick={onAdd}>
                    <Plus size={18} />
                    {t("Передать вещь", "Зат беру", "Pass something on")}
                  </button>
                </div>
                <div className="hero-foot">
                  <ShieldCheck size={16} />
                  {t(
                    "Внутри школы. Для своих. С заботой о будущем.",
                    "Мектеп ішінде. Өзіміз үшін. Болашаққа қамқорлықпен.",
                    "Within your school. For your community. For the future.",
                  )}
                </div>
              </div>
              <div className="hero-visual">
                <img
                  src="/images/hero.jpg"
                  alt={t(
                    "Книги и учебные принадлежности",
                    "Кітаптар мен оқу құралдары",
                    "Books and study supplies",
                  )}
                />
                <div className="photo-label">
                  <span>МҰРА / {t("ВТОРАЯ ЖИЗНЬ", "ЕКІНШІ ӨМІР", "SECOND LIFE")}</span>
                  <ArrowUpRight size={19} />
                </div>
                <div className="photo-note">
                  <span className="note-icon">
                    <Repeat2 size={23} />
                  </span>
                  <div>
                    <b>
                      {t(
                        "Не новое. По-новому ценное.",
                        "Жаңа емес. Қайтадан құнды.",
                        "Not new. Newly meaningful.",
                      )}
                    </b>
                    <span>
                      {t(
                        "У вещей больше одной истории",
                        "Заттың бірден көп тарихы бар",
                        "Things have more than one story",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section className="container values-strip">
              <div>
                <span className="value-icon">
                  <Repeat2 size={23} />
                </span>
                <div>
                  <b>
                    {t(
                      "Вещам — вторую жизнь",
                      "Заттарға — екінші өмір",
                      "A second life for things",
                    )}
                  </b>
                  <p>
                    {t(
                      "Обмен, продажа и передача даром",
                      "Айырбас, сату және тегін беру",
                      "Exchange, sell or give away",
                    )}
                  </p>
                </div>
              </div>
              <div>
                <span className="value-icon">
                  <ShieldCheck size={23} />
                </span>
                <div>
                  <b>
                    {t(
                      "Сообществу — больше доверия",
                      "Қауымдастыққа — сенім",
                      "A community built on trust",
                    )}
                  </b>
                  <p>
                    {t(
                      "Передача в безопасном месте школы",
                      "Мектептің қауіпсіз жерінде беру",
                      "Meet in a safe place at school",
                    )}
                  </p>
                </div>
              </div>
              <div>
                <span className="value-icon">
                  <QrCode size={23} />
                </span>
                <div>
                  <b>
                    {t(
                      "Каждой вещи — свой паспорт",
                      "Әр затқа — өз паспорты",
                      "A passport for every object",
                    )}
                  </b>
                  <p>
                    {t(
                      "История сохраняется в QR-коде",
                      "Тарих QR-кодта сақталады",
                      "A story connected by a QR code",
                    )}
                  </p>
                </div>
              </div>
            </section>
            <section className="container section available-section">
              <div className="section-heading">
                {sectionTitle(
                  t("КАТАЛОГ СООБЩЕСТВА", "ҚАУЫМДАСТЫҚ КАТАЛОГЫ", "COMMUNITY CATALOG"),
                  t(
                    "Возможно, ты это ищешь",
                    "Мүмкін, сен осыны іздеген шығарсың",
                    "Just what you might be looking for",
                  ),
                  t(
                    "Полезные вещи, готовые к новой истории.",
                    "Жаңа тарихқа дайын пайдалы заттар.",
                    "Useful things, ready for their next chapter.",
                  ),
                )}
                <Link href="/catalog" className="text-link">
                  {t("Весь каталог", "Барлық каталог", "View all items")}
                  <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="catalog-tabs">
                {[
                  ["all", t("Все вещи", "Барлық заттар", "All items")],
                  ["free", t("Даром", "Тегін", "Free")],
                  ["exchange", t("Обмен", "Айырбас", "Exchange")],
                  ["sale", t("Продажа", "Сату", "For sale")],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={filter === v ? "active" : ""}
                    onClick={() => setFilter(v)}
                  >
                    {l}
                    {v === "all" && <span>{activeItems.length}</span>}
                  </button>
                ))}
                <span className="demo-caption">
                  {t(
                    "Демонстрационные объявления",
                    "Демонстрациялық хабарландырулар",
                    "Demo listings",
                  )}
                </span>
              </div>
              <div className="product-grid">
                {activeItems
                  .filter((i) => filter === "all" || i.type === filter)
                  .slice(0, 4)
                  .map((i) => (
                    <Card key={i.id} i={i} />
                  ))}
                {!activeItems.filter((i) => filter === "all" || i.type === filter).length && (
                  <div className="empty">
                    {t(
                      "В этой подборке пока нет вещей",
                      "Бұл топтамада әзірге зат жоқ",
                      "No items in this collection yet",
                    )}
                  </div>
                )}
              </div>
            </section>
            <section id="how" className="how-section">
              <div className="container">
                <div className="section-heading">
                  {sectionTitle(
                    t("ВСЁ ПРОСТО", "БӘРІ ОҢАЙ", "IT’S SIMPLE"),
                    t(
                      "Три шага к новой истории",
                      "Жаңа тарихқа үш қадам",
                      "Three steps to a new story",
                    ),
                  )}
                  <span className="section-aside">
                    {t(
                      "Меньше лишнего. Больше полезного.",
                      "Артық зат аз. Пайда көп.",
                      "Less waste. More possibilities.",
                    )}
                  </span>
                </div>
                <div className="steps">
                  {[
                    [
                      Search,
                      t("Найди или добавь", "Тап немесе қос", "Find or add"),
                      t(
                        "Открой каталог или поделись вещью, которой больше не пользуешься.",
                        "Каталогты аш немесе енді пайдаланбайтын затыңмен бөліс.",
                        "Explore the catalog or share something you no longer use.",
                      ),
                    ],
                    [
                      Repeat2,
                      t("Договорись о передаче", "Берілімді келіс", "Arrange the handover"),
                      t(
                        "Отправь запрос и согласуй удобное время с владельцем.",
                        "Сұрау жіберіп, иесімен қолайлы уақытты келіс.",
                        "Send a request and agree on a time with the owner.",
                      ),
                    ],
                    [
                      BookOpen,
                      t("Продолжи историю", "Тарихты жалғастыр", "Continue the story"),
                      t(
                        "Встретьтесь в школе, подтвердите передачу — и вещь обретёт новую жизнь.",
                        "Мектепте кездесіп, берілімді растаңдар — зат жаңа өмірге ие болады.",
                        "Meet at school and confirm the handover. Let a new chapter begin.",
                      ),
                    ],
                  ].map(([Icon, title, description], n) => {
                    const I = Icon as typeof Search;
                    return (
                      <div className="step" key={n}>
                        <div className="step-top">
                          <span>0{n + 1}</span>
                          <I size={26} strokeWidth={1.5} />
                        </div>
                        <h3>{title as string}</h3>
                        <p>{description as string}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            <section className="container section story-section">
              <div className="story-image">
                <img
                  src="/images/dombra.jpg"
                  alt={t("Домбра", "Домбыра", "Dombra")}
                  loading="lazy"
                />
                <span>
                  {t(
                    "ОДНА ВЕЩЬ. МНОГО ИСТОРИЙ.",
                    "БІР ЗАТ. КӨП ТАРИХ.",
                    "ONE OBJECT. MANY STORIES.",
                  )}
                </span>
              </div>
              <div>
                {sectionTitle(
                  t("ЦИФРОВОЕ НАСЛЕДИЕ", "ЦИФРЛЫҚ МҰРА", "DIGITAL HERITAGE"),
                  t(
                    "Вещи меняют владельцев. Истории остаются.",
                    "Заттың иесі өзгереді. Тарихы сақталады.",
                    "Owners change. Stories stay.",
                  ),
                  t(
                    "У каждой вещи на «Мұра» есть QR-паспорт. Он помогает сохранить историю подтверждённых передач, даже когда начинается новая глава.",
                    "«Мұрадағы» әр заттың QR-паспорты бар. Ол жаңа тарау басталғанда да расталған берілімдер тарихын сақтайды.",
                    "Every object on Mura has a QR passport. It preserves the history of confirmed handovers, even when a new chapter begins.",
                  ),
                )}
                <div className="story-point">
                  <QrCode size={21} />
                  {t(
                    "Уникальный код. Постоянная связь с вещью.",
                    "Бірегей код. Затпен тұрақты байланыс.",
                    "A unique code. A lasting connection.",
                  )}
                </div>
                <Link href="/passport/dombra" className="text-link">
                  {t(
                    "Посмотреть пример паспорта",
                    "Паспорт үлгісін көру",
                    "Explore a sample passport",
                  )}
                  <ArrowUpRight size={19} />
                </Link>
              </div>
            </section>
            <section id="about" className="mission">
              <div className="container mission-inner">
                <div className="sdg">
                  <b>12</b>
                  <span>
                    {t("ОТВЕТСТВЕННОЕ\nПОТРЕБЛЕНИЕ", "ЖАУАПТЫ\nТҰТЫНУ", "RESPONSIBLE\nCONSUMPTION")}
                  </span>
                  <Repeat2 size={45} />
                </div>
                <div>
                  {sectionTitle(
                    t(
                      "БОЛЬШЕ, ЧЕМ ОБМЕН ВЕЩАМИ",
                      "ЗАТ АЙЫРБАСЫНАН ДА КӨП",
                      "MORE THAN EXCHANGING THINGS",
                    ),
                    t(
                      "Забота о будущем начинается с малого",
                      "Болашаққа қамқорлық кішкентай қадамнан басталады",
                      "A better future starts with small things",
                    ),
                    t(
                      "«Мұра» поддерживает идею ЦУР 12: использовать ресурсы осознанно и давать полезным вещам второй шанс. Это независимая инициатива школьного сообщества, не официальный проект NIS.",
                      "«Мұра» ТДМ 12 идеясын қолдайды: ресурстарды саналы пайдаланып, пайдалы заттарға екінші мүмкіндік беру. Бұл NIS-тің ресми жобасы емес, мектеп қауымдастығының тәуелсіз бастамасы.",
                      "Mura supports SDG 12: use resources thoughtfully and give useful things a second chance. An independent school community initiative, not an official NIS project.",
                    ),
                  )}
                </div>
              </div>
              <div className="container honest-stats">
                <div>
                  <b>{bookings.filter((b) => b.status === "done").length}</b>
                  <span>
                    {t("передач в деморежиме", "демо режимдегі берілім", "demo handovers")}
                  </span>
                </div>
                <div>
                  <b>{activeItems.length}</b>
                  <span>
                    {t("доступных демо-вещей", "қолжетімді демо-зат", "available demo items")}
                  </span>
                </div>
                <p>
                  {t(
                    "Реальную статистику покажем после подключения базы данных. Вес и CO₂ не рассчитываются без подтверждённой методики.",
                    "Нақты статистика деректер базасы қосылғаннан кейін көрсетіледі. Салмақ пен CO₂ расталған әдістемесіз есептелмейді.",
                    "Real statistics will appear once the database is connected. No weight or CO₂ estimates without a verified methodology.",
                  )}
                </p>
              </div>
            </section>
            <section className="container join-section">
              <div>
                <span className="eyebrow orange">
                  {t(
                    "ТВОЯ ИСТОРИЯ — ЧАСТЬ ОБЩЕЙ",
                    "СЕНІҢ ТАРИХЫҢ — ОРТАҚ ТАРИХТЫҢ БӨЛІГІ",
                    "YOUR STORY IS PART OF OURS",
                  )}
                </span>
                <h2>
                  {t(
                    "Давай передавать хорошее дальше.",
                    "Жақсылықты әрі қарай берейік.",
                    "Let’s pass good things on.",
                  )}
                </h2>
              </div>
              <button className="primary" onClick={onAdd}>
                {t("Присоединиться к «Мұра»", "«Мұраға» қосылу", "Join the Mura community")}
                <ArrowUpRight size={19} />
              </button>
            </section>
          </>
        ) : path === "/catalog" ? (
          <section className="container page">
            {sectionTitle(
              t(
                "ВТОРАЯ ЖИЗНЬ НАЧИНАЕТСЯ ЗДЕСЬ",
                "ЕКІНШІ ӨМІР ОСЫНДА БАСТАЛАДЫ",
                "SECOND LIVES START HERE",
              ),
              t("Каталог вещей", "Заттар каталогы", "The community catalog"),
              t(
                "Найди то, что пригодится тебе. Передай то, что пригодится другим.",
                "Өзіңе пайдалы затты тап. Басқаларға пайдалы затты бер.",
                "Find something you need. Pass on something someone else needs.",
              ),
            )}
            <div className="search-row">
              <div className="search-field">
                <Search size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(
                    "Поиск по названию и описанию",
                    "Атауы мен сипаттамасы бойынша іздеу",
                    "Search by name or description",
                  )}
                  aria-label={t("Поиск", "Іздеу", "Search")}
                />
                {query && (
                  <button className="icon-button" onClick={() => setQuery("")} aria-label="Clear">
                    <X size={17} />
                  </button>
                )}
              </div>
              <button className="primary" onClick={onAdd}>
                <Plus size={18} />
                {t("Добавить вещь", "Зат қосу", "Add item")}
              </button>
            </div>
            <div className="filter-row">
              <div className="catalog-tabs">
                {["all", "free", "exchange", "sale"].map((v) => (
                  <button
                    className={filter === v ? "active" : ""}
                    key={v}
                    onClick={() => setFilter(v)}
                  >
                    {v === "all" ? t("Все вещи", "Барлық заттар", "All items") : labelType(v)}
                  </button>
                ))}
              </div>
              <label>
                <SlidersHorizontal size={17} />
                <select
                  value={cat}
                  onChange={(e) => setCat(+e.target.value)}
                  aria-label={t("Категория", "Санат", "Category")}
                >
                  {categories.map((v, n) => (
                    <option value={n} key={n}>
                      {txt(v)}
                    </option>
                  ))}
                </select>
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label={t("Сортировка", "Сұрыптау", "Sort")}
              >
                <option value="new">
                  {t("Сначала новые", "Алдымен жаңалары", "Newest first")}
                </option>
                <option value="price">{t("По цене", "Баға бойынша", "Price: low to high")}</option>
              </select>
            </div>
            <div className="results-line">
              <span>
                {t("Найдено вещей:", "Табылған заттар:", "Items found:")} {filtered.length}
              </span>
              <span className="demo-caption">
                {t("Демонстрационные данные", "Демонстрациялық деректер", "Demonstration data")}
              </span>
            </div>
            <div className="product-grid catalog-grid">
              {filtered.map((i) => (
                <Card key={i.id} i={i} />
              ))}
            </div>
            {!filtered.length && (
              <div className="empty">
                <Search size={35} />
                <h3>{t("Пока ничего не найдено", "Әзірге ештеңе табылмады", "No items found")}</h3>
                <p>
                  {t(
                    "Попробуй другой запрос или убери фильтры.",
                    "Басқа сұрауды көр немесе сүзгілерді алып таста.",
                    "Try another search or clear your filters.",
                  )}
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    setQuery("");
                    setCat(0);
                    setFilter("all");
                  }}
                >
                  {t("Сбросить фильтры", "Сүзгілерді тазарту", "Reset filters")}
                </button>
              </div>
            )}
          </section>
        ) : path.startsWith("/item/") || path.startsWith("/passport/") ? (
          item ? (
            <section className="container page">
              <div className="breadcrumbs">
                <Link href="/catalog">{t("Каталог", "Каталог", "Catalog")}</Link>
                <ChevronRight size={14} />
                <span>
                  {path.startsWith("/passport")
                    ? t("QR-паспорт", "QR-паспорт", "QR passport")
                    : txt(categories[item.category])}
                </span>
              </div>
              <div className="detail-grid">
                <div className={"detail-photo " + item.id}>
                  <img src={item.image} alt={txt(item.title)} />
                  <span className="demo-pill">DEMO</span>
                </div>
                <div className="detail-info">
                  <span className="eyebrow orange">
                    {path.startsWith("/passport")
                      ? t(
                          "ЦИФРОВОЙ ПАСПОРТ ВЕЩИ",
                          "ЗАТТЫҢ ЦИФРЛЫҚ ПАСПОРТЫ",
                          "DIGITAL ITEM PASSPORT",
                        )
                      : txt(categories[item.category])}
                  </span>
                  <h1>{txt(item.title)}</h1>
                  <div className="detail-price">
                    {item.type === "sale"
                      ? item.price.toLocaleString("ru-RU") + " ₸"
                      : labelType(item.type)}
                  </div>
                  <div className="detail-meta">
                    <span>{txt(conditions[item.condition])}</span>
                    <span className="availability">
                      <i />
                      {status(item.status)}
                    </span>
                  </div>
                  <p className="description">{txt(item.description)}</p>
                  {path.startsWith("/passport") ? (
                    <>
                      <h3>{t("История вещи", "Зат тарихы", "The object’s story")}</h3>
                      <div className="timeline">
                        <div>
                          <i />
                          <span>12.10.2026</span>
                          <b>
                            {t(
                              "Добавлена в демокаталог",
                              "Демо-каталогқа қосылды",
                              "Added to demo catalog",
                            )}
                          </b>
                        </div>
                        {bookings
                          .filter((b) => b.itemId === item.id && b.status === "done")
                          .map((b) => (
                            <div key={b.id}>
                              <i />
                              <span>{b.date}</span>
                              <b>
                                {t(
                                  "Демонстрационная передача завершена",
                                  "Демонстрациялық берілім аяқталды",
                                  "Demo handover completed",
                                )}
                              </b>
                            </div>
                          ))}
                      </div>
                      <p className="muted">
                        {t(
                          "Это пример паспорта. Реальная история будет создаваться только после подтверждённых передач в базе данных.",
                          "Бұл паспорт үлгісі. Нақты тарих тек деректер базасында расталған берілімдерден кейін жасалады.",
                          "This is a sample passport. Real history will be created only from confirmed transfers in the database.",
                        )}
                      </p>
                      <button
                        className="secondary"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            setToast(t("Ссылка скопирована", "Сілтеме көшірілді", "Link copied"));
                          } catch {
                            setToast(
                              t(
                                "Скопируйте адрес из строки браузера",
                                "Мекенжайды браузер жолынан көшіріңіз",
                                "Copy the address from your browser",
                              ),
                            );
                          }
                        }}
                      >
                        <Copy size={17} />
                        {t("Поделиться паспортом", "Паспортпен бөлісу", "Share passport")}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="owner">
                        <span className="avatar">{item.owner[0]}</span>
                        <div>
                          <b>{item.owner}</b>
                          <p>
                            {t("Демо-школа", "Демо-мектеп", "Demo school")} · {item.grade}
                          </p>
                        </div>
                        <ShieldCheck size={22} />
                      </div>
                      <div className="detail-buttons">
                        <button
                          disabled={item.status !== "available" && !item.mine}
                          className="primary"
                          onClick={() =>
                            item.mine
                              ? (setPreview(item.image), navigate("/edit/" + item.id))
                              : needAccount(() => {
                                  setBookingDate("");
                                  setReserve(item);
                                })
                          }
                        >
                          {item.mine
                            ? t("Редактировать", "Өңдеу", "Edit listing")
                            : item.status !== "available"
                              ? t("Недоступна", "Қолжетімсіз", "Unavailable")
                              : item.type === "exchange"
                                ? t("Предложить обмен", "Айырбас ұсыну", "Propose an exchange")
                                : t("Забронировать", "Брондау", "Request this item")}
                          <ArrowRight size={18} />
                        </button>
                        <button
                          className={"secondary " + (saved.includes(item.id) ? "is-saved" : "")}
                          onClick={() => toggleSaved(item.id)}
                          aria-label={t("Сохранить", "Сақтау", "Save")}
                        >
                          <Heart size={20} />
                        </button>
                      </div>
                      <div className="safe-note">
                        <ShieldCheck size={16} />
                        {t(
                          "Договаривайтесь о встрече только в разрешённых местах школы. Оплата на сайте не принимается.",
                          "Тек мектептің рұқсат етілген орындарында кездесуді келісіңіз. Сайт төлем қабылдамайды.",
                          "Arrange meetings only in approved school areas. No payments are taken on this website.",
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="passport-box">
                <div className="qr-wrap">
                  <QRCodeSVG value={window.location.origin + "/passport/" + item.id} size={100} />
                </div>
                <div>
                  <span className="eyebrow orange">
                    {t("ИСТОРИЯ ПРОДОЛЖАЕТСЯ", "ТАРИХ ЖАЛҒАСАДЫ", "THE STORY CONTINUES")}
                  </span>
                  <h3>
                    {t(
                      "Одна вещь — один QR-паспорт",
                      "Бір зат — бір QR-паспорт",
                      "One object. One QR passport.",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Этот код ведёт на страницу паспорта вещи.",
                      "Бұл код зат паспортының бетіне апарады.",
                      "This code opens the object’s passport page.",
                    )}
                  </p>
                </div>
                <Link className="secondary" href={"/passport/" + item.id}>
                  {t("Открыть паспорт", "Паспортты ашу", "Open passport")}
                  <ArrowUpRight size={17} />
                </Link>
              </div>
              <div className="notice">
                <Leaf size={20} />
                {t(
                  "Экологический эффект не рассчитывается: подтверждённая методика пока не подключена.",
                  "Экологиялық әсер есептелмейді: расталған әдістеме әлі қосылмаған.",
                  "Environmental impact is not calculated: no verified methodology is connected yet.",
                )}
              </div>
            </section>
          ) : (
            <section className="container page empty">
              <h1>{t("Вещь не найдена", "Зат табылмады", "Item not found")}</h1>
              <Link href="/catalog" className="primary">
                {t("Вернуться в каталог", "Каталогқа оралу", "Back to catalog")}
              </Link>
            </section>
          )
        ) : path === "/profile" ? (
          <Profile />
        ) : path === "/add" || path.startsWith("/edit/") ? (
          <section className="container page form-page">
            {sectionTitle(
              t("НАЧНИ НОВУЮ ИСТОРИЮ", "ЖАҢА ТАРИХТЫ БАСТА", "START A NEW CHAPTER"),
              path.startsWith("/edit")
                ? t("Редактировать вещь", "Затты өңдеу", "Edit your item")
                : t("Передать вещь", "Зат беру", "Pass something on"),
              t(
                "Публикация будет отправлена на демонстрационную проверку.",
                "Жарияланым демонстрациялық тексеруге жіберіледі.",
                "Your listing will be sent for demo review.",
              ),
            )}
            {!account ? (
              <div className="empty">
                <button className="primary" onClick={() => setAuth(true)}>
                  {t("Войдите для публикации", "Жариялау үшін кіріңіз", "Sign in to publish")}
                </button>
              </div>
            ) : (
              <form
                key={path}
                className={
                  "publish-form " +
                  (path.startsWith("/edit") && item?.type === "sale" ? "selling" : "")
                }
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const name = String(f.get("title")).trim();
                  const description = String(f.get("description")).trim();
                  const type = f.get("type") as Item["type"];
                  if (!preview) {
                    setToast(t("Добавьте фотографию", "Фото қосыңыз", "Add a photograph"));
                    return;
                  }
                  const updated: Item = {
                    id: path.startsWith("/edit/") && item ? item.id : crypto.randomUUID(),
                    title: [name, name, name],
                    description: [description, description, description],
                    image: preview,
                    category: Number(f.get("category")),
                    condition: Number(f.get("condition")),
                    type,
                    price: type === "sale" ? Number(f.get("price")) : 0,
                    owner: account.name,
                    grade: account.grade,
                    status: "pending",
                    mine: true,
                  };
                  setItems((old) =>
                    old.some((x) => x.id === updated.id)
                      ? old.map((x) => (x.id === updated.id ? updated : x))
                      : [updated, ...old],
                  );
                  setPreview("");
                  setProfileTab("items");
                  navigate("/profile");
                  setToast(
                    t(
                      "Объявление отправлено на демо-проверку",
                      "Хабарландыру демо-тексеруге жіберілді",
                      "Listing sent for demo review",
                    ),
                  );
                }}
              >
                <label className="upload-box">
                  {preview ? (
                    <img src={preview} alt={t("Предпросмотр", "Алдын ала қарау", "Preview")} />
                  ) : (
                    <Upload size={30} />
                  )}
                  <b>{t("Добавить фотографию", "Фото қосу", "Add a photograph")}</b>
                  <span>JPG / PNG / WEBP · {t("до 3 МБ", "3 МБ дейін", "up to 3 MB")}</span>
                  <input
                    aria-label={t("Добавить фото", "Фото қосу", "Add photo")}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (
                        f.size > 3 * 1024 * 1024 ||
                        !["image/jpeg", "image/png", "image/webp"].includes(f.type)
                      ) {
                        setToast(
                          t(
                            "Допустимы JPG, PNG, WEBP до 3 МБ",
                            "JPG, PNG, WEBP, 3 МБ дейін рұқсат",
                            "Use JPG, PNG or WEBP under 3 MB",
                          ),
                        );
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setPreview(String(reader.result));
                      reader.readAsDataURL(f);
                    }}
                  />
                </label>
                <label>
                  {t("Название вещи", "Зат атауы", "Item name")}
                  <input
                    aria-label={t("Название вещи", "Зат атауы", "Item name")}
                    required
                    name="title"
                    maxLength={100}
                    defaultValue={path.startsWith("/edit") && item ? txt(item.title) : ""}
                    placeholder={t(
                      "Например, учебник по математике",
                      "Мысалы, математика оқулығы",
                      "For example, a mathematics textbook",
                    )}
                  />
                </label>
                <div className="form-two">
                  <label>
                    {t("Категория", "Санат", "Category")}
                    <select name="category" defaultValue={item?.category || 1}>
                      {categories.slice(1).map((c, n) => (
                        <option key={n} value={n + 1}>
                          {txt(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t("Состояние", "Күйі", "Condition")}
                    <select name="condition" defaultValue={item?.condition || 1}>
                      {conditions.map((c, n) => (
                        <option key={n} value={n}>
                          {txt(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <fieldset>
                  <legend>
                    {t(
                      "Как хочешь передать?",
                      "Қалай бергің келеді?",
                      "How would you like to share it?",
                    )}
                  </legend>
                  <div className="type-options">
                    {["free", "exchange", "sale"].map((v) => (
                      <label key={v}>
                        <input
                          aria-label={"Input"}
                          type="radio"
                          name="type"
                          value={v}
                          defaultChecked={v === (item?.type || "free")}
                          onChange={(e) =>
                            e.currentTarget
                              .closest("form")
                              ?.classList.toggle("selling", v === "sale")
                          }
                        />
                        <span>{labelType(v)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="price-field">
                  {t(
                    "Цена, ₸ (только для продажи)",
                    "Бағасы, ₸ (тек сату үшін)",
                    "Price, ₸ (sales only)",
                  )}
                  <input
                    aria-label={t("Цена", "Бағасы", "Price")}
                    type="number"
                    name="price"
                    min="1"
                    defaultValue={item?.price || 3000}
                  />
                </label>
                <label>
                  {t(
                    "Описание и условия обмена",
                    "Сипаттама және айырбас шарттары",
                    "Description and exchange terms",
                  )}
                  <textarea
                    aria-label={t("Описание", "Сипаттама", "Description")}
                    name="description"
                    required
                    maxLength={1500}
                    rows={5}
                    defaultValue={path.startsWith("/edit") && item ? txt(item.description) : ""}
                    placeholder={t(
                      "Расскажи о состоянии вещи и что входит в комплект.",
                      "Заттың күйі мен жиынтығы туралы айт.",
                      "Describe its condition and what is included.",
                    )}
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    aria-label={t("Согласие с правилами", "Ережелермен келісу", "Agree to rules")}
                    type="checkbox"
                    required
                  />
                  {t(
                    "Я не публикую личные контакты и согласен с правилами безопасной передачи в школе.",
                    "Жеке байланыстарды жарияламаймын және мектепте қауіпсіз беру ережелерімен келісемін.",
                    "I will not publish personal contact information and agree to safe handover rules.",
                  )}
                </label>
                <div className="notice">
                  {t(
                    "Демо: данные хранятся только в этом браузере. Не загружайте личные или конфиденциальные материалы.",
                    "Демо: деректер тек осы браузерде сақталады. Жеке немесе құпия материалдарды жүктемеңіз.",
                    "Demo: data is stored in this browser only. Do not upload private or confidential material.",
                  )}
                </div>
                <button className="primary" type="submit">
                  {t("Отправить на проверку", "Тексеруге жіберу", "Submit for review")}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </section>
        ) : (
          <section className="container page empty">
            <h1>404</h1>
            <Link href="/">{t("На главную", "Басты бетке", "Go home")}</Link>
          </section>
        )}
      </main>
      <footer>
        <div className="container footer-main">
          <div>
            <Brand />
            <p>
              {t(
                "Передаём вещи. Сохраняем истории.\nСоздаём будущее вместе.",
                "Заттарды береміз. Тарихты сақтаймыз.\nБолашақты бірге жасаймыз.",
                "Passing things on. Preserving stories.\nBuilding the future together.",
              )}
            </p>
          </div>
          <div>
            <h4>{t("Платформа", "Платформа", "Platform")}</h4>
            <Link href="/catalog">{t("Каталог вещей", "Заттар каталогы", "Item catalog")}</Link>
            <button onClick={onAdd}>{t("Добавить вещь", "Зат қосу", "Add an item")}</button>
            <button onClick={() => (account ? navigate("/profile") : setAuth(true))}>
              {t("Личный кабинет", "Жеке кабинет", "Your profile")}
            </button>
          </div>
          <div>
            <h4>{t("О сообществе", "Қауымдастық туралы", "Our community")}</h4>
            <button onClick={goHow}>
              {t("Как это работает", "Қалай жұмыс істейді", "How it works")}
            </button>
            <button onClick={goAbout}>{t("Миссия проекта", "Жоба миссиясы", "Our mission")}</button>
            <Link href="/passport/dombra">
              {t("QR-паспорт вещи", "Заттың QR-паспорты", "Item QR passport")}
            </Link>
          </div>
          <div className="footer-mission">
            <Leaf size={24} />
            <b>
              {t(
                "Маленькие действия.\nБольшие перемены.",
                "Кішкентай қадамдар.\nҮлкен өзгерістер.",
                "Small actions.\nMeaningful change.",
              )}
            </b>
            <span>
              SDG 12 · {t("Ответственное потребление", "Жауапты тұтыну", "Responsible consumption")}
            </span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © 2026 Мұра.{" "}
            {t(
              "Независимый школьный проект.",
              "Тәуелсіз мектеп жобасы.",
              "An independent school project.",
            )}
          </span>
          <span>
            {t(
              "Демонстрационная версия · Без реальных сделок",
              "Демонстрациялық нұсқа · Нақты мәмілелерсіз",
              "Demo version · No real transactions",
            )}
          </span>
        </div>
      </footer>
      <nav className="bottom-nav">
        <Link href="/catalog" className={path === "/catalog" ? "active" : ""}>
          <BookOpen size={20} />
          {t("Каталог", "Каталог", "Catalog")}
        </Link>
        <button onClick={onAdd}>
          <span className="bottom-plus">
            <Plus size={23} />
          </span>
          {t("Добавить", "Қосу", "Add")}
        </button>
        <button
          className={path === "/profile" ? "active" : ""}
          onClick={() => (account ? navigate("/profile") : setAuth(true))}
        >
          <User size={20} />
          {t("Профиль", "Профиль", "Profile")}
        </button>
      </nav>
      {auth && (
        <DemoDialog onClose={() => setAuth(false)}>
          <section className="modal auth-modal" aria-labelledby="auth-title">
            <button
              className="modal-close icon-button"
              onClick={() => setAuth(false)}
              aria-label={t("Закрыть", "Жабу", "Close")}
            >
              <X />
            </button>
            <span className="brand-icon">
              <BookOpen size={29} />
            </span>
            <span className="eyebrow orange">
              {t("ТВОЁ ШКОЛЬНОЕ СООБЩЕСТВО", "СЕНІҢ МЕКТЕП ҚАУЫМДАСТЫҒЫҢ", "YOUR SCHOOL COMMUNITY")}
            </span>
            <h2 id="auth-title">
              {register
                ? t("Присоединяйся к «Мұра»", "«Мұраға» қосыл", "Join Mura")
                : t("С возвращением", "Қайта қош келдің", "Welcome back")}
            </h2>
            <div className="notice">
              {t(
                "Демо-вход: пароль не сохраняется и не проверяется сервером. Используйте вымышленные данные.",
                "Демо-кіру: құпиясөз сақталмайды және серверде тексерілмейді. Ойдан шығарылған деректерді қолданыңыз.",
                "Demo sign-in: passwords are not stored or checked by a server. Use fictional information.",
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setAccount({
                  name: register ? String(f.get("name")) : String(f.get("email")).split("@")[0],
                  grade: register ? String(f.get("grade")) : "10 A",
                });
                setAuth(false);
                setToast(t("Демопрофиль открыт", "Демо-профиль ашылды", "Demo profile opened"));
                navigate("/profile");
              }}
            >
              {register && (
                <>
                  <label>
                    {t("Имя", "Аты", "Name")}
                    <input
                      aria-label={t("Имя", "Аты", "Name")}
                      required
                      name="name"
                      maxLength={40}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    {t("Школа (демо)", "Мектеп (демо)", "School (demo)")}
                    <input
                      aria-label={t("Школа", "Мектеп", "School")}
                      value={t(
                        "Демонстрационная школа",
                        "Демонстрациялық мектеп",
                        "Demonstration school",
                      )}
                      readOnly
                    />
                  </label>
                  <label>
                    {t("Класс", "Сынып", "Class")}
                    <input
                      aria-label={t("Класс", "Сынып", "Class")}
                      required
                      name="grade"
                      placeholder="10 A"
                      maxLength={8}
                    />
                  </label>
                </>
              )}
              <label>
                Email
                <input
                  aria-label={"Email"}
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  required
                  autoComplete="off"
                />
              </label>
              <label>
                {t("Пароль", "Құпиясөз", "Password")}
                <input
                  aria-label={t("Пароль", "Құпиясөз", "Password")}
                  type="password"
                  name="password"
                  minLength={6}
                  placeholder={t("Минимум 6 символов", "Кемінде 6 таңба", "At least 6 characters")}
                  required
                  autoComplete="off"
                />
              </label>
              <button className="primary full" type="submit">
                {register
                  ? t("Создать демопрофиль", "Демо-профиль жасау", "Create demo profile")
                  : t("Войти в демопрофиль", "Демо-профильге кіру", "Enter demo profile")}
                <ArrowRight size={17} />
              </button>
            </form>
            <p className="auth-switch">
              {register
                ? t("Уже есть аккаунт?", "Тіркелгің бар ма?", "Already have an account?")
                : t("Впервые здесь?", "Алғаш рет осындасың ба?", "New here?")}{" "}
              <button onClick={() => setRegister(!register)}>
                {register
                  ? t("Войти", "Кіру", "Sign in")
                  : t("Зарегистрироваться", "Тіркелу", "Register")}
              </button>
            </p>
          </section>
        </DemoDialog>
      )}
      {reserve && (
        <DemoDialog onClose={() => setReserve(null)}>
          <section className="modal" aria-labelledby="reserve-title">
            <button
              className="modal-close icon-button"
              onClick={() => setReserve(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <span className="eyebrow orange">
              {t("ДЕМОНСТРАЦИЯ БРОНИРОВАНИЯ", "БРОНДАУ ДЕМОНСТРАЦИЯСЫ", "BOOKING DEMONSTRATION")}
            </span>
            <h2 id="reserve-title">{txt(reserve.title)}</h2>
            <p>
              {t(
                "Выберите время и безопасное место передачи. Это пример, а не реальные слоты владельца.",
                "Уақыт пен қауіпсіз беру орнын таңдаңыз. Бұл иесінің нақты уақыттары емес, үлгі.",
                "Choose a time and a safe meeting place. These are examples, not the owner’s actual slots.",
              )}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  items.find((i) => i.id === reserve.id)?.status !== "available" ||
                  bookings.some(
                    (b) => b.itemId === reserve.id && ["pending", "confirmed"].includes(b.status),
                  )
                ) {
                  setToast(
                    t(
                      "Для этой вещи уже есть активный запрос",
                      "Бұл затқа белсенді сұрау бар",
                      "This item already has an active request",
                    ),
                  );
                  return;
                }
                const f = new FormData(e.currentTarget);
                setBookings((old) => [
                  {
                    id: crypto.randomUUID(),
                    itemId: reserve.id,
                    status: "pending",
                    date: bookingDate,
                    place: Number(f.get("place")),
                  },
                  ...old,
                ]);
                setReserve(null);
                setProfileTab("bookings");
                navigate("/profile");
                setToast(
                  t(
                    "Демо-запрос создан. Владелец не получит реальное сообщение.",
                    "Демо-сұрау жасалды. Иесіне нақты хабар жіберілмейді.",
                    "Demo request created. No real message is sent to an owner.",
                  ),
                );
              }}
            >
              <label>
                {t("Дата и время (пример)", "Күні мен уақыты (үлгі)", "Date and time (example)")}
                <input
                  aria-label={t("Дата встречи", "Кездесу күні", "Meeting date")}
                  required
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </label>
              <label>
                {t("Место передачи", "Беру орны", "Meeting place")}
                <select name="place">
                  <option value="0">{t("Библиотека", "Кітапхана", "Library")}</option>
                  <option value="1">
                    {t("Стойка администрации", "Әкімшілік орны", "Administration desk")}
                  </option>
                </select>
              </label>
              {reserve.type === "exchange" && (
                <label>
                  {t(
                    "Что предложите на обмен?",
                    "Айырбасқа не ұсынасыз?",
                    "What would you offer in exchange?",
                  )}
                  <textarea
                    aria-label={t("Предложение обмена", "Айырбас ұсынысы", "Exchange proposal")}
                    required
                    rows={3}
                    maxLength={500}
                  />
                </label>
              )}
              <button className="primary full" type="submit">
                {t("Создать демо-запрос", "Демо-сұрау жасау", "Create demo request")}
                <ArrowRight size={18} />
              </button>
            </form>
          </section>
        </DemoDialog>
      )}
      {toast && (
        <output className="toast">
          <Check size={20} />
          <span>{toast}</span>
          <button className="icon-button" onClick={() => setToast("")} aria-label="Close">
            <X size={16} />
          </button>
        </output>
      )}
    </>
  );
}
