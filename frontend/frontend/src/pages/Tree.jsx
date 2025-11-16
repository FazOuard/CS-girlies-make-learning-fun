import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import house from "../assets/img/tree.png";
import front from "../assets/img/front.png";
import back from "../assets/img/back.png";
import left from "../assets/img/left.png";
import right from "../assets/img/right.png";
import mapData from "../assets/map/forest.json";
import PdfWisdom from "../components/PdfWisdom";

const Tree = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [showPdfWisdom, setShowPdfWisdom] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    
    const mapWidth = mapData.width;
    const mapHeight = mapData.height;
    const tileSize = mapData.tilewidth; 

    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const camera = {
      x: 0,
      y: 0,
      scale: 1,
      minScale: 1,
      maxScale: 4,
      _initialized: false,
    };

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

    window.addEventListener('resize', onResizeAdjustCamera);
    onResizeAdjustCamera();

    // Charger les images
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
      x: 320,
      y: 350,
      width: 32, 
      height: 62, 
      frameX: 1,
      direction: "front",
      speed: 3,
      moving: false,
    };

    
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
    const blueLayer = mapData.layers.find(l => l.name === 'blue');
    if (blueLayer && blueLayer.data) {
      for (let i = 0; i < blueLayer.data.length; i++) {
        if (blueLayer.data[i] !== 0) {
          const col = i % mapWidth;
          const row = Math.floor(i / mapWidth);
          interactables.push({
            x: col * tileSize,
            y: row * tileSize,
            width: tileSize,
            height: tileSize,
            label: 'Press E',
            color: 'blue'
          });
        }
      }

    }

    const purpleLayer = mapData.layers.find(l => l.name === 'purple');
    let purpleTriggered = false;
    let dialogActive = false;
    let dialogDotsTimer = null;
    let dialogTypeTimer = null;
    let dialogFullText = '';
    let dialogShownText = '';

    let wisdomConversation = false;
    let wisdomConvoIndex = 0;
    let wisdomTypingFinished = false;
    const wisdomConvoLines = [
      "wisdom tree: Ah, another lost scholar approaches... I'm the legendary Wisdom Tree!",
      "wisdom tree: My branches hold the knowledge of your notes, I can summarize them, explain them, maybe even make them sound smarter than they are.",
      "wisdom tree: So, traveler of procrastination... do you wish to tap into my ancient academic powers?",
      "wisdom tree: Press Y to accept my leafy wisdom, or N to walk away and remain... *confused.*"
    ];


    const handleKeyDown = (e) => {
      keys[e.key] = true;
      player.moving = true;

      if (e.key === "ArrowUp") player.direction = "back";
      else if (e.key === "ArrowDown") player.direction = "front";
      else if (e.key === "ArrowLeft") player.direction = "left";
      else if (e.key === "ArrowRight") player.direction = "right";

      if ((e.code === 'Space' || e.key === ' ') && wisdomConversation && wisdomTypingFinished) {
        wisdomConvoIndex++;
        if (wisdomConvoIndex < wisdomConvoLines.length) {
          dialogFullText = wisdomConvoLines[wisdomConvoIndex];
          dialogShownText = '';
          wisdomTypingFinished = false;
          if (dialogTypeTimer) clearInterval(dialogTypeTimer);
          let ii = 0;
          const stepType = 50;
          dialogTypeTimer = setInterval(() => {
            dialogShownText += dialogFullText[ii] || '';
            ii++;
            if (ii >= dialogFullText.length) {
              clearInterval(dialogTypeTimer);
              dialogTypeTimer = null;
              wisdomTypingFinished = true;
            }
          }, stepType);
        } else {
          // end wisdom conversation
          wisdomConversation = false;
          dialogActive = false;
          dialogFullText = '';
          dialogShownText = '';
          wisdomConvoIndex = 0;
          wisdomTypingFinished = false;
        }
      }

      if (e.key && e.key.toLowerCase() === 'e') {
        const interactRange = 48;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        for (const it of interactables) {
          const itCenterX = it.x + it.width / 2;
          const itCenterY = it.y + it.height / 2;
          const dx = itCenterX - px;
          const dy = itCenterY - py;
          const dist = Math.hypot(dx, dy);
          if (dist <= interactRange) {

            wisdomConversation = true;
            wisdomConvoIndex = 0;
            dialogFullText = wisdomConvoLines[0];
            dialogShownText = '';
            dialogActive = true;
            wisdomTypingFinished = false;
            if (dialogDotsTimer) clearTimeout(dialogDotsTimer);
            if (dialogTypeTimer) clearInterval(dialogTypeTimer);
            dialogDotsTimer = setTimeout(() => {
              dialogShownText = '';
              let i = 0;
              const step = 50;
              dialogTypeTimer = setInterval(() => {
                dialogShownText += dialogFullText[i] || '';
                i++;
                if (i >= dialogFullText.length) {
                  clearInterval(dialogTypeTimer);
                  dialogTypeTimer = null;
                  wisdomTypingFinished = true;
                }
              }, step);
              dialogDotsTimer = null;
            }, 300);
            break;
          }
        }
      }

      // Y/N handling for Wisdom Tree consent
      if (e.key && ['y', 'n'].includes(e.key.toLowerCase()) && wisdomConversation && wisdomTypingFinished) {
        const key = e.key.toLowerCase();
          if (key === 'y') {

          wisdomConversation = false;
          dialogActive = false;
          dialogFullText = '';
          dialogShownText = '';
          wisdomConvoIndex = 0;
          wisdomTypingFinished = false;
          if (dialogDotsTimer) { clearTimeout(dialogDotsTimer); dialogDotsTimer = null; }
          if (dialogTypeTimer) { clearInterval(dialogTypeTimer); dialogTypeTimer = null; }
          
          setShowPdfWisdom(true);
        } else {
          
          wisdomConversation = false;
          dialogActive = false;
          dialogFullText = '';
          dialogShownText = '';
          wisdomConvoIndex = 0;
          wisdomTypingFinished = false;
          if (dialogDotsTimer) { clearTimeout(dialogDotsTimer); dialogDotsTimer = null; }
          if (dialogTypeTimer) { clearInterval(dialogTypeTimer); dialogTypeTimer = null; }
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
      const futureBox = {
        x: nextX,
        y: nextY,
        width: player.width,
        height: player.height,
      };

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
      if (frameCount % 10 === 0) {
        player.frameX = (player.frameX + 1) % 3;
      }
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

   
    camera.x = player.x + player.width / 2;
    camera.y = player.y + player.height / 2;
    const baseScaleInit = Math.min(
      canvas.width / (mapWidth * tileSize),
      canvas.height / (mapHeight * tileSize)
    );
    camera.scale = Math.max(baseScaleInit * 2, baseScaleInit);
    camera.minScale = baseScaleInit;
    camera.maxScale = Math.max(baseScaleInit * 4, camera.scale);
    camera._initialized = true;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      
      movePlayer();
      animateFrames();

      const targetX = player.x + player.width / 2;
      const targetY = player.y + player.height / 2;

      const smoothFactor = 0.15;
      camera.x += (targetX - camera.x) * smoothFactor;
      camera.y += (targetY - camera.y) * smoothFactor;

  checkPurpleTrigger();

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

      const interactRange = 48;
      let nearby = null;
      for (const it of interactables) {
        const itCenterX = it.x + it.width / 2;
        const itCenterY = it.y + it.height / 2;
        const dx = itCenterX - (player.x + player.width / 2);
        const dy = itCenterY - (player.y + player.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist <= interactRange) { nearby = it; break; }
      }

      ctx.restore();

      if (nearby) {
        const cx = canvas.width / 2;
        const screenX = (nearby.x - camera.x) * camera.scale + cx + nearby.width/2 * camera.scale;
        const screenY = (nearby.y - camera.y) * camera.scale + (canvas.height/2) - nearby.height * camera.scale - 10;
        ctx.save();
        ctx.resetTransform && ctx.resetTransform();
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(nearby.label, screenX, screenY);
        ctx.fillText(nearby.label, screenX, screenY);
        ctx.restore();
      }

      if (dialogActive || wisdomConversation) {
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
      // optionally draw debug no-walk zones
      // ctx.fillStyle = 'rgba(255,0,0,0.2)';
      // noWalkZones.forEach(z => ctx.fillRect(z.x, z.y, z.width, z.height));

      ctx.restore();

      requestAnimationFrame(animate);
    }

    function checkPurpleTrigger() {
      if (!purpleLayer || purpleTriggered) return;
   
      const cx = Math.floor((player.x + player.width/2) / tileSize);
      const cy = Math.floor((player.y + player.height/2) / tileSize);
      if (cx < 0 || cy < 0 || cx >= mapWidth || cy >= mapHeight) return;
      const idx = cy * mapWidth + cx;
      if (purpleLayer.data && purpleLayer.data[idx] && purpleLayer.data[idx] !== 0) {
        purpleTriggered = true;
        
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
      }
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
      if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + w - r.tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
      ctx.lineTo(x + w, y + h - r.br);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
      ctx.lineTo(x + r.bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      if (!text) return;
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    }

    animate();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener('resize', onResizeAdjustCamera);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-700 rounded-lg"
      />
      {showPdfWisdom && <PdfWisdom onClose={() => setShowPdfWisdom(false)} />}
    </>
  );
};

export default Tree;