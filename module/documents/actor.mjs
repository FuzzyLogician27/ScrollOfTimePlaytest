/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SoTPActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.sotp || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, attribute] of Object.entries(systemData.attributes)) {
      // Calculate the modifier using d10 rules.
      attribute.mod = Math.round((attribute.value / 10));
    }

    this.setupSkills(systemData.combatskills);
    this.setupSkills(systemData.magicskills);
    this.setupSkills(systemData.generalskills);
    this.setupSkills(systemData.specialistskills);

    this.setConsumableAttributes(actorData);

    this.setDerivedAttributes(actorData);

  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.attributes) {
      for (let [k, v] of Object.entries(data.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    if (data.skills) {
      for (let [k, v] of Object.entries(data.skills)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    //if (data.attributes.level) {
    //  data.lvl = data.attributes.level.value ?? 0;
    //}
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  setupSkills(skilltype) {
    for (let [key, skill] of Object.entries(skilltype)) {
      if(skill.rank < 0){
        skill.rank = 0;
      }
      if(skill.rank > 9){
        skill.rank = 9;
      }
      if(skill.rank === 0){
        skill.value = skill.untrainedvalue;
      } else {
        skill.value = skill.rank * 2;
      }
      skill.expval1 = Math.floor(skill.rank / 3);
      skill.expval2 = Math.floor(Math.floor(skill.rank / 3) * (2 / 3));
      skill.expval3 = Math.floor(skill.rank / 9);
    }
  }

  setConsumableAttributes(actorData) {
    const attrData = actorData.system.attributes;
    const consData = actorData.system.consumableattributes;
    consData.stamina.baseval = Math.round((attrData.str.value + attrData.dex.value + attrData.con.value) / 5);
    consData.stamina.max = consData.stamina.baseval + consData.stamina.ancestryval;
    if(consData.stamina.value > consData.stamina.max) {
      consData.stamina.value = consData.stamina.max;
    }
    if(consData.stamina.value < 0) {
      consData.stamina.value = 0;
    }

    consData.willpower.baseval = Math.round((attrData.int.value + attrData.wis.value + attrData.awr.value) / 5);
    consData.willpower.max = consData.willpower.baseval + consData.willpower.ancestryval;
    if(consData.willpower.value > consData.willpower.max) {
      consData.willpower.value = consData.willpower.max;
    }
    if(consData.willpower.value < 0) {
      consData.willpower.value = 0;
    }

    consData.morale.baseval = Math.round((attrData.cha.value + attrData.per.value + attrData.ins.value) / 5);
    consData.morale.max = consData.morale.baseval + consData.morale.ancestryval;
    if(consData.morale.value > consData.morale.max) {
      consData.morale.value = consData.morale.max;
    }
    if(consData.morale.value < 0) {
      consData.morale.value = 0;
    }
  }

  setDerivedAttributes(actorData) {
    const attrData = actorData.system.attributes;
    const derivedData = actorData.system.derivedattributes;

    derivedData.dodge.value = Math.round(((2 * attrData.dex.value) + attrData.awr.value) / 3) + 10 - derivedData.dodge.sizebonus - derivedData.dodge.bulkpenalty;
    derivedData.dodge.mod = Math.round((derivedData.dodge.value / 10));
    derivedData.control.value = Math.round(((2 * attrData.str.value) + attrData.dex.value) / 3) + derivedData.control.sizebonus;
    derivedData.control.mod = Math.round((derivedData.control.value / 10));
    derivedData.toughness.value = Math.round((attrData.con.value - 50) / 5) + derivedData.toughness.ancestryval + derivedData.toughness.sizebonus;
    derivedData.bulkincrement.value = Math.round(attrData.str.value / 5) + derivedData.bulkincrement.ancestryval;
    derivedData.poise.max = Math.round((3 * derivedData.control.value) / 10);
    if(derivedData.poise.value > derivedData.poise.max) {
      derivedData.poise.value = derivedData.poise.max;
    }
    if(derivedData.poise.value < 0) {
      derivedData.poise.value = 0;
    }
  }

}