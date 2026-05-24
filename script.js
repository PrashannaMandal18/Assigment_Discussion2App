// ===== STATE =====
let questions = []; // { id, title, question, votes, responses: [{name, comment, votes}] }
let activeQuestionId = null;
let nextId = 1;

// ===== RENDER HELPERS =====

function renderQuestionsList() {
  const list = document.getElementById('questionsList');
  const search = document.getElementById('searchInput').value.toLowerCase().trim();

  let filtered = questions;
  if (search) {
    filtered = questions.filter(q =>
      q.title.toLowerCase().includes(search) ||
      q.question.toLowerCase().includes(search)
    );
  }

  // Sort by votes descending
  filtered = [...filtered].sort((a, b) => b.votes - a.votes);

  if (filtered.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = filtered.map(q => `
    <div class="question-item ${q.id === activeQuestionId ? 'active' : ''}" onclick="selectQuestion(${q.id})">
      <div class="question-item-header">
        <div class="question-item-title">${escHtml(q.title)}</div>
        <span class="vote-badge">▲ ${q.votes}</span>
      </div>
      <div class="question-item-body">${escHtml(q.question)}</div>
    </div>
  `).join('');
}

function renderRightPane() {
  const pane = document.getElementById('rightPane');

  if (activeQuestionId === null) {
    showNewQuestionForm();
    return;
  }

  const q = questions.find(q => q.id === activeQuestionId);
  if (!q) {
    showNewQuestionForm();
    return;
  }

  const sortedResponses = [...q.responses].sort((a, b) => b.votes - a.votes);

  pane.innerHTML = `
    <div class="section-label">Question</div>
    <div class="question-card">
      <div class="question-card-title">${escHtml(q.title)}</div>
      <div class="question-card-body">${escHtml(q.question)}</div>
    </div>

    <div class="question-actions">
      <div class="vote-controls">
        <button class="btn-vote" onclick="voteQuestion(${q.id}, -1)">▼</button>
        <span class="vote-count">${q.votes}</span>
        <button class="btn-vote" onclick="voteQuestion(${q.id}, 1)">▲</button>
      </div>
      <button class="btn-resolve" onclick="resolveQuestion(${q.id})">Resolve</button>
    </div>

    <div class="responses-section">
      <div class="section-label">Response</div>
      ${sortedResponses.length === 0
        ? '<p class="empty-state">No responses yet.</p>'
        : sortedResponses.map((r, i) => `
          <div class="response-card">
            <div class="response-body">
              <div class="response-name">${escHtml(r.name)}</div>
              <div class="response-comment">${escHtml(r.comment)}</div>
            </div>
            <div class="response-vote">
              <button class="btn-vote" onclick="voteResponse(${q.id}, ${i}, 1)">▲</button>
              <span class="vote-count">${r.votes}</span>
              <button class="btn-vote" onclick="voteResponse(${q.id}, ${i}, -1)">▼</button>
            </div>
          </div>
        `).join('')
      }
    </div>

    <hr>
    <div class="add-response-title">Add Response</div>
    <div id="responseError" class="error-msg"></div>
    <div class="form-group">
      <input type="text" id="responseName" placeholder="Enter Name">
    </div>
    <div class="form-group">
      <textarea id="responseComment" placeholder="Enter Comment"></textarea>
    </div>
    <div class="clearfix">
      <button class="btn-submit" onclick="submitResponse(${q.id})">Submit</button>
    </div>
  `;
}

// ===== ACTIONS =====

function showNewQuestionForm() {
  activeQuestionId = null;
  renderQuestionsList();

  const pane = document.getElementById('rightPane');
  pane.innerHTML = `
    <div class="welcome-view">
      <h2>Welcome to Discussion Portal !</h2>
      <p>Enter a subject and question to get started</p>
      <div id="qFormError" class="error-msg"></div>
      <div class="form-group">
        <input type="text" class="subject-input" id="newSubject" placeholder="Subject">
      </div>
      <div class="form-group">
        <textarea id="newQuestion" placeholder="Question"></textarea>
      </div>
      <div class="clearfix">
        <button class="btn-submit" onclick="submitQuestion()">Submit</button>
      </div>
    </div>
  `;
}

function submitQuestion() {
  const title = document.getElementById('newSubject').value.trim();
  const question = document.getElementById('newQuestion').value.trim();
  const errEl = document.getElementById('qFormError');

  if (!title || !question) {
    errEl.textContent = 'Both Subject and Question are required.';
    return;
  }
  errEl.textContent = '';

  const newQ = { id: nextId++, title, question, votes: 0, responses: [] };
  questions.push(newQ);
  activeQuestionId = newQ.id;
  renderQuestionsList();
  renderRightPane();
}

function selectQuestion(id) {
  activeQuestionId = id;
  renderQuestionsList();
  renderRightPane();
}

function submitResponse(qId) {
  const name = document.getElementById('responseName').value.trim();
  const comment = document.getElementById('responseComment').value.trim();
  const errEl = document.getElementById('responseError');

  if (!name || !comment) {
    errEl.textContent = 'Both Name and Comment are required.';
    return;
  }
  errEl.textContent = '';

  const q = questions.find(q => q.id === qId);
  if (!q) return;

  q.responses.push({ name, comment, votes: 0 });
  renderRightPane();
}

function resolveQuestion(qId) {
  questions = questions.filter(q => q.id !== qId);
  activeQuestionId = null;
  renderQuestionsList();
  showNewQuestionForm();
}

function voteQuestion(qId, delta) {
  const q = questions.find(q => q.id === qId);
  if (!q) return;
  q.votes += delta;
  renderQuestionsList();
  renderRightPane();
}

function voteResponse(qId, rIndex, delta) {
  const q = questions.find(q => q.id === qId);
  if (!q || !q.responses[rIndex]) return;
  q.responses[rIndex].votes += delta;
  renderRightPane();
}

function filterQuestions() {
  renderQuestionsList();
}

// ===== UTILITY =====

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== INIT =====
showNewQuestionForm();
