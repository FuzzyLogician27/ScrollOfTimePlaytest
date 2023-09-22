
//import fetch from 'node-fetch';
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

    for(let [k, attribute] of Object.entries(systemData.attributes)) {
      attribute.value = attribute.baseval + attribute.ancestryval;
    }

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, attribute] of Object.entries(systemData.attributes)) {
      // Calculate the modifier using d10 rules.
      attribute.mod = Math.round((attribute.value / 10));
      attribute.twohandmod = attribute.mod + Math.floor((attribute.mod / 3));
    }

    this.setupSkills(systemData.combatskills);
    this.setupSkills(systemData.magicskills);
    this.setupSkills(systemData.generalskills);
    this.setupSkills(systemData.specialistskills);

    const attrData = actorData.system.attributes;

    this.setConsumableAttributes([attrData.str, attrData.dex, attrData.con], actorData.system.consumableattributes.stamina);
    this.setConsumableAttributes([attrData.int, attrData.wis, attrData.awr], actorData.system.consumableattributes.willpower);
    this.setConsumableAttributes([attrData.cha, attrData.per, attrData.ins], actorData.system.consumableattributes.morale);

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

  setAncestryVals(ancestry) {
    let system = this.system;
    const sch = ancestry.system.statchanges;
    let changeArray = [
      sch.str,
      sch.dex,
      sch.con,
      sch.int,
      sch.wis,
      sch.awr,
      sch.cha,
      sch.per,
      sch.ins
    ];
    this.update({"system.attributes.str.ancestryval": changeArray[0]});
    this.update({"system.attributes.dex.ancestryval": changeArray[1]});
    this.update({"system.attributes.con.ancestryval": changeArray[2]});
    this.update({"system.attributes.int.ancestryval": changeArray[3]});
    this.update({"system.attributes.wis.ancestryval": changeArray[4]});
    this.update({"system.attributes.awr.ancestryval": changeArray[5]});
    this.update({"system.attributes.cha.ancestryval": changeArray[6]});
    this.update({"system.attributes.per.ancestryval": changeArray[7]});
    this.update({"system.attributes.ins.ancestryval": changeArray[8]});

    this.update({"system.speed.max": ancestry.system.speed});
    this.update({"system.size": ancestry.system.size});

    this.update({"system.consumableattributes.stamina.ancestryval": ancestry.system.consstatchanges.stamina});
    this.update({"system.consumableattributes.willpower.ancestryval": ancestry.system.consstatchanges.willpower});
    this.update({"system.consumableattributes.morale.ancestryval": ancestry.system.consstatchanges.morale});

    this.update({"system.derivedattributes.dodge.ancestryval": ancestry.system.derivedstatchanges.dodge});
    this.update({"system.derivedattributes.control.ancestryval": ancestry.system.derivedstatchanges.control});
    this.update({"system.derivedattributes.toughness.ancestryval": ancestry.system.derivedstatchanges.toughness});
    this.update({"system.derivedattributes.bulkincrement.ancestryval": ancestry.system.derivedstatchanges.bulkincrement});
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

  setConsumableAttributes(attrData, consumable) {
    //console.log(actorData.system.derivedattributes.bulk.value);
    const bulk = this.system.derivedattributes.bulk.value
    consumable.baseval = Math.round((attrData[0].value + attrData[1].value + attrData[2].value) / 5);
    consumable.max = consumable.baseval + consumable.ancestryval;
    if(consumable.value >= consumable.cap) {
      consumable.value = consumable.cap;
    }
    if(consumable.value < 0) {
      consumable.value = 0;
    }
    if(consumable === this.system.consumableattributes.stamina)
    {
      if(consumable.cap > (consumable.max - (5 * bulk)))
      {
        consumable.cap = consumable.max - (5 * bulk);
      }
      if(consumable.cap - consumable.value > ((consumable.max)/ 5))
      {
        consumable.cap = consumable.value + Math.round(consumable.max / 5);
      }
    } else 
    {
      if(consumable.cap > (consumable.max))
      {
        consumable.cap = consumable.max;
      }
      if(consumable.cap - consumable.value > (consumable.max/ 5))
      {
        consumable.cap = consumable.value + Math.round(consumable.max / 5);
      }
    }

    
    if(consumable.cap >= consumable.max){
      consumable.cap = consumable.max;
    }
  }

  setDerivedAttributes(actorData) {
    const attrData = actorData.system.attributes;
    const derivedData = actorData.system.derivedattributes;

    derivedData.dodge.value = Math.round(((2 * attrData.dex.value) + attrData.awr.value) / 3) - (5 * actorData.system.size) - (5 * derivedData.bulk.value);
    derivedData.dodge.mod = Math.round((derivedData.dodge.value / 10));
    derivedData.control.value = Math.round(((2 * attrData.str.value) + attrData.dex.value) / 3) + (5 * actorData.system.size) + derivedData.control.ancestryval;
    derivedData.control.mod = Math.round((derivedData.control.value / 10));
    derivedData.control.twohandmod = derivedData.control.mod + Math.floor((derivedData.control.mod / 3));
    derivedData.toughness.value = Math.round((attrData.con.value - 50) / 5) + derivedData.toughness.ancestryval + (5 * (actorData.system.size >= 0 ? (Math.ceil(actorData.system.size / 2)) : (Math.floor(actorData.system.size / 2))));
    derivedData.bulkincrement.value = Math.round(attrData.str.value / 5)
    if(actorData.system.size > 0)
    {
      derivedData.bulkincrement.value = derivedData.bulkincrement.value * (1 + actorData.system.size);
    } else if (actorData.system.size < 0)
    {
      derivedData.bulkincrement.value = derivedData.bulkincrement.value / (1 - actorData.system.size);
    }
    derivedData.bulkincrement.value += derivedData.bulkincrement.ancestryval;
    derivedData.bulk.value = Math.floor(derivedData.bulk.carriedweight / derivedData.bulkincrement.value);
    this.update({"system.derivedattributes.bulk.value" : derivedData.bulk.value});
    derivedData.poise.max = Math.round((3 * derivedData.control.value) / 10);
    if(derivedData.poise.value > derivedData.poise.max) {
      derivedData.poise.value = derivedData.poise.max;
    }
    if(derivedData.poise.value < 0) {
      derivedData.poise.value = 0;
    }
  }

  calculateInventory(gear)
  {
    var inventory = gear;
    var weight = 0;
    for(let [key, i] of Object.entries(inventory)) {
      var item = i.system
      weight += (item.weight * item.quantity);
    }
    let system = this.system;
    this.update({"system.derivedattributes.bulk.carriedweight" : weight});
  }

}