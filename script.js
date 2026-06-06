// ====================
// DOM Elements
// ====================
const animeTitleInput = document.getElementById('anime-title');
const addButton = document.getElementById('add-button');
const animeList = document.getElementById('anime-list');
const searchInput = document.getElementById('search-input');
const filterAllBtn = document.getElementById('filter-all');
const filterWatchedBtn = document.getElementById('filter-watched');
const filterUnwatchedBtn = document.getElementById('filter-unwatched');
const deleteSelectedBtn = document.getElementById('delete-selected');
const deleteAllBtn = document.getElementById('delete-all');
const markSelectedBtn = document.getElementById('mark-selected');
const unmarkSelectedBtn = document.getElementById('unmark-selected');
const selectAllBtn = document.getElementById('select-all');
const bulkActions = document.querySelector('.bulk-actions');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');



// ====================
// Aplication State
// ====================
let animeItems = JSON.parse(localStorage.getItem('animeList')) || [];
let currentFilter = 'all';
let selectionMode = false;

// ====================
// Initialization
// ====================
updateAnimeList();
updateFilterButtons();
updateProgress();


// ====================
// Storage
// ====================

// Сохранение списка аниме в LocalStorage
function saveAnimeList() {
    localStorage.setItem('animeList', JSON.stringify(animeItems))
};


// ====================
// Anime Operations
// ====================

// Добавление нового аниме
function addAnime() {
    const title = animeTitleInput.value.trim();

    if (title === '') {
        alert('Введите название...')
        return;
    }

    const newAnime = {
        id: Date.now(),
        title: title,
        watched: false
    };

    animeItems.push(newAnime);

    saveAnimeList();
    updateProgress();

    animeTitleInput.value = '';

    const wasFiltered = currentFilter !== 'all' || searchInput.value !== '';

    searchInput.value = '';
    currentFilter = 'all'

    if (wasFiltered) {
        updateFilterButtons();
        updateAnimeList();
    } else {
        const newCard = createAnimeCard(
            newAnime,
            animeItems.length - 1
        );

        animeList.appendChild(newCard);

        updateSelectAllButton();
    }

}


addButton.classList.add('succes-animation');
    
    setTimeout(() => {
        addButton.classList.remove('success-animation');
    }, 300);


// ====================
// Anime Card
// ====================

// Создание карточки
function createAnimeCard(anime, index) {
    const li = document.createElement('li');
    li.dataset.id = anime.id;
    li.style.animationDelay= `${index * 0.05}s`

    const selectCheckbox = document.createElement('input');
    selectCheckbox.type = 'checkbox';
    selectCheckbox.classList.add('anime-checkbox');

    selectCheckbox.addEventListener('change', () => {
        li.classList.toggle('selected', selectCheckbox.checked);

        updateSelectionMode();
    });

    const titleSpan = document.createElement('span');
    titleSpan.textContent = anime.title;
    li.appendChild(titleSpan);

    const buttonContainer = document.createElement('div');

    // Просмотренно/Не просмотренно
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('watch-btn');

    if (anime.watched) {
        toggleBtn.classList.add('watched');
        };

    toggleBtn.textContent = anime.watched
        ? 'Просмотрено'
        : 'Не смотрел';
        
    toggleBtn.onclick = () => {
        const animeItem = animeItems.find(item => item.id === anime.id);
        animeItem.watched = !animeItem.watched;

        saveAnimeList();
        updateProgress();

        if (currentFilter === 'all') {

            toggleBtn.textContent = animeItem.watched
                ? 'Просмотрено'
                : 'Не смотрел';

            toggleBtn.classList.toggle('watched', animeItem.watched);
        } else {
            li.remove();
        }
    };

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn')

    deleteBtn.textContent = '❌';
    deleteBtn.onclick = () => {
        animeItems = animeItems.filter(item => item.id !== anime.id);

        saveAnimeList();
        updateProgress();
        li.remove();
    };

    buttonContainer.appendChild(toggleBtn);
    buttonContainer.appendChild(deleteBtn);

    const leftSide = document.createElement('div');
    leftSide.classList.add('anime-left');

    leftSide.appendChild(selectCheckbox);
    leftSide.appendChild(titleSpan);

    li.appendChild(leftSide);
    li.appendChild(buttonContainer);

    return li
}

// ====================
// UI Updates
// ====================

