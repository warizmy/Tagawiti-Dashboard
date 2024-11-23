import Quill from 'quill';
import LoadingCircle from '../../../utils/loading';

class NewsPage {
  constructor() {
    this.editPopupContainer = null;
    this.newsData = [];
    this._render();
  }

  _render() {
    document.title = 'Tagawiti Dashboard - Berita';

    const contentContainer = document.createElement('div');
    contentContainer.className = 'news-container mt-0 mx-0';

    contentContainer.innerHTML = `
      <h1 class="mb-4">Berita</h1>
      <form id="newsForm" class="p-3 mb-4" method="post">
        <div class="mb-3">
          <label for="newsTitle" class="form-label">Judul Berita</label>
          <input type="text" class="form-control rounded-0" id="newsTitle" placeholder="Masukkan judul berita" required>
        </div>
        <div class="mb-3">
          <label for="newsAuthor" class="form-label">Penulis</label>
          <input type="text" class="form-control rounded-0" id="newsAuthor" placeholder="Masukkan nama penulis" required>
        </div>
        <div class="mb-3">
          <label for="newsDescription" class="form-label">Deskripsi Singkat</label>
          <textarea class="form-control rounded-0" id="newsDescription" rows="2" placeholder="Masukkan deskripsi singkat" required></textarea>
        </div>
        <div class="mb-3">
          <label for="newsContent" class="form-label">Konten Berita</label>
          <div id="newsContentEditor" style="height: 200px;"></div>
        </div>
        <div class="mb-3">
          <label for="newsImageFile" class="form-label">Upload Gambar</label>
          <input type="file" class="form-control rounded-0" id="newsImageFile" accept="image/*" required>
        </div>
        <p class="text-danger" id="errorFormInputTxt" style="display: none; font-weight: 600;"></p>
        <div class="d-flex gap-2 flex-row">
          <button type="submit" class="d-flex flex-row align-items-center gap-1 px-3 py-1 btn-save" id="btnSave">
            <i class="lni lni-check-circle-1"></i>
            <span>Tambah Berita</span>
          </button>
          <button type="button" class="btn btn-success d-flex flex-row align-items-center gap-1 px-3 py-1" id="btnReset">
            <i class="lni lni-refresh-circle-1-clockwise"></i>
            <span>Reset</span>
          </button>
        </div>
      </form>

      <div class="dropdown mb-3 d-flex gap-2">
        <button class="btn btn-secondary dropdown-toggle rounded-0" type="button" id="filterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          Filter Berita
        </button>
        <ul class="dropdown-menu rounded-0" aria-labelledby="filterDropdown">
          <li><button class="dropdown-item" id="filterNewest">Terbaru</button></li>
          <li><button class="dropdown-item" id="filterOldest">Terlama</button></li>
        </ul>
        <button type="button" class="btn btn-danger rounded-0" id="deleteAllNews">Hapus Semua Berita</button>
      </div>

      <div id="newsList" class="mt-3 newsList"></div>
    `;

    return contentContainer;
  }

