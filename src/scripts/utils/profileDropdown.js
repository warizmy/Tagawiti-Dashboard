class ProfileDropdown {
  constructor(profileImageId, dropdownMenuId, dropdownItemId) {
    this.profileImage = document.getElementById(profileImageId);
    this.dropdownMenu = document.getElementById(dropdownMenuId);
    this.dropdownItem = document.getElementById(dropdownItemId);

    if (this.profileImage && this.dropdownMenu && this.dropdownItem) {
      this._initializeEventListeners();
    }
  }

  _initializeEventListeners() {
    this.profileImage.addEventListener('click', () => this.toggleDropdown());
    this.dropdownItem.addEventListener('click', () => this._handleClickInside());

    document.addEventListener('click', (event) => this._handleClickOutside(event));
  }

  toggleDropdown() {
    this.dropdownMenu.style.display = this.dropdownMenu.style.display === 'block' ? 'none' : 'block';
  }

  _handleClickInside() {
    this.dropdownMenu.style.display = 'none';
  }

  _handleClickOutside(event) {
    if (event.target !== this.profileImage && !this.dropdownMenu.contains(event.target)) {
      this.dropdownMenu.style.display = 'none';
    }
  }
}

export default ProfileDropdown;
