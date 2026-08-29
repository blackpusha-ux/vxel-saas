// =====================================================
// VXEL - CONNEXION + CREDITS + ACHAT (vexel.js)
// =====================================================
let currentUser = null;

function showLoggedIn() {
  $('userEmail').innerText = currentUser;
  $('loginForm').classList.add('hidden');
  $('creditDisplay').classList.remove('hidden');
}
function showLoggedOut() {
  $('loginForm').classList.remove('hidden');
  $('creditDisplay').classList.add('hidden');
}

async function loginOrRegister() {
  const email = $('emailInput').value.trim().toLowerCase();
  if (!email || !email.includes('@')) { showToast('Entre un email valide', 'error'); return; }
  try {
    let res = await fetch('/api/credits/' + encodeURIComponent(email));
    if (res.ok) {
      const data = await res.json();
      currentUser = email;
      $('creditCount').innerText = data.credits;
      showLoggedIn();
      localStorage.setItem('vexel_user', email);
      showToast('Bon retour !', 'success');
      return;
    }
    res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = email;
      $('creditCount').innerText = data.credits;
      showLoggedIn();
      localStorage.setItem('vexel_user', email);
      showToast('Compte créé ! 10 crédits offerts', 'success');
    } else {
      showToast(data.error, 'error');
    }
  } catch (e) {
    showToast('Serveur injoignable', 'error');
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('vexel_user');
  showLoggedOut();
}

$('loginBtn').addEventListener('click', loginOrRegister);
$('emailInput').addEventListener('keydown', e => { if (e.key === 'Enter') loginOrRegister(); });
$('logoutBtn').addEventListener('click', logout);

if (localStorage.getItem('vexel_user')) {
  $('emailInput').value = localStorage.getItem('vexel_user');
  loginOrRegister();
}

async function consumeCreditBeforeDownload() {
  if (!currentUser) { showToast('Connecte-toi d\'abord !', 'error'); return false; }
  try {
    const res = await fetch('/api/consume-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      $('creditCount').innerText = data.creditsRemaining;
      showToast('1 crédit utilisé', 'success');
      return true;
    }
    showToast(data.error || 'Crédits insuffisants', 'error');
    return false;
  } catch (e) {
    showToast('Erreur serveur', 'error');
    return false;
  }
}

// =====================================================
// ACHAT DE CREDITS (mode TEST)
// =====================================================
$('buyBtn').addEventListener('click', () => {
  $('packModal').classList.remove('hidden');
});
$('closePackModal').addEventListener('click', () => {
  $('packModal').classList.add('hidden');
});

async function buyPack(amount) {
  if (!currentUser) { showToast('Connecte-toi d\'abord !', 'error'); return; }
  try {
    const res = await fetch('/api/add-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser, amount: amount })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      $('creditCount').innerText = data.credits;
      $('packModal').classList.add('hidden');
      showToast(amount + ' crédits ajoutés !', 'success');
    } else {
      showToast(data.error || 'Erreur', 'error');
    }
  } catch (e) {
    showToast('Erreur serveur', 'error');
  }
}