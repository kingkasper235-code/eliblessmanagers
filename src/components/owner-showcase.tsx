import { useId } from "react";
import Image from "next/image";
import Link from "next/link";

import type { OwnerRecord } from "@/lib/owners";

const portraitPath =
  "M 110 18 C 198 -4 372 2 439 44 C 474 65 486 104 480 148 L 454 497 C 451 540 421 574 379 585 C 295 608 151 598 91 571 C 51 553 33 514 37 469 L 20 144 C 17 90 45 47 84 30 C 92 26 101 22 110 18 Z";

const portraitClipPath =
  "M .22 .03 C .3967 -.0067 .744 .0033 .878 .0733 C .948 .1083 .972 .1733 .96 .2467 L .908 .8283 C .902 .9 .842 .9567 .758 .975 C .59 1.0133 .302 .9967 .182 .9517 C .102 .9217 .066 .8567 .074 .7817 L .04 .24 C .034 .15 .09 .0783 .168 .05 C .184 .0433 .202 .0367 .22 .03 Z";

type OwnerShowcaseProps = {
  owners: OwnerRecord[];
  kicker?: string;
  heading?: string;
  description?: string;
  showAboutLink?: boolean;
};

export function OwnerShowcase({
  owners,
  kicker = "Meet the people behind the work",
  heading = "A more personal way to move through property.",
  description,
  showAboutLink = true,
}: OwnerShowcaseProps) {
  const idPrefix = `owner-portrait-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  if (!owners.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="owner-showcase-title"
      className="relative overflow-hidden bg-[var(--brand-offwhite)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div
          className={`mb-10 grid gap-6 border-b border-[var(--brand-border)] pb-8 ${
            showAboutLink ? "md:grid-cols-[1fr_auto] md:items-end md:gap-10" : ""
          } lg:mb-12 lg:pb-10`}
        >
          <div className="max-w-3xl">
            <p className="brand-section-kicker">{kicker}</p>
            <h2
              id="owner-showcase-title"
              className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] text-[var(--brand-navy)] sm:text-4xl lg:text-5xl"
            >
              {heading}
            </h2>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--brand-muted)]">
                {description}
              </p>
            ) : null}
          </div>

          {showAboutLink ? (
            <Link
              href="/about"
              className="group inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--brand-gold)] pb-1 text-sm font-semibold text-[var(--brand-navy)] transition-colors hover:text-[#0e625d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-gold)]"
            >
              Meet our team
              <span
                aria-hidden="true"
                className="text-[#0e625d] transition-transform group-hover:translate-x-1"
              >
                ↗
              </span>
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-2 items-start gap-x-2 gap-y-5 min-[360px]:gap-x-3 min-[430px]:gap-x-4 sm:gap-x-6 sm:gap-y-7 md:gap-x-8 md:gap-y-10 lg:gap-x-12 lg:gap-y-14">
          {owners.map((owner) => {
            const initials =
              owner.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("") || "EM";
            const clipPathId = `${idPrefix}-${owner.id}-clip`;

            return (
              <article
                key={owner.id}
                className="mx-auto w-full min-w-0 max-w-[34rem] pb-2"
              >
                <div className="relative aspect-[5/6] w-full min-w-0">
                  <div
                    className="absolute inset-0 overflow-hidden bg-[#e7e4dc]"
                    style={{
                      clipPath: `url(#${clipPathId})`,
                      WebkitClipPath: `url(#${clipPathId})`,
                    }}
                  >
                    {owner.photo_url ? (
                      <Image
                        src={owner.photo_url}
                        alt={owner.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                        sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 44vw, 34rem"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`Portrait of ${owner.name} not available`}
                        className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#eeeae1,#d7d5ce)] text-4xl font-semibold tracking-[0.12em] text-[var(--brand-navy)] sm:text-5xl"
                      >
                        <span
                          aria-hidden="true"
                          className="border border-[#0e625d]/35 px-5 py-4"
                        >
                          {initials}
                        </span>
                      </div>
                    )}
                  </div>

                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                    viewBox="0 0 500 600"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                        <path d={portraitClipPath} />
                      </clipPath>
                    </defs>
                    <path
                      d={portraitPath}
                      fill="none"
                      stroke="#0e625d"
                      strokeWidth="6"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                <div className="relative z-10 mx-auto -mt-10 w-[calc(100%-0.75rem)] min-w-0 border border-white/10 bg-[var(--brand-navy)] px-3 pb-4 pt-7 shadow-[0_18px_45px_rgba(9,25,35,0.2)] [border-radius:1.25rem_0.35rem_1.25rem_0.35rem] min-[360px]:w-[calc(100%-1rem)] min-[360px]:px-4 min-[360px]:pb-5 min-[360px]:pt-8 min-[430px]:w-[calc(100%-1.5rem)] min-[430px]:px-5 sm:-mt-16 sm:w-[calc(100%-2rem)] sm:px-6 sm:pb-6 sm:pt-9 md:-mt-20 md:w-[calc(100%-2.5rem)] md:px-8 md:pb-8 lg:-mt-24 lg:w-[calc(100%-4rem)] lg:px-8 lg:pb-8 lg:pt-10">
                  <span className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-center rounded-sm border border-[#80d5d1]/40 bg-[#0e625d] px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm min-[360px]:px-3 min-[360px]:text-[0.56rem] sm:px-4 sm:py-1.5 sm:text-[0.62rem]">
                    Owner
                  </span>
                  <h3 className="mt-3 max-w-full break-words text-[clamp(1.05rem,3vw,2.1rem)] font-semibold leading-[1.08] text-white sm:mt-4">
                    {owner.name}
                  </h3>
                  {owner.title ? (
                    <p className="mt-2 max-w-full break-words text-[clamp(0.7rem,2.2vw,1rem)] font-semibold tracking-[0.04em] text-[#80d5d1]">
                      {owner.title}
                    </p>
                  ) : null}
                  {owner.bio ? (
                    <p className="mt-3 max-w-full break-words text-[clamp(0.7rem,2.2vw,0.96rem)] leading-[1.6] text-white/75 sm:mt-4 sm:leading-[1.8]">
                      {owner.bio}
                    </p>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="mt-4 block h-0.5 w-9 bg-[#39b7ae] sm:mt-6 sm:w-12"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
