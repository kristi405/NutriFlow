import { foodLogStore } from './foodLogStore';
import { labReportStore } from './labReportStore';
import { mealPlanStore } from './mealPlanStore';
import { peopleStore } from './peopleStore';
import { waterStore } from './waterStore';
import { weightLogStore } from './weightLogStore';

// Kept apart from peopleStore itself because those stores import it.
export function purgePersonData(id) {
  foodLogStore.removePersonData(id);
  mealPlanStore.removePersonData(id);
  waterStore.removePersonData(id);
  weightLogStore.removePersonData(id);
}

export async function removeFamilyMember(id) {
  const reportIds = peopleStore.members.find(member => member.id === id)?.profile.labReportIds ?? [];
  // Called first so their reports leave the list before they'd fall back to "mine".
  const deletion = labReportStore.deleteReportsByIds(reportIds);
  purgePersonData(id);
  peopleStore.removeMember(id);
  await deletion;
}
