import { AppShell } from "@/components/layout/AppShell";
import styles from "./IncidentsDashboardSkeleton.module.scss";

const tableRows = Array.from({ length: 7 }, (_, index) => index);
const calendarDays = Array.from({ length: 35 }, (_, index) => index);
const trendBars = [28, 44, 58, 72, 84, 66, 78, 92];
const radarNodes = Array.from({ length: 8 }, (_, index) => index);
const teamRows = Array.from({ length: 5 }, (_, index) => index);

function Line({ className = "" }: { className?: string }) {
  return <span className={`${styles.dashboardSkeleton__line} ${className}`} />;
}

function ShortLine({ className = "" }: { className?: string }) {
  return <span className={`${styles.dashboardSkeleton__lineShort} ${className}`} />;
}

function TinyLine({ className = "" }: { className?: string }) {
  return <span className={`${styles.dashboardSkeleton__lineTiny} ${className}`} />;
}

function Pill({ className = "" }: { className?: string }) {
  return <span className={`${styles.dashboardSkeleton__pill} ${className}`} />;
}

function ButtonSkeleton() {
  return <span className={styles.dashboardSkeleton__button} />;
}

function KpiSkeleton() {
  return (
    <article className={styles.dashboardSkeleton__kpi}>
      <span className={styles.dashboardSkeleton__kpiIcon} />
      <div className={styles.dashboardSkeleton__kpiBody}>
        <TinyLine />
        <ShortLine className={styles.dashboardSkeleton__metricLine} />
        <Line />
      </div>
      <div className={styles.dashboardSkeleton__kpiFooter}>
        <Pill />
        <Line />
      </div>
    </article>
  );
}

function DonutPanel() {
  return (
    <article className={styles.dashboardSkeleton__panel}>
      <div className={styles.dashboardSkeleton__panelHeader}>
        <ShortLine />
        <TinyLine />
      </div>
      <div className={styles.dashboardSkeleton__donutArea}>
        <div className={styles.dashboardSkeleton__donut} />
        <div className={styles.dashboardSkeleton__legend}>
          <Pill />
          <Pill />
          <Pill />
        </div>
      </div>
    </article>
  );
}

function TrendPanel() {
  return (
    <section className={styles.dashboardSkeleton__trend}>
      <div className={styles.dashboardSkeleton__trendHeader}>
        <div className={styles.dashboardSkeleton__trendTitleBlock}>
          <TinyLine />
          <ShortLine className={styles.dashboardSkeleton__sectionTitle} />
          <Line className={styles.dashboardSkeleton__sectionMeta} />
        </div>
        <div className={styles.dashboardSkeleton__trendTabs}>
          <Pill />
          <Pill />
          <Pill />
        </div>
      </div>
      <div className={styles.dashboardSkeleton__trendChart}>
        <span className={styles.dashboardSkeleton__trendArea} />
        <div className={styles.dashboardSkeleton__trendBars}>
          {trendBars.map((height, index) => (
            <span
              key={index}
              className={`${styles.dashboardSkeleton__trendBar} ${styles[`dashboardSkeleton__trendBar${index}`]}`}
            />
          ))}
        </div>
        <div className={styles.dashboardSkeleton__trendLegend}>
          <Pill />
          <Pill />
          <Pill />
        </div>
      </div>
    </section>
  );
}

function DistributionPanel() {
  return (
    <section className={styles.dashboardSkeleton__distribution}>
      <div className={styles.dashboardSkeleton__wideHeader}>
        <ShortLine className={styles.dashboardSkeleton__sectionTitle} />
        <Line className={styles.dashboardSkeleton__sectionMeta} />
      </div>
      <div className={styles.dashboardSkeleton__distributionGrid}>
        <article className={styles.dashboardSkeleton__panel}>
          <div className={styles.dashboardSkeleton__panelHeader}>
            <div className={styles.dashboardSkeleton__categoryHeader}>
              <TinyLine />
              <ShortLine />
            </div>
            <Pill className={styles.dashboardSkeleton__counter} />
          </div>
          <div className={styles.dashboardSkeleton__radarBox}>
            <span className={styles.dashboardSkeleton__radarRing} />
            {radarNodes.map((node) => (
              <span
                key={node}
                className={[
                  styles.dashboardSkeleton__radarLabel,
                  styles[`dashboardSkeleton__radarLabel${node + 1}`],
                ].join(" ")}
              />
            ))}
          </div>
        </article>
        <article className={styles.dashboardSkeleton__panel}>
          <div className={styles.dashboardSkeleton__panelHeader}>
            <div className={styles.dashboardSkeleton__categoryHeader}>
              <TinyLine />
              <ShortLine />
            </div>
            <Pill className={styles.dashboardSkeleton__counter} />
          </div>
          <div className={styles.dashboardSkeleton__treemap}>
            <span className={styles.dashboardSkeleton__treemapLarge} />
            <span className={styles.dashboardSkeleton__treemapTall} />
            <span className={styles.dashboardSkeleton__treemapSmall} />
            <span className={styles.dashboardSkeleton__treemapWide} />
          </div>
        </article>
      </div>
    </section>
  );
}