// Обновление отображения списка
function updateAnimeList() {

    const searchText = searchInput.value.toLowerCase();

    const animeListElement = document.getElementById('anime-list');
    animeList.innerHTML = '';

    const filteredAnime = animeItems.filter((anime) => {
        return anime.title
            .toLowerCase()
            .includes(searchText);
    });

    const finalAnime = filteredAnime.filter((anime) => {

        if (currentFilter === 'watched') {
            return anime.watched;
        }

        if (currentFilter === 'unwatched') {
            return !anime.watched;
        }

        return true;
    });

    finalAnime.forEach((anime, index) => {
        animeList.appendChild(createAnimeCard(anime, index));
    });

    updateSelectAllButton();
    updateProgress();
}

// Обновление состояния кнопок фильтрации
function updateFilterButtons() {

    filterAllBtn.classList.remove('active');
    filterWatchedBtn.classList.remove('active');
    filterUnwatchedBtn.classList.remove('active');

    if (currentFilter === 'all') {
        filterAllBtn.classList.add('active');
    }

    if (currentFilter === 'watched') {
        filterWatchedBtn.classList.add('active');
    }

    if (currentFilter === 'unwatched') {
        filterUnwatchedBtn.classList.add('active');
    }
}

// Возвращение ID выделенных карточек
function getSelectedIds() {
    const checked = document.querySelectorAll(
        '#anime-list input[type="checkbox"]:checked'
    );

    return [...checked].map(checkbox => Number(
        checkbox.closest('li').dataset.id
    ));
}

// Обновляет кнопку "Выбрать все"
function updateSelectAllButton() {
    const checkboxes = document.querySelectorAll(
        '#anime-list input[type="checkbox"]'
    );
    
    const AllChecked = [...checkboxes].every(
        checkbox => checkbox.checked
    );

    selectAllBtn.textContent = AllChecked
    ? 'Снять выделение'   
    : 'Выбрать все';
}

// Управление режимом выделения
function updateSelectionMode() {
    const checked = document.querySelectorAll('#anime-list input[type="checkbox"]:checked');
    selectionMode = checked.length > 0;

    bulkActions.classList.toggle('visible', selectionMode);

    document.body.classList.toggle('selection-mode',selectionMode)

    updateSelectAllButton();
}

// Обновление прогресса просмотра
function updateProgress() {
    const watched = animeItems.filter(anime =>anime.watched).length;

    const total = animeItems.length;

    const percent =
        total === 0
        ? 0
        : Math.round(watched / total * 100);
        
    progressFill.style.width = `${percent}%`
    progressText.textContent = `${watched}/${total} (${percent}%)`

    console.log(percent);
}

// ====================
// EventListener
// ====================

markSelectedBtn.addEventListener('click', () => {
    const selectedIds = getSelectedIds();

    animeItems.forEach(anime => {
        if (selectedIds.includes(anime.id)) {
            anime.watched = true;
        }
    });

    saveAnimeList();
    updateProgress();
    updateAnimeList();
});

unmarkSelectedBtn.addEventListener('click', () => {
    const selectedIds = getSelectedIds();

    animeItems.forEach(anime => {
        if (selectedIds.includes(anime.id)) {
            anime.watched = false;
        }
    });

    saveAnimeList();
    updateProgress();
    updateAnimeList();
});

deleteSelectedBtn.addEventListener('click', () => {
    const selectedIds = getSelectedIds();

    animeItems = animeItems.filter(
        anime => !selectedIds.includes(anime.id)
    );

    saveAnimeList();
    updateProgress();
    updateAnimeList();
});

deleteAllBtn.addEventListener('click', () => {
    if (!confirm('Удалить весь список?')) {
        return;
    }

    animeItems = [];

    saveAnimeList();
    updateProgress();
    updateAnimeList();
});

selectAllBtn.addEventListener('click', () => { 
    const checkboxes = document.querySelectorAll(
        '#anime-list input[type="checkbox"]'
    );
    
    const AllChecked = [...checkboxes].every(
        checkbox => checkbox.checked
    );

    checkboxes.forEach(checkbox => {
        checkbox.checked = !AllChecked;
    });

    updateSelectAllButton();
});

filterAllBtn.addEventListener('click', () => {
    currentFilter = 'all';

    updateFilterButtons();
    updateAnimeList();
});

filterWatchedBtn.addEventListener('click', () => {
    currentFilter = 'watched';

    updateFilterButtons();
    updateAnimeList();
});

filterUnwatchedBtn.addEventListener('click', () => {
    currentFilter = 'unwatched';

    updateFilterButtons();
    updateAnimeList();
});


addButton.addEventListener('click', addAnime);

animeTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addAnime();
    }
});

searchInput.addEventListener('input', () => {
    updateAnimeList();
});



