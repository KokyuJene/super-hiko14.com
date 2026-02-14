// Theme management directly as early as possible to avoid flash
(function() {
  let theme = 'light';
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (_) {
    theme = 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-animate');

  // Theme management initialize buttons
  initTheme();
  
  // Scroll to top functionality
  initScrollToTop();

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -15% 0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // 他の要素よりも早く表示させるための遅延解消（オプション）
      }
    });
  }, observerOptions);

  document.querySelectorAll('.box').forEach(el => {
    observer.observe(el);
  });

  // 初回チェック: ページ読み込み時にすでに表示範囲内にある要素を即座に表示
  // 少し遅らせることで、js-animateクラス付与直後の状態からアニメーションを開始させる
  setTimeout(() => {
    document.querySelectorAll('.box').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-visible');
      }
    });
  }, 100);

  // Blog page functionality
  if (document.body.classList.contains('blog-page')) {
    initBlogPage();
  }
});

function initTheme() {
  // Theme toggle button
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('theme', newTheme);
      } catch (_) {
      }
    });
  }
}

function initScrollToTop() {
  const scrollBtn = document.querySelector('.scroll-to-top');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

function initBlogPage() {
  const blogList = document.getElementById('blog-list');
  const noResults = document.getElementById('no-results');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sortButtons = document.querySelectorAll('.sort-btn');

  let blogPosts = [];
  let currentFilter = 'all';
  let currentSort = 'desc';
  let searchQuery = '';

  // URLパラメータからカテゴリを取得
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    currentFilter = categoryParam;
    updateFilterButtons(currentFilter);
  }

  // JSONデータを取得
  fetch('./posts.json')
    .then(response => response.json())
    .then(data => {
      blogPosts = data;
      renderBlogPosts();
    })
    .catch(error => {
      console.error('Error loading blog posts:', error);
      blogList.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
    });

  function updateFilterButtons(filter) {
    filterButtons.forEach(btn => {
      if (btn.dataset.category === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateCategoryUrl(category) {
    const url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({}, '', url);
  }

  function renderBlogPosts() {
    let filteredPosts = [...blogPosts];

    // カテゴリフィルター
    if (currentFilter !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }

    // 検索フィルター
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 並び替え
    filteredPosts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return currentSort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // 表示
    if (filteredPosts.length === 0) {
      blogList.innerHTML = '';
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
      blogList.innerHTML = filteredPosts.map(post => {
        const displayDate = post.date ? post.date.replace(/-/g, '.') : '';
        return `
        <a href="${post.url}" class="blog-item">
          <div class="blog-item-header">
            <h3 class="blog-item-title">${post.title}</h3>
            <span class="blog-item-category">${post.category === 'diary' ? 'Diary' : 'Tech'}</span>
          </div>
          <div class="blog-item-date">${displayDate}</div>
          <p class="blog-item-excerpt">${post.excerpt}</p>
        </a>
      `}).join('');
    }
  }

  // イベントリスナー
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      currentFilter = category;
      updateFilterButtons(category);
      updateCategoryUrl(category);
      renderBlogPosts();
    });
  });

  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sortButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      renderBlogPosts();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderBlogPosts();
  });
}