function TeamPanel() {
  return (
    <section className={styles.dashboardSkeleton__team}>
      <div className={styles.dashboardSkeleton__wideHeader}>
        <ShortLine className={styles.dashboardSkeleton__sectionTitle} />
        <Line className={styles.dashboardSkeleton__sectionMeta} />
      </div>
      <div className={styles.dashboardSkeleton__teamGrid}>
        {Array.from({ length: 3 }, (_, card) => (
          <article key={card} className={styles.dashboardSkeleton__teamCard}>
            <TinyLine />
            <ShortLine />
            <div className={styles.dashboardSkeleton__teamRows}>
              {teamRows.map((row) => (
                <div key={row} className={styles.dashboardSkeleton__teamRow}>
                  <span className={styles.dashboardSkeleton__teamAvatar} />
                  <Line />
                  <Pill />
                  <TinyLine />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CriticalTable() {
  return (
    <section className={`${styles.dashboardSkeleton__wide} ${styles.dashboardSkeleton__critical}`}>
      <div className={styles.dashboardSkeleton__wideHeader}>
        <ShortLine className={styles.dashboardSkeleton__sectionTitle} />
        <Line className={styles.dashboardSkeleton__sectionMeta} />
      </div>
      <div className={styles.dashboardSkeleton__table}>
        {tableRows.map((row) => (
          <div key={row} className={styles.dashboardSkeleton__row}>
            <TinyLine />
            <Line />
            <Pill />
            <Pill />
            <Pill />
            <Pill />
          </div>
        ))}
      </div>
    </section>
  );
}

function MapAndCalendarSkeleton() {
  return (
    <section className={styles.dashboardSkeleton__mapGrid}>
      <article className={styles.dashboardSkeleton__map}>
        <div className={styles.dashboardSkeleton__wideHeader}>
          <ShortLine className={styles.dashboardSkeleton__sectionTitle} />
          <TinyLine />
        </div>
        <div className={styles.dashboardSkeleton__mapBlock} />
      </article>
      <article className={styles.dashboardSkeleton__calendar}>
        <ShortLine className={styles.dashboardSkeleton__calendarTitle} />
        <div className={styles.dashboardSkeleton__calendarGrid}>
          {calendarDays.map((day) => (
            <span key={day} className={styles.dashboardSkeleton__calendarCell} />
          ))}
        </div>
      </article>
    </section>
  );
}

export function IncidentsDashboardSkeleton() {
  return (
    <AppShell>
      <main className={styles.dashboardSkeleton}>
        <div className={styles.dashboardSkeleton__container}>
          <header className={styles.dashboardSkeleton__hero}>
            <div className={styles.dashboardSkeleton__titleGroup}>
              <Line className={styles.dashboardSkeleton__breadcrumb} />
              <ShortLine className={styles.dashboardSkeleton__title} />
            </div>
            <div className={styles.dashboardSkeleton__toolbar}>
              <ButtonSkeleton />
              <ButtonSkeleton />
              <ButtonSkeleton />
              <ButtonSkeleton />
              <ButtonSkeleton />
            </div>
          </header>

          <section>
            <div className={styles.dashboardSkeleton__summaryHeader}>
              <ShortLine className={styles.dashboardSkeleton__sectionTitle} />
              <Line className={styles.dashboardSkeleton__sectionMeta} />
            </div>

            <div className={styles.dashboardSkeleton__kpis}>
              {Array.from({ length: 6 }, (_, index) => (
                <KpiSkeleton key={index} />
              ))}
            </div>

            <div className={styles.dashboardSkeleton__panels}>
              <DonutPanel />
              <DonutPanel />
            </div>

            <TrendPanel />
            <DistributionPanel />
            <TeamPanel />
            <CriticalTable />
            <MapAndCalendarSkeleton />
          </section>
        </div>
      </main>
    </AppShell>
  );
}
