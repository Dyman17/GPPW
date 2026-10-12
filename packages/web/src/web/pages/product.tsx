import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  Search,
  Heart,
  MessageCircle,
  User,
  Plus,
  Sun,
  Moon,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  X,
  Loader2,
  Package,
  CalendarDays,
  SlidersHorizontal,
  LogOut,
  Check,
  QrCode,
  Upload,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { categories, conditions, stored, type Lang } from "../lib/demo";
import { authClient } from "../lib/auth";
import { translator, localized, imageData, type Listing } from "../lib/product";
import {
  useCatalog,
  useItem,
  useMine,
  useProfile,
  useSaved,
  useBookings,
  useChats,
  useModeration,
  useActions,
} from "../queries/market";
import { ProductAuth } from "../components/product-auth";
import { ProductChats } from "../components/product-chats";
import { DemoDialog } from "../components/demo-dialog";
export default function Product() {
  const [path, navigate] = useLocation();
  const [lang, setLang] = useState<Lang>(() => stored("mura-lang", "ru"));
  const [dark, setDark] = useState(() => stored("mura-dark", false));
  const t = translator(lang);
  const loc = (v: [string, string, string]) => localized(v, t);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const logged = !!session;
  const userId = session?.user.id || "";
  const catalog = useCatalog();
  const mine = useMine(logged);
  const profile = useProfile(logged);
  const saved = useSaved(logged);
  const bookings = useBookings(logged);
  const inbox = useChats(logged);
  const moderator =
    profile.data?.profile?.role === "moderator" || profile.data?.profile?.role === "admin";
  const moderation = useModeration(logged && moderator);
  const actions = useActions();
  const qc = useQueryClient();
  const [auth, setAuth] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(0);
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("new");
  const [toast, setToast] = useState("");
  const [profileTab, setProfileTab] = useState("items");
  const [photo, setPhoto] = useState("");
  const [offer, setOffer] = useState("free");
  const [formError, setFormError] = useState("");
  const [reserve, setReserve] = useState<Listing | null>(null);
  const itemId =
    path.startsWith("/item/") || path.startsWith("/passport/") ? path.split("/")[2] : "";
  const detail = useItem(itemId);
  const editItem = mine.data?.find((i) => i.id === path.split("/")[2]);
  const isCatalog = path === "/" || path === "/catalog";
  const savedIds = new Set(saved.data?.map((i) => i.id) || []);
  const unread = inbox.data?.reduce((n, c) => n + c.unread, 0) || 0;
  useEffect(() => {
    document.documentElement.lang = lang === "kz" ? "kk" : lang;
    localStorage.setItem("mura-lang", JSON.stringify(lang));
  }, [lang]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("mura-dark", JSON.stringify(dark));
  }, [dark]);
  useEffect(() => {
    window.scrollTo(0, 0);
    setFormError("");
    if (path === "/add") {
      setPhoto("");
      setOffer("free");
    }
  }, [path]);
  useEffect(() => {
    if (editItem) {
      setPhoto(editItem.image);
      setOffer(editItem.type);
    }
  }, [editItem]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(id);
  }, [toast]);
  const need = (action: () => void) => (logged ? action() : setAuth(true));
  const add = () => need(() => navigate("/add"));
  const formatType = (v: string) =>
    v === "sale"
      ? t("Продажа", "Сату", "For sale")
      : v === "exchange"
        ? t("Обмен", "Айырбас", "Exchange")
        : t("Даром", "Тегін", "Free");
  const status = (v: string) =>
    v === "available"
      ? t("Доступна", "Қолжетімді", "Available")
      : v === "pending"
        ? t("На проверке", "Тексерілуде", "Under review")
        : v === "reserved"
          ? t("Забронирована", "Брондалған", "Reserved")
          : v === "transferred"
            ? t("Передана", "Берілді", "Transferred")
            : t("Снята", "Алынды", "Withdrawn");
  const money = (i: Listing) =>
    i.type === "sale" ? i.price.toLocaleString() + " ₸" : formatType(i.type);
  const notifyError = () =>
    setToast(
      t(
        "Не удалось выполнить действие. Попробуйте снова.",
        "Әрекет орындалмады. Қайталап көріңіз.",
        "Action failed. Please try again.",
      ),
    );
  const startChat = (i: Listing) =>
    need(async () => {
      try {
        const result = await actions.openChat.mutateAsync({ itemId: i.id });
        navigate("/chats/" + encodeURIComponent(result.id));
      } catch {
        notifyError();
      }
    });
  const toggleSave = (i: Listing) =>
    need(async () => {
      try {
        await actions.save.mutateAsync({ id: i.id, saved: !savedIds.has(i.id) });
      } catch {
        notifyError();
      }
    });
  const Card = ({ i }: { i: Listing }) => (
    <article className="item-card">
      <div className={"item-photo " + i.id}>
        <Link href={"/item/" + i.id}>
          <img src={i.image} alt={loc(i.title)} loading="lazy" />
        </Link>
        <span className={"type-label " + i.type}>{formatType(i.type)}</span>
        <button
          className={"favorite " + (savedIds.has(i.id) ? "is-saved" : "")}
          aria-label={t("Сохранить вещь", "Затты сақтау", "Save item")}
          disabled={actions.save.isPending}
          onClick={() => toggleSave(i)}
        >
          <Heart size={18} fill={savedIds.has(i.id) ? "currentColor" : "none"} />
        </button>
        {i.demo && <span className="card-demo">DEMO</span>}
      </div>
      <div className="item-info">
        <span className="eyebrow">{loc(categories[i.category])}</span>
        <Link href={"/item/" + i.id}>
          <h3>{loc(i.title)}</h3>
        </Link>
        <div className="item-price">{money(i)}</div>
        <div className="item-bottom">
          <span>
            {loc(conditions[i.condition])} · {i.grade}
          </span>
          <span className="availability">
            <i />
            {status(i.status)}
          </span>
        </div>
      </div>
    </article>
  );
  const Loader = () => (
    <div className="empty">
      <Loader2 className="spinner" size={28} />
      {t("Загрузка…", "Жүктелуде…", "Loading…")}
    </div>
  );
  const Empty = ({ title, description }: { title: string; description?: string }) => (
    <div className="empty">
      <Package size={32} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
  const Gate = () =>
    sessionPending ? (
      <Loader />
    ) : (
      <div className="empty">
        <User size={33} />
        <h3>{t("Войдите в аккаунт", "Тіркелгіге кіріңіз", "Sign in to your account")}</h3>
        <button className="primary" onClick={() => setAuth(true)}>
          {t("Войти", "Кіру", "Sign in")}
        </button>
      </div>
    );
  const visible = (catalog.data || [])
    .filter(
      (i) =>
        (!category || i.category === category) &&
        (type === "all" || i.type === type) &&
        (loc(i.title) + " " + loc(i.description)).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (sort === "price" ? a.price - b.price : b.createdAt - a.createdAt));
  const brand = (
    <Link className="brand" href="/">
      <span className="brand-icon">
        <BookOpen size={29} strokeWidth={1.7} />
      </span>
      <span>Мұра</span>
    </Link>
  );
  return (
    <div className="product-app">
      <header className="product-header">
        <div className="container header-inner">
          {brand}
          <div className="header-search">
            <Search size={18} />
            <input
              aria-label={t("Поиск вещей", "Заттарды іздеу", "Search items")}
              placeholder={t(
                "Найти нужную вещь…",
                "Қажетті затты табу…",
                "Find something you need…",
              )}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isCatalog) navigate("/");
              }}
            />
            {query && (
              <button
                className="icon-button"
                onClick={() => setQuery("")}
                aria-label={t("Очистить", "Тазарту", "Clear")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="header-actions">
            <div className="languages">
              {(["kz", "ru", "en"] as Lang[]).map((l) => (
                <button className={lang === l ? "active" : ""} key={l} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="icon-button"
              aria-label={t("Переключить тему", "Тақырыпты ауыстыру", "Toggle theme")}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link
              href="/saved"
              className={"icon-button header-extra " + (path === "/saved" ? "active" : "")}
              aria-label={t("Избранное", "Таңдаулылар", "Saved")}
            >
              <Heart size={20} />
            </Link>
            <Link
              href="/chats"
              className={
                "icon-button header-extra unread-control " +
                (path.startsWith("/chats") ? "active" : "")
              }
              aria-label={t("Чаты", "Чаттар", "Chats")}
            >
              <MessageCircle size={20} />
              {unread > 0 && <i>{unread}</i>}
            </Link>
            <button className="account-button" onClick={() => need(() => navigate("/profile"))}>
              {logged ? (
                <span className="avatar">{session.user.name[0]}</span>
              ) : (
                <>
                  <User size={17} />
                  <span>{t("Войти", "Кіру", "Sign in")}</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="product-nav container">
          <nav>
            <Link href="/" className={isCatalog ? "active" : ""}>
              {t("Каталог", "Каталог", "Catalog")}
            </Link>
            <Link href="/saved" className={path === "/saved" ? "active" : ""}>
              {t("Избранное", "Таңдаулылар", "Saved")}
              {saved.data?.length ? <span>{saved.data.length}</span> : null}
            </Link>
            <Link href="/chats" className={path.startsWith("/chats") ? "active" : ""}>
              {t("Сообщения", "Хабарламалар", "Messages")}
              {unread > 0 && <span>{unread}</span>}
            </Link>
            <Link href="/bookings" className={path === "/bookings" ? "active" : ""}>
              {t("Бронирования", "Брондаулар", "Bookings")}
            </Link>
          </nav>
          <button className="primary" onClick={add}>
            <Plus size={17} />
            {t("Добавить вещь", "Зат қосу", "Add item")}
          </button>
        </div>
      </header>
      <main className="product-main container">
        {isCatalog ? (
          <>
            <div className="catalog-page-head">
              <div>
                <span className="eyebrow orange">
                  {t(
                    "ВЕЩИ ШКОЛЬНОГО СООБЩЕСТВА",
                    "МЕКТЕП ҚАУЫМДАСТЫҒЫНЫҢ ЗАТТАРЫ",
                    "SCHOOL COMMUNITY ITEMS",
                  )}
                </span>
                <h1>
                  {t("Каталог", "Каталог", "Catalog")}
                  <span>{visible.length}</span>
                </h1>
              </div>
              <div className="catalog-total">
                <span className="availability">
                  <i />
                  {t("Доступные вещи", "Қолжетімді заттар", "Available items")}
                </span>
              </div>
            </div>
            <div className="mobile-catalog-search search-field">
              <Search size={18} />
              <input
                aria-label={t("Поиск", "Іздеу", "Search")}
                placeholder={t("Найти вещь…", "Затты табу…", "Search items…")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="product-catalog-layout">
              <aside className="category-sidebar">
                <h3>{t("Категории", "Санаттар", "Categories")}</h3>
                {categories.map((c, n) => (
                  <button
                    key={n}
                    className={category === n ? "active" : ""}
                    onClick={() => setCategory(n)}
                  >
                    <span>
                      {n === 0 ? <SlidersHorizontal size={16} /> : <BookOpen size={16} />}
                    </span>
                    {loc(c)}
                    <small>
                      {(catalog.data || []).filter((i) => !n || i.category === n).length}
                    </small>
                  </button>
                ))}
              </aside>
              <section className="catalog-content">
                <div className="product-filter-bar">
                  <div className="catalog-tabs">
                    {["all", "sale", "exchange", "free"].map((v) => (
                      <button
                        key={v}
                        className={type === v ? "active" : ""}
                        onClick={() => setType(v)}
                      >
                        {v === "all" ? t("Все вещи", "Барлық заттар", "All items") : formatType(v)}
                      </button>
                    ))}
                  </div>
                  <select
                    aria-label={t("Сортировка", "Сұрыптау", "Sort")}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="new">
                      {t("Сначала новые", "Алдымен жаңалары", "Newest first")}
                    </option>
                    <option value="price">
                      {t("По цене", "Баға бойынша", "Price: low to high")}
                    </option>
                  </select>
                </div>
                <select
                  className="mobile-category-select"
                  aria-label={t("Категория", "Санат", "Category")}
                  value={category}
                  onChange={(e) => setCategory(+e.target.value)}
                >
                  {categories.map((c, n) => (
                    <option key={n} value={n}>
                      {loc(c)}
                    </option>
                  ))}
                </select>
                <div className="catalog-results">
                  <span>
                    {category
                      ? loc(categories[category])
                      : t("Все категории", "Барлық санаттар", "All categories")}
                  </span>
                  {catalog.data?.some((i) => i.demo) && (
                    <span>
                      {t(
                        "Примеры отмечены DEMO",
                        "Үлгілер DEMO деп белгіленген",
                        "Sample items marked DEMO",
                      )}
                    </span>
                  )}
                </div>
                {catalog.isLoading ? (
                  <Loader />
                ) : catalog.isError ? (
                  <div className="empty">
                    <p>
                      {t("Каталог не загрузился", "Каталог жүктелмеді", "Catalog could not load")}
                    </p>
                    <button className="secondary" onClick={() => catalog.refetch()}>
                      {t("Повторить", "Қайталау", "Retry")}
                    </button>
                  </div>
                ) : visible.length ? (
                  <div className="product-grid">
                    {visible.map((i) => (
                      <Card key={i.id} i={i} />
                    ))}
                  </div>
                ) : (
                  <>
                    <Empty
                      title={t("Ничего не найдено", "Ештеңе табылмады", "No items found")}
                      description={t(
                        "Измените запрос или сбросьте фильтры.",
                        "Іздеу сұрауын өзгертіңіз немесе сүзгілерді тазалаңыз.",
                        "Change your search or clear the filters.",
                      )}
                    />
                    <button
                      className="secondary"
                      onClick={() => {
                        setQuery("");
                        setCategory(0);
                        setType("all");
                      }}
                    >
                      {t("Сбросить фильтры", "Сүзгілерді тазарту", "Reset filters")}
                    </button>
                  </>
                )}
              </section>
            </div>
          </>
        ) : path === "/saved" ? (
          <>
            <div className="functional-title">
              <Heart size={23} />
              <h1>{t("Избранное", "Таңдаулылар", "Saved items")}</h1>
            </div>
            {!logged ? (
              <Gate />
            ) : saved.isLoading ? (
              <Loader />
            ) : saved.isError ? (
              <Empty
                title={t(
                  "Не удалось загрузить избранное",
                  "Таңдаулылар жүктелмеді",
                  "Could not load saved items",
                )}
              />
            ) : saved.data?.length ? (
              <div className="product-grid standalone-grid">
                {saved.data.map((i) => (
                  <Card key={i.id} i={i} />
                ))}
              </div>
            ) : (
              <Empty
                title={t(
                  "Пока нет сохранённых вещей",
                  "Әзірге сақталған зат жоқ",
                  "No saved items yet",
                )}
              />
            )}
          </>
        ) : path.startsWith("/chats") ? (
          !logged ? (
            <Gate />
          ) : (
            <ProductChats userId={userId} t={t} />
          )
        ) : path === "/bookings" ? (
          <>
            <div className="functional-title">
              <CalendarDays size={23} />
              <h1>{t("Бронирования", "Брондаулар", "Bookings")}</h1>
            </div>
            {!logged ? (
              <Gate />
            ) : bookings.isLoading ? (
              <Loader />
            ) : bookings.isError ? (
              <Empty
                title={t(
                  "Не удалось загрузить бронирования",
                  "Брондаулар жүктелмеді",
                  "Could not load bookings",
                )}
              />
            ) : !bookings.data?.length ? (
              <Empty title={t("Пока нет бронирований", "Әзірге брондау жоқ", "No bookings yet")} />
            ) : (
              bookings.data.map(({ booking: b, item: i }) => (
                <div className="booking-card" key={b.id}>
                  <img src={i.image} alt="" />
                  <div>
                    <Link href={"/item/" + i.id}>
                      <h3>{loc(i.title)}</h3>
                    </Link>
                    <p>
                      {new Date(b.date).toLocaleString()} ·{" "}
                      {b.place === "library"
                        ? t("Библиотека", "Кітапхана", "Library")
                        : t("Администрация", "Әкімшілік", "Administration desk")}
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
                    {b.status === "pending" && b.sellerId === userId && (
                      <button
                        className="primary"
                        disabled={actions.booking.isPending}
                        onClick={async () => {
                          try {
                            await actions.booking.mutateAsync({ id: b.id, action: "accept" });
                          } catch {
                            notifyError();
                          }
                        }}
                      >
                        {t("Подтвердить запрос", "Сұрауды растау", "Accept request")}
                      </button>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        className="primary"
                        disabled={
                          actions.booking.isPending ||
                          (b.buyerId === userId ? b.buyerConfirmed : b.sellerConfirmed)
                        }
                        onClick={async () => {
                          try {
                            await actions.booking.mutateAsync({ id: b.id, action: "confirm" });
                            setToast(
                              t("Подтверждение сохранено", "Растау сақталды", "Confirmation saved"),
                            );
                          } catch {
                            notifyError();
                          }
                        }}
                      >
                        {(b.buyerId === userId ? b.buyerConfirmed : b.sellerConfirmed)
                          ? t(
                              "Ожидаем вторую сторону",
                              "Екінші тарап күтілуде",
                              "Waiting for the other party",
                            )
                          : t("Подтвердить передачу", "Берілімді растау", "Confirm handover")}
                      </button>
                    )}
                    {["pending", "confirmed"].includes(b.status) && (
                      <button
                        className="text-button"
                        disabled={actions.booking.isPending}
                        onClick={async () => {
                          try {
                            await actions.booking.mutateAsync({ id: b.id, action: "cancel" });
                          } catch {
                            notifyError();
                          }
                        }}
                      >
                        {t("Отменить", "Бас тарту", "Cancel")}
                      </button>
                    )}
                    <button
                      className="text-button"
                      onClick={async () => {
                        if (b.sellerId === userId) {
                          const c = inbox.data?.find(
                            (c) => c.chat.itemId === i.id && c.chat.buyerId === b.buyerId,
                          );
                          if (c) navigate("/chats/" + encodeURIComponent(c.chat.id));
                          else
                            setToast(
                              t(
                                "Получатель ещё не начал переписку",
                                "Алушы хат алмасуды әлі бастамады",
                                "Recipient has not started a conversation yet",
                              ),
                            );
                        } else startChat(i);
                      }}
                    >
                      <MessageCircle size={16} />
                      {t("Написать", "Жазу", "Message")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        ) : itemId ? (
          detail.isLoading ? (
            <Loader />
          ) : detail.isError || !detail.data ? (
            <Empty title={t("Вещь недоступна", "Зат қолжетімсіз", "Item unavailable")} />
          ) : (
            <>
              <div className="breadcrumbs">
                <Link href="/">{t("Каталог", "Каталог", "Catalog")}</Link>
                <ChevronRight size={14} />
                <span>
                  {path.startsWith("/passport")
                    ? t("QR-паспорт", "QR-паспорт", "QR passport")
                    : loc(categories[detail.data.item.category])}
                </span>
              </div>
              <div className="detail-grid">
                <div className={"detail-photo " + detail.data.item.id}>
                  <img src={detail.data.item.image} alt={loc(detail.data.item.title)} />
                  {detail.data.item.demo && <span className="demo-pill">DEMO</span>}
                </div>
                <div className="detail-info">
                  <span className="eyebrow">
                    {path.startsWith("/passport")
                      ? t("ПАСПОРТ ВЕЩИ", "ЗАТ ПАСПОРТЫ", "ITEM PASSPORT")
                      : loc(categories[detail.data.item.category])}
                  </span>
                  <h1>{loc(detail.data.item.title)}</h1>
                  <div className="detail-price">{money(detail.data.item)}</div>
                  <div className="detail-meta">
                    <span>{loc(conditions[detail.data.item.condition])}</span>
                    <span className="availability">
                      <i />
                      {status(detail.data.item.status)}
                    </span>
                  </div>
                  <p className="description">{loc(detail.data.item.description)}</p>
                  {path.startsWith("/passport") ? (
                    <>
                      <p className="passport-id">ID: {detail.data.item.id}</p>
                      <h3>{t("История передач", "Берілімдер тарихы", "Transfer history")}</h3>
                      <div className="timeline">
                        {detail.data.item.demo ? (
                          <div>
                            <i />
                            <b>
                              {t(
                                "Демонстрационный предмет",
                                "Демонстрациялық зат",
                                "Sample object",
                              )}
                            </b>
                          </div>
                        ) : (
                          detail.data.history.map((h) => (
                            <div key={h.id}>
                              <i />
                              <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                              <b>
                                {h.kind === "created"
                                  ? t(
                                      "Добавлена в платформу",
                                      "Платформаға қосылды",
                                      "Added to platform",
                                    )
                                  : t(
                                      "Передача подтверждена обеими сторонами",
                                      "Берілімді екі тарап растады",
                                      "Handover confirmed by both parties",
                                    )}
                              </b>
                            </div>
                          ))
                        )}
                      </div>
                      <button
                        className="secondary"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            setToast(t("Ссылка скопирована", "Сілтеме көшірілді", "Link copied"));
                          } catch {
                            notifyError();
                          }
                        }}
                      >
                        {t("Скопировать ссылку", "Сілтемені көшіру", "Copy link")}
                        <ArrowUpRight size={17} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="owner">
                        <span className="avatar">{detail.data.item.ownerName[0]}</span>
                        <div>
                          <b>{detail.data.item.ownerName}</b>
                          <p>
                            {detail.data.item.demo
                              ? t("Пример профиля", "Профиль үлгісі", "Sample profile")
                              : t(
                                  "Участник сообщества",
                                  "Қауымдастық мүшесі",
                                  "Community member",
                                )}{" "}
                            · {detail.data.item.grade}
                          </p>
                        </div>
                      </div>
                      {detail.data.item.demo ? (
                        <div className="sample-note">
                          {t(
                            "Пример объявления. У этого предмета нет реального владельца для переписки и бронирования.",
                            "Хабарландыру үлгісі. Бұл заттың хат алмасу мен брондауға арналған нақты иесі жоқ.",
                            "Sample listing. There is no real owner to message or book this object with.",
                          )}
                        </div>
                      ) : detail.data.item.ownerId === userId ? (
                        <button
                          className="primary"
                          onClick={() => navigate("/edit/" + detail.data!.item.id)}
                        >
                          {t("Редактировать", "Өңдеу", "Edit listing")}
                        </button>
                      ) : (
                        <>
                          <button
                            className="primary full write-button"
                            disabled={actions.openChat.isPending}
                            onClick={() => startChat(detail.data!.item)}
                          >
                            <MessageCircle size={19} />
                            {t("Написать владельцу", "Иесіне жазу", "Message owner")}
                          </button>
                          <div className="detail-buttons">
                            <button
                              className="secondary"
                              disabled={detail.data.item.status !== "available"}
                              onClick={() => need(() => setReserve(detail.data!.item))}
                            >
                              {detail.data.item.type === "exchange"
                                ? t("Предложить обмен", "Айырбас ұсыну", "Propose exchange")
                                : t("Забронировать", "Брондау", "Request item")}
                              <ArrowRight size={17} />
                            </button>
                            <button
                              className="secondary"
                              onClick={() => toggleSave(detail.data!.item)}
                              aria-label={t("Сохранить вещь", "Затты сақтау", "Save item")}
                            >
                              <Heart
                                size={19}
                                fill={savedIds.has(detail.data.item.id) ? "currentColor" : "none"}
                              />
                            </button>
                          </div>
                        </>
                      )}
                      <Link
                        className="item-passport-link"
                        href={"/passport/" + detail.data.item.id}
                      >
                        <QrCode size={20} />
                        {t("QR-паспорт вещи", "Заттың QR-паспорты", "Item QR passport")}
                        <ArrowUpRight size={16} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {path.startsWith("/passport") && (
                <div className="passport-qr-row">
                  <div className="qr-wrap">
                    <QRCodeSVG
                      value={window.location.origin + "/passport/" + detail.data.item.id}
                      size={100}
                    />
                  </div>
                  <span className="passport-id">{detail.data.item.id}</span>
                </div>
              )}
            </>
          )
        ) : path === "/add" || path.startsWith("/edit/") ? (
          <div className="product-form-wrap">
            <div className="functional-title">
              <Plus size={24} />
              <h1>
                {path === "/add"
                  ? t("Добавить вещь", "Зат қосу", "Add an item")
                  : t("Редактировать", "Өңдеу", "Edit listing")}
              </h1>
            </div>
            {!logged ? (
              <Gate />
            ) : (
              <form
                key={path}
                className="publish-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormError("");
                  if (!photo) {
                    setFormError(t("Добавьте фото", "Фото қосыңыз", "Add a photograph"));
                    return;
                  }
                  const f = new FormData(e.currentTarget);
                  try {
                    await actions.publish.mutateAsync({
                      id: editItem?.id,
                      title: String(f.get("title")),
                      description: String(f.get("description")),
                      category: Number(f.get("category")),
                      condition: Number(f.get("condition")),
                      type: offer as "free" | "sale" | "exchange",
                      price: offer === "sale" ? Number(f.get("price")) : 0,
                      image: photo,
                    });
                    navigate("/profile");
                    setProfileTab("items");
                    setToast(
                      t("Отправлено на проверку", "Тексеруге жіберілді", "Submitted for review"),
                    );
                  } catch {
                    setFormError(
                      profile.data?.profile
                        ? t(
                            "Не удалось сохранить объявление",
                            "Хабарландыру сақталмады",
                            "Could not save listing",
                          )
                        : t(
                            "Сначала укажите школу и класс в настройках профиля.",
                            "Алдымен профиль параметрлерінде мектеп пен сыныпты көрсетіңіз.",
                            "First set your school and class in profile settings.",
                          ),
                    );
                  }
                }}
              >
                <label className="upload-box">
                  {photo ? (
                    <img src={photo} alt={t("Предпросмотр", "Алдын ала қарау", "Preview")} />
                  ) : (
                    <Upload size={28} />
                  )}
                  <b>{t("Добавить фотографию", "Фото қосу", "Add a photo")}</b>
                  <span>JPG / PNG / WEBP · 5 MB</span>
                  <input
                    aria-label={t("Фотография", "Фото", "Photo")}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        try {
                          setPhoto(await imageData(f));
                        } catch (e) {
                          setFormError(String(e));
                        }
                    }}
                  />
                </label>
                <label>
                  {t("Название", "Атауы", "Title")}
                  <input
                    aria-label={t("Название", "Атауы", "Title")}
                    name="title"
                    defaultValue={editItem ? loc(editItem.title) : ""}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <div className="form-two">
                  <label>
                    {t("Категория", "Санат", "Category")}
                    <select
                      name="category"
                      defaultValue={editItem?.category || 1}
                      aria-label={t("Категория", "Санат", "Category")}
                    >
                      {categories.slice(1).map((c, n) => (
                        <option key={n} value={n + 1}>
                          {loc(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t("Состояние", "Күйі", "Condition")}
                    <select
                      name="condition"
                      defaultValue={editItem?.condition || 1}
                      aria-label={t("Состояние", "Күйі", "Condition")}
                    >
                      {conditions.map((c, n) => (
                        <option key={n} value={n}>
                          {loc(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <fieldset>
                  <legend>{t("Тип предложения", "Ұсыныс түрі", "Offer type")}</legend>
                  <div className="type-options">
                    {["sale", "exchange", "free"].map((v) => (
                      <label key={v}>
                        <input
                          type="radio"
                          name="offer"
                          value={v}
                          aria-label={formatType(v)}
                          checked={offer === v}
                          onChange={() => setOffer(v)}
                        />
                        <span>{formatType(v)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {offer === "sale" && (
                  <label>
                    {t("Цена, ₸", "Бағасы, ₸", "Price, ₸")}
                    <input
                      aria-label={t("Цена", "Бағасы", "Price")}
                      name="price"
                      type="number"
                      required
                      min={1}
                      max={10000000}
                      defaultValue={editItem?.price || ""}
                    />
                  </label>
                )}
                <label>
                  {t("Описание", "Сипаттама", "Description")}
                  <textarea
                    aria-label={t("Описание", "Сипаттама", "Description")}
                    name="description"
                    rows={5}
                    required
                    minLength={5}
                    maxLength={1500}
                    defaultValue={editItem ? loc(editItem.description) : ""}
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    aria-label={t("Согласие с правилами", "Ережелермен келісу", "Agree to rules")}
                    required
                  />
                  {t(
                    "Не публикую личные контакты. Передача — в разрешённом месте школы.",
                    "Жеке байланыстарды жарияламаймын. Берілім мектептің рұқсат етілген жерінде.",
                    "No personal contact details. Handover in an approved school area.",
                  )}
                </label>
                {formError && (
                  <p className="form-error" role="alert">
                    {formError}
                  </p>
                )}
                <button disabled={actions.publish.isPending} className="primary" type="submit">
                  {actions.publish.isPending ? (
                    <Loader2 className="spinner" size={17} />
                  ) : (
                    <>
                      {t("Отправить на проверку", "Тексеруге жіберу", "Submit for review")}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : path === "/profile" ? (
          <>
            <div className="functional-title">
              <User size={23} />
              <h1>{t("Профиль", "Профиль", "Profile")}</h1>
            </div>
            {!logged ? (
              <Gate />
            ) : profile.isLoading ? (
              <Loader />
            ) : (
              <>
                <div className="profile-meta">
                  <span className="avatar">{session.user.name[0]}</span>
                  <div>
                    <h3>{profile.data?.user.name || session.user.name}</h3>
                    <p>
                      {profile.data?.profile?.school ||
                        t("Школа не указана", "Мектеп көрсетілмеген", "School not set")}{" "}
                      · {profile.data?.profile?.grade || "—"}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={async () => {
                      await authClient.signOut();
                      localStorage.removeItem("mura-session");
                      qc.clear();
                      navigate("/");
                    }}
                  >
                    <LogOut size={15} />
                    {t("Выйти", "Шығу", "Sign out")}
                  </button>
                </div>
                <div className="tabs">
                  {[
                    ["items", t("Мои объявления", "Менің хабарландыруларым", "My listings")],
                    ["history", t("История передач", "Берілімдер тарихы", "Transfer history")],
                    ["settings", t("Настройки", "Параметрлер", "Settings")],
                    ...(moderator
                      ? [["moderation", t("Модерация", "Модерация", "Moderation")]]
                      : []),
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      className={profileTab === v ? "active" : ""}
                      onClick={() => setProfileTab(v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {profileTab === "items" ? (
                  mine.isLoading ? (
                    <Loader />
                  ) : mine.data?.length ? (
                    <div>
                      {mine.data.map((i) => (
                        <div className="listing-row" key={i.id}>
                          <img src={i.image} alt="" />
                          <div>
                            <h3>{loc(i.title)}</h3>
                            <p>{status(i.status)}</p>
                          </div>
                          {!["reserved", "transferred"].includes(i.status) && (
                            <>
                              <button
                                className="text-button"
                                onClick={() => navigate("/edit/" + i.id)}
                              >
                                {t("Редактировать", "Өңдеу", "Edit")}
                              </button>
                              {i.status !== "removed" && (
                                <button
                                  className="text-button"
                                  disabled={actions.withdraw.isPending}
                                  onClick={async () => {
                                    try {
                                      await actions.withdraw.mutateAsync({ id: i.id });
                                    } catch {
                                      notifyError();
                                    }
                                  }}
                                >
                                  {t("Снять", "Алып тастау", "Withdraw")}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Empty
                        title={t(
                          "Пока нет объявлений",
                          "Әзірге хабарландыру жоқ",
                          "No listings yet",
                        )}
                      />
                      <button className="primary" onClick={add}>
                        <Plus size={17} />
                        {t("Добавить вещь", "Зат қосу", "Add item")}
                      </button>
                    </>
                  )
                ) : profileTab === "settings" ? (
                  <form
                    className="publish-form settings-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      try {
                        await actions.settings.mutateAsync({
                          name: String(f.get("name")),
                          school: String(f.get("school")),
                          grade: String(f.get("grade")),
                        });
                        setToast(
                          t("Настройки сохранены", "Параметрлер сақталды", "Settings saved"),
                        );
                      } catch {
                        notifyError();
                      }
                    }}
                  >
                    <label>
                      {t("Имя", "Аты", "Name")}
                      <input
                        aria-label={t("Имя", "Аты", "Name")}
                        name="name"
                        required
                        maxLength={40}
                        defaultValue={profile.data?.user.name}
                      />
                    </label>
                    <label>
                      {t("Школа", "Мектеп", "School")}
                      <input
                        aria-label={t("Школа", "Мектеп", "School")}
                        name="school"
                        required
                        minLength={2}
                        maxLength={100}
                        defaultValue={profile.data?.profile?.school || ""}
                      />
                    </label>
                    <label>
                      {t("Класс", "Сынып", "Class")}
                      <input
                        aria-label={t("Класс", "Сынып", "Class")}
                        name="grade"
                        required
                        maxLength={10}
                        defaultValue={profile.data?.profile?.grade || ""}
                      />
                    </label>
                    <button className="primary" disabled={actions.settings.isPending}>
                      {t("Сохранить", "Сақтау", "Save")}
                    </button>
                  </form>
                ) : profileTab === "history" ? (
                  <>
                    {bookings.data?.filter((b) => b.booking.status === "done").length ? (
                      bookings.data
                        .filter((b) => b.booking.status === "done")
                        .map(({ item: i, booking: b }) => (
                          <div className="listing-row" key={b.id}>
                            <img src={i.image} alt="" />
                            <div>
                              <h3>{loc(i.title)}</h3>
                              <p>{new Date(b.date).toLocaleDateString()}</p>
                            </div>
                            <Link href={"/passport/" + i.id} className="text-button">
                              {t("Паспорт", "Паспорт", "Passport")}
                              <ArrowUpRight size={16} />
                            </Link>
                          </div>
                        ))
                    ) : (
                      <Empty
                        title={t(
                          "Пока нет завершённых передач",
                          "Әзірге аяқталған берілім жоқ",
                          "No completed handovers yet",
                        )}
                      />
                    )}
                  </>
                ) : moderator ? (
                  <>
                    {moderation.isLoading ? (
                      <Loader />
                    ) : moderation.data?.length ? (
                      moderation.data.map((i) => (
                        <div className="listing-row" key={i.id}>
                          <img src={i.image} alt="" />
                          <div>
                            <h3>{loc(i.title)}</h3>
                            <p>{loc(i.description)}</p>
                          </div>
                          <button
                            className="primary"
                            disabled={actions.moderate.isPending}
                            onClick={async () => {
                              try {
                                await actions.moderate.mutateAsync({ id: i.id, approve: true });
                              } catch {
                                notifyError();
                              }
                            }}
                          >
                            {t("Одобрить", "Мақұлдау", "Approve")}
                          </button>
                          <button
                            className="secondary"
                            disabled={actions.moderate.isPending}
                            onClick={async () => {
                              try {
                                await actions.moderate.mutateAsync({ id: i.id, approve: false });
                              } catch {
                                notifyError();
                              }
                            }}
                          >
                            {t("Отклонить", "Қабылдамау", "Reject")}
                          </button>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title={t(
                          "Нет объявлений на проверке",
                          "Тексерілетін хабарландыру жоқ",
                          "No listings awaiting review",
                        )}
                      />
                    )}
                  </>
                ) : null}
              </>
            )}
          </>
        ) : (
          <Empty title="404" />
        )}
      </main>
      <nav className="bottom-nav product-bottom-nav">
        <Link href="/" className={isCatalog ? "active" : ""}>
          <BookOpen size={20} />
          {t("Каталог", "Каталог", "Catalog")}
        </Link>
        <Link href="/saved" className={path === "/saved" ? "active" : ""}>
          <Heart size={20} />
          {t("Избранное", "Таңдаулы", "Saved")}
        </Link>
        <button onClick={add}>
          <span className="bottom-plus">
            <Plus size={22} />
          </span>
          {t("Добавить", "Қосу", "Add")}
        </button>
        <Link
          href="/chats"
          className={"unread-control " + (path.startsWith("/chats") ? "active" : "")}
        >
          <MessageCircle size={20} />
          {unread > 0 && <i>{unread}</i>}
          {t("Чаты", "Чаттар", "Chats")}
        </Link>
        <Link href="/profile" className={path === "/profile" ? "active" : ""}>
          <User size={20} />
          {t("Профиль", "Профиль", "Profile")}
        </Link>
      </nav>
      {auth && (
        <ProductAuth
          t={t}
          onClose={() => setAuth(false)}
          onSuccess={() => {
            setAuth(false);
            qc.invalidateQueries();
            navigate("/");
          }}
        />
      )}
      {reserve && (
        <DemoDialog onClose={() => setReserve(null)}>
          <section className="modal">
            <button
              className="modal-close icon-button"
              aria-label={t("Закрыть", "Жабу", "Close")}
              onClick={() => setReserve(null)}
            >
              <X />
            </button>
            <h2>{t("Запрос на передачу", "Берілім сұрауы", "Request a handover")}</h2>
            <p>{loc(reserve.title)}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                try {
                  await actions.reserve.mutateAsync({
                    itemId: reserve.id,
                    date: String(f.get("date")) + ":00",
                    place: String(f.get("place")) as "library" | "administration",
                  });
                  setReserve(null);
                  navigate("/bookings");
                } catch {
                  notifyError();
                }
              }}
            >
              <label>
                {t("Предложить время", "Уақыт ұсыну", "Propose a time")}
                <input
                  aria-label={t("Дата встречи", "Кездесу күні", "Meeting date")}
                  type="datetime-local"
                  name="date"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </label>
              <label>
                {t("Место передачи", "Беру орны", "Meeting place")}
                <select name="place" aria-label={t("Место передачи", "Беру орны", "Meeting place")}>
                  <option value="library">{t("Библиотека", "Кітапхана", "Library")}</option>
                  <option value="administration">
                    {t("Администрация", "Әкімшілік", "Administration desk")}
                  </option>
                </select>
              </label>
              <button disabled={actions.reserve.isPending} className="primary">
                {actions.reserve.isPending ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  t("Отправить запрос", "Сұрау жіберу", "Send request")
                )}
              </button>
            </form>
          </section>
        </DemoDialog>
      )}
      {toast && (
        <output className="toast">
          <Check size={18} />
          {toast}
          <button
            className="icon-button"
            aria-label={t("Закрыть", "Жабу", "Close")}
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </output>
      )}
    </div>
  );
}
