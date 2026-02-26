/**
 * DialogueSystem.js — RPG-style dialogue box controller.
 * Shows NPC dialogue with typewriter text effect and action buttons.
 */
export class DialogueSystem {
    constructor() {
        this.container = document.getElementById('dialogue-box');
        this.npcNameEl = document.getElementById('dialogue-npc-name');
        this.textEl = document.getElementById('dialogue-text');
        this.actionsEl = document.getElementById('dialogue-actions');
        this.closeBtn = document.getElementById('dialogue-close');

        this.isOpen = false;
        this.currentData = null;
        this.typewriterTimer = null;
        this.onEnterProject = null; // callback

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
    }

    /**
     * Open dialogue for a building
     * @param {Building} building
     */
    openBuilding(building) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.currentData = building;

        if (this.npcNameEl) this.npcNameEl.textContent = building.label;
        if (this.textEl) this.textEl.textContent = '';

        // Clear previous actions
        if (this.actionsEl) this.actionsEl.innerHTML = '';

        // Show container
        if (this.container) {
            this.container.classList.remove('hidden');
        }

        // Typewriter effect
        const fullText = building.project.description;
        this._typewrite(fullText, () => {
            // Show action button after text is done
            if (this.actionsEl) {
                const btn = document.createElement('button');
                btn.className = 'dialogue-btn';
                btn.textContent = 'Enter Project →';
                btn.addEventListener('click', () => {
                    if (this.onEnterProject) {
                        this.onEnterProject(building);
                    }
                    this.close();
                });
                this.actionsEl.appendChild(btn);
            }
        });
    }

    /**
     * Typewriter text reveal
     */
    _typewrite(text, onComplete) {
        if (this.typewriterTimer) clearInterval(this.typewriterTimer);

        let index = 0;
        const speed = 18; // ms per character

        this.typewriterTimer = setInterval(() => {
            if (index < text.length) {
                if (this.textEl) this.textEl.textContent += text[index];
                index++;
            } else {
                clearInterval(this.typewriterTimer);
                this.typewriterTimer = null;
                if (onComplete) onComplete();
            }
        }, speed);
    }

    /**
     * Close dialogue
     */
    close() {
        this.isOpen = false;
        this.currentData = null;

        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }

        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
}
