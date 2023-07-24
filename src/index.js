import Notiflix from 'notiflix';
import "../node_modules/notiflix/dist/notiflix-3.2.6.min.css"
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.js-load-more'),
    pagEnd: document.querySelector('.js-pag-end')
};

const gallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250
});


refs.form.addEventListener('submit', onFormSubmit);
let page = 1;
let currentQuery;

async function onFormSubmit(evt) {
    evt.preventDefault();
    page = 1;
    refs.pagEnd.classList.add('hidden');

    refs.loadMore.classList.remove('hidden')
    currentQuery = evt.target[0].value;
    const resp = await fetchImgages(currentQuery);
    if (resp.data.total === 0) {
        refs.loadMore.classList.add('hidden')
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        refs.pagEnd.classList.remove('hidden');
        return;
    }
    refs.gallery.innerHTML = createMarkup(resp.data);
    Notiflix.Notify.success(`Hooray! We found ${resp.data.total} images.`);
    gallery.refresh();
}

refs.loadMore.addEventListener('click', loadMore);

async function loadMore() {
    page += 1;
    const resp = await fetchImgages(currentQuery);
    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(resp.data));
    gallery.refresh();
    if (resp.data.hits.length < 1) {
        refs.loadMore.classList.add('hidden')
        refs.pagEnd.hidden = false;
    }
}

async function fetchImgages(query) {
    const BASE_URL = 'https://pixabay.com/api/';
    const KEY = '38383817-08d467796504eaf729c6ce1f4';
    const OPTIONS = 'image_type=photo&orientation=horizontal&safesearch=true&per_page=40';

    const resp = await axios(`${BASE_URL}?key=${KEY}&q=${query}&page=${page}&${OPTIONS}`);
    return resp;
}

function createMarkup(data) {
    return data.hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
            <a href="${largeImageURL}">
                <div class="photo-card">
                    <img class="card-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item">
                            <b class="info-text">Likes: ${likes}</b>
                        </p>
                        <p class="info-item">
                            <b class="info-text">Views: ${views}</b>
                        </p>
                        <p class="info-item">
                            <b class="info-text">Comments: ${comments}</b>
                        </p>
                        <p class="info-item">
                            <b class="info-text">Downloads: ${downloads}</b>
                        </p>
                    </div>
                </div>
            </a>
        `).join('')
}