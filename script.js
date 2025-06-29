import { compressImage, sanitizeInput, showModal, closeModal, generateId, validateFile } from './utils.js';

// Data structure
let data = {
    decks: [
        { id: 'default', name: 'Default Deck', cards: [] }
    ]
};

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem('flashcardData');
    if (stored) {
        data = JSON.parse(stored);
    }
    updateStats();
    updateDeckSelects();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('flashcardData', JSON.stringify(data));
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    showView('homeView');
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('homeBtn').addEventListener('click', () => showView('homeView'));
    document.getElementById('createBtn').addEventListener('click', () => showView('createView'));
    document.getElementById('practiceBtn').addEventListener('click', () => showView('practiceView'));
    document.getElementById('manageBtn').addEventListener('click', () => showView('manageView'));
    document.getElementById('settingsBtn').addEventListener('click', () => showView('settingsView'));

    // Create form
    document.getElementById('createForm').addEventListener('submit', handleCreateSubmit);
    document.getElementById('newDeckBtn').addEventListener('click', createNewDeck);
    document.getElementById('frontImage').addEventListener('change', handleImagePreview);
    document.getElementById('backImage').addEventListener('change', handleImagePreview);
    document.getElementById('frontText').addEventListener('input', updatePreview);
    document.getElementById('backText').addEventListener('input', updatePreview);

    // Practice controls
    document.getElementById('startPractice').addEventListener('click', startPractice);
    document.getElementById('flipCard').addEventListener('click', flipCard);
    document.getElementById('ratingButtons').addEventListener('click', handleRating);
    document.getElementById('submitAnswer').addEventListener('click', handleTypingSubmit);

    // Manage view
    document.getElementById('searchCards').addEventListener('input', updateCardList);
    document.getElementById('manageDeck').addEventListener('change', updateCardList);

    // Settings
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('darkMode').addEventListener('change', toggleDarkMode);
    document.querySelector('.close').addEventListener('click', closeModal);
}

// Show specific view
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    if (viewId === 'manageView') updateCardList();
    if (viewId === 'practiceView') updatePracticeDeckSelect();
}

// Update deck select dropdowns
function updateDeckSelects() {
    const selects = [document.getElementById('deckSelect'), document.getElementById('manageDeck'), document.getElementById('practiceDeck')];
    selects.forEach(select => {
        select.innerHTML = data.decks.map(deck => `<option value="${deck.id}">${sanitizeInput(deck.name)}</option>`).join('');
    });
}

// Update home view stats
function updateStats() {
    const totalDecks = data.decks.length;
    const totalCards = data.decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    const cardsDue = data.decks.reduce((sum, deck) => sum + deck.cards.filter(card => {
        const now = new Date();
        return new Date(card.nextReview) <= now;
    }).length, 0);
    document.getElementById('totalDecks').textContent = totalDecks;
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('cardsDue').textContent = cardsDue;
}

// Create new deck
function createNewDeck() {
    const name = prompt('Enter deck name:');
    if (name && name.trim()) {
        const id = generateId();
        data.decks.push({ id, name: name.trim(), cards: [] });
        saveData();
        updateDeckSelects();
    } else {
        showModal('Deck name cannot be empty.');
    }
}

// Handle image preview
async function handleImagePreview(e) {
    const input = e.target;
    const previewId = input.id === 'frontImage' ? 'previewFrontImage' : 'previewBackImage';
    const previewImg = document.getElementById(previewId);
    if (input.files.length > 0) {
        const file = input.files[0];
        if (validateFile(file)) {
            try {
                const compressed = await compressImage(file);
                previewImg.src = compressed;
            } catch (err) {
                showModal('Error processing image.');
                console.error(err);
            }
        } else {
            input.value = '';
        }
    } else {
        previewImg.src = '';
    }
}

// Update card preview
function updatePreview() {
    document.getElementById('previewFrontText').innerHTML = sanitizeInput(document.getElementById('frontText').value);
    document.getElementById('previewBackText').innerHTML = sanitizeInput(document.getElementById('backText').value);
}

