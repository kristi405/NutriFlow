import { SymbolView as ExpoSymbolView } from 'expo-symbols';

/**
 * Drop-in replacement for expo-symbols' SymbolView — import this one instead.
 *
 * expo-symbols draws SF Symbols on iOS but Material Symbols on Android/web, and
 * only from `name={{ ios, android, web }}`. A plain SF name string
 * (`name="plus"`) renders nothing on Android. Many icons in the app are passed
 * that way (often through constants), so this wrapper fills in the Material
 * name from SF_TO_MATERIAL whenever `android` is missing.
 * Adding a new icon: either pass all three names or add the SF name here.
 */
const SF_TO_MATERIAL = {
  'apple.logo': 'login',
  'archivebox.fill': 'inventory_2',
  'arrow.clockwise': 'refresh',
  'arrow.down.right': 'south_east',
  'arrow.triangle.2.circlepath': 'sync',
  'arrow.up.doc': 'upload_file',
  bell: 'notifications',
  'bell.fill': 'notifications',
  'birthday.cake.fill': 'cake',
  bolt: 'bolt',
  'bolt.fill': 'bolt',
  'book.closed': 'menu_book',
  'briefcase.fill': 'work',
  calendar: 'calendar_month',
  'calendar.badge.plus': 'calendar_add_on',
  'camera.fill': 'photo_camera',
  cart: 'shopping_cart',
  'cart.fill': 'shopping_cart',
  'chair.fill': 'chair',
  'chart.bar.fill': 'bar_chart',
  'chart.line.uptrend.xyaxis': 'trending_up',
  'chart.pie.fill': 'pie_chart',
  'chart.xyaxis.line': 'show_chart',
  checkmark: 'check',
  'checkmark.circle.fill': 'check_circle',
  'checkmark.seal.fill': 'verified',
  'chevron.down': 'expand_more',
  'chevron.left': 'chevron_left',
  'chevron.right': 'chevron_right',
  'chevron.up': 'expand_less',
  circle: 'radio_button_unchecked',
  'circle.grid.2x2.fill': 'apps',
  clock: 'schedule',
  'crown.fill': 'workspace_premium',
  'doc.badge.plus': 'note_add',
  'doc.fill': 'description',
  'doc.on.doc': 'content_copy',
  'doc.text': 'description',
  'doc.text.fill': 'description',
  'doc.text.magnifyingglass': 'plagiarism',
  'drop.fill': 'water_drop',
  'exclamationmark.triangle.fill': 'warning',
  'figure.core.training': 'fitness_center',
  'figure.hiking': 'hiking',
  'figure.run': 'directions_run',
  'figure.stand': 'accessibility_new',
  'figure.strengthtraining.traditional': 'fitness_center',
  'figure.walk': 'directions_walk',
  'figure.yoga': 'self_improvement',
  fish: 'set_meal',
  'fish.fill': 'set_meal',
  'flame.fill': 'local_fire_department',
  'fork.knife': 'restaurant_menu',
  'gearshape.fill': 'settings',
  globe: 'public',
  'hand.wave.fill': 'waving_hand',
  heart: 'favorite_border',
  'heart.fill': 'favorite',
  'heart.text.square.fill': 'monitor_heart',
  'house.fill': 'home',
  leaf: 'eco',
  'leaf.fill': 'eco',
  'line.3.horizontal.decrease': 'filter_list',
  list: 'list',
  'list.bullet': 'format_list_bulleted',
  lock: 'lock',
  'lock.fill': 'lock',
  magnifyingglass: 'search',
  mic: 'mic',
  'mic.fill': 'mic',
  'minus.circle': 'remove_circle_outline',
  'moon.fill': 'dark_mode',
  'moon.stars.fill': 'bedtime',
  'music.note': 'music_note',
  'newspaper.fill': 'article',
  pencil: 'edit',
  person: 'person',
  'person.2.fill': 'group',
  'person.crop.circle': 'account_circle',
  'person.fill': 'person',
  'person.text.rectangle.fill': 'badge',
  'photo.fill': 'image',
  plus: 'add',
  'plus.circle.fill': 'add_circle',
  'questionmark.circle.fill': 'help',
  'ruler.fill': 'straighten',
  'scalemass.fill': 'monitor_weight',
  'square.and.arrow.up': 'share',
  'square.and.pencil': 'edit_square',
  'square.grid.2x2.fill': 'grid_view',
  star: 'star',
  'star.fill': 'star',
  'sun.max.fill': 'light_mode',
  'sunrise.fill': 'wb_twilight',
  target: 'track_changes',
  trash: 'delete',
  'trophy.fill': 'emoji_events',
  'wifi.slash': 'wifi_off',
  xmark: 'close',
  'xmark.circle.fill': 'cancel'
};

function withAndroidName(name) {
  if (!name) return name;
  const ios = typeof name === 'string' ? name : name.ios;
  if (typeof name !== 'string' && name.android) return name;
  const material = SF_TO_MATERIAL[ios];
  if (!material && __DEV__) console.warn(`[SymbolView] no Android icon for SF symbol "${ios}" — add it to SF_TO_MATERIAL`);
  return { ios, android: material, web: material };
}

export function SymbolView({ name, ...rest }) {
  return <ExpoSymbolView name={withAndroidName(name)} {...rest} />;
}
