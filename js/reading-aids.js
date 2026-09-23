/**
 * 阅读辅助 —— reading-aids.js
 * ---------------------------------------------------------------------------
 * 只补充主题缺失的能力，不重复实现主题已有的逻辑：
 *
 *   1. 在非输入状态下按 "/" 打开并聚焦站内搜索；
 *   2. 注入跳转链接（skip link），让键盘用户直达正文；
 *   3. 给侧栏容器补 landmark 语义。
 *
 * 刻意不接管 Escape：主题的 source/js/search/local-search.js 已在搜索层开启时
 * 注册 keydown 监听并负责关闭与清理，重复接管会造成双重处理。
 *
 * 也不重复实现搜索逻辑，而是复用 #search-button 上主题已绑定的 click 处理器。
 */
(function () {
  'use strict';

  var SEARCH_TRIGGER = '#search-button > .search';
  var SEARCH_INPUT = '.local-search-input input';

  /** 当前焦点是否处于可输入上下文，避免抢走正在输入的 "/" */
  function isTypingContext(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  /**
   * 搜索弹层由 display:none 切换，点击后需要等它真正可见才能聚焦，
   * 否则对不可见元素调用 focus() 不会生效。
   */
  function focusSearchInput(attempt) {
    var input = document.querySelector(SEARCH_INPUT);
    if (input && input.offsetParent !== null) {
      input.focus();
      input.select();
      return;
    }
    if (attempt < 30) {
      window.requestAnimationFrame(function () {
        focusSearchInput(attempt + 1);
      });
    }
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== '/') return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTypingContext(document.activeElement)) return;

    var trigger = document.querySelector(SEARCH_TRIGGER);
    if (!trigger) return;

    event.preventDefault();
    trigger.click();
    focusSearchInput(0);
  });

  /**
   * 注入跳转链接。
   * 主题模板无法修改，因此在 body 首位插入，使它成为 Tab 序列的第一个
   * 可聚焦元素；同时给目标容器补 tabindex="-1"，否则跳转后焦点仍留在
   * 链接上，按 Tab 会回到导航开头。
   */
  function injectSkipLink() {
    if (document.querySelector('.skip-link')) return;

    var main = document.querySelector('#content-inner');
    if (!main) return;

    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');

    var link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#' + main.id;
    link.textContent = '跳到正文';
    document.body.insertBefore(link, document.body.firstChild);
  }

  /**
   * 补侧栏 landmark。
   * 主题的侧栏容器是 <div class="aside-content">，不带任何语义角色，
   * 读屏软件无法据此快速定位。模板不可改，因此用 ARIA 补上。
   */
  function markAsideLandmark() {
    var aside = document.querySelector('#aside-content');
    if (aside && !aside.getAttribute('role')) {
      aside.setAttribute('role', 'complementary');
      aside.setAttribute('aria-label', '侧边栏');
    }
  }

  function init() {
    injectSkipLink();
    markAsideLandmark();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
