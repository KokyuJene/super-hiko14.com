// DOM読み込み後に実行
document.addEventListener("DOMContentLoaded", () => {
  // 年の表示
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // カウント取得
  const countElement = document.getElementById('count');
  if (countElement) {
    fetch('https://script.google.com/macros/s/AKfycbydDLtlQTxlvrm2t9eH0jqs01awiKKPn23kOknQ44eF095C2rm1ZjABGZG-2obDKW1T/exec')
      .then(res => res.json())
      .then(data => {
        countElement.innerText = data.count + '';
      })
      .catch(err => {
        countElement.innerText = '取得失敗';
        console.error(err);
      });
  }

  // 隠し画像のスポーン機能
  function spawnHiddenImage() {
    const img = document.createElement('img');
    img.src = 'https://kokyujene.github.io/images/hidden.webp';
    img.className = 'hidden-image';
    img.style.position = 'fixed';
    img.style.zIndex = '9999';
    img.style.cursor = 'pointer';
    img.style.transition = 'all 1s ease';

    // 画面サイズに応じて大きさを調整
    if (window.innerWidth > 1024) { 
      img.style.width = '25px';
      img.style.height = '25px';
    } else {
      img.style.width = '10px';
      img.style.height = '10px';
    }

    // ランダムな左右配置と高さ
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const y = Math.random() * (window.innerHeight - parseInt(img.style.height) - 40) + 20;

    img.style.top = `${y}px`;
    if (side === 'left') {
      img.style.left = '10px';
      img.style.right = '';
    } else {
      img.style.right = '10px';
      img.style.left = '';
    }

    document.body.appendChild(img);

    // クリック時の処理
    img.addEventListener('click', () => {
      const sound = new Audio('https://kokyujene.github.io/sounds/success.ogg');
      sound.play().catch(err => console.log('音声再生エラー:', err));

      // アニメーション
      img.style.transform = 'scale(3) rotate(720deg)';
      img.style.opacity = '0';

      // 削除して10秒後に再出現
      setTimeout(() => {
        img.remove();
        setTimeout(spawnHiddenImage, 10000);
      }, 1000);
    });
  }

  // 最初の1回生成
  spawnHiddenImage();

  // テーマ切り替え
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    const userTheme = localStorage.getItem('theme');

    function applyTheme(isDark) {
      document.documentElement.classList.toggle('dark', isDark);
      themeIcon.src = isDark 
        ? 'https://kokyujene.github.io/images/sun.webp' 
        : 'https://kokyujene.github.io/images/moon.webp';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    if (userTheme === 'dark') {
      applyTheme(true);
    } else {
      applyTheme(false);
    }

    // クリックで切り替え
    themeIcon.addEventListener('click', () => {
      const isNowDark = !document.documentElement.classList.contains('dark');
      applyTheme(isNowDark);
    });
  }

  // モバイルメニュー
  const menuIcon = document.querySelector(".menu-icon");
  const closeIcon = document.querySelector(".close-icon");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuIcon && closeIcon && mobileMenu) {
    function openMenu() {
      mobileMenu.classList.add("active");
      document.body.classList.add("menu-open");
      menuIcon.classList.add("hidden");
      closeIcon.classList.add("show");
      menuIcon.setAttribute("aria-hidden", "true");
      closeIcon.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
      mobileMenu.classList.remove("active");
      document.body.classList.remove("menu-open");
      menuIcon.classList.remove("hidden");
      closeIcon.classList.remove("show");
      menuIcon.setAttribute("aria-hidden", "false");
      closeIcon.setAttribute("aria-hidden", "true");
    }

    menuIcon.addEventListener("click", openMenu);
    closeIcon.addEventListener("click", closeMenu);

    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        closeMenu();
      }
    });
  }

  // ヘッダーの表示/非表示
  const target = document.getElementById('targetElement');
  const header = document.getElementById('mainHeader');

  if (target && header) {
    const headerOptions = {
      rootMargin: '0px',
      threshold: 0
    };

    const headerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          header.classList.add('hidden');
          header.classList.remove('visible');
        } else {
          header.classList.remove('hidden');
          header.classList.add('visible');
        }
      });
    };

    const headerObserver = new IntersectionObserver(headerCallback, headerOptions);
    headerObserver.observe(target);
  }

  // フェードインアニメーション
  const fadeInObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show');
      }
    });
  });

  document.querySelectorAll('.fade-in').forEach(el => fadeInObserver.observe(el));
});

// 戻るボタン機能(グローバルスコープに配置)
function goBack() {
  if (document.referrer.includes("kokyujene.github.io")) {
    history.back();
  } else {
    window.location.href = "https://kokyujene.github.io/";
  }
}