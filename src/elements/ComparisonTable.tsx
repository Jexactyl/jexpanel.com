import { HiSolidCheck, HiSolidXMark } from "solid-icons/hi";
import { For } from "solid-js";

interface Comparison {
    name: string;
    values: {
        jex: boolean;
        ptero: boolean;
        pelican: boolean;
        puffer: boolean;
    }
}

const comparisons: Comparison[] = [
    { name: 'Modern UI', values: { jex: true, ptero: true, pelican: true, puffer: true } },
    { name: 'OAuth', values: { jex: true, ptero: false, pelican: true, puffer: false } },
    { name: 'CAPTCHA security', values: { jex: true, ptero: true, pelican: true, puffer: false } },
    { name: 'Billing System', values: { jex: true, ptero: false, pelican: false, puffer: false } },
    { name: 'Ticket System', values: { jex: true, ptero: false, pelican: false, puffer: false } },
    { name: 'User Registration', values: { jex: true, ptero: false, pelican: false, puffer: false } },
    { name: 'Admin Role Management', values: { jex: true, ptero: false, pelican: true, puffer: false } },
    { name: 'Announcements', values: { jex: true, ptero: false, pelican: false, puffer: false } },
    { name: 'Theme System', values: { jex: true, ptero: false, pelican: false, puffer: true } },
    { name: 'Automatic Updates', values: { jex: true, ptero: false, pelican: true, puffer: false } },
    { name: 'Admin Activity Logs', values: { jex: true, ptero: false, pelican: false, puffer: false } },
]

// Fixed, compact columns on phones; the original roomy layout from sm upwards.
const ROW = 'grid grid-cols-[8.5rem_repeat(4,5.5rem)] gap-x-4 text-sm sm:grid-cols-5 sm:gap-x-16';
// Pins the feature-name column while the rest of the table scrolls on phones.
const STICKY = 'sticky left-0 z-10 -ml-4 pl-4 sm:static sm:ml-0 sm:pl-0';

function ComparisonTable() {
    //

    return (
        <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            {/* On phones the table scrolls sideways with the feature column pinned */}
            <p class="mb-2 text-xs text-gray-400 sm:hidden">Swipe to compare all panels →</p>
            <div id="detailed-pricing" class="w-full overflow-x-auto">
                <div class="min-w-max">
                    <div class={`${ROW} p-4 font-medium text-gray-900 bg-gray-100 border-t border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white`}>
                        <div class={`${STICKY} flex items-center bg-gray-100 dark:bg-gray-800`}>Feature</div>
                        <div class="text-green-400 font-bold">Jex</div>
                        <div>Pterodactyl</div>
                        <div>Pelican</div>
                        <div>PufferPanel</div>
                    </div>
                    {comparisons.map(comparison => (
                        <div class={`${ROW} px-4 py-5 text-gray-700 border-b border-gray-200 dark:border-gray-700`}>
                            <div class={`${STICKY} bg-slate-950 text-gray-500 dark:text-gray-400`}>{comparison.name}</div>
                            <For each={Object.entries(comparison.values)}>
                                {([_panel, hasFeature]) => (
                                    <div>
                                        {hasFeature ? (
                                            <HiSolidCheck class="text-green-400 w-4 h-4" />
                                        ) : (
                                            <HiSolidXMark class="text-red-400 w-4 h-4" />
                                        )}
                                    </div>
                                )}
                            </For>
                        </div>
                    ))}
                </div>
            </div>
            <p class={'text-sm text-gray-400 italic mt-2 text-right'}>
                Accurate as of 08/21/2025
            </p>
        </div>
    );
};

export default ComparisonTable;
