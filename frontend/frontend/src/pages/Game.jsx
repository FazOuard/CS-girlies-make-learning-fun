import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import house from "../assets/img/house.png";
import front from "../assets/img/front.png";
import back from "../assets/img/back.png";
import left from "../assets/img/left.png";
import right from "../assets/img/right.png";
import femaleIdle from "../assets/img/femaleIdle.png";
import mapData from "../assets/map/house.json";
import roomStudyMap from "../assets/map/roomstudy.json";

const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const mapWidth = mapData.width;
  const mapHeight = mapData.height;
  const tileSize = mapData.tilewidth;


  const maproomWidth = roomStudyMap.width;
  const maproomHeight = roomStudyMap.height;
  const tileroomSize = roomStudyMap.tilewidth;

  const camera = {
    x: 0,
    y: 0,
    scale: 1,
    minScale: 1,
    maxScale: 4,
    _initialized: false,
  };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  
  function onResizeAdjustCamera() {
    resizeCanvas();
    const baseScale = Math.min(
      canvas.width / (mapWidth * tileSize),
      canvas.height / (mapHeight * tileSize)
  
    );
    camera.minScale = baseScale;
    camera.maxScale = Math.max(baseScale * 4, camera.scale);
    camera.scale = Math.min(Math.max(camera.scale, camera.minScale), camera.maxScale);
  }

  window.addEventListener("resize", onResizeAdjustCamera);
  onResizeAdjustCamera();

  const background = new Image();
  background.src = house;

  const sprites = {
    front: new Image(),
    back: new Image(),
    left: new Image(),
    right: new Image(),
  };

  sprites.front.src = front;
  sprites.back.src = back;
  sprites.left.src = left;
  sprites.right.src = right;

  const player = {
    x: 420,
    y: 350,
    width: 32,
    height: 62,
    frameX: 1,
    direction: "front",
    speed: 3,
    moving: false,
  };

  const npc = {
    x: 520,
    y: 350,
    width: 32,
    height: 62,
    frameX: 1,
    frameCount: 3,
    tick: 0,
    interval: 35,
  };
  const femaleImg = new Image();
  femaleImg.src = femaleIdle;
 
  npc.srcW = null;
  npc.srcH = null;
  npc.drawW = npc.width;
  npc.drawH = npc.height;
  npc.baseY = npc.y; 

  femaleImg.onload = () => {

    npc.srcW = femaleImg.naturalWidth / npc.frameCount;
    npc.srcH = femaleImg.naturalHeight;

    const scale = player.height / npc.srcH;
    npc.drawW = Math.round(npc.srcW * scale);
    npc.drawH = Math.round(npc.srcH * scale);
    
    npc.y = npc.baseY + (player.height - npc.drawH);
  };

 
  let npcConversation = false;
  let npcConvoIndex = 0;
  let npcTypingFinished = false;
  const npcConvoLines = [
  "sister: Wait… you're gaming again? Weren’t you supposed to study?",
  "you: Uh… I’m trying! I just don’t know where to go or what to do first!",
  "sister: Classic excuse. Okay, listen, go to the door and press 'E' to step outside.",
  "sister: From there, you’ve got options: head to the library for actual studying, use your laptop for research...",
  "sister: ...or talk to the Wisdom Tree, it’s basically an AI that summarizes your notes because even trees are smarter than procrastinators now.",
  "you: Wow, even the tree judges me.",
  "sister: Yep. Now go. Before the tree starts writing your exam too."
];


  
  camera.y = player.y + player.height / 2;
  const baseScale = Math.min(
    canvas.width / (mapWidth * tileSize),
    canvas.height / (mapHeight * tileSize)
  );
  camera.scale = Math.max(baseScale * 2, baseScale); 
  camera.minScale = baseScale;
  camera.maxScale = Math.max(baseScale * 4, camera.scale);
  camera._initialized = true;

  let noWalkZones = [];
  const redLayer = mapData.layers.find(layer => layer.name === "red");
  
  if (redLayer && redLayer.data) {
    for (let i = 0; i < redLayer.data.length; i++) {
      if (redLayer.data[i] !== 0) {
        const col = i % mapWidth;
        const row = Math.floor(i / mapWidth);
        noWalkZones.push({
          x: col * tileSize,
          y: row * tileSize,
          width: tileSize,
          height: tileSize,
        });
      }
    }
  }

  if (noWalkZones.length === 0) {
    for (let i = 0; i < mapWidth; i++) {
      noWalkZones.push({ x: i * tileSize, y: 0, width: tileSize, height: tileSize });
      noWalkZones.push({ x: i * tileSize, y: (mapHeight - 1) * tileSize, width: tileSize, height: tileSize });
    }
    for (let i = 0; i < mapHeight; i++) {
      noWalkZones.push({ x: 0, y: i * tileSize, width: tileSize, height: tileSize });
      noWalkZones.push({ x: (mapWidth - 1) * tileSize, y: i * tileSize, width: tileSize, height: tileSize });
    }
  }

  const interactables = [];
  const colorLayers = ["yellow", "pink", "blue", "purple"];
  const roomW = maproomWidth;
  const roomTile = tileroomSize;
  for (const color of colorLayers) {
    const layer = roomStudyMap.layers.find(l => l.name === color);
    if (!layer || !layer.data) continue;
    for (let i = 0; i < layer.data.length; i++) {
      if (layer.data[i] !== 0) {
        const col = i % roomW;
        const row = Math.floor(i / roomW);
        interactables.push({
          x: col * roomTile,
          y: row * roomTile,
          width: roomTile,
          height: roomTile,
          label: 'Press E',
          color,
        });
      }
    }
  }

  const keys = {};
  
  let interactionMessage = null;
  let interactionTimer = null;
 
  let dialogActive = false;
  let dialogDotsTimer = null;
  let dialogTypeTimer = null;
  let dialogFullText = '';
  let dialogShownText = '';

  const handleKeyDown = (e) => {
    keys[e.key] = true;
    player.moving = true;

    if (e.key === "ArrowUp") player.direction = "back";
    else if (e.key === "ArrowDown") player.direction = "front";
    else if (e.key === "ArrowLeft") player.direction = "left";
    else if (e.key === "ArrowRight") player.direction = "right";

  
    
    if ((e.code === 'Space' || e.key === ' ') && npcConversation && npcTypingFinished) {
      npcConvoIndex++;
      if (npcConvoIndex < npcConvoLines.length) {
        dialogFullText = npcConvoLines[npcConvoIndex];
        dialogShownText = '';
        npcTypingFinished = false;
        if (dialogTypeTimer) clearInterval(dialogTypeTimer);
        let ii = 0;
        const stepType = 50;
        dialogTypeTimer = setInterval(() => {
          dialogShownText += dialogFullText[ii] || '';
          ii++;
          if (ii >= dialogFullText.length) {
            clearInterval(dialogTypeTimer);
            dialogTypeTimer = null;
            npcTypingFinished = true;
          }
        }, stepType);
      } else {
        // end conversation
        npcConversation = false;
        dialogActive = false;
        dialogFullText = '';
        dialogShownText = '';
        npcConvoIndex = 0;
        npcTypingFinished = false;
      }
    }

    if (e.key.toLowerCase() === 'e') {
      const interactRange = 40;
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;

  
      const npcCenterX = npc.x + npc.width / 2;
      const npcCenterY = npc.y + npc.height / 2;
      const ndx = npcCenterX - px;
      const ndy = npcCenterY - py;
      const ndist = Math.hypot(ndx, ndy);
      if (ndist <= interactRange) {
      
        npcConversation = true;
        npcConvoIndex = 0;
        dialogFullText = npcConvoLines[0];
        dialogShownText = '';
        dialogActive = true;
        npcTypingFinished = false;
        if (dialogDotsTimer) clearTimeout(dialogDotsTimer);
        if (dialogTypeTimer) clearInterval(dialogTypeTimer);
        dialogDotsTimer = setTimeout(() => {
          let i = 0;
          const step = 50;
          dialogTypeTimer = setInterval(() => {
            dialogShownText += dialogFullText[i] || '';
            i++;
            if (i >= dialogFullText.length) {
              clearInterval(dialogTypeTimer);
              dialogTypeTimer = null;
              npcTypingFinished = true;
            }
          }, step);
          dialogDotsTimer = null;
        }, 300);
        return; // don't check other interactables
      }

      for (const it of interactables) {
        const itCenterX = it.x + it.width / 2;
        const itCenterY = it.y + it.height / 2;
        const dx = itCenterX - px;
        const dy = itCenterY - py;
        const dist = Math.hypot(dx, dy);
        if (dist <= interactRange) {
          const color = it.color;
          if (color === 'purple') {
            dialogFullText = 'Leaving...';
            dialogShownText = '...';
            dialogActive = true;
            if (dialogDotsTimer) clearTimeout(dialogDotsTimer);
            if (dialogTypeTimer) clearInterval(dialogTypeTimer);
            dialogDotsTimer = setTimeout(() => {
              dialogShownText = '';
              let i = 0;
              const step = 40;
              dialogTypeTimer = setInterval(() => {
                dialogShownText += dialogFullText[i] || '';
                i++;
                if (i >= dialogFullText.length) {
                  clearInterval(dialogTypeTimer);
                  dialogTypeTimer = null;
                  
                  setTimeout(() => navigate('/lib'), 300);
                }
              }, step);
              dialogDotsTimer = null;
            }, 300);
            break;
          }
          const motivationalQuotes = [
            "Believe in yourself and all that you are.",
            "Small steps every day lead to big results.",
            "Don't watch the clock... do what it does... keep going.",
            "Push yourself, because no one else is going to do it for you.",
            "Success is the sum of small efforts repeated daily.",
          ];
          const pinkQuotes = [
          "No time for sleeping, the brain needs action!",
          "Sleep later, grind now!",
          "Rest is for tomorrow, today we focus!",
        ];

        const blueQuotes = [
          "Are you hungry? Haha, no time, time to study!",
          "Skip the snack, grab the book!",
          "Food can wait, knowledge cannot!",
        ];

          if (color === 'yellow') {
            const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
            dialogFullText = motivationalQuotes[randomIndex];
          }

          else if (color === 'pink') {
            const randomIndex = Math.floor(Math.random() * pinkQuotes.length);
            dialogFullText = pinkQuotes[randomIndex];
          } else if (color === 'blue') {
            const randomIndex = Math.floor(Math.random() * blueQuotes.length);
            dialogFullText = blueQuotes[randomIndex];
          } else dialogFullText = 'Hello';

          dialogShownText = '...';
          dialogActive = true;
          
          if (dialogDotsTimer) clearTimeout(dialogDotsTimer);
          if (dialogTypeTimer) clearInterval(dialogTypeTimer);
          dialogDotsTimer = setTimeout(() => {
            dialogShownText = '';
            let i = 0;
            const step = 60; // ms per char
            dialogTypeTimer = setInterval(() => {
              dialogShownText += dialogFullText[i] || '';
              i++;
              if (i >= dialogFullText.length) {
                clearInterval(dialogTypeTimer);
                dialogTypeTimer = null;
                // auto-hide after 2s
                if (interactionTimer) clearTimeout(interactionTimer);
                interactionTimer = setTimeout(() => {
                  dialogActive = false;
                  dialogFullText = '';
                  dialogShownText = '';
                  interactionTimer = null;
                }, 2000);
              }
            }, step);
            dialogDotsTimer = null;
          }, 600);
          break;
        }
      }
    }
  };

  let frameCount = 0;

  const handleKeyUp = (e) => {
    keys[e.key] = false;
    if (!Object.values(keys).some(key => key === true)) {
      player.moving = false;
      player.frameX = 1;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  function willCollide(nextX, nextY) {
    const futureBox = { x: nextX, y: nextY, width: player.width, height: player.height };
    return noWalkZones.some((zone) => {
      return !(
        futureBox.x + futureBox.width < zone.x ||
        futureBox.x > zone.x + zone.width ||
        futureBox.y + futureBox.height < zone.y ||
        futureBox.y > zone.y + zone.height
      );
    });
  }

  function movePlayer() {
    let nextX = player.x;
    let nextY = player.y;

    if (keys["ArrowUp"]) nextY -= player.speed;
    if (keys["ArrowDown"]) nextY += player.speed;
    if (keys["ArrowLeft"]) nextX -= player.speed;
    if (keys["ArrowRight"]) nextX += player.speed;

    if (!willCollide(nextX, nextY)) {
      player.x = nextX;
      player.y = nextY;
    }
  }

  function animateFrames() {
    if (!player.moving) {
      player.frameX = 1;
      return;
    }
    frameCount++;
    if (frameCount % 10 === 0) player.frameX = (player.frameX + 1) % 3;
  }

  function drawSprite() {
    const sprite = sprites[player.direction];
    ctx.drawImage(
      sprite,
      player.frameX * player.width,
      0,
      player.width,
      player.height,
      player.x,
      player.y,
      player.width,
      player.height
    );
  }

  
  function drawPromptScreen(text, worldX, worldY) {
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const screenX = (worldX - camera.x) * camera.scale + cx;
    const screenY = (worldY - camera.y) * camera.scale + cy;

    ctx.save();
  
    ctx.resetTransform && ctx.resetTransform();
    ctx.font = `${14}px sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(text, screenX, screenY - 10);
    ctx.fillText(text, screenX, screenY - 10);
    ctx.restore();
  }

  function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    movePlayer();
    animateFrames();

     
      const targetX = player.x + player.width / 2;
      const targetY = player.y + player.height / 2;


      const smoothFactor = 0.15; 
      camera.x += (targetX - camera.x) * smoothFactor;
      camera.y += (targetY - camera.y) * smoothFactor;

      
      const viewW = canvas.width / camera.scale;
      const viewH = canvas.height / camera.scale;

      const halfViewW = viewW / 2;
      const halfViewH = viewH / 2;

      const worldW = mapWidth * tileSize;
      const worldH = mapHeight * tileSize;

      
      if (worldW <= viewW) camera.x = worldW / 2;
      else camera.x = Math.min(Math.max(camera.x, halfViewW), worldW - halfViewW);

      if (worldH <= viewH) camera.y = worldH / 2;
      else camera.y = Math.min(Math.max(camera.y, halfViewH), worldH - halfViewH);

      ctx.save();
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.translate(cx, cy);
      ctx.scale(camera.scale, camera.scale);
      ctx.translate(-camera.x, -camera.y);

      ctx.drawImage(background, 0, 0, worldW, worldH);
      drawSprite();
     
      if (femaleImg.complete && npc.srcW && npc.srcH) {
        ctx.drawImage(
          femaleImg,
          npc.frameX * npc.srcW,
          0,
          npc.srcW,
          npc.srcH,
          npc.x,
          npc.y,
          npc.drawW,
          npc.drawH
        );
      }
      
      const interactRange = 40; 
      for (const it of interactables) {
        const itCenterX = it.x + it.width / 2;
        const itCenterY = it.y + it.height / 2;
        const dx = itCenterX - (player.x + player.width / 2);
        const dy = itCenterY - (player.y + player.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist <= interactRange) {

          drawPromptScreen(it.label, itCenterX, itCenterY - it.height / 2);
      
          break;
        }
      }

      ctx.restore();

    
    if (interactionMessage) {
      
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2 - 30;
      drawPromptScreen(interactionMessage, px, py);
    }

    
    if (dialogActive) {
      ctx.save();
      ctx.resetTransform && ctx.resetTransform();
      const padding = 20;
      const boxHeight = 120;
      const boxY = canvas.height - boxHeight - 20; 
      const boxX = 10;
      const boxW = canvas.width - 20;

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
     
      const r = 8;
      ctx.beginPath();
      ctx.moveTo(boxX + r, boxY);
      ctx.lineTo(boxX + boxW - r, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
      ctx.lineTo(boxX + boxW, boxY + boxHeight - r);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxHeight, boxX + boxW - r, boxY + boxHeight);
      ctx.lineTo(boxX + r, boxY + boxHeight);
      ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - r);
      ctx.lineTo(boxX, boxY + r);
      ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

     
      ctx.fillStyle = 'black';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'left';
      const textX = boxX + padding;
      const textY = boxY + padding + 24;
      ctx.fillText(dialogShownText, textX, textY);
      ctx.restore();
    }

    npc.tick++;
    if (npc.tick >= npc.interval) {
      npc.tick = 0;
      npc.frameX = (npc.frameX + 1) % npc.frameCount;
    }
  requestAnimationFrame(animate);
}

  animate();

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("resize", onResizeAdjustCamera);
    if (interactionTimer) clearTimeout(interactionTimer);
    if (dialogDotsTimer) clearTimeout(dialogDotsTimer);
    if (dialogTypeTimer) clearInterval(dialogTypeTimer);
  };
}, []);


  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-700 rounded-lg"
    />
  );
};

export default Game;