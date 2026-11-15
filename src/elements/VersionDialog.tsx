import Dialog from '@corvu/dialog'
import type { VoidComponent } from 'solid-js'
import v4Svg from '../assets/v4.svg';
import v3Svg from '../assets/v3.svg';
import { HiOutlineArrowRight, HiOutlineXMark, HiSolidStar } from 'solid-icons/hi';

const VersionDialog: VoidComponent = () => {
    return (
        <Dialog>
            <Dialog.Trigger class="rounded-lg px-4 py-2 font-medium bg-green-400 text-slate-900 hover:bg-green-300">
                Get Started
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0% data-closed:animate-out data-closed:fade-out-0%" />
                <Dialog.Content class="text-white fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border-2 border-slate-700 bg-slate-800 px-4 py-4 sm:px-6 sm:py-5 data-open:animate-in data-open:fade-in-0% data-open:zoom-in-95% data-open:slide-in-from-top-10% data-closed:animate-out data-closed:fade-out-0% data-closed:zoom-out-95% data-closed:slide-out-to-top-10%">
                    <div class="flex items-start justify-between gap-4">
                        <Dialog.Label class="text-lg font-bold">
                            Choose Software Version
                        </Dialog.Label>
                        <Dialog.Close
                            aria-label="Close"
                            class="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                        >
                            <HiOutlineXMark class="size-5" />
                        </Dialog.Close>
                    </div>
                    <Dialog.Description class="grid lg:grid-cols-2 gap-6 mt-2">
                        <p class={'lg:col-span-2'}>Choose a version of Jexpanel you wish to use for installation.</p>
                        <div class={'relative bg-black/50 rounded-lg shadow-xl p-4'}>
                            <div class={'absolute top-0 right-0 p-3 text-sm text-gray-400 bg-black rounded-bl-xl'}>
                                <HiSolidStar class={'inline-flex text-yellow-500'} /> Recommended
                            </div>
                            <img src={v4Svg} class={'w-full p-6 sm:p-12'} />
                            <p class={'text-xl lg:text-3xl font-semibold'}>Version 4.0.0 <span class="text-gray-400 text-sm">(latest, recommended)</span></p>
                            <p class="text-sm text-green-100">The latest version with brand new features and functions.</p>
                            <div class={'w-full flex justify-end'}>
                                <a href={'https://docs.jexpanel.com'} class="mt-4 rounded-lg border px-4 py-2 font-medium border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                                    <HiOutlineArrowRight class={'inline-flex mb-1 mr-1'} /> View Documentation
                                </a>
                            </div>
                        </div>
                        <div class={'bg-black/25 rounded-lg shadow-xl p-4'}>
                            <img src={v3Svg} class={'w-full p-6 sm:p-12'} />
                            <p class={'text-xl lg:text-3xl font-semibold'}>Version 3.7.4 <span class="text-gray-400 text-sm">(stable)</span></p>
                            <p class="text-sm text-green-100">The most stable version of Jexactyl with tried and tested features.</p>
                            <div class={'w-full flex justify-end'}>
                                <a href={'https://docs.jexactyl.com'} class="mt-4 rounded-lg border px-4 py-2 font-medium border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                                    <HiOutlineArrowRight class={'inline-flex mb-1 mr-1'} /> View Documentation
                                </a>
                            </div>
                        </div>
                    </Dialog.Description>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    )
}

export default VersionDialog;
