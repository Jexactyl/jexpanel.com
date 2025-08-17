import { createSignal, onCleanup, onMount, For } from "solid-js";
import ConsolePng from '../assets/console.png';
import ModesPng from '../assets/modes.png';
import BillingPng from '../assets/billing.png';
import FilesPng from '../assets/files.png';

function Carousel() {
  const images = [
    ConsolePng,
    ModesPng,
    BillingPng,
    FilesPng,
  ];

  const [currentIndex, setCurrentIndex] = createSignal(0);
  let intervalId: any;

  onMount(() => {
    intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // change every 5s
  });

  onCleanup(() => clearInterval(intervalId));

  return (
    <div class="relative w-full h-[400px] overflow-hidden rounded-2xl shadow-[0_0_120px_60px_rgba(0,0,0,0.8)]">
      <For each={images}>
        {(img, i) => (
          <img
            src={img}
            class={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              i() === currentIndex() ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </For>
    </div>
  );
}

export default Carousel;
