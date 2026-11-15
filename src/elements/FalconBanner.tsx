import { createSignal, For } from "solid-js";
import LogoSvg from '../assets/falconhosting/logo.svg';
import MarkSvg from '../assets/falconhosting/mark.svg';
import WingsNodeSvg from '../assets/falconhosting/wings-node.svg';

// Partner offer: Falcon Hosting budget VPS for running Wings.
// Update OFFER_URL / PROMO_CODE here if the offer changes.
const OFFER_URL =
  'https://falconhosting.co.uk/vps?utm_source=jexpanel.com&utm_medium=referral&utm_campaign=jexpanel&discount_code=JEX20&tier=budget';
const PROMO_CODE = 'JEX20';

const FEATURES = [
  'KVM, so Docker just works',
  'Dedicated IPv4',
  'Path.net DDoS protection',
  'UK data centre',
];

// Colours are taken from falconhosting.co.uk's own palette.
const BANNER_BACKGROUND = [
  'radial-gradient(520px at 0% 0%, rgba(57, 116, 238, 0.28), transparent 60%)',
  'radial-gradient(480px at 100% 100%, rgba(123, 175, 255, 0.16), transparent 60%)',
  'linear-gradient(rgba(123, 175, 255, 0.05) 1px, transparent 1px)',
  'linear-gradient(90deg, rgba(123, 175, 255, 0.05) 1px, transparent 1px)',
].join(', ');

function FalconBanner() {
  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (e.g. insecure context) - the code is visible anyway
    }
  };

  return (
    <aside
      aria-label="Partner offer from Falcon Hosting"
      class="group/banner relative isolate grid grid-cols-1 items-center gap-6 overflow-hidden rounded-2xl border border-[#2b3a50] bg-[#0c1524] p-6 text-[#edf2fa] shadow-[0_18px_40px_-24px_rgba(12,21,36,0.9)] transition-colors has-[a:hover]:border-[#7bafff]/45 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:px-9"
      style={{ 'background-image': BANNER_BACKGROUND, 'background-size': 'auto, auto, 28px 28px, 28px 28px' }}
    >
      {/* Oversized falcon mark, faded, as a background decal */}
      <img
        src={MarkSvg}
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute -right-[30%] -bottom-[22%] -z-10 w-[110%] max-w-[560px] -rotate-[8deg] opacity-5 select-none sm:-right-[6%] sm:w-[62%]"
      />

      <div class="min-w-0">
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <img src={LogoSvg} alt="Falcon Hosting" class="block h-[26px] w-auto" />
          <span class="rounded-full border border-[#7bafff]/35 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.16em] text-[#a6caff] uppercase">
            Partner offer
          </span>
        </div>

        <h2 class="font-falcon mb-2.5 text-2xl leading-tight font-bold tracking-tight text-[#edf2fa] sm:text-3xl">
          Host your Wings node on a <span class="text-[#7bafff]">budget UK VPS</span>
        </h2>
        <p class="mb-4 max-w-xl text-[0.95rem] leading-relaxed text-[#a2b0c4]">
          Falcon Hosting's Budget VPS plans start from <strong class="text-[#edf2fa]">£3.49/month</strong>,
          with full root access and 1&nbsp;Gbps unmetered bandwidth: a solid, affordable base for your Wings node.
        </p>

        <ul class="mb-6 flex flex-wrap gap-1.5">
          <For each={FEATURES}>
            {(feature) => (
              <li class="rounded-full border border-[#2b3a50] bg-[#152134]/80 px-2.5 py-1 text-xs">
                <span class="mr-1.5 font-bold text-[#7bafff]">✓</span>
                {feature}
              </li>
            )}
          </For>
        </ul>

        <div class="flex flex-wrap items-center gap-3">
          {/* The ::after overlay stretches this link over the whole banner */}
          <a
            href={OFFER_URL}
            target="_blank"
            rel="noopener sponsored"
            class="group/cta inline-flex h-11 items-center gap-2 rounded-[0.625rem] bg-[#2459db] px-5 font-semibold whitespace-nowrap text-white transition-colors after:absolute after:inset-0 after:z-10 hover:bg-[#1948bc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7bafff]"
          >
            View budget VPS plans
            <span aria-hidden="true" class="transition-transform group-hover/cta:translate-x-0.5">→</span>
          </a>

          {/* Coupon "ticket", above the stretched link so Copy still works */}
          <div class="relative z-20 inline-flex h-11 items-center gap-2.5 rounded-[0.625rem] border-[1.5px] border-dashed border-[#7bafff] bg-[#2459db]/15 pr-1.5 pl-3.5 before:absolute before:top-1/2 before:-left-1.5 before:size-2.5 before:-translate-y-1/2 before:rounded-full before:border-r-[1.5px] before:border-dashed before:border-[#7bafff] before:bg-[#0c1524] after:absolute after:top-1/2 after:-right-1.5 after:size-2.5 after:-translate-y-1/2 after:rounded-full after:border-l-[1.5px] after:border-dashed after:border-[#7bafff] after:bg-[#0c1524]">
            <span class="text-[0.7rem] font-bold tracking-[0.12em] whitespace-nowrap text-[#a6caff] uppercase">20% off</span>
            <code class="font-mono text-lg font-bold tracking-[0.12em] text-white">{PROMO_CODE}</code>
            <button
              type="button"
              onClick={copy}
              aria-label={`Copy code ${PROMO_CODE}`}
              class="h-8 cursor-pointer rounded-md border border-[#2b3a50] bg-[#152134] px-2.5 text-xs font-semibold text-[#edf2fa] transition-colors hover:bg-[#1a2940] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7bafff]"
            >
              {copied() ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div aria-hidden="true" class="order-first hidden justify-center sm:flex lg:order-none">
        <img src={WingsNodeSvg} alt="" class="block h-auto w-full max-w-[320px] lg:max-w-[440px]" />
      </div>
    </aside>
  );
}

export default FalconBanner;
