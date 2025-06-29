# Flashcard Master

A feature-rich, browser-based flashcard application for creating, managing, and practicing flashcards with text and image support, spaced repetition, and import/export functionality.

## Features
- **Flashcard Creation**: Add text and images for both front and back, with real-time preview.
- **Deck Management**: Organize cards into decks, edit, delete, and search cards.
- **Practice Modes**:
  - Standard: View front, flip to back, rate recall.
  - Typing: Type answers with instant feedback.
- **Spaced Repetition**: SM-2 inspired algorithm for efficient learning.
- **Import/Export**: Save and restore data as JSON files.
- **Responsive Design**: Works on desktop and mobile.
- **Accessibility**: Keyboard navigation, ARIA labels, and dark mode.
- **Local Storage**: Data persists in the browser using localStorage.

## How to Use
1. **Setup**:
   - Clone the repository: `git clone https://github.com/yourusername/flashcard-app.git`
   - Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).
2. **Create Flashcards**:
   - Navigate to the "Create" tab.
   - Select a deck or create a new one.
   - Enter text, upload images, and add tags.
   - Save to add the card.
3. **Practice**:
   - Go to the "Practice" tab.
   - Choose a deck and mode (Standard or Typing).
   - Rate recall or type answers to track progress.
4. **Manage Decks**:
   - Use the "Manage" tab to view, edit, or delete cards.
   - Search cards by text or tags.
5. **Backup/Restore**:
   - In the "Settings" tab, export data to a JSON file.
   - Import a JSON file to restore data.

## Technical Stack
- **HTML5**: Semantic structure.
- **CSS3**: Responsive design with Flexbox and animations.
- **JavaScript (ES6+)**: Vanilla JS with modular functions.
- **localStorage**: Persistent data storage.
- **Canvas API**: Image compression.

## Future Enhancements
- Add multiple-choice practice mode.
- Integrate cloud storage (e.g., Firebase).
- Support rich text editing with a lightweight editor.
- Add offline support with Service Workers.
- Implement progress charts with Chart.js.

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
MIT License. See `LICENSE` for details.
