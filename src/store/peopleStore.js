import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

/**
 * Extra people tracked from this account (e.g. a partner or child), stored on
 * this device only. The account owner is "me" and is not in `members`; per-
 * person data in the other stores (food log, meal plan, water, weight) is
 * tagged with a `personId`, and an entry without one belongs to me.
 */

/** Whether a stored entry belongs to `personId` (null = me). */
export function belongsTo(item, personId) {
  return (item.personId ?? null) === personId;
}

/** Spread into a new entry to tag it with the person currently being tracked. */
export function personTag() {
  const personId = peopleStore.currentPersonId;
  return personId ? { personId } : {};
}

// The server rejects more than this many family members.
export const MAX_FAMILY_MEMBERS = 20;

class PeopleStore {
  members = [];
  activePersonId = null;
  // Server sync state (see peopleSync.js): whether members have been
  // reconciled with the server at least once, and whether local changes are
  // still waiting to be uploaded.
  hasSyncedMembers = false;
  needsPush = false;
  // One menu for the whole family: everyone eats the dishes planned for the
  // account owner, with portions scaled to each person's calorie target.
  shareMenu = false;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.people', ['members', 'activePersonId', 'hasSyncedMembers', 'needsPush', 'shareMenu']);
  }

  get activeMember() {
    return this.members.find(member => member.id === this.activePersonId) ?? null;
  }

  /** Effective active person: null (me) unless a member that still exists is selected. */
  get currentPersonId() {
    return this.activeMember ? this.activeMember.id : null;
  }

  get canAddMember() {
    return this.members.length < MAX_FAMILY_MEMBERS;
  }

  // Lab reports live on the server under the account owner; which of them
  // belong to a family member is recorded in that member's profile
  // (`labReportIds`, so it syncs with the rest of the profile). A report no
  // member claims is the owner's.
  ownerOfReport(reportId) {
    return this.members.find(member => member.profile.labReportIds?.includes(reportId))?.id ?? null;
  }

  assignReport(reportId, personId) {
    const member = this.members.find(candidate => candidate.id === personId);
    if (!member) return;
    const ids = member.profile.labReportIds ?? [];
    if (!ids.includes(reportId)) this.updateMemberProfile(personId, { labReportIds: [...ids, reportId] });
  }

  unassignReport(reportId) {
    for (const member of this.members) {
      const ids = member.profile.labReportIds;
      if (ids?.includes(reportId)) this.updateMemberProfile(member.id, { labReportIds: ids.filter(id => id !== reportId) });
    }
  }

  setShareMenu(value) {
    this.shareMenu = value;
  }

  replaceMembers(members) {
    this.members = members;
  }

  addMember(profile) {
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.members.push({ id, profile });
    return id;
  }

  updateMemberProfile(id, patch) {
    const member = this.members.find(candidate => candidate.id === id);
    if (member) member.profile = { ...member.profile, ...patch };
  }

  removeMember(id) {
    this.members = this.members.filter(member => member.id !== id);
    if (this.activePersonId === id) this.activePersonId = null;
  }

  setActive(id) {
    this.activePersonId = id !== null && this.members.some(member => member.id === id) ? id : null;
  }
}

export const peopleStore = new PeopleStore();
