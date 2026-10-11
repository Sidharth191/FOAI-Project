export class BaseMinigame {
  constructor(task) {
    this.task = task;
    this.container = null;
    this.onComplete = null;
    this.onClose = null;
    this.isCompleted = false;
    this.timers = [];
    this.listeners = [];
  }

  open(container, onComplete, onClose) {
    this.container = container;
    this.onComplete = onComplete;
    this.onClose = onClose;
    this.render();
  }

  render() {
    // Implemented in subclasses
  }

  addTimer(id) {
    this.timers.push(id);
    return id;
  }

  addListener(target, event, handler) {
    if (!target) return;
    target.addEventListener(event, handler);
    this.listeners.push({ target: target, event: event, handler: handler });
  }

  destroy() {
    for (const t of this.timers) {
      clearTimeout(t);
      clearInterval(t);
    }
    this.timers = [];

    for (const l of this.listeners) {
      l.target.removeEventListener(l.event, l.handler);
    }
    this.listeners = [];

    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  complete() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    if (this.onComplete) {
      this.onComplete();
    }
  }
}
