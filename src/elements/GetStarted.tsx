import { createSignal } from "solid-js";
import Dialog from "@corvu/dialog";
import FalconBanner from "./FalconBanner";

const INSTALL_COMMAND = "curl -fsSL https://www.jexpanel.com/install.sh | bash";

function GetStarted() {
  const [copied, setCopied] = createSignal(false);
  const [copyFailed, setCopyFailed] = createSignal(false);
  // Falcon Hosting partner dialog: shown after the first copy only, not on every click
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [dialogShown, setDialogShown] = createSignal(false);
  const [closeButton, setCloseButton] = createSignal<HTMLElement>();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (e.g. insecure context) - the dialog shows the command instead
      setCopyFailed(true);
    }

    if (!dialogShown()) {
      setDialogShown(true);
      setDialogOpen(true);
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
        <code class="min-w-0 overflow-x-auto font-mono text-sm text-green-400 whitespace-nowrap">
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

      <Dialog open={dialogOpen()} onOpenChange={setDialogOpen} initialFocusEl={closeButton()}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 z-50 bg-black/60 data-open:animate-in data-open:fade-in-0% data-closed:animate-out data-closed:fade-out-0%" />
          <Dialog.Content class="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-2 border-slate-700 bg-slate-900 p-4 text-white sm:p-6 data-open:animate-in data-open:fade-in-0% data-open:zoom-in-95% data-open:slide-in-from-top-10% data-closed:animate-out data-closed:fade-out-0% data-closed:zoom-out-95% data-closed:slide-out-to-top-10%">
            <div class="mb-4 flex items-start justify-between gap-4">
              <div class="min-w-0">
                <Dialog.Label class="flex items-center gap-2 text-lg font-bold">
                  {copyFailed() ? (
                    'Copy the install command'
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5 text-green-400" aria-hidden="true">
                        <path d="M4.5 12.75l6 6 9-13.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      Install command copied
                    </>
                  )}
                </Dialog.Label>
                <Dialog.Description class="mt-1 text-sm text-slate-400">
                  Paste it into your server's terminal as <code class="text-green-400">root</code>. Don't have a server for your Wings node yet?
                </Dialog.Description>
                {copyFailed() && (
                  <code class="mt-3 block overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm whitespace-nowrap text-green-400 select-all">
                    {INSTALL_COMMAND}
                  </code>
                )}
              </div>
              <Dialog.Close
                ref={setCloseButton}
                aria-label="Close"
                class="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5" aria-hidden="true">
                  <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </Dialog.Close>
            </div>
            <FalconBanner />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
}

export default GetStarted;
