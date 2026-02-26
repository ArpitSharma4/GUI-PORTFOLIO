/**
 * main.js — Bootstrap and game loop orchestration.
 * Ties together all engine, entity, world, and system modules.
 */
import { GameLoop } from './engine/GameLoop.js';
import { Camera } from './engine/Camera.js';
import { InputManager } from './engine/InputManager.js';
import { CollisionSystem } from './engine/CollisionSystem.js';
import { Player } from './entities/Player.js';
import { WorldBuilder } from './world/WorldBuilder.js';
import { ThemeManager } from './systems/ThemeManager.js';
import { SeasonManager } from './systems/SeasonManager.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { ModalSystem } from './systems/ModalSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { AudioManager } from './systems/AudioManager.js';
import { WORLD_CONFIG } from './world/worldData.js';
import { getDevicePixelRatio } from './utils/helpers.js';

// ==================================================
// Canvas Setup
// ==================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let dpr = getDevicePixelRatio();

function resizeCanvas() {
    dpr = getDevicePixelRatio();
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

let { width: canvasW, height: canvasH } = resizeCanvas();
const groundY = canvasH * WORLD_CONFIG.groundFraction;

// ==================================================
// Core Systems Initialization
// ==================================================
const gameLoop = new GameLoop();
const input = new InputManager();
const camera = new Camera(canvasW, canvasH, WORLD_CONFIG.width);
const collision = new CollisionSystem(WORLD_CONFIG.width, groundY);
const themeManager = new ThemeManager();
const seasonManager = new SeasonManager();
const dialogueSystem = new DialogueSystem();
const audio = new AudioManager();
const modalSystem = new ModalSystem(camera);
const world = new WorldBuilder(canvasW, canvasH);
const particles = new ParticleSystem(canvasW, canvasH, WORLD_CONFIG.width);
const player = new Player(WORLD_CONFIG.playerStart, groundY, canvasH);

// Setup collision zones from world data
world.setupCollisions(collision);

// ==================================================
// Audio Initialization (on first user interaction)
// ==================================================
function initAudioOnInteraction() {
    audio.ensureReady();
    window.removeEventListener('click', initAudioOnInteraction);
    window.removeEventListener('keydown', initAudioOnInteraction);
    window.removeEventListener('touchstart', initAudioOnInteraction);
}
window.addEventListener('click', initAudioOnInteraction);
window.addEventListener('keydown', initAudioOnInteraction);
window.addEventListener('touchstart', initAudioOnInteraction);

// Audio toggle button
const audioToggle = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');
if (audioToggle) {
    audioToggle.addEventListener('click', () => {
        audio.ensureReady();
        const muted = audio.toggleMute();
        if (audioIcon) audioIcon.textContent = muted ? '🔇' : '🔊';
    });
}

// ==================================================
// Player Audio Callbacks
// ==================================================
player.onJump = () => audio.play('jump');
player.onLand = () => audio.play('land');
player.onStep = (isSprinting) => audio.play('footstep', { isSprinting });

// ==================================================
// Theme Change Handler
// ==================================================
themeManager.onThemeChange((isNight) => {
    world.setNightMode(isNight);
    player.setNightMode(isNight);
    particles.setNightMode(isNight);
    audio.setNightMode(isNight);
    audio.play('theme-switch');
});

// ==================================================
// Season Change Handler
// ==================================================
seasonManager.onSeasonChange((season) => {
    world.setSeason(season);
    particles.setSeason(season);
    audio.setSeason(season);
    player.setSeason(season);
    audio.play('theme-switch'); // Use same shimmer for season switch
});

// ==================================================
// Dialogue → Modal Bridge
// ==================================================
dialogueSystem.onEnterProject = (building) => {
    modalSystem.open(building);
    audio.play('modal-open');
};

// ==================================================
// Interaction Prompt Element
// ==================================================
const interactPrompt = document.getElementById('interact-prompt');
let currentInteraction = null;

function showInteractPrompt(screenX, screenY) {
    if (interactPrompt) {
        interactPrompt.classList.remove('hidden');
        interactPrompt.style.left = screenX + 'px';
        interactPrompt.style.top = (screenY - 50) + 'px';
    }
}

function hideInteractPrompt() {
    if (interactPrompt) {
        interactPrompt.classList.add('hidden');
    }
}

// ==================================================
// Window Resize Handler
// ==================================================
window.addEventListener('resize', () => {
    const size = resizeCanvas();
    canvasW = size.width;
    canvasH = size.height;

    camera.resize(canvasW, canvasH);
    world.resize(canvasW, canvasH);
    particles.resize(canvasW, canvasH);

    const newGroundY = canvasH * WORLD_CONFIG.groundFraction;
    collision.setGroundY(newGroundY);
    player.groundY = newGroundY;
    player.y = newGroundY;
    world.setupCollisions(collision);
});

// ==================================================
// Game Update
// ==================================================
function gameUpdate(dt) {
    // Don't process movement if modal or dialogue is open
    if (modalSystem.isOpen) {
        if (input.isClosePressed()) {
            modalSystem.close();
            audio.play('close');
        }
        input.endFrame();
        return;
    }

    if (dialogueSystem.isOpen) {
        if (input.isClosePressed() || input.isInteractPressed()) {
            dialogueSystem.close();
            audio.play('close');
        }
        input.endFrame();
        return;
    }

    // Theme toggle
    if (input.isThemeTogglePressed()) {
        themeManager.toggle();
    }

    // Update player (movement, jump, sprint)
    player.update(input, collision, dt);

    // Update camera to follow player
    camera.update(player, dt);

    // Update world
    world.update(dt, camera);

    // Update particles
    particles.update(dt);

    // Check interactions
    const interaction = world.checkInteractions(player.x, 90);
    currentInteraction = interaction;

    if (interaction && interaction.type === 'building') {
        const screenX = interaction.data.x + interaction.data.width / 2 - camera.x;
        const screenY = (world.groundY - interaction.data.height - 20);
        showInteractPrompt(screenX, screenY);

        if (input.isInteractPressed()) {
            dialogueSystem.openBuilding(interaction.data);
            audio.play('interact');
            hideInteractPrompt();
        }
    } else {
        hideInteractPrompt();
    }

    input.endFrame();
}

// ==================================================
// Game Render
// ==================================================
function gameRender(dt) {
    // Clear canvas
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Render world (Layers 0-6.5)
    world.render(ctx, camera);

    // Layer 7: Player
    camera.applyTransform(ctx);
    player.render(ctx);
    camera.resetTransform(ctx);

    // Layer 8: Foreground props
    world.renderForeground(ctx, camera);

    // Layer 9: Particles
    particles.render(ctx, camera);

    // Speech bubbles
    world.renderSpeechBubbles(ctx, camera);
}

// ==================================================
// Register Update/Render callbacks
// ==================================================
gameLoop.onUpdate(gameUpdate);
gameLoop.onRender(gameRender);

// ==================================================
// Loading Sequence
// ==================================================
const loadingScreen = document.getElementById('loading-screen');
const loaderBar = document.getElementById('loader-bar');
const hud = document.getElementById('hud');

function startLoadingAnimation() {
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += 2 + Math.random() * 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            finishLoading();
        }
        if (loaderBar) {
            loaderBar.style.width = progress + '%';
        }
    }, 50);
}

function finishLoading() {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }

        setTimeout(() => {
            if (hud) hud.classList.remove('hidden');
        }, 500);

        gameLoop.start();
    }, 300);
}

// ==================================================
// Initialize
// ==================================================
startLoadingAnimation();
