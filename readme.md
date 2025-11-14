# 👾 Welcome to CS Girlies Hackathon Repo! 👾

Ready for some pixel-powered learning and adventure?  
Let’s hit **Start** and see what this project is packing under the hood…

---

## 🚀 The Stack

### **Frontend First!**
Built on **ReactJS** (with Vite for speed and TailwindCSS for style).  
Here’s the super-fast, no-nonsense install:

npm create vite@latest frontend

Pick: React → JavaScript → [smash Enter until you name it "frontend"]



### **Essential Power-Ups:**
Install these for full feature mode:
npm install react-router-dom
npm install lucide-react
npm install @tsparticles/react @tsparticles/engine @tsparticles/slim


And for **Tailwind magic:**

npm install -D @tailwindcss/postcss
npm install -D tailwindcss postcss autoprefixer

text

You’ll also create `postcss.config.js` and `tailwind.config.js` (don’t skip these!), then wire up Tailwind in your `index.css` – boom, done, let’s get creative!

---

## 🗂️ Folder Map

- **components/** – Reusable pieces for layout and game bits.
- **pages/** – Where cool things happen (main views).
- **assets/**
    - **img/** → Character sprites, backgrounds, all your visual loot.
    - **map/** → JSON files from **Tiled**. Make your own pixel maps, paint collision zones (like “red” for barriers), export as JSON and drop them here.

_Yes, you can use Tiled to create not just images, but smart maps that the code reads: red zones = “no-go”, other colors can trigger events, popups, whatever you want!_

---

## 🎮 Game Concept

- **Start Screen:** Pick your character, hit start, and you appear centered on the map.
- **Characters:** Each direction (front/back/left/right) has its own sprite, so your player walks and animates like a classic RPG. NPCs (like your sister) can have their own little animation cycles!
- **Map Zones:** The world is built from “blocks”—each is a color. Example: Stepping up to a yellow tile might deliver a boost of inspiration. Pink/blue, etc. can do anything.  
  **Red zones?** Invisible walls, no trespassing!
- **Interaction:** Hit 'E' by different spots to trigger advice, jokes, or, uh, sisterly scolding.
- **Camera:** Always follows your character, keeping the action centered—nostalgia pixel-style!

---

## 🤩 Why It’s Cool

- Choose your hero (girl-powered pixel style!).
- Animations, maps, and classic color-coded interaction zones.
- JSON-powered layouts, so *anyone* with Tiled can make new levels.
- Built with modern tools, easy to expand.

---

So what are you waiting for?  
🎉 Hack, code, build, and may your repo **Level Up!** 🎉

---

<sup>Any questions? Try the 'E' key in the game or read the code for more surprises!</sup>