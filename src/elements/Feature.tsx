import { type IconTypes } from "solid-icons";

interface FeatureProps {
    tag: string;
    title: string;
    description: string;
    image: string;
    subfeatures?: SubFeatureProps[];
}

interface SubFeatureProps {
    icon: IconTypes;
    title: string;
    description: string;
}

function Feature({ tag, title, description, image, subfeatures }: FeatureProps) {
    return (
        <div class="overflow-hidden bg-slate-950 py-24 sm:py-32">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div class="lg:pt-4 lg:pr-8">
                        <div class="lg:max-w-lg">
                            <h2 class="text-base/7 font-semibold text-green-400">{tag}</h2>
                            <p class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">{title}</p>
                            <p class="mt-6 text-lg/8 text-gray-300">{description}</p>
                            <dl class="mt-6 max-w-xl space-y-4 text-base/7 text-gray-400 lg:max-w-none">
                                {subfeatures?.map((subfeature) => {
                                    const IconComp = subfeature.icon;
                                    return (
                                        <div class="relative">
                                            <div class="inline-flex items-center gap-2 font-semibold text-white">
                                                <IconComp class="w-4 h-4 text-green-400" />
                                                {subfeature.title}
                                            </div>
                                            <div class="text-gray-300 font-normal text-sm">{subfeature.description}</div>
                                        </div>
                                    )
                                })}
                            </dl>
                        </div>
                    </div>
                    <img src={image} class="w-full rounded-xl shadow-xl lg:w-228 lg:max-w-none" />
                </div>
            </div>
        </div>
    )
}

export default Feature;
