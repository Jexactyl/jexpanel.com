import { createSignal, onCleanup, onMount } from "solid-js";
import Carousel from "./elements/Carousel";
import Feature from "./elements/Feature";
import BillingPng from './assets/billing.png';
import ThemePng from './assets/theme.png';
import ConsolePng from './assets/console.png';
import { HiOutlineCurrencyEuro, HiOutlineHeart, HiOutlinePaintBrush, HiOutlinePuzzlePiece, HiOutlineReceiptPercent, HiOutlineStar, HiOutlineUsers } from 'solid-icons/hi';
import ComparisonTable from "./elements/ComparisonTable";
import VersionDialog from "./elements/VersionDialog";
import GetStarted from "./elements/GetStarted";
import FalconBanner from "./elements/FalconBanner";

function App() {
  const words = ["users", "billing", "deployment", "payments", "tickets", "servers", "games"];

  const [displayed, setDisplayed] = createSignal("");

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let intervalId: any;

  // adjust speeds here
  const typingSpeed = 100;   // ms per character
  const deletingSpeed = 60;  // ms per character
  const pauseTime = 1000;    // ms pause before deleting

  const type = () => {
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // typing forward
      setDisplayed(currentWord.substring(0, charIndex + 1));
      charIndex++;

      if (charIndex === currentWord.length) {
        // pause before deleting
        clearInterval(intervalId);
        setTimeout(() => {
          isDeleting = true;
          intervalId = setInterval(type, deletingSpeed);
        }, pauseTime);
      }
    } else {
      // deleting backward
      setDisplayed(currentWord.substring(0, charIndex - 1));
      charIndex--;

      if (charIndex === 0) {
        // move to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        clearInterval(intervalId);
        intervalId = setInterval(type, typingSpeed);
      }
    }
  };

  onMount(() => {
    intervalId = setInterval(type, typingSpeed);
  });

  onCleanup(() => clearInterval(intervalId));

  return (
    <div class={'bg-slate-950'}>
      <div class="relative min-h-screen lg:h-[90vh]">
        <div class="absolute inset-0">
          <div class="relative h-full w-full bg-slate-950 [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [&>div]:bg-[size:14px_24px] [&>div]:[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
            <div></div>
          </div>
        </div>
        <div class={'text-white flex flex-col justify-center py-24 lg:h-full lg:grid lg:grid-cols-2 lg:py-0 px-4 lg:px-[10%]'}>
          {/* Left side */}
          <div class="relative z-10 flex items-center px-4">
            <div class="max-w-5xl">
              <div class="w-full sm:w-3/4 p-3 mb-4 text-xs rounded-lg bg-gray-800/50 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
                <div><span class="text-green-400 font-bold mr-1">New Release</span> <code>v4.0.0-rc1</code> is now available.</div>

                <a href={'https://github.com/jexactyl/jexactyl/releases/v4.0.0-rc1'} class={'text-blue-500'}>Learn More {'>'}</a>
              </div>
              <h1 class="mb-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-5xl text-white">
                Jex handles your
                <span class="text-green-400 ml-4">
                  {displayed()}
                  <span class="border-r-2 border-white animate-pulse ml-1"></span>
                </span>
              </h1>
              <p class="mx-auto mb-4 max-w-2xl text-sm text-slate-300">
                Jex is a free, open source management web application which can manage users, deploy servers and
                capture payments. All in one quick, customizable and beautiful UI which takes minutes to configure.
                Designed based on the Pterodactyl Project.
              </p>
              <div class="flex flex-wrap gap-4">
                <VersionDialog />
                <a href={'https://github.com/jexactyl/jexactyl'} class="rounded-lg border px-4 py-2 font-medium border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                  <HiOutlineStar class={'inline-flex mb-1 mr-1'} /> Star on GitHub
                </a>
                <a href={'https://discord.gg/qttGR4Z5Pk'} class="rounded-lg border px-4 py-2 font-medium border-slate-700 bg-blue-800 text-white hover:bg-slate-700">
                  <HiOutlineUsers class={'inline-flex mb-1 mr-1'} /> Join our Discord
                </a>
              </div>
              <GetStarted />
            </div>
          </div>

          {/* Right side with vertical centering */}
          <div class="hidden xl:flex items-center justify-center">
            <Carousel />
          </div>
        </div>
      </div>
        <div class={'bg-slate-950 py-16 lg:py-0'}>
          <div class="mx-auto px-6 lg:px-8">
            <div class="mx-auto max-w-4xl lg:text-center">
              <h2 class="text-base/7 font-semibold text-green-400">Our Features</h2>
              <p class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl lg:text-balance">Make your <span class={'text-sm tracking-tight'}>( and your users' )</span> life easier.</p>
              <p class="mt-4 text-lg/8 text-gray-300">Jex features several improvements over traditional game panels, while improving performance and usability.</p>
            </div>
            <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
              <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                <div class="relative pl-16">
                  <dt class="text-base/7 font-semibold text-white">
                    <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 text-white">
                        <path d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    Frequent Updates & Feature Drops
                  </dt>
                  <dd class="mt-2 text-base/7 text-gray-400">Unlike most outdated panels, Jex has frequent security patches and new features added to improve all factors of the application. Updates can be handled automatically, or installed when it suits you. Simple!</dd>
                </div>
                <div class="relative pl-16">
                  <dt class="text-base/7 font-semibold text-white">
                    <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 text-white">
                        <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    Secure data protection
                  </dt>
                  <dd class="mt-2 text-base/7 text-gray-400">
                    Jex uses the latest dependencies and best security practices in order to keep your data secure. Data is never collected by first or third-parties,
                    and cannot physically be accessed outside of your local database for peace of mind.
                  </dd>
                </div>
                <div class="relative pl-16">
                  <dt class="text-base/7 font-semibold text-white">
                    <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 text-white">
                        <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    Migrate Your Data from Pterodactyl
                  </dt>
                  <dd class="mt-2 text-base/7 text-gray-400">Jex&apos;s codebase is designed to easily migrate all data from Pterodactyl, Pelican and more - transferring over to Jex couldn&apos;t be easier. Or don&apos;t bother. We don&apos;t really care.</dd>
                </div>
                <div class="relative pl-16">
                  <dt class="text-base/7 font-semibold text-white">
                    <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-green-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 text-white">
                        <path d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    OAuth SSO Functions
                  </dt>
                  <dd class="mt-2 text-base/7 text-gray-400">Users can register and login with providers such as Discord&trade; and Google&trade; for seamless authentication, meaning no sensitive login data is stored in the database.</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <Feature
          image={BillingPng}
          tag={'Introduced with v4.0.0-rc1'}
          title={'Enhanced Billing'}
          subfeatures={[
            {
              icon: HiOutlineReceiptPercent,
              title: 'Automatic Billing',
              description: 'Jex allows users to renew their servers via the payment method of their choice, which they must do every 30 days to keep their server active.'
            },
            {
              icon: HiOutlineCurrencyEuro,
              title: 'Free Packages',
              description: 'Admins have the option of making packages free, for users who do not wish to purchase a paid plan. However, the user can upgrade to an available paid plan anytime.'
            }
          ]}
          description={'Jex features a thorough, secure and powerful billing system which can be used to handle new and renewing servers on a monthly basis.'}
        />
        <Feature
          image={ThemePng}
          tag={'Introduced with v4.0.0-rc1'}
          title={'Customizable Themes'}
          subfeatures={[
            {
              icon: HiOutlinePaintBrush,
              title: 'On-The-Fly Editing',
              description: 'Jex allows admins to instantly change theme options without having to make any code changes or recompile the UI for ease of use.'
            },
            {
              icon: HiOutlinePuzzlePiece,
              title: 'Extensible',
              description: 'The UI, written in React TypeScript with TailwindCSS, is easy to modify and update with changes that suit your needs better.'
            }
          ]}
          description={'Jex features a thorough, secure and powerful billing system which can be used to handle new and renewing servers on a monthly basis.'}
        />
        <div class={'bg-slate-950'}>

          <div class="mx-auto max-w-4xl lg:text-center">
            <h2 class="text-base/7 font-semibold text-green-400">Compare Jex</h2>
            <p class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl lg:text-balance">What&apos;s in it for you</p>
            <p class="mt-4 text-lg/8 text-gray-300">Check our comparison table to see the differences between Jex Panel and the competition.</p>
          </div>
          <ComparisonTable />
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FalconBanner />
          </div>
          <div class="mx-auto max-w-7xl py-24 sm:px-6 lg:px-8">
            <div class="relative isolate overflow-hidden bg-slate-900 px-6 pt-16 after:pointer-events-none after:absolute after:inset-0 after:inset-ring after:inset-ring-white/10 sm:rounded-3xl sm:px-16 after:sm:rounded-3xl md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
              <svg viewBox="0 0 1024 1024" aria-hidden="true" class="absolute top-1/2 left-1/2 -z-10 size-256 -translate-y-1/2 mask-[radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0">
                <circle r="512" cx="512" cy="512" fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fill-opacity="0.7" />
                <defs>
                  <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                    <stop stop-color="#2C7610" />
                    <stop offset="1" stop-color="#59BB34" />
                  </radialGradient>
                </defs>
              </svg>
              <div class="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                <h2 class="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">Boost your sales, service and performance with Jex.</h2>
                <p class="mt-6 text-lg/8 text-pretty text-gray-300">Follow our documentation to get Jex installed in under 15 minutes, with optional migration of your data.</p>
                <div class="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                  <a href="https://docs.jexpanel.com" class="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"> Get started </a>
                </div>
              </div>
              <div class="relative mt-16 h-80 lg:mt-8">
                <img width="1824" height="1080" src={ConsolePng} alt="App screenshot" class="absolute top-0 left-0 w-228 max-w-none rounded-md bg-white/5 ring-1 ring-white/10" />
              </div>
            </div>
          </div>
        </div>
        <div class="bg-slate-900">
          <div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
            <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">A project made with <HiOutlineHeart class={'inline-flex'} /> by <a class={'text-blue-500'} href={'https://github.com/camwhi-te'}>Cam White</a>
            </span>
            <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
              <li>
                <a href="https://github.com/jexactyl" class="hover:underline me-4 md:me-6">GitHub</a>
              </li>
              <li>
                <a href="https://discord.gg/qttGR4Z5Pk" class="hover:underline me-4 md:me-6">Discord</a>
              </li>
              <li>
                <a href="https://docs.jexpanel.com" class="hover:underline me-4 md:me-6">Docs</a>
              </li>
              <li>
                <a href="mailto:cam@jexpanel.com" class="hover:underline">Contact</a>
              </li>
            </ul>
          </div>
        </div>

    </div>
  )
}

export default App
