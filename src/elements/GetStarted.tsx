import { createSignal } from "solid-js";

const INSTALL_COMMAND = "curl -fsSL https://www.jexpanel.com/install.sh | bash";

function GetStarted() {
  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (e.g. insecure context) - fail silently
    }
  };

  return (
    <div class="mt-6">
      <p class="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">Get started</p>
      <button
        type="button"
        onClick={copy}
        title="Copy to clipboard"
        class="group flex w-full items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-left transition hover:border-green-400/60 hover:bg-slate-800"
      >
        <code class="overflow-x-auto font-mono text-sm text-green-400 whitespace-nowrap">
          <span class="mr-2 select-none text-slate-500">$</span>
          {INSTALL_COMMAND}
        </code>
        <span class="shrink-0 text-slate-400 group-hover:text-white">
          {copied() ? (
            <span class="flex items-center gap-1 text-xs font-medium text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4">
                <path d="M4.5 12.75l6 6 9-13.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Copied!
            </span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5">
              <path d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3a2.25 2.25 0 0 0-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.926.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}

export default GetStarted;
