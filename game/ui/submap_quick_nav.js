/**
 * 小地图底栏四键：背包/武学/任务跳子页后「离开」应回到当前小地图；
 * 角色面板在 map.html 内实现，从小地图打开时仍经 map.html，关闭角色后回到小地图。
 */
(function () {
  var RETURN_HREF_KEY = 'game_ui_return_href';
  var MAP_RESTORE_VIEW_KEY = 'game_map_restore_view';

  function currentHtmlName() {
    try {
      var p = window.location.pathname || '';
      var i = p.lastIndexOf('/');
      return (i >= 0 ? p.slice(i + 1) : p) || '';
    } catch (e) {
      return '';
    }
  }

  function rememberReturnContextForQuickNav() {
    try {
      var base = currentHtmlName();
      if (/^(qingstone_map|forest_map|zhengyang_map|heifeng_dungeon)\.html$/i.test(base)) {
        sessionStorage.setItem(RETURN_HREF_KEY, base);
        sessionStorage.removeItem(MAP_RESTORE_VIEW_KEY);
        return;
      }
      var zy = document.getElementById('zhengyangMap');
      if (zy) {
        var disp = window.getComputedStyle(zy).display;
        if (disp !== 'none') {
          sessionStorage.setItem(RETURN_HREF_KEY, 'map.html');
          sessionStorage.setItem(MAP_RESTORE_VIEW_KEY, 'zhengyang');
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
    window.location.href = 'task.html';
  }

  window.submapOpenCharacter = openCharacterFromSubmap;
  window.submapOpenInventory = openInventory;
  window.submapOpenMartialArts = openMartialArts;
  window.submapOpenTask = openTask;
})();
