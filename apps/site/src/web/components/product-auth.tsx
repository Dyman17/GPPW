import { useState } from "react";
import { X, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { DemoDialog } from "./demo-dialog";
import { authClient, captureToken } from "../lib/auth";
import type { Translate } from "../lib/product";
export function ProductAuth({
  t,
  onClose,
  onSuccess,
}: {
  t: Translate;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <DemoDialog onClose={onClose}>
      <section className="modal">
        <button
          className="icon-button modal-close"
          aria-label={t("Закрыть", "Жабу", "Close")}
          onClick={onClose}
        >
          <X />
        </button>
        <BookOpen className="orange" size={30} />
        <h2>
          {register
            ? t("Регистрация", "Тіркелу", "Create account")
            : t("Войти в Мұра", "Мұраға кіру", "Sign in to Mura")}
        </h2>
        <div className="auth-mode-tabs">
          <button className={!register ? "active" : ""} onClick={() => setRegister(false)}>
            {t("Вход", "Кіру", "Sign in")}
          </button>
          <button className={register ? "active" : ""} onClick={() => setRegister(true)}>
            {t("Регистрация", "Тіркелу", "Register")}
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const f = new FormData(e.currentTarget);
            try {
              const args = {
                email: String(f.get("email")),
                password: String(f.get("password")),
                fetchOptions: { onSuccess: captureToken },
              };
              const result = register
                ? await authClient.signUp.email({ ...args, name: String(f.get("name")) })
                : await authClient.signIn.email(args);
              if (result.error) {
                setError(
                  t(
                    "Не удалось войти. Проверьте данные; пароль — не менее 8 символов.",
                    "Кіру мүмкін болмады. Деректерді тексеріңіз; құпиясөз кемінде 8 таңба.",
                    "Could not sign in. Check your details; passwords need at least 8 characters.",
                  ),
                );
                return;
              }
              onSuccess();
            } catch {
              setError(
                t("Нет связи с сервером", "Сервермен байланыс жоқ", "Could not connect to server"),
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {register && (
            <label>
              {t("Имя", "Аты", "Name")}
              <input
                name="name"
                aria-label={t("Имя", "Аты", "Name")}
                required
                maxLength={40}
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email
            <input type="email" name="email" aria-label="Email" required autoComplete="email" />
          </label>
          <label>
            {t("Пароль", "Құпиясөз", "Password")}
            <input
              type="password"
              name="password"
              aria-label={t("Пароль", "Құпиясөз", "Password")}
              required
              minLength={8}
              autoComplete={register ? "new-password" : "current-password"}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary full" type="submit">
            {busy ? (
              <Loader2 className="spinner" size={18} />
            ) : (
              <>
                {register
                  ? t("Создать аккаунт", "Тіркелгі жасау", "Create account")
                  : t("Войти", "Кіру", "Sign in")}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </section>
    </DemoDialog>
  );
}
