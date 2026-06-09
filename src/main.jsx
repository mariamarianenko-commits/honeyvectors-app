// HoneyVectors — Vite entry point.
// Styles first, then the marketing-kit modules (each assigns its components to
// `window` as a side effect), then mount the page.
import "./styles.css";       // design-system tokens + base (pulls tokens/* + components.css)
import "./site.css";         // marketing-site layout + animations

import "./site-kit.jsx";     // all components (anim + intro + top + mid + bottom), published on window

import { createRoot } from "react-dom/client";

const A = "/assets/images/";
const TEX = "/assets/textures/";
const VIDEO = "/assets/videos/hero-bg.mp4";

function Site() {
  // Components are published on `window` by the imported modules above.
  const {
    HexCursor, HiveLoader, Hero, LeakMaturity,
    Diagnosis, LeakAnatomy, Tech, Proof, FinalCTA, Footer,
  } = window;

  const [loading, setLoading] = React.useState(true);

  return (
    <div className="site">
      <HexCursor />
      {loading && <HiveLoader onComplete={() => setLoading(false)} />}
      <Hero bg={TEX + "hex-field-3d.jpg"} video={VIDEO} />
      <LeakMaturity leaksImg={A + "leaks-laptop.png"} />
      <Diagnosis />
      <LeakAnatomy />
      <Tech video={VIDEO} poster={TEX + "hex-field-3d.jpg"} />
      <Proof
        imgs={[
          A + "story-1.jpg",
          A + "story-honey-drip.jpg",
          A + "story-2.jpg",
          A + "story-broken-site.jpg",
          A + "story-girl-down.jpg",
          A + "story-leak-1.jpg",
          A + "story-3.jpg",
          A + "story-4.jpg",
        ]}
      />
      <FinalCTA />
      <Footer />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Site />);
