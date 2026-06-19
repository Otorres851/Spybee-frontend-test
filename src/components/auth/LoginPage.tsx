"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import spybeeLogo from "@/assets/logo/spybee-logo.png";
import { LANG_OPTIONS, type Lang } from "@/i18n";
import { useT } from "@/hooks/useT";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUiStore } from "@/stores/useUiStore";
import styles from "./LoginPage.module.scss";

type LoginErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function LoginPage() {
  const router = useRouter();
  const t = useT();
  const dark = useUiStore((state) => state.dark);
  const lang = useUiStore((state) => state.lang);
  const setLang = useUiStore((state) => state.setLang);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const login = useAuthStore((state) => state.login);
  const hydrate = useAuthStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState("julian@spybee.com");
  const [password, setPassword] = useState("Spybee2026");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("spybee-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (status === "authenticated") router.replace(routes.dashboard);
  }, [router, status]);

  const metrics = useMemo(
    () => [
      ["253", t.loginMetricIncidents],
      ["24/7", t.loginMetricTracking],
      ["ES/EN", t.loginMetricLanguages],
    ],
    [t]
  );

  const validate = () => {
    const nextErrors: LoginErrors = {};
    if (!email.trim()) nextErrors.email = t.requiredField;
    else if (!isValidEmail(email)) nextErrors.email = t.loginEmailInvalid;
    if (!password.trim()) nextErrors.password = t.requiredField;
    else if (password.trim().length < 6) nextErrors.password = t.loginPasswordInvalid;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    try {
      await login({ email, password, remember });
      router.replace(routes.dashboard);
    } catch {
      setFormError(t.loginInvalidCredentials);
    }
  };

  return (
    <main className={`${styles.loginPage} ${dark ? styles.dark : ""}`}>
      <section className={styles.shell} aria-label={t.loginTitle}>
        <div className={styles.hero}>
          <div className={styles.brand} aria-label="Spybee">
            <span className={styles.logoMark} aria-hidden="true">
              <Image
                src={spybeeLogo}
                alt=""
                width={52}
                height={52}
                className={styles.logoImage}
                priority
              />
            </span>
            <span className={styles.brandName}>
              <span>Spy</span>
              <strong>bee</strong>
            </span>
          </div>

          <div className={styles.copy}>
            <p className={styles.eyebrow}>{t.loginEyebrow}</p>
            <h1 className={styles.title}>{t.loginHeroTitle}</h1>
            <p className={styles.description}>{t.loginHeroDescription}</p>
          </div>

          <div className={styles.metrics} aria-label={t.loginMetricsLabel}>
            {metrics.map(([value, label]) => (
              <article key={label} className={styles.metricCard}>
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
        </div>

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <div>
              <h1>{t.loginTitle}</h1>
              <p>{t.loginSubtitle}</p>
            </div>
            <div className={styles.localeActions}>
              <button
                type="button"
                className={styles.localeButton}
                onClick={() => setLang(LANG_OPTIONS.find((option) => option !== lang) as Lang)}
                aria-label={t.changeLanguage}
              >
                {lang.toUpperCase()}
              </button>
              <button
                type="button"
                className={styles.themeButton}
                onClick={toggleTheme}
                aria-label={dark ? t.themeLight : t.themeDark}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email">{t.loginEmail}</label>
              <div className={styles.inputWrap}>
                <Mail size={18} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={validate}
                  placeholder="julian@spybee.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email ? <span className={styles.errorText}>{errors.email}</span> : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="password">{t.loginPassword}</label>
              <div className={styles.inputWrap}>
                <LockKeyhole size={18} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="password"
                  className={`${styles.passwordInput} ${errors.password ? styles.inputError : ""}`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={validate}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? t.loginHidePassword : t.loginShowPassword}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password ? <span className={styles.errorText}>{errors.password}</span> : null}
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>{t.loginRemember}</span>
              </label>
              <button type="button" className={styles.forgot}>
                {t.loginForgot}
              </button>
            </div>

            {formError ? <p className={styles.formError}>{formError}</p> : null}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? t.loginLoading : t.loginSubmit}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className={styles.hint}>
            {t.loginDemoHint} <code>julian@spybee.com</code> / <code>Spybee2026</code>
          </p>
        </section>
      </section>
    </main>
  );
}
