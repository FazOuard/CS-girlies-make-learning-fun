# Hello Welcome to the cs girlies repo hackathon <br />
The hackathon aim is to make learning fun, so I decided to create a video game that uses LLM to understand the user's notes. 


I'm going to explain to you what packages I used, how I made it work and the concept behind my code. <br />

## **Frontend First!**
Built on **ReactJS** (with Vite for speed and TailwindCSS for style).  
Here’s the super-fast, no-nonsense install:

```bash
npm create vite@latest frontend
```

Pick: React → JavaScript → [smash Enter until you name it "frontend"]



### **Essential Power-Ups:**
Once you get into the "frontend" folder with:
```bash
cd ./frontend
```
Install these for full feature mode:
```bash
npm install react-router-dom
npm install lucide-react
npm install @tsparticles/react @tsparticles/engine @tsparticles/slim
```

And for **Tailwind magic:**
```bash
npm install -D @tailwindcss/postcss
npm install -D tailwindcss postcss autoprefixer
```
text

You’ll also create `postcss.config.js` and `tailwind.config.js` (don’t skip these!), then wire up Tailwind in your `index.css` – boom, done, let’s get creative!

---

###  Folder Map

- **components/** – Reusable pieces for layout and game bits.
- **pages/** – Where cool things happen (main views).
- **assets/**
    - **img/** → Character sprites, backgrounds, all your visual loot.
    - **map/** → JSON files from **Tiled**. Make your own pixel maps, paint collision zones (like “red” for barriers), export as JSON and drop them here.


_The link to the pixel art and icons, I used, is : https://kamisama887.itch.io/lorenz-fries-school-horror_

---

###  Game Concept

- **Start Screen:** Pick your character, hit start, and you appear centered on the map.
- **Characters:** Each direction (front/back/left/right) has its own sprite, so your player walks and animates like a classic RPG. NPCs (like your sister) can have their own little animation cycles!
- **Map Zones:** The world is built from “blocks”—each is a color. Example: Stepping up to a yellow tile might deliver a boost of inspiration. Pink/blue, etc. can do anything.  
  **Red zones?** Invisible walls, no trespassing!
- **Interaction:** Hit 'E' by different spots to trigger advice, jokes, or, uh, sisterly scolding.
- **Camera:** Always follows your character, keeping the action centered—nostalgia pixel-style!


Same goes for the rest of the frontend pages: The character's house, the library and the forest.



- **The header:**
The header is composed of the XP levels which get added when the user achieves some operations. When the bar is completed the level goes up. I added this category because it will let the user get more attracted to using the game.


## **Now the Backend!**
The backend magic is run with Flask, which acts as the API for my Python code. All main logic sits inside the `controllers` folder. The main Flask app file (`app.py`) handles routes, the port, and global setup.

**First things first:**

Start by getting into the backend folder:
```bash
cd backend
```

Set up a virtual environment (I called it "venv"):


```bash
python -m venv venv 
```

Activate the Scripts inside your venv environment, so you can install Python packages and run different Python files:


```bash
./venv/Scripts/activate
```


Now, about the LLM:  
There are two main ways to get the language model talking to your backend.  
- **Option 1:** You can get an API key from Hugging Face and connect to their models online (honestly, this just didn’t work smoothly for me).  
- **Option 2:** You can run the model directly on your device, which is what I went for (using Ollama).

**Heads up:**  
If you’re using Ollama to run models locally, you’ll need to have the right C++ dependencies installed on your machine. Ollama relies on bits of C++ for the backend’s speed and compatibility, so make sure those libraries are set up before you launch everything.

### LLM PDF Analyzer Setup

I coded up an Ollama PDF analyzer using the [LangChain](https://github.com/hwchase17/langchain) library, adapted from [this YouTube video](https://www.youtube.com/watch?v=WmuSEfgzcJo&list=LL&index=3). My setup is customized for my device, so it may look a bit different from the video.

Step one: download the Hugging Face model file `mistral-7b-openorca.Q4_0.gguf`. You’ll find it in the `controllers` folder. The download process took a while! I tried using `wget` and a `huggingfaceinstaller.py` script, but my terminal was missing some tools. In the end, I just downloaded it through my browser and dropped it into the project.

After getting the model, I set up the API and started installing all required packages. There are three main functions:  
- Summarize the PDF  
- Extract key points  
- Create a quiz  
There’s also a text area to ask the LLM anything about the file. (Be patient, the answers can be slow since it’s running locally for now!)

### Installing Dependencies

All required Python packages are listed in `requirements.txt`. The standard install is:


```bash
pip install -r requirements.txt
```


If any package fails, just install it directly. Some commands I used:

```bash
pip install Flask
```


For PyTorch, check your CUDA version and system. I’m on Windows and used this (from the official docs):

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

Test the install with:


```bash
python test.py
```

For more details, check the source files and feel free to tweak things if your setup is different!

Now that everything’s set up, you can launch the backend by running:

```bash
python app.py
```

This spins up the Flask server so you can connect the frontend and start using all the features!