  async InitializeEvent() {
    const {
      btnSave, filterNewest, filterOldest, btnReset, deleteAllNews,
    } = this._getElements();
    btnSave.addEventListener('click', this._handleSubmit.bind(this));
    filterNewest.addEventListener('click', () => this._filterNews('newest'));
    filterOldest.addEventListener('click', () => this._filterNews('oldest'));
    btnReset.addEventListener('click', () => this._resetUI());
    deleteAllNews.addEventListener('click', () => this._showAllDeletePopup());

    this.quillEditor = new Quill('#newsContentEditor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'], // Format teks
          [{ list: 'ordered' }, { list: 'bullet' }], // List
          ['link', 'blockquote', 'code-block'],
        ],
      },
    });

    await this._fetchData();
  }

  _getElements() {
    return {
      btnSave: document.getElementById('btnSave'),
      filterNewest: document.getElementById('filterNewest'),
      filterOldest: document.getElementById('filterOldest'),
      deleteAllNews: document.getElementById('deleteAllNews'),
      btnReset: document.getElementById('btnReset'),
      errorText: document.getElementById('errorFormInputTxt'),
      newsTitle: document.getElementById('newsTitle'),
      newsAuthor: document.getElementById('newsAuthor'),
      newsDescription: document.getElementById('newsDescription'),
      newsContent: document.getElementById('newsContent'),
      newsImageFile: document.getElementById('newsImageFile'),
    };
  }

  async _fetchData() {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();
      const response = await fetch('http://localhost:5000/api/get/news', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();

      if (response.ok) {
        this.newsData = result.data;
        result.data.forEach(news => {
          this._renderNewsCard({
            id: news.id,
            title: news.title,
            author: news.author,
            description: news.description,
            content: news.content,
            imageSrc: news.image_url,
            year: this._formatDate(news.created_at),
          });
        });
      } else {
        console.error('Gagal mengambil data berita:', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loadingIndicator.hide();
    }
  }

  async _handleSubmit(event) {
    event.preventDefault();
    const loadingIndicator = new LoadingCircle();
    const {
      newsTitle, newsAuthor, newsDescription, newsImageFile, errorText,
    } = this._getElements();

    const title = newsTitle.value.trim();
    const author = newsAuthor.value.trim();
    const description = newsDescription.value.trim();
    const content = this.quillEditor.root.innerHTML;
    const imageFile = newsImageFile.files[0];

    if (!title || !author || !description || !content || !imageFile) {
      errorText.innerText = 'Semua data wajib diisi!';
      errorText.style.display = 'block';
      return;
    }
    errorText.style.display = 'none';

    try {
      loadingIndicator.show();
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message);
      }

      const newsResponse = await fetch('http://localhost:5000/api/add/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          author,
          description,
          content,
          imageUrl: uploadResult.imageUrl,
        }),
      });
      const newsResult = await newsResponse.json();

      if (newsResponse.ok) {
        const newsId = newsResult.data.id;
        const createdAtFormatted = this._formatDate(new Date());

        this._renderNewsCard({
          id: newsId,
          title,
          author,
          description,
          content,
          imageSrc: uploadResult.imageUrl,
          year: createdAtFormatted,
        });

        window.location.reload();
      } else {
        throw new Error(newsResult.message);
      }
    } catch (error) {
      errorText.innerText = `Error: ${error.message}`;
      errorText.style.display = 'block';
    } finally {
      loadingIndicator.hide();
    }
  }

  _renderNewsCard(news) {
    const maxContentLength = 100;
    const maxDescriptionLength = 70;

    const newsList = document.getElementById('newsList');
    const newsCard = document.createElement('div');
    newsCard.className = 'card mb-3';
    newsCard.style.width = '100%';
    newsCard.setAttribute('data-id', news.id);

    const truncatedDescription = news.description.length > maxDescriptionLength
      ? `${news.description.substring(0, maxDescriptionLength)}...`
      : news.description;
    const truncatedContent = news.content.length > maxContentLength
      ? `${news.content.substring(0, maxContentLength)}...`
      : news.content;

    newsCard.innerHTML = `
      <div class="row g-0 rounded-1">
        <div class="col-md-3">
          <img src="${news.imageSrc}" class="img-fluid rounded-start w-100 news-image">
        </div>
        <div class="col-md-8 d-flex flex-column">
          <div class="card-body">
            <h5 class="card-title">${news.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${news.author} | ${news.year}</h6>
            <p class="card-text"><strong>Deskripsi:</strong> ${truncatedDescription}</p>
            <p class="card-text text-secondary">${truncatedContent}</p>
            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-warning btn-sm edit-btn" data-news="${encodeURIComponent(JSON.stringify(news))}">Edit</button>
              <button class="btn btn-danger btn-sm delete-btn">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    `;
    newsList.prepend(newsCard);

    newsCard.querySelector('.delete-btn').addEventListener('click', () => {
      this._showDeletePopup(news.id, newsCard);
    });
    newsCard.querySelector('.edit-btn').addEventListener('click', (e) => {
      const newsData = JSON.parse(decodeURIComponent(e.target.getAttribute('data-news')));
      this._showEditPopUp(newsData);
    });
  }

  async _updateNews(newsId, updatedContent) {
    const editTitle = document.getElementById('editNewsTitle').value.trim();
    const editAuthor = document.getElementById('editNewsAuthor').value.trim();
    const editDescription = document.getElementById('editNewsDescription').value.trim();
    const editImageFile = document.getElementById('editNewsImageFile').files[0];
    const errorText = document.getElementById('editErrorFormInputTxt');
    const loadingIndicator = new LoadingCircle();

    if (!editTitle || !editAuthor || !editDescription || !updatedContent) {
      errorText.innerText = 'Semua data wajib diisi!';
      errorText.style.display = 'block';
      return;
    }
    errorText.style.display = 'none';

    try {
      loadingIndicator.show();
      let imageUrl = '';

      // Upload gambar jika ada
      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadResult.message);
        }

        imageUrl = uploadResult.imageUrl;
      }

      // Data yang akan diupdate
      const updateData = {
        title: editTitle,
        author: editAuthor,
        description: editDescription,
        content: updatedContent, // Menggunakan konten dari Quill Editor
        ...(imageUrl && { imageUrl }), // Sertakan jika gambar diunggah
      };

      // Request update ke API
      const response = await fetch(`http://localhost:5000/api/update/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        loadingIndicator.hide();
        this._showSuccessEditPopUp();
      } else {
        const result = await response.json();
        errorText.innerText = result.message;
        errorText.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      errorText.innerText = `Error: ${error.message}`;
      errorText.style.display = 'block';
    }
  }

  async _deleteNews(newsId, newsCard) {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();
      const response = await fetch(`http://localhost:5000/api/delete/news/${newsId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json();

      if (response.ok) {
        newsCard.remove();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loadingIndicator.hide();
    }
  }

  async _deleteAllNews() {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();
      const response = await fetch('http://localhost:5000/api/delete/all/news', {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json();

      if (response.ok) {
        document.getElementById('newsList').innerHTML = '';
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loadingIndicator.hide();
    }
  }

  _filterNews(filterType) {
    document.getElementById('newsList').innerHTML = '';

    if (filterType === 'oldest') {
      this.newsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filterType === 'newest') {
      this.newsData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    this.newsData.forEach(news => {
      this._renderNewsCard({
        id: news.id,
        title: news.title,
        author: news.author,
        description: news.description,
        content: news.content,
        imageSrc: news.image_url,
        year: this._formatDate(news.created_at),
      });
    });
  }

  _resetUI() {
    this._getElements().newsTitle.value = '';
    this._getElements().newsAuthor.value = '';
    this._getElements().newsDescription.value = '';
    this._getElements().newsContent.value = '';
    this._getElements().newsImageFile.value = '';
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  _showDeletePopup(newsId, newsCard) {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    const popupBox = document.createElement('div');
    popupBox.className = 'popup-box';
    popupBox.innerHTML = `
      <div class="d-flex flex-column justify-content-center align-items-center p-3">
        <p style="font-size: 20px">Apakah Anda yakin ingin menghapus berita ini?</p>
        <div class="d-flex flex-row gap-2 justify-content-center">
          <button id="confirmDelete" class="btn btn-danger rounded-0">Hapus</button>
          <button id="cancelDelete" class="btn btn-secondary rounded-0">Batal</button>
        </div>
      </div>
    `;

    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);

    document.getElementById('confirmDelete').addEventListener('click', () => {
      this._deleteNews(newsId, newsCard);
      document.body.removeChild(popupContainer);
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
      document.body.removeChild(popupContainer);
    });
  }

  _showAllDeletePopup() {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    const popupBox = document.createElement('div');
    popupBox.className = 'popup-box';
    popupBox.innerHTML = `
      <div class="d-flex flex-column justify-content-center align-items-center p-3">
        <p style="font-size: 20px">Apakah Anda yakin ingin menghapus semua berita?</p>
        <div class="d-flex flex-row gap-2 justify-content-center">
          <button id="confirmDelete" class="btn btn-danger rounded-0">Ya</button>
          <button id="cancelDelete" class="btn btn-secondary rounded-0">Batal</button>
        </div>
      </div>
    `;

    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);

    document.getElementById('confirmDelete').addEventListener('click', () => {
      this._deleteAllNews();
      document.body.removeChild(popupContainer);
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
      document.body.removeChild(popupContainer);
    });
  }

  _showEditPopUp(newsData) {
    this.editPopupContainer = document.createElement('div');
    this.editPopupContainer.className = 'popup-container';

    const popupBox = document.createElement('div');
    popupBox.className = 'popup-box w-50';
    popupBox.innerHTML = `
      <button class="close-button" id="popupClose">&times;</button>
      <div class="px-2 pb-3 d-flex flex-column">
        <h2 class="pb-4 text-center">Update Berita</h2>
        <form class="d-flex flex-row align-items-start justify-content-between gap-5 px-4 py-2 w-100" method="post">
          <div class="w-100">
            <div class="mb-3">
              <label for="editNewsTitle" class="form-label">Judul Berita</label>
              <input type="text" class="form-control rounded-0" id="editNewsTitle" value="${newsData.title}" required>
            </div>
            <div class="mb-3">
              <label for="editNewsAuthor" class="form-label">Penulis</label>
              <input type="text" class="form-control rounded-0" id="editNewsAuthor" value="${newsData.author}" required>
            </div>
            <div class="mb-3">
              <label for="editNewsDescription" class="form-label">Deskripsi Singkat</label>
              <textarea class="form-control rounded-0" id="editNewsDescription" rows="6" required>${newsData.description}</textarea>
            </div>
          </div>
          <div class="w-100">
            <div class="mb-3">
              <label for="editNewsContent" class="form-label">Konten Berita</label>
              <div id="editNewsContentEditor" style="height: 200px;"></div>
            </div>
            <div class="mb-3">
              <label for="editNewsImageFile" class="form-label">Upload Gambar</label>
              <input type="file" class="form-control rounded-0" id="editNewsImageFile" accept="image/*">
            </div>
          </div>
          <p class="text-danger" id="editErrorFormInputTxt" style="display: none; font-weight: 600;"></p>
        </form>
        <button type="submit" class="d-flex flex-row align-items-center justify-content-center gap-1 mx-4 py-1 mt-2 btn-update" id="btnUpdateNews">
          <i class="lni lni-check-circle-1"></i>
          <span class="text-center">Simpan</span>
        </button>
      </div>`;

    this.editPopupContainer.appendChild(popupBox);
    document.body.appendChild(this.editPopupContainer);

    // Inisialisasi Quill Editor
    const quillEditor = new Quill('#editNewsContentEditor', {
      theme: 'snow',
    });
    quillEditor.root.innerHTML = newsData.content;

    document.getElementById('btnUpdateNews').addEventListener('click', async () => {
      const updatedContent = quillEditor.root.innerHTML.trim();
      await this._updateNews(newsData.id, updatedContent);
    });

    document.getElementById('popupClose').addEventListener('click', () => {
      document.body.removeChild(this.editPopupContainer);
      this.editPopupContainer = null;
    });
  }

  _showSuccessEditPopUp() {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    const popupBox = document.createElement('div');
    popupBox.className = 'popup-box';
    popupBox.innerHTML = `
      <div class="d-flex flex-column justify-content-center align-items-center p-3">
        <p style="font-size: 20px">Data Berhasil Diubah!</p>
        <div class="d-flex flex-row gap-2 justify-content-center">
          <button id="succesEdit" class="btn btn-primary rounded-0">OK</button>
        </div>
      </div>
    `;

    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);

    document.getElementById('succesEdit').addEventListener('click', () => {
      document.body.removeChild(popupContainer);
      if (this.editPopupContainer) {
        document.body.removeChild(this.editPopupContainer);
        this.editPopupContainer = null;
      }
      window.location.reload();
    });
  }
}

export default NewsPage;
