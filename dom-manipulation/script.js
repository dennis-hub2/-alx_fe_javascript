let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').innerText = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById('quoteDisplay').innerText = `"${quote.text}" - ${quote.category}`;
}

function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value;
  const quoteCategory = document.getElementById('newQuoteCategory').value;
  
  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    showRandomQuote();
  } else {
    alert('Please enter both quote text and category.');
  }
}

function populateCategories() {
  const categories = new Set(quotes.map(quote => quote.category));
  const select = document.getElementById('categoryFilter');
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  let filteredQuotes = quotes;
  if (category !== 'all') {
    filteredQuotes = quotes.filter(quote => quote.category === category);
  }
  document.getElementById('quoteDisplay').innerHTML = filteredQuotes.map(quote => `"${quote.text}" - ${quote.category}`).join('<br>');
}

function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes = importedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes(); // or showRandomQuote if needed
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  showRandomQuote();
});

// Simulate periodic data fetching for server sync
function fetchFromServer() {
  // Simulating server fetch with a mock API or JSONPlaceholder
  // This should be replaced with actual API requests
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
      // Update quotes array with server data
      const serverQuotes = data.map(item => ({ text: item.title, category: 'general' }));
      resolveConflicts(serverQuotes);
    });
}

// Simple conflict resolution: server data takes precedence
function resolveConflicts(serverQuotes) {
  quotes = serverQuotes;
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Simulate periodic data fetching every minute
setInterval(fetchFromServer, 60000);
