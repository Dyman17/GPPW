import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Send, Paperclip, X, ArrowLeft, Loader2 } from "lucide-react";
import { useChats, useMessages, useActions } from "../queries/market";
import { imageData, localized, type Translate } from "../lib/product";
export function ProductChats({ userId, t }: { userId: string; t: Translate }) {
  const [path, navigate] = useLocation();
  const id = decodeURIComponent(path.split("/")[2] || "");
  const chats = useChats(true);
  const messages = useMessages(id);
  const actions = useActions();
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const selected = chats.data?.find((c) => c.chat.id === id);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.data]);
  const time = (at: number) =>
    new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <section className={"chat-layout " + (id ? "chat-selected" : "")}>
      <aside className="chat-inbox">
        <div className="inbox-title">
          <h2>{t("Сообщения", "Хабарламалар", "Messages")}</h2>
          <span>{chats.data?.length || 0}</span>
        </div>
        {chats.isLoading ? (
          <Loader2 className="spinner" />
        ) : chats.isError ? (
          <p className="form-error">
            {t(
              "Не удалось загрузить чаты",
              "Чаттарды жүктеу мүмкін болмады",
              "Could not load chats",
            )}
          </p>
        ) : !chats.data?.length ? (
          <div className="compact-empty">
            <MessageCircle size={30} />
            <p>{t("Пока нет переписок", "Әзірге хат алмасу жоқ", "No conversations yet")}</p>
          </div>
        ) : (
          chats.data.map((c) => (
            <Link
              className={"chat-list-entry " + (c.chat.id === id ? "active" : "")}
              key={c.chat.id}
              href={"/chats/" + encodeURIComponent(c.chat.id)}
            >
              <span className="avatar">{c.partner?.name[0]}</span>
              <div>
                <b>{c.partner?.name}</b>
                <span>
                  {c.last?.body ||
                    (c.last?.image
                      ? t("Фотография", "Фото", "Photo")
                      : localized(c.item?.title || ["", "", ""], t))}
                </span>
              </div>
              <div className="chat-entry-meta">
                <small>{c.last ? time(c.last.createdAt) : ""}</small>
                {c.unread > 0 && <i>{c.unread}</i>}
              </div>
              {c.item && <img src={c.item.image} alt="" />}
            </Link>
          ))
        )}
      </aside>
      <div className="chat-conversation">
        {!id ? (
          <div className="empty">
            <MessageCircle size={42} />
            <h3>{t("Выберите переписку", "Хат алмасуды таңдаңыз", "Choose a conversation")}</h3>
          </div>
        ) : selected ? (
          <>
            <div className="chat-heading">
              <button
                className="chat-back icon-button"
                onClick={() => navigate("/chats")}
                aria-label={t("Назад", "Артқа", "Back")}
              >
                <ArrowLeft size={20} />
              </button>
              <span className="avatar">{selected.partner?.name[0]}</span>
              <div>
                <b>{selected.partner?.name}</b>
                <span>
                  {t(
                    "Переписка по объявлению",
                    "Хабарландыру бойынша хат алмасу",
                    "Listing conversation",
                  )}
                </span>
              </div>
            </div>
            {selected.item && (
              <Link className="chat-item-context" href={"/item/" + selected.item.id}>
                <img src={selected.item.image} alt="" />
                <div>
                  <b>{localized(selected.item.title, t)}</b>
                  <span>
                    {selected.item.type === "sale"
                      ? selected.item.price + " ₸"
                      : selected.item.type === "free"
                        ? t("Даром", "Тегін", "Free")
                        : t("Обмен", "Айырбас", "Exchange")}
                  </span>
                </div>
                <span>↗</span>
              </Link>
            )}
            <div className="message-history">
              {messages.isLoading ? (
                <Loader2 className="spinner" />
              ) : messages.isError ? (
                <p className="form-error">
                  {t(
                    "Не удалось загрузить сообщения",
                    "Хабарламалар жүктелмеді",
                    "Could not load messages",
                  )}
                </p>
              ) : !messages.data?.length ? (
                <div className="compact-empty">
                  <p>
                    {t(
                      "Начните разговор с владельцем",
                      "Иесімен сөйлесуді бастаңыз",
                      "Start the conversation",
                    )}
                  </p>
                </div>
              ) : (
                messages.data.map((m) => (
                  <div
                    key={m.id}
                    className={"message-bubble " + (m.senderId === userId ? "own" : "")}
                  >
                    {m.image && (
                      <img
                        src={m.image}
                        alt={t("Прикреплённая фотография", "Тіркелген фото", "Attached photo")}
                      />
                    )}
                    <p>{m.body}</p>
                    <time>{time(m.createdAt)}</time>
                  </div>
                ))
              )}
              <div ref={end} />
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            {image && (
              <div className="attachment-preview">
                <img src={image} alt="" />
                <button
                  onClick={() => setImage("")}
                  aria-label={t("Удалить фото", "Фотоны жою", "Remove photo")}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <form
              className="message-composer"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  await actions.send.mutateAsync({ id, body, image: image || undefined });
                  setBody("");
                  setImage("");
                } catch {
                  setError(
                    t(
                      "Сообщение не отправлено. Попробуйте снова.",
                      "Хабар жіберілмеді. Қайталап көріңіз.",
                      "Message was not sent. Please try again.",
                    ),
                  );
                }
              }}
            >
              <label
                className="attach-control"
                aria-label={t("Прикрепить фото", "Фото тіркеу", "Attach photo")}
              >
                <Paperclip size={20} />
                <input
                  aria-label={t("Прикрепить фото", "Фото тіркеу", "Attach photo")}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f)
                      try {
                        setImage(await imageData(f));
                      } catch (e) {
                        setError(String(e));
                      }
                  }}
                />
              </label>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                placeholder={t("Написать сообщение…", "Хабар жазу…", "Write a message…")}
                aria-label={t("Сообщение", "Хабарлама", "Message")}
              />
              <button
                className="send-button"
                disabled={actions.send.isPending || (!body.trim() && !image)}
                aria-label={t("Отправить", "Жіберу", "Send")}
              >
                {actions.send.isPending ? (
                  <Loader2 className="spinner" size={19} />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="empty">
            {chats.isLoading ? (
              <Loader2 className="spinner" />
            ) : (
              t("Чат недоступен", "Чат қолжетімсіз", "Conversation unavailable")
            )}
          </div>
        )}
      </div>
    </section>
  );
}
