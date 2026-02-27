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

  // Site-wide hamburger navigation
  initSiteNav();

  // About page tabs (?tab=overview/details/links)
  initAboutTabs();
  
  // Scroll to top functionality
  initScrollToTop();

  // Birthday section initialization
  initBirthday();

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

  // Diary page functionality
  if (document.body.classList.contains('diary-page')) {
    initDiaryPage();
  }
});

function initAboutTabs() {
  const tabs = document.querySelectorAll('.tab-item');
  const contents = document.querySelectorAll('.tab-content');
  if (!tabs.length || !contents.length || tabs.length !== contents.length) return;

  const tabKeys = ['overview', 'details', 'links'];

  function resolveTabIndex(rawTab) {
    if (!rawTab) return 0;
    const value = String(rawTab).trim().toLowerCase();

    if (/^\d+$/.test(value)) {
      const index = parseInt(value, 10);
      return index >= 0 && index < tabKeys.length ? index : 0;
    }

    const aliases = {
      overview: 0,
      summary: 0,
      gaiyou: 0,
      '概要': 0,
      details: 1,
      detail: 1,
      shosai: 1,
      '詳細': 1,
      links: 2,
      link: 2,
      'リンク': 2
    };

    return aliases[value] ?? 0;
  }

  function applyTab(index, updateUrl) {
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    contents.forEach((content, i) => {
      content.classList.toggle('active', i === index);
    });

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabKeys[index] || tabKeys[0]);
      window.history.replaceState({}, '', url);
    }
  }

  const initialTab = new URLSearchParams(window.location.search).get('tab');
  applyTab(resolveTabIndex(initialTab), false);

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      applyTab(i, true);
    });
  });

  window.switchTab = (index) => {
    const next = Number(index);
    if (Number.isNaN(next) || next < 0 || next >= tabs.length) return;
    applyTab(next, true);
  };
}

function initDiaryPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();
  const monthLabel = `${year}.${month}`;

  document.querySelectorAll('.diary-month-group').forEach(group => {
    const label = group.querySelector('.diary-month-label');
    if (label && label.textContent.trim() === monthLabel) {
      group.querySelectorAll('.diary-entry').forEach(entry => {
        const dateEl = entry.querySelector('.diary-date');
        if (dateEl && parseInt(dateEl.textContent.trim(), 10) === day) {
          entry.classList.add('diary-today');
        }
      });
    }
  });
}

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

// Site-wide hamburger navigation
function initSiteNav() {
  const nav    = document.querySelector('.site-nav');
  const toggle = document.querySelector('.site-nav-toggle');
  const drawer = document.querySelector('.site-nav-drawer');
  if (!toggle || !drawer || !nav) return;

  /* ---------- open / close ---------- */
  function openNav() {
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-nav')) closeNav();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeNav());
  });

  /* ---------- box-tracking position ---------- */
  const boxes = Array.from(document.querySelectorAll('.box'));
  if (!boxes.length) return;

  let lastBoxIdx = -1;
  let rafId = null;
  let transitionTimer = null;

  function findActiveBoxIndex() {
    let idx = 0;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].getBoundingClientRect().top < window.innerHeight) idx = i;
    }
    return idx;
  }

  function applyNavPosition() {
    // スマホは CSS 固定に任せる
    if (window.innerWidth <= 680) {
      nav.style.top = '';
      lastBoxIdx = -1;
      clearTimeout(transitionTimer);
      return;
    }

    const idx  = findActiveBoxIndex();
    const rect = boxes[idx].getBoundingClientRect();
    const minTop = 12;
    const maxTop = window.innerHeight - 64;
    const targetTop = Math.min(maxTop, Math.max(minTop, rect.top - 60));

    if (idx !== lastBoxIdx) {
      nav.style.transition = 'top 0.38s cubic-bezier(0.4, 0, 0.2, 1)';
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => {
        nav.style.transition = 'none';
      }, 420);
      lastBoxIdx = idx;
    }

    nav.style.top = targetTop + 'px';
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      applyNavPosition();
      rafId = null;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    lastBoxIdx = -1;
    applyNavPosition();
  });

  // 初回位置設定（アニメーション不要）
  nav.style.transition = 'none';
  applyNavPosition();
}

// Birthday section initialization
function initBirthday() {
  const birthdaySection = document.querySelector('.birthday-section');
  if (!birthdaySection) return;

  // Get birthday month/day from data attributes (default: 12/31)
  const birthdayMonth = parseInt(birthdaySection.getAttribute('data-birthday-month')) || 12;
  const birthdayDay = parseInt(birthdaySection.getAttribute('data-birthday-day')) || 31;

  const todayDateEl = document.getElementById('today-date');
  const birthdayMessageEl = document.getElementById('birthday-message');
  const daysCounterEl = document.getElementById('days-counter');

  function updateBirthdayInfo() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Format today's date
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const todayFormatted = `${currentYear}年 ${monthNames[today.getMonth()]} ${currentDay}日 (${dayOfWeek[today.getDay()]})`;
    todayDateEl.textContent = todayFormatted;

    // Check if today is the birthday
    const isBirthday = currentMonth === birthdayMonth && currentDay === birthdayDay;

    if (isBirthday) {
      // Today is the birthday!
      birthdayMessageEl.innerHTML = '🎉 <strong>本日は誕生日です！おめでとうございます！</strong> 🎉';
      birthdayMessageEl.style.fontSize = '1.2rem';
      birthdayMessageEl.style.fontWeight = 'bold';
      daysCounterEl.textContent = '今日があなたの特別な日です。最高の1日を過ごしてください！';
    } else {
      // Calculate days until the next birthday
      let nextBirthdayDate = new Date(currentYear, birthdayMonth - 1, birthdayDay);
      
      // If the birthday has already passed this year, calculate for next year
      if (nextBirthdayDate < today) {
        nextBirthdayDate = new Date(currentYear + 1, birthdayMonth - 1, birthdayDay);
      }

      const timeDiff = nextBirthdayDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      const nextBirthdayFormatted = `${nextBirthdayDate.getFullYear()}年 ${monthNames[nextBirthdayDate.getMonth()]} ${nextBirthdayDate.getDate()}日`;
      
      birthdayMessageEl.textContent = `次の誕生日は ${nextBirthdayFormatted} です。`;
      daysCounterEl.textContent = `あと ${daysLeft} 日です。`;
    }
  }

  // Initial update
  updateBirthdayInfo();

  // Update at midnight
  setTimeout(updateBirthdayInfo, (24 - new Date().getHours()) * 60 * 60 * 1000);
}