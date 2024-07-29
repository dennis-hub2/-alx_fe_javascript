let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem('selectedCategory', category);
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
    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    showRandomQuote();
    postQuoteToServer(newQuote);
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
  select.value = selectedCategory;
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  selectedCategory = category;
  saveSelectedCategory(category);

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

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    const serverQuotes = data.map(item => ({ text: item.title, category: 'general' }));
    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
    });
    const data = await response.json();
    console.log('Quote posted to server:', data);
  } catch (error) {
    console.error('Error posting quote to server:', error);
  }
}

function resolveConflicts(serverQuotes) {
  const serverQuoteTexts = new Set(serverQuotes.map(q => q.text));
  const localQuoteTexts = new Set(quotes.map(q => q.text));

  const newQuotes = serverQuotes.filter(q => !localQuoteTexts.has(q.text));
  const updatedQuotes = quotes.filter(q => !serverQuoteTexts.has(q.text));

  quotes = [...newQuotes, ...updatedQuotes];
  saveQuotes();
  populateCategories();
  filterQuotes();
  notifyUser('Quotes have been synchronized with the server.');
}

function syncQuotes() {
  fetchQuotesFromServer();
}

function notifyUser(message) {
  const notification = document.createElement('div');
  notification.innerText = message;
  notification.className = 'notification';
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  filterQuotes();
  fetchQuotesFromServer(); // Fetch quotes from server on initial load
});

// Simulate periodic data fetching every minute
setInterval(syncQuotes, 60000);
