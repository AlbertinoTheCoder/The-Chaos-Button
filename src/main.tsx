import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource/barlow-condensed/latin-900.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import './style.css';
import './interaction.css';
import './popups.css';
// Cancel native link/image dragging without interfering with pointer-based toys.
document.getElementById('root')!.addEventListener('dragstart', (event) => {
  if (
    !(event.target instanceof Element) ||
    !event.target.closest('input, textarea, [contenteditable="true"]')
  ) {
    event.preventDefault();
  }
});
// Clear any highlight left over from before this update was applied.
window.getSelection()?.removeAllRanges();
createRoot(document.getElementById('root')!).render(<App />);
