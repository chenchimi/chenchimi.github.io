/**
 * 阅读辅助 —— reading-aids.js
 * ---------------------------------------------------------------------------
 * 只补充主题缺失的键盘能力：在非输入状态下按 "/" 打开并聚焦站内搜索。
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
})();