// Handle create form submission
async function handleCreateSubmit(e) {
    e.preventDefault();
    const deckId = document.getElementById('deckSelect').value;
    const frontText = document.getElementById('frontText').value.trim();
    const backText = document.getElementById('backText').value.trim();
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const frontImage = document.getElementById('frontImage').files[0];
    const backImage = document.getElementById('backImage').files[0];

    if (!frontText || !backText) {
        showModal('Front and back text are required.');
        return;
    }

    const card = {
        id: generateId(),
        frontText,
        backText,
        tags,
        frontImage: '',
        backImage: '',
        interval: 1,
        ease: 2.5,
        nextReview: new Date().toISOString(),
        reviews: 0
    };

    try {
        if (frontImage && validateFile(frontImage)) {
            card.frontImage = await compressImage(frontImage);
        }
        if (backImage && validateFile(backImage)) {
            card.backImage = await compressImage(backImage);
        }
        const deck = data.decks.find(d => d.id === deckId);
        deck.cards.push(card);
        saveData();
        document.getElementById('createForm').reset();
        document.getElementById('previewFrontImage').src = '';
        document.getElementById('previewBackImage').src = '';
        updatePreview();
        updateStats();
        showModal('Flashcard created successfully!');
    } catch (err) {
        showModal('Error creating flashcard.');
        console.error(err);
    }
}

// Update card list in manage view
function updateCardList() {
    const search = document.getElementById('searchCards').value.toLowerCase();
    const deckId = document.getElementById('manageDeck').value;
    const cardList = document.getElementById('cardList');
    const deck = data.decks.find(d => d.id === deckId);
    cardList.innerHTML = deck.cards
        .filter(card => card.frontText.toLowerCase().includes(search) || card.backText.toLowerCase().includes(search) || card.tags.some(tag => tag.toLowerCase().includes(search)))
        .map(card => `
            <div class="card-item">
                <p><strong>Front:</strong> ${sanitizeInput(card.frontText)}</p>
                ${card.frontImage ? `<img src="${card.frontImage}" alt="Front Image" style="max-width: 100px;">` : ''}
                <p><strong>Back:</strong> ${sanitizeInput(card.backText)}</p>
                ${card.backImage ? `<img src="${card.backImage}" alt="Back Image" style="max-width: 100px;">` : ''}
                <p><strong>Tags:</strong> ${sanitizeInput(card.tags.join(', '))}</p>
                <button data-id="${card.id}" class="editCard" aria-label="Edit Card">Edit</button>
                <button data-id="${card.id}" class="deleteCard" aria-label="Delete Card">Delete</button>
            </div>
        `).join('');
    cardList.querySelectorAll('.editCard').forEach(btn => btn.addEventListener('click', () => editCard(btn.dataset.id)));
    cardList.querySelectorAll('.deleteCard').forEach(btn => btn.addEventListener('click', () => deleteCard(btn.dataset.id)));
}

// Edit card
function editCard(cardId) {
    const deck = data.decks.find(d => d.cards.some(c => c.id === cardId));
    const card = deck.cards.find(c => c.id === cardId);
    showModal('Editing is not fully implemented in this demo. Please modify the card data directly in the JSON export.');
}

// Delete card
function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        const deck = data.decks.find(d => d.cards.some(c => c.id === cardId));
        deck.cards = deck.cards.filter(c => c.id !== cardId);
        saveData();
        updateCardList();
        updateStats();
        showModal('Card deleted successfully.');
    }
}

// Practice session state
let currentSession = {
    deckId: null,
    mode: 'standard',
    cards: [],
    currentIndex: 0
};

// Update practice deck select
function updatePracticeDeckSelect() {
    const select = document.getElementById('practiceDeck');
    select.innerHTML = data.decks.map(deck => `<option value="${deck.id}">${sanitizeInput(deck.name)}</option>`).join('');
}

