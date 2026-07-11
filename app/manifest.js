// Generates /manifest.webmanifest. This is what lets phones "install" the site
// to the home screen with the Peterson icon, a proper name, and app-like
// (standalone) display. Next.js automatically adds the manifest <link>.
export default function manifest() {
  return {
    name: "Peterson Family Hub",
    short_name: "Family Hub",
    description: "One shared calendar for every generation of the Peterson family.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f1",
    theme_color: "#202a41",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}
