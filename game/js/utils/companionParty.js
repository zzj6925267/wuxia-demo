/**
 * 可出战队友（charId 2 · 叶轻绾）入队前后 — 各 UI 显隐与存档名统一
 */
const CompanionParty = {
  COMPANION_CHAR_ID: 2,
  COMPANION_DISPLAY_NAME: '叶轻绾',
  LEGACY_NAMES: ['苏瑶'],

  isJoined() {
    try {
      const raw = localStorage.getItem('playerState');
      if (!raw) return false;
      return !!JSON.parse(raw).companionJoined;
    } catch (e) {
      return false;
    }
  },

  isCompanionCharId(charId) {
    return Number(charId) === this.COMPANION_CHAR_ID;
  },

  normalizeCharacterEntry(char) {
    if (!char || !this.isCompanionCharId(char.id)) return char;
    if (!char.name || this.LEGACY_NAMES.indexOf(char.name) >= 0) {
      char.name = this.COMPANION_DISPLAY_NAME;
    }
    if (!char.faction || char.faction === '正阳派' || char.faction === '正阳派内门弟子') {
      char.faction = '浣花剑阁';
    }
    if (char.description && String(char.description).indexOf('正阳派内门') >= 0) {
      char.description = '浣花剑阁外门弟子，奇遇《陌路相逢》入队后可同行。';
    }
    char.icon = char.icon || '🌸';
    return char;
  },

  normalizeAllCharacters(chars) {
    if (!Array.isArray(chars)) return chars;
    chars.forEach((c) => this.normalizeCharacterEntry(c));
    return chars;
  },

  filterCharacterArray(chars) {
    if (!Array.isArray(chars)) return [];
    this.normalizeAllCharacters(chars);
    if (this.isJoined()) return chars;
    return chars.filter((c) => !this.isCompanionCharId(c && c.id));
  },

  filterMartialRoster(martialCharacters) {
    if (!Array.isArray(martialCharacters)) return [];
    if (this.isJoined()) return martialCharacters;
    return martialCharacters.filter((c) => !this.isCompanionCharId(c && c.id));
  },

  canSelectCharacterId(charId) {
    if (!this.isCompanionCharId(charId)) return true;
    return this.isJoined();
  },

  /** 角色面板 .char-item 列表下标：0=少侠，1=队友 */
  isPartyListIndexVisible(index) {
    if (Number(index) === 0) return true;
    if (Number(index) === 1) return this.isJoined();
    return true;
  },

  persistNormalizedPlayerCharacters(chars) {
    if (!Array.isArray(chars)) return;
    try {
      const raw = localStorage.getItem('playerCharacters');
      if (!raw) return;
      const prev = JSON.parse(raw);
      const prevC = Array.isArray(prev)
        ? prev.find((c) => this.isCompanionCharId(c && c.id))
        : null;
      const curC = chars.find((c) => this.isCompanionCharId(c && c.id));
      if (!curC || !prevC) return;
      if (this.LEGACY_NAMES.indexOf(prevC.name) >= 0 && curC.name === this.COMPANION_DISPLAY_NAME) {
        localStorage.setItem('playerCharacters', JSON.stringify(chars));
      }
    } catch (e) {
      console.warn('persistNormalizedPlayerCharacters', e);
    }
  }
};

if (typeof window !== 'undefined') {
  window.CompanionParty = CompanionParty;
}