// Start practice session
function startPractice() {
    const deckId = document.getElementById('practiceDeck').value;
    const mode = document.getElementById('practiceMode').value;
    const deck = data.decks.find(d => d.id === deckId);
    if (!deck.cards.length) {
        showModal('No cards in this deck.');
        return;
    }
    currentSession = {
        deckId,
        mode,
        cards: [...deck.cards].sort(() => Math.random() - 0.5), // Shuffle
        currentIndex: 0
    };
    document.getElementById('practiceArea').classList.remove('hidden');
    document.getElementById('typingArea').classList.toggle('hidden', mode !== 'typing');
    document.getElementById('ratingButtons').classList.add('hidden');
    document.getElementById('flipCard').classList.toggle('hidden', mode === 'typing');
    showCard();
}

// Show current card
function showCard() {
    const card = currentSession.cards[currentSession.currentIndex];
    if (!card) {
        showModal('Practice session complete!');
        document.getElementById('practiceArea').classList.add('hidden');
        return;
    }
    document.getElementById('cardFrontText').innerHTML = sanitizeInput(card.frontText);
    document.getElementById('cardFrontImage').src = card.frontImage || '';
    document.getElementById('cardBackText').innerHTML = sanitizeInput(card.backText);
    document.getElementById('cardBackImage').src = card.backImage || '';
    document.getElementById('cardBack').classList.add('hidden');
    document.getElementById('flipCard').classList.remove('hidden');
    document.getElementById('practiceProgress').textContent = `${currentSession.currentIndex + 1}/${currentSession.cards.length}`;
    document.getElementById('typingInput').value = '';
}

// Flip card
function flipCard() {
    document.getElementById('cardBack').classList.remove('hidden');
    document.getElementById('flipCard').classList.add('hidden');
    document.getElementById('ratingButtons').classList.remove('hidden');
}

// Handle rating
function handleRating(e) {
    if (!e.target.dataset.rating) return;
    const card = currentSession.cards[currentSession.currentIndex];
    const rating = e.target.dataset.rating;
    updateSRS(card, rating);
    currentSession.currentIndex++;
    showCard();
}

// Update Spaced Repetition System
function updateSRS(card, rating) {
    const now = new Date();
    let { interval, ease, reviews } = card;
    if (rating === 'again') {
        interval = 1;
        ease = Math.max(1.3, ease - 0.3);
    } else if (rating === 'hard') {
        interval = Math.max(1, interval * 0.5);
        ease = Math.max(1.3, ease - 0.15);
    } else if (rating === 'good') {
        interval = interval * ease;
        ease = ease;
    } else if (rating === 'easy') {
        interval = interval * ease * 1.3;
        ease = ease + 0.1;
    }
    card.reviews = reviews + 1;
    card.ease = ease;
    card.interval = interval;
    card.nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();
    saveData();
}

// Handle typing mode submission
function handleTypingSubmit() {
    const input = document.getElementById('typingInput').value.trim().toLowerCase();
    const card = currentSession.cards[currentSession.currentIndex];
    const correct = card.backText.toLowerCase().includes(input);
    showModal(correct ? 'Correct!' : `Incorrect. The answer is: ${sanitizeInput(card.backText)}`);
    document.getElementById('cardBack').classList.remove('hidden');
    document.getElementById('ratingButtons').classList.remove('hidden');
}

// Export data
function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import data
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const importedData = JSON.parse(reader.result);
            if (!importedData.decks || !Array.isArray(importedData.decks)) {
                throw new Error('Invalid JSON format');
            }
            data = importedData;
            saveData();
            updateDeckSelects();
            updateStats();
            updateCardList();
            showModal('Data imported successfully!');
        } catch (err) {
            showModal('Error importing data: Invalid file format.');
            console.error(err);
        }
    };
    reader.onerror = () => showModal('Error reading file.');
    reader.readAsText(file);
}

// Toggle dark mode
function toggleDarkMode(e) {
    document.body.classList.toggle('dark-mode', e.target.checked);
    localStorage.setItem('darkMode', e.target.checked);
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.getElementById('darkMode').checked = true;
    document.body.classList.add('dark-mode');
}
