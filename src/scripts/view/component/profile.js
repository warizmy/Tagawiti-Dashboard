class Profile {
  render() {
    const profileContainer = document.createElement('div');
    profileContainer.className = 'profile-container';
    profileContainer.id = 'profileContainer';
    profileContainer.innerHTML = `
         <img src="./images/admin.webp" alt="Admin Profile" class="profile-image" id="profileImage" />
         <div class="dropdown-menu" id="dropdownMenu">
           <div class="dropdown-txt">
             <p class="text">Login Sebagai :</p>
             <p id="username" class="text">ADMINISTRATOR</p>
           </div>
           <a href="#/passwordchange" class="dropdown-item" id="dropdownItem">
             <i class="lni lni-gear-1"></i>
             <span>Ganti Sandi</span></a>
         </div>
       `;
    return profileContainer;
  }
}

export default Profile;
