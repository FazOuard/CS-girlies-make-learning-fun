import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PinkPopup from "../components/PinkPopup";
import house from "../assets/img/library.png";
import front from "../assets/img/front.png";
import back from "../assets/img/back.png";
import left from "../assets/img/left.png";
import right from "../assets/img/right.png";
import mapData from "../assets/map/library.json";
import femaleIdle from "../assets/img/librarist.png";

const Library = () => {
  const [showPinkPopup, setShowPinkPopup] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const mapWidth = mapData.width;
    const mapHeight = mapData.height;
    const tileSize = mapData.tilewidth;

    const camera = {
      x: 0,
      y: 0,
      scale: 1,
      minScale: 1,
      maxScale: 4,
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
      x: 120,
      y: 280,
      width: 32,
      height: 62,
      frameX: 1,
      direction: "front",
      speed: 3,
      moving: false,
    };

    const npc = {
      x: 200,
      y: 280,
      frameX: 0,
      frameCount: 3,
    };

    const femaleImg = new Image();
    femaleImg.src = femaleIdle;
    npc.srcW = null;
    npc.srcH = null;
    npc.drawW = 60;
    npc.drawH = 80;

    femaleImg.onload = () => {
      npc.srcW = femaleImg.naturalWidth / npc.frameCount;
      npc.srcH = femaleImg.naturalHeight;
    };

    let npcConversation = false;
    let npcConvoIndex = 0;
    let npcTypingFinished = false;
    const npcConvoLines = [
      "Librarist: chtt....",
      "Librarist: Oh! Hello there.",
      "Librarist: Welcome to the library.",
      "Librarist: Feel free to explore and read some books, you can use the computer to organise your work on see look for the wisdom tree down!",
      "Librarist: Remember to keep your voice down.",
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

    const keys = {};
    const interactables = [];
    const colorLayers = ['yellow', 'pink', 'blue', 'purple'];
    const roomW = mapWidth;
    const roomTile = tileSize;

    for (const color of colorLayers) {
      const layer = mapData.layers.find(l => l.name === color);
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

    let interactionMessage = null;
    let interactionTimer = null;
    let dialogActive = false;
    let dialogDotsTimer = null;
    let dialogTypeTimer = null;
    let dialogFullText = '';
    let dialogShownText = '';
    let frameCount = 0;
    let nearbyInteractable = null;

    const handleKeyDown = (e) => {
      const wasDown = !!keys[e.key];
      keys[e.key] = true;
      
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        player.moving = true;
      }

      
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
          npcConversation = false;
          dialogActive = false;
          dialogFullText = '';
          dialogShownText = '';
          npcConvoIndex = 0;
          npcTypingFinished = false;
        }
      }

      if (e.key === "ArrowUp") player.direction = "back";
      else if (e.key === "ArrowDown") player.direction = "front";
      else if (e.key === "ArrowLeft") player.direction = "left";
      else if (e.key === "ArrowRight") player.direction = "right";

      if (e.key && e.key.toLowerCase() === 'e' && e.code === 'KeyE' && !wasDown && !e.repeat) {
        const interactRange = 100;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        // Check NPC first
        const npcCenterX = npc.x + npc.drawW / 2;
        const npcCenterY = npc.y + npc.drawH / 2;
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
          return;
        }

        // Check interactables
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
                    setTimeout(() => navigate('/tree'), 300);
                  }
                }, step);
                dialogDotsTimer = null;
              }, 300);
              break;
            }

            if (color === 'yellow') dialogFullText = 'Fun fact:Reading books for just 6 minutes a day can reduce stress levels by up to 68%, even more effective than listening to music or taking a walk!';
            else if (color === 'pink') {
              setShowPinkPopup(true);
              break;
            }
            else if (color === 'blue') {
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
                    setTimeout(() => navigate('/game'), 300);
                  }
                }, step);
                dialogDotsTimer = null;
              }, 300);
              break;
            }
            else dialogFullText = 'Hello';

            dialogShownText = '...';
            dialogActive = true;

            if (dialogDotsTimer) clearTimeout(dialogDotsTimer);
            if (dialogTypeTimer) clearInterval(dialogTypeTimer);
            dialogDotsTimer = setTimeout(() => {
              dialogShownText = '';
              let i = 0;
              const step = 60;
              dialogTypeTimer = setInterval(() => {
                dialogShownText += dialogFullText[i] || '';
                i++;
                if (i >= dialogFullText.length) {
                  clearInterval(dialogTypeTimer);
                  dialogTypeTimer = null;
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

    function drawNPC() {
      if (!femaleImg.naturalWidth) return;
      ctx.drawImage(
        femaleImg,
        npc.x,
        npc.y
      );
    }

    function drawPromptScreen(text, worldX, worldY) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const screenX = (worldX - camera.x) * camera.scale + cx;
      const screenY = (worldY - camera.y) * camera.scale + cy;

      ctx.save();
      ctx.resetTransform && ctx.resetTransform();
      ctx.font = '16px sans-serif';
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
      drawNPC();

      const interactRange = 40;
      nearbyInteractable = null;
      for (const it of interactables) {
        const itCenterX = it.x + it.width / 2;
        const itCenterY = it.y + it.height / 2;
        const dx = itCenterX - (player.x + player.width / 2);
        const dy = itCenterY - (player.y + player.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist <= interactRange) {
          drawPromptScreen(it.label, itCenterX, itCenterY - it.height / 2);
          nearbyInteractable = it;
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
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        const textX = boxX + padding;
        const textY = boxY + padding + 24;
        ctx.fillText(dialogShownText, textX, textY);
        ctx.restore();
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
  }, [navigate, setShowPinkPopup]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-700 rounded-lg"
      />
      {showPinkPopup && (
        <PinkPopup onClose={() => setShowPinkPopup(false)} />
      )}
    </>
  );
};

export default Library;