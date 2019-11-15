function getToken() {
  return localStorage.getItem('token');
}

async function getUserByToken(token) {
  try {
    const res = await axios.get('https://api.marktube.tv/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log('getUserByToken error', error);
    return null;
  }
}

async function logout() {
  const token = getToken();
  if (token === null) {
    location.assign('/login');
    return;
  }
  try {
    await axios.delete('https://api.marktube.tv/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log('logout error', error);
  } finally {
    localStorage.clear();
    location.assign('/login');
  }
}

async function getBooks(token) {
  try {
    const res = await axios.get('https://api.marktube.tv/v1/book', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log('getBooks error', error);
    return null;
  }
}

async function deleteBook(bookId) {
  const token = getToken();
  if (token === null) {
    location.assign('/login');
    return;
  }
  await axios.delete(`https://api.marktube.tv/v1/book/${bookId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return;
}

function bindLogoutButton() {
  const btnLogout = document.querySelector('#btn_logout');
  btnLogout.addEventListener('click', logout);
}

function render(books) {
  const listElement = document.querySelector('#list');
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const bookElement = document.createElement('div');
    bookElement.classList.value = 'col-md-4';
    bookElement.innerHTML = `
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <p class="card-text">${book.title === '' ? '제목 없음' : book.title}</p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <a href="/book?id=${book.bookId}">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
              >
                View
              </button>
            </a>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary btn-delete"
              data-book-id="${book.bookId}"
            >
              Delete
            </button>
          </div>
          <small class="text-muted">${new Date(
            book.createdAt,
          ).toLocaleString()}</small>
        </div>
      </div>
    </div>
    `;
    listElement.append(bookElement);
  }
  document.querySelectorAll('.btn-delete').forEach(element => {
    element.addEventListener('click', async event => {
      const bookId = event.target.dataset.bookId;
      try {
        await deleteBook(bookId);
        location.reload();
      } catch (error) {
        console.log(error);
      }
    });
  });
}

async function main() {
  // 버튼에 이벤트 연결
  bindLogoutButton();

  // 토큰 체크
  const token = getToken();
  if (token === null) {
    location.assign('/login');
    return;
  }

  // 토큰으로 서버에서 나의 정보 받아오기
  const user = await getUserByToken(token);
  if (user === null) {
    localStorage.clear();
    location.assign('/login');
    return;
  }

  // 나의 책을 서버에서 받아오기
  const books = await getBooks(token);
  if (books === null) {
    return;
  }

  // 받아온 책을 그리기
  render(books);
}

document.addEventListener('DOMContentLoaded', main);
