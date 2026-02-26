/**
 * ModalSystem.js — Project detail modal controller.
 * Shows full project information with tech stack, description, and links.
 */
export class ModalSystem {
    constructor(camera) {
        this.camera = camera;
        this.modal = document.getElementById('project-modal');
        this.backdrop = document.getElementById('modal-backdrop');
        this.closeBtn = document.getElementById('modal-close');
        this.titleEl = document.getElementById('modal-title');
        this.descriptionEl = document.getElementById('modal-description');
        this.techStackEl = document.getElementById('modal-tech-stack');
        this.githubBtn = document.getElementById('modal-btn-github');
        this.liveBtn = document.getElementById('modal-btn-live');

        this.isOpen = false;

        // Close handlers
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }

        // ESC key close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Open modal for a building's project
     * @param {Building} building
     */
    open(building) {
        if (this.isOpen) return;
        this.isOpen = true;

        const project = building.project;

        // Screen shake
        if (this.camera) {
            this.camera.shake(3, 0.2);
        }

        // Populate content
        if (this.titleEl) this.titleEl.textContent = project.name;
        if (this.descriptionEl) this.descriptionEl.textContent = project.description;

        // Tech stack pills
        if (this.techStackEl) {
            this.techStackEl.innerHTML = '';
            for (const tech of project.techStack) {
                const pill = document.createElement('span');
                pill.className = 'tech-pill';
                pill.textContent = tech;
                this.techStackEl.appendChild(pill);
            }
        }

        // Links
        if (this.githubBtn) {
            if (project.github) {
                this.githubBtn.href = project.github;
                this.githubBtn.style.display = '';
            } else {
                this.githubBtn.style.display = 'none';
            }
        }
        if (this.liveBtn) {
            if (project.live) {
                this.liveBtn.href = project.live;
                this.liveBtn.style.display = '';
            } else {
                this.liveBtn.style.display = 'none';
            }
        }

        // Show modal
        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
    }

    /**
     * Close modal
     */
    close() {
        this.isOpen = false;
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }
}
