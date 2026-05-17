/**
 * 小地图底栏四键：背包/武学/任务跳子页后「离开」应回到当前小地图；
 * 角色面板在 map.html 内实现，从小地图打开时仍经 map.html，关闭角色后回到小地图。
 */
(function () {
  var RETURN_HREF_KEY = 'game_ui_return_href';
  var MAP_RESTORE_VIEW_KEY = 'game_map_restore_view';

  /** 各子地图页面对应的站位 localStorage 键（从哪格打开子页回哪格） */
  var SUBMAP_LOC_STORAGE_KEYS = {
    'qingstone_map.html': 'qingstone_map_location',
    'forest_map.html': 'forest_map_location',
    'heifeng_dungeon.html': 'heifeng_dungeon_location'
  };

  function currentHtmlName() {
    try {
      var p = window.location.pathname || '';
      var i = p.lastIndexOf('/');
      return (i >= 0 ? p.slice(i + 1) : p) || '';
    } catch (e) {
      return '';
    }
  }

  function persistSubmapLocationBeforeLeave() {
    try {
      var base = currentHtmlName();
      var key = SUBMAP_LOC_STORAGE_KEYS[base];
      if (!key) return;
      var loc = null;
      if (typeof window.getSubmapLocationForPersist === 'function') {
        loc = window.getSubmapLocationForPersist();
      }
      if (loc) {
        localStorage.setItem(key, String(loc));
      }
    } catch (e) {}
  }

  function rememberReturnContextForQuickNav() {
    try {
      var base = currentHtmlName();
      if (/^(qingstone_map|forest_map|zhengyang_map|heifeng_dungeon)\.html$/i.test(base)) {
        persistSubmapLocationBeforeLeave();
        sessionStorage.setItem(RETURN_HREF_KEY, base);
        sessionStorage.removeItem(MAP_RESTORE_VIEW_KEY);
        if (/zhengyang_map\.html$/i.test(base)) {
          try {
            localStorage.setItem('currentLocation', 'zhengyang_clan');
          } catch (e) {}
        }
        return;
      }
      var zy = document.getElementById('zhengyangMap');
      if (zy) {
        var disp = window.getComputedStyle(zy).display;
        if (disp !== 'none') {
          sessionStorage.setItem(RETURN_HREF_KEY, 'map.html');
          sessionStorage.setItem(MAP_RESTORE_VIEW_KEY, 'zhengyang');
          try {
            localStorage.setItem('currentLocation', 'zhengyang_clan');
            sessionStorage.setItem('world_map_return_location', 'zhengyang_clan');
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function openCharacterFromSubmap() {
    rememberReturnContextForQuickNav();
    try {
      localStorage.setItem('openCharacterOnLoad', '1');
    } catch (e) {}
    window.location.href = 'map.html';
  }

  function openInventory() {
    rememberReturnContextForQuickNav();
    window.location.href = 'inventory.html';
  }

  function openMartialArts() {
    rememberReturnContextForQuickNav();
    window.location.href = 'martialArts.html';
  }

  function openTask() {
    rememberReturnContextForQuickNav();
    var href = 'task.html';
    try {
      var st = JSON.parse(localStorage.getItem('playerState') || '{}');
      if (st.activeTasks && st.activeTasks.adv_companion_01 && !st.companionJoined) {
        href = 'task.html?type=adventure';
      }
    } catch (e) {}
    window.location.href = href;
  }

  window.submapOpenCharacter = openCharacterFromSubmap;
  window.submapOpenInventory = openInventory;
  window.submapOpenMartialArts = openMartialArts;
  window.submapOpenTask = openTask;
})();
