class LoadingCircle {
  constructor() {
    this._loadingCircle = document.getElementById('loading-circle-container');
  }

  show() {
    this._loadingCircle.style.display = 'flex';
  }

  hide() {
    this._loadingCircle.style.display = 'none';
  }

  isActive() {
    return this._loadingCircle.style.display === 'flex';
  }
}

export default LoadingCircle;
