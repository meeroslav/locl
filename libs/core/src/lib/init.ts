// Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
import '@angular/localize/init';
import { loadTranslations as _loadTranslations } from '@angular/localize';
import { ParsedTranslationBundle } from './interfaces';
import { _global } from './global';

/**
 * The $locl function is an emulation of $localize but it returns a `LoclString`
 * instead of a real string. A `LoclString` is only evaluated when the template
 * is created, not just when the file containing that template is loaded by the
 * browser (at bootstrap). This means that we can delay initialization of the
 * string values and wait for the translations to be loaded.
 *
 * @param messageParts
 * @param expressions
 */
export const $locl = function(
  messageParts: TemplateStringsArray,
  ...expressions: readonly any[]
) {
  return new LoclString(messageParts, ...expressions);
};

// keep a local backup the of the real $localize
const backUpLocalize = _global.$localize;
// override $localize until everything is loaded
_global.$localize = $locl;

class LoclString extends String {
  private readonly initParams: [TemplateStringsArray, readonly any[]];
  private value: string;
  constructor(
    messageParts: TemplateStringsArray,
    ...expressions: readonly any[]
  ) {
    super();
    this.initParams = [messageParts, expressions];
  }

  toString(): string {
    if (!this.value) {
      this.value = $localize(...this.initParams);
    }
    return this.value;
  }
}

/**
 * Finishes initialization of $localize, loads translations in memory and sets
 * the `LOCALE_ID` value.
 * Use this **only** if you're not using any of the two functions
 * `getTranslations` or `fetchTranslations`.
 */
export function loadTranslations(
  parsedTranslationBundle: ParsedTranslationBundle
) {
  // Restore $localize
  _global.$localize = backUpLocalize;
  _loadTranslations(parsedTranslationBundle.translations);
  _global.$localize.locale = parsedTranslationBundle.locale;
}
